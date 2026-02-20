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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface VerifikasiModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (checklist: { foto: boolean; desain: boolean; caption: boolean }) => void;
}

export function VerifikasiModal({ open, onOpenChange, onSubmit }: VerifikasiModalProps) {
    const [foto, setFoto] = React.useState(false);
    const [desain, setDesain] = React.useState(false);
    const [caption, setCaption] = React.useState(false);

    const handleSubmit = () => {
        onSubmit({ foto, desain, caption });
        setFoto(false);
        setDesain(false);
        setCaption(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Verifikasi Dokumentasi</DialogTitle>
                    <DialogDescription>
                        Centang item yang sudah sesuai untuk verifikasi.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="foto"
                            checked={foto}
                            onCheckedChange={(v) => setFoto(v === true)}
                        />
                        <Label htmlFor="foto" className="text-sm font-medium">
                            Foto
                        </Label>
                    </div>
                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="desain"
                            checked={desain}
                            onCheckedChange={(v) => setDesain(v === true)}
                        />
                        <Label htmlFor="desain" className="text-sm font-medium">
                            Desain
                        </Label>
                    </div>
                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="caption"
                            checked={caption}
                            onCheckedChange={(v) => setCaption(v === true)}
                        />
                        <Label htmlFor="caption" className="text-sm font-medium">
                            Caption
                        </Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={!foto && !desain && !caption}>
                        Verifikasi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
