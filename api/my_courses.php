<?php
// api/my_courses.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

include_once 'config/database.php';

if (isset($_GET['user_id'])) {
    $user_id = $_GET['user_id'];

    try {
        // QUERY JOIN 3 TABEL (Khusus Struktur 2 Tabel: transactions & transaction_items)
        $sql = "SELECT 
                    c.id, 
                    c.title, 
                    c.image, 
                    c.type, 
                    c.description,
                    c.drive_link,
                    c.wa_group,
                    c.wa_mentor,
                    c.mentor_id,
                    u.username as mentor_name,
                    u.specialization as mentor_specialization,
                    u.avatar as mentor_avatar,
                    u.phone as mentor_phone,
                    t.created_at as purchase_date
                FROM courses c
                JOIN transaction_items ti ON c.id = ti.course_id
                JOIN transactions t ON ti.transaction_id = t.id
                LEFT JOIN users u ON c.mentor_id = u.id
                WHERE t.user_id = :uid 
                AND (t.status = 'approved' OR t.status = 'success') 
                ORDER BY t.created_at DESC";
        
        // Catatan: Saya pakai OR (approved/success) agar aman apapun status yang kamu pakai di database

        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':uid', $user_id);
        $stmt->execute();

        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($courses);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode([]);
}
?>