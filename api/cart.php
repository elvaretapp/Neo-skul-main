<?php
// File: api/cart.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. TAMBAH KE KERANJANG (POST)
if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    // Validasi data yang dikirim dari React
    if(!empty($data->user_id) && !empty($data->course_id)) {
        
        // Cek apakah produk ini SUDAH ADA di keranjang user tersebut
        $checkQuery = "SELECT id FROM carts WHERE user_id = :uid AND course_id = :cid";
        $stmt = $conn->prepare($checkQuery);
        $stmt->bindParam(":uid", $data->user_id);
        $stmt->bindParam(":cid", $data->course_id);
        $stmt->execute();
        
        if($stmt->rowCount() > 0){
            // Jika sudah ada, jangan double
            echo json_encode(["message" => "Produk sudah ada di keranjang."]);
        } else {
            // Jika belum ada, masukkan ke database
            $query = "INSERT INTO carts (user_id, course_id) VALUES (:uid, :cid)";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(":uid", $data->user_id);
            $stmt->bindParam(":cid", $data->course_id);
            
            if($stmt->execute()) {
                http_response_code(201); // Created
                echo json_encode(["message" => "Berhasil masuk keranjang database."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Gagal menyimpan ke database."]);
            }
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Data user_id atau course_id tidak lengkap."]);
    }
}

// 2. LIHAT KERANJANG USER (GET)
elseif ($method == 'GET') {
    if(isset($_GET['user_id'])) {
        // Query ini menggabungkan tabel 'carts' dan 'courses'
        // Pastikan nama tabel di database Anda adalah 'courses', bukan 'products'
        $query = "SELECT c.id as cart_id, p.id as course_id, p.title, p.price, p.image 
                  FROM carts c 
                  JOIN courses p ON c.course_id = p.id 
                  WHERE c.user_id = :uid";
                  
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":uid", $_GET['user_id']);
        
        if ($stmt->execute()) {
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($items);
        } else {
            // Tampilkan error jika query gagal
            http_response_code(500);
            echo json_encode(["message" => "Gagal mengambil data."]);
        }
    } else {
        echo json_encode([]); // Return array kosong jika tidak ada user_id
    }
}
// 3. HAPUS DARI KERANJANG (DELETE)
elseif ($method == 'DELETE') {
    $data = json_decode(file_get_contents("php://input"));
    
    if(!empty($data->cart_id)) {
        $query = "DELETE FROM carts WHERE id = :cid";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":cid", $data->cart_id);
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Item dihapus."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Gagal menghapus."]);
        }
    }
}
?>