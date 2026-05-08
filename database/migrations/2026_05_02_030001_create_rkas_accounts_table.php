<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Master Chart of Accounts (COA) untuk RKAS.
     * Hierarki: parent_id self-reference. Level digenerate (0 = root, 1 = sub, dst).
     *
     * Convention KODE:
     *   - Pendapatan: 4.x.x  (mis. 4.1.1 = SPP Reguler)
     *   - Pengeluaran: 5.x.x (mis. 5.1.1 = Belanja Pegawai)
     */
    public function up(): void
    {
        Schema::create('rkas_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('name');
            $table->string('kind'); // pendapatan | pengeluaran
            $table->foreignId('parent_id')->nullable()->constrained('rkas_accounts')->nullOnDelete();
            $table->unsignedSmallInteger('level')->default(0);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['kind', 'parent_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rkas_accounts');
    }
};
