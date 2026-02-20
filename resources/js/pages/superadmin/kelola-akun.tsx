import { Head, router } from '@inertiajs/react';
import { Plus, ShieldCheck, User as UserIcon, Users, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { AddUserModal } from '@/components/add-user-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/toast';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import React from 'react';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kelola Akun',
        href: '/superadmin/kelola-akun',
    },
];

type UserData = {
    id: number;
    name: string;
    username: string;
    role: 'superadmin' | 'admin' | 'user';
    created_at: string;
};

type Props = {
    usersData: UserData[];
};

export default function KelolaAkun({ usersData }: Props) {
    const [addOpen, setAddOpen] = useState(false);
    const { loading, update } = useToast();

    const stats = [
        {
            title: 'Total Akun',
            value: usersData.length.toString(),
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Super Admin',
            value: usersData.filter((u) => u.role === 'superadmin').length.toString(),
            icon: ShieldCheck,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            title: 'Admin',
            value: usersData.filter((u) => u.role === 'admin').length.toString(),
            icon: ShieldCheck,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'User',
            value: usersData.filter((u) => u.role === 'user').length.toString(),
            icon: UserIcon,
            color: 'text-slate-600',
            bgColor: 'bg-slate-100',
        },
    ];

    const handleAddUser = (data: any) => {
        const toastId = loading('Membuat akun baru...');
        router.post('/superadmin/users', data, {
            onSuccess: () => {
                setAddOpen(false);
                update(toastId, { type: 'success', title: 'Akun berhasil dibuat!' });
            },
            onError: () => update(toastId, { type: 'error', title: 'Gagal membuat akun' }),
        });
    };

    const handleDeleteUser = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
            const toastId = loading('Menghapus akun...');
            router.delete(`/superadmin/users/${id}`, {
                onSuccess: () => update(toastId, { type: 'success', title: 'Akun berhasil dihapus!' }),
                onError: () => update(toastId, { type: 'error', title: 'Gagal menghapus akun' }),
            });
        }
    };

    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;
    const totalItems = usersData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedData = usersData.slice(startIndex, endIndex);

    const { isRefreshing } = useAutoRefresh(['usersData'], 15_000);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Akun" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.title}
                            className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm"
                        >
                            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                                <stat.icon className={`size-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* User Table */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Daftar Akun</h2>
                        <Button onClick={() => setAddOpen(true)} className="gap-2">
                            <Plus className="size-4" />
                            Tambah Akun
                        </Button>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium">Nama</th>
                                <th className="px-4 py-3 text-left font-medium">Username</th>
                                <th className="px-4 py-3 text-left font-medium">Role</th>
                                <th className="px-4 py-3 text-left font-medium">Dibuat Pada</th>
                                <th className="px-4 py-3 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {totalItems === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                    Belum ada data akun
                                    </td>
                                </tr>
                                ) : (
                                paginatedData.map((user) => (
                                    <tr
                                    key={user.id}
                                    className="border-b last:border-0 hover:bg-muted/30"
                                    >
                                    <td className="px-4 py-3 font-medium">{user.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {user.username}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                        variant={
                                            user.role === "superadmin"
                                            ? "default"
                                            : user.role === "admin"
                                            ? "secondary"
                                            : "outline"
                                        }
                                        className="capitalize"
                                        >
                                        {user.role}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {new Date(user.created_at).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                        })}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeleteUser(user.id)}
                                        >
                                        <Trash2 className="size-4" />
                                        </Button>
                                    </td>
                                    </tr>
                                ))
                                )}
                            </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalItems > 0 && (
                            <div className="flex items-center justify-between border-t px-4 py-3 bg-muted/20">
                            <p className="text-xs text-muted-foreground">
                                Showing{" "}
                                <span className="font-semibold text-foreground">
                                {startIndex + 1}
                                </span>{" "}
                                to{" "}
                                <span className="font-semibold text-foreground">
                                {endIndex}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-foreground">
                                {totalItems}
                                </span>{" "}
                                entries
                            </p>

                            <div className="flex items-center gap-1.5">
                                <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[11px]"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                >
                                <ChevronLeft className="size-3.5" /> Previous
                                </Button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((page) => {
                                    if (totalPages <= 5) return true;
                                    if (page === 1 || page === totalPages) return true;
                                    if (Math.abs(page - currentPage) <= 1) return true;
                                    return false;
                                })
                                .map((page, idx, arr) => (
                                    <React.Fragment key={page}>
                                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                                        <span className="text-xs text-muted-foreground px-1">
                                        …
                                        </span>
                                    )}
                                    <Button
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        className="h-7 w-7 p-0 text-[11px]"
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </Button>
                                    </React.Fragment>
                                ))}

                                <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[11px]"
                                onClick={() =>
                                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                                }
                                disabled={currentPage === totalPages}
                                >
                                Next <ChevronRight className="size-3.5" />
                                </Button>
                            </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AddUserModal
                open={addOpen}
                onOpenChange={setAddOpen}
                onSubmit={handleAddUser}
            />
        </AppLayout>
    );
}
