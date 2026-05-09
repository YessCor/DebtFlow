export type UserRole = "admin" | "user"

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  avatar: string
  phone?: string
  address?: string
  status: "active" | "inactive"
  createdAt: string
}

export interface Debt {
  id: string
  userId: string
  category: "credit_card" | "personal_loan" | "mortgage" | "auto" | "other"
  description: string
  originalAmount: number
  paidAmount: number
  interestRate: number
  startDate: string
  dueDate: string
  status: "pending" | "paid" | "overdue" | "negotiation"
  notes?: string
}

export interface Income {
  id: string
  userId: string
  source: "salary" | "freelance" | "investment" | "business" | "gift" | "other"
  description: string
  amount: number
  date: string
  recurring: boolean
  recurringPeriod?: "weekly" | "biweekly" | "monthly" | "yearly"
  notes?: string
  createdAt: string
}

export interface LoanGiven {
  id: string
  lenderId: string
  borrowerName: string
  borrowerContact?: string
  principalAmount: number
  interestRate: number
  totalAmount: number
  paidAmount: number
  startDate: string
  dueDate: string
  status: "active" | "paid" | "overdue" | "partial"
  payments: {
    id: string
    amount: number
    date: string
    notes?: string
  }[]
  notes?: string
  createdAt: string
}

export interface Payment {
  id: string
  debtId: string
  userId: string
  amount: number
  date: string
  method: "transfer" | "cash" | "card" | "check"
  receipt?: string
  status: "confirmed" | "pending"
  notes?: string
}

export interface Notification {
  id: string
  userId: string
  type: "due_soon" | "overdue" | "payment_confirmed" | "admin_message"
  title: string
  message: string
  read: boolean
  createdAt: string
  debtId?: string
}

export interface Activity {
  id: string
  userId: string
  action: string
  description: string
  createdAt: string
}

// Users
export const users: User[] = [
  {
    id: "1",
    name: "Administrador",
    email: "admin@debtflow.com",
    password: "admin123",
    role: "admin",
    avatar: "/avatars/admin.png",
    phone: "+1 234 567 890",
    status: "active",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Juan Pérez",
    email: "user@debtflow.com",
    password: "user123",
    role: "user",
    avatar: "/avatars/user1.png",
    phone: "+1 234 567 891",
    address: "Calle Principal 123, Ciudad",
    status: "active",
    createdAt: "2024-02-15",
  },
  {
    id: "3",
    name: "María García",
    email: "usuario2@debtflow.com",
    password: "user123",
    role: "user",
    avatar: "/avatars/user2.png",
    phone: "+1 234 567 892",
    address: "Avenida Central 456, Ciudad",
    status: "active",
    createdAt: "2024-03-10",
  },
  {
    id: "4",
    name: "Carlos López",
    email: "usuario3@debtflow.com",
    password: "user123",
    role: "user",
    avatar: "/avatars/user3.png",
    phone: "+1 234 567 893",
    address: "Boulevard Norte 789, Ciudad",
    status: "inactive",
    createdAt: "2024-04-20",
  },
]

// Debts
export const debts: Debt[] = [
  {
    id: "002",
    userId: "2",
    category: "personal_loan",
    description: "Préstamo Banco Nacional",
    originalAmount: 12000,
    paidAmount: 3000,
    interestRate: 12.0,
    startDate: "2024-03-01",
    dueDate: "2025-03-01",
    status: "pending",
    notes: "Cuotas mensuales de $500",
  },
  {
    id: "003",
    userId: "3",
    category: "mortgage",
    description: "Hipoteca Casa Principal",
    originalAmount: 85000,
    paidAmount: 15000,
    interestRate: 8.5,
    startDate: "2023-06-01",
    dueDate: "2043-06-01",
    status: "negotiation",
    notes: "En proceso de reestructuración",
  },
  {
    id: "004",
    userId: "4",
    category: "auto",
    description: "Financiamiento Toyota Corolla",
    originalAmount: 18500,
    paidAmount: 18500,
    interestRate: 10.0,
    startDate: "2022-01-15",
    dueDate: "2024-11-15",
    status: "paid",
    notes: "Completado antes de tiempo",
  },
  {
    id: "005",
    userId: "2",
    category: "other",
    description: "Deuda Tienda Departamental",
    originalAmount: 2300,
    paidAmount: 800,
    interestRate: 24.0,
    startDate: "2024-10-01",
    dueDate: "2025-01-07",
    status: "pending",
    notes: "Compras de temporada",
  },
  {
    id: "006",
    userId: "3",
    category: "credit_card",
    description: "Tarjeta Mastercard Platinum",
    originalAmount: 8500,
    paidAmount: 2000,
    interestRate: 21.0,
    startDate: "2024-05-01",
    dueDate: "2025-05-01",
    status: "pending",
  },
  {
    id: "007",
    userId: "4",
    category: "personal_loan",
    description: "Préstamo Cooperativa",
    originalAmount: 5000,
    paidAmount: 1000,
    interestRate: 15.0,
    startDate: "2024-08-01",
    dueDate: "2025-08-01",
    status: "overdue",
  },
]

