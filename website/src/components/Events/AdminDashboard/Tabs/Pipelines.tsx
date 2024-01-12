import { EventModel } from "@/types/models/Event";
import React from "react";

interface PipelinesProps {
  eventDetails: EventModel | null;
}

const Pipelines: React.FC<PipelinesProps> = ({ eventDetails }) => {
  return (
    <div>
      <h1>Pipelines</h1>
      <h1>Name: {eventDetails?.metadata.name}</h1>
      <p>Description: {eventDetails?.metadata.description}</p>
    </div>
  );
};

export default Pipelines;
