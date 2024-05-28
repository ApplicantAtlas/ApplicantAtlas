// Equivalent of Go's primitive.ObjectID
type ObjectID = string;

// Event represents an event
export type EventModel = {
  ID: ObjectID;
  organizerIDs?: ObjectID[];
  metadata: EventMetadata;
};

// EventMetadata represents the user-defined metadata for an event
export type EventMetadata = {
  name: string;
  address?: Address;
  lat?: number;
  lon?: number;
  startTime?: Date;
  endTime?: Date;
  timezone?: string;
  visibility?: boolean;
  website?: string;
  description?: string;
  socialMediaLinks?: string[];
  tags?: string[];
  contactEmail?: string;
};

// Address represents a physical address
export type Address = {
  [key: string]: string | undefined;
  streetAddress?: string;
  city?: string;
  region?: string;
  zipCode?: string;
  country?: string;
};

// Type guard for Address
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isAddress(value: any): value is Address {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.streetAddress === 'string' &&
    typeof value.city === 'string' &&
    typeof value.zipCode === 'string'
  );
}
