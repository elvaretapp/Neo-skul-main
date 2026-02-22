<?php
// api/mentor_applications.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

switch ($method) {
    case 'GET':
        if ($user_id) {
            $stmt = $conn->prepare("SELECT * FROM mentor_applications WHERE user_id = ? ORDER BY id DESC LIMIT 1");
            $stmt->execute([$user_id]);
            $application = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($application ? $application : ["status" => "none"]);
        } else {
            // PERBAIKAN PENTING DI SINI:
            // 1. Menggunakan 'u.username' sesuai CSV database Anda (bukan u.name)
            // 2. Menggunakan 'AS name' agar React tetap bisa membacanya sebagai 'name'
            // 3. Tetap pakai LEFT JOIN untuk keamanan jika data user rusak
            
            $sql = "SELECT ma.*, 
                           IFNULL(u.username, 'Unknown User') as name, 
                           IFNULL(u.email, 'No Email') as email 
                    FROM mentor_applications ma 
                    LEFT JOIN users u ON ma.user_id = u.id 
                    WHERE ma.status = 'pending' 
                    ORDER BY ma.created_at ASC";
            
            try {
                $stmt = $conn->query($sql);
                $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($applications);
            } catch (PDOException $e) {
                // Tampilkan error jika nama kolom masih salah
                http_response_code(500);
                echo json_encode(["message" => "Database Error: " . $e->getMessage()]);
            }
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->user_id)) {
            http_response_code(400);
            echo json_encode(["message" => "User ID required"]);
            exit();
        }

        // Cek duplikasi
        $check = $conn->prepare("SELECT id FROM mentor_applications WHERE user_id = ? AND status = 'pending'");
        $check->execute([$data->user_id]);
        if ($check->rowCount() > 0) {
            echo json_encode(["message" => "Anda sudah memiliki pengajuan yang sedang diproses."]);
            exit();
        }

        $sql = "INSERT INTO mentor_applications (user_id, status) VALUES (?, 'pending')";
        $stmt = $conn->prepare($sql);
        
        if($stmt->execute([$data->user_id])) {
            echo json_encode(["message" => "Pengajuan berhasil dikirim."]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Gagal mengirim pengajuan."]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->id) || empty($data->status)) {
            http_response_code(400);
            echo json_encode(["message" => "ID dan Status required"]);
            exit();
        }

        try {
            $conn->beginTransaction();

            $stmt = $conn->prepare("UPDATE mentor_applications SET status = ? WHERE id = ?");
            $stmt->execute([$data->status, $data->id]);

            if ($data->status === 'approved') {
                $getApp = $conn->prepare("SELECT user_id FROM mentor_applications WHERE id = ?");
                $getApp->execute([$data->id]);
                $row = $getApp->fetch(PDO::FETCH_ASSOC);

                if ($row) {
                    $updateUser = $conn->prepare("UPDATE users SET role = 'mentor' WHERE id = ?");
                    $updateUser->execute([$row['user_id']]);
                }
            }

            $conn->commit();
            echo json_encode(["message" => "Status berhasil diperbarui."]);

        } catch (Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["message" => "Error: " . $e->getMessage()]);
        }
        break;
}
?>