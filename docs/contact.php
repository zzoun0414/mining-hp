<?php
declare(strict_types=1);

/* ALTAN KHULEG RESOURCES LLC — お問い合わせフォーム送信処理
 *
 * 外部サービスは使わず、同一ドメイン(altankhuleg-r.com)内で完結する
 * シンプルな PHP mail() 送信。フロント(script.js の contactForm
 * submit ハンドラ)から fetch() で呼ばれ、常に JSON
 * {ok:bool, message:string} を返す。
 *
 * スパム対策は2点のみ(ログイン不要の公開フォームのため CSRF 対策は
 * 対象外):
 *   1. ハニーポット — 本物の訪問者には見えない隠しフィールド "website"。
 *      埋まっていたら成功したふりをして何もしない(ボットに気づかせない)。
 *   2. タイミングチェック — ページ読込時刻(ts)から2.5秒未満での送信は
 *      人間が書いた内容とは考えにくいため拒否。
 */

header('Content-Type: application/json; charset=utf-8');

function respond(bool $ok, string $message = ''): void {
    echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    respond(false, 'method_not_allowed');
}

// --- 1. ハニーポット ---
if (trim((string)($_POST['website'] ?? '')) !== '') {
    respond(true); // ボットには成功したように見せる
}

// --- 2. タイミングチェック ---
$ts = (int)($_POST['ts'] ?? 0);
$nowMs = (int)round(microtime(true) * 1000);
if ($ts <= 0 || ($nowMs - $ts) < 2500 || ($nowMs - $ts) > 1000 * 60 * 60 * 6) {
    respond(false, 'invalid_timing');
}

// --- 必須項目チェック ---
$topicRaw = trim((string)($_POST['topic'] ?? ''));
$name     = trim((string)($_POST['name'] ?? ''));
$email    = trim((string)($_POST['email'] ?? ''));
$tel      = trim((string)($_POST['tel'] ?? ''));
$company  = trim((string)($_POST['company'] ?? ''));
$message  = trim((string)($_POST['message'] ?? ''));
$agree    = (string)($_POST['agree'] ?? '');
$lang     = trim((string)($_POST['lang'] ?? 'ja'));

if ($topicRaw === '' || $name === '' || $email === '' || $message === '' || $agree === '') {
    respond(false, 'missing_fields');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'invalid_email');
}
if (mb_strlen($message) > 5000) {
    respond(false, 'message_too_long');
}

// メールヘッダーに使う値は改行を除去(ヘッダーインジェクション対策)
$strip = static function (string $s): string {
    return trim(preg_replace('/[\r\n]+/', ' ', $s) ?? $s);
};
$name    = $strip($name);
$email   = $strip($email);
$tel     = $strip($tel);
$company = $strip($company);
$topicRaw = $strip($topicRaw);
$lang    = $strip($lang);

$topicLabels = [
    'ja' => [
        'fluorspar'   => '蛍石精鉱のお取引について',
        'partnership' => '業務提携・出資について',
        'recruit'     => '採用について',
        'other'       => 'その他',
    ],
    'en' => [
        'fluorspar'   => 'Fluorspar concentrate trading',
        'partnership' => 'Partnership / investment',
        'recruit'     => 'Recruitment',
        'other'       => 'Other',
    ],
    'mn' => [
        'fluorspar'   => 'Хайлуур жоншны баяжмалын худалдаа',
        'partnership' => 'Хамтын ажиллагаа / хөрөнгө оруулалт',
        'recruit'     => 'Ажилд орох',
        'other'       => 'Бусад',
    ],
];
$labels = $topicLabels[$lang] ?? $topicLabels['ja'];
$topicLabel = $labels[$topicRaw] ?? $topicRaw;

$to = 'surita@altankhuleg-r.com';
$subjectText = '[HP お問い合わせ] ' . $topicLabel . ' — ' . $name;

$bodyLines = [
    'ALTAN KHULEG RESOURCES LLC ウェブサイトのお問い合わせフォームより',
    '',
    '言語版: ' . $lang,
    'お問い合わせ項目: ' . $topicLabel,
    'お名前: ' . $name,
    'メールアドレス: ' . $email,
    '電話番号: ' . ($tel !== '' ? $tel : '（未入力）'),
    '会社名: ' . ($company !== '' ? $company : '（未入力）'),
    '',
    'お問い合わせ内容:',
    $message,
];
$body = implode("\n", $bodyLines);

$fromAddr = 'noreply@altankhuleg-r.com';

$headers = [];
$headers[] = 'From: ALTAN KHULEG RESOURCES LLC <' . $fromAddr . '>';
$headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'X-Mailer: PHP/' . phpversion();

$encodedSubject = '=?UTF-8?B?' . base64_encode($subjectText) . '?=';

$ok = @mail($to, $encodedSubject, $body, implode("\r\n", $headers));

if (!$ok) {
    respond(false, 'send_failed');
}

respond(true);
