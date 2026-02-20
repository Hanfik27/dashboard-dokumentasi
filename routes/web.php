<?php

use App\Http\Controllers\DokumentasiController;
use App\Http\Controllers\DokumentasiFileController;
use App\Http\Controllers\DokumentasiValidasiController;
use App\Http\Controllers\DokumentasiVerificationController;
use App\Http\Controllers\UserManagementController;
use App\Http\Middleware\RoleMiddleware;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Landing page -> redirect ke login
Route::get('/', function () {
    return redirect()->route('login');
});

// Dashboard redirect berdasarkan role
Route::get('dashboard', function () {
    $role = auth()->user()->role ?? 'user';

    return match ($role) {
        'superadmin' => redirect()->route('dashboard.superadmin'),
        'admin'      => redirect()->route('dashboard.admin'),
        default      => redirect()->route('dashboard.user'),
    };
})->middleware(['auth'])->name('dashboard');

// Dashboard SuperAdmin
Route::get('dashboard/superadmin', function () {
    $dokumentasi = app(DokumentasiController::class)->index();
    return Inertia::render('dashboard/superadmin', [
        'dokumentasiData' => $dokumentasi,
    ]);
})->middleware(['auth', RoleMiddleware::class . ':superadmin'])
  ->name('dashboard.superadmin');

// Dashboard Admin
Route::get('dashboard/admin', function () {
    $dokumentasi = app(DokumentasiController::class)->index();
    return Inertia::render('dashboard/admin', [
        'dokumentasiData' => $dokumentasi,
    ]);
})->middleware(['auth', RoleMiddleware::class . ':admin'])
  ->name('dashboard.admin');

// Dashboard User
Route::get('dashboard/user', function () {
    $dokumentasi = app(DokumentasiController::class)->index();
    return Inertia::render('dashboard/user', [
        'dokumentasiData' => $dokumentasi,
    ]);
})->middleware(['auth', RoleMiddleware::class . ':user'])
  ->name('dashboard.user');

// ─── CRUD Dokumentasi ────────────────────────────────────────────────────────
Route::middleware(['auth'])->group(function () {
    Route::post('/dokumentasi', [DokumentasiController::class, 'store'])->name('dokumentasi.store');
    Route::post('/dokumentasi/{dokumentasi}/update', [DokumentasiController::class, 'update'])->name('dokumentasi.update');
    Route::delete('/dokumentasi/{dokumentasi}', [DokumentasiController::class, 'destroy'])->name('dokumentasi.destroy');
});

// ─── File Management ─────────────────────────────────────────────────────────
Route::middleware(['auth'])->group(function () {
    Route::get('/dokumentasi/download-file', [DokumentasiFileController::class, 'downloadFile'])->name('dokumentasi.download-file');
    Route::get('/dokumentasi/{dokumentasi}/download-zip/{type}', [DokumentasiFileController::class, 'downloadZip'])->name('dokumentasi.download-zip');
    Route::post('/dokumentasi/{dokumentasi}/upload-file', [DokumentasiFileController::class, 'uploadFile'])->name('dokumentasi.upload-file');
    Route::delete('/dokumentasi/{dokumentasi}/delete-file', [DokumentasiFileController::class, 'deleteFile'])->name('dokumentasi.delete-file');
});

// ─── Validasi Kepala ─────────────────────────────────────────────────────────
Route::middleware(['auth'])->group(function () {
    Route::post('/dokumentasi/{dokumentasi}/validate-kepala', [DokumentasiValidasiController::class, 'validateKepala'])->name('dokumentasi.validate-kepala');
});

// ─── Verifikasi & Revisi (Admin & SuperAdmin) ─────────────────────────────────
Route::middleware(['auth', RoleMiddleware::class . ':admin,superadmin'])->group(function () {
    Route::post('/dokumentasi/{dokumentasi}/verify', [DokumentasiVerificationController::class, 'verify'])->name('dokumentasi.verify');
    Route::post('/dokumentasi/{dokumentasi}/revise', [DokumentasiVerificationController::class, 'revise'])->name('dokumentasi.revise');
});

// ─── SuperAdmin: User Management ─────────────────────────────────────────────
Route::middleware(['auth', RoleMiddleware::class . ':superadmin'])->group(function () {
    Route::get('/superadmin/kelola-akun', function () {
        $users = User::select('id', 'name', 'username', 'role', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();
        return Inertia::render('superadmin/kelola-akun', [
            'usersData' => $users,
        ]);
    })->name('superadmin.kelola-akun');

    Route::get('/superadmin/users', [UserManagementController::class, 'index'])->name('superadmin.users.index');
    Route::post('/superadmin/users', [UserManagementController::class, 'store'])->name('superadmin.users.store');
    Route::delete('/superadmin/users/{user}', [UserManagementController::class, 'destroy'])->name('superadmin.users.destroy');
});

require __DIR__.'/settings.php';
