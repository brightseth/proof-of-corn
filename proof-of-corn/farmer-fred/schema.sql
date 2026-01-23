-- Farmer Fred Database Schema
-- D1 (Cloudflare SQLite)

-- Decisions log
CREATE TABLE IF NOT EXISTS decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  action TEXT NOT NULL,
  rationale TEXT,
  principles TEXT, -- JSON array
  autonomous BOOLEAN NOT NULL DEFAULT 1,
  approved BOOLEAN,
  approved_by TEXT,
  approved_at TEXT,
  outcome TEXT,
  region TEXT
);

-- Budget tracking
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  vendor TEXT,
  region TEXT,
  approved_by TEXT,
  receipt_url TEXT
);

-- Contacts (vendors, operators, extension offices)
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  organization TEXT,
  role TEXT,
  email TEXT,
  phone TEXT,
  region TEXT,
  notes TEXT,
  last_contact TEXT,
  status TEXT DEFAULT 'active'
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  due_date TEXT,
  assigned_to TEXT,
  completed_at TEXT,
  region TEXT
);

-- Weather logs
CREATE TABLE IF NOT EXISTS weather_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  region TEXT NOT NULL,
  temperature REAL,
  humidity REAL,
  conditions TEXT,
  soil_temp_estimate REAL,
  planting_viable BOOLEAN,
  frost_risk BOOLEAN,
  recommendation TEXT
);

-- Regions status
CREATE TABLE IF NOT EXISTS regions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'research',
  planting_start TEXT,
  planting_end TEXT,
  harvest_start TEXT,
  harvest_end TEXT,
  lat REAL,
  lon REAL,
  timezone TEXT,
  notes TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Insert default regions
INSERT OR IGNORE INTO regions (name, status, planting_start, planting_end, harvest_start, harvest_end, lat, lon, timezone)
VALUES
  ('Iowa', 'outreach', 'April 11', 'May 18', 'October 1', 'November 15', 41.5868, -93.6250, 'America/Chicago'),
  ('South Texas', 'outreach', 'January 20', 'February 28', 'June 15', 'July 31', 26.2034, -98.2300, 'America/Chicago'),
  ('Argentina', 'research', 'September 15', 'January 15', 'March 1', 'August 31', -31.4201, -64.1888, 'America/Argentina/Cordoba');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_decisions_timestamp ON decisions(timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_weather_region ON weather_logs(region, timestamp);
