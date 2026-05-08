<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Phase C2 — restructure rkas_budgets:
     *   - kind: 'pendapatan' | 'pengeluaran' (sisi neraca)
     *   - status: lifecycle 'draft' / 'approved' / 'active' / 'archived'
     *   - rkas_account_id: link ke COA (nullable, soft transition)
     *   - approved_by + approved_at: audit approval
     *
     * Backward compat: existing data otomatis di-set kind=pengeluaran, status=active
     * (di migration kedua / step backfill).
     */
    public function up(): void
    {
        Schema::table('rkas_budgets', function (Blueprint $table) {
            $table->string('kind')->default('pengeluaran')->after('id');
            $table->string('status')->default('active')->after('kind');
            $table->foreignId('rkas_account_id')->nullable()->after('status')->constrained('rkas_accounts')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->after('terpakai')->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable()->after('approved_by');
        });
    }

    public function down(): void
    {
        Schema::table('rkas_budgets', function (Blueprint $table) {
            $table->dropForeign(['rkas_account_id']);
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['kind', 'status', 'rkas_account_id', 'approved_by', 'approved_at']);
        });
    }
};
