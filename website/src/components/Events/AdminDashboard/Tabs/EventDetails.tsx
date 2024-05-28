import React, { useCallback, useMemo } from 'react';
import moment from 'moment-timezone';
import { useSelector } from 'react-redux';

import { updateEvent } from '@/services/EventService';
import { useToast, ToastType } from '@/components/Toast/ToastContext';
import FormBuilder from '@/components/Form/FormBuilder';
import { FormField } from '@/types/models/Form';
import { EventMetadata } from '@/types/models/Event';
import { RootState } from '@/store';

interface EventDetailsProps {}

const EventDetails: React.FC<EventDetailsProps> = ({}) => {
  const eventDetails = useSelector(
    (state: RootState) => state.event.eventDetails,
  );
  const { showToast } = useToast();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a generic form submission handler
  const handleFormSubmission = async (formData: Record<string, any>) => {
    if (eventDetails) {
      updateEvent(eventDetails.ID, { metadata: formData as EventMetadata })
        .then(() => {
          showToast('Event updated successfully', ToastType.Success);
        })
        .catch(() => {});
    }
  };

  const timezoneOptions = moment.tz.names();

  const createFormStructure = useCallback(
    (metadata: EventMetadata): FormField[] => {
      const timezoneDefaultOptions = metadata.timezone
        ? [metadata.timezone]
        : [];

      // Note: excludes lat & lon bc this is not editable and is derived from the address on the backend.
      return [
        {
          key: 'name',
          question: 'Event Name',
          type: 'text',
          defaultValue: metadata.name,
        },
        {
          key: 'address',
          question: 'Address',
          type: 'address',
          defaultValue: metadata.address,
        },
        {
          key: 'startTime',
          question: 'Start Time',
          type: 'timestamp',
          defaultValue: metadata.startTime,
          additionalOptions: {
            defaultTimezone: metadata.timezone,
            showTimezone: true,
          },
        },
        {
          key: 'endTime',
          question: 'End Time',
          type: 'timestamp',
          defaultValue: metadata.endTime,
          additionalOptions: {
            defaultTimezone: metadata.timezone,
            showTimezone: true,
          },
        },
        {
          key: 'timezone',
          question: 'Timezone',
          type: 'select',
          options: timezoneOptions,
          defaultOptions: timezoneDefaultOptions,
        },
        {
          key: 'visibility',
          question: 'Visibility',
          type: 'checkbox',
          defaultValue: metadata.visibility,
        },
        {
          key: 'website',
          question: 'Website',
          type: 'text',
          defaultValue: metadata.website,
        },
        {
          key: 'description',
          question: 'Description',
          type: 'textarea',
          defaultValue: metadata.description,
        },
        {
          key: 'tags',
          question: 'Tags',
          type: 'custommultiselect',
          defaultOptions: metadata.tags,
        },
        {
          key: 'socialMediaLinks',
          question: 'Social Media Links',
          type: 'custommultiselect',
          defaultOptions: metadata.socialMediaLinks,
        },
        {
          key: 'contactEmail',
          question: 'Contact Email',
          type: 'text',
          defaultValue: metadata.contactEmail,
        },
      ];
    },
    [timezoneOptions],
  );

  const formFields = useMemo(
    () => (eventDetails ? createFormStructure(eventDetails.metadata) : []),
    [eventDetails, createFormStructure],
  );

  if (!eventDetails) {
    return <p>No event details found in state</p>;
  }

  return (
    <div className="form-control w-full max-w-2xl">
      <h1>Event Details</h1>
      <FormBuilder
        formStructure={{ attrs: formFields }}
        submissionFunction={handleFormSubmission}
        buttonText="Save Changes"
      />
    </div>
  );
};

export default EventDetails;
