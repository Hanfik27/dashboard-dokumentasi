<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dokumentasi', function (Blueprint $table) {
            $table->json('revisi_items')->nullable()->after('kategori_revisi');
        });

        // Migrate data lama: pindahkan kategori_revisi + catatan_revisi ke revisi_items
        DB::table('dokumentasi')
            ->whereNotNull('kategori_revisi')
            ->whereNotNull('catatan_revisi')
            ->where('status', 'revisi')
            ->get()
            ->each(function ($row) {
                DB::table('dokumentasi')->where('id', $row->id)->update([
                    'revisi_items' => json_encode([
                        [
                            'kategori' => $row->kategori_revisi,
                            'catatan'  => $row->catatan_revisi,
                        ]
                    ]),
                ]);
            });
    }

    public function down(): void
    {
        Schema::table('dokumentasi', function (Blueprint $table) {
            $table->dropColumn('revisi_items');
        });
    }
};
