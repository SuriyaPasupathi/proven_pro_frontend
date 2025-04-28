import { login } from '../api/auth';

login({ email, password })
  .then((res) => {
    localStorage.setItem('access_token', res.data.access);
    // Navigate to profile or subscription
  })
  .catch((err) => {
    console.error(err);
  });
