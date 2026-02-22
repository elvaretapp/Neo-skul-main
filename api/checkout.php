<?php
// api/checkout.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

include_once 'config/database.php';

// Cek apakah ada file gambar dan data user
if (isset($_FILES['proof']) && isset($_POST['user_id']) && isset($_POST['items'])) {
    $user_id = $_POST['user_id'];
    $items = json_decode($_POST['items'], true); // Convert string JSON kembali ke Array
    $total_amount = $_POST['total_amount'];
    
    // 1. Upload Gambar
    $targetDir = "../assets/images/proofs/";
    if (!file_exists($targetDir)) mkdir($targetDir, 0777, true); // Buat folder jika belum ada
    
    $fileName = time() . "_" . basename($_FILES["proof"]["name"]);
    $targetFilePath = $targetDir . $fileName;
    $dbFilePath = "/assets/images/proofs/" . $fileName; // Path untuk database

    if (move_uploaded_file($_FILES["proof"]["tmp_name"], $targetFilePath)) {
        
        try {
            $conn->beginTransaction();

            // 2. Insert ke Tabel Transactions
            $sql = "INSERT INTO transactions (user_id, total_amount, proof_image, status) VALUES (:uid, :total, :proof, 'pending')";
            $stmt = $conn->prepare($sql);
            $stmt->execute([':uid' => $user_id, ':total' => $total_amount, ':proof' => $dbFilePath]);
            $transaction_id = $conn->lastInsertId();

            // 3. Insert ke Tabel Transaction Items
            $sqlItem = "INSERT INTO transaction_items (transaction_id, course_id, price) VALUES (:tid, :cid, :price)";
            $stmtItem = $conn->prepare($sqlItem);

            foreach ($items as $item) {
                $stmtItem->execute([
                    ':tid' => $transaction_id,
                    ':cid' => $item['course_id'], // Pastikan key ini sesuai dari frontend
                    ':price' => $item['price']
                ]);
            }

            // 4. Hapus Keranjang User (Empty Cart)
            $sqlDel = "DELETE FROM carts WHERE user_id = :uid";
            $stmtDel = $conn->prepare($sqlDel);
            $stmtDel->execute([':uid' => $user_id]);

            $conn->commit();
            echo json_encode(["success" => true, "message" => "Checkout berhasil! Menunggu konfirmasi Admin."]);

        } catch (Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Gagal upload gambar."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Data tidak lengkap."]);
}
?>