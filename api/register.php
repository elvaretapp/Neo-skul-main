<?php
// File: api/register.php

// 1. Setup CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config/database.php';

// 2. Cek Data Masuk
$data = json_decode(file_get_contents("php://input"));

if (empty($data->name) || empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(["message" => "Data tidak lengkap."]);
    exit();
}

try {
    // 3. Cek Email (Tetap sama)
    $checkQuery = "SELECT id FROM users WHERE email = ?";
    $stmt = $conn->prepare($checkQuery);
    $stmt->execute([$data->email]);
    
    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["message" => "Email sudah terdaftar."]);
        exit();
    }

    // 4. Insert Data (BAGIAN INI YANG DIPERBAIKI)
    // Kita ubah 'name' menjadi 'username' agar sesuai dengan database Anda
    $query = "INSERT INTO users (username, email, password, role) VALUES (:username, :email, :pass, :role)";
    
    $stmt = $conn->prepare($query);
    
    // Hash Password
    $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
    $role = 'client'; // Default role

    // Binding: Data 'name' dari React dimasukkan ke kolom 'username' di MySQL
    $stmt->bindParam(':username', $data->name); 
    $stmt->bindParam(':email', $data->email);
    $stmt->bindParam(':pass', $hashed_password);
    $stmt->bindParam(':role', $role);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["message" => "Registrasi berhasil!"]);
    } else {
        throw new Exception("Gagal menyimpan data.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error: " . $e->getMessage()]);
}
?>