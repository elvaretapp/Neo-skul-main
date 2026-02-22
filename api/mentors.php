<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$host     = 'localhost';
$dbname   = 'neo-skul';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->prepare("SELECT id, username, email, avatar, specialization, bio, category FROM users WHERE role = 'mentor' ORDER BY created_at DESC");
    $stmt->execute();
    $mentors = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($mentors);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
