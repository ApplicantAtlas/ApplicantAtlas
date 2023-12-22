import React from "react";

interface EventDetailsProps {
  eventDetails: EventModel | null;
}

const EventDetails: React.FC<EventDetailsProps> = ({ eventDetails }) => {
  return (
    <div>
      <h1>Event Details</h1>
      <h1>Name: {eventDetails?.metadata.name}</h1>
      <p>Description: {eventDetails?.metadata.description}</p>
    </div>
  );
};

export default EventDetails;
