import FormCreator from "@/components/Form/Creator/FormCreator";
import { EventModel } from "@/types/models/Event";
import React from "react";

interface ApplicationsProps {
  eventDetails: EventModel | null;
}

const Applications: React.FC<ApplicationsProps> = ({ eventDetails }) => {
  return (
    <div>
      <h1>Applications</h1>
      <FormCreator submissionFunction={
        (formStructure) => console.log(formStructure)
      } />
    </div>
  );
};

export default Applications;
