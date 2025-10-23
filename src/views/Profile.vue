<template>
  <div class="profile-container">
    <h1>My Profile</h1>
    
    <div v-if="loading" class="loading">Loading...</div>
    
    <div v-else-if="user" class="profile-content">
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar">
            {{ user.name?.charAt(0).toUpperCase() }}
          </div>
          <h2>{{ user.name }}</h2>
        </div>
        
        <div class="profile-info">
          <div class="info-row">
            <span class="label">User ID:</span>
            <span class="value">{{ user.user_ID }}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value">{{ user.email }}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Name:</span>
            <span class="value">{{ user.name }}</span>
          </div>
        </div>
        
        <div class="profile-actions">
          <button @click="goToDashboard" class="btn-secondary">
            Back to Dashboard
          </button>
          <button @click="logout" class="btn-danger">
            Logout
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="error">
      Failed to load profile information
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

interface User {
  user_ID: string
  email: string
  name: string
}

const router = useRouter()
const loading = ref(true)
const user = ref<User | null>(null)

const loadProfile = async () => {
  try {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      router.push({ name: 'login' })
      return
    }
    
    const response = await axios.get('http://10.56.10.111:3001/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    user.value = response.data.user
    
  } catch (error) {
    console.error('Error loading profile:', error)
    
    // Fallback: cargar del localStorage
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        user.value = JSON.parse(userData)
      }
    } catch (parseErr) {
      console.error('Error parsing user from localStorage:', parseErr)
    }
  } finally {
    loading.value = false
  }
}

const goToDashboard = () => {
  router.push({ name: 'dashboard' })
}

const logout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  router.push({ name: 'login' })
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.error {
  text-align: center;
  padding: 40px;
  color: #dc3545;
  font-size: 16px;
}

.profile-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 20px;
  text-align: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  margin: 0 auto 20px;
  border: 3px solid white;
}

.profile-header h2 {
  margin: 0;
  font-size: 24px;
}

.profile-info {
  padding: 30px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #666;
}

.value {
  color: #333;
  font-weight: 500;
}

.profile-actions {
  padding: 20px;
  background: #f8f9fa;
  display: flex;
  gap: 10px;
  justify-content: center;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}
</style>
