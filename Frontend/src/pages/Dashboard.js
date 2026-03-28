import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge, Spinner, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { teacherService } from '../services/api';
import { 
  Users, 
  GraduationCap, 
  UserPlus,
  RefreshCw,
  PieChart,
  Calendar,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState({
    totalTeachers: 0,
    maleTeachers: 0,
    femaleTeachers: 0,
    otherTeachers: 0,
    totalUniversities: 0,
    yearsJoined: []
  });
  const [recentTeachers, setRecentTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await teacherService.getAll();
      const teachers = response.data.data;
      
      const maleCount = teachers.filter(t => t.gender === 'male').length;
      const femaleCount = teachers.filter(t => t.gender === 'female').length;
      const otherCount = teachers.filter(t => t.gender === 'other').length;
      const universities = [...new Set(teachers.map(t => t.university_name))];
      
      const yearMap = {};
      teachers.forEach(t => {
        const year = t.year_joined;
        yearMap[year] = (yearMap[year] || 0) + 1;
      });
      
      const yearsJoined = Object.keys(yearMap).map(year => ({
        year: year,
        count: yearMap[year]
      })).sort((a, b) => a.year - b.year);
      
      setStats({
        totalTeachers: teachers.length,
        maleTeachers: maleCount,
        femaleTeachers: femaleCount,
        otherTeachers: otherCount,
        totalUniversities: universities.length,
        yearsJoined: yearsJoined
      });
      setRecentTeachers([...teachers].reverse().slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
    },
    scales: {
      y: { grid: { display: false }, ticks: { stepSize: 1 } },
      x: { grid: { display: false } }
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="grow" variant="primary" />
        <p className="mt-3 text-muted fw-light">Syncing dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="pb-5">
      {/* Upper Section: Welcome & Actions */}
      <div className="d-md-flex justify-content-between align-items-end mb-4">
        <div>
          <Badge bg="primary-soft" className="text-primary mb-2 px-3 py-2">System Overview</Badge>
          <h2 className="fw-bold mb-0">Hello, {user.first_name || 'Admin'}!</h2>
          <p className="text-muted mb-0">Here's a summary of the faculty directory.</p>
        </div>
        <div className="mt-3 mt-md-0">
          <Button variant="outline-secondary" className="me-2 border-0 shadow-sm" onClick={fetchData}>
            <RefreshCw size={18} />
          </Button>
          <Button variant="primary" onClick={() => navigate('/teachers/new')} className="shadow-sm px-4">
            <UserPlus size={18} className="me-2" />
            Add Teacher
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <Row className="g-4 mb-4">
        {[
          { label: 'Total Faculty', val: stats.totalTeachers, icon: <Users />, color: '#4e73df', bg: '#f8f9fc' },
          { label: 'Universities', val: stats.totalUniversities, icon: <GraduationCap />, color: '#1cc88a', bg: '#f0fff4' },
          { label: 'Male', val: stats.maleTeachers, icon: 'M', color: '#36b9cc', bg: '#e0f7fa' },
          { label: 'Female', val: stats.femaleTeachers, icon: 'F', color: '#f6c23e', bg: '#fff9e6' }
        ].map((item, idx) => (
          <Col key={idx} xs={12} sm={6} lg={3}>
            <Card className="border-0 shadow-sm overflow-hidden h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                     style={{ width: '50px', height: '50px', backgroundColor: item.bg, color: item.color }}>
                  {item.icon}
                </div>
                <div>
                  <small className="text-uppercase fw-bold text-muted" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>{item.label}</small>
                  <h3 className="fw-bold mb-0">{item.val}</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Analytics Row */}
      <Row className="g-4 mb-4">
        <Col lg={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="fw-bold mb-0"><Calendar size={18} className="me-2 text-primary" />Registration Trends</h6>
              </div>
              <div style={{ height: '300px' }}>
                <Bar 
                  data={{
                    labels: stats.yearsJoined.map(y => y.year),
                    datasets: [{ label: 'New Joinees', data: stats.yearsJoined.map(y => y.count), backgroundColor: '#4e73df', borderRadius: 5 }]
                  }} 
                  options={chartOptions} 
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h6 className="fw-bold mb-4"><PieChart size={18} className="me-2 text-primary" />Gender Split</h6>
              <div style={{ height: '300px' }}>
                <Pie 
                  data={{
                    labels: ['Male', 'Female', 'Other'],
                    datasets: [{
                      data: [stats.maleTeachers, stats.femaleTeachers, stats.otherTeachers],
                      backgroundColor: ['#4e73df', '#f6c23e', '#1cc88a'],
                      hoverOffset: 10,
                      borderWidth: 0
                    }]
                  }} 
                  options={chartOptions} 
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="d-flex justify-content-between align-items-center p-4">
            <h6 className="fw-bold mb-0">Recent Faculty Additions</h6>
            <Button variant="link" size="sm" className="text-decoration-none p-0" onClick={() => navigate('/teachers')}>
              View Directory <ArrowRight size={14} />
            </Button>
          </div>
          <div className="table-responsive">
            <Table hover borderless className="align-middle mb-0">
              <thead className="bg-light text-muted" style={{ fontSize: '0.85rem' }}>
                <tr>
                  <th className="ps-4">TEACHER NAME</th>
                  <th>UNIVERSITY</th>
                  <th>GENDER</th>
                  <th>JOINED</th>
                  <th className="text-end pe-4">DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {recentTeachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="ps-4 py-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px' }}>
                          {teacher.first_name.charAt(0)}
                        </div>
                        <span className="fw-semibold">{teacher.first_name} {teacher.last_name}</span>
                      </div>
                    </td>
                    <td className="text-muted">{teacher.university_name}</td>
                    <td>
                      <Badge pill className={`bg-${teacher.gender === 'male' ? 'info' : 'danger'} opacity-75`}>
                        {teacher.gender}
                      </Badge>
                    </td>
                    <td className="text-muted">{teacher.year_joined}</td>
                    <td className="text-end pe-4">
                      <Button variant="light" size="sm" className="rounded-circle" onClick={() => navigate('/teachers')}>
                        <ChevronRight size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Dashboard;