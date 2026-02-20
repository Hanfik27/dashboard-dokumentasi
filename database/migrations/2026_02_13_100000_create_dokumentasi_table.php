<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dokumentasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('tanggal');
            $table->text('rincian');
            $table->enum('bidang', ['PJPA', 'OP', 'PJSA', 'PPID']);
            $table->json('file_dokumentasi_path')->nullable();
            $table->json('file_desain_path')->nullable();
            $table->boolean('verifikasi_foto')->default(false);
            $table->boolean('verifikasi_desain')->default(false);
            $table->boolean('verifikasi_caption')->default(false);
            $table->text('catatan_revisi')->nullable();
            $table->enum('status', ['belum', 'terverifikasi', 'revisi'])->default('belum');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dokumentasi');
    }
};
