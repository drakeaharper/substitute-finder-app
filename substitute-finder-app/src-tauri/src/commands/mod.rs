pub mod organization;
pub mod user;
pub mod class;
pub mod substitute;
pub mod auth;

use crate::database::connection::DatabaseManager;
use std::sync::Arc;

pub type AppState = Arc<DatabaseManager>;