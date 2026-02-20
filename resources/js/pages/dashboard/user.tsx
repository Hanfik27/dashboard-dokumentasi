import { Head } from '@inertiajs/react';
import { CheckCircle2, Clock, FileText, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { DokumentasiTable, DokumentasiItem } from '@/components/dokumentasi-table';
import AppLayout from '@/layouts/app-layout';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard/user',
    },
];

type Props = {
    dokumentasiData: DokumentasiItem[];
};

export default function UserDashboard({ dokumentasiData }: Props) {
    const { isRefreshing } = useAutoRefresh(['dokumentasiData'], 15_000);

    const stats = [
        {
            title: 'Total Dokumentasi',
            value: dokumentasiData.length.toString(),
            icon: FileText,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-950/40',
        },
        {
            title: 'Terverifikasi',
            value: dokumentasiData.filter((d) => d.status === 'terverifikasi').length.toString(),
            icon: CheckCircle2,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-950/40',
        },
        {
            title: 'Perlu Revisi',
            value: dokumentasiData.filter((d) => d.status === 'revisi').length.toString(),
            icon: AlertCircle,
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-100 dark:bg-amber-950/40',
        },
        {
            title: 'Belum Diverifikasi',
            value: dokumentasiData.filter((d) => d.status === 'belum').length.toString(),
            icon: Clock,
            color: 'text-slate-600 dark:text-slate-400',
            bgColor: 'bg-slate-100 dark:bg-slate-800',
        },
        {
            title: 'Validasi Kepala',
            value: dokumentasiData.filter((d) => d.validasiKepala).length.toString(),
            icon: ShieldCheck,
            color: 'text-violet-600 dark:text-violet-400',
            bgColor: 'bg-violet-100 dark:bg-violet-950/40',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="w-full p-6">
            <div className="mx-auto max-w-full flex flex-col gap-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {stats.map((stat) => (
                        <div
                            key={stat.title}
                            className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm"
                        >
                            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                                <stat.icon className={`size-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-wider">
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-semibold">Tabel Dokumentasi</h2>

                        </div>
                    </div>
                    <DokumentasiTable
                        data={dokumentasiData}
                        role="user"
                    />
                </div>
            </div>
            </div>
        </AppLayout>
    );
}
