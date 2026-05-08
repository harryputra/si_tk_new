<?php

use App\Models\PayrollAssignment;
use App\Models\PayrollComponent;
use App\Models\Teacher;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Migrasi data dari kolom fixed di teachers (gaji_pokok, tunjangan_tetap,
     * bonus_hadir, denda_alfa) ke struktur komponen + assignment dinamis.
     *
     * IDEMPOTEN: aman dijalankan ulang. Cek existing component by name dan
     * existing assignment by (teacher_id, component_id) sebelum insert.
     */
    public function up(): void
    {
        DB::transaction(function () {
            // 1. Daftar komponen default beserta atribut formula-nya
            $defaults = [
                [
                    'name'      => 'Gaji Pokok',
                    'kind'      => PayrollComponent::KIND_EARNING,
                    'frequency' => PayrollComponent::FREQ_RECURRING,
                    'formula'   => PayrollComponent::FORMULA_FLAT,
                    'category'  => 'gaji_pokok',
                    'source'    => 'gaji_pokok',
                ],
                [
                    'name'      => 'Tunjangan Tetap',
                    'kind'      => PayrollComponent::KIND_EARNING,
                    'frequency' => PayrollComponent::FREQ_RECURRING,
                    'formula'   => PayrollComponent::FORMULA_FLAT,
                    'category'  => 'tunjangan_tetap',
                    'source'    => 'tunjangan_tetap',
                ],
                [
                    'name'      => 'Bonus Hadir',
                    'kind'      => PayrollComponent::KIND_EARNING,
                    'frequency' => PayrollComponent::FREQ_RECURRING,
                    'formula'   => PayrollComponent::FORMULA_PER_ATTENDANCE_DAY,
                    'category'  => 'bonus_kehadiran',
                    'source'    => 'bonus_hadir',
                ],
                [
                    'name'      => 'Denda Alfa',
                    'kind'      => PayrollComponent::KIND_DEDUCTION,
                    'frequency' => PayrollComponent::FREQ_RECURRING,
                    'formula'   => PayrollComponent::FORMULA_PER_ALFA_DAY,
                    'category'  => 'potongan_disiplin',
                    'source'    => 'denda_alfa',
                ],
            ];

            $componentBySource = [];
            foreach ($defaults as $def) {
                $component = PayrollComponent::firstOrCreate(
                    ['name' => $def['name']],
                    [
                        'kind'        => $def['kind'],
                        'frequency'   => $def['frequency'],
                        'formula'     => $def['formula'],
                        'category'    => $def['category'],
                        'description' => 'Komponen default hasil migrasi dari teachers.'.$def['source'],
                        'is_active'   => true,
                    ]
                );
                $componentBySource[$def['source']] = $component;
            }

            // 2. Untuk setiap teacher, buat assignment per komponen kalau nominal > 0
            // effective_from dipakai default 2025-01-01 (sebelum tahun ajaran aktif)
            // sehingga generate payroll bulan-bulan lampau juga ter-cover.
            $effectiveFrom = Carbon::parse('2025-01-01')->toDateString();

            $teachers = Teacher::all();
            foreach ($teachers as $teacher) {
                foreach ($componentBySource as $source => $component) {
                    $nominal = (float) ($teacher->{$source} ?? 0);
                    if ($nominal <= 0) {
                        continue; // tidak buat assignment untuk komponen ber-nominal 0
                    }

                    PayrollAssignment::firstOrCreate(
                        [
                            'teacher_id'           => $teacher->id,
                            'payroll_component_id' => $component->id,
                            'effective_from'       => $effectiveFrom,
                        ],
                        [
                            'nominal'         => $nominal,
                            'effective_until' => null,
                            'sk_number'       => null,
                            'sk_file'         => null,
                            'notes'           => 'Dimigrasi otomatis dari teachers.'.$source,
                            'created_by'      => null,
                        ]
                    );
                }
            }
        });
    }

    /**
     * Down: hapus assignments hasil backfill (yang notes-nya match) dan
     * komponen default kalau tidak ada assignment lain.
     */
    public function down(): void
    {
        PayrollAssignment::where('notes', 'like', 'Dimigrasi otomatis dari teachers.%')->delete();

        // Komponen default hanya dihapus jika tidak punya assignment manual lain
        $defaultNames = ['Gaji Pokok', 'Tunjangan Tetap', 'Bonus Hadir', 'Denda Alfa'];
        foreach ($defaultNames as $name) {
            $c = PayrollComponent::where('name', $name)->first();
            if ($c && $c->assignments()->count() === 0) {
                $c->delete();
            }
        }
    }
};
