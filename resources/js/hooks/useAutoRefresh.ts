import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

/**
 * Hook untuk auto-refresh data Inertia secara berkala.
 * Menggunakan partial reload sehingga hanya prop yang disebutkan di `only`
 * yang diambil ulang dari server — tanpa full page load.
 *
 * @param only   Daftar prop Inertia yang akan di-refresh (misal: ['dokumentasiData'])
 * @param interval Interval dalam milidetik (default: 15000 = 15 detik)
 */
export function useAutoRefresh(only: string[], interval = 15_000) {
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const refresh = () => {
        if (document.hidden) return; // jangan poll saat tab tidak aktif

        setIsRefreshing(true);
        router.reload({
            only,
            onFinish: () => {
                setLastUpdated(new Date());
                setIsRefreshing(false);
            },
        });
    };

    useEffect(() => {
        // Mulai interval
        timerRef.current = setInterval(refresh, interval);

        // Saat tab kembali aktif, langsung refresh sekali
        const handleVisibilityChange = () => {
            if (!document.hidden) refresh();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interval]);

    return { lastUpdated, isRefreshing };
}
