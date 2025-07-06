pub mod organization;
pub mod user;
pub mod class;
pub mod substitute;
pub mod auth;
pub mod seed;
pub mod notification;

use crate::database::connection::DatabaseManager;
use std::sync::Arc;

pub type AppState = Arc<DatabaseManager>;