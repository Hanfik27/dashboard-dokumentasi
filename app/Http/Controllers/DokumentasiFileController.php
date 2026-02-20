<?php

namespace App\Http\Controllers;

use App\Models\Dokumentasi;
use App\Services\DokumentasiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DokumentasiFileController extends Controller
{
    protected $service;

    public function __construct(DokumentasiService $service)
    {
        $this->service = $service;
    }

    /**
     * Upload file tambahan ke dokumentasi yang sudah ada.
     * Mendukung tipe 'dokumentasi' dan 'desain'.
     */
    public function uploadFile(Request $request, Dokumentasi $dokumentasi)
    {
        $validated = $request->validate([
            'file_type' => 'required|in:dokumentasi,desain',
            'files.*'   => 'required|file|max:20480',
        ]);

        $fileType = $validated['file_type'];
        $newFiles = $this->service->storeFiles($request->file('files'), $fileType);

        if ($fileType === 'dokumentasi') {
            $existing = $dokumentasi->file_dokumentasi_path ?? [];
            $dokumentasi->file_dokumentasi_path = array_merge($existing, $newFiles);
        } else {
            $existing = $dokumentasi->file_desain_path ?? [];
            $dokumentasi->file_desain_path = array_merge($existing, $newFiles);
        }

        $dokumentasi->save();

        return back()->with('success', 'File berhasil diupload.');
    }

    /**
     * Hapus satu file dari dokumentasi.
     */
    public function deleteFile(Request $request, Dokumentasi $dokumentasi)
    {
        $validated = $request->validate([
            'file_type' => 'required|in:dokumentasi,desain',
            'file_path' => 'required|string',
        ]);

        $fileType = $validated['file_type'];
        $filePath = $validated['file_path'];

        if ($fileType === 'dokumentasi') {
            $files    = $dokumentasi->file_dokumentasi_path ?? [];
            $filtered = array_values(array_filter($files, fn($f) => $f['path'] !== $filePath));
            $dokumentasi->file_dokumentasi_path = $filtered;
        } else {
            $files    = $dokumentasi->file_desain_path ?? [];
            $filtered = array_values(array_filter($files, fn($f) => $f['path'] !== $filePath));
            $dokumentasi->file_desain_path = $filtered;
        }

        Storage::disk('public')->delete($filePath);
        $dokumentasi->save();

        return back()->with('success', 'File berhasil dihapus.');
    }

    /**
     * Download satu file (via query string ?path=&name=).
     */
    public function downloadFile(Request $request)
    {
        $path = $request->query('path');
        $name = $request->query('name');

        if (!$path || !Storage::disk('public')->exists($path)) {
            return abort(404);
        }

        return Storage::disk('public')->download($path, $name);
    }

    /**
     * Download semua file dalam satu tipe sebagai ZIP.
     */
    public function downloadZip(Dokumentasi $dokumentasi, $type)
    {
        if (!in_array($type, ['dokumentasi', 'desain'])) {
            return abort(404);
        }

        $files = $type === 'dokumentasi'
            ? $dokumentasi->file_dokumentasi_path
            : $dokumentasi->file_desain_path;

        if (empty($files)) {
            return back()->with('error', 'Tidak ada file untuk diunduh.');
        }

        $zipPath = $this->service->createZip($files, $type, $dokumentasi->id);

        if (!$zipPath) {
            return back()->with('error', 'Gagal membuat file ZIP. Coba lagi.');
        }

        return response()->download($zipPath, basename($zipPath))->deleteFileAfterSend(true);
    }
}
