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

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;

    #[test]
    fn test_user_role_display() {
        assert_eq!(UserRole::Admin.to_string(), "admin");
        assert_eq!(UserRole::OrgManager.to_string(), "org_manager");
        assert_eq!(UserRole::Substitute.to_string(), "substitute");
    }

    #[test]
    fn test_user_role_from_str() {
        assert!(matches!(UserRole::from_str("admin"), Ok(UserRole::Admin)));
        assert!(matches!(UserRole::from_str("org_manager"), Ok(UserRole::OrgManager)));
        assert!(matches!(UserRole::from_str("substitute"), Ok(UserRole::Substitute)));
        assert!(UserRole::from_str("invalid").is_err());
    }

    #[test]
    fn test_request_status_display() {
        assert_eq!(RequestStatus::Open.to_string(), "open");
        assert_eq!(RequestStatus::Filled.to_string(), "filled");
        assert_eq!(RequestStatus::Cancelled.to_string(), "cancelled");
    }

    #[test]
    fn test_request_status_from_str() {
        assert!(matches!(RequestStatus::from_str("open"), Ok(RequestStatus::Open)));
        assert!(matches!(RequestStatus::from_str("filled"), Ok(RequestStatus::Filled)));
        assert!(matches!(RequestStatus::from_str("cancelled"), Ok(RequestStatus::Cancelled)));
        assert!(RequestStatus::from_str("invalid").is_err());
    }

    #[test]
    fn test_response_type_display() {
        assert_eq!(ResponseType::Accepted.to_string(), "accepted");
        assert_eq!(ResponseType::Declined.to_string(), "declined");
    }

    #[test]
    fn test_response_type_from_str() {
        assert!(matches!(ResponseType::from_str("accepted"), Ok(ResponseType::Accepted)));
        assert!(matches!(ResponseType::from_str("declined"), Ok(ResponseType::Declined)));
        assert!(ResponseType::from_str("invalid").is_err());
    }

    #[test]
    fn test_serde_serialization() {
        let user_role = UserRole::Admin;
        let json = serde_json::to_string(&user_role).unwrap();
        let deserialized: UserRole = serde_json::from_str(&json).unwrap();
        assert!(matches!(deserialized, UserRole::Admin));
    }

    #[test]
    fn test_create_organization_request_serialization() {
        let request = CreateOrganizationRequest {
            name: "Test School".to_string(),
            parent_organization_id: None,
            description: Some("A test school".to_string()),
            contact_email: Some("test@example.com".to_string()),
            contact_phone: Some("123-456-7890".to_string()),
        };

        let json = serde_json::to_string(&request).unwrap();
        let deserialized: CreateOrganizationRequest = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.name, "Test School");
        assert_eq!(deserialized.contact_email, Some("test@example.com".to_string()));
    }

    #[test]
    fn test_create_user_request_serialization() {
        let request = CreateUserRequest {
            username: "testuser".to_string(),
            password: "password123".to_string(),
            email: "test@example.com".to_string(),
            first_name: "Test".to_string(),
            last_name: "User".to_string(),
            role: UserRole::Admin,
            organization_id: Some("org123".to_string()),
        };

        let json = serde_json::to_string(&request).unwrap();
        let deserialized: CreateUserRequest = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.username, "testuser");
        assert!(matches!(deserialized.role, UserRole::Admin));
    }
}