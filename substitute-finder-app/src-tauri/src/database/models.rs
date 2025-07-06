use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Organization {
    pub id: String,
    pub name: String,
    pub parent_organization_id: Option<String>,
    pub description: Option<String>,
    pub contact_email: Option<String>,
    pub contact_phone: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub username: String,
    pub password_hash: String,
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub role: UserRole,
    pub organization_id: Option<String>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum UserRole {
    Admin,
    OrgManager,
    Substitute,
}

impl std::fmt::Display for UserRole {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            UserRole::Admin => write!(f, "admin"),
            UserRole::OrgManager => write!(f, "org_manager"),
            UserRole::Substitute => write!(f, "substitute"),
        }
    }
}

impl std::str::FromStr for UserRole {
    type Err = anyhow::Error;
    
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "admin" => Ok(UserRole::Admin),
            "org_manager" => Ok(UserRole::OrgManager),
            "substitute" => Ok(UserRole::Substitute),
            _ => Err(anyhow::anyhow!("Invalid user role: {}", s)),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Class {
    pub id: String,
    pub name: String,
    pub organization_id: String,
    pub subject: Option<String>,
    pub grade_level: Option<String>,
    pub room_number: Option<String>,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Teacher {
    pub id: String,
    pub user_id: String,
    pub subjects: Vec<String>,
    pub availability: serde_json::Value,
    pub hourly_rate: Option<f64>,
    pub qualifications: Vec<String>,
    pub notes: Option<String>,
    pub is_available: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegularTeacher {
    pub id: String,
    pub user_id: String,
    pub organization_id: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeacherClassAssignment {
    pub id: String,
    pub teacher_id: String,
    pub class_id: String,
    pub is_primary: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubstituteRequest {
    pub id: String,
    pub class_id: String,
    pub requested_by: String,
    pub date_needed: String,
    pub start_time: String,
    pub end_time: String,
    pub reason: Option<String>,
    pub special_instructions: Option<String>,
    pub status: RequestStatus,
    pub assigned_substitute_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RequestStatus {
    Open,
    Filled,
    Cancelled,
}

impl std::fmt::Display for RequestStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RequestStatus::Open => write!(f, "open"),
            RequestStatus::Filled => write!(f, "filled"),
            RequestStatus::Cancelled => write!(f, "cancelled"),
        }
    }
}

impl std::str::FromStr for RequestStatus {
    type Err = anyhow::Error;
    
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "open" => Ok(RequestStatus::Open),
            "filled" => Ok(RequestStatus::Filled),
            "cancelled" => Ok(RequestStatus::Cancelled),
            _ => Err(anyhow::anyhow!("Invalid request status: {}", s)),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubstituteResponse {
    pub id: String,
    pub request_id: String,
    pub substitute_id: String,
    pub response: ResponseType,
    pub response_time: DateTime<Utc>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ResponseType {
    Accepted,
    Declined,
}

impl std::fmt::Display for ResponseType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ResponseType::Accepted => write!(f, "accepted"),
            ResponseType::Declined => write!(f, "declined"),
        }
    }
}

impl std::str::FromStr for ResponseType {
    type Err = anyhow::Error;
    
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "accepted" => Ok(ResponseType::Accepted),
            "declined" => Ok(ResponseType::Declined),
            _ => Err(anyhow::anyhow!("Invalid response type: {}", s)),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationLog {
    pub id: String,
    pub user_id: String,
    pub request_id: String,
    pub notification_type: NotificationType,
    pub sent_at: DateTime<Utc>,
    pub status: NotificationStatus,
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NotificationType {
    Email,
    Push,
    Sms,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NotificationStatus {
    Sent,
    Failed,
    Pending,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Setting {
    pub key: String,
    pub value: String,
    pub description: Option<String>,
    pub updated_at: DateTime<Utc>,
}

// DTOs for API requests
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateOrganizationRequest {
    pub name: String,
    pub parent_organization_id: Option<String>,
    pub description: Option<String>,
    pub contact_email: Option<String>,
    pub contact_phone: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateUserRequest {
    pub username: String,
    pub password: String,
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub role: UserRole,
    pub organization_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateClassRequest {
    pub name: String,
    pub organization_id: String,
    pub subject: Option<String>,
    pub grade_level: Option<String>,
    pub room_number: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateSubstituteRequestRequest {
    pub class_id: String,
    pub date_needed: String,
    pub start_time: String,
    pub end_time: String,
    pub reason: Option<String>,
    pub special_instructions: Option<String>,
}