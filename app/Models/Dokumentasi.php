<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dokumentasi extends Model
{
    use HasFactory;

    protected $table = 'dokumentasi';

    protected $fillable = [
        'user_id',
        'tanggal',
        'rincian',
        'bidang',
        'file_dokumentasi_path',
        'file_desain_path',
        'verifikasi_foto',
        'verifikasi_desain',
        'verifikasi_caption',
        'catatan_revisi',
        'kategori_revisi',
        'validasi_kepala',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'file_dokumentasi_path' => 'array',
            'file_desain_path' => 'array',
            'verifikasi_foto' => 'boolean',
            'verifikasi_desain' => 'boolean',
            'verifikasi_caption' => 'boolean',
            'validasi_kepala' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
