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

module.exports=db;