use crate::database::models::{SubstituteRequest, CreateSubstituteRequestRequest, RequestStatus};
use crate::commands::AppState;
use chrono::Utc;
use uuid::Uuid;
use tauri::State;

#[tauri::command]
pub fn create_substitute_request(
    state: State<'_, AppState>,
    requested_by: String,
    request: CreateSubstituteRequestRequest,
) -> Result<SubstituteRequest, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    let substitute_request = SubstituteRequest {
        id: Uuid::new_v4().to_string(),
        class_id: request.class_id,
        requested_by,
        date_needed: request.date_needed,
        start_time: request.start_time,
        end_time: request.end_time,
        reason: request.reason,
        special_instructions: request.special_instructions,
        status: RequestStatus::Open,
        assigned_substitute_id: None,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    conn.execute(
        "INSERT INTO substitute_requests (id, class_id, requested_by, date_needed, start_time, end_time, reason, special_instructions, status, assigned_substitute_id, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        (
            &substitute_request.id,
            &substitute_request.class_id,
            &substitute_request.requested_by,
            &substitute_request.date_needed,
            &substitute_request.start_time,
            &substitute_request.end_time,
            &substitute_request.reason,
            &substitute_request.special_instructions,
            &substitute_request.status.to_string(),
            &substitute_request.assigned_substitute_id,
            &substitute_request.created_at.to_rfc3339(),
            &substitute_request.updated_at.to_rfc3339(),
        ),
    ).map_err(|e| e.to_string())?;

    Ok(substitute_request)
}

#[tauri::command]
pub fn get_substitute_requests(
    state: State<'_, AppState>,
) -> Result<Vec<SubstituteRequest>, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, class_id, requested_by, date_needed, start_time, end_time, reason, special_instructions, status, assigned_substitute_id, created_at, updated_at
         FROM substitute_requests ORDER BY date_needed, start_time"
    ).map_err(|e| e.to_string())?;
    
    let requests = stmt.query_map([], |row| {
        Ok(SubstituteRequest {
            id: row.get(0)?,
            class_id: row.get(1)?,
            requested_by: row.get(2)?,
            date_needed: row.get(3)?,
            start_time: row.get(4)?,
            end_time: row.get(5)?,
            reason: row.get(6)?,
            special_instructions: row.get(7)?,
            status: row.get::<_, String>(8)?.parse().unwrap_or(RequestStatus::Open),
            assigned_substitute_id: row.get(9)?,
            created_at: row.get::<_, String>(10)?.parse().unwrap_or_else(|_| Utc::now()),
            updated_at: row.get::<_, String>(11)?.parse().unwrap_or_else(|_| Utc::now()),
        })
    }).map_err(|e| e.to_string())?;
    
    let mut result = Vec::new();
    for request in requests {
        result.push(request.map_err(|e| e.to_string())?);
    }
    
    Ok(result)
}

#[tauri::command]
pub fn get_substitute_requests_by_status(
    state: State<'_, AppState>,
    status: String,
) -> Result<Vec<SubstituteRequest>, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, class_id, requested_by, date_needed, start_time, end_time, reason, special_instructions, status, assigned_substitute_id, created_at, updated_at
         FROM substitute_requests WHERE status = ?1 ORDER BY date_needed, start_time"
    ).map_err(|e| e.to_string())?;
    
    let requests = stmt.query_map([&status], |row| {
        Ok(SubstituteRequest {
            id: row.get(0)?,
            class_id: row.get(1)?,
            requested_by: row.get(2)?,
            date_needed: row.get(3)?,
            start_time: row.get(4)?,
            end_time: row.get(5)?,
            reason: row.get(6)?,
            special_instructions: row.get(7)?,
            status: row.get::<_, String>(8)?.parse().unwrap_or(RequestStatus::Open),
            assigned_substitute_id: row.get(9)?,
            created_at: row.get::<_, String>(10)?.parse().unwrap_or_else(|_| Utc::now()),
            updated_at: row.get::<_, String>(11)?.parse().unwrap_or_else(|_| Utc::now()),
        })
    }).map_err(|e| e.to_string())?;
    
    let mut result = Vec::new();
    for request in requests {
        result.push(request.map_err(|e| e.to_string())?);
    }
    
    Ok(result)
}

#[tauri::command]
pub fn update_substitute_request_status(
    state: State<'_, AppState>,
    id: String,
    status: String,
    assigned_substitute_id: Option<String>,
) -> Result<SubstituteRequest, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    let updated_at = Utc::now();
    
    conn.execute(
        "UPDATE substitute_requests SET status = ?1, assigned_substitute_id = ?2, updated_at = ?3 WHERE id = ?4",
        (
            &status,
            &assigned_substitute_id,
            &updated_at.to_rfc3339(),
            &id,
        ),
    ).map_err(|e| e.to_string())?;
    
    match get_substitute_request_by_id(state, id)? {
        Some(request) => Ok(request),
        None => Err("Substitute request not found".to_string()),
    }
}

#[tauri::command]
pub fn get_substitute_request_by_id(
    state: State<'_, AppState>,
    id: String,
) -> Result<Option<SubstituteRequest>, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, class_id, requested_by, date_needed, start_time, end_time, reason, special_instructions, status, assigned_substitute_id, created_at, updated_at
         FROM substitute_requests WHERE id = ?1"
    ).map_err(|e| e.to_string())?;
    
    let request = stmt.query_row([&id], |row| {
        Ok(SubstituteRequest {
            id: row.get(0)?,
            class_id: row.get(1)?,
            requested_by: row.get(2)?,
            date_needed: row.get(3)?,
            start_time: row.get(4)?,
            end_time: row.get(5)?,
            reason: row.get(6)?,
            special_instructions: row.get(7)?,
            status: row.get::<_, String>(8)?.parse().unwrap_or(RequestStatus::Open),
            assigned_substitute_id: row.get(9)?,
            created_at: row.get::<_, String>(10)?.parse().unwrap_or_else(|_| Utc::now()),
            updated_at: row.get::<_, String>(11)?.parse().unwrap_or_else(|_| Utc::now()),
        })
    });
    
    match request {
        Ok(req) => Ok(Some(req)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn delete_substitute_request(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    conn.execute("DELETE FROM substitute_requests WHERE id = ?1", [&id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}