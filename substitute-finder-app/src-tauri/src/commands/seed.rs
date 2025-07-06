use crate::database::models::{User, UserRole, Organization};
use crate::commands::AppState;
use chrono::Utc;
use uuid::Uuid;
use tauri::State;

#[tauri::command]
pub fn seed_database(state: State<'_, AppState>) -> Result<String, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    // Check if admin user already exists
    let existing_admin = conn.prepare("SELECT COUNT(*) FROM users WHERE role = 'admin'")
        .and_then(|mut stmt| stmt.query_row([], |row| {
            let count: i64 = row.get(0)?;
            Ok(count)
        }))
        .map_err(|e| e.to_string())?;
    
    if existing_admin > 0 {
        return Ok("Database already seeded".to_string());
    }
    
    // Create default organization
    let org_id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO organizations (id, name, description, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        (
            &org_id,
            "Demo School District",
            "A sample school district for testing",
            &Utc::now().to_rfc3339(),
            &Utc::now().to_rfc3339(),
        ),
    ).map_err(|e| e.to_string())?;
    
    // Create admin user
    let admin_id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO users (id, username, password_hash, email, first_name, last_name, role, organization_id, is_active, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        (
            &admin_id,
            "admin",
            "hashed_admin", // In a real app, this would be properly hashed
            "admin@example.com",
            "System",
            "Administrator",
            "admin",
            &org_id,
            true,
            &Utc::now().to_rfc3339(),
            &Utc::now().to_rfc3339(),
        ),
    ).map_err(|e| e.to_string())?;
    
    // Create sample organization manager
    let manager_id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO users (id, username, password_hash, email, first_name, last_name, role, organization_id, is_active, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        (
            &manager_id,
            "manager",
            "hashed_manager",
            "manager@example.com",
            "School",
            "Manager",
            "org_manager",
            &org_id,
            true,
            &Utc::now().to_rfc3339(),
            &Utc::now().to_rfc3339(),
        ),
    ).map_err(|e| e.to_string())?;
    
    // Create sample substitute teacher
    let sub_id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO users (id, username, password_hash, email, first_name, last_name, role, organization_id, is_active, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        (
            &sub_id,
            "substitute",
            "hashed_substitute",
            "substitute@example.com",
            "Jane",
            "Substitute",
            "substitute",
            &org_id,
            true,
            &Utc::now().to_rfc3339(),
            &Utc::now().to_rfc3339(),
        ),
    ).map_err(|e| e.to_string())?;
    
    // Create sample classes
    let class1_id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO classes (id, name, organization_id, subject, grade_level, room_number, description, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        (
            &class1_id,
            "5th Grade Mathematics",
            &org_id,
            "Mathematics",
            "5th Grade",
            "Room 101",
            "Advanced mathematics for 5th grade students",
            &Utc::now().to_rfc3339(),
            &Utc::now().to_rfc3339(),
        ),
    ).map_err(|e| e.to_string())?;
    
    let class2_id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO classes (id, name, organization_id, subject, grade_level, room_number, description, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        (
            &class2_id,
            "3rd Grade Science",
            &org_id,
            "Science",
            "3rd Grade",
            "Lab B",
            "Hands-on science experiments for 3rd graders",
            &Utc::now().to_rfc3339(),
            &Utc::now().to_rfc3339(),
        ),
    ).map_err(|e| e.to_string())?;
    
    Ok("Database seeded successfully with demo data".to_string())
}