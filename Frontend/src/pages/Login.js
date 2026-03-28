import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Welcome to TeachersPortal!');
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid credentials');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <Container fluid className="p-0">
        <Row className="g-0 min-vh-100">
          {/* Left Side: Form */}
          <Col lg={5} className="d-flex align-items-cener justify-content-center bg-white p-5">
            <div className="auth-form-container">
              <div className="brand-logo mb-5">
                <span className="logo-text">TeachersPortal</span>
              </div>
              
              <div className="mb-4">
                <h2 className="fw-bold text-dark">Welcome Back</h2>
                <p className="text-secondary">Please enter your details to sign in.</p>
              </div>

              {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

              <Form onSubmit={handleSubmit} className="mt-4">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    className="custom-input"
                    placeholder="Ex: xyz@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <Form.Label className="small fw-semibold">Password</Form.Label>
                    <a href="#" className="small text-primary text-decoration-none">Forgot?</a>
                  </div>
                  <Form.Control
                    type="password"
                    name="password"
                    className="custom-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="dark" 
                  disabled={loading} 
                  className="w-100 py-3 rounded-3 fw-bold login-btn"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <p className="text-muted small">
                  New to the platform? <Link to="/register" className="text-primary fw-bold text-decoration-none">Create an account</Link>
                </p>
              </div>
            </div>
          </Col>

          {/* Right Side: Visual/Branding */}
          <Col lg={7} className="d-none d-lg-block">
            <div className="login-visual-panel d-flex align-items-center justify-content-center">
              <div className="overlay-content text-white text-center">
                <h1 className="display-4 fw-bold mb-3">Empowering Educators</h1>
                <p className="lead opacity-75">The all-in-one portal for university teacher management.</p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;