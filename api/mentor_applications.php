<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include_once 'config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // GET: ambil semua lamaran (admin) atau status lamaran user tertentu
    case 'GET':
        $user_id = $_GET['user_id'] ?? null;

        try {
            if ($user_id) {
                // Cek status lamaran milik user ini (untuk dashboard klien)
                $stmt = $conn->prepare("SELECT id, status, reject_reason, created_at FROM mentor_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1");
                $stmt->execute([$user_id]);
                $app = $stmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode($app ?: ["status" => "none"]);
            } else {
                // Ambil semua lamaran pending (untuk admin)
                $stmt = $conn->query("SELECT ma.*, u.email FROM mentor_applications ma JOIN users u ON ma.user_id = u.id WHERE ma.status = 'pending' ORDER BY ma.created_at DESC");
                $apps = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($apps);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Error: " . $e->getMessage()]);
        }
        break;

    // POST: kirim lamaran baru dari klien
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        $user_id    = $data['user_id'] ?? null;
        $name       = $data['name'] ?? '';
        $phone      = $data['phone'] ?? '';
        $expertise  = $data['expertise'] ?? '';
        $experience = $data['experience'] ?? 0;
        $instagram  = $data['instagram'] ?? '';
        $linkedin   = $data['linkedin'] ?? '';
        $cv_link    = $data['cv_link'] ?? '';
        $reason     = $data['reason'] ?? '';

        if (!$user_id || !$name || !$phone || !$expertise || !$cv_link || !$reason) {
            http_response_code(400);
            echo json_encode(["message" => "Semua field wajib diisi"]);
            exit();
        }

        try {
            // Cek apakah sudah ada lamaran pending
            $check = $conn->prepare("SELECT id FROM mentor_applications WHERE user_id = ? AND status = 'pending'");
            $check->execute([$user_id]);
            if ($check->fetch()) {
                http_response_code(400);
                echo json_encode(["message" => "Kamu sudah memiliki lamaran yang sedang diproses"]);
                exit();
            }

            $stmt = $conn->prepare("INSERT INTO mentor_applications (user_id, name, phone, expertise, experience, instagram, linkedin, cv_link, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            if ($stmt->execute([$user_id, $name, $phone, $expertise, $experience, $instagram, $linkedin, $cv_link, $reason])) {
                echo json_encode(["success" => true, "message" => "Lamaran berhasil dikirim!"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Gagal menyimpan lamaran"]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Error: " . $e->getMessage()]);
        }
        break;

    // PUT: admin approve atau reject lamaran
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        $id            = $data['id'] ?? null;
        $status        = $data['status'] ?? null;
        $reject_reason = $data['reject_reason'] ?? null;

        if (!$id || !$status) {
            http_response_code(400);
            echo json_encode(["message" => "ID dan status wajib diisi"]);
            exit();
        }

        try {
            // Update status lamaran
            $stmt = $conn->prepare("UPDATE mentor_applications SET status = ?, reject_reason = ? WHERE id = ?");
            $stmt->execute([$status, $reject_reason, $id]);

            // Jika approved, ubah role user jadi mentor
            if ($status === 'approved') {
                // Ambil user_id dari lamaran
                $getApp = $conn->prepare("SELECT user_id, name, expertise FROM mentor_applications WHERE id = ?");
                $getApp->execute([$id]);
                $app = $getApp->fetch(PDO::FETCH_ASSOC);

                if ($app) {
                    // Update role + specialization dari expertise yang diisi
                    $updateUser = $conn->prepare("UPDATE users SET role = 'mentor', specialization = ? WHERE id = ?");
                    $updateUser->execute([$app['expertise'], $app['user_id']]);
                }
            }

            echo json_encode(["success" => true, "message" => "Status lamaran diperbarui"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Error: " . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
}
?>
