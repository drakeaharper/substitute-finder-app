use rusqlite::{Connection, Result};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

pub type DbConnection = Arc<Mutex<Connection>>;

pub struct DatabaseManager {
    pub connection: DbConnection,
}

impl DatabaseManager {
    pub fn new() -> Result<Self> {
        let db_path = get_database_path();
        
        // Ensure the parent directory exists
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| {
                rusqlite::Error::SqliteFailure(
                    rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_CANTOPEN),
                    Some(format!("Failed to create directory: {}", e)),
                )
            })?;
        }

        let connection = Connection::open(&db_path)?;
        let connection = Arc::new(Mutex::new(connection));
        
        let manager = DatabaseManager { connection };
        manager.initialize_database()?;
        
        Ok(manager)
    }

    pub fn initialize_database(&self) -> Result<()> {
        let conn = self.connection.lock().unwrap();
        conn.execute_batch(include_str!("schema.sql"))?;
        Ok(())
    }

    pub fn get_connection(&self) -> DbConnection {
        self.connection.clone()
    }
}

fn get_database_path() -> PathBuf {
    let mut path = dirs::data_dir().unwrap_or_else(|| {
        std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
    });
    path.push("substitute-finder-app");
    path.push("database.db");
    path
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_database_initialization() {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        
        let connection = Connection::open(&db_path).unwrap();
        connection.execute_batch(include_str!("schema.sql")).unwrap();
        
        // Test that tables were created
        let table_count: i32 = connection
            .prepare("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
            .unwrap()
            .query_row([], |row| row.get(0))
            .unwrap();
        
        assert!(table_count > 0);
    }
}