<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config/database.php';

$headers = getallheaders();
$token = $headers['X-Auth-Token'] ?? str_replace('Bearer ', '', $headers['Authorization'] ?? '') ?: null;

if ($token) {
    $stmt = $conn->prepare("DELETE FROM user_sessions WHERE token = ?");
    $stmt->execute([$token]);
}

echo json_encode(["success" => true, "message" => "Logout berhasil"]);
?>
