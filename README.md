# College Project Team Formation and Management System (Frontend)

React + Vite frontend built from the CSL202A / CSC203B lab manuals
(FR1–FR10, NFR1–NFR8; actors: Student, Team Leader, Faculty, Admin).

## Run it

```bash
npm install
npm run dev        # opens http://localhost:5173
```

Requires Node.js 18+. Data is saved in the browser (localStorage), so no backend is needed.
Use a private window or clear site data to reset everything.

## Demo accounts

| Role    | Email                | Password     |
|---------|----------------------|--------------|
| Admin   | admin@college.edu    | Admin@123    |
| Faculty | faculty@college.edu  | Faculty@123  |
| Student | register your own (open the app > Create an account) |

Tip: to test team features, register 2-3 students one after another (log out between them). All accounts live in the same browser.

## File map

| File | Purpose |
|------|---------|
| `index.html` | HTML page shell |
| `src/styles.css` | All CSS (responsive) |
| `src/main.jsx` | React entry point |
| `src/App.jsx` | Switches between login/register and the app |
| `src/pages/Login.jsx` | **Login** (FR2) |
| `src/pages/Register.jsx` | **Register** (FR1) |
| `src/pages/Dashboard.jsx` | Role-based dashboards |
| `src/pages/Teams.jsx` | Create team (FR3), search and join (FR4) |
| `src/pages/MyTeam.jsx` | Members (FR5), topic (FR6), tasks (FR7) |
| `src/pages/FacultyMonitor.jsx` | Faculty view of teams and progress (FR8) |
| `src/pages/Notifications.jsx` | Notifications (FR9) |
| `src/pages/Profile.jsx` | Profile update and logout (FR10) |
| `src/pages/AdminUsers.jsx` | Admin account management |
| `src/context/AuthContext.jsx` | Login state shared across the app |
| `src/services/storage.js` | Mock backend (localStorage) |
| `src/components/` | Navbar, TaskTable, small UI pieces |
