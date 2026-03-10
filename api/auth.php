<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config/database.php';

// Ambil token dari berbagai sumber (Apache kadang rename/strip headers)
$token = null;

// Cara 1: getallheaders()
$headers = getallheaders();
foreach ($headers as $key => $value) {
    if (strtolower($key) === 'x-auth-token') {
        $token = $value;
        break;
    }
}

// Cara 2: $_SERVER dengan HTTP_ prefix
if (!$token && isset($_SERVER['HTTP_X_AUTH_TOKEN'])) {
    $token = $_SERVER['HTTP_X_AUTH_TOKEN'];
}

// Cara 3: Authorization header
if (!$token && isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);
}
if (!$token && isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
}

// Cara 4: Query param fallback
if (!$token && isset($_GET['token'])) {
    $token = $_GET['token'];
}

// Cara 5: POST body fallback
if (!$token) {
    $body = json_decode(file_get_contents("php://input"), true);
    if (!empty($body['token'])) {
        $token = $body['token'];
    }
}

if (!$token) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Token tidak ditemukan"]);
    exit();
}

try {
    $stmt = $conn->prepare("SELECT u.id, u.username, u.email, u.role, u.avatar, u.is_active, s.expires_at 
                            FROM user_sessions s 
                            JOIN users u ON s.user_id = u.id 
                            WHERE s.token = ? AND s.expires_at > NOW()");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Session tidak valid atau sudah expired"]);
        exit();
    }

    // Perpanjang session
    $newExpiry = date('Y-m-d H:i:s', strtotime('+24 hours'));
    $conn->prepare("UPDATE user_sessions SET expires_at = ? WHERE token = ?")->execute([$newExpiry, $token]);

    echo json_encode([
        "success" => true,
        "user" => [
            "id"       => $user['id'],
            "username" => $user['username'],
            "email"    => $user['email'],
            "role"     => $user['role'],
            "avatar"   => $user['avatar'],
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>