import React, { useCallback, useEffect, useMemo } from 'react';
import moment from 'moment-timezone';
import { useDispatch, useSelector } from 'react-redux';

import { getEvent, updateEvent } from '@/services/EventService';
import { useToast, ToastType } from '@/components/Toast/ToastContext';
import FormBuilder from '@/components/Form/FormBuilder';
import { FormField } from '@/types/models/Form';
import { EventMetadata } from '@/types/models/Event';
import { RootState } from '@/store';
import { setEventDetails, updateEventDetails } from '@/store/slices/eventSlice';

interface EventDetailsProps {}

const EventDetails: React.FC<EventDetailsProps> = ({}) => {
  const dispatch = useDispatch();
  const eventDetails = useSelector(
    (state: RootState) => state.event.eventDetails,
  );
  const { showToast } = useToast();

  useEffect(() => {
    if (!eventDetails) {
      return;
    }
    getEvent(eventDetails?.ID).then((r) => {
      if (
        eventDetails.ID === r.data.event.ID &&
        eventDetails.metadata.lastUpdatedAt ===
          r.data.event.metadata.lastUpdatedAt
      ) {
        return;
      }
      dispatch(setEventDetails(r.data.event));
    });
  }, [eventDetails, dispatch]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a generic form submission handler
  const handleFormSubmission = async (formData: Record<string, any>) => {
    if (eventDetails) {
      const eventMetadata = formData as EventMetadata;
      eventMetadata.lastUpdatedAt = eventDetails.metadata.lastUpdatedAt;
      eventMetadata.startTime = moment(eventMetadata.startTime).toISOString();
      eventMetadata.endTime = moment(eventMetadata.endTime).toISOString();
      updateEvent(eventDetails.ID, { metadata: eventMetadata })
        .then((r) => {
          eventMetadata.lastUpdatedAt = r.data.lastUpdatedAt;
          dispatch(
            updateEventDetails({ ...eventDetails, metadata: eventMetadata }),
          );
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
