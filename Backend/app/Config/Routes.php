<?php
// Handle OPTIONS requests for CORS (only for web requests)
if (php_sapi_name() !== 'cli' && isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    exit(0);
}

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// API Routes
$routes->post('api/auth/register', 'Auth::register');
$routes->post('api/auth/login', 'Auth::login');
$routes->post('api/teachers', 'Teacher::createTeacher');
$routes->get('api/teachers', 'Teacher::getAllTeachers');
$routes->get('api/teachers/(:num)', 'Teacher::getTeacher/$1');
$routes->put('api/teachers/(:num)', 'Teacher::updateTeacher/$1');
$routes->delete('api/teachers/(:num)', 'Teacher::deleteTeacher/$1');
$routes->get('api/activity/logs', 'Activity::getLogs');
$routes->delete('activity/clear', 'Activity::clear');