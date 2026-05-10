// utils/timezoneUtils.js
// Centralized timezone utilities for the CafeQR app.
// Maps the profile's "UTC+5:30 (India)" format to IANA timezone IDs,
// and provides consistent date/time formatting throughout the app.

/**
 * Map of known timezone labels → IANA timezone IDs.
 * Expand as needed when adding new countries.
 */
const TZ_MAP = {
  'India':                'Asia/Kolkata',
  'UAE':                  'Asia/Dubai',
  'United Arab Emirates': 'Asia/Dubai',
  'Saudi Arabia':         'Asia/Riyadh',
  'Qatar':                'Asia/Qatar',
  'Oman':                 'Asia/Muscat',
  'Kuwait':               'Asia/Kuwait',
  'Bahrain':              'Asia/Bahrain',
  'Singapore':            'Asia/Singapore',
  'Malaysia':             'Asia/Kuala_Lumpur',
  'Thailand':             'Asia/Bangkok',
  'Indonesia':            'Asia/Jakarta',
  'Philippines':          'Asia/Manila',
  'Japan':                'Asia/Tokyo',
  'South Korea':          'Asia/Seoul',
  'China':                'Asia/Shanghai',
  'Hong Kong':            'Asia/Hong_Kong',
  'Australia':            'Australia/Sydney',
  'New Zealand':          'Pacific/Auckland',
  'USA':                  'America/New_York',
  'United States':        'America/New_York',
  'UK':                   'Europe/London',
  'United Kingdom':       'Europe/London',
  'Germany':              'Europe/Berlin',
  'France':               'Europe/Paris',
  'Canada':               'America/Toronto',
  'Brazil':               'America/Sao_Paulo',
  'South Africa':         'Africa/Johannesburg',
  'Kenya':                'Africa/Nairobi',
  'Nigeria':              'Africa/Lagos',
  'Egypt':                'Africa/Cairo',
  'Pakistan':             'Asia/Karachi',
  'Bangladesh':           'Asia/Dhaka',
  'Sri Lanka':            'Asia/Colombo',
  'Nepal':                'Asia/Kathmandu',
};

/**
 * Fixed offset → IANA fallback for offsets without a country match.
 */
const OFFSET_FALLBACK = {
  '+5:30':  'Asia/Kolkata',
  '+4:00':  'Asia/Dubai',
  '+3:00':  'Asia/Riyadh',
  '+8:00':  'Asia/Singapore',
  '+9:00':  'Asia/Tokyo',
  '+7:00':  'Asia/Bangkok',
  '+5:45':  'Asia/Kathmandu',
  '+6:00':  'Asia/Dhaka',
  '+5:00':  'Asia/Karachi',
  '+0:00':  'Europe/London',
  '-5:00':  'America/New_York',
  '-6:00':  'America/Chicago',
  '-7:00':  'America/Denver',
  '-8:00':  'America/Los_Angeles',
  '+1:00':  'Europe/Berlin',
  '+2:00':  'Africa/Cairo',
  '+10:00': 'Australia/Sydney',
  '+12:00': 'Pacific/Auckland',
};

/**
 * Resolves the profile's timezone string to an IANA timezone ID.
 *
 * Accepts formats:
 *  - "UTC+5:30 (India)"
 *  - "India (GMT+5:30)"
 *  - "Asia/Kolkata"   (passthrough)
 *  - "UTC+5:30"
 *  - null/undefined   → falls back to browser timezone
 *
 * @param {string|null} profileTz - The timezone string from AuthContext
 * @returns {string} IANA timezone ID
 */
export function resolveTimezone(profileTz) {
  if (!profileTz) {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; }
  }

  const s = profileTz.trim();

  // Already an IANA ID (contains '/')
  if (s.includes('/') && !s.includes('UTC') && !s.includes('GMT')) return s;

  // Try to extract country name from parenthetical
  const parenMatch = s.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const country = parenMatch[1].trim();
    if (TZ_MAP[country]) return TZ_MAP[country];
  }

  // Try the part before parenthetical as country (e.g. "India (GMT+5:30)")
  const beforeParen = s.split('(')[0].trim();
  if (TZ_MAP[beforeParen]) return TZ_MAP[beforeParen];

  // Try offset fallback
  const offsetMatch = s.match(/([+-]\d+:\d+)/);
  if (offsetMatch) {
    const offset = offsetMatch[1];
    if (OFFSET_FALLBACK[offset]) return OFFSET_FALLBACK[offset];
  }

  // Last resort: browser timezone
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; }
}

/**
 * Formats a date value to a localized string in the profile's timezone.
 *
 * @param {string|Date|number|null} value - ISO string, Date object, or timestamp
 * @param {string|null} profileTz - Timezone string from AuthContext (e.g. "UTC+5:30 (India)")
 * @param {object} [options] - Additional Intl.DateTimeFormat options
 * @param {string} [options.format='datetime'] - 'date', 'time', 'datetime', 'short', 'full'
 * @param {string} [options.locale='en-IN'] - Locale string
 * @returns {string} Formatted date string, or '—' if invalid
 */
export function formatTzDate(value, profileTz, options = {}) {
  if (!value) return '—';

  try {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '—';

    const tz = resolveTimezone(profileTz);
    const locale = options.locale || 'en-IN';
    const format = options.format || 'datetime';

    let dtfOptions = { timeZone: tz };

    switch (format) {
      case 'date':
        dtfOptions = { ...dtfOptions, day: '2-digit', month: 'short', year: 'numeric' };
        break;
      case 'time':
        dtfOptions = { ...dtfOptions, hour: '2-digit', minute: '2-digit', hour12: true };
        break;
      case 'short':
        dtfOptions = { ...dtfOptions, day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true };
        break;
      case 'full':
        dtfOptions = { ...dtfOptions, day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        break;
      case 'datetime':
      default:
        dtfOptions = { ...dtfOptions, day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
        break;
    }

    // Merge any custom overrides
    if (options.day) dtfOptions.day = options.day;
    if (options.month) dtfOptions.month = options.month;
    if (options.year) dtfOptions.year = options.year;
    if (options.hour) dtfOptions.hour = options.hour;
    if (options.minute) dtfOptions.minute = options.minute;
    if (options.second) dtfOptions.second = options.second;
    if (options.hour12 !== undefined) dtfOptions.hour12 = options.hour12;

    return new Intl.DateTimeFormat(locale, dtfOptions).format(date);
  } catch (e) {
    console.warn('formatTzDate error:', e);
    return '—';
  }
}

/**
 * Returns the current date/time as a Date object adjusted to the profile's timezone.
 * Useful for initializing date pickers to "now" in the business timezone.
 *
 * @param {string|null} profileTz - Timezone string from AuthContext
 * @returns {Date}
 */
export function getBusinessNow(profileTz) {
  const tz = resolveTimezone(profileTz);
  try {
    // Get current time in the target timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const get = (type) => (parts.find(p => p.type === type)?.value || '00');
    
    return new Date(
      parseInt(get('year')),
      parseInt(get('month')) - 1,
      parseInt(get('day')),
      parseInt(get('hour')),
      parseInt(get('minute')),
      parseInt(get('second'))
    );
  } catch {
    return new Date();
  }
}

/**
 * Returns a local ISO-like string (YYYY-MM-DDTHH:mm) for the business timezone.
 * Useful for date picker default values.
 *
 * @param {string|null} profileTz
 * @param {Date} [date] - defaults to now
 * @returns {string}
 */
export function getLocalISOString(profileTz, date) {
  const d = date || getBusinessNow(profileTz);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
