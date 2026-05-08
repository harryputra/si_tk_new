<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SchoolClass;

class SchoolClassSeeder extends Seeder
{
    public function run(): void
    {
        SchoolClass::create(['name' => 'Playgroup', 'level' => 'PG']);
        SchoolClass::create(['name' => 'TK A-1', 'level' => 'TK A']);
        SchoolClass::create(['name' => 'TK A-2', 'level' => 'TK A']);
        SchoolClass::create(['name' => 'TK B-1', 'level' => 'TK B']);
        SchoolClass::create(['name' => 'TK B-2', 'level' => 'TK B']);
    }
}
