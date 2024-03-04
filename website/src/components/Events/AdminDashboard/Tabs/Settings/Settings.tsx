import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useToast, ToastType } from "@/components/Toast/ToastContext";
import { deleteEvent, getEventSecrets } from "@/services/EventService";
import EventSecretsSettings from "./EventSecretsSettings";
import { EventModel } from "@/types/models/Event";
import { EventSecrets } from "@/types/models/EventSecret";
import { IsObjectIDNotNull } from "@/utils/conversions";

interface SettingsProps {
  eventDetails: EventModel | null;
}

const Settings: React.FC<SettingsProps> = ({ eventDetails }) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [editingSecret, setEditingSecret] = useState(false);
  const [eventSecrets, setEventSecrets] = useState<EventSecrets | undefined>();
  const { showToast } = useToast();
  const router = useRouter();

  const updateEventSecrets = () => {
    if (!eventDetails) return;

    getEventSecrets(eventDetails.ID)
      .then((res) => {
        if (!IsObjectIDNotNull(res.data.eventSecrets.eventID)) {
          // This means that the event secrets do not exist yet
          setEventSecrets({
            eventID: eventDetails.ID,
            email: {},
          });
          return;
        }
        setEventSecrets(res.data.eventSecrets);
      })
      .catch(() => showToast("Failed to load event secrets", ToastType.Error));
  };

  useEffect(() => {
    if (!eventDetails) return;

    updateEventSecrets();
  }, [eventDetails]);

  const handleEditSecretClick = () => {
    setEditingSecret(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    setShowDeleteConfirmation(false);
    deleteEvent(eventId)
      .then(() => {
        showToast("Event deleted successfully", ToastType.Success);
        router.push("/user/dashboard");
      })
      .catch(() => showToast("Failed to delete event", ToastType.Error));
  };

  if (!eventDetails) return <p>Loading...</p>;

  return (
    <>
      <h1>Admin Settings for Event {eventDetails?.metadata.name}</h1>

      {!editingSecret && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Event Secrets</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              {/* Table Head */}
              <thead>
                <tr>
                  <th>Secret Type</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>SMTP Email Server</td>
                  <td>
                    {eventSecrets?.email?.updatedAt
                      ? new Date(eventSecrets.email.updatedAt).toLocaleString()
                      : "Not Set"}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={handleEditSecretClick}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingSecret && (
        <>
          <p className="mt-2">Update SMTP Settings</p>
          <EventSecretsSettings
            eventDetails={eventDetails}
            onDone={() => {
              setEditingSecret(false);
              // force a refresh of the event secrets
              updateEventSecrets();
            }}
          />
        </>
      )}

      <h2 className="mt-4">Danger!</h2>

      <button
        className="btn btn-outline btn-error"
        onClick={() => setShowDeleteConfirmation(true)}
      >
        Delete Event
      </button>

      {showDeleteConfirmation && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Are you sure you want to delete this event? <br />
              Name: {eventDetails?.metadata.name}
            </h3>
            <div className="modal-action">
              <button
                className="btn btn-error"
                onClick={() => handleDeleteEvent(eventDetails?.ID as string)}
              >
                Delete
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
