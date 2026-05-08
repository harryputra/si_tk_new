<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Student;
use App\Models\Tariff;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        $nominal = $this->faker->randomElement([250000, 300000, 350000]);
        return [
            'student_id' => Student::factory(),
            'tariff_id' => Tariff::inRandomOrder()->first()?->id ?? Tariff::factory(),
            'periode' => $this->faker->date('Y-m-01'),
            'nominal_tagihan' => $nominal,
            'nominal_terbayar' => 0,
            'status' => 'unpaid',
            'jatuh_tempo' => function (array $attributes) {
                return date('Y-m-10', strtotime($attributes['periode']));
            },
        ];
    }
}
