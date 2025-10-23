<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>Dashboard</h1>
      <div class="user-info">
        <span>Welcome, {{ userName.toUpperCase() }}</span>
        <button @click="logout" class="logout-btn">Logout</button>
      </div>
    </header>

    <div class="dashboard-content">
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Orders</h3>
          <p class="stat-number">{{ stats.totalOrders }}</p>
        </div>
        
        <div class="stat-card">
          <h3>Total Tips</h3>
          <p class="stat-number">${{ stats.totalTips }}</p>
        </div>
        
        <div class="stat-card">
          <h3>This Month</h3>
          <p class="stat-number">{{ stats.thisMonth }}</p>
        </div>
      </div>

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <router-link to="/orders" class="action-btn">
            View Orders
          </router-link>
          <button @click="createNewOrder" class="action-btn">
            New Order
          </button>
          <router-link to="/profile" class="action-btn">
            Profile
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import axios from 'axios'

// Interfaces
interface User {
  user_ID: string
  name: string
  lastName: string
  email: string
}

interface Order {
  order_ID: string
  tips: number
  order_date: string
  amount: number
  payment: number
}

const router = useRouter()
const userStore = useUserStore()

const stats = ref({
  totalOrders: 0,
  totalTips: 0,
  thisMonth: 0
})

// Computed para obtener el nombre del usuario
const userName = computed(() => {
  // Primero intenta del store
  if (userStore.user?.name) {
    return userStore.user.name
  }
  
  // Si no está en el store, intenta del localStorage
  try {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user: User = JSON.parse(userData)
      return user.name
    }
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error)
  }
  
  return 'User'
})

// Cargar datos del usuario
const loadUserData = async () => {
  try {
    // Si no hay datos en el store, cargar del localStorage o API
    if (!userStore.user) {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user: User = JSON.parse(userData)
        userStore.setUser(user)
      } else {
        // Si no hay datos en localStorage, obtener del API
        await fetchUserProfile()
      }
    }
  } catch (error) {
    console.error('Error loading user data:', error)
  }
}

// Obtener perfil del usuario desde el API
const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await axios.get('http://10.56.10.111:3001/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    const user: User = response.data.user
    userStore.setUser(user)
    localStorage.setItem('user', JSON.stringify(user))
    
  } catch (error) {
    console.error('Error fetching user profile:', error)
    // Si hay error de autenticación, redirigir al login
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logout()
    }
  }
}

const fetchStats = async () => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/login')
      return
    }


    const response = await axios.get('http://10.56.10.111:3001/orders', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    const orders: Order[] = response.data
    stats.value.totalOrders = orders.length
    

    stats.value.totalTips = orders.reduce((sum: number, order: Order) => {
        return sum + (order.tips || 0)
    }, 0)

    // Calculate this month's orders
    const currentMonth = new Date().getMonth()
    const thisMonthOrders = orders.filter((order: Order) => {
      const orderDate = new Date(order.order_date)
      return orderDate.getMonth() === currentMonth
    })
    stats.value.thisMonth = thisMonthOrders.length
    
  } catch (error) {
    console.error('Error fetching stats:', error)
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logout()
    }
  }
}

const createNewOrder = () => {
  router.push('/create-order')
}

const logout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  localStorage.clear()  
  userStore.clearUser()
  router.push('/login')
}

onMounted(async () => {
  await loadUserData()
  await fetchStats()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-btn {
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #c82333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #28a745;
  margin: 10px 0;
}

.quick-actions h2 {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

.action-btn:hover {
  background-color: #0056b3;
}
</style>