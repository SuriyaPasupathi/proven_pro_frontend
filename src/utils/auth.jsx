export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('pending_transaction');
  
  // Redirect to login page
  window.location.href = '/login';
};