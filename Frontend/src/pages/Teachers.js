import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherService } from '../services/api';
import { 
  Table, Button, Badge, Form, InputGroup, 
  Modal, Row, Col, Card, Container
} from 'react-bootstrap';
import { 
  Search, Download, Edit, Trash2, ChevronLeft, ChevronRight, 
  RefreshCw, Plus, Mail, School, Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUniversity, setFilterUniversity] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const navigate = useNavigate();

  // --- Logic Helpers ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const universities = [...new Set(teachers.map(t => t.university_name))];

  // --- API Actions ---
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getAll();
      setTeachers(response.data.data || []);
    } catch (err) {
      toast.error('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await teacherService.delete(selectedTeacher.id);
      toast.success('Teacher removed successfully');
      setShowDeleteModal(false);
      fetchTeachers(); // Refresh list
    } catch (err) {
      toast.error('Failed to delete teacher');
    }
  };

  // --- Handlers ---
  const filterTeachers = useCallback(() => {
    let filtered = [...teachers];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        `${t.first_name} ${t.last_name}`.toLowerCase().includes(term) ||
        t.email.toLowerCase().includes(term) ||
        t.university_name.toLowerCase().includes(term)
      );
    }
    if (filterUniversity) filtered = filtered.filter(t => t.university_name === filterUniversity);
    if (filterGender) filtered = filtered.filter(t => t.gender === filterGender);
    
    setFilteredTeachers(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterUniversity, filterGender, teachers]);

  useEffect(() => { fetchTeachers(); }, []);
  useEffect(() => { filterTeachers(); }, [filterTeachers]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterUniversity('');
    setFilterGender('');
    toast.info('Filters reset');
  };

  const confirmDelete = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteModal(true);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const exportToCSV = () => {
    // Basic implementation example
    const headers = "First Name,Last Name,Email,University\n";
    const rows = filteredTeachers.map(t => `${t.first_name},${t.last_name},${t.email},${t.university_name}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'teachers_directory.csv');
    a.click();
    toast.success('Exporting data...');
  };

  // --- UI Components ---
  const EmptyState = () => (
    <div className="text-center py-5">
      <div className="bg-light d-inline-block p-4 rounded-circle mb-3">
        <Search size={48} className="text-muted" />
      </div>
      <h4>No teachers found</h4>
      <p className="text-muted">Try adjusting your search or filters.</p>
      <Button variant="outline-primary" onClick={clearFilters}>Clear All Filters</Button>
    </div>
  );

  if (loading) return (
    <Container className="mt-5 text-center">
      <RefreshCw className="spinner-icon text-primary mb-3" size={40} />
      <p className="text-muted animate-pulse">Loading Academic Records...</p>
    </Container>
  );

  return (
    <div className="p-4 bg-light min-vh-100">
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Faculty Directory</h2>
          <p className="text-secondary mb-0">Manage {teachers.length} academic staff members</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="white" className="border shadow-sm d-flex align-items-center" onClick={exportToCSV}>
            <Download size={18} className="me-2 text-primary" /> Export
          </Button>
          <Button variant="primary" className="shadow-sm d-flex align-items-center" onClick={() => navigate('/teachers/new')}>
            <Plus size={18} className="me-1" /> Add Teacher
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border-0 shadow-sm mb-4 overflow-hidden">
        <Card.Body className="p-3">
          <Row className="g-3">
            <Col lg={4}>
              <InputGroup className="bg-light border-0 rounded-3">
                <InputGroup.Text className="bg-transparent border-0 pe-0">
                  <Search size={18} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  className="bg-transparent border-0 py-2 shadow-none"
                  placeholder="Search name, email, or campus..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select className="border-light shadow-none" value={filterUniversity} onChange={(e) => setFilterUniversity(e.target.value)}>
                <option value="">All Universities</option>
                {universities.map(uni => <option key={uni} value={uni}>{uni}</option>)}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select className="border-light shadow-none" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
                <option value="">Gender: All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="dark" className="w-100 py-2 rounded-3 shadow-sm" onClick={filterTeachers}>
                Filter
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table Card */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light border-bottom">
              <tr>
                <th className="ps-4 py-3 text-uppercase fs-xs fw-bold text-secondary">Teacher Info</th>
                <th className="py-3 text-uppercase fs-xs fw-bold text-secondary">Campus</th>
                <th className="py-3 text-uppercase fs-xs fw-bold text-secondary text-center">Gender</th>
                <th className="py-3 text-uppercase fs-xs fw-bold text-secondary text-center">Joined</th>
                <th className="py-3 text-uppercase fs-xs fw-bold text-secondary text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? currentItems.map((teacher) => (
                <tr key={teacher.id}>
                  <td className="ps-4 py-3">
                    <div className="d-flex align-items-center">
                      <div className="avatar-circle me-3 bg-soft-primary text-primary fw-bold">
                        {teacher.first_name[0]}{teacher.last_name[0]}
                      </div>
                      <div>
                        <div className="fw-bold text-dark">{teacher.first_name} {teacher.last_name}</div>
                        <small className="text-muted d-flex align-items-center">
                          <Mail size={12} className="me-1" /> {teacher.email}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="d-flex align-items-center">
                      <School size={14} className="text-muted me-2" />
                      <span className="text-dark">{teacher.university_name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <Badge pill bg="none" className={`border fw-medium px-3 py-2 text-capitalize ${
                        teacher.gender === 'male' ? 'border-info text-info' : 
                        teacher.gender === 'female' ? 'border-danger text-danger' : 'border-secondary text-secondary'
                    }`}>
                      {teacher.gender}
                    </Badge>
                  </td>
                  <td className="py-3 text-center text-secondary">
                    <Calendar size={14} className="me-1" /> {teacher.year_joined}
                  </td>
                  <td className="py-3 text-end pe-4">
                    <div className="d-flex justify-content-end gap-1">
                      <Button variant="light" size="sm" className="btn-icon rounded-circle" onClick={() => navigate(`/teachers/edit/${teacher.id}`)}>
                        <Edit size={16} className="text-primary" />
                      </Button>
                      <Button variant="light" size="sm" className="btn-icon rounded-circle" onClick={() => confirmDelete(teacher)}>
                        <Trash2 size={16} className="text-danger" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5"><EmptyState /></td></tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-top d-flex justify-content-between align-items-center bg-white">
            <span className="text-muted small">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTeachers.length)} of {filteredTeachers.length}
            </span>
            <div className="pagination-wrapper d-flex gap-2">
              <Button variant="light" size="sm" disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)}>
                <ChevronLeft size={16} />
              </Button>
              <Button variant="primary" size="sm" className="px-3">{currentPage}</Button>
              <Button variant="light" size="sm" disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Body className="text-center p-5">
            <div className="text-danger mb-3"><Trash2 size={48} /></div>
            <h4>Remove Faculty Member?</h4>
            <p className="text-muted">You are about to delete <strong>{selectedTeacher?.first_name} {selectedTeacher?.last_name}</strong>. This action is permanent.</p>
            <div className="d-flex gap-2 justify-content-center mt-4">
                <Button variant="light" className="px-4" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                <Button variant="danger" className="px-4" onClick={handleDelete}>Delete Now</Button>
            </div>
        </Modal.Body>
      </Modal>

      <style>{`
        .avatar-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
        }
        .bg-soft-primary { background-color: #e7f1ff; }
        .btn-icon:hover { background-color: #f1f1f1; transform: translateY(-1px); transition: all 0.2s; }
        .fs-xs { font-size: 0.75rem; letter-spacing: 0.05em; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        .spinner-icon { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default Teachers;