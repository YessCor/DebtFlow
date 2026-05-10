import { supabase } from "@/lib/supabase-client"

export interface DbUser {
  id: string
  email: string
  display_name: string | null
  created_at: string
}

export interface DbUserRole {
  user_id: string
  role: string
}

export interface DbPerson {
  id: string
  owner_id: string
  name: string
  document_id: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  created_at: string
}

export interface DbLoan {
  id: string
  owner_id: string
  counterparty_id: string
  direction: "given" | "received"
  category_id: string | null
  title: string | null
  description: string | null
  principal_amount: number
  interest_rate: number
  currency: string
  status: "active" | "closed" | "canceled"
  started_on: string | null
  due_on: string | null
  notes: string | null
  created_at: string
}

export interface DbPayment {
  id: string
  owner_id: string
  loan_id: string
  amount: number
  currency: string
  status: "pending" | "paid" | "failed" | "canceled"
  paid_on: string
  reference: string | null
  method: string | null
  notes: string | null
  created_at: string
}

export interface DbNotification {
  id: string
  owner_id: string
  title: string
  body: string | null
  kind: string
  payload: Record<string, unknown> | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface DbCategory {
  id: string
  owner_id: string
  name: string
  color: string | null
  icon: string | null
  created_at: string
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, display_name, created_at")
    .order("created_at", { ascending: false })

  if (error) throw error

  const usersWithRoles = await Promise.all(
    (data || []).map(async (user) => {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle()

      return {
        ...user,
        role: roleData?.role || "user",
      }
    })
  )

  return usersWithRoles
}

export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, display_name, created_at")
    .eq("id", userId)
    .single()

  if (error) throw error

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle()

  return { ...data, role: roleData?.role || "user" }
}

