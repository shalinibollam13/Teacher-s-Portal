<?php namespace App\Controllers;

use CodeIgniter\API\ResponseTrait;
use App\Libraries\JWT;

class Activity extends BaseController
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

    public function getLogs()
    {
        $userData = $this->authenticate();
        if ($userData instanceof \CodeIgniter\HTTP\Response) {
            return $userData;
        }

        $db = \Config\Database::connect();
        $logs = $db->table('activity_logs')
            ->select('activity_logs.*, auth_user.email, auth_user.first_name, auth_user.last_name')
            ->join('auth_user', 'auth_user.id = activity_logs.user_id')
            ->orderBy('created_at', 'DESC')
            ->limit(100)
            ->get()
            ->getResultArray();

        return $this->respond([
            'status' => true,
            'data' => $logs
        ]);
    }

public function clear()
{
    $userId = $this->request->user->id; // Get ID from JWT token
    $this->model->where('user_id', $userId)->delete();
    
    return $this->respondDeleted(['message' => 'Activity logs cleared']);
}
}