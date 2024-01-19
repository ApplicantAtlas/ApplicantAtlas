import React, { useState } from 'react';
import EventAdminDashboard from '@/layouts/EventAdminDashboard';
import Dashboard from '@/components/Events/AdminDashboard/Tabs/Dashboard';
import Announcements from '@/components/Events/AdminDashboard/Tabs/Announcements';
import Settings from '@/components/Events/AdminDashboard/Tabs/Settings';
import EventDetails from '@/components/Events/AdminDashboard/Tabs/EventDetails';
import Pipelines from '@/components/Events/AdminDashboard/Tabs/Pipelines/Pipelines';
import Forms from '@/components/Events/AdminDashboard/Tabs/Forms/Forms';
import EmailTemplates from '@/components/Events/AdminDashboard/Tabs/EmailTemplates/EmailTemplates';

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
                    case 'settings':
                        return <Settings eventDetails={eventDetails} />
                    case 'event-details':
                        return <EventDetails eventDetails={eventDetails} />
                    case 'pipelines':
                        return <Pipelines eventDetails={eventDetails} />
                    case 'email-templates':
                        return <EmailTemplates eventDetails={eventDetails} />
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
