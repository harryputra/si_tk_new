<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        $faker = $this->faker ?? \Illuminate\Container\Container::getInstance()->make(\Faker\Generator::class);

        return [
            'nis' => $faker->unique()->numerify('#####'),
            'nama_lengkap' => $faker->name(),
            'nama_panggilan' => $faker->firstName(),
            'tahun_angkatan' => $faker->randomElement([2022, 2023, 2024]),
            'jenis_siswa' => $faker->randomElement(['reguler', 'reguler_opsi2', 'fullday']),
            'nama_wali' => $faker->name(),
            'no_hp_wali' => $faker->phoneNumber(),
            'status' => 'aktif',
        ];
    }
}
