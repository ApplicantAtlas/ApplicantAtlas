import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import { useToast, ToastType } from '@/components/Toast/ToastContext';
import { deleteEvent, getEventSecrets } from '@/services/EventService';
import { EventSecrets } from '@/types/models/EventSecret';
import { IsObjectIDNotNull } from '@/utils/conversions';
import { RootState } from '@/store';

import ManageEventAdmins from './ManageEventAdmins';
import EventSecretsSettings from './EventSecretsSettings';

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = ({}) => {
  const eventDetails = useSelector(
    (state: RootState) => state.event.eventDetails,
  );

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [editingSecret, setEditingSecret] = useState(false);
  const [editingEventAdmins, setEditingEventAdmins] = useState(false);
  const [eventSecrets, setEventSecrets] = useState<EventSecrets | undefined>();
  const { showToast } = useToast();
  const router = useRouter();

  const updateEventSecrets = useCallback(() => {
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
      .catch(() => showToast('Failed to load event secrets', ToastType.Error));
  }, [eventDetails, showToast]);

  useEffect(() => {
    if (!eventDetails) return;

    updateEventSecrets();
  }, [eventDetails, updateEventSecrets]);

  const handleEditSecretClick = () => {
    setEditingSecret(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    setShowDeleteConfirmation(false);
    deleteEvent(eventId)
      .then(() => {
        showToast('Event deleted successfully', ToastType.Success);
        router.push('/user/dashboard');
      })
      .catch(() => showToast('Failed to delete event', ToastType.Error));
  };

  if (!eventDetails) return <p>Loading...</p>;

  return (
    <>
      {!editingSecret && (
        <div>
          <h2 className="mt-4">Event Secrets</h2>
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
                      : 'Not Set'}
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
            onDone={() => {
              setEditingSecret(false);
              // force a refresh of the event secrets
              updateEventSecrets();
            }}
          />
        </>
      )}

      <h2 className="mt-4">Event Admins</h2>
      {!editingEventAdmins && (
        <button
          className="btn btn-primary"
          onClick={() => setEditingEventAdmins(true)}
        >
          Manage Event Admins
        </button>
      )}

      {editingEventAdmins && (
        <ManageEventAdmins onDone={() => setEditingEventAdmins(false)} />
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
