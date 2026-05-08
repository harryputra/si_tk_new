<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Student;

$students = Student::all();
foreach($students as $idx => $s) {
    if($idx < 15) {
        $s->update(['status' => 'alumni', 'tahun_angkatan' => 2022]);
    } elseif($idx < 20) {
        $s->update(['status' => 'keluar']);
    } else {
        $s->update(['status' => 'aktif', 'tahun_angkatan' => ($idx % 2 == 0 ? 2023 : 2024)]);
    }
}
echo "Updated " . count($students) . " students.\n";
