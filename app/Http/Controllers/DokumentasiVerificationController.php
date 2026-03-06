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
     * Hapus entri dari revisi_items untuk kategori yang sudah diverifikasi.
     * Status dihitung ulang dengan mempertimbangkan revisi aktif.
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

        // Hapus entri revisi dari revisi_items untuk kategori yang sudah diverifikasi
        $revisiItems = $dokumentasi->revisi_items ?? [];

        $revisiItems = array_values(array_filter($revisiItems, function ($item) use ($validated) {
            $kategori = $item['kategori'];
            // Hapus entri jika kategori tersebut sudah diverifikasi (true)
            if ($kategori === 'foto'    && $validated['verifikasi_foto'])    return false;
            if ($kategori === 'desain'  && $validated['verifikasi_desain'])  return false;
            if ($kategori === 'caption' && $validated['verifikasi_caption']) return false;
            return true;
        }));

        $dokumentasi->revisi_items = $revisiItems;

        // Recalculate status: revisi jika masih ada revisi aktif
        $dokumentasi->status = $this->service->calculateStatusWithRevisi(
            $validated['verifikasi_foto'],
            $validated['verifikasi_desain'],
            $validated['verifikasi_caption'],
            $revisiItems
        );

        // Hapus catatan_revisi lama jika tidak ada lagi revisi aktif
        if (empty($revisiItems)) {
            $dokumentasi->catatan_revisi  = null;
            $dokumentasi->kategori_revisi = null;
        }

        $dokumentasi->save();

        return back()->with('success', 'Verifikasi berhasil diperbarui.');
    }

    /**
     * Tambahkan/update entri revisi di revisi_items untuk kategori tertentu.
     * Reset verifikasi hanya untuk kategori yang direvisi.
     */
    public function revise(Request $request, Dokumentasi $dokumentasi)
    {
        $this->authorize('revise', $dokumentasi);

        $validated = $request->validate([
            'catatan_revisi'  => 'required|string',
            'kategori_revisi' => 'required|in:foto,desain,caption',
        ]);

        $kategori = $validated['kategori_revisi'];
        $catatan  = $validated['catatan_revisi'];

        // Ambil revisi_items yang ada, atau array kosong
        $revisiItems = $dokumentasi->revisi_items ?? [];

        // Hapus entri lama untuk kategori yang sama (jika sudah ada), lalu tambahkan yang baru
        $revisiItems = array_values(array_filter($revisiItems, fn($item) => $item['kategori'] !== $kategori));
        $revisiItems[] = ['kategori' => $kategori, 'catatan' => $catatan];

        $dokumentasi->revisi_items    = $revisiItems;
        $dokumentasi->status          = 'revisi';
        // Simpan juga ke kolom lama untuk backward compatibility
        $dokumentasi->catatan_revisi  = $catatan;
        $dokumentasi->kategori_revisi = $kategori;

        // Reset verifikasi hanya untuk kategori yang direvisi
        match ($kategori) {
            'foto'    => $dokumentasi->verifikasi_foto    = false,
            'desain'  => $dokumentasi->verifikasi_desain  = false,
            'caption' => $dokumentasi->verifikasi_caption = false,
        };

        $dokumentasi->save();

        return back()->with('success', 'Catatan revisi berhasil dikirim.');
    }
}
