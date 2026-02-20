<?php

namespace App\Http\Controllers;

use App\Models\Dokumentasi;
use App\Services\DokumentasiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DokumentasiController extends Controller
{
    protected $service;

    public function __construct(DokumentasiService $service)
    {
        $this->service = $service;
    }

    /**
     * Ambil semua data dokumentasi beserta user-nya.
     * Digunakan oleh route dashboard (Inertia partial reload).
     */
    public function index()
    {
        $dokumentasi = Dokumentasi::with('user:id,name')
            ->orderBy('tanggal', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'id'                => $item->id,
                    'tanggal'          => $item->tanggal->format('Y-m-d'),
                    'rincian'          => $item->rincian,
                    'bidang'           => $item->bidang,
                    'fileDokumentasi'  => collect($item->file_dokumentasi_path ?? [])->map(fn($f) => [
                        'name' => $f['name'],
                        'url'  => Storage::disk('public')->url($f['path']),
                        'path' => $f['path'],
                    ])->toArray(),
                    'fileDesain'       => collect($item->file_desain_path ?? [])->map(fn($f) => [
                        'name' => $f['name'],
                        'url'  => Storage::disk('public')->url($f['path']),
                        'path' => $f['path'],
                    ])->toArray(),
                    'verifikasiFoto'    => $item->verifikasi_foto,
                    'verifikasiDesain'  => $item->verifikasi_desain,
                    'verifikasiCaption' => $item->verifikasi_caption,
                    'catatanRevisi'    => $item->catatan_revisi,
                    'kategoriRevisi'   => $item->kategori_revisi,
                    'validasiKepala'   => $item->validasi_kepala,
                    'status'           => $item->status,
                    'userName'         => $item->user->name ?? '-',
                ];
            });

        return $dokumentasi;
    }

    /**
     * Tambah dokumentasi baru.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Dokumentasi::class);

        $validated = $request->validate([
            'tanggal'             => 'required|date',
            'rincian'             => 'required|string',
            'bidang'              => 'required|in:PJPA,OP,PJSA,PPID',
            'file_dokumentasi.*'  => 'nullable|file|max:10240',
            'file_desain.*'       => 'nullable|file|max:10240',
        ]);

        $data = [
            'user_id' => $request->user()->id,
            'tanggal' => $validated['tanggal'],
            'rincian' => $validated['rincian'],
            'bidang'  => $validated['bidang'],
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

    /**
     * Edit data dokumentasi.
     */
    public function update(Request $request, Dokumentasi $dokumentasi)
    {
        $this->authorize('update', $dokumentasi);

        $validated = $request->validate([
            'tanggal'             => 'required|date',
            'rincian'             => 'required|string',
            'bidang'              => 'required|in:PJPA,OP,PJSA,PPID',
            'file_dokumentasi.*'  => 'nullable|file|max:20480',
            'file_desain.*'       => 'nullable|file|max:20480',
        ]);

        $dokumentasi->tanggal = $validated['tanggal'];
        $dokumentasi->rincian = $validated['rincian'];
        $dokumentasi->bidang  = $validated['bidang'];

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

    /**
     * Hapus dokumentasi beserta semua file-nya.
     */
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
}
