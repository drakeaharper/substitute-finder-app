use crate::database::models::User;
use crate::commands::AppState;
use tauri::State;

#[tauri::command]
pub fn login(
    state: State<'_, AppState>,
    username: String,
    password: String,
) -> Result<User, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    // In a real app, you would properly hash and verify the password
    let password_hash = format!("hashed_{}", password);
    
    let mut stmt = conn.prepare(
        "SELECT id, username, password_hash, email, first_name, last_name, role, organization_id, is_active, created_at, updated_at
         FROM users WHERE username = ?1 AND password_hash = ?2 AND is_active = true"
    ).map_err(|e| e.to_string())?;
    
    let user = stmt.query_row([&username, &password_hash], |row| {
        Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            password_hash: row.get(2)?,
            email: row.get(3)?,
            first_name: row.get(4)?,
            last_name: row.get(5)?,
            role: row.get::<_, String>(6)?.parse().unwrap_or(crate::database::models::UserRole::Substitute),
            organization_id: row.get(7)?,
            is_active: row.get(8)?,
            created_at: row.get::<_, String>(9)?.parse().unwrap_or_else(|_| chrono::Utc::now()),
            updated_at: row.get::<_, String>(10)?.parse().unwrap_or_else(|_| chrono::Utc::now()),
        })
    });
    
    match user {
        Ok(user) => Ok(user),
        Err(rusqlite::Error::QueryReturnedNoRows) => Err("Invalid username or password".to_string()),
        Err(e) => Err(e.to_string()),
    }
}