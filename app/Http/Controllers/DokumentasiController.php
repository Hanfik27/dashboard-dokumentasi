<?php

namespace App\Http\Controllers;

use App\Models\Dokumentasi;
use App\Services\DokumentasiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DokumentasiController extends Controller
{
    protected $service;

    public function __construct(DokumentasiService $service)
    {
        $this->service = $service;
    }
    public function index()
    {
        $dokumentasi = Dokumentasi::with('user:id,name')
            ->orderBy('tanggal', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'tanggal' => $item->tanggal->format('Y-m-d'),
                    'rincian' => $item->rincian,
                    'bidang' => $item->bidang,
                    'fileDokumentasi' => collect($item->file_dokumentasi_path ?? [])->map(function ($f) {
                        return [
                            'name' => $f['name'],
                            'url' => Storage::disk('public')->url($f['path']),
                            'path' => $f['path'],
                        ];
                    })->toArray(),
                    'fileDesain' => collect($item->file_desain_path ?? [])->map(function ($f) {
                        return [
                            'name' => $f['name'],
                            'url' => Storage::disk('public')->url($f['path']),
                            'path' => $f['path'],
                        ];
                    })->toArray(),
                    'verifikasiFoto' => $item->verifikasi_foto,
                    'verifikasiDesain' => $item->verifikasi_desain,
                    'verifikasiCaption' => $item->verifikasi_caption,
                    'catatanRevisi' => $item->catatan_revisi,
                    'kategoriRevisi' => $item->kategori_revisi,
                    'validasiKepala' => $item->validasi_kepala,
                    'status' => $item->status,
                    'userName' => $item->user->name ?? '-',
                ];
            });

        return $dokumentasi;
    }

    public function store(Request $request)
    {
        $this->authorize('create', Dokumentasi::class);

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'rincian' => 'required|string',
            'bidang' => 'required|in:PJPA,OP,PJSA,PPID',
            'file_dokumentasi.*' => 'nullable|file|max:10240',
            'file_desain.*' => 'nullable|file|max:10240',
        ]);

        $data = [
            'user_id' => $request->user()->id,
            'tanggal' => $validated['tanggal'],
            'rincian' => $validated['rincian'],
            'bidang' => $validated['bidang'],
        ];

        if ($request->hasFile('file_dokumentasi')) {
            $data['file_dokumentasi_path'] = $this->service->storeFiles($request->file('file_dokumentasi'), 'dokumentasi');
        }

        if ($request->hasFile('file_desain')) {
            $data['file_desain_path'] = $this->service->storeFiles($request->file('file_desain'), 'desain');
        }

        Dokumentasi::create($data);

        return back()->with('success', 'Dokumentasi berhasil ditambahkan.');
    }

    public function update(Request $request, Dokumentasi $dokumentasi)
    {
        $this->authorize('update', $dokumentasi);

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'rincian' => 'required|string',
            'bidang' => 'required|in:PJPA,OP,PJSA,PPID',
            'file_dokumentasi.*' => 'nullable|file|max:20480',
            'file_desain.*' => 'nullable|file|max:20480',
        ]);

        $dokumentasi->tanggal = $validated['tanggal'];
        $dokumentasi->rincian = $validated['rincian'];
        $dokumentasi->bidang = $validated['bidang'];

        if ($request->hasFile('file_dokumentasi')) {
            if ($dokumentasi->file_dokumentasi_path) {
                $this->service->deleteFiles($dokumentasi->file_dokumentasi_path);
            }
            $dokumentasi->file_dokumentasi_path = $this->service->storeFiles($request->file('file_dokumentasi'), 'dokumentasi');
        }

        if ($request->hasFile('file_desain')) {
            if ($dokumentasi->file_desain_path) {
                $this->service->deleteFiles($dokumentasi->file_desain_path);
            }
            $dokumentasi->file_desain_path = $this->service->storeFiles($request->file('file_desain'), 'desain');
        }

        $dokumentasi->save();

        return back()->with('success', 'Dokumentasi berhasil diperbarui.');
    }

    public function destroy(Dokumentasi $dokumentasi)
    {
        $this->authorize('delete', $dokumentasi);

        if ($dokumentasi->file_dokumentasi_path) {
            $this->service->deleteFiles($dokumentasi->file_dokumentasi_path);
        }
        if ($dokumentasi->file_desain_path) {
            $this->service->deleteFiles($dokumentasi->file_desain_path);
        }

        $dokumentasi->delete();

        return back()->with('success', 'Dokumentasi berhasil dihapus.');
    }

    public function verify(Request $request, Dokumentasi $dokumentasi)
    {
        $this->authorize('verify', $dokumentasi);

        $validated = $request->validate([
            'verifikasi_foto' => 'required|boolean',
            'verifikasi_desain' => 'required|boolean',
            'verifikasi_caption' => 'required|boolean',
        ]);

        $dokumentasi->verifikasi_foto = $validated['verifikasi_foto'];
        $dokumentasi->verifikasi_desain = $validated['verifikasi_desain'];
        $dokumentasi->verifikasi_caption = $validated['verifikasi_caption'];

        // Auto-set status: hanya 'terverifikasi' kalau SEMUA 3 item dicentang
        $dokumentasi->status = $this->service->calculateStatus(
            $validated['verifikasi_foto'],
            $validated['verifikasi_desain'],
            $validated['verifikasi_caption']
        );

        // Clear revision note when verifying
        $dokumentasi->catatan_revisi = null;

        $dokumentasi->save();

        return back()->with('success', 'Verifikasi berhasil diperbarui.');
    }

    public function revise(Request $request, Dokumentasi $dokumentasi)
    {
        $this->authorize('revise', $dokumentasi);

        $validated = $request->validate([
            'catatan_revisi' => 'required|string',
            'kategori_revisi' => 'required|in:foto,desain,caption',
        ]);

        $dokumentasi->status = 'revisi';
        $dokumentasi->catatan_revisi = $validated['catatan_revisi'];
        $dokumentasi->kategori_revisi = $validated['kategori_revisi'];

        // Reset verifications
        $dokumentasi->verifikasi_foto = false;
        $dokumentasi->verifikasi_desain = false;
        $dokumentasi->verifikasi_caption = false;

        $dokumentasi->save();

        return back()->with('success', 'Data dikembalikan untuk revisi.');
    }

    public function validateKepala(Dokumentasi $dokumentasi)
    {
        $this->authorize('validateKepala', $dokumentasi);

        // Irreversible — once validated, cannot be undone
        if ($dokumentasi->validasi_kepala) {
            return back()->with('info', 'Sudah divalidasi sebelumnya.');
        }

        $dokumentasi->validasi_kepala = true;
        $dokumentasi->save();

        return back()->with('success', 'Dokumentasi berhasil divalidasi oleh Kepala.');
    }

    public function uploadFile(Request $request, Dokumentasi $dokumentasi)
    {
        $validated = $request->validate([
            'file_type' => 'required|in:dokumentasi,desain',
            'files.*' => 'required|file|max:20480',
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

    public function deleteFile(Request $request, Dokumentasi $dokumentasi)
    {
        $validated = $request->validate([
            'file_type' => 'required|in:dokumentasi,desain',
            'file_path' => 'required|string',
        ]);

        $fileType = $validated['file_type'];
        $filePath = $validated['file_path'];

        if ($fileType === 'dokumentasi') {
            $files = $dokumentasi->file_dokumentasi_path ?? [];
            $filtered = array_values(array_filter($files, fn($f) => $f['path'] !== $filePath));
            $dokumentasi->file_dokumentasi_path = $filtered;
        } else {
            $files = $dokumentasi->file_desain_path ?? [];
            $filtered = array_values(array_filter($files, fn($f) => $f['path'] !== $filePath));
            $dokumentasi->file_desain_path = $filtered;
        }

        // Delete from storage
        Storage::disk('public')->delete($filePath);

        $dokumentasi->save();

        return back()->with('success', 'File berhasil dihapus.');
    }

    public function downloadFile(Request $request)
    {
        $path = $request->query('path');
        $name = $request->query('name');

        if (!$path || !Storage::disk('public')->exists($path)) {
            return abort(404);
        }

        return Storage::disk('public')->download($path, $name);
    }

    public function downloadZip(Dokumentasi $dokumentasi, $type)
    {
        if (!in_array($type, ['dokumentasi', 'desain'])) {
            return abort(404);
        }

        $files = $type === 'dokumentasi' ? $dokumentasi->file_dokumentasi_path : $dokumentasi->file_desain_path;

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
