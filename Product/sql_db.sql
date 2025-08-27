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