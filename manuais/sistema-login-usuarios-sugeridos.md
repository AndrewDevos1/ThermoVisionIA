# Sistema de Login com Usuários Sugeridos - Guia Completo

## 📋 Visão Geral

Este documento detalha a implementação de um **sistema de autenticação completo com JWT**, incluindo uma funcionalidade exclusiva de **usuários sugeridos** que acelera o desenvolvimento permitindo login rápido com credenciais pré-preenchidas.

### Características Principais

- ✅ **Autenticação JWT** - Tokens de acesso e refresh
- ✅ **Usuários sugeridos** - Credenciais visíveis para facilitar dev
- ✅ **Múltiplos perfis** - ADMIN, USER com diferentes permissões
- ✅ **Context API** - Estado global de autenticação
- ✅ **LocalStorage** - Persistência de sessão
- ✅ **Protected routes** - Rotas protegidas por autenticação
- ✅ **Auto-redirect** - Redirecionamento automático após login
- ✅ **UX aprimorada** - Copiar credenciais, mostrar/ocultar senha
- ✅ **Feedback visual** - Toasts, loading states, erros

---

## 🏗️ Arquitetura da Solução

### Stack Tecnológica

**Backend:**
- Node.js + Express + TypeScript
- TypeORM + PostgreSQL
- jsonwebtoken (JWT)
- bcrypt (Hash de senhas)
- Middleware de autenticação

**Frontend:**
- Next.js 15 (App Router) + React 19 + TypeScript
- React Context API para gerenciamento de estado
- Axios com interceptors
- localStorage para persistência
- shadcn/ui + Tailwind CSS
- sonner (toasts)
- lucide-react (ícones)

### Fluxo de Autenticação

```
┌────────────┐         ┌────────────┐         ┌──────────────┐
│  Cliente   │────────▶│  Backend   │────────▶│   Database   │
│ (Next.js)  │         │  (Express) │         │ (PostgreSQL) │
└────────────┘         └────────────┘         └──────────────┘
       │                     │
       │ 1. POST /login      │
       │ { email, password } │
       │────────────────────▶│
       │                     │ 2. Valida senha (bcrypt)
       │                     │ 3. Gera JWT tokens
       │                     │
       │ 4. { user, token,   │
       │     refreshToken }  │
       │◀────────────────────│
       │                     │
       │ 5. Salva no         │
       │    localStorage     │
       │                     │
       │ 6. Adiciona token   │
       │    no header        │
       │ Authorization:      │
       │ Bearer {token}      │
       │────────────────────▶│
       │                     │ 7. Valida JWT
       │                     │ 8. Retorna dados
       │                     │
```

---

## 📂 Estrutura de Arquivos

```
projeto/
├── backend/
│   ├── src/
│   │   ├── entities/
│   │   │   └── User.ts                   # Entity do usuário
│   │   ├── services/
│   │   │   └── auth.service.ts           # Lógica de autenticação
│   │   ├── controllers/
│   │   │   └── auth.controller.ts        # Endpoints de auth
│   │   ├── middlewares/
│   │   │   └── auth.middleware.ts        # Middleware JWT
│   │   ├── routes/
│   │   │   └── auth.routes.ts            # Rotas de auth
│   │   └── server.ts                     # Configuração do servidor
│   └── .env                              # Variáveis de ambiente
│
└── frontend/
    ├── app/
    │   ├── login/
    │   │   └── page.tsx                  # Página de login
    │   ├── dashboard/
    │   │   └── layout.tsx                # Layout protegido
    │   └── page.tsx                      # Homepage pública
    ├── contexts/
    │   └── auth-context.tsx              # Context de autenticação
    └── lib/
        └── api.ts                        # Axios configurado
```

---

## 📝 Implementação Completa - Backend

### **Passo 1: Entity do Usuário**

**Arquivo:** `backend/src/entities/User.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ['ADMIN', 'AUDITOR', 'ESTABELECIMENTO'],
    default: 'ESTABELECIMENTO'
  })
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Hash da senha antes de inserir/atualizar
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Método para validar senha
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
```

**Pontos críticos:**
- ⚠️ `@BeforeInsert/@BeforeUpdate`: Hash automático da senha
- ⚠️ Verificar se senha já está hasheada para evitar double-hash
- ⚠️ `validatePassword`: Usa bcrypt.compare para segurança

### **Passo 2: Service de Autenticação**

**Arquivo:** `backend/src/services/auth.service.ts`

