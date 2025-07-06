use crate::database::models::{User, CreateUserRequest, UserRole};
use crate::commands::AppState;
use chrono::Utc;
use uuid::Uuid;
use tauri::State;

#[tauri::command]
pub fn create_user(
    state: State<'_, AppState>,
    request: CreateUserRequest,
) -> Result<User, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    // In a real app, you would hash the password here
    let password_hash = format!("hashed_{}", request.password);
    
    let user = User {
        id: Uuid::new_v4().to_string(),
        username: request.username,
        password_hash,
        email: request.email,
        first_name: request.first_name,
        last_name: request.last_name,
        role: request.role,
        organization_id: request.organization_id,
        is_active: true,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    conn.execute(
        "INSERT INTO users (id, username, password_hash, email, first_name, last_name, role, organization_id, is_active, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        (
            &user.id,
            &user.username,
            &user.password_hash,
            &user.email,
            &user.first_name,
            &user.last_name,
            &user.role.to_string(),
            &user.organization_id,
            &user.is_active,
            &user.created_at.to_rfc3339(),
            &user.updated_at.to_rfc3339(),
        ),
    ).map_err(|e| e.to_string())?;

    Ok(user)
}

#[tauri::command]
pub fn get_users(state: State<'_, AppState>) -> Result<Vec<User>, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, username, password_hash, email, first_name, last_name, role, organization_id, is_active, created_at, updated_at
         FROM users ORDER BY last_name, first_name"
    ).map_err(|e| e.to_string())?;
    
    let users = stmt.query_map([], |row| {
        Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            password_hash: row.get(2)?,
            email: row.get(3)?,
            first_name: row.get(4)?,
            last_name: row.get(5)?,
            role: row.get::<_, String>(6)?.parse().unwrap_or(UserRole::Substitute),
            organization_id: row.get(7)?,
            is_active: row.get(8)?,
            created_at: row.get::<_, String>(9)?.parse().unwrap_or_else(|_| Utc::now()),
            updated_at: row.get::<_, String>(10)?.parse().unwrap_or_else(|_| Utc::now()),
        })
    }).map_err(|e| e.to_string())?;
    
    let mut result = Vec::new();
    for user in users {
        result.push(user.map_err(|e| e.to_string())?);
    }
    
    Ok(result)
}