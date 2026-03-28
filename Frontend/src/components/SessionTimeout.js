import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function SessionTimeout() {
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId;
    let warningTimeoutId;

    const checkSession = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeLeft = expiryTime - currentTime;

        // Warning 5 minutes before expiry
        if (timeLeft <= 300000 && timeLeft > 0) {
          if (!warningTimeoutId) {
            warningTimeoutId = setTimeout(() => {
              toast.warning('Your session will expire in 5 minutes!', {
                position: "top-right",
                autoClose: 5000,
              });
            }, timeLeft - 300000);
          }
        }

        // Auto logout on expiry
        if (timeLeft <= 0) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.info('Session expired. Please login again.');
          navigate('/login');
        } else {
          timeoutId = setTimeout(checkSession, 60000); // Check every minute
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };

    checkSession();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
    };
  }, [navigate]);

  return null;
}

export default SessionTimeout;