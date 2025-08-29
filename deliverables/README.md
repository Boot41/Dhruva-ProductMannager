# Product Manager Application

This project is a Product Manager application designed to help manage product development, roadmaps, tasks, and user interactions.

## Key Features:

### Backend (server/app):
- **API Endpoints:** Provides various API endpoints for managing projects, tasks, users, chat, and system design.
- **Database Integration:** Interacts with a SQL database (indicated by `sql_db.sql` and `database_schema.md`).
- **Authentication & Authorization:** Includes security features for user authentication and authorization (`core/security.py`).
- **LLM Agents:** Integrates Language Model (LLM) agents for features like chat, milestones, roadmap generation, system design, and task management (`app/agents/`).
- **Modular Structure:** Organized into modules for agents, core functionalities, models, and routes.

### Frontend (web/src):
- **User Interface:** Built with React, providing a responsive and interactive user interface.
- **API Communication:** Communicates with the backend API using dedicated API services (`Api/`).
- **Components:** Reusable UI components for various functionalities like forms, buttons, chat bubbles, and product cards (`components/`).
- **Pages:** Dedicated pages for different sections of the application, including login, product overview, tasks, and user profiles (`pages/`).
- **Styling:** Uses CSS for styling the application (`App.css`, `index.css`).

### Overall:
- **Product Management:** Core functionality for managing products, projects, and their lifecycles.
- **Task Assignment:** Features for assigning and tracking tasks.
- **Roadmap Planning:** Tools for creating and visualizing product roadmaps.
- **System Design:** Potentially includes features for system design documentation or generation.
- **Chat Functionality:** Integrated chat for communication within the application.
