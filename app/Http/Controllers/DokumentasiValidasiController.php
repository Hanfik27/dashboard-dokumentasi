<?php

namespace App\Http\Controllers;

use App\Models\Dokumentasi;

class DokumentasiValidasiController extends Controller
{
    /**
     * Validasi dokumentasi sebagai Kepala.
     * Bersifat irreversible — tidak dapat dibatalkan setelah divalidasi.
     */
    public function validateKepala(Dokumentasi $dokumentasi)
    {
        $this->authorize('validateKepala', $dokumentasi);

        if ($dokumentasi->validasi_kepala) {
            return back()->with('info', 'Sudah divalidasi sebelumnya.');
        }

        $dokumentasi->validasi_kepala = true;
        $dokumentasi->save();

        return back()->with('success', 'Dokumentasi berhasil divalidasi oleh Kepala.');
    }
}
