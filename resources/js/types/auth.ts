export type User = {
    id: number;
    name: string;
    username: string;
    avatar?: string;
    role: 'superadmin' | 'admin' | 'user';
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
