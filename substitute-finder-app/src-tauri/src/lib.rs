mod database;
mod commands;

use database::connection::DatabaseManager;
use std::sync::Arc;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db_manager = DatabaseManager::new().expect("Failed to initialize database");
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(Arc::new(db_manager))
        .invoke_handler(tauri::generate_handler![
            greet,
            // Organization commands
            commands::organization::create_organization,
            commands::organization::get_organizations,
            commands::organization::get_organization_by_id,
            commands::organization::update_organization,
            commands::organization::delete_organization,
            // Class commands
            commands::class::create_class,
            commands::class::get_classes,
            commands::class::get_classes_by_organization,
            commands::class::get_class_by_id,
            commands::class::update_class,
            commands::class::delete_class,
            // User commands
            commands::user::create_user,
            commands::user::get_users,
            // Auth commands
            commands::auth::login,
            // Substitute request commands
            commands::substitute::create_substitute_request,
            commands::substitute::get_substitute_requests,
            commands::substitute::get_substitute_requests_by_status,
            commands::substitute::get_substitute_request_by_id,
            commands::substitute::update_substitute_request_status,
            commands::substitute::delete_substitute_request,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
