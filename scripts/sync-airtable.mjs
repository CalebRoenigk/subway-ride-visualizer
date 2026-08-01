#!/usr/bin/env node
// Pulls new rows from Airtable and appends them to public/data/rides.csv.
//
// First run (no scripts/airtable-sync-state.json yet) does a full scan of
// the table and dedupes against the existing CSV content to establish a
// starting cursor, without re-appending anything already there. Every run
// after that does a cheap incremental fetch filtered on Airtable's own
// CREATED_TIME() record metadata, so it only ever asks for what's new.

import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..')
const RIDES_CSV_PATH = path.join(REPO_ROOT, 'public/data/rides.csv')
const STATE_PATH = path.join(__dirname, 'airtable-sync-state.json')

const FIELDS = ['Number', 'Ridden Date', 'Line', 'Car Type']

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

const AIRTABLE_API_KEY = requireEnv('AIRTABLE_API_KEY')
const AIRTABLE_BASE_ID = requireEnv('AIRTABLE_BASE_ID')
const AIRTABLE_TABLE_ID = requireEnv('AIRTABLE_TABLE_ID')

// ---- minimal RFC4180 CSV parse/escape (mirrors src/utils/csv.ts's parseCsv,
// duplicated here in plain JS since this Node script can't import a .ts file) ----

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.length > 1 || row[0] !== '') rows.push(row)
      row = []
    } else {
      field += char
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field)
    if (row.length > 1 || row[0] !== '') rows.push(row)
  }

  return rows
}

function csvEscape(value) {
  const str = String(value ?? '')
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function formatRideRow(fields) {
  return fields.map(csvEscape).join(',')
}

// ---- date parsing/formatting ----

// Matches the CSV's existing format: "7/29/2026 9:26pm" (no space before
// meridiem, no leading zeros). Used only to build dedupe keys from the
// CSV's own text, deliberately without `Date` parsing, so this stays
// independent of whatever timezone this script happens to run in.
const US_DATETIME_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})[,\s]+(\d{1,2}):(\d{2})\s*([ap]m)?$/i

function rideDateKeyFromCsvString(raw) {
  const match = raw.trim().match(US_DATETIME_RE)
  if (!match) return null
  const [, month, day, yearRaw, hourRaw, minute, meridiem] = match
  let year = Number(yearRaw)
  if (year < 100) year += 2000
  let hour = Number(hourRaw)
  if (meridiem) {
    const isPm = meridiem.toLowerCase() === 'pm'
    hour = (hour % 12) + (isPm ? 12 : 0)
  }
  return `${year}-${Number(month)}-${Number(day)}-${hour}-${Number(minute)}`
}

// Converts a UTC instant (as returned by Airtable) into NYC wall-clock
// parts, so both the dedupe key and the CSV's date string stay consistent
// with the existing rows regardless of the field's Airtable display config.
const NY_PARTS_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

function nyPartsFromIso(iso) {
  const date = new Date(iso)
  const parts = Object.fromEntries(
    NY_PARTS_FORMATTER.formatToParts(date).map((p) => [p.type, p.value]),
  )
  const hour12 = Number(parts.hour)
  const isPm = parts.dayPeriod.toUpperCase() === 'PM'
  const hour24 = (hour12 % 12) + (isPm ? 12 : 0)
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour12,
    minute: parts.minute,
    meridiem: isPm ? 'pm' : 'am',
    dateKey: `${parts.year}-${Number(parts.month)}-${Number(parts.day)}-${hour24}-${Number(parts.minute)}`,
  }
}

function formatRiddenDateForCsv(iso) {
  const p = nyPartsFromIso(iso)
  return `${p.month}/${p.day}/${p.year} ${p.hour12}:${p.minute}${p.meridiem}`
}

// ---- Airtable API ----

async function airtableFetchPage({ offset, filterByFormula }) {
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`)
  for (const field of FIELDS) url.searchParams.append('fields[]', field)
  url.searchParams.set('pageSize', '100')
  if (filterByFormula) url.searchParams.set('filterByFormula', filterByFormula)
  if (offset) url.searchParams.set('offset', offset)

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Airtable API error ${res.status}: ${body}`)
  }
  return res.json()
}

async function fetchAllRecords(filterByFormula) {
  const records = []
  let offset
  do {
    const page = await airtableFetchPage({ offset, filterByFormula })
    records.push(...page.records)
    offset = page.offset
  } while (offset)
  return records
}

// ---- state file ----

function loadState() {
  if (!existsSync(STATE_PATH)) return null
  return JSON.parse(readFileSync(STATE_PATH, 'utf8'))
}

function saveState(state) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n', 'utf8')
}

