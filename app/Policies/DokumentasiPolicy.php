<?php

namespace App\Policies;

use App\Models\Dokumentasi;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DokumentasiPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Dokumentasi $dokumentasi): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true; // Semua user bisa buat dokumentasi
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Dokumentasi $dokumentasi): bool
    {
        return in_array($user->role, ['admin', 'superadmin']) || $user->id === $dokumentasi->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Dokumentasi $dokumentasi): bool
    {
        return $user->role === 'superadmin' || $user->id === $dokumentasi->user_id;
    }

    public function verify(User $user, Dokumentasi $dokumentasi): bool
    {
        return in_array($user->role, ['admin', 'superadmin']);
    }

    public function revise(User $user, Dokumentasi $dokumentasi): bool
    {
        return in_array($user->role, ['admin', 'superadmin']);
    }

    public function validateKepala(User $user, Dokumentasi $dokumentasi): bool
    {
        // Superadmin bisa lewat dashboard admin, atau user (Kepala) lewat dashboard sendiri
        return $user->role === 'superadmin' || $user->role === 'user';
    }
}
