import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePassword = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    
    if (formData.new_password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // API call to change password
      // For now, simulate success
      toast.success('Password changed successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      setError('Failed to change password');
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-0 pt-4">
            <div className="text-center">
              <Lock size={48} className="text-primary mb-3" />
              <h4 className="mb-0">Change Password</h4>
              <p className="text-muted mt-2">Update your password to keep your account secure</p>
            </div>
          </Card.Header>
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPasswords.current ? 'text' : 'password'}
                    name="current_password"
                    value={formData.current_password}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    variant="link"
                    className="position-absolute end-0 top-0"
                    onClick={() => togglePassword('current')}
                    style={{ textDecoration: 'none' }}
                  >
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPasswords.new ? 'text' : 'password'}
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    variant="link"
                    className="position-absolute end-0 top-0"
                    onClick={() => togglePassword('new')}
                    style={{ textDecoration: 'none' }}
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
                <Form.Text className="text-muted">
                  Password must be at least 6 characters
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label>Confirm New Password</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    variant="link"
                    className="position-absolute end-0 top-0"
                    onClick={() => togglePassword('confirm')}
                    style={{ textDecoration: 'none' }}
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
              </Form.Group>
              
              <Button 
                type="submit" 
                variant="primary" 
                disabled={loading}
                className="w-100"
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default ChangePassword;