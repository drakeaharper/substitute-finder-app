use crate::database::models::{Class, CreateClassRequest};
use crate::commands::AppState;
use chrono::Utc;
use uuid::Uuid;
use tauri::State;

#[tauri::command]
pub fn create_class(
    state: State<'_, AppState>,
    request: CreateClassRequest,
) -> Result<Class, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    let class = Class {
        id: Uuid::new_v4().to_string(),
        name: request.name,
        organization_id: request.organization_id,
        subject: request.subject,
        grade_level: request.grade_level,
        room_number: request.room_number,
        description: request.description,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    conn.execute(
        "INSERT INTO classes (id, name, organization_id, subject, grade_level, room_number, description, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        (
            &class.id,
            &class.name,
            &class.organization_id,
            &class.subject,
            &class.grade_level,
            &class.room_number,
            &class.description,
            &class.created_at.to_rfc3339(),
            &class.updated_at.to_rfc3339(),
        ),
    ).map_err(|e| e.to_string())?;

    Ok(class)
}

#[tauri::command]
pub fn get_classes(state: State<'_, AppState>) -> Result<Vec<Class>, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, name, organization_id, subject, grade_level, room_number, description, created_at, updated_at
         FROM classes ORDER BY name"
    ).map_err(|e| e.to_string())?;
    
    let classes = stmt.query_map([], |row| {
        Ok(Class {
            id: row.get(0)?,
            name: row.get(1)?,
            organization_id: row.get(2)?,
            subject: row.get(3)?,
            grade_level: row.get(4)?,
            room_number: row.get(5)?,
            description: row.get(6)?,
            created_at: row.get::<_, String>(7)?.parse().unwrap_or_else(|_| Utc::now()),
            updated_at: row.get::<_, String>(8)?.parse().unwrap_or_else(|_| Utc::now()),
        })
    }).map_err(|e| e.to_string())?;
    
    let mut result = Vec::new();
    for class in classes {
        result.push(class.map_err(|e| e.to_string())?);
    }
    
    Ok(result)
}

#[tauri::command]
pub fn get_classes_by_organization(
    state: State<'_, AppState>,
    organization_id: String,
) -> Result<Vec<Class>, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, name, organization_id, subject, grade_level, room_number, description, created_at, updated_at
         FROM classes WHERE organization_id = ?1 ORDER BY name"
    ).map_err(|e| e.to_string())?;
    
    let classes = stmt.query_map([&organization_id], |row| {
        Ok(Class {
            id: row.get(0)?,
            name: row.get(1)?,
            organization_id: row.get(2)?,
            subject: row.get(3)?,
            grade_level: row.get(4)?,
            room_number: row.get(5)?,
            description: row.get(6)?,
            created_at: row.get::<_, String>(7)?.parse().unwrap_or_else(|_| Utc::now()),
            updated_at: row.get::<_, String>(8)?.parse().unwrap_or_else(|_| Utc::now()),
        })
    }).map_err(|e| e.to_string())?;
    
    let mut result = Vec::new();
    for class in classes {
        result.push(class.map_err(|e| e.to_string())?);
    }
    
    Ok(result)
}

#[tauri::command]
pub fn get_class_by_id(
    state: State<'_, AppState>,
    id: String,
) -> Result<Option<Class>, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, name, organization_id, subject, grade_level, room_number, description, created_at, updated_at
         FROM classes WHERE id = ?1"
    ).map_err(|e| e.to_string())?;
    
    let class = stmt.query_row([&id], |row| {
        Ok(Class {
            id: row.get(0)?,
            name: row.get(1)?,
            organization_id: row.get(2)?,
            subject: row.get(3)?,
            grade_level: row.get(4)?,
            room_number: row.get(5)?,
            description: row.get(6)?,
            created_at: row.get::<_, String>(7)?.parse().unwrap_or_else(|_| Utc::now()),
            updated_at: row.get::<_, String>(8)?.parse().unwrap_or_else(|_| Utc::now()),
        })
    });
    
    match class {
        Ok(cls) => Ok(Some(cls)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn update_class(
    state: State<'_, AppState>,
    id: String,
    request: CreateClassRequest,
) -> Result<Class, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    let updated_at = Utc::now();
    
    conn.execute(
        "UPDATE classes SET name = ?1, organization_id = ?2, subject = ?3, 
         grade_level = ?4, room_number = ?5, description = ?6, updated_at = ?7 WHERE id = ?8",
        (
            &request.name,
            &request.organization_id,
            &request.subject,
            &request.grade_level,
            &request.room_number,
            &request.description,
            &updated_at.to_rfc3339(),
            &id,
        ),
    ).map_err(|e| e.to_string())?;
    
    match get_class_by_id(state, id)? {
        Some(class) => Ok(class),
        None => Err("Class not found".to_string()),
    }
}

#[tauri::command]
pub fn delete_class(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    conn.execute("DELETE FROM classes WHERE id = ?1", [&id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}