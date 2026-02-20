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

interface AddDokumentasiModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddDokumentasiModal({ open, onOpenChange }: AddDokumentasiModalProps) {
    const [tanggal, setTanggal] = React.useState('');
    const [rincian, setRincian] = React.useState('');
    const [bidang, setBidang] = React.useState('');
    const [fileDokumentasi, setFileDokumentasi] = React.useState<File[]>([]);
    const [fileDesain, setFileDesain] = React.useState<File[]>([]);
    const [processing, setProcessing] = React.useState(false);

    const handleSubmit = () => {
        setProcessing(true);
        router.post('/dokumentasi', {
            tanggal,
            rincian,
            bidang,
            file_dokumentasi: fileDokumentasi,
            file_desain: fileDesain,
        }, {
            forceFormData: true,
            onSuccess: () => {
                setProcessing(false);
                setTanggal('');
                setRincian('');
                setBidang('');
                setFileDokumentasi([]);
                setFileDesain([]);
                onOpenChange(false);
            },
            onError: () => {
                setProcessing(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Tambah Dokumentasi Kegiatan</DialogTitle>
                    <DialogDescription>
                        Isi form berikut untuk menambah dokumentasi baru.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="tanggal">Tanggal Kegiatan</Label>
                        <Input
                            id="tanggal"
                            type="date"
                            value={tanggal}
                            onChange={(e) => setTanggal(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="rincian">Rincian Kegiatan</Label>
                        <Textarea
                            id="rincian"
                            value={rincian}
                            onChange={(e) => setRincian(e.target.value)}
                            placeholder="Masukkan rincian kegiatan..."
                            rows={3}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="bidang">Bidang</Label>
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

                    <div className="grid gap-2">
                        <Label htmlFor="file-dok">File Dokumentasi (Bisa pilih banyak)</Label>
                        <Input
                            id="file-dok"
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={(e) => setFileDokumentasi(e.target.files ? Array.from(e.target.files) : [])}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="file-desain">File Desain Grafis (Bisa pilih banyak)</Label>
                        <Input
                            id="file-desain"
                            type="file"
                            multiple
                            accept="image/*,.pdf,.psd,.ai,.svg"
                            onChange={(e) => setFileDesain(e.target.files ? Array.from(e.target.files) : [])}
                        />
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
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
