import { router } from '@inertiajs/react';
import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Eye, FileUp, Info, Pencil, Trash2, XCircle, Clock } from 'lucide-react';
import React from 'react';
import { useToast } from '@/components/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { EditDokumentasiModal } from './edit-dokumentasi-modal';
import { PreviewModal } from './preview-modal';
import { RevisiModal } from './revisi-modal';
import { VerificationBadge } from './verification-badge';
import { VerifyModal } from './verify-modal';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
// Tipe data diimpor dari file terpusat — jangan duplikasi di sini
export type { FileInfo, DokumentasiItem } from '@/types/dokumentasi';
import type { DokumentasiItem } from '@/types/dokumentasi';

interface DokumentasiTableProps {
    data: DokumentasiItem[];
    role: 'superadmin' | 'admin' | 'user';
}

export function DokumentasiTable({ data, role }: DokumentasiTableProps) {
    const { loading, update, success, error } = useToast();
    const [previewOpen, setPreviewOpen] = React.useState(false);
    const [editOpen, setEditOpen] = React.useState(false);
    const [verifyOpen, setVerifyOpen] = React.useState(false);
    const [revisiOpen, setRevisiOpen] = React.useState(false);
    const [catatanOpen, setCatatanOpen] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState<DokumentasiItem | null>(null);
    const [deleteId, setDeleteId] = React.useState<number | null>(null);
    const [validateId, setValidateId] = React.useState<number | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;
    const totalItems = data.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedData = data.slice(startIndex, endIndex);

    // State for verification form
    const [vf, setVf] = React.useState(false);
    const [vd, setVd] = React.useState(false);
    const [vc, setVc] = React.useState(false);

    // State for revision form
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [uploadType, setUploadType] = React.useState<'dokumentasi' | 'desain'>('dokumentasi');

    const handlePreview = (item: DokumentasiItem) => {
        setSelectedItem(item);
        setPreviewOpen(true);
    };

    const handleEditClick = (item: DokumentasiItem) => {
        setSelectedItem(item);
        setEditOpen(true);
    };

    const handleVerifyClick = (item: DokumentasiItem) => {
        setSelectedItem(item);
        setVf(item.verifikasiFoto);
        setVd(item.verifikasiDesain);
        setVc(item.verifikasiCaption);
        setVerifyOpen(true);
    };

    const handleRevisiClick = (item: DokumentasiItem) => {
        setSelectedItem(item);
        setRevisiOpen(true);
    };

    const handleShowCatatan = (item: DokumentasiItem) => {
        setSelectedItem(item);
        setCatatanOpen(true);
    };

    const handleUploadClick = (item: DokumentasiItem, type: 'dokumentasi' | 'desain') => {
        setSelectedItem(item);
        setUploadType(type);
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0 && selectedItem) {
            const toastId = loading('Mengupload file...', `${files.length} file sedang diproses`);
            router.post(`/dokumentasi/${selectedItem.id}/upload-file`, {
                file_type: uploadType,
                files: Array.from(files),
            }, {
                forceFormData: true,
                onSuccess: () => {
                    update(toastId, { type: 'success', title: 'Upload berhasil!', description: `${files.length} file berhasil diupload.` });
                },
                onError: () => {
                    update(toastId, { type: 'error', title: 'Upload gagal', description: 'Terjadi kesalahan saat mengupload file.' });
                },
            });
        }
    };

    const submitVerification = () => {
        if (!selectedItem) return;
        const toastId = loading('Menyimpan verifikasi...');
        router.post(`/dokumentasi/${selectedItem.id}/verify`, {
            verifikasi_foto: vf,
            verifikasi_desain: vd,
            verifikasi_caption: vc,
        }, {
            onSuccess: () => {
                setVerifyOpen(false);
                update(toastId, { type: 'success', title: 'Verifikasi berhasil disimpan!' });
            },
            onError: () => update(toastId, { type: 'error', title: 'Gagal menyimpan verifikasi' }),
        });
    };

    const submitRevision = (data: { kategori: string; catatan: string }) => {
        if (!selectedItem) return;
        const toastId = loading('Mengirim catatan revisi...');
        router.post(`/dokumentasi/${selectedItem.id}/revise`, {
            catatan_revisi: data.catatan,
            kategori_revisi: data.kategori,
        }, {
            onSuccess: () => {
                setRevisiOpen(false);
                update(toastId, { type: 'success', title: 'Catatan revisi berhasil dikirim!' });
            },
            onError: () => update(toastId, { type: 'error', title: 'Gagal mengirim revisi' }),
        });
    };

    const handleDelete = (id: number) => {
        const toastId = loading('Menghapus data...');
        router.delete(`/dokumentasi/${id}`, {
            onSuccess: () => {
                setDeleteId(null);
                update(toastId, { type: 'success', title: 'Data berhasil dihapus!' });
            },
            onError: () => update(toastId, { type: 'error', title: 'Gagal menghapus data' }),
        });
    };

    const handleEditSubmit = (id: number, updatedData: any) => {
        const toastId = loading('Menyimpan perubahan...');
        router.post(`/dokumentasi/${id}/update`, updatedData, {
            forceFormData: true,
            onSuccess: () => {
                setEditOpen(false);
                update(toastId, { type: 'success', title: 'Data berhasil diperbarui!' });
            },
            onError: () => update(toastId, { type: 'error', title: 'Gagal menyimpan perubahan' }),
        });
    };

    // Permission flags berdasarkan role
    const canEdit = role === 'superadmin' || role === 'admin';
    const canVerify = role === 'superadmin' || role === 'admin'; // Bug 2 fix: user tidak bisa verifikasi
    const canDelete = role === 'superadmin';
    const canValidasiKepala = role === 'superadmin';       // superadmin bisa validasi dari panel admin
    const canUserValidasiKepala = role === 'user';         // Bug 3 fix: user juga bisa validasi kepala
    const canUpload = role === 'admin' || role === 'superadmin';

    const handleValidasiKepala = (id: number) => {
        const toastId = loading('Memvalidasi...');
        router.post(`/dokumentasi/${id}/validate-kepala`, {}, {
            onSuccess: () => {
                setValidateId(null);
                update(toastId, { type: 'success', title: 'Berhasil divalidasi oleh Kepala!' });
            },
            onError: () => update(toastId, { type: 'error', title: 'Gagal memvalidasi' }),
        });
    };


    return (
        <>
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />

            <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b bg-muted/40 transition-colors">
                                <th className="px-3 py-2 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">No</th>
                                <th className="px-3 py-2 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Tanggal</th>
                                <th className="px-3 py-2 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Rincian Kegiatan</th>
                                <th className="px-3 py-2 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Bidang</th>
                                <th className="px-3 py-2 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">File</th>
                                <th className="px-3 py-2 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px] min-w-[100px]">Aksi</th>
                                <th className="px-3 py-2 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                                <th className="px-3 py-2 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px] min-w-[110px]">Validasi Kepala</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground italic">
                                        Belum ada data dokumentasi yang tersedia.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item, index) => {
                                    const fileCount = (item.fileDokumentasi?.length || 0) + (item.fileDesain?.length || 0);
                                    return (
                                        <tr key={item.id} className="border-b transition-colors last:border-0 hover:bg-muted/30">
                                            <td className="px-3 py-2.5 text-muted-foreground/70 font-medium">{startIndex + index + 1}</td>
                                            <td className="px-3 py-2.5 whitespace-nowrap font-medium">{item.tanggal}</td>
                                            <td className="px-3 py-2.5 min-w-[200px] max-w-[350px]">
                                                <p className="whitespace-normal break-words leading-snug text-foreground/80 font-normal">
                                                    {item.rincian}
                                                </p>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <Badge variant="outline" className="bg-muted/50 border-border font-semibold text-[9px] tracking-tight">{item.bidang}</Badge>
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <div className="flex flex-col gap-1.5">
                                                    <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px] relative bg-card border-border hover:bg-muted" onClick={() => handlePreview(item)}>
                                                        <Eye className="size-3 text-blue-500" /> Preview
                                                    </Button>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            {role !== 'user' && canUpload && (
                                                                <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px] bg-card border-border">
                                                                    <FileUp className="size-3 text-indigo-500" /> Upload
                                                                </Button>
                                                            )}
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem onClick={() => handleUploadClick(item, 'dokumentasi')} className="text-[11px] cursor-pointer">
                                                                Upload File Dokumentasi
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUploadClick(item, 'desain')} className="text-[11px] cursor-pointer">
                                                                Upload File Desain Grafis
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 min-w-[130px]">
                                                <div className="flex flex-wrap gap-1.5 items-center">
                                                    {/* Admin/Superadmin buttons */}
                                                    {role !== 'user' && canEdit && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-7 px-2 bg-blue-50/50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-950/40 text-[9px] font-bold gap-1" 
                                                            onClick={() => handleEditClick(item)}
                                                            title="Edit"
                                                        >
                                                            <Pencil className="size-3" /> Edit
                                                        </Button>
                                                    )}
                                                    {role !== 'user' && canVerify && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-7 px-2 bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 dark:hover:bg-emerald-950/40 text-[9px] font-bold gap-1" 
                                                            onClick={() => handleVerifyClick(item)}
                                                            title="Verifikasi"
                                                        >
                                                            <CheckCircle2 className="size-3" /> Verifikasi
                                                        </Button>
                                                    )}
                                                    {role !== 'user' && canVerify && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-7 px-2 bg-amber-50/50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50 dark:hover:bg-amber-950/40 text-[9px] font-bold gap-1" 
                                                            onClick={() => handleRevisiClick(item)}
                                                            title="Revisi"
                                                        >
                                                            <XCircle className="size-3" /> Revisi
                                                        </Button>
                                                    )}
                                                    {role !== 'user' && canValidasiKepala && !item.validasiKepala && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 px-2 bg-violet-50/50 text-violet-600 hover:bg-violet-100 hover:text-violet-700 border-violet-100 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/50 dark:hover:bg-violet-950/40 text-[9px] font-bold gap-1"
                                                            onClick={() => setValidateId(item.id)}
                                                            title="Validasi Kepala"
                                                        >
                                                            <CheckCircle2 className="size-3" /> Validasi Kepala
                                                        </Button>
                                                    )}
                                                    {canDelete && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-7 px-2 bg-rose-50/50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50 dark:hover:bg-rose-950/40 text-[9px] font-bold gap-1" 
                                                            onClick={() => handleDelete(item.id)}
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="size-3" /> Hapus
                                                        </Button>
                                                    )}
                                                    {/* User role: hanya Validasi Kepala */}
                                                    {role === 'user' && canUserValidasiKepala && !item.validasiKepala && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 px-2.5 bg-violet-50/50 text-violet-600 hover:bg-violet-100 hover:text-violet-700 border-violet-100 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/50 dark:hover:bg-violet-950/40 text-[9px] font-bold gap-1"
                                                            onClick={() => setValidateId(item.id)}
                                                            title="Validasi Kepala"
                                                        >
                                                            <CheckCircle2 className="size-3" /> Validasi Kepala
                                                        </Button>
                                                    )}
                                                    {role === 'user' && item.validasiKepala && (
                                                        <span className="text-[9px] text-muted-foreground italic py-0.5">Sudah divalidasi</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <VerificationBadge item={item} onShowCatatan={handleShowCatatan} />
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="flex flex-col gap-1 items-start">
                                                    {item.validasiKepala ? (
                                                        <Badge variant="default" className="bg-green-600 hover:bg-green-700 gap-1 py-0.5 px-2 text-[10px] font-semibold tracking-wide text-black dark:text-white">
                                                            <CheckCircle2 className="size-2.5" /> Sudah Divalidasi
                                                        </Badge>
                                                    ) : (
                                                        <>
                                                            <Badge variant="default" className="bg-red-600 hover:bg-red-700 gap-1 py-0.5 px-2 text-[10px] font-semibold tracking-wide text-black dark:text-white">
                                                                <Clock className="size-2.5" /> Belum Divalidasi
                                                            </Badge>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Footer */}
                {totalItems > 0 && (
                    <div className="flex items-center justify-between border-t px-4 py-3 bg-muted/20">
                        <p className="text-xs text-muted-foreground">
                            Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to <span className="font-semibold text-foreground">{endIndex}</span> of <span className="font-semibold text-foreground">{totalItems}</span> entries
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
                                            <span className="text-xs text-muted-foreground px-1">…</span>
                                        )}
                                        <Button
                                            variant={currentPage === page ? 'default' : 'outline'}
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
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next <ChevronRight className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Components */}
            <PreviewModal
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                fileDokumentasi={selectedItem?.fileDokumentasi || []}
                fileDesain={selectedItem?.fileDesain || []}
                uploader={selectedItem?.userName}
                itemId={selectedItem?.id}
            />

            <EditDokumentasiModal
                open={editOpen}
                onOpenChange={setEditOpen}
                item={selectedItem}
                onSubmit={handleEditSubmit}
            />

            {/* Verification Modal — dipindah ke komponen VerifyModal */}
            <VerifyModal
                open={verifyOpen}
                onOpenChange={setVerifyOpen}
                vf={vf}
                vd={vd}
                vc={vc}
                onVfChange={setVf}
                onVdChange={setVd}
                onVcChange={setVc}
                onSubmit={submitVerification}
            />

            <RevisiModal
                open={revisiOpen}
                onOpenChange={setRevisiOpen}
                onSubmit={submitRevision}
            />

            {/* Show Catatan Modal */}
            <Dialog open={catatanOpen} onOpenChange={setCatatanOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Info className="size-5 text-amber-600" />
                            Catatan Revisi
                        </DialogTitle>
                    </DialogHeader>
                    <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-100 dark:border-amber-900/30 font-medium text-slate-700 dark:text-slate-300">
                        {selectedItem?.catatanRevisi || 'Tidak ada catatan.'}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setCatatanOpen(false)}>Tutup</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Data dokumentasi akan dihapus secara permanen dari server.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && handleDelete(deleteId)}
                            className="bg-rose-600 hover:bg-rose-700"
                        >
                            Hapus Data
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={validateId !== null} onOpenChange={(open) => !open && setValidateId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Validasi sebagai Kepala?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Dokumentasi ini akan ditandai sebagai sudah divalidasi secara resmi.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => validateId && handleValidasiKepala(validateId)}
                            className="bg-violet-600 hover:bg-violet-700"
                        >
                            Ya, Validasi
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
