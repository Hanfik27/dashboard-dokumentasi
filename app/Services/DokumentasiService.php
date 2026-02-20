<?php

namespace App\Services;

use App\Models\Dokumentasi;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class DokumentasiService
{
    /**
     * Store multiple files to a specific folder.
     */
    public function storeFiles(array $files, string $folder): array
    {
        $result = [];
        foreach ($files as $file) {
            $filename = Str::uuid() . '_' . $file->getClientOriginalName();
            $result[] = [
                'path' => $file->storeAs($folder, $filename, 'public'),
                'name' => $file->getClientOriginalName(),
            ];
        }
        return $result;
    }

    /**
     * Delete files from storage.
     */
    public function deleteFiles(array $files): void
    {
        foreach ($files as $file) {
            Storage::disk('public')->delete($file['path']);
        }
    }

    /**
     * Calculate document status based on verification flags.
     */
    public function calculateStatus(bool $foto, bool $desain, bool $caption): string
    {
        return ($foto && $desain && $caption) ? 'terverifikasi' : 'belum';
    }

    /**
     * Create a ZIP archive of files.
     */
    public function createZip(array $files, string $type, int $id): ?string
    {
        if (empty($files)) {
            return null;
        }

        $zip = new ZipArchive();
        $zipName = ($type === 'dokumentasi' ? 'Dokumentasi' : 'Desain') . '_' . $id . '_' . time() . '.zip';
        $tempDir = storage_path('app/public/temp');
        
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $zipPath = $tempDir . '/' . $zipName;

        if ($zip->open($zipPath, ZipArchive::CREATE) !== TRUE) {
            return null;
        }

        foreach ($files as $file) {
            $filePath = storage_path('app/public/' . $file['path']);
            if (file_exists($filePath)) {
                $zip->addFile($filePath, $file['name']);
            }
        }
        $zip->close();

        return $zipPath;
    }
}
