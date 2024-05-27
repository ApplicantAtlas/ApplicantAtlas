import React, { useMemo, useState } from 'react';
import { updateEvent } from '@/services/EventService';
import { useToast, ToastType } from '@/components/Toast/ToastContext';
import FormBuilder from '@/components/Form/FormBuilder';
import { FormField, FieldValue } from '@/types/models/Form';
import { EventModel, EventMetadata } from '@/types/models/Event';
import moment from 'moment-timezone';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface EventDetailsProps {}

const EventDetails: React.FC<EventDetailsProps> = ({ }) => {
  const eventDetails = useSelector((state: RootState) => state.event.eventDetails);
  const { showToast } = useToast();

  const handleFormSubmission = async (formData: Record<string, any>) => {
    if (eventDetails) {
      updateEvent(eventDetails.ID, { metadata: formData as EventMetadata }).then(() => {
        showToast('Event updated successfully', ToastType.Success);
      }).catch(() => {})
    }
  };

  const timezoneOptions = moment.tz.names();

  const createFormStructure = (metadata: EventMetadata): FormField[] => {
    const timezoneDefaultOptions = metadata.timezone ? [metadata.timezone] : [];

    // Note: excludes lat & lon bc this is not editable and is derived from the address on the backend.
    return [
      { key: 'name', question: 'Event Name', type: 'text', defaultValue: metadata.name },
      { key: 'address', question: 'Address', type: 'address', defaultValue: metadata.address },
      { key: 'startTime', question: 'Start Time', type: 'timestamp', defaultValue: metadata.startTime, additionalOptions: { defaultTimezone: metadata.timezone, showTimezone: true } },
      { key: 'endTime', question: 'End Time', type: 'timestamp', defaultValue: metadata.endTime, additionalOptions: { defaultTimezone: metadata.timezone, showTimezone: true } },
      { key: 'timezone', question: 'Timezone', type: 'select', options: timezoneOptions, defaultOptions: timezoneDefaultOptions },
      { key: 'visibility', question: 'Visibility', type: 'checkbox', defaultValue: metadata.visibility },
      { key: 'website', question: 'Website', type: 'text', defaultValue: metadata.website },
      { key: 'description', question: 'Description', type: 'textarea', defaultValue: metadata.description },
      { key: 'tags', question: 'Tags', type: 'custommultiselect', defaultOptions: metadata.tags },
      { key: 'socialMediaLinks', question: 'Social Media Links', type: 'custommultiselect', defaultOptions: metadata.socialMediaLinks },
      { key: "contactEmail", question: "Contact Email", type: "text", defaultValue: metadata.contactEmail },
    ];
  };

  if (!eventDetails) {
    return <div>Loading...</div>;
  }

  const formFields = useMemo(() => createFormStructure(eventDetails.metadata), [eventDetails.metadata]);

  return (
    <div className="form-control w-full max-w-2xl">
      <h1>Event Details</h1>
      <FormBuilder
        formStructure={{ attrs: formFields }}
        submissionFunction={handleFormSubmission}
        buttonText='Save Changes'
      />
    </div>
  );
};

export default EventDetails;
