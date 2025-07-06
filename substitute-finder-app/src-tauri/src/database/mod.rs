pub mod models;
pub mod connection;

use rusqlite::{Connection, Result};
use std::path::Path;

pub struct Database {
    pub connection: Connection,
}

impl Database {
    pub fn new(db_path: &Path) -> Result<Self> {
        let connection = Connection::open(db_path)?;
        let db = Database { connection };
        db.initialize_schema()?;
        Ok(db)
    }

    pub fn initialize_schema(&self) -> Result<()> {
        self.connection.execute_batch(include_str!("schema.sql"))?;
        Ok(())
    }
}