import * as React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
    duration?: number; // ms, 0 = permanent until dismissed
}

interface ToastContextValue {
    toasts: Toast[];
    toast: (opts: Omit<Toast, 'id'>) => string;
    dismiss: (id: string) => void;
    success: (title: string, description?: string) => string;
    error: (title: string, description?: string) => string;
    loading: (title: string, description?: string) => string;
    update: (id: string, opts: Partial<Omit<Toast, 'id'>>) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const dismiss = React.useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = React.useCallback((opts: Omit<Toast, 'id'>): string => {
        const id = Math.random().toString(36).slice(2);
        const duration = opts.duration ?? (opts.type === 'loading' ? 0 : 4000);
        setToasts(prev => [...prev, { ...opts, id, duration }]);
        if (duration > 0) {
            setTimeout(() => dismiss(id), duration);
        }
        return id;
    }, [dismiss]);

    const update = React.useCallback((id: string, opts: Partial<Omit<Toast, 'id'>>) => {
        setToasts(prev => prev.map(t => {
            if (t.id !== id) return t;
            const updated = { ...t, ...opts };
            // If updating away from loading, auto-dismiss after 4s
            if (t.type === 'loading' && opts.type && opts.type !== 'loading') {
                const dur = opts.duration ?? 4000;
                if (dur > 0) setTimeout(() => dismiss(id), dur);
            }
            return updated;
        }));
    }, [dismiss]);

    const success = React.useCallback((title: string, description?: string) =>
        toast({ type: 'success', title, description }), [toast]);

    const error = React.useCallback((title: string, description?: string) =>
        toast({ type: 'error', title, description }), [toast]);

    const loading = React.useCallback((title: string, description?: string) =>
        toast({ type: 'loading', title, description, duration: 0 }), [toast]);

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss, success, error, loading, update }}>
            {children}
            <Toaster toasts={toasts} dismiss={dismiss} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = React.useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />,
    error: <XCircle className="size-4 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="size-4 text-amber-500 shrink-0" />,
    info: <Info className="size-4 text-blue-500 shrink-0" />,
    loading: <Loader2 className="size-4 text-blue-500 shrink-0 animate-spin" />,
};

const borders: Record<ToastType, string> = {
    success: 'border-l-emerald-500',
    error: 'border-l-rose-500',
    warning: 'border-l-amber-500',
    info: 'border-l-blue-500',
    loading: 'border-l-blue-400',
};

function ToastItem({ t, dismiss }: { t: Toast; dismiss: (id: string) => void }) {
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        // Trigger enter animation
        const raf = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div
            className={`
                flex items-start gap-3 w-full max-w-sm rounded-xl border border-l-4 bg-background/95 backdrop-blur-sm
                shadow-lg shadow-black/10 px-4 py-3 transition-all duration-300
                ${borders[t.type]}
                ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}
            `}
        >
            <div className="mt-0.5">{icons[t.type]}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight">{t.title}</p>
                {t.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{t.description}</p>
                )}
            </div>
            {t.type !== 'loading' && (
                <button
                    onClick={() => dismiss(t.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors mt-0.5 shrink-0"
                >
                    <X className="size-3.5" />
                </button>
            )}
        </div>
    );
}

function Toaster({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
    if (toasts.length === 0) return null;
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none w-full px-4">
            {toasts.map(t => (
                <div key={t.id} className="pointer-events-auto w-full flex justify-center">
                    <ToastItem t={t} dismiss={dismiss} />
                </div>
            ))}
        </div>
    );
}
