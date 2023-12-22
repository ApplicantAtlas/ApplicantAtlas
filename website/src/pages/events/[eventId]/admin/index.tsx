import React from 'react';
import EventAdminDashboard from '@/layouts/EventAdminDashboard';

const AdminDashboard: React.FC = () => {
    return (
        <EventAdminDashboard>
            {(eventDetails) => {
                return (
                    <>
                        <h1>Admin Dashboard for Event {eventDetails?.metadata.name}</h1>
                        <p>{JSON.stringify(eventDetails)}</p>
                    </>
                );
            }}
        </EventAdminDashboard>
    );
};

export default AdminDashboard;
