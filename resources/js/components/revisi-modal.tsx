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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface RevisiModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: { kategori: string; catatan: string }) => void;
}

export function RevisiModal({ open, onOpenChange, onSubmit }: RevisiModalProps) {
    const [kategori, setKategori] = React.useState('');
    const [catatan, setCatatan] = React.useState('');

    const handleSubmit = () => {
        onSubmit({ kategori, catatan });
        setKategori('');
        setCatatan('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Revisi Dokumentasi</DialogTitle>
                    <DialogDescription>
                        Pilih kategori revisi dan berikan catatan.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="kategori">Kategori Revisi</Label>
                        <Select value={kategori} onValueChange={setKategori}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="foto">Foto</SelectItem>
                                <SelectItem value="desain">Desain</SelectItem>
                                <SelectItem value="caption">Caption</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="catatan">Catatan Revisi</Label>
                        <textarea
                            id="catatan"
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            placeholder="Tulis catatan revisi di sini..."
                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                            rows={4}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!kategori || !catatan.trim()}
                        variant="destructive"
                    >
                        Kirim Revisi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
