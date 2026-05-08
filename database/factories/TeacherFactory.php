<?php

namespace Database\Factories;

use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;

class TeacherFactory extends Factory
{
    protected $model = Teacher::class;

    public function definition(): array
    {
        return [
            'nip' => $this->faker->unique()->numerify('G###'),
            'nama_lengkap' => $this->faker->name(),
            'jabatan' => $this->faker->randomElement(['Guru Kelas', 'Guru Pendamping', 'Admin']),
            'no_hp' => $this->faker->phoneNumber(),
            'gaji_pokok' => $this->faker->randomElement([2000000, 2500000, 3000000]),
            'bonus_hadir' => 10000,
            'denda_alfa' => 50000,
            'tunjangan_tetap' => 500000,
            'nama_bank' => 'BCA',
            'nomor_rekening_bank' => $this->faker->bankAccountNumber(),
            'status' => 'aktif',
        ];
    }
}
