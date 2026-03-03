import { User, UserRole } from './types'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

interface StoredUser extends User {
  passwordHash: string
}

// Simple hash function (for demo only - use bcrypt in production!)
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return 'hash_' + Math.abs(hash).toString(16)
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function loadUsers(): StoredUser[] {
  ensureDataDir()
  if (!fs.existsSync(USERS_FILE)) {
    // Create default admin user
    const defaultAdmin: StoredUser = {
      id: uuidv4(),
      email: 'admin@company.com',
      name: 'Administrator',
      role: 'admin',
      passwordHash: simpleHash('admin123'),
      createdAt: new Date().toISOString(),
    }
    saveUsers([defaultAdmin])
    return [defaultAdmin]
  }
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function saveUsers(users: StoredUser[]) {
  ensureDataDir()
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  role: UserRole = 'candidate'
): Promise<User | null> {
  const users = loadUsers()
  
  // Check if email already exists
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return null
  }

  const newUser: StoredUser = {
    id: uuidv4(),
    email: email.toLowerCase(),
    name,
    role,
    passwordHash: simpleHash(password),
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  saveUsers(users)

  console.log(`\n✅ New ${role} registered: ${email}`)

  const { passwordHash, ...user } = newUser
  return user
}

export async function validateUser(
  email: string,
  password: string,
  requiredRole?: UserRole
): Promise<User | null> {
  const users = loadUsers()
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())

  if (!user) {
    return null
  }

  if (user.passwordHash !== simpleHash(password)) {
    return null
  }

  if (requiredRole && user.role !== requiredRole) {
    return null
  }

  console.log(`\n✅ User logged in: ${email} (${user.role})`)

  const { passwordHash, ...userData } = user
  return userData
}

export async function getUserById(id: string): Promise<User | null> {
  const users = loadUsers()
  const user = users.find(u => u.id === id)
  if (!user) return null
  const { passwordHash, ...userData } = user
  return userData
}

export async function getAllCandidates(): Promise<User[]> {
  const users = loadUsers()
  return users
    .filter(u => u.role === 'candidate')
    .map(({ passwordHash, ...user }) => user)
}



