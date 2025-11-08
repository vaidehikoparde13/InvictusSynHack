// Debug utility to check API connection
export const testAPIConnection = async () => {
  try {
    const response = await fetch('http://localhost:5000/health')
    const data = await response.json()
    console.log('✅ Backend is running:', data)
    return true
  } catch (error) {
    console.error('❌ Backend connection failed:', error)
    return false
  }
}

// Test registration endpoint
export const testRegistration = async (testData) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    })
    const data = await response.json()
    console.log('Registration test response:', data)
    return data
  } catch (error) {
    console.error('Registration test error:', error)
    return { success: false, error: error.message }
  }
}

