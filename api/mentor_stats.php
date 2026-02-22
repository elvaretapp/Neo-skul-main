<?php
// api/mentor_stats.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config/database.php';

$mentor_id = isset($_GET['mentor_id']) ? $_GET['mentor_id'] : null;

if (!$mentor_id) {
    http_response_code(400);
    echo json_encode(["message" => "Mentor ID required"]);
    exit();
}

try {
    // 1. Hitung Total Course
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM courses WHERE mentor_id = ?");
    $stmt->execute([$mentor_id]);
    $totalCourses = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // 2. Hitung Total Siswa (Client yang sudah membeli - Transaksi Sukses)
    // Menggunakan DISTINCT agar jika 1 siswa beli 2 kursus, tetap dihitung 1 orang
    $sqlStudents = "SELECT COUNT(DISTINCT t.user_id) as total 
                    FROM transactions t 
                    JOIN courses c ON t.course_id = c.id 
                    WHERE c.mentor_id = ? AND t.status = 'success'";
    $stmt = $conn->prepare($sqlStudents);
    $stmt->execute([$mentor_id]);
    $totalStudents = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // 3. Hitung Total Pendapatan
    $sqlRevenue = "SELECT SUM(t.amount) as total 
                   FROM transactions t 
                   JOIN courses c ON t.course_id = c.id 
                   WHERE c.mentor_id = ? AND t.status = 'success'";
    $stmt = $conn->prepare($sqlRevenue);
    $stmt->execute([$mentor_id]);
    $revenue = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    echo json_encode([
        "total_courses" => $totalCourses,
        "total_students" => $totalStudents,
        "total_revenue" => $revenue ? $revenue : 0
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error: " . $e->getMessage()]);
}
?>