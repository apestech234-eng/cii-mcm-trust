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

// Check if the post size exceeds php.ini limits (which makes $_POST and $_FILES empty)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($_POST) && empty($_FILES) && $_SERVER['CONTENT_LENGTH'] > 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'The uploaded file is too large. Max allowed size is determined by the server configuration.']);
    exit;
}

// Extract inputs safely
$name = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$phone = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$email = isset($_POST['email']) ? trim(strip_tags($_POST['email'])) : '';
$qualification = isset($_POST['qualification']) ? trim(strip_tags($_POST['qualification'])) : '';
$course = isset($_POST['course']) ? trim(strip_tags($_POST['course'])) : '';
$category = isset($_POST['category']) ? trim(strip_tags($_POST['category'])) : '';
$bpl = isset($_POST['bpl']) ? trim(strip_tags($_POST['bpl'])) : '';
$message = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';

// Validation checks
if (empty($name) || empty($phone) || empty($email) || empty($qualification) || empty($course) || empty($category) || empty($bpl)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please fill out all required fields.']);
    exit;
}

// Validate category
$allowedCategories = ['SC', 'ST', 'OBC', 'General'];
if (!in_array($category, $allowedCategories)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid category selected.']);
    exit;
}

// Validate BPL
if (!in_array($bpl, ['Yes', 'No'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid BPL status selected.']);
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
$csvFile = $dataDir . '/submissions.csv';

// Secure the folder
if (!is_dir($dataDir)) {
    if (!mkdir($dataDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Internal server error: Directory creation failed.']);
        exit;
    }
}

// Add .htaccess if missing to deny web access to submissions.csv
if (!file_exists($htaccessFile)) {
    $htaccessRule = "Order Deny,Allow\nDeny from all\n";
    file_put_contents($htaccessFile, $htaccessRule);
}

// Handle BPL Proof file if BPL is Yes
$bplProofPath = 'N/A';
if ($bpl === 'Yes') {
    if (!isset($_FILES['bpl_proof']) || $_FILES['bpl_proof']['error'] !== UPLOAD_ERR_OK) {
        $uploadError = isset($_FILES['bpl_proof']) ? $_FILES['bpl_proof']['error'] : UPLOAD_ERR_NO_FILE;
        $errorMsg = 'Please upload a valid BPL proof document.';
        if ($uploadError === UPLOAD_ERR_INI_SIZE || $uploadError === UPLOAD_ERR_FORM_SIZE) {
            $errorMsg = 'BPL proof file size exceeds the allowed limit.';
        }
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $errorMsg]);
        exit;
    }
    
    $fileInfo = $_FILES['bpl_proof'];
    // Size check: 5MB
    if ($fileInfo['size'] > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'BPL proof file size exceeds the 5MB limit.']);
        exit;
    }
    
    // Type/Extension check
    $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    $fileName = $fileInfo['name'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    
    if (!in_array($fileExtension, $allowedExtensions)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid BPL proof file format. Only PDF, JPG, JPEG, and PNG are allowed.']);
        exit;
    }
    
    // Validate MIME type for security
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $fileInfo['tmp_name']);
    finfo_close($finfo);
    
    $allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!in_array($mimeType, $allowedMimeTypes)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid file contents. Only PDF, JPG, and PNG are allowed.']);
        exit;
    }
    
    // Ensure proofs directory exists
    $proofsDir = $dataDir . '/bpl_proofs';
    if (!is_dir($proofsDir)) {
        if (!mkdir($proofsDir, 0755, true)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Internal server error: Proofs directory creation failed.']);
            exit;
        }
    }
    
    // Generate secure unique filename
    $safeName = 'bpl_proof_' . date('Ymd_His') . '_' . bin2hex(random_bytes(8)) . '.' . $fileExtension;
    $destination = $proofsDir . '/' . $safeName;
    
    if (!move_uploaded_file($fileInfo['tmp_name'], $destination)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to save the uploaded proof file.']);
        exit;
    }
    
    // Generate download link for CSV
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
    $domainName = $_SERVER['HTTP_HOST'];
    $requestUriDir = dirname($_SERVER['REQUEST_URI']);
    if ($requestUriDir === '/' || $requestUriDir === '\\') {
        $requestUriDir = '';
    }
    $bplProofPath = $protocol . $domainName . $requestUriDir . '/download_proof.php?key=' . urlencode('CiiMcmTrust2026!') . '&file=' . urlencode($safeName);
}

// Check if file is new to write headers later
$isNewFile = !file_exists($csvFile);

$fileHandle = fopen($csvFile, 'a');
if (!$fileHandle) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save application. Please try again.']);
    exit;
}

// Write UTF-8 BOM and headers if creating the file
if ($isNewFile) {
    fwrite($fileHandle, "\xEF\xBB\xBF"); // UTF-8 BOM for Microsoft Excel compatibility
    fputcsv($fileHandle, ['Timestamp', 'Full Name', 'Phone Number', 'Email Address', 'Qualification', 'Selected Course', 'Category', 'BPL Status', 'BPL Proof Link', 'Additional Message']);
}

// Write the application details
$timestamp = date('Y-m-d H:i:s');
fputcsv($fileHandle, [$timestamp, $name, $phone, $email, $qualification, $course, $category, $bpl, $bplProofPath, $message]);
fclose($fileHandle);

// Send success JSON
echo json_encode(['success' => true, 'message' => 'Your application has been received. Thank you!']);
exit;
