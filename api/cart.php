<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token");

include_once 'config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method == 'OPTIONS') { http_response_code(200); exit(); }

// Fungsi verifikasi token - sama persis dengan cara di auth.php
function verifyToken($conn) {
    $token = null;

    // Cara 1: loop getallheaders() dengan strtolower (case-insensitive)
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

    if (!$token) return null;

    $stmt = $conn->prepare("SELECT u.id, u.role FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > NOW()");
    $stmt->execute([$token]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

if ($method == 'POST') {
    $user = verifyToken($conn);
    if (!$user) {
        http_response_code(401);
        echo json_encode(["message" => "Silakan login terlebih dahulu."]);
        exit();
    }

    $data = json_decode(file_get_contents("php://input"));
    $course_id = $data->course_id ?? null;
    $user_id = $user['id'];

    if (!$course_id) {
        http_response_code(400);
        echo json_encode(["message" => "course_id tidak lengkap."]);
        exit();
    }

    $checkQuery = "SELECT id FROM carts WHERE user_id = ? AND course_id = ?";
    $stmt = $conn->prepare($checkQuery);
    $stmt->execute([$user_id, $course_id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["message" => "Produk sudah ada di keranjang."]);
    } else {
        $stmt = $conn->prepare("INSERT INTO carts (user_id, course_id) VALUES (?, ?)");
        if ($stmt->execute([$user_id, $course_id])) {
            http_response_code(201);
            echo json_encode(["message" => "Berhasil masuk keranjang."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Gagal menyimpan ke database."]);
        }
    }
}

elseif ($method == 'GET') {
    $user = verifyToken($conn);
    if (!$user) {
        http_response_code(401);
        echo json_encode(["message" => "Silakan login terlebih dahulu."]);
        exit();
    }

    $user_id = $user['id'];
    $query = "SELECT c.id as cart_id, p.id as course_id, p.title, p.price, p.image 
              FROM carts c JOIN courses p ON c.course_id = p.id 
              WHERE c.user_id = ?";
    $stmt = $conn->prepare($query);
    if ($stmt->execute([$user_id])) {
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Gagal mengambil data."]);
    }
}

elseif ($method == 'DELETE') {
    $user = verifyToken($conn);
    if (!$user) {
        http_response_code(401);
        echo json_encode(["message" => "Silakan login terlebih dahulu."]);
        exit();
    }

    $data = json_decode(file_get_contents("php://input"));
    $cart_id = $data->cart_id ?? null;

    if (!$cart_id) {
        http_response_code(400);
        echo json_encode(["message" => "cart_id diperlukan."]);
        exit();
    }

    $stmt = $conn->prepare("DELETE FROM carts WHERE id = ? AND user_id = ?");
    if ($stmt->execute([$cart_id, $user['id']])) {
        echo json_encode(["message" => "Item dihapus."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Gagal menghapus."]);
    }
}
?>
