import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import { getEventForms } from "@/services/EventService";
import { EventModel } from "@/types/models/Event";
import { FormStructure } from "@/types/models/Form";
import React, { useEffect, useState } from "react";

interface FormProps {
  eventDetails: EventModel | null;
}

/*
    Features
    * I want to see existing forms for this event
    * I want to be able to add a new form for this event
    * When i click on the form I want it to pop up using another nested component that
      if the form is a draft on  the edit tab, otherwise on the responses form. The editor should preview
      how the form will work with the <FormBuilder> of the content made so far and let people hit submit without any action
    * We should be able to share link to the form as well with a little icon either on the list of all forms view and a share button when you click into the form
*/
const Forms: React.FC<FormProps> = ({ eventDetails }) => {
  const [forms, setForms] = useState<FormStructure[] | undefined>();

  useEffect(() => {
    if (eventDetails !== null) {
      getEventForms(eventDetails.ID).then((f) => {
        setForms(f.data.forms)
      }).catch(() => {})
    }
  }, []);

  if (forms === undefined) {
    return (
        <>
            <p>Loading forms...</p>
            <LoadingSpinner />
        </>
    )
  }

  return (
    <div>
      <h1>Forms</h1>
      <h1>Name: {eventDetails?.metadata.name}</h1>
      <p>Description: {eventDetails?.metadata.description}</p>
      <p>data: {forms.toString()}</p>
    </div>
  );
};

export default Forms;
