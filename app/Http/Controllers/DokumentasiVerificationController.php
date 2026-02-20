<?php

namespace App\Http\Controllers;

use App\Models\Dokumentasi;
use App\Services\DokumentasiService;
use Illuminate\Http\Request;

class DokumentasiVerificationController extends Controller
{
    protected $service;

    public function __construct(DokumentasiService $service)
    {
        $this->service = $service;
    }

    /**
     * Simpan hasil verifikasi (foto, desain, caption).
     * Status otomatis dihitung: 'terverifikasi' jika semua dicentang.
     */
    public function verify(Request $request, Dokumentasi $dokumentasi)
    {
        $this->authorize('verify', $dokumentasi);

        $validated = $request->validate([
            'verifikasi_foto'    => 'required|boolean',
            'verifikasi_desain'  => 'required|boolean',
            'verifikasi_caption' => 'required|boolean',
        ]);

        $dokumentasi->verifikasi_foto    = $validated['verifikasi_foto'];
        $dokumentasi->verifikasi_desain  = $validated['verifikasi_desain'];
        $dokumentasi->verifikasi_caption = $validated['verifikasi_caption'];

        // Status: 'terverifikasi' hanya jika SEMUA 3 item dicentang
        $dokumentasi->status = $this->service->calculateStatus(
            $validated['verifikasi_foto'],
            $validated['verifikasi_desain'],
            $validated['verifikasi_caption']
        );

        // Bersihkan catatan revisi saat verifikasi
        $dokumentasi->catatan_revisi = null;

        $dokumentasi->save();

        return back()->with('success', 'Verifikasi berhasil diperbarui.');
    }

    /**
     * Kembalikan dokumentasi ke status revisi dengan catatan.
     * Reset semua flag verifikasi.
     */
    public function revise(Request $request, Dokumentasi $dokumentasi)
    {
        $this->authorize('revise', $dokumentasi);

        $validated = $request->validate([
            'catatan_revisi'  => 'required|string',
            'kategori_revisi' => 'required|in:foto,desain,caption',
        ]);

        $dokumentasi->status          = 'revisi';
        $dokumentasi->catatan_revisi  = $validated['catatan_revisi'];
        $dokumentasi->kategori_revisi = $validated['kategori_revisi'];

        // Reset semua verifikasi
        $dokumentasi->verifikasi_foto    = false;
        $dokumentasi->verifikasi_desain  = false;
        $dokumentasi->verifikasi_caption = false;

        $dokumentasi->save();

        return back()->with('success', 'Data dikembalikan untuk revisi.');
    }
}
