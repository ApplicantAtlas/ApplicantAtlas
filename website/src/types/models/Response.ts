export type FormResponse = {
  id: string;
  formID: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic form response data
  data: Record<string, any>;
  createdAt: Date;
  userID?: string;

  lastUpdatedAt?: string;
};