```typescript
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Buscar usuário por email
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['secretaria'] // Se tiver relação
    });

    if (!user) {
      throw new Error('Email ou senha inválidos');
    }

    if (!user.isActive) {
      throw new Error('Usuário inativo');
    }

    // Validar senha
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error('Email ou senha inválidos');
    }

    // Gerar tokens
    const token = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Remover senha do retorno
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      refreshToken
    };
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    // Verificar se email já existe
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    // Criar usuário
    const user = this.userRepository.create({
      name: data.name,
      email: data.email,
      password: data.password, // Será hasheada automaticamente
      role: data.role || 'ESTABELECIMENTO'
    });

    await this.userRepository.save(user);

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  }

  async refreshToken(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET!
      ) as any;

      const user = await this.userRepository.findOne({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive) {
        throw new Error('Usuário não encontrado ou inativo');
      }

      const newToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  private generateAccessToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  private generateRefreshToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        type: 'refresh'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['secretaria']
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
```

### **Passo 3: Middleware de Autenticação**

**Arquivo:** `backend/src/middlewares/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const [, token] = authHeader.split(' '); // "Bearer {token}"

    if (!token) {
      return res.status(401).json({ message: 'Token malformado' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as any;

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

// Middleware para verificar role
export const roleMiddleware = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Sem permissão' });
    }

    next();
  };
};
```

### **Passo 4: Controller**

**Arquivo:** `backend/src/controllers/auth.controller.ts`

```typescript
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AuthController {
  private authService = new AuthService();

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: 'Email e senha são obrigatórios'
        });
      }

      const result = await this.authService.login(
        email,
        password,
        req.ip,
        req.get('user-agent')
      );

      return res.json(result);
    } catch (error) {
      return res.status(401).json({
        message: error instanceof Error
          ? error.message
          : 'Erro ao fazer login'
      });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          message: 'Email, senha e nome são obrigatórios'
        });
      }

      const result = await this.authService.register({
        name,
        email,
        password,
        role
      });

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error
          ? error.message
          : 'Erro ao registrar'
      });
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Não autenticado' });
      }

      const profile = await this.authService.getProfile(req.user.userId);
      return res.json(profile);
    } catch (error) {
      return res.status(404).json({
        message: error instanceof Error
          ? error.message
          : 'Erro ao buscar perfil'
      });
    }
  }
}
```

### **Passo 5: Variáveis de Ambiente**

**Arquivo:** `backend/.env`

```env
# JWT Configuration
JWT_SECRET=sua-chave-super-secreta-aqui-min-32-chars
JWT_EXPIRES_IN=7d

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=senha
DB_NAME=seu_banco

# Server
PORT=3001
NODE_ENV=development
```

**⚠️ IMPORTANTE:**
- Nunca commitar o `.env` no git
- Usar `.env.example` como template
- JWT_SECRET deve ter no mínimo 32 caracteres
- Em produção, usar variáveis de ambiente do servidor

---

## 📝 Implementação Completa - Frontend

### **Passo 1: Context de Autenticação**

**Arquivo:** `frontend/contexts/auth-context.tsx`

```typescript
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Restaurar sessão do localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")
    const storedRefreshToken = localStorage.getItem("refreshToken")

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
      setRefreshTokenValue(storedRefreshToken)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post("/api/auth/login", {
        email,
        password
      })

      const { user: userData, token: authToken, refreshToken: refToken } = response.data

      // Atualizar estado
      setUser(userData)
      setToken(authToken)
      setRefreshTokenValue(refToken)

      // Persistir no localStorage
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("token", authToken)
      localStorage.setItem("refreshToken", refToken)

      return true
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error("Erro ao fazer login")
    }
  }

  const logout = async () => {
    // Limpar estado
    setUser(null)
    setToken(null)
    setRefreshTokenValue(null)

    // Limpar localStorage
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")

    // Redirecionar
    router.push("/login")
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      if (!refreshTokenValue) return false

      const response = await api.post("/api/auth/refresh-token", {
        refreshToken: refreshTokenValue
      })

      const { token: newToken, refreshToken: newRefreshToken } = response.data

      setToken(newToken)
      setRefreshTokenValue(newRefreshToken)
      localStorage.setItem("token", newToken)
      localStorage.setItem("refreshToken", newRefreshToken)

      return true
    } catch (error) {
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        refreshToken,
        isAuthenticated: !!user,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
```

### **Passo 2: Configuração do Axios**

**Arquivo:** `frontend/lib/api.ts`

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para lidar com erros 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado - limpar e redirecionar
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### **Passo 3: Página de Login com Usuários Sugeridos**

**Arquivo:** `frontend/app/login/page.tsx`

