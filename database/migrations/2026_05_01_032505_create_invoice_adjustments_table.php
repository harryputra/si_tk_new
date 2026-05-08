<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoice_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('inbound_payment_id')->nullable()->constrained()->onDelete('set null');
            $table->string('jenis_kebijakan'); // subsidi_yayasan, pemutihan, diskon_kelulusan
            $table->decimal('nominal_asli', 15, 2);
            $table->decimal('nominal_adjustment', 15, 2);
            $table->text('keterangan')->nullable();
            $table->string('batch_id')->nullable()->index(); // groups adjustments from same graduation batch
            $table->foreignId('admin_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_adjustments');
    }
};
