<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

include_once 'config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

try {
    $report = [];

    // ===================== OVERVIEW =====================

    // Total users by role
    $stmt = $conn->query("SELECT role, COUNT(*) as total FROM users GROUP BY role");
    $roleData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $roles = ['client' => 0, 'mentor' => 0, 'admin' => 0];
    $totalUsers = 0;
    foreach ($roleData as $r) {
        $roles[$r['role']] = (int)$r['total'];
        $totalUsers += (int)$r['total'];
    }
    $report['total_users']   = $totalUsers;
    $report['total_clients'] = $roles['client'];
    $report['total_mentors'] = $roles['mentor'];
    $report['total_admins']  = $roles['admin'];

    // Total kursus & produk
    $stmt = $conn->query("SELECT type, COUNT(*) as total FROM courses GROUP BY type");
    $typeData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $totalCourses = 0; $totalProducts = 0;
    foreach ($typeData as $t) {
        if ($t['type'] === 'course') $totalCourses += (int)$t['total'];
        else $totalProducts += (int)$t['total'];
    }
    $report['total_courses']  = $totalCourses;
    $report['total_products'] = $totalProducts;

    // ===================== REVENUE =====================

    // Total revenue dari transaksi approved/success
    $stmt = $conn->query("
        SELECT COALESCE(SUM(ti.price * ti.quantity), 0) as total
        FROM transaction_items ti
        JOIN transactions t ON ti.transaction_id = t.id
        WHERE t.status IN ('approved','success')
    ");
    $report['total_revenue'] = (float)$stmt->fetchColumn();

    // Revenue per bulan (6 bulan terakhir)
    $stmt = $conn->query("
        SELECT 
            DATE_FORMAT(t.created_at, '%b') as month,
            DATE_FORMAT(t.created_at, '%Y-%m') as month_key,
            COALESCE(SUM(ti.price * ti.quantity), 0) as revenue,
            COUNT(DISTINCT t.user_id) as new_users
        FROM transactions t
        JOIN transaction_items ti ON ti.transaction_id = t.id
        WHERE t.status IN ('approved','success')
          AND t.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY month_key, month
        ORDER BY month_key ASC
    ");
    $report['monthly_revenue'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Revenue bulan ini vs bulan lalu
    $stmt = $conn->query("
        SELECT COALESCE(SUM(ti.price * ti.quantity), 0) as rev
        FROM transaction_items ti
        JOIN transactions t ON ti.transaction_id = t.id
        WHERE t.status IN ('approved','success')
          AND MONTH(t.created_at) = MONTH(NOW())
          AND YEAR(t.created_at) = YEAR(NOW())
    ");
    $report['revenue_this_month'] = (float)$stmt->fetchColumn();

    $stmt = $conn->query("
        SELECT COALESCE(SUM(ti.price * ti.quantity), 0) as rev
        FROM transaction_items ti
        JOIN transactions t ON ti.transaction_id = t.id
        WHERE t.status IN ('approved','success')
          AND MONTH(t.created_at) = MONTH(NOW() - INTERVAL 1 MONTH)
          AND YEAR(t.created_at) = YEAR(NOW() - INTERVAL 1 MONTH)
    ");
    $report['revenue_last_month'] = (float)$stmt->fetchColumn();

    // ===================== USERS =====================

    // Registrasi bulan ini
    $stmt = $conn->query("SELECT COUNT(*) FROM users WHERE MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW())");
    $report['new_users_this_month'] = (int)$stmt->fetchColumn();

    // Registrasi bulan lalu
    $stmt = $conn->query("SELECT COUNT(*) FROM users WHERE MONTH(created_at)=MONTH(NOW()-INTERVAL 1 MONTH) AND YEAR(created_at)=YEAR(NOW()-INTERVAL 1 MONTH)");
    $report['new_users_last_month'] = (int)$stmt->fetchColumn();

    // ===================== PERFORMANCE =====================

    // Top kursus berdasarkan jumlah pembeli
    $stmt = $conn->query("
        SELECT 
            c.title,
            c.type,
            COUNT(DISTINCT t.user_id) as students,
            COALESCE(SUM(ti.price * ti.quantity), 0) as revenue
        FROM courses c
        JOIN transaction_items ti ON ti.course_id = c.id
        JOIN transactions t ON ti.transaction_id = t.id
        WHERE t.status IN ('approved','success')
        GROUP BY c.id, c.title, c.type
        ORDER BY students DESC
        LIMIT 5
    ");
    $report['top_courses'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Top mentor berdasarkan jumlah siswa
    $stmt = $conn->query("
        SELECT 
            u.username as name,
            COUNT(DISTINCT c.id) as courses,
            COUNT(DISTINCT t.user_id) as students,
            COALESCE(SUM(ti.price * ti.quantity), 0) as revenue
        FROM users u
        JOIN courses c ON c.mentor_id = u.id
        JOIN transaction_items ti ON ti.course_id = c.id
        JOIN transactions t ON ti.transaction_id = t.id
        WHERE u.role = 'mentor' AND t.status IN ('approved','success')
        GROUP BY u.id, u.username
        ORDER BY students DESC
        LIMIT 5
    ");
    $report['top_mentors'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Total transaksi pending
    $stmt = $conn->query("SELECT COUNT(*) FROM transactions WHERE status = 'pending'");
    $report['pending_transactions'] = (int)$stmt->fetchColumn();

    // Total transaksi berhasil
    $stmt = $conn->query("SELECT COUNT(*) FROM transactions WHERE status IN ('approved','success')");
    $report['success_transactions'] = (int)$stmt->fetchColumn();

    echo json_encode($report);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
