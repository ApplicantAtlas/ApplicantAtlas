import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useToast, ToastType } from "@/components/Toast/ToastContext";
import LoadingOverlay from "@/components/Loading/LoadingOverlay";
import { getUser } from "@/services/UserService";
import { EventModel } from "@/types/models/Event";
import { User } from "@/types/models/User";
import { addEventAdmin, removeEventAdmin } from "@/services/EventService";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface ManageEventAdminsProps {
  onDone: () => void;
}

const ManageEventAdmins: React.FC<ManageEventAdminsProps> = ({
  onDone,
}) => {
  const eventDetails = useSelector((state: RootState) => state.event.eventDetails);
  if (eventDetails == null) {
    return <p>Event details not found in state</p>
  }

  const router = useRouter();
  const { showToast } = useToast();
  const [eventAdminsIDs, setEventAdminsIDs] = useState<string[] | undefined>(
    eventDetails?.organizerIDs
  );
  const [eventAdmins, setEventAdmins] = useState<User[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState<string>("");

  useEffect(() => {
    if (!eventAdminsIDs) {
      setEventAdmins([]);
      return;
    }

    const fetchAdmins = async () => {
      try {
        const fullEventAdmins = await Promise.all(
          eventAdminsIDs.map(async (adminID) => {
            const res = await getUser(adminID);
            return res;
          })
        );
        setEventAdmins(fullEventAdmins);
      } catch {
        showToast("Failed to load event admins", ToastType.Error);
      }
    };

    fetchAdmins();
  }, [eventAdminsIDs]);

  if (!eventAdminsIDs) {
    return <LoadingOverlay />;
  }

  const removeAdmin = (adminID: string) => {
    if (window.confirm(
      "Are you sure you want to remove admin: " + eventAdmins.find((admin) => admin.id === adminID)?.email + "?"
    )) {
    removeEventAdmin(eventDetails.ID, adminID)
      .then(() => {
        setEventAdminsIDs((prev) => prev?.filter((id) => id !== adminID))
        setEventAdmins((prev) =>
          prev ? prev.filter((admin) => admin.id !== adminID) : []
        );
        eventDetails.organizerIDs = eventDetails.organizerIDs?.filter(
          (id) => id !== adminID
        );
        showToast("Admin removed successfully", ToastType.Success);
      })
      .catch(() => {});
    }
  };

  const addAdmin = () => {
    addEventAdmin(eventDetails.ID, newAdminEmail)
      .then((r) => {
        setEventAdminsIDs((prev) =>
          prev ? [...prev, r.data.userID] : [r.data.userID]
        );
        setNewAdminEmail("");
        showToast("Admin added successfully", ToastType.Success);
      })
      .catch(() => {});
  };

  return (
    <div>
      <div className="overflow-x-auto mb-4">
        <table className="table w-full">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {eventAdmins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.firstName}</td>
                <td>{admin.lastName}</td>
                <td>{admin.email}</td>
                <td>
                  <button
                    className="btn btn-error"
                    onClick={() => removeAdmin(admin.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex mb-4">
        <input
          type="email"
          className="input input-bordered w-full max-w-xs mr-2"
          placeholder="Enter admin email"
          value={newAdminEmail}
          onChange={(e) => setNewAdminEmail(e.target.value)}
        />
        <button className="btn btn-success" onClick={addAdmin}>
          Add Admin
        </button>
      </div>
      <button className="btn btn-primary" onClick={onDone}>
        Done
      </button>
    </div>
  );
};

export default ManageEventAdmins;
