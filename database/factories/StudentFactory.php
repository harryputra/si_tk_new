<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'nis' => fake()->unique()->numerify('#####'),
            'nama_lengkap' => fake()->name(),
            'nama_panggilan' => fake()->firstName(),
            'tahun_angkatan' => fake()->randomElement([2022, 2023, 2024]),
            'jenis_siswa' => fake()->randomElement(['reguler', 'reguler_opsi2', 'fullday']),
            'nama_wali' => fake()->name(),
            'no_hp_wali' => fake()->phoneNumber(),
            'status' => 'aktif',
        ];
    }
}
