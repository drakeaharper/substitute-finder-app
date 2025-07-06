-- Organizations table with parent-child relationship support
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_organization_id TEXT,
    description TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (parent_organization_id) REFERENCES organizations(id)
);

-- Users table for authentication and role management
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'org_manager', 'substitute')),
    organization_id TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    subject TEXT,
    grade_level TEXT,
    room_number TEXT,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Teachers table (substitute teachers)
CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    subjects TEXT, -- JSON array of subjects
    availability TEXT, -- JSON object for availability schedule
    hourly_rate DECIMAL(8,2),
    qualifications TEXT, -- JSON array of qualifications
    notes TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Regular teachers assigned to classes
CREATE TABLE IF NOT EXISTS regular_teachers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Many-to-many relationship between teachers and classes
CREATE TABLE IF NOT EXISTS teacher_class_assignments (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (teacher_id) REFERENCES regular_teachers(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    UNIQUE(teacher_id, class_id)
);

-- Substitute requests
CREATE TABLE IF NOT EXISTS substitute_requests (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    requested_by TEXT NOT NULL, -- user_id of person making request
    date_needed TEXT NOT NULL, -- ISO date string
    start_time TEXT NOT NULL, -- Time in HH:MM format
    end_time TEXT NOT NULL, -- Time in HH:MM format
    reason TEXT,
    special_instructions TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled', 'cancelled')),
    assigned_substitute_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (assigned_substitute_id) REFERENCES teachers(id)
);

-- Substitute responses to requests
CREATE TABLE IF NOT EXISTS substitute_responses (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    substitute_id TEXT NOT NULL,
    response TEXT NOT NULL CHECK (response IN ('accepted', 'declined')),
    response_time TEXT NOT NULL DEFAULT (datetime('now')),
    notes TEXT,
    FOREIGN KEY (request_id) REFERENCES substitute_requests(id),
    FOREIGN KEY (substitute_id) REFERENCES teachers(id),
    UNIQUE(request_id, substitute_id)
);

-- Notifications log
CREATE TABLE IF NOT EXISTS notifications_log (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    request_id TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'push', 'sms')),
    sent_at TEXT NOT NULL DEFAULT (datetime('now')),
    status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
    error_message TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (request_id) REFERENCES substitute_requests(id)
);

-- Application settings
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_parent ON organizations(parent_organization_id);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_classes_organization ON classes(organization_id);
CREATE INDEX IF NOT EXISTS idx_teachers_user ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_regular_teachers_user ON regular_teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_regular_teachers_org ON regular_teachers(organization_id);
CREATE INDEX IF NOT EXISTS idx_teacher_class_assignments_teacher ON teacher_class_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_class_assignments_class ON teacher_class_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_substitute_requests_class ON substitute_requests(class_id);
CREATE INDEX IF NOT EXISTS idx_substitute_requests_date ON substitute_requests(date_needed);
CREATE INDEX IF NOT EXISTS idx_substitute_requests_status ON substitute_requests(status);
CREATE INDEX IF NOT EXISTS idx_substitute_responses_request ON substitute_responses(request_id);
CREATE INDEX IF NOT EXISTS idx_substitute_responses_substitute ON substitute_responses(substitute_id);
CREATE INDEX IF NOT EXISTS idx_notifications_log_user ON notifications_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_log_request ON notifications_log(request_id);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value, description) VALUES
    ('app_name', 'Substitute Finder', 'Application name'),
    ('notification_enabled', 'true', 'Enable notifications'),
    ('auto_assign_substitutes', 'false', 'Automatically assign first available substitute'),
    ('default_request_duration', '8', 'Default request duration in hours');