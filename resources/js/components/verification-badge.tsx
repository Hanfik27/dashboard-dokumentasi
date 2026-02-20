// resources/js/components/verification-badge.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Eye, XCircle } from 'lucide-react';
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

function DetailBadges({ item }: { item: DokumentasiItem }) {
    return (
        <div className="flex flex-col gap-1">
            {item.verifikasiFoto ? <VerifiedBadge label="Foto Diverifikasi" /> : <UnverifiedBadge label="Foto Belum Diverifikasi" />}
            {item.verifikasiDesain ? <VerifiedBadge label="Desain Diverifikasi" /> : <UnverifiedBadge label="Desain Belum Diverifikasi" />}
            {item.verifikasiCaption ? <VerifiedBadge label="Caption Diverifikasi" /> : <UnverifiedBadge label="Caption Belum Diverifikasi" />}
        </div>
    );
}

export function VerificationBadge({ item, onShowCatatan }: VerificationBadgeProps) {
    const anyVerified = item.verifikasiFoto || item.verifikasiDesain || item.verifikasiCaption;

    if (item.status === 'belum' && !anyVerified) {
        return (
            <Badge
                variant="outline"
                className="gap-1.5 py-1 px-2.5 text-[10px] font-semibold tracking-wide text-rose-500 bg-transparent border-rose-500 dark:text-rose-400 dark:border-rose-400"
            >
                <Clock className="size-3" /> BELUM DIVERIFIKASI
            </Badge>
        );
    }

    if (item.status === 'terverifikasi' || (item.status === 'belum' && anyVerified)) {
        return <DetailBadges item={item} />;
    }

    if (item.status === 'revisi') {
        const kategoriLabel: Record<string, string> = {
            foto: 'Foto',
            desain: 'Desain',
            caption: 'Caption',
        };
        const label = item.kategoriRevisi ? (kategoriLabel[item.kategoriRevisi] ?? item.kategoriRevisi) : null;

        return (
            <div className="flex flex-col gap-1.5 items-start">
                {label ? (
                    <Badge variant="outline" className="text-rose-500 bg-transparent border-rose-500 dark:text-rose-400 dark:border-rose-400 text-[10px] px-2 py-1 font-semibold gap-1">
                        <XCircle className="size-3" /> {label} Revisi
                    </Badge>
                ) : (
                    <Badge variant="outline" className="gap-1.5 py-1 px-2.5 text-[10px] font-semibold tracking-wide text-rose-500 bg-transparent border-rose-500 dark:text-rose-400 dark:border-rose-400">
                        <XCircle className="size-3" /> PERLU REVISI
                    </Badge>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] gap-1 px-1.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => onShowCatatan(item)}
                >
                    <Eye className="size-2.5" /> Lihat Alasan
                </Button>
                {item.verifikasiFoto && <VerifiedBadge label="Foto" />}
                {item.verifikasiDesain && <VerifiedBadge label="Desain" />}
                {item.verifikasiCaption && <VerifiedBadge label="Caption" />}
            </div>
        );
    }

    return (
        <Badge
            variant="outline"
            className="gap-1.5 py-1 px-2.5 text-[10px] font-semibold tracking-wide text-muted-foreground bg-transparent border-border"
        >
            <Clock className="size-3" /> MENUNGGU
        </Badge>
    );
}
