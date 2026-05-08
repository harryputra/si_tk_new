<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            SuperAdminSeeder::class,
            DevUserSeeder::class,
            AccountSeeder::class,
            TariffSeeder::class,
            RkasBudgetSeeder::class,
            HistoricalDataSeeder::class,
            ClassSystemSeeder::class,
        ]);
    }
}
