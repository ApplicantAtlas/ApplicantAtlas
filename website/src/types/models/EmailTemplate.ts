export type EmailTemplate = {
    id?: string;
    eventID: string;
    dataFromFormID?: string;
    name: string;
    body: string;
    subject: string;
    cc: string[];
    bcc: string[];
    replyTo: string;
    from: string;
    lastUpdated: string;
    description: string;
}