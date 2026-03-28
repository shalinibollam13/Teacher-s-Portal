import React from 'react';
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Settings, Users, LayoutDashboard, Activity, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';

// Custom CSS should be added to your stylesheet for the .nav-glass class
const navStyles = {
  backdropFilter: 'blur(10px)',
  backgroundColor: 'rgba(15, 23, 42, 0.9)', // Modern Slate/Zinc color
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  padding: '0.75rem 0'
};

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  // Helper to highlight active link
  const isActive = (path) => location.pathname === path ? 'text-primary-emphasis' : 'text-white-50';

  return (
    <Navbar style={navStyles} variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center fw-bold fs-4">
          <div className="bg-primary p-2 rounded-3 me-2 d-flex align-items-center justify-content-center">
            <Users size={20} color="white" />
          </div>
          <span className="tracking-tight text-white">Teacher<span className="text-primary">Portal</span></span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          {token && (
            <Nav className="mx-auto bg-dark-subtle rounded-pill px-3 py-1 my-2 my-lg-0 border border-secondary border-opacity-25">
              <Nav.Link as={Link} to="/" className={`px-3 d-flex align-items-center transition-all ${isActive('/')}`}>
                <LayoutDashboard size={18} className="me-2" />
                <span>Dashboard</span>
              </Nav.Link>
              <Nav.Link as={Link} to="/teachers" className={`px-3 d-flex align-items-center transition-all ${isActive('/teachers')}`}>
                <Users size={18} className="me-1" />
                <span>Teachers</span>
              </Nav.Link>
              <Nav.Link as={Link} to="/activity" className={`px-3 d-flex align-items-center transition-all ${isActive('/activity')}`}>
                <Activity size={18} className="me-1" />
                <span>Activity</span>
              </Nav.Link>
            </Nav>
          )}

          <Nav className="ms-auto align-items-center">
            {token ? (
              <NavDropdown 
                title={
                  <div className="d-inline-flex align-items-center bg-white bg-opacity-10 rounded-pill ps-2 pe-3 py-1 border border-white border-opacity-10">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '28px', height: '28px'}}>
                      <span className="small fw-bold text-white">{user.first_name?.[0]}</span>
                    </div>
                    <span className="text-white small me-1">{user.first_name}</span>
                    <ChevronDown size={14} className="text-white-50" />
                  </div>
                } 
                id="profile-dropdown"
                align="end"
                className="no-caret"
              >
                <div className="px-3 py-2 border-bottom mb-2">
                  <p className="mb-0 small fw-bold">{user.first_name} {user.last_name}</p>
                  <p className="mb-0 x-small text-muted">{user.email || 'Teacher Account'}</p>
                </div>
                <NavDropdown.Item as={Link} to="/profile" className="py-2">
                  <User size={16} className="me-2 text-primary" />
                  My Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/change-password" size={16} className="py-2">
                  <Settings size={16} className="me-2 text-primary" />
                  Settings
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="py-2 text-danger">
                  <LogOut size={16} className="me-2" />
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <div className="d-flex gap-2">
                <Button as={Link} to="/login" variant="link" className="text-white text-decoration-none">Login</Button>
                <Button as={Link} to="/register" variant="primary" className="rounded-pill px-4">Get Started</Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;