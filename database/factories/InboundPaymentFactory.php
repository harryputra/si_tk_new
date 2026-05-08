<?php

namespace Database\Factories;

use App\Models\InboundPayment;
use App\Models\Invoice;
use App\Models\Student;
use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class InboundPaymentFactory extends Factory
{
    protected $model = InboundPayment::class;

    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory(),
            'student_id' => Student::factory(),
            'account_id' => Account::inRandomOrder()->first()?->id ?? Account::factory(),
            'total_bayar' => 0,
            'jenis_bayar' => 'lunas',
            'jenis_transaksi' => 'transfer',
            'status_approval' => 'approved',
            'dibuat_oleh' => User::first()?->id ?? 1,
            'approved_by' => User::first()?->id ?? 1,
            'approved_at' => now(),
        ];
    }
}