```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShoppingCart, Users, ChevronDown, ChevronUp, Copy, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

// 🔑 USUÁRIOS DE TESTE (ambiente de desenvolvimento)
const TEST_USERS = [
  {
    name: "Administrador Sistema",
    email: "admin@cestas.com",
    password: "Admin@123",
    role: "ADMIN",
    department: "Secretaria Municipal de Administração"
  },
  {
    name: "Coordenador de Compras",
    email: "compras@cestas.com",
    password: "Compras@123",
    role: "ADMIN",
    department: "Diretoria de Compras e Licitações"
  },
  {
    name: "Fiscal de Contratos",
    email: "fiscal@cestas.com",
    password: "Fiscal@123",
    role: "ADMIN",
    department: "Controladoria Geral"
  },
  {
    name: "Secretaria de Saúde",
    email: "saude@cestas.com",
    password: "Saude@123",
    role: "USER",
    department: "Secretaria Municipal de Saúde"
  },
  {
    name: "Secretaria de Educação",
    email: "educacao@cestas.com",
    password: "Educacao@123",
    role: "USER",
    department: "Secretaria Municipal de Educação"
  }
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTestUsersExpanded, setIsTestUsersExpanded] = useState(false)
  const [showAllUsers, setShowAllUsers] = useState(false)
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
  const [error, setError] = useState("")
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Redirecionar se já autenticado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Por favor, preencha email e senha")
      toast.error("Por favor, preencha email e senha")
      return
    }

    setIsLoading(true)

    try {
      await login(email, password)
      toast.success("Login realizado com sucesso!")
      router.push("/dashboard")
    } catch (error: any) {
      const errorMessage = error.message || "Email ou senha inválidos"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Preencher formulário com usuário de teste
  const handleTestUserClick = (user: typeof TEST_USERS[0]) => {
    setEmail(user.email)
    setPassword(user.password)
    toast.success(`Credenciais de ${user.name} preenchidas!`)
  }

  // Copiar para clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado!`)
  }

  // Toggle visibilidade da senha
  const togglePasswordVisibility = (email: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev)
      if (newSet.has(email)) {
        newSet.delete(email)
      } else {
        newSet.add(email)
      }
      return newSet
    })
  }

  const displayedUsers = showAllUsers ? TEST_USERS : TEST_USERS.slice(0, 3)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl flex gap-4 flex-col lg:flex-row">
        {/* 📝 FORMULÁRIO DE LOGIN */}
        <Card className="w-full lg:w-1/2">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-8 w-8" />
                <span className="text-2xl font-bold">Cestas de Compras</span>
              </div>
            </div>
            <CardTitle className="text-2xl">Entrar na sua conta</CardTitle>
            <CardDescription>
              Digite seu email e senha para acessar o sistema
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
                  <p className="font-medium">❌ {error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError("")
                  }}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 👥 CARD DE USUÁRIOS DE TESTE */}
        <Card className="w-full lg:w-1/2">
          <CardHeader
            className="cursor-pointer bg-gradient-to-r from-orange-100 to-yellow-100 hover:from-orange-200 hover:to-yellow-200 transition-colors"
            onClick={() => setIsTestUsersExpanded(!isTestUsersExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle className="text-lg">Usuários de Teste</CardTitle>
              </div>
              {isTestUsersExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>

          {isTestUsersExpanded && (
            <CardContent className="pt-6 space-y-3 max-h-[600px] overflow-y-auto">
              <p className="text-sm text-gray-600 mb-4">
                Clique em um usuário para preencher automaticamente
              </p>

              {displayedUsers.map((user) => (
                <div
                  key={user.email}
                  className="border rounded-lg p-3 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => handleTestUserClick(user)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{user.name}</h4>
                      <p className="text-xs text-gray-600">{user.department}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    {/* Email */}
                    <div className="flex items-center gap-2 group">
                      <span className="text-gray-600">Email:</span>
                      <span className="flex-1 font-mono">{user.email}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(user.email, 'Email')
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Senha */}
                    <div className="flex items-center gap-2 group">
                      <span className="text-gray-600">Senha:</span>
                      <span className="flex-1 font-mono">
                        {visiblePasswords.has(user.email) ? user.password : '••••••••'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePasswordVisibility(user.email)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
                      >
                        {visiblePasswords.has(user.email) ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(user.password, 'Senha')
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {TEST_USERS.length > 3 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAllUsers(!showAllUsers)}
                >
                  {showAllUsers ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Ocultar Outros Usuários
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Mostrar Todos ({TEST_USERS.length})
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
```

### **Passo 4: Layout Protegido**

**Arquivo:** `frontend/app/dashboard/layout.tsx`

```typescript
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main>{children}</main>
    </div>
  )
}
```

---

## 🐛 Problemas Comuns e Soluções

### **Problema 1: Senha não faz hash ou double-hash**

**Sintoma:** Login falha mesmo com senha correta OU senha fica com dois hashes.

**Causa:** Hook `@BeforeInsert/@BeforeUpdate` não verifica se senha já está hasheada.

**Solução:**
```typescript
@BeforeInsert()
@BeforeUpdate()
async hashPassword() {
  // Verificar se senha já está hasheada (bcrypt começa com $2b$)
  if (this.password && !this.password.startsWith('$2b$')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
```

---

### **Problema 2: Token expirado não redireciona**

**Sintoma:** Usuário fica preso em loop de requisições 401.

**Causa:** Interceptor do Axios não limpa localStorage.

**Solução:**
```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Limpar tudo
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      // Redirecionar apenas se não estiver na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

### **Problema 3: Usuários sugeridos só aparecem em produção**

**Sintoma:** Card de usuários não aparece em produção.

**Causa:** Código com check de `NODE_ENV === 'development'`.

**Solução:**
```typescript
// ❌ ERRADO - só mostra em dev
{process.env.NODE_ENV === 'development' && (
  <Card>Usuários de Teste</Card>
)}

// ✅ CORRETO - sempre mostra (ou use variável específica)
{process.env.NEXT_PUBLIC_SHOW_TEST_USERS !== 'false' && (
  <Card>Usuários de Teste</Card>
)}
```

---

### **Problema 4: Redirect loop infinito**

**Sintoma:** Página fica recarregando infinitamente.

**Causa:** `useEffect` sem dependências corretas.

**Solução:**
```typescript
// ❌ ERRADO
useEffect(() => {
  if (!user) router.push('/login')
}, [user]) // Falta isLoading

// ✅ CORRETO
useEffect(() => {
  if (!user && !isLoading) {
    router.push('/login')
  }
}, [user, isLoading, router])
```

---

### **Problema 5: CORS bloqueando requisições**

**Sintoma:** Erro de CORS no browser console.

**Causa:** Backend não configurou CORS corretamente.

**Solução:**
```typescript
// backend/src/server.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true // Importante para cookies/headers
}));
```

---

## 🔄 Adaptações para Outros Projetos

### **Remover Usuários Sugeridos (Produção)**

```typescript
// 1. Criar variável de ambiente
// .env.local
NEXT_PUBLIC_SHOW_TEST_USERS=false

// 2. Condicionar exibição
{process.env.NEXT_PUBLIC_SHOW_TEST_USERS === 'true' && (
  <Card>... usuários de teste ...</Card>
)}
```

### **Adicionar OAuth (Google, GitHub)**

```typescript
// Instalar
npm install next-auth

// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ]
})
```

### **Adicionar 2FA (Autenticação em 2 Fatores)**

```bash
npm install speakeasy qrcode
```

```typescript
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

// Gerar secret
const secret = speakeasy.generateSecret({
  name: 'Seu App',
  issuer: 'Sua Empresa'
});

// Gerar QR Code
const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

// Validar token
const verified = speakeasy.totp.verify({
  secret: secret.base32,
  encoding: 'base32',
  token: userToken,
  window: 2
});
```

### **Trocar localStorage por Cookies Httponly**

```typescript
// Backend - Enviar cookie
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
});

// Frontend - Cookie é enviado automaticamente
// Não precisa de localStorage
```

---

## ✅ Checklist de Implementação

### Backend
- [ ] Entity User criada com bcrypt
- [ ] AuthService com login/register/refresh
- [ ] Middleware de autenticação
- [ ] Rotas de auth configuradas
- [ ] JWT_SECRET definido no .env
- [ ] CORS configurado corretamente
- [ ] Migrations executadas

### Frontend
- [ ] Context de autenticação criado
- [ ] Axios configurado com interceptors
- [ ] Página de login criada
- [ ] Usuários sugeridos implementados
- [ ] Layout protegido criado
- [ ] Auto-redirect após login
- [ ] Toast notifications configuradas
- [ ] AuthProvider no layout raiz

### Testes
- [ ] Login com credenciais válidas funciona
- [ ] Login com credenciais inválidas mostra erro
- [ ] Token é salvo no localStorage
- [ ] Logout limpa localStorage
- [ ] Redirect após login funciona
- [ ] Protected routes bloqueiam sem auth
- [ ] Usuários sugeridos preenchem form
- [ ] Copiar credenciais funciona
- [ ] Mostrar/ocultar senha funciona

---

## 📚 Referências

- [JWT.io](https://jwt.io/) - Decodificador de JWT
- [bcrypt](https://www.npmjs.com/package/bcrypt) - Hash de senhas
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [React Context](https://react.dev/reference/react/useContext)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)

---

## ✅ Conclusão

Este sistema de autenticação fornece uma base sólida e segura para qualquer aplicação Next.js + Express. Os **usuários sugeridos** aceleram significativamente o desenvolvimento, eliminando a necessidade de memorizar credenciais de teste.

**Tempo estimado de implementação:** 3-5 horas (primeira vez), 1-2h (com experiência)

**Segurança:** ✅ Produção-ready com JWT, bcrypt, CORS, middlewares

**Última atualização:** 2025-11-08
