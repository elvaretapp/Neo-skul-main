<?php
// api/courses.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");

include_once 'config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

switch ($method) {
    case 'GET':
        $mentor_id = isset($_GET['mentor_id']) ? $_GET['mentor_id'] : null;

        if ($mentor_id) {
            // Filter berdasarkan mentor_id
            $sql = "SELECT * FROM courses WHERE mentor_id = ? ORDER BY id DESC";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$mentor_id]);
        } else {
            // Ambil semua
            $sql = "SELECT * FROM courses ORDER BY id DESC";
            $stmt = $conn->query($sql);
        }
        
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($courses);
        break;

    case 'POST':
        $title = $_POST['title'] ?? '';
        $description = $_POST['description'] ?? '';
        $price = $_POST['price'] ?? '';
        $type = $_POST['type'] ?? 'General';
        $mentor_id = $_POST['mentor_id'] ?? null;
        $id = $_POST['id'] ?? null;

        if (!$id && !$mentor_id) {
            http_response_code(400);
            echo json_encode(["message" => "Mentor ID required"]);
            exit;
        }

        // --- Logic Upload Image ---
        $imagePath = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = '../assets/images/products/';
            if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
            
            $fileName = time() . '_' . basename($_FILES['image']['name']);
            $targetPath = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                $imagePath = '/assets/images/products/' . $fileName;
            }
        }

        try {
            if ($id) {
                // === UPDATE ===
                if ($imagePath) {
                    // Update field 'image'
                    $sql = "UPDATE courses SET title=?, description=?, price=?, type=?, image=? WHERE id=?";
                    $stmt = $conn->prepare($sql);
                    $stmt->execute([$title, $description, $price, $type, $imagePath, $id]);
                } else {
                    $sql = "UPDATE courses SET title=?, description=?, price=?, type=? WHERE id=?";
                    $stmt = $conn->prepare($sql);
                    $stmt->execute([$title, $description, $price, $type, $id]);
                }
                echo json_encode(["message" => "Course updated successfully"]);

            } else {
                // === CREATE ===
                if (!$imagePath) $imagePath = '/assets/images/products/Tamplateedukasi.jpeg';

                // Insert ke field 'image'
                $sql = "INSERT INTO courses (title, description, price, type, image, mentor_id) VALUES (?, ?, ?, ?, ?, ?)";
                $stmt = $conn->prepare($sql);
                
                if($stmt->execute([$title, $description, $price, $type, $imagePath, $mentor_id])) {
                    echo json_encode(["message" => "Course created successfully"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Failed to create course"]);
                }
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Database Error: " . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            $data = json_decode(file_get_contents("php://input"));
            $id = $data->id ?? null;
        }
        if (!$id) exit(json_encode(["message" => "ID required"]));

        $stmt = $conn->prepare("DELETE FROM courses WHERE id = ?");
        if($stmt->execute([$id])) echo json_encode(["message" => "Deleted successfully"]);
        else { http_response_code(500); echo json_encode(["message" => "Failed to delete"]); }
        break;
}
?>