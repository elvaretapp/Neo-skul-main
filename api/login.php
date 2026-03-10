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

$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(["message" => "Email dan Password wajib diisi."]);
    exit();
}

try {
    // FIX: pakai :email dan :username terpisah, bukan :input dua kali
    $query = "SELECT * FROM users WHERE email = :email OR username = :username";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':email', $data->email);
    $stmt->bindParam(':username', $data->email); // input sama, bisa email atau username
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($data->password, $user['password'])) {

        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));

        $stmtDel = $conn->prepare("DELETE FROM user_sessions WHERE user_id = ?");
        $stmtDel->execute([$user['id']]);

        $stmtSess = $conn->prepare("INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)");
        $stmtSess->execute([$user['id'], $token, $expiresAt]);

        unset($user['password']);

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Login berhasil",
            "token"   => $token,
            "user"    => $user
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Email atau Password salah."]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}
?>