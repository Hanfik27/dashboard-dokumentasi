// resources/js/components/verify-modal.tsx
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface VerifyModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vf: boolean;
    vd: boolean;
    vc: boolean;
    onVfChange: (v: boolean) => void;
    onVdChange: (v: boolean) => void;
    onVcChange: (v: boolean) => void;
    onSubmit: () => void;
}

export function VerifyModal({
    open,
    onOpenChange,
    vf, vd, vc,
    onVfChange, onVdChange, onVcChange,
    onSubmit,
}: VerifyModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Verifikasi Dokumentasi</DialogTitle>
                    <DialogDescription>
                        Pilih item yang telah diverifikasi untuk kegiatan ini.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="foto" checked={vf} onCheckedChange={(c) => onVfChange(!!c)} />
                        <Label htmlFor="foto" className="font-normal cursor-pointer">Foto Dokumentasi</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="desain" checked={vd} onCheckedChange={(c) => onVdChange(!!c)} />
                        <Label htmlFor="desain" className="font-normal cursor-pointer">Desain Grafis</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="caption" checked={vc} onCheckedChange={(c) => onVcChange(!!c)} />
                        <Label htmlFor="caption" className="font-normal cursor-pointer">Caption</Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                    <Button onClick={onSubmit}>Simpan Perubahan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
