<template>
  <div class="orders">
    <div class="header">
      <h1>Orders</h1> 

      <router-link to="/dashboard" class="back-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m12 19-7-7 7-7"/>
      <path d="m19 12H5"/>
      </svg>
      Back
    </router-link>

    </div>

    <div v-if="loading">Loading orders...</div>
    <div v-else-if="orders.length === 0">No orders found.</div>
    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.order_ID" class="order-card">
        <h3>Order #{{ order.order_ID }}</h3>
        <p><strong>Address:</strong> {{ order.address }} <a :href="`https://www.google.com/maps/place/${encodeURIComponent(order.address)}`" target="_blank">
  <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Mapa" width="24" height="24">
</a>
</p>
        <p><strong>Amount:</strong> ${{ order.amount }}</p>
        <p><strong>Payment:</strong> ${{ order.payment }}</p>
        <p><strong>Tips:</strong> ${{ order.tips }}</p>
        <p><strong>Store:</strong> {{ order.Store?.store }}</p>
        <p><strong>Date:</strong> {{ formatDate(order.order_date) }}</p>
      </div>
    </div>
    
  </div>


</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface Store {
  store: string
}

interface Order {
  order_ID: number
  address: string
  amount: number
  payment: number
  tips: number
  Store?: Store
  order_date: string
}

const orders = ref<Order[]>([])
const loading = ref(true)

const fetchOrders = async () => {
  try {
    const token = localStorage.getItem('authToken')
    const response = await axios.get('http://10.56.10.111:3001/orders', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    orders.value = response.data
  } catch (error) {
    console.error('Error fetching orders:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.orders {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.orders-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.order-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.order-card h3 {
  margin-top: 0;
  color: #007bff;
}

.order-card p {
  margin: 8px 0;
}

.back-btn {
  
  display: inline-flex;
  align-items: center;
  margin-top: 30px;
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
}
.back-btn svg {
  margin-right: 8px;
}
.back-btn:hover {
  background-color: #0056b3;
}

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;


  }
  a.back-btn {
    margin-top: 0;
  }
</style>