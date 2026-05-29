<?php
// Password protection key
define('ADMIN_KEY', 'CiiMcmTrust2026!');

$key = isset($_GET['key']) ? trim($_GET['key']) : '';

if ($key !== ADMIN_KEY) {
    // Render a premium login/download prompt page
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contacts Export Center | CII MCM Trust</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <script src="https://unpkg.com/lucide@latest"></script>
        <style>
            :root {
                --clr-bg: #0F172A;
                --clr-card: #1E293B;
                --clr-primary: #3B82F6;
                --clr-accent: #E8344E;
                --clr-text: #F8FAFC;
                --clr-muted: #94A3B8;
                --clr-border: rgba(255, 255, 255, 0.08);
            }
            body {
                margin: 0;
                padding: 0;
                font-family: 'Outfit', sans-serif;
                background-color: var(--clr-bg);
                color: var(--clr-text);
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 40%),
                            radial-gradient(circle at 90% 80%, rgba(232, 52, 78, 0.05) 0%, transparent 40%);
            }
            .login-card {
                background-color: var(--clr-card);
                border: 1px solid var(--clr-border);
                border-radius: 20px;
                padding: 3rem 2.5rem;
                width: 100%;
                max-width: 420px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                text-align: center;
                box-sizing: border-box;
            }
            .icon-box {
                width: 60px;
                height: 60px;
                background: rgba(59, 130, 246, 0.1);
                color: var(--clr-primary);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1.5rem;
            }
            .icon-box i {
                width: 28px;
                height: 28px;
            }
            h1 {
                font-size: 1.8rem;
                font-weight: 800;
                margin: 0 0 0.5rem;
            }
            p {
                color: var(--clr-muted);
                font-size: 0.95rem;
                line-height: 1.5;
                margin: 0 0 2rem;
            }
            .form-group {
                text-align: left;
                margin-bottom: 1.5rem;
            }
            label {
                display: block;
                font-size: 0.85rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: var(--clr-muted);
                margin-bottom: 0.5rem;
            }
            .input-wrapper {
                position: relative;
            }
            .input-wrapper i {
                position: absolute;
                left: 1rem;
                top: 50%;
                transform: translateY(-50%);
                color: var(--clr-muted);
                width: 18px;
                height: 18px;
            }
            input[type="password"] {
                width: 100%;
                padding: 0.85rem 1rem 0.85rem 2.8rem;
                font-family: inherit;
                font-size: 1rem;
                background: rgba(15, 23, 42, 0.6);
                border: 1px solid var(--clr-border);
                border-radius: 10px;
                color: var(--clr-text);
                box-sizing: border-box;
                outline: none;
                transition: all 0.3s;
            }
            input[type="password"]:focus {
                border-color: var(--clr-primary);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
            }
            button {
                width: 100%;
                padding: 0.85rem;
                background-color: var(--clr-primary);
                color: #fff;
                font-family: inherit;
                font-size: 1rem;
                font-weight: 700;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                transition: all 0.3s;
            }
            button:hover {
                background-color: #2563EB;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
            }
            .error-msg {
                color: var(--clr-accent);
                font-size: 0.875rem;
                margin-top: 1rem;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="login-card">
            <div class="icon-box">
                <i data-lucide="file-spreadsheet"></i>
            </div>
            <h1>Contacts Export</h1>
            <p>Enter the security key below to download the compiled contact submissions as an Excel CSV sheet.</p>
            
            <form method="GET">
                <div class="form-group">
                    <label for="key">Security Key</label>
                    <div class="input-wrapper">
                        <i data-lucide="key-round"></i>
                        <input type="password" id="key" name="key" placeholder="Enter administrative key" required autocomplete="off">
                    </div>
                </div>
                <button type="submit">
                    <i data-lucide="download"></i> Download Excel (CSV)
                </button>
            </form>
            
            <?php if (!empty($key)): ?>
                <div class="error-msg">
                    <i data-lucide="alert-circle" style="vertical-align:middle; width:16px; height:16px; display:inline-block; margin-right:4px;"></i>
                    Invalid Security Key. Access Denied.
                </div>
            <?php endif; ?>
        </div>
        
        <script>
            lucide.createIcons();
        </script>
    </body>
    </html>
    <?php
    exit;
}

// Key is valid, download the file
$csvFile = __DIR__ . '/secure_data/contacts.csv';

if (!file_exists($csvFile)) {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>No Data | CII MCM Trust</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
        <script src="https://unpkg.com/lucide@latest"></script>
        <style>
            body {
                margin: 0;
                font-family: 'Outfit', sans-serif;
                background-color: #0F172A;
                color: #F8FAFC;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
            }
            .card {
                background: #1E293B;
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 20px;
                padding: 3rem;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                max-width: 400px;
            }
            .icon { color: #94A3B8; margin-bottom: 1rem; }
            .icon i { width: 48px; height: 48px; }
            h1 { font-size: 1.5rem; font-weight: 800; margin: 0 0 0.5rem; }
            p { color: #94A3B8; font-size: 0.95rem; margin: 0 0 1.5rem; }
            a { display: inline-block; padding: 0.75rem 1.5rem; background: #3B82F6; color: #fff; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 0.9rem; transition: background 0.3s; }
            a:hover { background: #2563EB; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="icon"><i data-lucide="info"></i></div>
            <h1>No Contacts Found</h1>
            <p>There are currently no contact messages stored on the server to export.</p>
            <a href="index.html">Go to Homepage</a>
        </div>
        <script>
            lucide.createIcons();
        </script>
    </body>
    </html>
    <?php
    exit;
}

// Set download headers to stream the secure CSV
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="cii_mcm_contacts_' . date('Ymd_His') . '.csv"');
header('Pragma: no-cache');
header('Expires: 0');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');

readfile($csvFile);
exit;
