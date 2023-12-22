import React, { useState } from 'react';
import EventAdminDashboard from '@/layouts/EventAdminDashboard';
import Dashboard from '@/components/Events/AdminDashboard/Tabs/Dashboard';
import Announcements from '@/components/Events/AdminDashboard/Tabs/Announcements';
import Applications from '@/components/Events/AdminDashboard/Tabs/Applications';
import RSVPs from '@/components/Events/AdminDashboard/Tabs/RSVPs';
import Settings from '@/components/Events/AdminDashboard/Tabs/Settings';

const AdminDashboard: React.FC = () => {
    const [activeSection, setActiveSection] = useState('dashboard');

    return (
        <EventAdminDashboard activeSection={activeSection} setActiveSection={setActiveSection}>
            {(eventDetails) => {
                return (
                    <>
                        {activeSection === 'dashboard' && <Dashboard eventDetails={eventDetails} />}
                        {activeSection === 'announcements' && <Announcements eventDetails={eventDetails} />}
                        {activeSection === 'applications' && <Applications eventDetails={eventDetails} />}
                        {activeSection === 'rsvps' && <RSVPs eventDetails={eventDetails} />}
                        {activeSection === 'settings' && <Settings eventDetails={eventDetails} />}
                    </>
                );
            }}
        </EventAdminDashboard>
    );
};

export default AdminDashboard;
