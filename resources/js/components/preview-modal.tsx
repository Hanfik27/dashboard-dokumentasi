import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
    Download, 
    Eye, 
    FileArchive, 
    FileImage, 
    FileText, 
    Image, 
    Palette, 
    FileCode, 
    FileSpreadsheet, 
    FileVideo, 
    FileAudio,
    FileBox,
    File as FileIcon,
    LucideIcon
} from 'lucide-react';

import { FileInfo } from './dokumentasi-table';

interface PreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fileDokumentasi: FileInfo[];
    fileDesain: FileInfo[];
    uploader?: string | null;
    itemId?: number;
}


export function PreviewModal({
    open,
    onOpenChange,
    fileDokumentasi,
    fileDesain,
    uploader,
    itemId,
}: PreviewModalProps) {
    const [activeTab, setActiveTab] = React.useState<'dokumentasi' | 'desain'>('dokumentasi');
    const [currentIndex, setCurrentIndex] = React.useState(0);

    const activeFiles = activeTab === 'dokumentasi' ? fileDokumentasi : fileDesain;
    const activeFile = activeFiles[currentIndex] || null;

    // Reset index when tab changes
    React.useEffect(() => {
        setCurrentIndex(0);
    }, [activeTab]);

    const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
    const isPdf = (name: string) => /\.pdf$/i.test(name);

    const getFileIcon = (name: string): LucideIcon => {
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

    const handleDownloadSingle = (file: FileInfo) => {
        // Direct download using our backend route to force "download" instead of "preview"
        window.location.href = `/dokumentasi/download-file?path=${encodeURIComponent(file.path)}&name=${encodeURIComponent(file.name)}`;
    };

    const handleDownloadAllSelected = () => {
        if (!itemId) return;
        window.location.href = `/dokumentasi/${itemId}/download-zip/${activeTab}`;
    };

    const renderPreview = (file: FileInfo) => {
        if (isImage(file.name)) {
            return (
                <div className="flex items-center justify-center rounded-lg bg-black/5 p-4 dark:bg-white/5">
                    <img
                        src={file.url}
                        alt={file.name}
                        className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-lg translate-z-0"
                    />
                </div>
            );
        }
        if (isPdf(file.name)) {
            return (
                <iframe
                    src={file.url}
                    title={file.name}
                    className="h-[65vh] w-full rounded-lg border shadow-inner"
                />
            );
        }
        const Icon = getFileIcon(file.name);

        return (
            <div className="flex flex-col items-center justify-center gap-5 rounded-xl border border-dashed border-sidebar-border/70 py-24 dark:border-sidebar-border bg-muted/20 shadow-inner max-w-2xl mx-auto w-full">
                <div className="p-5 rounded-2xl bg-muted/50 text-muted-foreground shadow-sm">
                    <Icon className="size-16" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-foreground text-lg font-bold tracking-tight px-4 break-all">{file.name}</p>
                    <p className="text-muted-foreground text-[11px] uppercase font-bold tracking-widest opacity-60">Pratinjau tidak tersedia untuk jenis file ini</p>
                </div>
                <Button variant="default" size="lg" onClick={() => handleDownloadSingle(file)} className="mt-4 h-11 px-8 gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                    <Download className="size-4" /> Unduh untuk Melihat
                </Button>
            </div>
        );
    };

    const hasNoFiles = fileDokumentasi.length === 0 && fileDesain.length === 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-6xl p-0 overflow-hidden border-none bg-background shadow-2xl">
                <div className="flex flex-col h-[85vh]">
                    <div className="p-6 border-b bg-card flex items-center justify-between">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-xl font-bold tracking-tight">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                    <Eye className="size-5" />
                                </div>
                                <span>Preview File</span>
                            </DialogTitle>
                        </DialogHeader>
                        {uploader && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-muted/40 text-xs shadow-sm max-w-[220px]">
                                <span className="text-muted-foreground whitespace-nowrap">
                                    Uploaded by
                                </span>
                                <span className="font-semibold text-foreground truncate">
                                    {uploader}
                                </span>
                            </div>
                        )}
                    </div>

                    {hasNoFiles ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-muted/10">
                            <div className="flex size-20 items-center justify-center rounded-full bg-muted shadow-inner">
                                <FileText className="text-muted-foreground/40 size-10" />
                            </div>
                            <div className="text-center">
                                <p className="text-foreground text-base font-bold">Tidak ada file ditemukan</p>
                                <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
                                    Unggah file dokumentasi atau desain grafis terlebih dahulu untuk melihat preview.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex overflow-hidden">
                            {/* Primary Sidebar for File Selection if multi-file */}
                            <div className="w-64 border-r bg-muted/30 overflow-y-auto hidden md:block">
                                <div className="p-4 flex flex-col gap-4">
                                    <div className="flex p-1 rounded-xl bg-muted shadow-inner border border-sidebar-border/50">
                                        <button
                                            onClick={() => setActiveTab('dokumentasi')}
                                            className={`flex-1 flex flex-col items-center gap-1 rounded-lg py-3 transition-all ${
                                                activeTab === 'dokumentasi'
                                                    ? 'bg-background text-blue-600 shadow-sm border border-sidebar-border/30'
                                                    : 'text-muted-foreground hover:bg-background/50'
                                            }`}
                                        >
                                            <Image className="size-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Dokumen</span>
                                            <span className="text-[10px] opacity-70">({fileDokumentasi.length})</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('desain')}
                                            className={`flex-1 flex flex-col items-center gap-1 rounded-lg py-3 transition-all ${
                                                activeTab === 'desain'
                                                    ? 'bg-background text-emerald-600 shadow-sm border border-sidebar-border/30'
                                                    : 'text-muted-foreground hover:bg-background/50'
                                            }`}
                                        >
                                            <Palette className="size-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Desain</span>
                                            <span className="text-[10px] opacity-70">({fileDesain.length})</span>
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Daftar File</p>
                                        {activeFiles.length === 0 ? (
                                            <p className="text-xs text-muted-foreground italic px-1 py-4">Kosong</p>
                                        ) : (
                                            activeFiles.map((file, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentIndex(idx)}
                                                    className={`group w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all border ${
                                                        currentIndex === idx
                                                            ? 'bg-background border-sidebar-border shadow-sm ring-1 ring-blue-500/20'
                                                            : 'border-transparent hover:bg-background/40 hover:border-sidebar-border/50'
                                                    }`}
                                                >
                                                    <div className={`p-1.5 rounded-md transition-colors ${
                                                        currentIndex === idx ? 'bg-blue-500 text-white shadow-sm' : 'bg-muted group-hover:bg-muted-foreground/10'
                                                    }`}>
                                                        {React.createElement(getFileIcon(file.name), { 
                                                            className: `size-3.5 ${currentIndex === idx ? 'opacity-100' : 'opacity-70'}`
                                                        })}
                                                    </div>
                                                    <span className={`text-[11px] font-medium truncate ${
                                                        currentIndex === idx ? 'text-foreground' : 'text-muted-foreground'
                                                    }`}>
                                                        {file.name}
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Main Preview Area */}
                            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950/20 min-w-0">
                                <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col">
                                    {activeFile ? (
                                        <>
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 border text-[11px] font-bold text-muted-foreground shadow-sm">
                                                    File {currentIndex + 1} of {activeFiles.length}
                                                </div>
                                                <div className="text-sm font-bold truncate max-w-xs text-foreground/80">
                                                    {activeFile.name}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                {renderPreview(activeFile)}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center italic text-muted-foreground">
                                            Silahkan pilih kategori file...
                                        </div>
                                    )}
                                </div>

                                {/* Actions Bar */}
                                <div className="p-4 border-t bg-card h-20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {activeFiles.length > 1 && (
                                            <div className="flex gap-1.5 mr-4 border-r pr-4">
                                                <Button 
                                                    variant="outline" 
                                                    size="icon" 
                                                    className="size-8"
                                                    disabled={currentIndex === 0}
                                                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                                                >
                                                    <ChevronLeft className="size-4" />
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="icon" 
                                                    className="size-8"
                                                    disabled={currentIndex === activeFiles.length - 1}
                                                    onClick={() => setCurrentIndex(prev => Math.min(activeFiles.length - 1, prev + 1))}
                                                >
                                                    <ChevronRight className="size-4" />
                                                </Button>
                                            </div>
                                        )}
                                        {activeFile && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <FileText className="size-4" />
                                                <span className="font-medium hidden sm:inline">Stored as:</span>
                                                <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">
                                                    {activeFile.path.split('/').pop()}
                                                </code>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {activeFile && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1.5 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 font-bold"
                                                onClick={() => handleDownloadSingle(activeFile)}
                                            >
                                                <Download className="size-4" />
                                                Unduh
                                            </Button>
                                        )}
                                        {activeFiles.length > 1 && (
                                            <Button
                                                size="sm"
                                                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                                onClick={handleDownloadAllSelected}
                                            >
                                                <FileArchive className="size-4" />
                                                Unduh Semua
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

import { ChevronLeft, ChevronRight } from 'lucide-react';
