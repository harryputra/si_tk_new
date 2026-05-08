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
            'nis' => $this->faker->unique()->numerify('#####'),
            'nama_lengkap' => $this->faker->name(),
            'nama_panggilan' => $this->faker->firstName(),
            'tahun_angkatan' => $this->faker->randomElement([2022, 2023, 2024]),
            'jenis_siswa' => $this->faker->randomElement(['reguler', 'reguler_opsi2', 'fullday']),
            'nama_wali' => $this->faker->name(),
            'no_hp_wali' => $this->faker->phoneNumber(),
            'status' => 'aktif',
        ];
    }
}