// Payments
export const payments: Payment[] = [
  {
    id: "p001",
    debtId: "001",
    userId: "2",
    amount: 500,
    date: "2024-11-15",
    method: "transfer",
    status: "confirmed",
    notes: "Pago mensual",
  },
  {
    id: "p002",
    debtId: "001",
    userId: "2",
    amount: 500,
    date: "2024-10-15",
    method: "transfer",
    status: "confirmed",
  },
  {
    id: "p003",
    debtId: "001",
    userId: "2",
    amount: 500,
    date: "2024-09-15",
    method: "card",
    status: "confirmed",
  },
  {
    id: "p004",
    debtId: "002",
    userId: "2",
    amount: 1000,
    date: "2024-11-01",
    method: "transfer",
    status: "confirmed",
  },
  {
    id: "p005",
    debtId: "002",
    userId: "2",
    amount: 1000,
    date: "2024-10-01",
    method: "transfer",
    status: "confirmed",
  },
  {
    id: "p006",
    debtId: "002",
    userId: "2",
    amount: 1000,
    date: "2024-09-01",
    method: "cash",
    status: "confirmed",
  },
  {
    id: "p007",
    debtId: "005",
    userId: "2",
    amount: 400,
    date: "2024-11-20",
    method: "card",
    status: "confirmed",
  },
  {
    id: "p008",
    debtId: "005",
    userId: "2",
    amount: 400,
    date: "2024-10-20",
    method: "card",
    status: "confirmed",
  },
  {
    id: "p009",
    debtId: "003",
    userId: "3",
    amount: 2500,
    date: "2024-11-05",
    method: "transfer",
    status: "confirmed",
  },
  {
    id: "p010",
    debtId: "004",
    userId: "4",
    amount: 2000,
    date: "2024-10-15",
    method: "transfer",
    status: "confirmed",
  },
]

// Incomes
export const incomes: Income[] = [
  {
    id: "inc001",
    userId: "2",
    source: "salary",
    description: "Salario Mensual",
    amount: 45000,
    date: "2024-12-01",
    recurring: true,
    recurringPeriod: "monthly",
    createdAt: "2024-01-01",
  },
  {
    id: "inc002",
    userId: "2",
    source: "freelance",
    description: "Proyecto Web Cliente",
    amount: 15000,
    date: "2024-11-15",
    recurring: false,
    createdAt: "2024-11-15",
  },
  {
    id: "inc003",
    userId: "2",
    source: "investment",
    description: "Dividendos Fondo Indexado",
    amount: 3500,
    date: "2024-10-30",
    recurring: true,
    recurringPeriod: "quarterly",
    createdAt: "2024-01-01",
  },
  {
    id: "inc004",
    userId: "3",
    source: "business",
    description: "Ventas Tienda Online",
    amount: 28000,
    date: "2024-11-20",
    recurring: false,
    createdAt: "2024-11-20",
  },
]

