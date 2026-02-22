<?php
// File: api/login.php

// 1. Setup CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Tangani Preflight Request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config/database.php';

// 2. Ambil Data
$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(["message" => "Email/Username dan Password wajib diisi."]);
    exit();
}

try {
    // 3. Cari User berdasarkan Email ATAU Username
    // (Frontend mengirim input ke variabel 'email', tapi isinya bisa username)
    $query = "SELECT * FROM users WHERE email = :input OR username = :input";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':input', $data->email);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // 4. Verifikasi Password
    // Jika user ditemukan DAN password cocok dengan hash di database
    if ($user && password_verify($data->password, $user['password'])) {
        
        // Hapus password agar tidak dikirim ke frontend
        unset($user['password']);
        
        // Kirim respon sukses
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Login berhasil",
            "user" => $user
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Email atau Password salah."
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}
?>