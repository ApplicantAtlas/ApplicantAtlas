import React from "react";

interface RSVPSProps {
  eventDetails: EventModel | null;
}

const RSVPS: React.FC<RSVPSProps> = ({ eventDetails }) => {
  return (
    <div>
      <h1>RSVPs</h1>
      <h1>Name: {eventDetails?.metadata.name}</h1>
      <p>Description: {eventDetails?.metadata.description}</p>
    </div>
  );
};

export default RSVPS;
