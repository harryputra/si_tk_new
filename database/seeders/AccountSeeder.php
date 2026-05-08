<?php

namespace Database\Seeders;

use App\Models\Account;
use Illuminate\Database\Seeder;

class AccountSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            [
                'nama_rekening' => 'Rekening Operasional Sekolah',
                'bank'          => 'BRI',
                'nomor_rekening' => '1234567890',
                'saldo'         => 0,
                'jenis'         => 'operasional',
            ],
            [
                'nama_rekening' => 'Rekening Penggajian',
                'bank'          => 'BRI',
                'nomor_rekening' => '0987654321',
                'saldo'         => 0,
                'jenis'         => 'gaji',
            ],
        ];

        foreach ($accounts as $account) {
            Account::firstOrCreate(
                ['nomor_rekening' => $account['nomor_rekening']],
                $account
            );
        }
    }
}
