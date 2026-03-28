import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { teacherService } from '../services/api';
import TeacherForm from '../components/TeacherForm';
import { Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

function TeacherFormPage() {
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const response = await teacherService.getOne(id);
        setInitialData(response.data.data);
      } catch (error) {
        setError('Failed to fetch teacher data');
        toast.error('Failed to fetch teacher data');
      }
    };

    if (isEdit) {
      fetchTeacher();
    }
  }, [id, isEdit]);

  const handleSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await teacherService.update(id, data);
        toast.success('Teacher updated successfully!');
      } else {
        await teacherService.create(data);
        toast.success('Teacher created successfully!');
        // Clear any saved draft after successful creation
        localStorage.removeItem('teacherDraft');
      }
      navigate('/teachers');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save teacher');
      toast.error('Failed to save teacher');
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4">{isEdit ? 'Edit Teacher' : 'Add New Teacher'}</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <TeacherForm
        onSubmit={handleSubmit}
        initialData={initialData}
        isLoading={loading}
      />
    </div>
  );
}


export default TeacherFormPage;