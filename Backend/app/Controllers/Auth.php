<?php namespace App\Controllers;

use CodeIgniter\API\ResponseTrait;
use App\Models\AuthUserModel;
use App\Libraries\JWT;

class Auth extends BaseController
{
    use ResponseTrait;

    private $jwt;

    public function __construct()
    {
        $this->jwt = new JWT();
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

    public function register()
    {
        $rules = [
            'email' => 'required|valid_email|is_unique[auth_user.email]',
            'first_name' => 'required|min_length[2]',
            'last_name' => 'required|min_length[2]',
            'password' => 'required|min_length[6]',
            'phone' => 'permit_empty'
        ];

        if (!$this->validate($rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $userModel = new AuthUserModel();
        
        $userData = [
            'email' => $this->request->getVar('email'),
            'first_name' => $this->request->getVar('first_name'),
            'last_name' => $this->request->getVar('last_name'),
            'password' => $this->request->getVar('password'),
            'phone' => $this->request->getVar('phone')
        ];

        $userId = $userModel->insert($userData);

        if ($userId) {
            return $this->respondCreated([
                'status' => true,
                'message' => 'User registered successfully',
                'user_id' => $userId
            ]);
        }

        return $this->fail('Registration failed');
    }

    public function login()
    {
        $rules = [
            'email' => 'required|valid_email',
            'password' => 'required'
        ];

        if (!$this->validate($rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $userModel = new AuthUserModel();
        $user = $userModel->where('email', $this->request->getVar('email'))->first();

        if (!$user || !password_verify($this->request->getVar('password'), $user['password'])) {
            return $this->failUnauthorized('Invalid credentials');
        }

        // Log login activity
        $this->logActivity(
            $user['id'],
            'login',
            "User logged in from IP: {$this->request->getIPAddress()}"
        );

        $tokenData = [
            'user_id' => $user['id'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name']
        ];

        $token = $this->jwt->encode($tokenData);

        return $this->respond([
            'status' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => $tokenData
        ]);
    }
}