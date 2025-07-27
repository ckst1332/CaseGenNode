import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CASES_FILE = path.join(DATA_DIR, 'cases.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, '{}');
}

if (!fs.existsSync(CASES_FILE)) {
  fs.writeFileSync(CASES_FILE, '{}');
}

export const storage = {
  // User operations
  getUsers: () => {
    try {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading users:', error);
      return {};
    }
  },

  saveUsers: (users) => {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  },

  getUser: (userId) => {
    const users = storage.getUsers();
    return users[userId] || null;
  },

  saveUser: (userId, userData) => {
    const users = storage.getUsers();
    users[userId] = userData;
    storage.saveUsers(users);
    return userData;
  },

  // Case operations
  getCases: () => {
    try {
      const data = fs.readFileSync(CASES_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading cases:', error);
      return {};
    }
  },

  saveCases: (cases) => {
    try {
      fs.writeFileSync(CASES_FILE, JSON.stringify(cases, null, 2));
    } catch (error) {
      console.error('Error saving cases:', error);
    }
  },

  getCase: (caseId) => {
    const cases = storage.getCases();
    return cases[caseId] || null;
  },

  saveCase: (caseId, caseData) => {
    const cases = storage.getCases();
    cases[caseId] = caseData;
    storage.saveCases(cases);
    return caseData;
  },

  getUserCases: (userId) => {
    const cases = storage.getCases();
    return Object.values(cases).filter(caseItem => caseItem.user_id === userId);
  },

  deleteCase: (caseId) => {
    const cases = storage.getCases();
    delete cases[caseId];
    storage.saveCases(cases);
  }
};
