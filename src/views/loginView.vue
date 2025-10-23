<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

interface LoginResponse {
  token: string;
}   

const email = ref<string>('');
const password = ref<string>('');
const errorMessage = ref<string>('');
const router = useRouter(); 

const login = async () => {
  try {
    const response = await axios.post<LoginResponse>('http://10.56.10.111:3001/auth/login', {
      email: email.value,
      password: password.value
    });
    
    localStorage.setItem('authToken', response.data.token);
    router.push('/dashboard');
  } catch (error) {
    errorMessage.value = 'Login failed. Please check your credentials.';
  }
};
</script>

<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="errorMessage">{{ errorMessage }}</p>
    <div class="register-link">
    <router-link to="/register">Don't have an account? Register here</router-link>
  </div>
  </div>
  
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;               
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

form div {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #28a745;        
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button:hover {
  background-color: #218838;
}

p {
  color: red;
  text-align: center;
}

.register-link {
  text-align: center;
  margin-top: 15px;
}
.register-link a {
  color: #007bff;
  text-decoration: none;
}
.register-link a:hover {
  text-decoration: underline;
} 
</style>

