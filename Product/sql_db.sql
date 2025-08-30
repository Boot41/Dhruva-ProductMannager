-- Add level column to users table
ALTER TABLE users
ADD COLUMN level INTEGER DEFAULT 1;

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('todo', 'in-progress', 'blocked', 'done')) DEFAULT 'todo',
    assignee_id INT REFERENCES users(id) ON DELETE SET NULL,
    tags TEXT[],
    blockers TEXT[],
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

productmannager=# CREATE TABLE project_uml (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    uml_schema JSONB NOT NULL
);

CREATE TABLE task_assignments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    description TEXT,
    type TEXT,
    status TEXT CHECK (status IN ('assigned', 'todo', 'in progress', 'sent for approval', 'approved', 'done')),
    assigned_by INT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    eta TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

CREATE TABLE user_projects (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

ALTER TABLE projects
ADD COLUMN features jsonb DEFAULT '[]'::jsonb,
ADD COLUMN stack jsonb DEFAULT '[]'::jsonb,
ADD COLUMN progress jsonb DEFAULT '{}'::jsonb;
