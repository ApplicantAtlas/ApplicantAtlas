// Equivalent of Go's primitive.ObjectID
type ObjectID = string;

// Event represents an event
interface EventModel {
    ID: ObjectID;
    organizerIDs?: ObjectID[];
    metadata: EventMetadata;
}

// EventMetadata represents the user-defined metadata for an event
interface EventMetadata {
    name: string;
    address?: Address;
    eventLat?: number;
    eventLon?: number;
    startTime?: Date;
    endTime?: Date;  
    timezone?: string;
    visibility?: boolean;
    website?: string;
    description?: string;
    socialMediaLinks?: string[];
    eventTags?: string[];
    contactEmail?: string;
}

// Address represents a physical address
interface Address {
    [key: string]: string | undefined;
    street?: string;
    city?: string;
    region?: string;
    zipCode?: string;
    country?: string;
}
