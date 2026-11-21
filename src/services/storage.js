/**
 * Data layer (mock backend).
 * Everything is stored in the browser's localStorage so the site works
 * without a server. Replace these functions with API calls later.
 *
 * Covers: FR1-FR10 (register, login, teams, join requests, members,
 * topics, tasks, faculty monitoring, notifications, profile/logout).
 */

const KEYS = {
  users: 'pts_users',
  teams: 'pts_teams',
  tasks: 'pts_tasks',
  notes: 'pts_notifications',
  session: 'pts_session',
};

export const MAX_TEAM_SIZE = 6;
export const TASK_STATUSES = ['pending', 'in progress', 'completed'];

export const TOPIC_CATALOG = [
  'Smart Attendance System',
  'Campus Navigation App',
  'Library Management System',
  'Online Examination Portal',
  'Student Feedback Analyser',
  'IoT Based Smart Classroom',
  'E-Waste Collection Tracker',
  'Peer Tutoring Platform',
];

/* ---------- helpers ---------- */
const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? [];
  } catch {
    return [];
  }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const now = () => new Date().toISOString();

// NFR1 (Security): passwords are never stored in plain text.
export async function hashPassword(password) {
  if (window.crypto?.subtle) {
    const data = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return btoa(password); // fallback for non-secure contexts
}

export const parseSkills = (text) =>
  text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/* ---------- seed data ---------- */
export async function ensureSeed() {
  const users = read(KEYS.users);
  let changed = false;
  if (!users.some((u) => u.role === 'admin')) {
    users.push({
      id: uid(), name: 'System Admin', regNo: 'ADMIN001', email: 'admin@college.edu',
      passHash: await hashPassword('Admin@123'), role: 'admin', skills: [], active: true, createdAt: now(),
    });
    changed = true;
  }
  if (!users.some((u) => u.email === 'faculty@college.edu')) {
    users.push({
      id: uid(), name: 'Dr. Demo Faculty', regNo: 'FAC001', email: 'faculty@college.edu',
      passHash: await hashPassword('Faculty@123'), role: 'faculty', skills: ['Software Engineering'], active: true, createdAt: now(),
    });
    changed = true;
  }
  if (changed) write(KEYS.users, users);
}

/* ---------- session ---------- */
export const getSession = () => localStorage.getItem(KEYS.session);
export const setSession = (id) => localStorage.setItem(KEYS.session, id);
export const clearSession = () => localStorage.removeItem(KEYS.session);

/* ---------- users (FR1, FR2, FR10) ---------- */
export const getUsers = () => read(KEYS.users);
export const getUser = (id) => getUsers().find((u) => u.id === id) || null;
export const userName = (id) => getUser(id)?.name || 'Unknown';

export async function registerUser({ name, regNo, email, password, role, skills }) {
  const users = getUsers();
  email = email.trim().toLowerCase();
  regNo = regNo.trim().toUpperCase();
  if (!['student', 'faculty'].includes(role)) throw new Error('Invalid role selected.');
  if (users.some((u) => u.email === email)) throw new Error('An account with this email already exists.');
  if (users.some((u) => u.regNo === regNo)) throw new Error('This registration / employee number is already registered.');
  const user = {
    id: uid(), name: name.trim(), regNo, email,
    passHash: await hashPassword(password), role, skills: skills || [], active: true, createdAt: now(),
  };
  users.push(user);
  write(KEYS.users, users);
  return user;
}

export async function loginUser(identifier, password) {
  const id = identifier.trim().toLowerCase();
  const user = getUsers().find((u) => u.email === id || u.regNo.toLowerCase() === id);
  const hash = await hashPassword(password);
  if (!user || user.passHash !== hash) throw new Error('Invalid email / registration number or password.');
  if (!user.active) throw new Error('Your account has been suspended. Please contact the admin.');
  return user;
}

export function updateProfile(userId, { name, email, skills }) {
  const users = getUsers();
  email = email.trim().toLowerCase();
  if (users.some((u) => u.email === email && u.id !== userId)) throw new Error('That email is already used by another account.');
  const u = users.find((x) => x.id === userId);
  Object.assign(u, { name: name.trim(), email, skills });
  write(KEYS.users, users);
}

export async function changePassword(userId, current, next) {
  const users = getUsers();
  const u = users.find((x) => x.id === userId);
  if ((await hashPassword(current)) !== u.passHash) throw new Error('Current password is incorrect.');
  u.passHash = await hashPassword(next);
  write(KEYS.users, users);
}

export function setUserActive(userId, active) {
  const users = getUsers();
  const u = users.find((x) => x.id === userId);
  if (u) u.active = active;
  write(KEYS.users, users);
}

/* ---------- teams (FR3, FR4, FR5, FR6) ---------- */
export const getTeams = () => read(KEYS.teams);
export const getTeam = (id) => getTeams().find((t) => t.id === id) || null;
export const getTeamOfUser = (userId) => getTeams().find((t) => t.memberIds.includes(userId)) || null;

export const getStudentsWithoutTeam = () =>
  getUsers().filter((u) => u.role === 'student' && u.active && !getTeamOfUser(u.id));

function saveTeam(team) {
  const teams = getTeams().map((t) => (t.id === team.id ? team : t));
  write(KEYS.teams, teams);
}

// Remove a user's pending requests from every team (used once they join one).
function clearRequests(userId) {
  write(KEYS.teams, getTeams().map((t) => ({ ...t, requests: t.requests.filter((r) => r !== userId) })));
}

export function createTeam(leaderId, { name, description, requiredSkills, topic }) {
  if (getTeamOfUser(leaderId)) throw new Error('You are already part of a team.');
  const teams = getTeams();
  if (teams.some((t) => t.name.toLowerCase() === name.trim().toLowerCase())) throw new Error('A team with this name already exists.');
  const team = {
    id: uid(), name: name.trim(), description: description.trim(), leaderId,
    memberIds: [leaderId], requests: [], requiredSkills: requiredSkills || [],
    topic: topic || null, guideId: null, createdAt: now(),
  };
  teams.push(team);
  write(KEYS.teams, teams);
  clearRequests(leaderId);
  return team;
}

export function requestToJoin(teamId, userId) {
  const team = getTeam(teamId);
  if (getTeamOfUser(userId)) throw new Error('You are already in a team.');
  if (team.memberIds.length >= MAX_TEAM_SIZE) throw new Error('This team is full.');
  if (team.requests.includes(userId)) throw new Error('Request already sent.');
  team.requests.push(userId);
  saveTeam(team);
  notify(team.leaderId, `${userName(userId)} requested to join your team "${team.name}".`);
}

export function cancelRequest(teamId, userId) {
  const team = getTeam(teamId);
  team.requests = team.requests.filter((r) => r !== userId);
  saveTeam(team);
}

function addToTeam(team, userId) {
  if (team.memberIds.length >= MAX_TEAM_SIZE) throw new Error('Team is full.');
  if (getTeamOfUser(userId)) throw new Error('That student is already in a team.');
  team.memberIds.push(userId);
  team.requests = team.requests.filter((r) => r !== userId);
  saveTeam(team);
  clearRequests(userId);
}

export function respondToRequest(teamId, userId, accept) {
  const team = getTeam(teamId);
  if (accept) {
    addToTeam(team, userId);
    notify(userId, `Your request to join "${team.name}" was accepted.`);
  } else {
    team.requests = team.requests.filter((r) => r !== userId);
    saveTeam(team);
    notify(userId, `Your request to join "${team.name}" was declined.`);
  }
}

export function addMember(teamId, userId) {
  const team = getTeam(teamId);
  addToTeam(team, userId);
  notify(userId, `You were added to the team "${team.name}".`);
}

function detachMember(team, userId) {
  team.memberIds = team.memberIds.filter((m) => m !== userId);
  saveTeam(team);
  // Hand their open tasks back to the leader so nothing is lost (NFR6).
  write(KEYS.tasks, read(KEYS.tasks).map((t) => (t.teamId === team.id && t.assigneeId === userId ? { ...t, assigneeId: team.leaderId } : t)));
}

export function removeMember(teamId, userId) {
  const team = getTeam(teamId);
  if (userId === team.leaderId) throw new Error('The team leader cannot be removed.');
  detachMember(team, userId);
  notify(userId, `You were removed from the team "${team.name}".`);
}

export function leaveTeam(teamId, userId) {
  const team = getTeam(teamId);
  if (userId === team.leaderId) throw new Error('The team leader cannot leave the team.');
  detachMember(team, userId);
  notify(team.leaderId, `${userName(userId)} left your team "${team.name}".`);
}

export function setTopic(teamId, userId, topic) {
  const team = getTeam(teamId);
  if (!team.memberIds.includes(userId)) throw new Error('Only team members can set the topic.');
  team.topic = topic;
  saveTeam(team);
  const label = topic.type === 'proposed' ? 'proposed' : 'selected';
  const audience = [...team.memberIds.filter((m) => m !== userId), team.guideId].filter(Boolean);
  audience.forEach((id) => notify(id, `Project topic ${label} for "${team.name}": ${topic.title}.`));
}

export function becomeGuide(teamId, facultyId) {
  const team = getTeam(teamId);
  if (team.guideId && team.guideId !== facultyId) throw new Error('This team already has a guide.');
  team.guideId = facultyId;
  saveTeam(team);
  team.memberIds.forEach((id) => notify(id, `${userName(facultyId)} is now the project guide for "${team.name}".`));
}

/* ---------- tasks (FR7) ---------- */
export const getTasksForTeam = (teamId) => read(KEYS.tasks).filter((t) => t.teamId === teamId);

export function addTask({ teamId, title, assigneeId, deadline }) {
  const team = getTeam(teamId);
  const task = { id: uid(), teamId, title: title.trim(), assigneeId, deadline, status: 'pending', createdAt: now(), deadlineNotified: false };
  write(KEYS.tasks, [...read(KEYS.tasks), task]);
  if (assigneeId !== team.leaderId) notify(assigneeId, `New task assigned in "${team.name}": ${task.title} (due ${deadline}).`);
}

export function updateTaskStatus(taskId, userId, status) {
  const tasks = read(KEYS.tasks);
  const task = tasks.find((t) => t.id === taskId);
  const team = getTeam(task.teamId);
  if (task.assigneeId !== userId && team.leaderId !== userId) throw new Error('Only the assignee or team leader can update this task.');
  task.status = status;
  write(KEYS.tasks, tasks);
  const audience = [team.leaderId, team.guideId].filter((id) => id && id !== userId);
  audience.forEach((id) => notify(id, `${userName(userId)} marked "${task.title}" as ${status}.`));
}

export function deleteTask(taskId) {
  write(KEYS.tasks, read(KEYS.tasks).filter((t) => t.id !== taskId));
}

export function teamProgress(teamId) {
  const tasks = getTasksForTeam(teamId);
  const done = tasks.filter((t) => t.status === 'completed').length;
  return { total: tasks.length, done, pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0 };
}

/* ---------- notifications (FR9) ---------- */
export function notify(userId, message) {
  write(KEYS.notes, [...read(KEYS.notes), { id: uid(), userId, message, read: false, createdAt: now() }]);
}
export const getNotifications = (userId) =>
  read(KEYS.notes).filter((n) => n.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const unreadCount = (userId) => getNotifications(userId).filter((n) => !n.read).length;
export function markRead(id) {
  write(KEYS.notes, read(KEYS.notes).map((n) => (n.id === id ? { ...n, read: true } : n)));
}
export function markAllRead(userId) {
  write(KEYS.notes, read(KEYS.notes).map((n) => (n.userId === userId ? { ...n, read: true } : n)));
}

// Sends one reminder per task that is overdue or due within 48 hours.
export function checkDeadlines(userId) {
  const tasks = read(KEYS.tasks);
  let changed = false;
  tasks.forEach((t) => {
    if (t.assigneeId !== userId || t.status === 'completed' || t.deadlineNotified) return;
    const msLeft = new Date(t.deadline + 'T23:59:59') - Date.now();
    if (msLeft < 48 * 3600 * 1000) {
      notify(userId, msLeft < 0 ? `Task overdue: "${t.title}" (was due ${t.deadline}).` : `Deadline approaching: "${t.title}" is due ${t.deadline}.`);
      t.deadlineNotified = true;
      changed = true;
    }
  });
  if (changed) write(KEYS.tasks, tasks);
}
