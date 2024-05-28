import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import { getEventForms } from '@/services/EventService';
import { FormStructure } from '@/types/models/Form';
import { RootState, AppDispatch } from '@/store';
import { resetFormState } from '@/store/slices/formSlice';

import ListForms from './ListForms';
import CreateNewForm from './CreateNewForm';
import SelectForm from './SelectForm';

interface FormProps {}

const Forms: React.FC<FormProps> = ({}) => {
  const dispatch: AppDispatch = useDispatch();
  const selectedForm = useSelector(
    (state: RootState) => state.form.formDetails,
  );
  const eventDetails = useSelector(
    (state: RootState) => state.event.eventDetails,
  );

  const [forms, setForms] = useState<FormStructure[] | undefined>();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refresh, setRefresh] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- should be used in the future
  const [selectedFormAction, setSelectedFormAction] = useState<
    'responses' | 'edit'
  >('responses');

  useEffect(() => {
    if (eventDetails !== null) {
      getEventForms(eventDetails.ID)
        .then((f) => {
          setForms(f.data.forms);
          console.log(f.data.forms);
        })
        .catch(() => {});
    }
  }, [refresh, eventDetails]);

  const onNewFormCreated = () => {
    setRefresh(!refresh);
    setShowCreateForm(false);
  };

  const onDeletedForm = () => {
    setRefresh(!refresh);
    dispatch(resetFormState());
  };

  if (eventDetails === null) {
    return <p>No event data found in state</p>;
  }

  if (forms === undefined || eventDetails === null) {
    return (
      <>
        <p>Loading...</p>
        <LoadingSpinner />
      </>
    );
  }

  if (showCreateForm) {
    return (
      <>
        <CreateNewForm onSubmit={onNewFormCreated} />
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

  if (selectedForm) {
    return (
      <>
        <SelectForm action={selectedFormAction} onDelete={onDeletedForm} />
        <button
          className="btn btn-error mt-4"
          onClick={() => {
            dispatch(resetFormState());
          }}
        >
          Go Back
        </button>
      </>
    );
  }

  return (
    <>
      <button
        className="btn btn-outline btn-primary mb-4"
        onClick={() => {
          setShowCreateForm(true);
        }}
      >
        Create New Form
      </button>
      {forms.length === 0 ? (
        <p>This event has no forms yet.</p>
      ) : (
        <ListForms forms={forms} />
      )}
    </>
  );
};

export default Forms;
