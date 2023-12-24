import React, { useMemo, useState } from 'react';
import { updateEvent } from '@/services/EventService';
import { useToast, ToastType } from '@/components/Toast/ToastContext';
import FormBuilder from '@/components/FormBuilder/FormBuilder';
import { FormField, FieldValue } from '@/types/models/FormBuilder';
import { EventModel, EventMetadata } from '@/types/models/Event';

interface EventDetailsProps {
  eventDetails: EventModel | null;
}

const EventDetails: React.FC<EventDetailsProps> = ({ eventDetails }) => {
  const { showToast } = useToast();

  const handleFormSubmission = async (formData: Record<string, any>) => {
    if (eventDetails) {
      updateEvent(eventDetails.ID, { metadata: formData }).then(() => {
        showToast('Event updated successfully', ToastType.Success);
      }).catch(() => {})
    }
  };

  const createFormStructure = (metadata: EventMetadata): FormField[] => {
    return [
      { key: 'name', question: 'Event Name', type: 'text', defaultValue: metadata.name },
      { key: 'address', question: 'Address', type: 'address', defaultValue: metadata.address },
      { key: 'eventLat', question: 'Latitude', type: 'number', defaultValue: metadata.eventLat },
      { key: 'eventLon', question: 'Longitude', type: 'number', defaultValue: metadata.eventLon },
      { key: 'startTime', question: 'Start Time', type: 'timestamp', defaultValue: metadata.startTime },
      { key: 'endTime', question: 'End Time', type: 'timestamp', defaultValue: metadata.endTime },
      { key: 'timezone', question: 'Timezone', type: 'text', defaultValue: metadata.timezone },
      { key: 'visibility', question: 'Visibility', type: 'checkbox', defaultValue: metadata.visibility },
      { key: 'website', question: 'Website', type: 'text', defaultValue: metadata.website },
      { key: 'description', question: 'Description', type: 'textarea', defaultValue: metadata.description },
      { key: 'tags', question: 'Tags', type: 'custommultiselect', defaultValue: metadata.eventTags },
      { key: 'socialMediaLinks', question: 'Social Media Links', type: 'custommultiselect', defaultValue: metadata.socialMediaLinks },
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
