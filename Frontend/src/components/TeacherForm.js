import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';

function TeacherForm({ onSubmit, initialData, isLoading }) {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    phone: '',
    university_name: '',
    gender: '',
    year_joined: '',
    department: '',
    designation: '',
    qualification: '',
  });
  const [errors, setErrors] = useState({});
  const autoSaveTimeout = useRef(null);
  const lastSaved = useRef(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load draft on component mount
  useEffect(() => {
    if (!initialData) {
      loadDraft();
    }
  }, [initialData]);

  // Auto-save functionality
  useEffect(() => {
    // Check if form has data (not empty)
    const hasData = Object.values(formData).some(value => value !== '' && value !== undefined);
    
    if (hasData && !initialData && !isLoading) {
      setHasUnsavedChanges(true);
      
      // Clear previous timeout
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
      
      // Set new timeout for auto-save (5 seconds after last change)
      autoSaveTimeout.current = setTimeout(() => {
        saveDraft();
      }, 5000);
    }
    
    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, [formData, initialData, isLoading]);

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email || '',
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        password: '',
        phone: initialData.phone || '',
        university_name: initialData.university_name || '',
        gender: initialData.gender || '',
        year_joined: initialData.year_joined || '',
        department: initialData.department || '',
        designation: initialData.designation || '',
        qualification: initialData.qualification || '',
      });
    }
  }, [initialData]);

  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem('teacherDraft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        const draftTime = new Date(draft.timestamp);
        const now = new Date();
        const hoursDiff = (now - draftTime) / (1000 * 60 * 60);
        
        // Only show prompt if draft is less than 24 hours old
        if (hoursDiff < 24 && draft.formData) {
          const confirmLoad = window.confirm(
            `You have a saved draft from ${new Date(draft.timestamp).toLocaleString()}\n\n` +
            `Draft contains:\n` +
            `- Name: ${draft.formData.first_name || 'Not set'} ${draft.formData.last_name || 'Not set'}\n` +
            `- University: ${draft.formData.university_name || 'Not set'}\n` +
            `- Email: ${draft.formData.email || 'Not set'}\n\n` +
            `Do you want to load this draft?`
          );
          
          if (confirmLoad) {
            setFormData(draft.formData);
            toast.info('Draft loaded successfully!', {
              position: "top-right",
              autoClose: 3000,
            });
            // Clear draft after loading
            localStorage.removeItem('teacherDraft');
            setHasUnsavedChanges(false);
          } else {
            // Clear old draft
            localStorage.removeItem('teacherDraft');
          }
        } else if (hoursDiff >= 24) {
          // Clear expired draft
          localStorage.removeItem('teacherDraft');
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const saveDraft = () => {
    try {
      const draft = {
        formData: { ...formData },
        timestamp: new Date().toISOString(),
        lastUpdated: new Date().toLocaleString(),
        version: '1.0',
        formType: 'teacher'
      };
      
      localStorage.setItem('teacherDraft', JSON.stringify(draft));
      lastSaved.current = new Date();
      setHasUnsavedChanges(false);
      
      toast.success('Draft saved automatically!', {
        position: "top-right",
        autoClose: 2000,
        icon: "💾"
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const manualSaveDraft = () => {
    saveDraft();
    toast.info('Draft saved manually', {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const clearDraft = () => {
    if (window.confirm('Are you sure you want to clear the saved draft?')) {
      localStorage.removeItem('teacherDraft');
      setHasUnsavedChanges(false);
      toast.info('Draft cleared', {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.university_name) newErrors.university_name = 'University name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.year_joined) newErrors.year_joined = 'Year joined is required';
    if (!initialData && !formData.email) newErrors.email = 'Email is required';
    if (!initialData && !formData.password) newErrors.password = 'Password is required';
    if (!initialData && formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (formData.year_joined && (formData.year_joined < 1900 || formData.year_joined > new Date().getFullYear())) {
      newErrors.year_joined = `Year must be between 1900 and ${new Date().getFullYear()}`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submitData = { ...formData };
      
      // Convert gender to lowercase to match backend requirements
      if (submitData.gender) {
        submitData.gender = submitData.gender.toLowerCase();
      }
      
      if (initialData) {
        delete submitData.password;
        delete submitData.email;
      }
      
      // Debug log to see what's being sent
      console.log('Submitting teacher data:', submitData);
      
      // Clear draft on successful submit
      localStorage.removeItem('teacherDraft');
      setHasUnsavedChanges(false);
      
      onSubmit(submitData);
    }
  };

  // Warn before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges && !initialData) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, initialData]);

  // Check for auto-save status
  const getAutoSaveStatus = () => {
    if (hasUnsavedChanges) {
      return 'Draft will auto-save in 5 seconds...';
    }
    if (lastSaved.current) {
      return `Last saved: ${lastSaved.current.toLocaleTimeString()}`;
    }
    return 'Changes will be saved automatically';
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-0 pt-4">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            {initialData ? 'Edit Teacher Information' : 'Create New Teacher'}
          </h5>
          {!initialData && (
            <div className="d-flex gap-2">
              <Button 
                variant="outline-info" 
                size="sm"
                onClick={manualSaveDraft}
                title="Save draft manually"
              >
                💾 Save Draft
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={clearDraft}
                title="Clear saved draft"
              >
                🗑️ Clear Draft
              </Button>
            </div>
          )}
        </div>
        {!initialData && (
          <small className="text-muted">
            🔄 Auto-save: {getAutoSaveStatus()}
          </small>
        )}
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit} autoComplete="off">
          {!initialData && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="teacher@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password *</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>
            </>
          )}

          <Form.Group className="mb-3">
            <Form.Label>First Name *</Form.Label>
            <Form.Control
              type="text"
              name="first_name"
              placeholder="Enter first name"
              value={formData.first_name}
              onChange={handleChange}
              isInvalid={!!errors.first_name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.first_name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Last Name *</Form.Label>
            <Form.Control
              type="text"
              name="last_name"
              placeholder="Enter last name"
              value={formData.last_name}
              onChange={handleChange}
              isInvalid={!!errors.last_name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.last_name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>University Name *</Form.Label>
            <Form.Control
              type="text"
              name="university_name"
              placeholder="e.g., Harvard University"
              value={formData.university_name}
              onChange={handleChange}
              isInvalid={!!errors.university_name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.university_name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Gender *</Form.Label>
            <Form.Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              isInvalid={!!errors.gender}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.gender}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Year Joined *</Form.Label>
            <Form.Control
              type="number"
              name="year_joined"
              placeholder="e.g., 2020"
              value={formData.year_joined}
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear()}
              isInvalid={!!errors.year_joined}
            />
            <Form.Control.Feedback type="invalid">
              {errors.year_joined}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Department</Form.Label>
            <Form.Control
              type="text"
              name="department"
              placeholder="e.g., Computer Science"
              value={formData.department}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Designation</Form.Label>
            <Form.Control
              type="text"
              name="designation"
              placeholder="e.g., Professor"
              value={formData.designation}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Qualification</Form.Label>
            <Form.Control
              type="text"
              name="qualification"
              placeholder="e.g., PhD, Masters"
              value={formData.qualification}
              onChange={handleChange}
            />
          </Form.Group>

          <Button 
            type="submit" 
            variant="primary" 
            disabled={isLoading}
            className="w-100"
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Teacher' : 'Create Teacher'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default TeacherForm;