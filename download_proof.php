<?php
// Password protection key (same as export.php)
define('ADMIN_KEY', 'CiiMcmTrust2026!');

$key = isset($_GET['key']) ? trim($_GET['key']) : '';
$file = isset($_GET['file']) ? trim($_GET['file']) : '';

if ($key !== ADMIN_KEY) {
    http_response_code(403);
    echo "Access Denied: Invalid Security Key.";
    exit;
}

// Sanitize filename to prevent directory traversal
if (empty($file) || !preg_match('/^[a-zA-Z0-9_\-\.]+$/', $file) || strpos($file, 'bpl_proof_') !== 0) {
    http_response_code(400);
    echo "Bad Request: Invalid file specified.";
    exit;
}

$proofsDir = __DIR__ . '/secure_data/bpl_proofs';
$filePath = $proofsDir . '/' . $file;

if (!file_exists($filePath) || !is_file($filePath)) {
    http_response_code(404);
    echo "File Not Found: The requested proof document does not exist.";
    exit;
}

// Determine MIME type
$fileExtension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
$contentType = 'application/octet-stream';
switch ($fileExtension) {
    case 'pdf':
        $contentType = 'application/pdf';
        break;
    case 'jpg':
    case 'jpeg':
        $contentType = 'image/jpeg';
        break;
    case 'png':
        $contentType = 'image/png';
        break;
}

// Set download headers to stream the file
header('Content-Type: ' . $contentType);
header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
header('Content-Length: ' . filesize($filePath));
header('Pragma: no-cache');
header('Expires: 0');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');

readfile($filePath);
exit;