// Loans Given (Préstamos que el usuario presta a otros)
export const loansGiven: LoanGiven[] = [
  {
    id: "lg001",
    lenderId: "2",
    borrowerName: "Roberto Hernández",
    borrowerContact: "roberto@email.com",
    principalAmount: 10000,
    interestRate: 10,
    totalAmount: 11000,
    paidAmount: 3000,
    startDate: "2024-06-01",
    dueDate: "2025-06-01",
    status: "active",
    payments: [
      { id: "lgp001", amount: 1500, date: "2024-09-01", notes: "Primer pago parcial" },
      { id: "lgp002", amount: 1500, date: "2024-11-01", notes: "Segundo pago parcial" },
    ],
    notes: "Préstamo con 10% de interés anual",
    createdAt: "2024-06-01",
  },
  {
    id: "lg002",
    lenderId: "2",
    borrowerName: "Ana Martínez",
    borrowerContact: "+52 55 9876 5432",
    principalAmount: 5000,
    interestRate: 15,
    totalAmount: 5750,
    paidAmount: 5750,
    startDate: "2024-01-15",
    dueDate: "2024-07-15",
    status: "paid",
    payments: [
      { id: "lgp003", amount: 2875, date: "2024-04-15" },
      { id: "lgp004", amount: 2875, date: "2024-07-10" },
    ],
    createdAt: "2024-01-15",
  },
  {
    id: "lg003",
    lenderId: "3",
    borrowerName: "Pedro Sánchez",
    borrowerContact: "+52 55 1111 2222",
    principalAmount: 20000,
    interestRate: 12,
    totalAmount: 22400,
    paidAmount: 0,
    startDate: "2024-11-01",
    dueDate: "2025-11-01",
    status: "active",
    payments: [],
    notes: "Préstamo para negocio",
    createdAt: "2024-11-01",
  },
]

// Notifications
export const notifications: Notification[] = [
  {
    id: "n001",
    userId: "2",
    type: "overdue",
    title: "Deuda Vencida",
    message: "Tu deuda de Tarjeta Visa Gold está vencida. Por favor realiza el pago lo antes posible.",
    read: false,
    createdAt: "2024-12-02",
    debtId: "001",
  },
  {
    id: "n002",
    userId: "2",
    type: "due_soon",
    title: "Próximo Vencimiento",
    message: "Tu deuda de Tienda Departamental vence en 7 días.",
    read: false,
    createdAt: "2024-12-20",
    debtId: "005",
  },
  {
    id: "n003",
    userId: "2",
    type: "payment_confirmed",
    title: "Pago Confirmado",
    message: "Tu pago de $500 para Tarjeta Visa Gold ha sido confirmado.",
    read: true,
    createdAt: "2024-11-15",
    debtId: "001",
  },
  {
    id: "n004",
    userId: "2",
    type: "admin_message",
    title: "Mensaje del Administrador",
    message: "Recuerda mantener tus pagos al día para evitar intereses adicionales.",
    read: true,
    createdAt: "2024-11-10",
  },
  {
    id: "n005",
    userId: "3",
    type: "admin_message",
    title: "Negociación en Proceso",
    message: "Tu solicitud de reestructuración de hipoteca está siendo procesada.",
    read: false,
    createdAt: "2024-11-25",
    debtId: "003",
  },
]

// Recent Activities
export const activities: Activity[] = [
  {
    id: "a001",
    userId: "2",
    action: "payment",
    description: "Juan Pérez realizó un pago de $500",
    createdAt: "2024-11-15T10:30:00",
  },
  {
    id: "a002",
    userId: "3",
    action: "debt_created",
    description: "Nueva deuda registrada para María García",
    createdAt: "2024-11-14T14:20:00",
  },
  {
    id: "a003",
    userId: "4",
    action: "debt_paid",
    description: "Carlos López completó el pago de su auto",
    createdAt: "2024-11-13T09:15:00",
  },
  {
    id: "a004",
    userId: "2",
    action: "profile_update",
    description: "Juan Pérez actualizó su perfil",
    createdAt: "2024-11-12T16:45:00",
  },
  {
    id: "a005",
    userId: "3",
    action: "negotiation",
    description: "María García solicitó negociación de hipoteca",
    createdAt: "2024-11-11T11:00:00",
  },
]

// Chart Data
export const monthlyTrendData = [
  { month: "Ene", created: 12000, paid: 8000 },
  { month: "Feb", created: 15000, paid: 10000 },
  { month: "Mar", created: 18000, paid: 12000 },
  { month: "Abr", created: 14000, paid: 15000 },
  { month: "May", created: 20000, paid: 18000 },
  { month: "Jun", created: 22000, paid: 20000 },
  { month: "Jul", created: 19000, paid: 22000 },
  { month: "Ago", created: 25000, paid: 21000 },
  { month: "Sep", created: 23000, paid: 24000 },
  { month: "Oct", created: 28000, paid: 26000 },
  { month: "Nov", created: 30000, paid: 28000 },
  { month: "Dic", created: 26000, paid: 30000 },
]

