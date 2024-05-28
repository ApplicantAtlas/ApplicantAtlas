import React, { useState } from 'react';

import EventAdminDashboard from '@/layouts/EventAdminDashboard';
import Dashboard from '@/components/Events/AdminDashboard/Tabs/Dashboard';
import Announcements from '@/components/Events/AdminDashboard/Tabs/Announcements';
import Settings from '@/components/Events/AdminDashboard/Tabs/Settings/Settings';
import EventDetails from '@/components/Events/AdminDashboard/Tabs/EventDetails';
import Pipelines from '@/components/Events/AdminDashboard/Tabs/Pipelines/Pipelines';
import Forms from '@/components/Events/AdminDashboard/Tabs/Forms/Forms';
import EmailTemplates from '@/components/Events/AdminDashboard/Tabs/EmailTemplates/EmailTemplates';

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <EventAdminDashboard
      activeSection={activeSection}
      setActiveSection={setActiveSection}
    >
      {() => {
        switch (activeSection) {
          case 'dashboard':
            return <Dashboard />;
          case 'announcements':
            return <Announcements />;
          case 'settings':
            return <Settings />;
          case 'event-details':
            return <EventDetails />;
          case 'pipelines':
            return <Pipelines />;
          case 'email-templates':
            return <EmailTemplates />;
          case 'forms':
            return <Forms />;
          default:
            return <p>Page not found!</p>;
        }
      }}
    </EventAdminDashboard>
  );
};

export default AdminDashboard;
