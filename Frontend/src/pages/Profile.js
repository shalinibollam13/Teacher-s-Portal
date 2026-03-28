import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Alert, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authService, teacherService } from '../services/api';
import { User, Mail, Phone, Edit2, Save, X, Camera, MapPin, BookOpen, Award } from 'lucide-react';
import { toast } from 'react-toastify';

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [teacherData, setTeacherData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState(user.profile_image || null);
  
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      const response = await teacherService.getAll();
      const teachers = response.data.data;
      const teacher = teachers.find(t => t.email === user.email);
      if (teacher) setTeacherData(teacher);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        // In a real app, you'd upload this to your server here
        toast.info("Image preview updated locally");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = { ...user, ...formData, profile_image: profileImage };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark mb-0">My Profile</h2>
        <Badge bg="primary" className="px-3 py-2">Teacher Account</Badge>
      </div>
      
      <Row>
        {/* Left Column: Avatar & Quick Actions */}
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="bg-primary" style={{ height: '100px' }}></div>
            <Card.Body className="pt-0 text-center">
              <div className="position-relative d-inline-block" style={{ marginTop: '-50px' }}>
                <div 
                  className="rounded-circle border border-4 border-white shadow-sm overflow-hidden bg-light d-flex align-items-center justify-content-center"
                  style={{ width: '120px', height: '120px', cursor: 'pointer' }}
                  onClick={() => fileInputRef.current.click()}
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-100 h-100 object-fit-cover" />
                  ) : (
                    <User size={50} className="text-secondary" />
                  )}
                  <div className="position-absolute bottom-0 end-0 bg-primary text-white p-2 rounded-circle shadow-sm">
                    <Camera size={16} />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="d-none" 
                />
              </div>
              
              <h4 className="mt-3 fw-bold">{user.first_name} {user.last_name}</h4>
              <p className="text-muted mb-4"><Mail size={14} className="me-1" /> {user.email}</p>
              
              <div className="d-grid gap-2">
                <Button variant="light" className="text-primary fw-semibold" onClick={() => navigate('/change-password')}>
                  Change Password
                </Button>
                <Button variant="outline-danger" size="sm" className="border-0">
                  Sign Out
                </Button>
              </div>
            </Card.Body>
          </Card>

          {teacherData && (
            <Card className="border-0 shadow-sm mt-4">
              <Card.Body>
                <h6 className="fw-bold mb-3">Quick Stats</h6>
                <div className="d-flex align-items-center mb-2">
                  <div className="bg-light-primary p-2 rounded me-3 text-primary"><BookOpen size={18}/></div>
                  <div>
                    <small className="text-muted d-block">Department</small>
                    <span className="fw-medium">{teacherData.department || 'N/A'}</span>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="bg-light-success p-2 rounded me-3 text-success"><Award size={18}/></div>
                  <div>
                    <small className="text-muted d-block">Experience</small>
                    <span className="fw-medium">{new Date().getFullYear() - teacherData.year_joined} Years</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
        
        {/* Right Column: Detailed Info & Forms */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Personal Details</h5>
              {!editMode ? (
                <Button variant="primary" size="sm" onClick={() => setEditMode(true)} className="rounded-pill px-3">
                  <Edit2 size={14} className="me-2" /> Edit
                </Button>
              ) : (
                <div className="d-flex gap-2">
                  <Button variant="outline-secondary" size="sm" onClick={() => setEditMode(false)} className="rounded-pill px-3">
                    <X size={14} className="me-1" /> Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleSubmit} disabled={loading} className="rounded-pill px-3">
                    <Save size={14} className="me-1" /> {loading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger" className="py-2">{error}</Alert>}
              
              <Form row="true">
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label className="small fw-bold text-uppercase text-muted">First Name</Form.Label>
                    <Form.Control
                      className="bg-light border-0"
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="small fw-bold text-uppercase text-muted">Last Name</Form.Label>
                    <Form.Control
                      className="bg-light border-0"
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="small fw-bold text-uppercase text-muted">Email Address</Form.Label>
                    <Form.Control className="bg-light border-0" type="email" value={user.email} disabled />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="small fw-bold text-uppercase text-muted">Phone Number</Form.Label>
                    <Form.Control
                      className="bg-light border-0"
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
          
          {teacherData && (
            <Card className="border-0 shadow-sm border-start border-primary border-5">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Academic Background</h5>
                <Row className="g-4">
                  <Col sm={6}>
                    <div className="text-muted small mb-1"><MapPin size={12} className="me-1"/> University</div>
                    <p className="fw-bold mb-0">{teacherData.university_name}</p>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted small mb-1">Designation</div>
                    <p className="fw-bold mb-0">{teacherData.designation || 'Faculty Member'}</p>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted small mb-1">Highest Qualification</div>
                    <p className="fw-bold mb-0">{teacherData.qualification || 'Doctorate'}</p>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted small mb-1">Joining Year</div>
                    <p className="fw-bold mb-0 text-primary">{teacherData.year_joined}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default Profile;