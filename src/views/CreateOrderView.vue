<template>
  <div class="create-order-container">
    <h1>Create New Order</h1>
    
    <!-- Mostrar error si existe -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- Mostrar success si existe -->
    <div v-if="success" class="success-message">
      {{ success }}
    </div>

    <form @submit.prevent="createOrder">
      <div>
        <label for="order_ID">Order ID:</label>
        <input 
          type="number" 
          id="order_ID" 
          v-model="form.order_ID" 
          required 
          :disabled="loading"
          placeholder="Enter order ID"
        />
      </div>

      <div>
        <label for="orderAddress">Address:</label>
        <input 
          type="text" 
          id="orderAddress" 
          v-model="form.address" 
          required 
          :disabled="loading"
          placeholder="Enter delivery address"
        />
      </div>

      <div>
        <label for="orderAmount">Amount ($):</label>
        <input 
          type="number" 
          step="0.01" 
          id="orderAmount" 
          v-model="form.amount" 
          required 
          :disabled="loading"
          placeholder="0.00"
        />
      </div>

      <div>
        <label for="orderPayment">Payment ($):</label>
        <input 
          type="number" 
          step="0.01" 
          id="orderPayment" 
          v-model="form.payment" 
          required 
          :disabled="loading"
          placeholder="0.00"
        />
      </div>

      <div>
        <label for="tips">Tips ($):</label>
        <input 
          type="number" 
          step="0.01" 
          id="tips" 
          v-model="form.tips" 
          :disabled="loading"
          placeholder="0.00"
        />
      </div>

      <div>
        <label for="storeId">Store:</label>
        <select id="storeId" v-model="form.store_ID" required :disabled="loading">
          <option value="">Select a store</option>
          <option v-for="store in stores" :key="store.id" :value="store.id">
            {{ store.store }}
          </option>
        </select>
      </div>

      <div>
        <label for="windowId">Window:</label>
        <select id="windowId" v-model="form.windows_ID" required :disabled="loading">
          <option value="">Select a window</option>
          <option v-for="window in windows" :key="window.windows_ID" :value="window.windows_ID">
            {{ window.windows }}
          </option>
        </select>
      </div>

      <div>
        <label for="order_date">Order Date:</label>
        <input 
          type="date" 
          id="order_date" 
          v-model="form.order_date" 
          required 
          :disabled="loading"
        />
      </div>

      <!-- Campo user_ID oculto pero visible para debug -->
      <div style="opacity: 0.5; font-size: 12px;">
        <label>User ID (auto-filled):</label>
        <input type="text" :value="form.user_ID" disabled />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Creating Order...' : 'Create Order' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// Interfaces
interface OrderForm {
  order_ID: number | ''
  address: string
  amount: number | ''
  payment: number | ''
  tips: number | ''
  store_ID: number | ''
  windows_ID: number | ''
  user_ID: string
  order_date: string
}

interface Store {
  id: number
  store: string
}

interface Window {
  windows_ID: number
  windows: string
}

// Refs
const router = useRouter()
const loading = ref(false)
const error = ref('')
const success = ref('')

const form = ref<OrderForm>({
  order_ID: '',
  address: '',
  amount: '',
  payment: '',
  tips: '',
  store_ID: '',
  windows_ID: '',
  user_ID: '',
  order_date: new Date().toISOString().split('T')[0] || '' // YYYY-MM-DD
})

const stores = ref<Store[]>([])
const windows = ref<Window[]>([])

// Cargar datos iniciales
const loadInitialData = async () => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/login')
      return
    }

    // Cargar usuario actual
    await loadUserData()
    
    // Cargar stores y windows en paralelo
    await Promise.all([
      loadStores(),
      loadWindows()
    ])

  } catch (err) {
    console.error('Error loading initial data:', err)
    error.value = 'Error loading form data'
  }
}

// Cargar datos del usuario
const loadUserData = async () => {
  try {
    const token = localStorage.getItem('authToken')
    
    // ✅ CORREGIR: URL correcta del API
    const response = await axios.get('http://10.56.10.111:3001/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    form.value.user_ID = response.data.user.user_ID
    
  } catch (err) {
    console.error('Error loading user data:', err)
    
    // Fallback: obtener del localStorage
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        form.value.user_ID = user.user_ID
      }
    } catch (parseErr) {
      console.error('Error parsing user data from localStorage:', parseErr)
      error.value = 'Error loading user information'
    }
  }
}

// Cargar stores
const loadStores = async () => {
  try {
    const token = localStorage.getItem('authToken')
    
    // ✅ CORREGIR: URL correcta del API
    const response = await axios.get('http://10.56.10.111:3001/stores', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    stores.value = response.data
    
  } catch (err) {
    console.error('Error loading stores:', err)
    error.value = 'Error loading stores'
  }
}

// Cargar windows
const loadWindows = async () => {
  try {
    const token = localStorage.getItem('authToken')
    
    // ✅ CORREGIR: URL correcta del API (asumiendo que existe)
    const response = await axios.get('http://10.56.10.111:3001/windows', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    windows.value = response.data
    
  } catch (err) {
    console.error('Error loading windows:', err)
    // Si no existe el endpoint, crear datos por defecto
    windows.value = [
      { windows_ID: 1, windows: 'Kitchen Window' },
      { windows_ID: 2, windows: 'Living Room Window' },
      { windows_ID: 3, windows: 'Bedroom Window' },
      { windows_ID: 4, windows: 'Bathroom Window' },
      { windows_ID: 5, windows: 'Front Door Window' }
    ]
  }
}

// Crear orden
const createOrder = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/login')
      return
    }

    // Validar campos requeridos
    if (!form.value.user_ID) {
      error.value = 'User information not loaded'
      return
    }

    // Preparar datos para enviar
    const orderData = {
      orderId: Number(form.value.order_ID),
      orderAddress: String(form.value.address),
      orderAmount: Number(form.value.amount),
      orderPayment: Number(form.value.payment),
      tips: Number(form.value.tips) || 0,
      storeId: Number(form.value.store_ID),
      windowsId: Number(form.value.windows_ID), // ✅ CORREGIR: windows_ID no window_ID
      user_ID: String(form.value.user_ID),
      order_date: String(form.value.order_date)
    }

    console.log('Creating order with data:', orderData)

    // ✅ CORREGIR: URL correcta del API
    const response = await axios.post('http://10.56.10.111:3001/orders', orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('Order created successfully:', response.data)
    success.value = 'Order created successfully!'
    
    // Limpiar formulario después de 2 segundos y redirigir
    setTimeout(() => {
      router.push('/orders')
    }, 2000)

  } catch (err) {
    console.error('Error creating order:', err)
    
    if (axios.isAxiosError(err) && err.response?.data) {
      error.value = err.response.data.error || err.response.data.message || 'Error creating order'
    } else {
      error.value = 'Network error. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadInitialData()
})
</script>

<style scoped>
.create-order-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: white;
}

h1 {
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
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 12px;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  margin-bottom: 20px;
}

form {
  display: flex;
  flex-direction: column;
}

form > div {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

input, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

input:focus, select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

input:disabled, select:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

button {
  padding: 14px;
  font-size: 16px;
  font-weight: 500;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: #218838;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style>