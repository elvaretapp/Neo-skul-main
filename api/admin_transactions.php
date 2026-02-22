<?php
// api/admin_transactions.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

include_once 'config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET: Ambil daftar transaksi
if ($method === 'GET') {
    try {
        // Query disesuaikan untuk 2 TABEL (transactions & transaction_items)
        // Kita gunakan GROUP_CONCAT untuk menggabungkan nama kursus jika user beli banyak sekaligus
        $sql = "SELECT t.*, u.username, u.email, 
                GROUP_CONCAT(c.title SEPARATOR ', ') as course_names
                FROM transactions t 
                JOIN users u ON t.user_id = u.id 
                LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
                LEFT JOIN courses c ON ti.course_id = c.id
                GROUP BY t.id
                ORDER BY t.created_at DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($transactions);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}

// POST: Update Status
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (isset($data->transaction_id) && isset($data->status)) {
        // Update status di tabel transactions
        $sql = "UPDATE transactions SET status = :status WHERE id = :id";
        $stmt = $conn->prepare($sql);
        
        // Status yang valid untuk 2 tabel: 'approved' atau 'rejected'
        if ($stmt->execute([':status' => $data->status, ':id' => $data->transaction_id])) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Gagal update status database."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Data tidak lengkap."]);
    }
}
?>