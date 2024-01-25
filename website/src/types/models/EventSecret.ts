export type EventSecrets = {
    id: string;
    eventID: string;
    secrets?: EventSecret[];
}

export type EventSecret = {
    id: string;
    description: string;
    type: string;
    updatedAt: Date;

    email?: EmailSecret;
}

export type EmailSecret = {
    smtpServer: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
}