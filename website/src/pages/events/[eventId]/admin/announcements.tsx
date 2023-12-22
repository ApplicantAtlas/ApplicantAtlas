import React from 'react';
import EventAdminDashboard from '@/layouts/EventAdminDashboard';

const AdminDashboard: React.FC = () => {
    return (
        <EventAdminDashboard>
            {(eventDetails) => {
                return (
                    <>
                        <h1>Admin Announcements for Event {eventDetails?.metadata.name}</h1>
                    </>
                );
            }}
        </EventAdminDashboard>
    );
};

export default AdminDashboard;
