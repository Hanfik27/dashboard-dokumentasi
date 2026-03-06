// resources/js/components/verification-badge.tsx
import { Badge } from '@/components/ui/badge';
import { Eye, XCircle } from 'lucide-react';
import type { DokumentasiItem } from '@/types/dokumentasi';

interface VerificationBadgeProps {
    item: DokumentasiItem;
    onShowCatatan: (item: DokumentasiItem) => void;
}

function VerifiedBadge({ label }: { label: string }) {
    return (
        <Badge
            variant="outline"
            className="bg-transparent text-emerald-500 border-emerald-500 dark:text-emerald-400 dark:border-emerald-400 text-[10px] px-2 py-0.5 font-semibold"
        >
            {label}
        </Badge>
    );
}

function UnverifiedBadge({ label }: { label: string }) {
    return (
        <Badge
            variant="secondary"
            className="text-muted-foreground bg-muted/50 border-border text-[10px] px-1.5 font-medium"
        >
            {label}
        </Badge>
    );
}

function RevisiBadge({
    label,
    onShowCatatan,
    item,
}: {
    label: string;
    onShowCatatan: (item: DokumentasiItem) => void;
    item: DokumentasiItem;
}) {
    return (
        <div className="flex items-center gap-1">
            <Badge
                onClick={() => onShowCatatan(item)}
                variant="outline"
                className="text-rose-500 bg-transparent border-rose-500 dark:text-rose-400 dark:border-rose-400 text-[10px] px-2 py-0.5 font-semibold gap-1"
            >
                <Eye className="size-3" /> {label} Revisi
            </Badge>
        </div>
    );
}

export function VerificationBadge({ item, onShowCatatan }: VerificationBadgeProps) {
    // Buat lookup set kategori yang sedang revisi
    const revisiSet = new Set((item.revisiItems ?? []).map((r) => r.kategori));

    // Render per baris: jika kategori ada di revisiSet → badge revisi, else → badge verifikasi
    const fotoRow = revisiSet.has('foto')
        ? <RevisiBadge label="Foto" onShowCatatan={onShowCatatan} item={item} />
        : item.verifikasiFoto
            ? <VerifiedBadge label="Foto Diverifikasi" />
            : <UnverifiedBadge label="Foto Belum Diverifikasi" />;

    const desainRow = revisiSet.has('desain')
        ? <RevisiBadge label="Desain" onShowCatatan={onShowCatatan} item={item} />
        : item.verifikasiDesain
            ? <VerifiedBadge label="Desain Diverifikasi" />
            : <UnverifiedBadge label="Desain Belum Diverifikasi" />;

    const captionRow = revisiSet.has('caption')
        ? <RevisiBadge label="Caption" onShowCatatan={onShowCatatan} item={item} />
        : item.verifikasiCaption
            ? <VerifiedBadge label="Caption Diverifikasi" />
            : <UnverifiedBadge label="Caption Belum Diverifikasi" />;

    return (
        <div className="flex flex-col gap-1">
            {fotoRow}
            {desainRow}
            {captionRow}
        </div>
    );
}
