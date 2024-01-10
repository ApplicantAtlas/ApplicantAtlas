import React, { useState } from 'react';
import EventAdminDashboard from '@/layouts/EventAdminDashboard';
import Dashboard from '@/components/Events/AdminDashboard/Tabs/Dashboard';
import Announcements from '@/components/Events/AdminDashboard/Tabs/Announcements';
import Applications from '@/components/Events/AdminDashboard/Tabs/Applications';
import RSVPs from '@/components/Events/AdminDashboard/Tabs/RSVPs';
import Settings from '@/components/Events/AdminDashboard/Tabs/Settings';
import EventDetails from '@/components/Events/AdminDashboard/Tabs/EventDetails';
import Pipelines from '@/components/Events/AdminDashboard/Tabs/Pipelines';
import Forms from '@/components/Events/AdminDashboard/Tabs/Forms';

const AdminDashboard: React.FC = () => {
    const [activeSection, setActiveSection] = useState('dashboard');

    return (
        <EventAdminDashboard activeSection={activeSection} setActiveSection={setActiveSection}>
            {(eventDetails) => {
                switch (activeSection) {
                    case 'dashboard':
                        return <Dashboard eventDetails={eventDetails} />
                    case 'announcements':
                        return <Announcements eventDetails={eventDetails} />
                    case 'applications':
                        return <Applications eventDetails={eventDetails} />
                    case 'rsvps':
                        return <RSVPs eventDetails={eventDetails} />
                    case 'settings':
                        return <Settings eventDetails={eventDetails} />
                    case 'event-details':
                        return <EventDetails eventDetails={eventDetails} />
                    case 'pipelines':
                        return <Pipelines eventDetails={eventDetails} />
                    case 'forms':
                        return <Forms eventDetails={eventDetails} />
                    default:
                        return <p>Page not found!</p>
                }
            }}
        </EventAdminDashboard>
    );
};

export default AdminDashboard;
