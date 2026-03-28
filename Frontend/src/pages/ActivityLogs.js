import React, { useState, useEffect } from 'react';
import { Card, Badge, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';
import api from '../services/api';
import { Clock, Activity, User, Globe, Info, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

// Custom Styles for the Timeline
const styles = {
  timelineItem: {
    borderLeft: '2px solid #e9ecef',
    paddingLeft: '24px',
    position: 'relative',
    paddingBottom: '2rem'
  },
  timelineDot: {
    position: 'absolute',
    left: '-9px',
    top: '0',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    border: '3px solid #0d6efd'
  }
};

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/activity/logs');
      setLogs(response.data.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch activity logs');
      toast.error('Could not sync latest activities');
    } finally {
      setLoading(false);
    }
  };

  const getLogMeta = (action) => {
    const config = {
      create_teacher: { color: '#198754', icon: '➕', label: 'Added User' },
      update_teacher: { color: '#f59e0b', icon: '✏️', label: 'Updated User' },
      delete_teacher: { color: '#dc3545', icon: '🗑️', label: 'Deleted User' },
      login: { color: '#0dcaf0', icon: '🔐', label: 'Session Start' },
      default: { color: '#6c757d', icon: '📝', label: 'System Event' }
    };
    return config[action] || config.default;
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <Spinner animation="grow" variant="primary" size="lg" />
        <p className="mt-3 fw-light text-muted">Synchronizing activity feed...</p>
      </div>
    );
  }

  return (
    <Container className="py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h2 className="fw-bold mb-1">System Audit Trail</h2>
          <p className="text-muted mb-0">Monitor real-time updates and security events</p>
        </div>
        <div className="text-end">
          <Badge bg="light" text="dark" className="border shadow-sm p-2 px-3 rounded-pill">
            <Activity size={14} className="me-2 text-primary" />
            {logs.length} Total Events
          </Badge>
        </div>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}

      <Row className="justify-content-center">
        <Col lg={10}>
          {logs.length > 0 ? (
            <div className="ps-3">
              {logs.map((log) => {
                const meta = getLogMeta(log.action);
                return (
                  <div key={log.id} style={styles.timelineItem}>
                    <div style={{ ...styles.timelineDot, borderColor: meta.color }} />
                    
                    <Card className="border-0 shadow-sm rounded-4 mb-2 hover-shadow transition">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                          <div className="d-flex align-items-center">
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center me-3"
                              style={{ width: '40px', height: '40px', backgroundColor: `${meta.color}15`, color: meta.color }}
                            >
                              <span style={{ fontSize: '1.2rem' }}>{meta.icon}</span>
                            </div>
                            <div>
                              <h6 className="mb-0 fw-bold">
                                {log.first_name} {log.last_name} 
                                <span className="fw-normal text-muted px-2">
                                  {meta.label.toLowerCase()}
                                </span>
                              </h6>
                              <small className="text-muted d-flex align-items-center gap-2 mt-1">
                                <User size={12} /> {log.email}
                              </small>
                            </div>
                          </div>

                          <div className="text-md-end">
                            <div className="text-muted small d-flex align-items-center justify-content-md-end mb-1">
                              <Clock size={12} className="me-1" />
                              {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-muted small d-flex align-items-center justify-content-md-end">
                              <Calendar size={12} className="me-1" />
                              {new Date(log.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Details Section */}
                        <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center text-secondary small">
                            <Info size={14} className="me-2" />
                            {log.details || 'System event triggered successfully'}
                          </div>
                          <Badge bg="light" text="muted" className="fw-normal border">
                            <Globe size={10} className="me-1" /> {log.ip_address || 'Internal'}
                          </Badge>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                );
              })}
            </div>
          ) : (
            <Card className="text-center p-5 border-0 shadow-sm rounded-4">
              <div className="py-4">
                <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                  <Activity size={48} className="text-muted" />
                </div>
                <h4 className="fw-bold">No Activity Recorded</h4>
                <p className="text-muted mx-auto" style={{ maxWidth: '300px' }}>
                  When users take actions, you'll see a chronological timeline of events here.
                </p>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default ActivityLogs;