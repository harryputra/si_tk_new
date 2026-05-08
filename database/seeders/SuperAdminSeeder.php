<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'admin@tkaattauhid.sch.id'],
            [
                'name'     => 'Super Admin',
                'password' => Hash::make('password'),
            ]
        );

        $user->assignRole('super_admin');
    }
}
