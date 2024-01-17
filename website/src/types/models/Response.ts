export type FormResponse = {
    id: string;
    formID: string;
    data: Record<string, any>;
    createdAt: Date;
    userID?: string;
}