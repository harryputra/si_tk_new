<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;

class DatabaseDriverTest extends TestCase
{
    /** @test */
    public function test_can_connect_to_pgsql()
    {
        $this->assertEquals('pgsql', DB::connection()->getDriverName());
    }

    /** @test */
    public function test_can_connect_to_sqlite()
    {
        config(['database.default' => 'sqlite']);
        config(['database.connections.sqlite.database' => ':memory:']);
        
        $this->assertEquals('sqlite', DB::connection('sqlite')->getDriverName());
    }
}