export async function getAllLoans() {
  const { data, error } = await supabase
    .from("loans")
    .select(`
      *,
      people:counterparty_id(name),
      categories:category_id(name, color)
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getLoansByUserId(userId: string) {
  const { data, error } = await supabase
    .from("loans")
    .select(`
      *,
      people:counterparty_id(name),
      categories:category_id(name, color)
    `)
    .eq("owner_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getAllPayments() {
  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      loans:loan_id(title, owner_id)
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getPaymentsByLoanId(loanId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("loan_id", loanId)
    .order("paid_on", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getAllPeople() {
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw error
  return data || []
}

export async function getAllCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw error
  return data || []
}

export async function getAllNotifications() {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getNotificationsByUserId(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getAdminStats() {
  const [usersResult, loansResult, paymentsResult, notificationsResult] = await Promise.all([
    supabase.from("users").select("id", { count: "exact" }),
    supabase.from("loans").select("id, status, principal_amount"),
    supabase.from("payments").select("id, amount, status"),
    supabase.from("notifications").select("id, is_read"),
  ])

  const totalUsers = usersResult.count || 0
  
  const loans = loansResult.data || []
  const totalLoans = loans.length
  const activeLoans = loans.filter(l => l.status === "active").length
  const totalPending = loans
    .filter(l => l.status === "active")
    .reduce((sum, l) => sum + Number(l.principal_amount), 0)
  
  const payments = paymentsResult.data || []
  const totalPaid = payments
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0)
  
  const unreadNotifications = (notificationsResult.data || []).filter(n => !n.is_read).length

  return {
    totalUsers,
    totalLoans,
    activeLoans,
    totalPending,
    totalPaid,
    unreadNotifications,
  }
}

export async function createLoan(loan: Partial<DbLoan>) {
  const { data, error } = await supabase
    .from("loans")
    .insert(loan)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateLoan(id: string, loan: Partial<DbLoan>) {
  const { data, error } = await supabase
    .from("loans")
    .update(loan)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteLoan(id: string) {
  const { error } = await supabase
    .from("loans")
    .delete()
    .eq("id", id)

  if (error) throw error
}

export async function createPayment(payment: Partial<DbPayment>) {
  const { data, error } = await supabase
    .from("payments")
    .insert(payment)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createPerson(person: Partial<DbPerson>) {
  const { data, error } = await supabase
    .from("people")
    .insert(person)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createCategory(category: Partial<DbCategory>) {
  const { data, error } = await supabase
    .from("categories")
    .insert(category)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw error
}

export interface SystemSetting {
  id: string
  key: string
  value: string
  description: string | null
  category: string
  created_at: string
  updated_at: string
}

export async function getSystemSettings() {
  const { data, error } = await supabase
    .from("system_settings")
    .select("*")
    .order("category", { ascending: true })

  if (error) {
    console.error("Error fetching system settings:", error)
    return []
  }
  
  if (!data || data.length === 0) {
    console.log("No settings found, inserting defaults...")
    await initializeDefaultSettings()
    return getSystemSettings()
  }
  
  return data || []
}

async function initializeDefaultSettings() {
  const defaults = [
    { key: "company_name", value: "DebtFlow Pro", description: "Nombre de la empresa", category: "general" },
    { key: "currency", value: "USD", description: "Moneda por defecto", category: "general" },
    { key: "timezone", value: "America/Bogota", description: "Zona horaria", category: "general" },
    { key: "email_overdue", value: "true", description: "Notificar deudas vencidas", category: "notifications" },
    { key: "email_reminder", value: "true", description: "Recordatorios de pago", category: "notifications" },
    { key: "email_new_user", value: "false", description: "Notificar nuevos usuarios", category: "notifications" },
    { key: "min_password_length", value: "8", description: "Longitud mínima de contraseña", category: "security" },
    { key: "session_timeout", value: "30", description: "Tiempo de sesión en minutos", category: "security" },
    { key: "two_factor_enabled", value: "false", description: "Habilitar 2FA", category: "security" },
    { key: "webhook_url", value: "", description: "URL del webhook", category: "integrations" },
  ]
  
  for (const setting of defaults) {
    await supabase.from("system_settings").upsert({
      key: setting.key,
      value: setting.value,
      description: setting.description,
      category: setting.category,
    }, { onConflict: "key" })
  }
}

export async function getSystemSettingsByCategory(category: string) {
  const { data, error } = await supabase
    .from("system_settings")
    .select("*")
    .eq("category", category)
    .order("key", { ascending: true })

  if (error) throw error
  return data || []
}

export async function updateSystemSetting(key: string, value: string) {
  const { data, error } = await supabase
    .from("system_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSystemSettings(settings: { key: string; value: string }[]) {
  const updates = settings.map(async (setting) => {
    const { error } = await supabase
      .from("system_settings")
      .update({ value: setting.value, updated_at: new Date().toISOString() })
      .eq("key", setting.key)

    if (error) throw error
  })

  await Promise.all(updates)
}

export interface DbIncome {
  id: string
  owner_id: string
  source: string
  description: string
  amount: number
  date: string
  recurring: boolean
  recurring_period: string | null
  notes: string | null
  created_at: string
}

export async function getIncomesByUserId(userId: string) {
  const { data, error } = await supabase
    .from("incomes")
    .select("*")
    .eq("owner_id", userId)
    .order("date", { ascending: false })

  if (error) throw error
  return data || []
}

export async function createIncome(income: Partial<DbIncome>) {
  const { data, error } = await supabase
    .from("incomes")
    .insert(income)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateIncome(id: string, income: Partial<DbIncome>) {
  const { data, error } = await supabase
    .from("incomes")
    .update(income)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteIncome(id: string) {
  const { error } = await supabase
    .from("incomes")
    .delete()
    .eq("id", id)

  if (error) throw error
}

export async function updateUserProfile(userId: string, data: { display_name?: string; email?: string }) {
  const { data: updated, error } = await supabase
    .from("users")
    .update({
      display_name: data.display_name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single()

  if (error) throw error
  return updated
}