export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthday: string;
  password?: string;
  alternativeEmails?: string[];
};
