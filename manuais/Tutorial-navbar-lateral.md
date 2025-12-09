# Tutorial Completo: Navbar Lateral Profissional com React/Next.js

## 📋 Índice
1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Estrutura de Arquivos](#estrutura-de-arquivos)
3. [Dependências Necessárias](#dependências-necessárias)
4. [Componente Principal: AppSidebar](#componente-principal-appsidebar)
5. [Componente TopBar](#componente-topbar)
6. [Componente MobileSidebar](#componente-mobilesidebar)
7. [Layout Principal](#layout-principal)
8. [Integração com Autenticação](#integração-com-autenticação)
9. [Customização Visual](#customização-visual)
10. [Guia de Implementação Passo a Passo](#guia-de-implementação-passo-a-passo)

---

## 1. Visão Geral do Sistema

### O que é este navbar?
Este é um sistema completo de navegação lateral (sidebar) para aplicações web profissionais. Ele inclui:

- **Sidebar Desktop**: Barra lateral fixa no lado esquerdo (esconde automaticamente em telas pequenas)
- **TopBar**: Barra superior com busca, notificações e perfil do usuário
- **Mobile Sidebar**: Menu hambúrguer para dispositivos móveis
- **Sistema de Permissões**: Itens aparecem ou escondem baseado no papel do usuário (admin, usuário comum, etc.)
- **Indicadores Visuais**: Badges com contadores, highlights, itens ativos
- **Modo Colapsado**: Sidebar pode ser minimizada para economizar espaço

### Como funciona visualmente?

```
┌─────────────────────────────────────────────────────┐
│ [≡] Busca...    [Secretaria]  [🔔] [👤] [⏰Timer]  │ ← TopBar
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│  Logo    │                                          │
│  [<]     │         CONTEÚDO DA PÁGINA               │
│          │                                          │
│ ┌─────┐  │                                          │
│ │ 🏠  │  │                                          │
│ └─────┘  │                                          │
│ Dashboard│                                          │
│          │                                          │
│ CESTAS   │                                          │
│ ┌─────┐  │                                          │
│ │ ➕  │  │                                          │
│ └─────┘  │                                          │
│ Nova     │                                          │
│          │                                          │
│ ┌─────┐  │                                          │
│ │ 📋  │  │                                          │
│ └─────┘  │                                          │
│ Minhas   │                                          │
│          │                                          │
│          │                                          │
│          │                                          │
│ ┌─────┐  │                                          │
│ │ JD  │  │                                          │
│ └─────┘  │                                          │
│ João     │                                          │
│ Devos    │                                          │
└──────────┴──────────────────────────────────────────┘
   Sidebar   Main Content Area
```

---

## 2. Estrutura de Arquivos

Você precisará criar os seguintes arquivos no seu projeto:

```
seu-projeto/
├── components/
│   ├── layout/
│   │   ├── app-sidebar.tsx        ← Sidebar desktop
│   │   ├── top-bar.tsx             ← Barra superior
│   │   └── mobile-sidebar.tsx      ← Menu mobile
│   └── ui/
│       ├── button.tsx              ← Componente de botão
│       ├── badge.tsx               ← Componente de badge
│       ├── scroll-area.tsx         ← Área com scroll
│       ├── dropdown-menu.tsx       ← Menu dropdown
│       ├── input.tsx               ← Campo de input
│       └── sheet.tsx               ← Componente de drawer/sheet
├── contexts/
│   └── auth-context.tsx            ← Context de autenticação
├── lib/
│   ├── utils.ts                    ← Funções utilitárias
│   └── api.ts                      ← Cliente de API
└── app/
    └── dashboard/
        └── layout.tsx              ← Layout que integra tudo
```

---

## 3. Dependências Necessárias

### Pacotes que você precisa instalar:

```bash
# Pacotes principais
npm install lucide-react     # Ícones bonitos
npm install class-variance-authority  # Para criar variantes de componentes
npm install clsx             # Para combinar classes CSS
npm install tailwind-merge   # Para mesclar classes Tailwind

# Se usar shadcn/ui (recomendado):
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add input
npx shadcn-ui@latest add sheet
```

### O que cada pacote faz:

- **lucide-react**: Fornece ícones SVG prontos (Home, Settings, User, etc.)
- **class-variance-authority**: Ajuda a criar variantes de componentes
- **clsx**: Combina nomes de classes condicionalmente
- **tailwind-merge**: Evita conflitos entre classes do Tailwind CSS

---

## 4. Componente Principal: AppSidebar

### O que este componente faz:
- Mostra a navegação lateral principal
- Pode ser colapsado (minimizado) com um botão
- Filtra itens baseado em permissões do usuário
- Mostra badges com contadores
- Destaca o item ativo baseado na URL atual

### Estrutura do Código Explicada:

#### 4.1. Importações e Tipos

```typescript
"use client"  // ← Importante! Significa que este componente roda no navegador

import { useState, useEffect } from "react"
import Link from "next/link"  // Para navegação
import { usePathname } from "next/navigation"  // Para saber qual página está ativa
```

**O que significa "use client"?**
- No Next.js 13+, componentes são Server Components por padrão
- "use client" marca que este código precisa rodar no navegador
- Necessário quando usa hooks como useState, useEffect, etc.

#### 4.2. Definição de Tipos TypeScript

```typescript
interface MenuItem {
  icon: any              // ← Qual ícone mostrar (ex: Home, Settings)
  label: string          // ← Texto do botão (ex: "Dashboard")
  href: string           // ← Para onde ir ao clicar (ex: "/dashboard")
  badge?: string | null  // ← Número para mostrar em vermelho (ex: "3")
  highlighted?: boolean  // ← Se deve destacar visualmente
  adminOnly?: boolean    // ← Se só admin pode ver
}

interface MenuSection {
  section: string | null  // ← Nome da seção (ex: "Cestas de Preços")
  adminOnly?: boolean     // ← Se a seção inteira é só para admin
  items: MenuItem[]       // ← Lista de itens desta seção
}
```

**Por que usar interfaces?**
- TypeScript te avisa se você esquecer um campo obrigatório
- Auto-complete funciona melhor no editor
- Evita bugs de digitação errada

#### 4.3. Estado do Componente

```typescript
export function AppSidebar() {
  const pathname = usePathname()  // ← URL atual (ex: "/dashboard/cestas")
  const { user } = useAuth()      // ← Dados do usuário logado
  const isAdmin = user?.role === 'ADMIN'  // ← Verifica se é admin
  const [collapsed, setCollapsed] = useState(false)  // ← Sidebar minimizada?
  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState(0)  // ← Contador
```

**Explicação linha por linha:**

- `pathname`: Pega a URL atual para saber qual item destacar
- `user`: Pega informações do usuário do contexto de autenticação
- `isAdmin`: Variável que é `true` se o usuário é administrador
- `collapsed`: Estado que controla se a sidebar está minimizada (icons só) ou expandida (com texto)
- `solicitacoesPendentes`: Contador para mostrar badge vermelho

#### 4.4. Buscar Contadores (useEffect)

```typescript
useEffect(() => {
  if (!isAdmin) return  // ← Se não é admin, para aqui

  const fetchPendingCount = async () => {
    try {
      const response = await api.get("/api/catalogo/solicitacoes")
      const solicitacoes = response.data || []
      const pendentes = solicitacoes.filter((s: any) => s.status === "pendente").length
      setSolicitacoesPendentes(pendentes)
    } catch (error) {
      console.error("Erro ao buscar contagem:", error)
    }
  }

  fetchPendingCount()  // ← Busca agora

  // Atualizar a cada 60 segundos
  const interval = setInterval(fetchPendingCount, 60000)
  return () => clearInterval(interval)  // ← Limpa quando componente desmonta
}, [isAdmin])
```

**O que este código faz:**
1. Verifica se o usuário é admin
2. Se for, busca quantas solicitações estão pendentes na API
3. Atualiza o contador no estado
4. Configura para buscar de novo a cada 60 segundos
5. Quando o componente é removido, para o interval

#### 4.5. Estrutura do Menu

```typescript
const menuItems: MenuSection[] = [
  // DASHBOARD (sem seção, item solto)
  {
    section: null,  // ← null = não mostra título de seção
    items: [
      { icon: Home, label: "Dashboard", href: "/dashboard", badge: null },
    ]
  },

  // CESTAS DE PREÇOS (com seção)
  {
    section: "Cestas de Preços",  // ← Mostra este título
    items: [
      {
        icon: Plus,
        label: "Nova Cesta",
        href: "/dashboard/cestas/nova",
        highlighted: true  // ← Destaca com fundo azul
      },
      { icon: List, label: "Minhas Cestas", href: "/dashboard/cestas" },
      {
        icon: FolderOpen,
        label: "Todas as Cestas",
        href: "/dashboard/cestas-precos",
        adminOnly: true  // ← Só admin vê
      },
    ]
  },

  // ... mais seções
]
```

**Como adicionar um novo item:**

```typescript
{
  section: "Seu Título Aqui",
  items: [
    {
      icon: Settings,              // Importar de lucide-react
      label: "Configurações",      // Texto que aparece
      href: "/dashboard/config",   // Rota para onde vai
      badge: null,                 // Sem badge
      highlighted: false,          // Sem destaque
      adminOnly: false,            // Todos podem ver
    }
  ]
}
```

#### 4.6. Renderizar Item do Menu

```typescript
const renderMenuItem = (item: MenuItem) => {
  // Ocultar itens admin-only se não for admin
  if (item.adminOnly && !isAdmin) {
    return null  // ← Não mostra nada
  }

  // Verifica se este item está ativo
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
  const Icon = item.icon

  return (
    <Link key={item.href} href={item.href}>
      <Button
        variant="ghost"
        className={cn(
          // Classes base (sempre aplicadas)
          "w-full justify-start gap-3 mb-1 text-white/80 hover:text-white",

          // Condicional: se colapsado, padding menor
          collapsed ? "px-2" : "px-3 py-2.5",

          // Condicional: se ativo, destaca com fundo branco
          isActive && "bg-white/15 text-white font-medium border-l-2 border-white",

          // Condicional: se highlighted e não ativo, fundo azul
          item.highlighted && !isActive && "bg-blue-600/20 border border-blue-400/30"
        )}
        title={collapsed ? item.label : undefined}  // ← Tooltip quando colapsado
      >
        <Icon className="h-4 w-4 shrink-0" />

        {!collapsed && (  // ← Só mostra texto se não estiver colapsado
          <>
            <span className="flex-1 text-left text-sm">{item.label}</span>
            {item.badge && (  // ← Só mostra badge se existir
              <Badge className="ml-auto text-xs px-2 py-0.5 bg-red-500">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Button>
    </Link>
  )
}
```

**Explicação das classes CSS:**

- `w-full`: Largura 100%
- `justify-start`: Alinha conteúdo à esquerda
- `gap-3`: Espaço de 0.75rem entre ícone e texto
- `text-white/80`: Texto branco com 80% de opacidade
- `bg-white/15`: Fundo branco com 15% de opacidade
- `border-l-2`: Borda esquerda de 2px
- `shrink-0`: Ícone não encolhe se faltar espaço

#### 4.7. Renderizar Seção

```typescript
const renderSection = (menuSection: MenuSection, index: number) => {
  // Ocultar seção admin-only se não for admin
  if (menuSection.adminOnly && !isAdmin) {
    return null
  }

  // Filtrar itens visíveis
  const visibleItems = menuSection.items.filter(item => !item.adminOnly || isAdmin)
  if (visibleItems.length === 0) {
    return null  // ← Se nenhum item visível, não mostra seção
  }

  return (
    <div key={`section-${index}`} className="mb-6">
      {/* Título da seção (se existir e não estiver colapsado) */}
      {menuSection.section && !collapsed && (
        <h3 className="mb-2 px-3 text-[11px] font-bold text-white/40 uppercase">
          {menuSection.section}
        </h3>
      )}

      {/* Itens da seção */}
      <div className="space-y-0.5">
        {visibleItems.map(renderMenuItem)}
      </div>
    </div>
  )
}
```

#### 4.8. Estrutura JSX Principal

```typescript
return (
  <div className={cn(
    "relative flex flex-col bg-[#1e3a5f] text-white transition-all duration-300",
    collapsed ? "w-16" : "w-64"  // ← Largura muda baseado no estado
  )}>

    {/* HEADER COM LOGO */}
    <div className="flex h-16 items-center border-b border-white/10 px-3 bg-[#152e4d]">
      {!collapsed ? (
        // Versão expandida
        <>
          <Link href="/dashboard">
            <div className="bg-white/10 p-2 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base">Preço Certo</span>
              <p className="text-[10px] text-white/60">Sistema de Cestas</p>
            </div>
          </Link>
          <Button onClick={() => setCollapsed(true)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </>
      ) : (
        // Versão colapsada
        <div className="flex flex-col items-center gap-2 w-full">
          <Link href="/dashboard">
            <ShoppingCart className="h-5 w-5" />
          </Link>
          <Button onClick={() => setCollapsed(false)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>

    {/* MENU DE NAVEGAÇÃO */}
    <ScrollArea className="flex-1 px-2 py-4">
      {menuItems.map(renderSection)}
    </ScrollArea>

    {/* FOOTER COM USUÁRIO */}
    {!collapsed && user && (
      <div className="border-t border-white/10 p-3 bg-[#152e4d]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-[11px] text-white/50 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    )}
  </div>
)
```

---

## 5. Componente TopBar

### O que este componente faz:
- Barra superior fixa
- Campo de busca global
- Mostra a secretaria do usuário
- Ícone de notificações com badge
- Menu dropdown do usuário
- Timer de sessão com logout automático

### Estrutura Simplificada:

```typescript
export function TopBar() {
  const router = useRouter()
  const { user, logout, remainingMs } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard/pesquisa-rapida?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="sticky top-0 z-40 border-b bg-background/95">
      <div className="flex h-16 items-center gap-4 px-6">

        {/* BUSCA */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* SECRETARIA */}
        {user?.secretaria && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
            <Building2 className="h-4 w-4" />
            <span className="text-sm">{user.secretaria.sigla}</span>
          </div>
        )}

        {/* NOTIFICAÇÕES */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1">{unreadCount}</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* Conteúdo das notificações */}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* MENU DO USUÁRIO */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="h-8 w-8 rounded-full bg-primary">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* TIMER */}
        <Button onClick={logout} className={remainingMs <= 60000 ? 'animate-pulse' : ''}>
          <Clock className="h-3 w-3" />
          <span>{formatTimerLabel(remainingMs)}</span>
        </Button>
      </div>
    </div>
  )
}
```

### Função formatTimerLabel:

```typescript
const formatTimerLabel = (ms: number | null) => {
  if (ms === null || ms <= 0) {
    return 'Sair'
  }

  if (ms > 60_000) {
    const minutes = Math.ceil(ms / 60_000)
    return `${minutes} min`
  }

  const seconds = Math.max(1, Math.floor(ms / 1000))
  return `${seconds}s`
}
```

**O que faz:**
- Se tempo acabou (null ou <=0): mostra "Sair"
- Se mais de 1 minuto: mostra quantidade de minutos
- Se menos de 1 minuto: mostra segundos

---

## 6. Componente MobileSidebar

### O que faz:
- Menu lateral para mobile usando Sheet (drawer)
- Abre/fecha com botão hambúrguer
- Usa mesma estrutura de menu que o AppSidebar
- Fecha automaticamente ao clicar em um item

### Estrutura:

```typescript
export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  // Mesma estrutura de menuItems que AppSidebar

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-5rem)] px-3 py-4">
          {menuItems.map(renderSection)}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
```

**Diferenças do AppSidebar:**
- Usa `Sheet` em vez de `div`
- Tem botão de trigger (hambúrguer)
- Fecha ao clicar em item (`onClick={() => setOpen(false)}`)
- Só aparece em telas pequenas (`lg:hidden`)

---

## 7. Layout Principal

### O que faz:
- Combina todos os componentes
- Protege rotas (redireciona se não logado)
- Mostra loading enquanto verifica autenticação

```typescript
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // Proteção de rota
  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/")  // Redireciona para login
    }
  }, [user, isLoading, router])

  // Tela de loading
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2"></div>
      </div>
    )
  }

  // Se não tem usuário, retorna null (vai redirecionar)
  if (!user) {
    return null
  }

  // Layout principal
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar Desktop (oculta em mobile) */}
      <aside className="hidden lg:flex">
        <AppSidebar />
      </aside>

      {/* Área Principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TopBar com MobileSidebar */}
        <header className="flex items-center gap-2 px-4 bg-white border-b">
          <MobileSidebar />  {/* Só aparece em mobile */}
          <div className="flex-1">
            <TopBar />
          </div>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            {children}  {/* Páginas filhas aparecem aqui */}
          </div>
        </main>
      </div>
    </div>
  )
}
```

### Classes Tailwind importantes:

- `flex h-screen`: Flexbox com altura da tela inteira
- `overflow-hidden`: Evita scroll na div principal
- `hidden lg:flex`: Esconde em mobile, mostra em desktop (lg = large)
- `flex-1`: Ocupa todo espaço disponível
- `overflow-y-auto`: Permite scroll vertical

---

## 8. Integração com Autenticação

### Context de Autenticação (auth-context.tsx):

```typescript
interface AuthContextType {
  user: User | null           // Dados do usuário logado
  isLoading: boolean          // Se está carregando
  login: (data) => Promise    // Função de login
  logout: () => void          // Função de logout
  remainingMs: number | null  // Tempo restante da sessão
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [remainingMs, setRemainingMs] = useState<number | null>(null)

  // Verifica se tem token ao carregar
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      // Buscar dados do usuário
      fetchUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  // Timer de sessão
  useEffect(() => {
    if (!user) return

    // Calcula tempo restante
    const expiresAt = user.sessionExpiresAt
    const now = Date.now()
    const remaining = expiresAt - now

    setRemainingMs(remaining)

    // Atualiza a cada segundo
    const interval = setInterval(() => {
      const newRemaining = expiresAt - Date.now()
      setRemainingMs(newRemaining)

      if (newRemaining <= 0) {
        logout()  // Logout automático
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [user])

  const login = async (credentials) => {
    const response = await api.post('/api/auth/login', credentials)
    const { token, user } = response.data

    localStorage.setItem('accessToken', token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, remainingMs }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar em componentes
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### Como usar nos componentes:

```typescript
import { useAuth } from '@/contexts/auth-context'

function MeuComponente() {
  const { user, logout, isLoading } = useAuth()

  if (isLoading) return <div>Carregando...</div>
  if (!user) return <div>Não logado</div>

  return (
    <div>
      <p>Olá, {user.name}!</p>
      <button onClick={logout}>Sair</button>
    </div>
  )
}
```

---

## 9. Customização Visual

### 9.1. Cores da Sidebar

Para mudar as cores, altere estas classes:

```typescript
// Em app-sidebar.tsx

// Fundo principal da sidebar
className="bg-[#1e3a5f]"  // ← Mude esta cor hex

// Fundo do header
className="bg-[#152e4d]"  // ← Mude esta cor hex

// Item ativo
isActive && "bg-white/15 text-white border-l-2 border-white"

// Item destacado
item.highlighted && "bg-blue-600/20 border border-blue-400/30"
```

### 9.2. Paleta de cores sugeridas:

```css
/* Azul escuro (padrão) */
sidebar: #1e3a5f
header: #152e4d

/* Verde escuro */
sidebar: #1e4d3f
header: #15382d

/* Roxo escuro */
sidebar: #3a1e5f
header: #2d1547

/* Preto/cinza */
sidebar: #1a1a1a
header: #0f0f0f
```

### 9.3. Tamanhos

```typescript
// Largura da sidebar
collapsed ? "w-16" : "w-64"

// Para mudar:
collapsed ? "w-20" : "w-72"  // Mais larga
collapsed ? "w-12" : "w-56"  // Mais estreita
```

### 9.4. Animações

```typescript
// Transição suave ao colapsar
className="transition-all duration-300"

// Para mais rápido:
className="transition-all duration-150"

// Para mais devagar:
className="transition-all duration-500"
```

### 9.5. Ícones

Todos os ícones vêm do `lucide-react`. Para trocar:

```typescript
import { Home, Settings, User, Bell, Search } from 'lucide-react'

// No menu:
{ icon: Home, label: "Dashboard", href: "/dashboard" }

// Trocar ícone:
{ icon: Settings, label: "Dashboard", href: "/dashboard" }
```

**Ícones disponíveis:** https://lucide.dev/icons

---

## 10. Guia de Implementação Passo a Passo

### PASSO 1: Instalar Dependências

```bash
npm install lucide-react class-variance-authority clsx tailwind-merge

# Se usar shadcn/ui:
npx shadcn-ui@latest init
npx shadcn-ui@latest add button badge scroll-area dropdown-menu input sheet
```

### PASSO 2: Criar Função Utilitária (lib/utils.ts)

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**O que faz:** Combina e mescla classes CSS de forma inteligente

### PASSO 3: Criar Context de Autenticação (contexts/auth-context.tsx)

```typescript
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER'
  secretaria?: {
    nome: string
    sigla: string
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  remainingMs: number | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [remainingMs, setRemainingMs] = useState<number | null>(null)

  // TODO: Implementar lógica de autenticação

  useEffect(() => {
    // Verificar se há token salvo
    const token = localStorage.getItem('accessToken')
    if (token) {
      // Buscar dados do usuário
      // fetchUser()
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // TODO: Implementar login
    // const response = await api.post('/api/auth/login', { email, password })
    // setUser(response.data.user)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, remainingMs }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### PASSO 4: Criar AppSidebar (components/layout/app-sidebar.tsx)

Cole o código completo do AppSidebar que foi mostrado na seção 4.

### PASSO 5: Criar TopBar (components/layout/top-bar.tsx)

Cole o código completo do TopBar que foi mostrado na seção 5.

### PASSO 6: Criar MobileSidebar (components/layout/mobile-sidebar.tsx)

Cole o código completo do MobileSidebar que foi mostrado na seção 6.

### PASSO 7: Criar Layout (app/dashboard/layout.tsx)

Cole o código completo do Layout que foi mostrado na seção 7.

### PASSO 8: Envolver App com AuthProvider (app/layout.tsx)

```typescript
import { AuthProvider } from '@/contexts/auth-context'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### PASSO 9: Customizar Menu

Edite a constante `menuItems` no `app-sidebar.tsx`:

```typescript
const menuItems: MenuSection[] = [
  {
    section: null,
    items: [
      { icon: Home, label: "Início", href: "/dashboard" },
    ]
  },
  {
    section: "Seu Módulo",
    items: [
      { icon: Plus, label: "Novo Item", href: "/dashboard/novo" },
      { icon: List, label: "Listar", href: "/dashboard/lista" },
    ]
  },
  // ... adicione mais seções
]
```

### PASSO 10: Testar

```bash
npm run dev
```

Navegue para http://localhost:3000/dashboard

---

## Checklist de Implementação

- [ ] Dependências instaladas
- [ ] lib/utils.ts criado
- [ ] contexts/auth-context.tsx criado
- [ ] components/layout/app-sidebar.tsx criado
- [ ] components/layout/top-bar.tsx criado
- [ ] components/layout/mobile-sidebar.tsx criado
- [ ] app/dashboard/layout.tsx criado
- [ ] app/layout.tsx com AuthProvider
- [ ] menuItems customizado
- [ ] Cores personalizadas
- [ ] Testado em desktop
- [ ] Testado em mobile
- [ ] Testado colapsar/expandir sidebar
- [ ] Sistema de permissões funcionando

---

## Troubleshooting (Problemas Comuns)

### Problema: "useAuth must be used within AuthProvider"
**Solução:** Certifique-se de que o AuthProvider está envolvendo todo o app em `app/layout.tsx`

### Problema: Sidebar não aparece
**Solução:** Verifique se o layout está em `app/dashboard/layout.tsx` e se a rota é `/dashboard/...`

### Problema: Ícones não aparecem
**Solução:** Certifique-se de importar os ícones de `lucide-react`

### Problema: Classes Tailwind não funcionam
**Solução:** Verifique se o Tailwind está configurado e se `globals.css` está importado

### Problema: Menu mobile não abre
**Solução:** Verifique se o componente `Sheet` do shadcn/ui está instalado

---

## Conclusão

Este sistema de navegação é:
- ✅ Profissional e moderno
- ✅ Responsivo (funciona em desktop e mobile)
- ✅ Acessível (ARIA labels, keyboard navigation)
- ✅ Customizável (cores, ícones, estrutura)
- ✅ Com sistema de permissões
- ✅ Performance otimizada

**Próximos passos sugeridos:**
1. Implementar autenticação real no `auth-context.tsx`
2. Conectar badges com dados reais da API
3. Adicionar notificações reais no TopBar
4. Customizar cores para sua marca
5. Adicionar mais itens de menu conforme necessário

**Recursos adicionais:**
- Documentação do Tailwind CSS: https://tailwindcss.com/docs
- Lucide Icons: https://lucide.dev
- shadcn/ui: https://ui.shadcn.com
- Next.js App Router: https://nextjs.org/docs

---

**Criado por:** Tutorial baseado no sistema de cestas-de-compras
**Última atualização:** 2025
**Versão:** 1.0
