import React, { useState } from "react";
import { updateEvent } from "@/services/EventService";
import { useToast, ToastType } from "@/components/Toast/ToastContext";

interface EventDetailsProps {
  eventDetails: EventModel | null;
}

// TODO: We should abstract these configurable forms into separate components.
// We should be using that when users define their own forms and lets just reuse that here when we get around to it.
type FormFieldConfig = {
  name: keyof EventMetadata;
  label: string;
  description?: string;
  type: "text" | "textarea" | "number" | "bool";
};

// TODO: This doesn't have all the fields yet, I want to first
// see how we can abstract this into a reusable component.
// Will do it after implementing the form builder that we can use
// also for the event application/rsvp/etc forms.
const formFieldsConfig: FormFieldConfig[] = [
  { name: "name", label: "Event Name", type: "text" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "website", label: "Website", type: "text" },
  { name: "contactEmail", label: "Contact Email", type: "text" },
  { name: "visibility", label: "Visibility", type: "bool" },
];

interface EventDetailsProps {
  eventDetails: EventModel | null;
}

const EventDetails: React.FC<EventDetailsProps> = ({ eventDetails }) => {
  const [metadata, setMetadata] = useState<EventMetadata>(
    eventDetails?.metadata || ({} as EventMetadata)
  );
  const { showToast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setMetadata({ ...metadata, [target.name]: value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (eventDetails) {
      updateEvent(eventDetails.ID, { metadata })
        .then(() => {
          showToast("Event updated successfully", ToastType.Success);
        })
        .catch(() => {});
    }
  };

  const renderFormField = (config: FormFieldConfig) => {
    const { name, label, type } = config;
    let fieldElement = null;
    const fieldValue = metadata[name];

    switch (type) {
      case "text":
        fieldElement = (
          <input
            type="text"
            name={name}
            placeholder={label}
            className="input input-bordered w-full max-w-xs"
            value={(fieldValue as string) || ""}
            onChange={handleChange}
          />
        );
        break;
      case "textarea":
        fieldElement = (
          <textarea
            name={name}
            className="textarea textarea-bordered h-24"
            placeholder={label}
            value={(fieldValue as string) || ""}
            onChange={handleChange}
          />
        );
        break;
      case "number":
        fieldElement = (
          <input
            type="number"
            name={name}
            placeholder={label}
            className="input input-bordered w-full max-w-xs"
            value={(fieldValue as number) || ""}
            onChange={handleChange}
          />
        );
        break;
      case "bool":
        fieldElement = (
          <input
            type="checkbox"
            name={name}
            className="checkbox checkbox-primary"
            checked={!!fieldValue} // Convert fieldValue to boolean
            onChange={handleChange}
          />
        );
        break;
      // Add more cases for different types like 'date', 'boolean', etc.
    }

    return fieldElement;
  };

  return (
    <div className="form-control w-full max-w-2xl">
      <h1>Event Details</h1>
      <form onSubmit={handleUpdate}>
        {formFieldsConfig.map((fieldConfig) => (
          <div key={fieldConfig.name} className="mb-4">
            <label className="label">
              <span className="label-text">{fieldConfig.label}</span>
            </label>
            {renderFormField(fieldConfig)}
          </div>
        ))}
        <button className="btn btn-primary mt-4" type="submit">
          Update Event
        </button>
      </form>
    </div>
  );
};

export default EventDetails;
