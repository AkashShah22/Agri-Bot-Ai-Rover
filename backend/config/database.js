const Database=require('better-sqlite3');
const path=require('path');

const dbpath=path.resolve(__dirname,'../data/farm_data.db');
const db=new Database(dbpath);
//here i use wal mode to give fatser response
db.pragma('journal_mode=wal');


// create a table to store sensor observations
db.prepare(`
    CREATE TABLE IF NOT EXISTS observations(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        zone TEXT NOT NULL,
        soil_moisture REAL NOT NULL,
        temperature REAL NOT NULL,
        humidity REAL NOT NULL,
        battery_level REAL NOT NULL,
        prediction TEXT NOT NULL,
        confidence REAL NOT NULL,
        risk_state TEXT NOT NULL,
        advisory TEXT NOT NULL
    )
`).run();

// Create table to store AI disease detections
db.prepare(`
    CREATE TABLE IF NOT EXISTS disease_detections(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        zone TEXT NOT NULL DEFAULT 'A1',
        disease TEXT NOT NULL,
        confidence REAL NOT NULL,
        confidence_percent REAL NOT NULL,
        status TEXT NOT NULL
    )
`).run();

const diseaseColumns = db.prepare('PRAGMA table_info(disease_detections)').all();
const hasZoneColumn = diseaseColumns.some((column) => column.name === 'zone');

if (!hasZoneColumn) {
    db.prepare('ALTER TABLE disease_detections ADD COLUMN zone TEXT NOT NULL DEFAULT "A1"').run();
}

module.exports=db;