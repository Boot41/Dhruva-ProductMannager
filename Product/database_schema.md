# Product Manager Database Schema

High-level reference for the Product Manager DB. Includes an overview, ER diagram, and a readable per-table summary. The raw psql dump is preserved below in a collapsible section.

## Tables

- [users](#table-users)
- [projects](#table-projects)
- [tasks](#table-tasks)
- [project_uml](#table-project_uml)
- [Raw psql dump](#raw-psql-dump)

## Table: task_assignments

| Column       | Type                 | Nullable | References                         |
| ------------ | -------------------- | -------- | ---------------------------------- |
| id           | integer (PK)         | not null |                                    |
| user_id      | integer              | not null | → users(id)                        |
| project_id   | integer              | not null | → projects(id)                     |
| description  | text                 |          |                                    |
| type         | text                 |          | e.g. `bug`, `feature`, `task`      |
| status       | text                 |          | e.g. `todo`, `in-progress`, `done` |
| assigned_by  | integer              | not null | → users(id) (the assigner)         |
| eta          | timestamp without tz |          | expected completion                |
| created_at   | timestamp without tz |          | default now()                      |


## ER diagram (simplified)

```
[users] 1 ──< [projects]     (projects.owner_id → users.id, ON DELETE SET NULL)
[users] 1 ──< [tasks]        (tasks.assignee_id → users.id, ON DELETE SET NULL)
[projects] 1 ──< [tasks]     (tasks.project_id → projects.id, ON DELETE CASCADE)
[projects] 1 ──< [project_uml] (project_uml.project_id → projects.id, ON DELETE CASCADE)
```

## Raw psql dump

<details>
<summary>Click to expand</summary>
<br>

                                        Table "public.users"
     Column      |          Type          | Collation | Nullable |              Default              
-----------------+------------------------+-----------+----------+-----------------------------------
 id              | integer                |           | not null | nextval('users_id_seq'::regclass)
 name            | character varying(100) |           | not null | 
 username        | character varying(50)  |           | not null | 
 hashed_password | text                   |           | not null | 
 email           | character varying(100) |           | not null | 
 role            | character varying(50)  |           |          | 'user'::character varying
 company         | character varying(100) |           |          | 
 skills          | jsonb                  |           |          | 
Indexes:
    "users_pkey" PRIMARY KEY, btree (id)
    "users_email_key" UNIQUE CONSTRAINT, btree (email)
    "users_username_key" UNIQUE CONSTRAINT, btree (username)
Referenced by:
    TABLE "projects" CONSTRAINT "projects_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    TABLE "tasks" CONSTRAINT "tasks_assignee_id_fkey" FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL



                                         Table "public.projects"
   Column    |            Type             | Collation | Nullable |               Default                
-------------+-----------------------------+-----------+----------+--------------------------------------
 id          | integer                     |           | not null | nextval('projects_id_seq'::regclass)
 name        | text                        |           | not null | 
 description | text                        |           |          | 
 owner_id    | integer                     |           |          | 
 created_at  | timestamp without time zone |           |          | now()
 status      | text                        |           |          | 'active'::text
 lead        | integer                     |           |          |  
Indexes:
    "projects_pkey" PRIMARY KEY, btree (id)
Foreign-key constraints:
    "projects_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
Referenced by:
    TABLE "project_uml" CONSTRAINT "project_uml_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    TABLE "tasks" CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE



                                         Table "public.tasks"
   Column    |            Type             | Collation | Nullable |              Default              
-------------+-----------------------------+-----------+----------+-----------------------------------
 id          | integer                     |           | not null | nextval('tasks_id_seq'::regclass)
 project_id  | integer                     |           |          | 
 title       | text                        |           | not null | 
 description | text                        |           |          | 
 status      | text                        |           |          | 'todo'::text
 assignee_id | integer                     |           |          | 
 tags        | text[]                      |           |          | 
 blockers    | text[]                      |           |          | 
 created_at  | timestamp without time zone |           |          | now()
 updated_at  | timestamp without time zone |           |          | now()
Indexes:
    "tasks_pkey" PRIMARY KEY, btree (id)
Check constraints:
    "tasks_status_check" CHECK (status = ANY (ARRAY['todo'::text, 'in-progress'::text, 'blocked'::text, 'done'::text]))
Foreign-key constraints:
    "tasks_assignee_id_fkey" FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
    "tasks_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE

                                     Table "public.project_uml"
   Column   |         Type          | Collation | Nullable |                 Default                 
------------+-----------------------+-----------+----------+-----------------------------------------
 id         | integer               |           | not null | nextval('project_uml_id_seq'::regclass)
 project_id | integer               |           |          | 
 type       | character varying(20) |           | not null | 
 uml_schema | jsonb                 |           | not null | 
Indexes:
    "project_uml_pkey" PRIMARY KEY, btree (id)
Foreign-key constraints:
    "project_uml_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE

</details>

---

# Database Schema (Readable Summary)

This section reformats the raw psql output above into a concise, human-friendly schema reference.

## Table: users

| Column          | Type                   | Nullable |
|-----------------|------------------------|----------|
| id              | integer                | not null |
| name            | varchar(100)           | not null |
| username        | varchar(50)            | not null |
| hashed_password | text                   | not null |
| email           | varchar(100)           | not null |
| role            | varchar(50)            |          |
| company         | varchar(100)           |          |
| skills          | jsonb                  |          |
| level           | integer                |          |

- __Primary key__: users_pkey (id)
- __Unique__: users_email_key (email), users_username_key (username)
- __Referenced by__:
  - projects.owner_id → users(id) ON DELETE SET NULL
  - tasks.assignee_id → users(id) ON DELETE SET NULL

---

## Table: projects

| Column     | Type                     | Nullable |
|------------|---------------------------|----------|
| id         | integer                  | not null |
| name       | text                     | not null |
| description| text                     |          |
| owner_id   | integer                  |          |
| created_at | timestamp without tz     |          |
| status     | text                     |          |

- __Primary key__: projects_pkey (id)
- __Foreign keys__:
  - owner_id → users(id) ON DELETE SET NULL
- __Referenced by__:
  - project_uml.project_id → projects(id) ON DELETE CASCADE
  - tasks.project_id → projects(id) ON DELETE CASCADE

---

## Table: tasks

| Column     | Type                     | Nullable |
|------------|---------------------------|----------|
| id         | integer                  | not null |
| project_id | integer                  |          |
| title      | text                     | not null |
| description| text                     |          |
| status     | text                     |          |
| assignee_id| integer                  |          |
| tags       | text[]                   |          |
| blockers   | text[]                   |          |
| created_at | timestamp without tz     |          |
| updated_at | timestamp without tz     |          |

- __Primary key__: tasks_pkey (id)
- __Checks__: tasks_status_check (status ∈ {'todo','in-progress','blocked','done'})
- __Foreign keys__:
  - assignee_id → users(id) ON DELETE SET NULL
  - project_id → projects(id) ON DELETE CASCADE

---

## Table: project_uml

| Column     | Type             | Nullable |
|------------|------------------|----------|
| id         | integer          | not null |
| project_id | integer          |          |
| type       | varchar(20)      | not null |
| uml_schema | jsonb            | not null |

- __Primary key__: project_uml_pkey (id)
- __Foreign keys__:
  - project_id → projects(id) ON DELETE CASCADE

---

Notes:
- Timestamps are without time zone.
- JSONB columns store structured data for `users.skills` and `project_uml.uml_schema`.

task_assignments table

| Column       | Type                 | Nullable | References                         |
| ------------ | -------------------- | -------- | ---------------------------------- |
| id           | integer (PK)         | not null |                                    |
| user_id      | integer              | not null | → users(id)                        |
| project_id   | integer              | not null | → projects(id)                     |
| description  | text                 |          |                                    |
| type         | text                 |          | e.g. `bug`, `feature`, `task`      |
| status       | text                 |          | e.g. `todo`, `in-progress`, `done` |
| assigned_by  | integer              | not null | → users(id) (the assigner)         |
| eta          | timestamp without tz |          | expected completion                |
| created_at   | timestamp without tz |          | default now()                      |

