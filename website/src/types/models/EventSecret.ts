export interface EventSecrets {
  eventID: string;
  email?: EmailSecret;
}

export interface EmailSecret {
  smtpServer?: string;
  port?: number;
  username?: string;
  password?: string;
  updatedAt?: string;
}
