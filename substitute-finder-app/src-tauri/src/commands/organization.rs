use crate::database::models::{Organization, CreateOrganizationRequest};
use crate::commands::AppState;
use chrono::Utc;
use uuid::Uuid;
use tauri::State;

#[tauri::command]
pub fn create_organization(
    state: State<'_, AppState>,
    request: CreateOrganizationRequest,
) -> Result<Organization, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    let organization = Organization {
        id: Uuid::new_v4().to_string(),
        name: request.name,
        parent_organization_id: request.parent_organization_id,
        description: request.description,
        contact_email: request.contact_email,
        contact_phone: request.contact_phone,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    conn.execute(
        "INSERT INTO organizations (id, name, parent_organization_id, description, contact_email, contact_phone, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        (
            &organization.id,
            &organization.name,
            &organization.parent_organization_id,
            &organization.description,
            &organization.contact_email,
            &organization.contact_phone,
            &organization.created_at.to_rfc3339(),
            &organization.updated_at.to_rfc3339(),
        ),
    ).map_err(|e| e.to_string())?;

    Ok(organization)
}

#[tauri::command]
pub fn get_organizations(state: State<'_, AppState>) -> Result<Vec<Organization>, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, name, parent_organization_id, description, contact_email, contact_phone, created_at, updated_at
         FROM organizations ORDER BY name"
    ).map_err(|e| e.to_string())?;
    
    let organizations = stmt.query_map([], |row| {
        Ok(Organization {
            id: row.get(0)?,
            name: row.get(1)?,
            parent_organization_id: row.get(2)?,
            description: row.get(3)?,
            contact_email: row.get(4)?,
            contact_phone: row.get(5)?,
            created_at: row.get::<_, String>(6)?.parse().unwrap_or_else(|_| Utc::now()),
            updated_at: row.get::<_, String>(7)?.parse().unwrap_or_else(|_| Utc::now()),
        })
    }).map_err(|e| e.to_string())?;
    
    let mut result = Vec::new();
    for org in organizations {
        result.push(org.map_err(|e| e.to_string())?);
    }
    
    Ok(result)
}

#[tauri::command]
pub fn get_organization_by_id(
    state: State<'_, AppState>,
    id: String,
) -> Result<Option<Organization>, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, name, parent_organization_id, description, contact_email, contact_phone, created_at, updated_at
         FROM organizations WHERE id = ?1"
    ).map_err(|e| e.to_string())?;
    
    let organization = stmt.query_row([&id], |row| {
        Ok(Organization {
            id: row.get(0)?,
            name: row.get(1)?,
            parent_organization_id: row.get(2)?,
            description: row.get(3)?,
            contact_email: row.get(4)?,
            contact_phone: row.get(5)?,
            created_at: row.get::<_, String>(6)?.parse().unwrap_or_else(|_| Utc::now()),
            updated_at: row.get::<_, String>(7)?.parse().unwrap_or_else(|_| Utc::now()),
        })
    });
    
    match organization {
        Ok(org) => Ok(Some(org)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn update_organization(
    state: State<'_, AppState>,
    id: String,
    request: CreateOrganizationRequest,
) -> Result<Organization, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    let updated_at = Utc::now();
    
    conn.execute(
        "UPDATE organizations SET name = ?1, parent_organization_id = ?2, description = ?3, 
         contact_email = ?4, contact_phone = ?5, updated_at = ?6 WHERE id = ?7",
        (
            &request.name,
            &request.parent_organization_id,
            &request.description,
            &request.contact_email,
            &request.contact_phone,
            &updated_at.to_rfc3339(),
            &id,
        ),
    ).map_err(|e| e.to_string())?;
    
    match get_organization_by_id(state, id)? {
        Some(org) => Ok(org),
        None => Err("Organization not found".to_string()),
    }
}

#[tauri::command]
pub fn delete_organization(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    conn.execute("DELETE FROM organizations WHERE id = ?1", [&id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}