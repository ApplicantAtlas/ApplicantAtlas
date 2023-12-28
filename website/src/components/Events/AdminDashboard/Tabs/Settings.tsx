import { useToast, ToastType } from "@/components/Toast/ToastContext";
import { deleteEvent } from "@/services/EventService";
import { EventModel } from "@/types/models/Event";
import { useRouter } from "next/router";
import React, { useState } from "react";

interface SettingsProps {
  eventDetails: EventModel | null;
}

const Settings: React.FC<SettingsProps> = ({ eventDetails }) => {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const { showToast } = useToast()
    const router = useRouter();

    const handleDeleteEvent = async (eventId: string) => {
        deleteEvent(eventId).then(() => {
            showToast('Event deleted successfully', ToastType.Success)
            router.push('/user/dashboard')
        }).catch(() => {})
    };

    return (
        <>
            <h1>Admin Settings for Event {eventDetails?.metadata.name}</h1>
            <button
                className="btn btn-outline btn-error"
                onClick={() => setShowDeleteConfirmation(true)}
            >
                Delete Event
            </button>

            {showDeleteConfirmation && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Are you sure you want to delete this event?<br />Name: {eventDetails?.metadata.name}</h3>
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
