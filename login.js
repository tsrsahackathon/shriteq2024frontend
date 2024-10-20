const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    const isAuthenticated = await authenticateUser(email, password);
    
    if (isAuthenticated) {
      alert('Login successful!');
      window.location.href = 'loggedinmain.html';
    } else {
      alert('Invalid email or password. Please try again.');
    }
  } catch (error) {
    console.error('Login failed:', error);
    alert('An error occurred during login. Please try again later.');
  }
});

async function authenticateUser(email, password) {
  const mockUsers = [
    { email: 'Riddhiman123.11@gmail.com', password: 'mypassword' },
    { email: 'aryan.khandelwalnot@gmail.com', password: 'mypassword' },
    { email: 'shauryasinghal1901@gmail.com', password: 'mypassword' }
  ];

  await new Promise((resolve) => setTimeout(resolve, 1000));
  return mockUsers.some(user => user.email === email && user.password === password);
}
