
import { User } from '../types';

const STORAGE_KEY_USERS = 'protrack_users_v1';
const STORAGE_KEY_SESSION = 'protrack_session_v1';

export const registerUser = (name: string, email: string, password: string): User | { error: string } => {
  const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];

  if (users.find(u => u.email === email)) {
    return { error: 'User with this email already exists.' };
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    name,
    email,
    password // In a real app, never store plain text passwords
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  
  // Auto login
  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(newUser));
  return newUser;
};

export const loginUser = (email: string, password: string): User | { error: string } => {
  const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];

  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
    return user;
  }

  return { error: 'Invalid credentials.' };
};

export const getCurrentUser = (): User | null => {
  const sessionStr = localStorage.getItem(STORAGE_KEY_SESSION);
  return sessionStr ? JSON.parse(sessionStr) : null;
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEY_SESSION);
};
