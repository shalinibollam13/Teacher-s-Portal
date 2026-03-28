<?php namespace App\Controllers;

use CodeIgniter\API\ResponseTrait;
use App\Models\AuthUserModel;
use App\Models\TeacherModel;
use App\Libraries\JWT;

class Teacher extends BaseController
{
    use ResponseTrait;

    private $jwt;

    public function __construct()
    {
        $this->jwt = new JWT();
    }

    private function authenticate()
    {
        $token = $this->request->getHeaderLine('Authorization');
        $token = str_replace('Bearer ', '', $token);
        
        $userData = $this->jwt->decode($token);
        
        if (!$userData) {
            return $this->failUnauthorized('Invalid token');
        }
        
        return $userData;
    }

    private function logActivity($userId, $action, $details = null)
    {
        $db = \Config\Database::connect();
        $data = [
            'user_id' => $userId,
            'action' => $action,
            'details' => $details,
            'ip_address' => $this->request->getIPAddress(),
            'user_agent' => $this->request->getUserAgent()->getAgentString()
        ];
        $db->table('activity_logs')->insert($data);
    }

    public function createTeacher()
    {
        $userData = $this->authenticate();
        if ($userData instanceof \CodeIgniter\HTTP\Response) {
            return $userData;
        }

        $rules = [
            'email' => 'required|valid_email|is_unique[auth_user.email]',
            'first_name' => 'required|min_length[2]',
            'last_name' => 'required|min_length[2]',
            'password' => 'required|min_length[6]',
            'university_name' => 'required',
            'gender' => 'required|in_list[male,female,other]',
            'year_joined' => 'required|numeric|min_length[4]|max_length[4]'
        ];

        if (!$this->validate($rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $db = \Config\Database::connect();
        $db->transStart();

        try {
            $userModel = new AuthUserModel();
            $userId = $userModel->insert([
                'email' => $this->request->getVar('email'),
                'first_name' => $this->request->getVar('first_name'),
                'last_name' => $this->request->getVar('last_name'),
                'password' => $this->request->getVar('password'),
                'phone' => $this->request->getVar('phone')
            ]);

            $teacherModel = new TeacherModel();
            $teacherId = $teacherModel->insert([
                'user_id' => $userId,
                'university_name' => $this->request->getVar('university_name'),
                'gender' => $this->request->getVar('gender'),
                'year_joined' => $this->request->getVar('year_joined'),
                'department' => $this->request->getVar('department'),
                'designation' => $this->request->getVar('designation'),
                'qualification' => $this->request->getVar('qualification')
            ]);

            // Log activity
            $this->logActivity(
                $userData['user_id'],
                'create_teacher',
                "Created teacher: {$this->request->getVar('first_name')} {$this->request->getVar('last_name')} (ID: {$teacherId})"
            );

            $db->transComplete();

            return $this->respondCreated([
                'status' => true,
                'message' => 'Teacher created successfully'
            ]);

        } catch (\Exception $e) {
            $db->transRollback();
            return $this->fail($e->getMessage());
        }
    }

    public function getAllTeachers()
    {
        $userData = $this->authenticate();
        if ($userData instanceof \CodeIgniter\HTTP\Response) {
            return $userData;
        }

        $teacherModel = new TeacherModel();
        $teachers = $teacherModel
            ->select('teachers.*, auth_user.email, auth_user.first_name, auth_user.last_name, auth_user.phone')
            ->join('auth_user', 'auth_user.id = teachers.user_id')
            ->findAll();

        return $this->respond([
            'status' => true,
            'data' => $teachers
        ]);
    }

    public function getTeacher($id)
    {
        $userData = $this->authenticate();
        if ($userData instanceof \CodeIgniter\HTTP\Response) {
            return $userData;
        }

        $teacherModel = new TeacherModel();
        $teacher = $teacherModel
            ->select('teachers.*, auth_user.email, auth_user.first_name, auth_user.last_name, auth_user.phone')
            ->join('auth_user', 'auth_user.id = teachers.user_id')
            ->where('teachers.id', $id)
            ->first();

        if (!$teacher) {
            return $this->failNotFound('Teacher not found');
        }

        return $this->respond([
            'status' => true,
            'data' => $teacher
        ]);
    }

    public function updateTeacher($id)
    {
        $userData = $this->authenticate();
        if ($userData instanceof \CodeIgniter\HTTP\Response) {
            return $userData;
        }

        $teacherModel = new TeacherModel();
        $teacher = $teacherModel->find($id);

        if (!$teacher) {
            return $this->failNotFound('Teacher not found');
        }

        $db = \Config\Database::connect();
        $db->transStart();

        try {
            // Update teacher data
            $teacherData = [];
            $fields = ['university_name', 'gender', 'year_joined', 'department', 'designation', 'qualification'];
            foreach ($fields as $field) {
                if ($this->request->getVar($field) !== null) {
                    $teacherData[$field] = $this->request->getVar($field);
                }
            }
            
            if (!empty($teacherData)) {
                $teacherModel->update($id, $teacherData);
            }

            // Update user data
            $userModel = new AuthUserModel();
            $userData = [];
            $userFields = ['first_name', 'last_name', 'phone'];
            foreach ($userFields as $field) {
                if ($this->request->getVar($field) !== null) {
                    $userData[$field] = $this->request->getVar($field);
                }
            }
            
            if (!empty($userData)) {
                $userModel->update($teacher['user_id'], $userData);
            }

            // Log activity
            $this->logActivity(
                $userData['user_id'],
                'update_teacher',
                "Updated teacher ID: {$id}"
            );

            $db->transComplete();

            return $this->respond([
                'status' => true,
                'message' => 'Teacher updated successfully'
            ]);

        } catch (\Exception $e) {
            $db->transRollback();
            return $this->fail($e->getMessage());
        }
    }

    public function deleteTeacher($id)
    {
        $userData = $this->authenticate();
        if ($userData instanceof \CodeIgniter\HTTP\Response) {
            return $userData;
        }

        $teacherModel = new TeacherModel();
        $teacher = $teacherModel
            ->select('teachers.*, auth_user.first_name, auth_user.last_name')
            ->join('auth_user', 'auth_user.id = teachers.user_id')
            ->where('teachers.id', $id)
            ->first();

        if (!$teacher) {
            return $this->failNotFound('Teacher not found');
        }

        $db = \Config\Database::connect();
        $db->transStart();

        try {
            // Log activity
            $this->logActivity(
                $userData['user_id'],
                'delete_teacher',
                "Deleted teacher: {$teacher['first_name']} {$teacher['last_name']} (ID: {$id})"
            );

            $teacherModel->delete($id);
            $userModel = new AuthUserModel();
            $userModel->delete($teacher['user_id']);
            $db->transComplete();

            return $this->respond([
                'status' => true,
                'message' => 'Teacher deleted successfully'
            ]);

        } catch (\Exception $e) {
            $db->transRollback();
            return $this->fail($e->getMessage());
        }
    }
}