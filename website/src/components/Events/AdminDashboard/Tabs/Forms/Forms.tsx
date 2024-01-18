import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import { getEventForms } from "@/services/EventService";
import { EventModel } from "@/types/models/Event";
import { FormStructure } from "@/types/models/Form";
import React, { useEffect, useState } from "react";
import ListForms from "./ListForms";
import CreateNewForm from "./CreateNewForm";
import FormCreator from "@/components/Form/Creator/FormCreator";
import SelectForm from "./SelectForm";

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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormStructure | null>(null);
  const [selectedFormAction, setSelectedFormAction] = useState<
    "responses" | "edit"
  >("responses");

  useEffect(() => {
    if (eventDetails !== null) {
      getEventForms(eventDetails.ID)
        .then((f) => {
          setForms(f.data.forms);
        })
        .catch(() => {});
    }
  }, [refresh]);

  if (forms === undefined || eventDetails === null) {
    return (
      <>
        <p>Loading...</p>
        <LoadingSpinner />
      </>
    );
  }

  // New Form Creation
  const onNewFormCreated = () => {
    setRefresh(true);
    setShowCreateForm(false);
  };

  if (showCreateForm) {
    return (
      <>
        <CreateNewForm
          eventDetails={eventDetails}
          onSubmit={onNewFormCreated}
        />
        <button
          className="btn btn-error mt-4"
          onClick={() => {
            setShowCreateForm(false);
          }}
        >
          Cancel
        </button>
      </>
    );
  }

  const onDeletedForm = () => {
    setRefresh(true);
    setSelectedForm(null);
  }

  // Edit Form
  if (selectedForm !== null) {
    return (
      <>
        <SelectForm
          form={selectedForm}
          action={selectedFormAction}
          onDelete={onDeletedForm}
        />
        <button
          className="btn btn-error mt-4"
          onClick={() => {
            setSelectedForm(null);
          }}
        >
          Go Back
        </button>
      </>
    );
  }

  // List Forms
  const NewFormButton = (
    <button
      className="btn btn-outline btn-primary mb-4"
      onClick={() => {
        setShowCreateForm(true);
      }}
    >
      Create New Form
    </button>
  );

  if (forms.length === 0) {
    return (
      <>
        <p>This event has no forms yet.</p>
        {NewFormButton}
      </>
    );
  }

  const selectForm = (form: FormStructure, action?: "responses" | "edit") => {
    if (action) {
      setSelectedFormAction(action);
    }
    setSelectedForm(form);
  };

  return (
    <>
      {NewFormButton}
      <ListForms forms={forms} selectForm={selectForm} />
    </>
  );
};

export default Forms;
