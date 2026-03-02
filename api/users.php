<?php
// api/users.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS"); // PUT agak susah handle file, pakai POST saja
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($user);
        } else {
            // Filter user role mentor jika ada param ?role=mentor
            $role = isset($_GET['role']) ? $_GET['role'] : null;
            if ($role) {
                $stmt = $conn->prepare("SELECT * FROM users WHERE role = ? ORDER BY id DESC");
                $stmt->execute([$role]);
            } else {
                $stmt = $conn->query("SELECT * FROM users ORDER BY id DESC");
            }
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($users);
        }
        break;

    case 'POST':
        // Cek apakah ini request UPDATE PROFIL (Multipart/Form-Data)
        if (isset($_POST['action']) && $_POST['action'] === 'update_profile') {
            $userId = $_POST['id'];
            $username = $_POST['username'];
            $email = $_POST['email'];
            $specialization = $_POST['specialization'] ?? '';
            $bio = $_POST['bio'] ?? '';
            $category = $_POST['category'] ?? '';
            $cv_link = $_POST['cv_link'] ?? '';
            $phone = $_POST['phone'] ?? '';
            
            // Logic Upload Avatar
            $avatarPath = null;
            if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
                $targetDir = "../assets/images/profiles/";
                if (!file_exists($targetDir)) mkdir($targetDir, 0777, true);
                $fileName = time() . '_' . basename($_FILES['avatar']['name']);
                $targetFilePath = $targetDir . $fileName;
                if (move_uploaded_file($_FILES['avatar']['tmp_name'], $targetFilePath)) {
                    $avatarPath = "/assets/images/profiles/" . $fileName;
                }
            }

            try {
                if ($avatarPath) {
                    $sql = "UPDATE users SET username=?, email=?, specialization=?, bio=?, category=?, avatar=?, cv_link=?, phone=? WHERE id=?";
                    $stmt = $conn->prepare($sql);
                    $stmt->execute([$username, $email, $specialization, $bio, $category, $avatarPath, $cv_link, $phone, $userId]);
                } else {
                    $sql = "UPDATE users SET username=?, email=?, specialization=?, bio=?, category=?, cv_link=?, phone=? WHERE id=?";
                    $stmt = $conn->prepare($sql);
                    $stmt->execute([$username, $email, $specialization, $bio, $category, $cv_link, $phone, $userId]);
                }
                echo json_encode(["message" => "Profile updated successfully"]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["message" => "Error: " . $e->getMessage()]);
            }
            exit();
        }

        // --- Logic CRUD Biasa (JSON) ---
        $data = json_decode(file_get_contents("php://input"));
        
        // Handle Delete via POST
        if (isset($data->action) && $data->action === 'delete') {
            if (!$data->id) { echo json_encode(["message" => "ID required"]); exit(); }
            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            if($stmt->execute([$data->id])) echo json_encode(["message" => "User deleted"]);
            else { http_response_code(500); echo json_encode(["message" => "Failed to delete"]); }
            exit();
        }

        // CREATE / UPDATE STANDARD (Admin Dashboard)
        $username = $data->username ?? $data->name ?? '';
        $email = $data->email ?? '';
        $role = $data->role ?? 'client';

        if (isset($data->id) && !empty($data->id)) {
            // Update User Biasa (tanpa file)
            $sql = "UPDATE users SET username=?, email=?, role=? WHERE id=?"; 
            $stmt = $conn->prepare($sql);
            if($stmt->execute([$username, $email, $role, $data->id])) {
                echo json_encode(["message" => "User updated successfully"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Failed to update user"]);
            }
        } else {
            // Create New User
            $default_pass = password_hash("123456", PASSWORD_DEFAULT);
            $sql = "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            if($stmt->execute([$username, $email, $default_pass, $role])) {
                echo json_encode(["message" => "User created successfully"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Failed to create user"]);
            }
        }
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["message" => "ID required"]);
            exit();
        }
        try {
            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            if ($stmt->execute([$id])) {
                echo json_encode(["message" => "User berhasil dihapus"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Gagal menghapus user"]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Error: " . $e->getMessage()]);
        }
        break;
}
?>