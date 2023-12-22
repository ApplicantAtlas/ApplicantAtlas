import React from "react";

interface ApplicationsProps {
  eventDetails: EventModel | null;
}

const Applications: React.FC<ApplicationsProps> = ({ eventDetails }) => {
  return (
    <div>
      <h1>Applications</h1>
      <h1>Name: {eventDetails?.metadata.name}</h1>
      <p>Description: {eventDetails?.metadata.description}</p>
    </div>
  );
};

export default Applications;
