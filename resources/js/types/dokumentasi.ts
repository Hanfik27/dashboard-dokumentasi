// resources/js/types/dokumentasi.ts
export type FileInfo = {
    name: string;
    url: string;
    path: string;
};

export type DokumentasiItem = {
    id: number;
    tanggal: string;
    rincian: string;
    bidang: 'PJPA' | 'OP' | 'PJSA' | 'PPID';
    fileDokumentasi: FileInfo[];
    fileDesain: FileInfo[];
    verifikasiFoto: boolean;
    verifikasiDesain: boolean;
    verifikasiCaption: boolean;
    catatanRevisi: string | null;
    kategoriRevisi: string | null;
    validasiKepala: boolean;
    status: 'belum' | 'terverifikasi' | 'revisi';
    userName?: string;
};
