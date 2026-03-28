<?php namespace App\Libraries;

use Firebase\JWT\JWT as FirebaseJWT;
use Firebase\JWT\Key;

class JWT
{
    private $secret;
    private $expiry;

    public function __construct()
    {
        $this->secret = getenv('jwt.secret');
        $this->expiry = getenv('jwt.expiry');
        
        // Ensure secret is long enough (at least 32 characters)
        if (strlen($this->secret) < 32) {
            $this->secret = $this->secret . str_repeat('x', 32 - strlen($this->secret));
        }
    }

    public function encode($data)
    {
        $issuedAt = time();
        $expirationTime = $issuedAt + $this->expiry;

        $payload = [
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'data' => $data
        ];

        return FirebaseJWT::encode($payload, $this->secret, 'HS256');
    }

    public function decode($token)
    {
        try {
            $decoded = FirebaseJWT::decode($token, new Key($this->secret, 'HS256'));
            return (array) $decoded->data;
        } catch (\Exception $e) {
            return null;
        }
    }
}