import { router } from '@inertiajs/react';
import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    FileText,
    FileImage,
    FileSpreadsheet,
    FileArchive,
    FileVideo,
    FileAudio,
    FileCode,
    FileBox,
    File as FileIcon,
    Trash2,
    AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/components/toast';
import type { DokumentasiItem, FileInfo } from '@/components/dokumentasi-table';

interface EditDokumentasiModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: DokumentasiItem | null;
    onSubmit: (id: number, updatedData: any) => void;
}

const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
const isPdf = (name: string) => /\.pdf$/i.test(name);

const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (!ext) return FileIcon;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return FileImage;
    if (ext === 'pdf') return FileText;
    if (['doc', 'docx'].includes(ext)) return FileText;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet;
    if (['zip', 'rar', '7z', 'gz'].includes(ext)) return FileArchive;
    if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return FileVideo;
    if (['mp3', 'wav', 'ogg'].includes(ext)) return FileAudio;
    if (['js', 'ts', 'tsx', 'html', 'css', 'php', 'py', 'json'].includes(ext)) return FileCode;
    if (['psd', 'ai', 'eps'].includes(ext)) return FileBox;
    return FileIcon;
};

function FilePreview({ file }: { file: FileInfo }) {
    if (isImage(file.name)) {
        return (
            <div className="flex items-center justify-center rounded-lg bg-muted/40 border overflow-hidden h-36">
                <img
                    src={file.url}
                    alt={file.name}
                    className="max-h-full max-w-full object-contain"
                />
            </div>
        );
    }
    if (isPdf(file.name)) {
        return (
            <div className="rounded-lg border overflow-hidden h-36">
                <iframe
                    src={file.url}
                    title={file.name}
                    className="w-full h-full"
                />
            </div>
        );
    }
    const Icon = getFileIcon(file.name);
    return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-muted/40 border h-36">
            <Icon className="size-10 text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-medium px-4 text-center break-all line-clamp-2">{file.name}</p>
        </div>
    );
}

function FileDeletionSection({
    label,
    files,
    fileType,
    itemId,
}: {
    label: string;
    files: FileInfo[];
    fileType: 'dokumentasi' | 'desain';
    itemId: number;
}) {
    const [selectedPath, setSelectedPath] = React.useState<string>('');
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [confirmDelete, setConfirmDelete] = React.useState(false);
    const { loading, update } = useToast();

    const selectedFile = files.find(f => f.path === selectedPath) || null;

    // Reset when files change
    React.useEffect(() => {
        setSelectedPath('');
        setConfirmDelete(false);
    }, [files.length]);

    const handleDelete = () => {
        if (!selectedPath || !itemId) return;
        setIsDeleting(true);
        const toastId = loading('Menghapus file...');
        router.delete(`/dokumentasi/${itemId}/delete-file`, {
            data: {
                file_type: fileType,
                file_path: selectedPath,
            },
            onSuccess: () => {
                setSelectedPath('');
                setConfirmDelete(false);
                setIsDeleting(false);
                update(toastId, { type: 'success', title: 'File berhasil dihapus!' });
            },
            onError: () => {
                setIsDeleting(false);
                update(toastId, { type: 'error', title: 'Gagal menghapus file' });
            },
        });
    };

    if (files.length === 0) {
        return (
            <div className="grid gap-2">
                <Label>{label}</Label>
                <p className="text-xs text-muted-foreground italic py-2">Tidak ada file yang tersedia.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <Select value={selectedPath} onValueChange={(val) => { setSelectedPath(val); setConfirmDelete(false); }}>
                <SelectTrigger>
                    <SelectValue placeholder="Pilih file yang ingin dihapus..." />
                </SelectTrigger>
                <SelectContent>
                    {files.map((f, i) => (
                        <SelectItem key={i} value={f.path}>
                            {f.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {selectedFile && (
                <div className="mt-1 space-y-2">
                    <FilePreview file={selectedFile} />
                    <p className="text-[11px] text-muted-foreground truncate font-mono">{selectedFile.name}</p>

                    {!confirmDelete ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                            onClick={() => setConfirmDelete(true)}
                        >
                            <Trash2 className="size-3.5" />
                            Hapus File Ini
                        </Button>
                    ) : (
                        <div className="rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-3 space-y-2">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="size-4 text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">
                                    Yakin ingin menghapus file ini? Tindakan ini tidak dapat dibatalkan.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs"
                                    onClick={() => setConfirmDelete(false)}
                                    disabled={isDeleting}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="flex-1 text-xs bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="size-3" />
                                    {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function EditDokumentasiModal({ open, onOpenChange, item, onSubmit }: EditDokumentasiModalProps) {
    const [tanggal, setTanggal] = React.useState('');
    const [rincian, setRincian] = React.useState('');
    const [bidang, setBidang] = React.useState('');
    const [processing, setProcessing] = React.useState(false);

    // Pre-fill form when item changes
    React.useEffect(() => {
        if (item) {
            setTanggal(item.tanggal);
            setRincian(item.rincian);
            setBidang(item.bidang);
        }
    }, [item]);

    const handleSubmit = () => {
        if (!item) return;
        setProcessing(true);
        onSubmit(item.id, {
            tanggal,
            rincian,
            bidang,
        });
    };

    // Reset processing when open changes
    React.useEffect(() => {
        if (!open) setProcessing(false);
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Dokumentasi Kegiatan</DialogTitle>
                    <DialogDescription>
                        Ubah data atau hapus file dokumentasi kegiatan.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-5 py-2">
                    {/* Basic Info */}
                    <div className="grid gap-2">
                        <Label htmlFor="edit-tanggal">Tanggal Kegiatan</Label>
                        <Input
                            id="edit-tanggal"
                            type="date"
                            value={tanggal}
                            onChange={(e) => setTanggal(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-rincian">Rincian Kegiatan</Label>
                        <Textarea
                            id="edit-rincian"
                            value={rincian}
                            onChange={(e) => setRincian(e.target.value)}
                            placeholder="Masukkan rincian kegiatan..."
                            rows={3}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-bidang">Bidang</Label>
                        <Select value={bidang} onValueChange={setBidang}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih bidang" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PJPA">PJPA</SelectItem>
                                <SelectItem value="OP">OP</SelectItem>
                                <SelectItem value="PJSA">PJSA</SelectItem>
                                <SelectItem value="PPID">PPID</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Divider */}
                    <div className="border-t pt-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Kelola File</p>
                        <div className="flex flex-col gap-5">
                            {item && (
                                <>
                                    <FileDeletionSection
                                        label="Hapus File Dokumentasi"
                                        files={item.fileDokumentasi ?? []}
                                        fileType="dokumentasi"
                                        itemId={item.id}
                                    />
                                    <FileDeletionSection
                                        label="Hapus File Desain Grafis"
                                        files={item.fileDesain ?? []}
                                        fileType="desain"
                                        itemId={item.id}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!tanggal || !rincian.trim() || !bidang || processing}
                    >
                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
