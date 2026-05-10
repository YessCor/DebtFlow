import { supabase } from "@/lib/supabase-client"

export async function loginWithEmailPassword(email: string, password: string) {
  if (!email || !password) {
    return { success: false as const, error: "Completa todos los campos" }
  }

  const { data, error } = await supabase.rpc("login_user", {
    p_email: email,
    p_password: password,
  })

  console.log("RPC result:", { data, error })

  if (error || !data) {
    return { success: false as const, error: "Credenciales inválidas" }
  }

  console.log("User ID from RPC:", data)

  const { data: appUserRow, error: userError } = await supabase
    .from("users")
    .select("id,email,display_name,created_at")
    .eq("id", data)
    .limit(1)
    .single()

  console.log("User query result:", { appUserRow, userError })

  if (userError || !appUserRow) {
    return { success: false as const, error: "Usuario no encontrado" }
  }

  return { success: true as const, data: appUserRow }
}

export async function registerNormalUser(input: {
  name: string
  email: string
  password: string
}) {
  // Registro de usuarios normales en app_users.
  // NOTA: el INSERT debe usar un hash seguro.
  // Sin RPC no podemos hashear en el cliente de forma segura.
  // Por eso, se intenta usar una función RPC si existe.
  // Si no existe, devolvemos error para que lo implementes.

  const { name, email, password } = input

  // 1) Validaciones básicas
  if (!name || !email || !password) {
    return { success: false as const, error: "Completa todos los campos" }
  }

  if (password.length < 8) {
    return { success: false as const, error: "La contraseña debe tener al menos 8 caracteres" }
  }

  // 2) Intenta llamada RPC (debes crearla en Supabase)
  // Función esperada: rpc('app_register_normal_user', { p_name, p_email, p_password })
  // que cree app_users y user_roles(user).
  const { data, error } = await supabase.rpc("register_user", {
    p_name: name,
    p_email: email,
    p_password: password,
  })

  if (error) {
    return { success: false as const, error: error.message || "Error al registrar" }
  }

  // data puede contener el id del usuario o cualquier payload
  return { success: true as const, data }
}