// ---- existing CSV ----

function loadExistingCsvKeys() {
  const text = readFileSync(RIDES_CSV_PATH, 'utf8')
  const rows = parseCsv(text)
  const [headerRow, ...dataRows] = rows
  const normalized = headerRow.map((h) => h.trim().toLowerCase())
  const numberCol = normalized.indexOf('number')
  const dateCol = normalized.indexOf('ridden date')
  if (numberCol === -1 || dateCol === -1) {
    throw new Error('rides.csv header is missing an expected "Number" or "Ridden Date" column.')
  }

  const keys = new Set()
  for (const row of dataRows) {
    const carNumber = row[numberCol]?.trim()
    const dateKey = rideDateKeyFromCsvString(row[dateCol] ?? '')
    if (carNumber && dateKey) keys.add(`${carNumber}|${dateKey}`)
  }
  return keys
}

function appendRowsToCsv(rows) {
  if (rows.length === 0) return
  const existing = readFileSync(RIDES_CSV_PATH)
  const needsLeadingNewline = existing.length > 0 && existing[existing.length - 1] !== 0x0a
  const block = (needsLeadingNewline ? '\n' : '') + rows.join('\n') + '\n'
  appendFileSync(RIDES_CSV_PATH, block, 'utf8')
}

// ---- record -> row mapping ----

function recordToRow(record) {
  const fields = record.fields ?? {}
  const number = fields['Number']
  const riddenDateIso = fields['Ridden Date']
  if (number === undefined || number === null || !riddenDateIso) {
    return { skipped: true }
  }
  const line = fields['Line']
  const carType = fields['Car Type']
  const nyParts = nyPartsFromIso(riddenDateIso)
  const row = formatRideRow([
    String(number),
    formatRiddenDateForCsv(riddenDateIso),
    Array.isArray(line) ? line.join(', ') : String(line ?? ''),
    Array.isArray(carType) ? carType.join(', ') : String(carType ?? ''),
  ])
  return { skipped: false, row, key: `${String(number)}|${nyParts.dateKey}` }
}

// ---- main ----

async function main() {
  const state = loadState()
  const mode = state ? 'incremental' : 'bootstrap'

  const filterByFormula = state
    ? `NOT(IS_BEFORE(CREATED_TIME(),'${state.cursor}'))`
    : undefined

  const records = await fetchAllRecords(filterByFormula)

  const alreadySyncedIds = new Set(state?.recordIdsAtCursor ?? [])
  const existingCsvKeys = mode === 'bootstrap' ? loadExistingCsvKeys() : null

  const newRows = []
  let skippedIncomplete = 0
  let skippedAlreadySynced = 0

  for (const record of records) {
    if (alreadySyncedIds.has(record.id)) {
      skippedAlreadySynced++
      continue
    }
    const { skipped, row, key } = recordToRow(record)
    if (skipped) {
      skippedIncomplete++
      console.warn(`Skipping record ${record.id}: missing Number or Ridden Date.`)
      continue
    }
    if (mode === 'bootstrap' && existingCsvKeys.has(key)) {
      continue
    }
    newRows.push(row)
  }

  appendRowsToCsv(newRows)

  const summary = {
    mode,
    fetched: records.length,
    appended: newRows.length,
    skippedIncomplete,
    skippedAlreadySynced,
  }

  // Only touch the state file when there's something to advance the cursor
  // past. If nothing was fetched, leave it byte-for-byte untouched — the
  // workflow decides whether to commit purely from `git status --porcelain`,
  // so rewriting `lastRunAt` on every run (even true no-ops) would make it
  // commit daily regardless of whether any new rides actually showed up.
  if (records.length > 0) {
    const maxCreatedTime = records.reduce(
      (max, r) => (r.createdTime > max ? r.createdTime : max),
      records[0].createdTime,
    )
    const recordIdsAtCursor = records
      .filter((r) => r.createdTime === maxCreatedTime)
      .map((r) => r.id)

    saveState({
      cursor: maxCreatedTime,
      recordIdsAtCursor,
      lastRunAt: new Date().toISOString(),
      lastRun: summary,
    })

    console.log(
      `${mode === 'bootstrap' ? 'Bootstrap' : 'Incremental'}: fetched ${summary.fetched}, ` +
        `appended ${summary.appended}, skipped ${summary.skippedIncomplete} incomplete, ` +
        `${summary.skippedAlreadySynced} already-synced, cursor -> ${maxCreatedTime}`,
    )
  } else {
    console.log(
      `${mode === 'bootstrap' ? 'Bootstrap' : 'Incremental'}: fetched 0, appended 0 — nothing new, state unchanged.`,
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
