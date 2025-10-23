import { defineStore } from 'pinia'
import { ref } from 'vue'


interface User {
  user_ID: string
  name: string
  lastName: string
  email: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)

  // Inicializar desde localStorage al crear el store
  const initializeFromStorage = () => {
    try {
      const userData = localStorage.getItem('user')
      const token = localStorage.getItem('authToken')
      
      if (userData && token) {
        user.value = JSON.parse(userData)
        isAuthenticated.value = true
      }
    } catch (error) {
      console.error('Error initializing user from storage:', error)
      clearUser()
    }
  }

  const setUser = (userData: User) => {
    user.value = userData
    isAuthenticated.value = true
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const clearUser = () => {
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
  }

  // Inicializar al crear el store
  initializeFromStorage()

  return {
    user,
    isAuthenticated,
    setUser,
    clearUser,
    initializeFromStorage
  }
})