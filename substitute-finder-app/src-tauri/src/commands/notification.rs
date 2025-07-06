use crate::commands::AppState;
use tauri::{State, Emitter, AppHandle};
use uuid::Uuid;
use chrono::Utc;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct NotificationData {
    pub id: String,
    pub title: String,
    pub body: String,
    pub request_id: Option<String>,
    pub user_id: Option<String>,
    pub notification_type: String,
}

#[tauri::command]
pub fn send_notification(
    app: AppHandle,
    title: String,
    body: String,
    request_id: Option<String>,
    user_id: Option<String>,
) -> Result<String, String> {
    let notification_id = Uuid::new_v4().to_string();
    
    let notification_data = NotificationData {
        id: notification_id.clone(),
        title: title.clone(),
        body: body.clone(),
        request_id: request_id.clone(),
        user_id: user_id.clone(),
        notification_type: "desktop".to_string(),
    };

    // Send system notification
    #[cfg(not(target_os = "android"))]
    {
        use tauri::notification::Notification;
        
        let mut notification = Notification::new(&app.config().identifier)
            .title(&title)
            .body(&body);
            
        if let Err(e) = notification.show() {
            eprintln!("Failed to show notification: {}", e);
            return Err(format!("Failed to show notification: {}", e));
        }
    }

    // Emit event to frontend for in-app notifications
    if let Err(e) = app.emit("notification", &notification_data) {
        eprintln!("Failed to emit notification event: {}", e);
    }

    Ok(notification_id)
}

#[tauri::command]
pub fn log_notification(
    state: State<'_, AppState>,
    user_id: String,
    request_id: String,
    notification_type: String,
    status: String,
    error_message: Option<String>,
) -> Result<String, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    let log_id = Uuid::new_v4().to_string();
    let sent_at = Utc::now();
    
    conn.execute(
        "INSERT INTO notifications_log (id, user_id, request_id, notification_type, sent_at, status, error_message)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        (
            &log_id,
            &user_id,
            &request_id,
            &notification_type,
            &sent_at.to_rfc3339(),
            &status,
            &error_message,
        ),
    ).map_err(|e| e.to_string())?;
    
    Ok(log_id)
}

#[tauri::command]
pub fn get_notification_logs(
    state: State<'_, AppState>,
    user_id: Option<String>,
) -> Result<Vec<serde_json::Value>, String> {
    let conn = state.get_connection();
    let conn = conn.lock().map_err(|e| e.to_string())?;
    
    let query = if let Some(uid) = user_id {
        format!(
            "SELECT id, user_id, request_id, notification_type, sent_at, status, error_message 
             FROM notifications_log WHERE user_id = '{}' ORDER BY sent_at DESC",
            uid
        )
    } else {
        "SELECT id, user_id, request_id, notification_type, sent_at, status, error_message 
         FROM notifications_log ORDER BY sent_at DESC".to_string()
    };
    
    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
    
    let logs = stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "user_id": row.get::<_, String>(1)?,
            "request_id": row.get::<_, String>(2)?,
            "notification_type": row.get::<_, String>(3)?,
            "sent_at": row.get::<_, String>(4)?,
            "status": row.get::<_, String>(5)?,
            "error_message": row.get::<_, Option<String>>(6)?,
        }))
    }).map_err(|e| e.to_string())?;
    
    let mut result = Vec::new();
    for log in logs {
        result.push(log.map_err(|e| e.to_string())?);
    }
    
    Ok(result)
}

#[tauri::command]
pub fn notify_substitute_request_created(
    app: AppHandle,
    state: State<'_, AppState>,
    request_id: String,
    class_name: String,
    date_needed: String,
    substitute_user_ids: Vec<String>,
) -> Result<Vec<String>, String> {
    let title = "New Substitute Request";
    let body = format!("Substitute needed for {} on {}", class_name, date_needed);
    
    let mut notification_ids = Vec::new();
    
    for user_id in substitute_user_ids {
        // Send notification
        match send_notification(
            app.clone(),
            title.clone(),
            body.clone(),
            Some(request_id.clone()),
            Some(user_id.clone()),
        ) {
            Ok(notification_id) => {
                notification_ids.push(notification_id.clone());
                
                // Log successful notification
                if let Err(e) = log_notification(
                    state.clone(),
                    user_id,
                    request_id.clone(),
                    "desktop".to_string(),
                    "sent".to_string(),
                    None,
                ) {
                    eprintln!("Failed to log notification: {}", e);
                }
            },
            Err(e) => {
                eprintln!("Failed to send notification to user {}: {}", user_id, e);
                
                // Log failed notification
                if let Err(log_err) = log_notification(
                    state.clone(),
                    user_id,
                    request_id.clone(),
                    "desktop".to_string(),
                    "failed".to_string(),
                    Some(e.clone()),
                ) {
                    eprintln!("Failed to log failed notification: {}", log_err);
                }
            }
        }
    }
    
    Ok(notification_ids)
}

#[tauri::command]
pub fn request_notification_permission(app: AppHandle) -> Result<bool, String> {
    // On desktop platforms, notifications are usually available by default
    // This function can be extended for more complex permission handling
    #[cfg(target_os = "macos")]
    {
        // On macOS, we might need to check notification permissions
        // For now, we'll assume they're available
        Ok(true)
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        Ok(true)
    }
}