export const statusDistribution = [
  { name: "Pendiente", value: 45, color: "#1A56DB" },
  { name: "Pagada", value: 25, color: "#10B981" },
  { name: "Vencida", value: 20, color: "#EF4444" },
  { name: "En Negociación", value: 10, color: "#F59E0B" },
]

export const categoryDistribution = [
  { category: "Tarjeta de Crédito", amount: 85000 },
  { category: "Préstamo Personal", amount: 65000 },
  { category: "Hipoteca", amount: 120000 },
  { category: "Auto", amount: 45000 },
  { category: "Otro", amount: 25000 },
]

export const monthlyPayments = [
  { month: "Jul", amount: 18000 },
  { month: "Ago", amount: 21000 },
  { month: "Sep", amount: 24000 },
  { month: "Oct", amount: 26000 },
  { month: "Nov", amount: 28000 },
  { month: "Dic", amount: 30000 },
]

// Admin KPIs
export const adminKPIs = {
  totalDebts: 47,
  totalPendingAmount: 284500,
  overdueDebts: 8,
  activeUsers: 23,
  monthlyGrowth: 12.5,
  collectionRate: 78.5,
}

// Helper Functions
export const getCategoryLabel = (category: Debt["category"]) => {
  const labels: Record<Debt["category"], string> = {
    credit_card: "Tarjeta de Crédito",
    personal_loan: "Préstamo Personal",
    mortgage: "Hipoteca",
    auto: "Auto",
    other: "Otro",
  }
  return labels[category]
}

export const getStatusLabel = (status: Debt["status"]) => {
  const labels: Record<Debt["status"], string> = {
    pending: "Pendiente",
    paid: "Pagada",
    overdue: "Vencida",
    negotiation: "En Negociación",
  }
  return labels[status]
}

export const getStatusColor = (status: Debt["status"]) => {
  const colors: Record<Debt["status"], string> = {
    pending: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    negotiation: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  }
  return colors[status]
}

export const getPaymentMethodLabel = (method: Payment["method"]) => {
  const labels: Record<Payment["method"], string> = {
    transfer: "Transferencia",
    cash: "Efectivo",
    card: "Tarjeta",
    check: "Cheque",
  }
  return labels[method]
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Hace un momento"
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`
  if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`
  return formatDate(dateString)
}

export const getUserById = (id: string) => users.find((u) => u.id === id)
export const getDebtById = (id: string) => debts.find((d) => d.id === id)
export const getDebtsByUserId = (userId: string) => debts.filter((d) => d.userId === userId)
export const getPaymentsByDebtId = (debtId: string) => payments.filter((p) => p.debtId === debtId)
export const getPaymentsByUserId = (userId: string) => payments.filter((p) => p.userId === userId)
export const getNotificationsByUserId = (userId: string) => notifications.filter((n) => n.userId === userId)
export const getIncomesByUserId = (userId: string) => incomes.filter((i) => i.userId === userId)
export const getLoansGivenByUserId = (userId: string) => loansGiven.filter((l) => l.lenderId === userId)
export const getIncomeById = (id: string) => incomes.find((i) => i.id === id)
export const getLoanGivenById = (id: string) => loansGiven.find((l) => l.id === id)

export const getIncomeSourceLabel = (source: Income["source"]) => {
  const labels: Record<Income["source"], string> = {
    salary: "Salario",
    freelance: "Freelance",
    investment: "Inversión",
    business: "Negocio",
    gift: "Regalo",
    other: "Otro",
  }
  return labels[source]
}

export const getLoanGivenStatusLabel = (status: LoanGiven["status"]) => {
  const labels: Record<LoanGiven["status"], string> = {
    active: "Activo",
    paid: "Pagado",
    overdue: "Vencido",
    partial: "Parcial",
  }
  return labels[status]
}

export const getLoanGivenStatusColor = (status: LoanGiven["status"]) => {
  const colors: Record<LoanGiven["status"], string> = {
    active: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    partial: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  }
  return colors[status]
}
