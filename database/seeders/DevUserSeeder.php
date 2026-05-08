<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DevUserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Bendahara TK',
                'email' => 'bendahara@tkaattauhid.sch.id',
                'password' => Hash::make('password'),
                'role' => 'bendahara',
            ],
            [
                'name' => 'HR Admin TK',
                'email' => 'hr@tkaattauhid.sch.id',
                'password' => Hash::make('password'),
                'role' => 'admin_hr',
            ],
            [
                'name' => 'Kepala Sekolah TK',
                'email' => 'kepala@tkaattauhid.sch.id',
                'password' => Hash::make('password'),
                'role' => 'kepala_sekolah',
            ],
            [
                'name' => 'Yayasan TK',
                'email' => 'yayasan@tkaattauhid.sch.id',
                'password' => Hash::make('password'),
                'role' => 'yayasan',
            ],
        ];

        foreach ($users as $userData) {
            $role = $userData['role'];
            unset($userData['role']);
            
            $user = User::firstOrCreate(['email' => $userData['email']], $userData);
            $user->assignRole($role);
        }
    }
}
