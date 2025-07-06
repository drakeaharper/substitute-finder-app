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
    
    // Create sample substitute requests
    let req1_id = Uuid::new_v4().to_string();
    let tomorrow = chrono::Utc::now() + chrono::Duration::days(1);
    conn.execute(
        "INSERT INTO substitute_requests (id, class_id, requested_by, date_needed, start_time, end_time, reason, special_instructions, status, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        (
            &req1_id,
            &class1_id,
            &manager_id,
            &tomorrow.format("%Y-%m-%d").to_string(),
            "08:30",
            "15:00",
            "Sick Leave",
            "Please follow the lesson plan on the desk. Math worksheets are in the file cabinet.",
            "open",
            &Utc::now().to_rfc3339(),
            &Utc::now().to_rfc3339(),
        ),
    ).map_err(|e| e.to_string())?;
    
    let req2_id = Uuid::new_v4().to_string();
    let next_week = chrono::Utc::now() + chrono::Duration::days(5);
    conn.execute(
        "INSERT INTO substitute_requests (id, class_id, requested_by, date_needed, start_time, end_time, reason, special_instructions, status, assigned_substitute_id, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        (
            &req2_id,
            &class2_id,
            &manager_id,
            &next_week.format("%Y-%m-%d").to_string(),
            "09:00",
            "14:30",
            "Professional Development",
            "Science lab safety rules posted on wall. No experiments scheduled for today.",
            "filled",
            &sub_id,
            &Utc::now().to_rfc3339(),
            &Utc::now().to_rfc3339(),
        ),
    ).map_err(|e| e.to_string())?;
    
    let req3_id = Uuid::new_v4().to_string();
    let yesterday = chrono::Utc::now() - chrono::Duration::days(1);
    conn.execute(
        "INSERT INTO substitute_requests (id, class_id, requested_by, date_needed, start_time, end_time, reason, status, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        (
            &req3_id,
            &class1_id,
            &admin_id,
            &yesterday.format("%Y-%m-%d").to_string(),
            "08:00",
            "12:00",
            "Emergency",
            "cancelled",
            &Utc::now().to_rfc3339(),
            &Utc::now().to_rfc3339(),
        ),
    ).map_err(|e| e.to_string())?;
    
    Ok("Database seeded successfully with demo data".to_string())
}