<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user' // ⬅️ IMPORTAR userStore
import axios from 'axios'


// Interfaces tipadas
interface RegisterForm {
  user_ID: string
  name: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

interface ApiResponse {
  message: string
  token: string
  refreshToken: string
  user: {
    user_ID: string
    name: string
    lastName: string
    email: string
  }
}

interface ApiError {
  error: string
  message?: string
  required?: string[]
}

// Refs tipados
const form = ref<RegisterForm>({
  user_ID: '',
  name: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref<boolean>(false)
const error = ref<string>('')
const router = useRouter()
const userStore = useUserStore() // ⬅️ INICIALIZAR userStore

// Función para generar user_ID único
const generateUserId = (): string => {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `USER${timestamp}${random}`
}

// Función de validación
const validateForm = (): boolean => {
  error.value = ''

  if (!form.value.name.trim()) {
    error.value = 'Name is required'
    return false
  }

  if (!form.value.lastName.trim()) {
    error.value = 'Last name is required'
    return false
  }

  if (!form.value.email.trim()) {
    error.value = 'Email is required'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.email)) {
    error.value = 'Please enter a valid email address'
    return false
  }

  if (form.value.password.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    return false
  }

  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match'
    return false
  }

  return true
}

// Función de registro
const register = async (): Promise<void> => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Generar user_ID único si no se proporcionó
    if (!form.value.user_ID.trim()) {
      form.value.user_ID = generateUserId()
    }

    // Preparar datos para el API (sin confirmPassword)
    const registerData = {
      user_ID: form.value.user_ID.trim(),
      name: form.value.name.trim(),
      lastName: form.value.lastName.trim(),
      email: form.value.email.trim().toLowerCase(),
      password: form.value.password
    }

    console.log('Registering user with data:', { ...registerData, password: '[HIDDEN]' })

    // Llamada al API - CORREGIR URL
    const response = await axios.post<ApiResponse>(
      'http://10.56.10.111:3001/auth/register',
      registerData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('Registration successful:', response.data)

    // Guardar tokens en localStorage
    localStorage.setItem('authToken', response.data.token)
    localStorage.setItem('refreshToken', response.data.refreshToken)
    
    // Guardar información del usuario
    localStorage.setItem('user', JSON.stringify(response.data.user))
    
    // ⬅️ ESTABLECER usuario en el store
    userStore.setUser(response.data.user)

    // Limpiar formulario
    clearForm()

    // Redirigir al dashboard
    await router.push('/dashboard')

  } catch (err) {
    console.error('Registration error:', err)
    
    if (axios.isAxiosError(err) && err.response?.data) {
      const apiError: ApiError = err.response.data
      error.value = apiError.message || apiError.error || 'Registration failed'
    } else if (err instanceof Error) {
      error.value = `Network error: ${err.message}`
    } else {
      error.value = 'An unexpected error occurred. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

// Función para limpiar el formulario
const clearForm = (): void => {
  form.value = {
    user_ID: '',
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  }
}

// Función para ir al login
const goToLogin = (): void => {
  router.push('/login')
}
</script>

<template>      
  <div class="register-container">
    <h2>Create Account</h2>
    
    <!-- Mensaje de error -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <form @submit.prevent="register">
      <div>
        <label for="user_ID">User ID (optional):</label>
        <input 
          type="text" 
          id="user_ID" 
          v-model="form.user_ID" 
          placeholder="Leave empty to auto-generate"
        />
        <small>If left empty, a unique ID will be generated for you</small>
      </div>

      <div>
        <label for="name">First Name:</label>
        <input 
          type="text" 
          id="name" 
          v-model="form.name" 
          required 
          :disabled="loading"
          placeholder="Enter your first name"
        />    
      </div>

      <div>
        <label for="lastName">Last Name:</label>
        <input 
          type="text" 
          id="lastName" 
          v-model="form.lastName" 
          required 
          :disabled="loading"
          placeholder="Enter your last name"
        />
      </div>

      <div>
        <label for="email">Email:</label>
        <input 
          type="email" 
          id="email" 
          v-model="form.email" 
          required 
          :disabled="loading"
          placeholder="Enter your email address"
        />
      </div>

      <div>
        <label for="password">Password:</label>
        <input 
          type="password" 
          id="password" 
          v-model="form.password" 
          required 
          :disabled="loading"
          placeholder="Enter password (min. 6 characters)"
          minlength="6"
        />
      </div>

      <div>
        <label for="confirmPassword">Confirm Password:</label>
        <input 
          type="password" 
          id="confirmPassword" 
          v-model="form.confirmPassword" 
          required 
          :disabled="loading"
          placeholder="Confirm your password"
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Creating Account...' : 'Create Account' }}
      </button>
    </form>

    <div class="login-link">
      <p>Already have an account? 
        <button @click="goToLogin" class="link-button" :disabled="loading">
          Sign In
        </button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  max-width: 450px;
  margin: 50px auto;               
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: white;
}

h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}   

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

form div {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #555;
}

input {
  width: 100%;
  padding: 12px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.25);
}

input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

input::placeholder {
  color: #999;
}

small {
  display: block;
  margin-top: 4px;
  color: #666;
  font-size: 12px;
}

button[type="submit"] {
  width: 100%;
  padding: 14px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #218838;
}

button[type="submit"]:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.login-link p {
  margin: 0;
  color: #666;
}

.link-button {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

.link-button:hover:not(:disabled) {
  color: #0056b3;
}

.link-button:disabled {
  color: #999;
  cursor: not-allowed;
}
</style>
