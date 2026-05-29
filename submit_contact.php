<?php
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

// Set default timezone for accurate timestamps
date_default_timezone_set('Asia/Kolkata');

// Validate request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// Extract inputs safely
$name = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$phone = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$email = isset($_POST['email']) ? trim(strip_tags($_POST['email'])) : '';
$subject = isset($_POST['subject']) ? trim(strip_tags($_POST['subject'])) : '';
$message = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';

// Validation checks
if (empty($name) || empty($phone) || empty($email) || empty($subject) || empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please fill out all required fields.']);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

// Validate Indian phone number (10 digits, starts with 6-9)
if (!preg_match('/^[6-9]\d{9}$/', $phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid 10-digit mobile number.']);
    exit;
}

// Define storage paths
$dataDir = __DIR__ . '/secure_data';
$htaccessFile = $dataDir . '/.htaccess';
$csvFile = $dataDir . '/contacts.csv';

// Secure the folder
if (!is_dir($dataDir)) {
    if (!mkdir($dataDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Internal server error: Directory creation failed.']);
        exit;
    }
}

// Add .htaccess if missing to deny web access to contacts.csv
if (!file_exists($htaccessFile)) {
    $htaccessRule = "Order Deny,Allow\nDeny from all\n";
    file_put_contents($htaccessFile, $htaccessRule);
}

// Check if file is new to write headers later
$isNewFile = !file_exists($csvFile);

$fileHandle = fopen($csvFile, 'a');
if (!$fileHandle) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save contact query. Please try again.']);
    exit;
}

// Write UTF-8 BOM and headers if creating the file
if ($isNewFile) {
    fwrite($fileHandle, "\xEF\xBB\xBF"); // UTF-8 BOM for Microsoft Excel compatibility
    fputcsv($fileHandle, ['Timestamp', 'Full Name', 'Phone Number', 'Email Address', 'Subject', 'Message']);
}

// Write the contact details
$timestamp = date('Y-m-d H:i:s');
fputcsv($fileHandle, [$timestamp, $name, $phone, $email, $subject, $message]);
fclose($fileHandle);

// Send success JSON
echo json_encode(['success' => true, 'message' => 'Your message has been received. Thank you!']);
exit;
