// layouts/EventAdminDashboard.tsx
import React from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/Events/AdminDashboard/Sidebar";
import Footer from "@/components/Footer";
import { EventProvider, useEventContext } from "@/contexts/EventContext";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import Header from "@/components/Header";

const EventAdminDashboard: React.FC<{
  children: (eventDetails: any) => React.ReactNode;
  activeSection: string;
  setActiveSection: (section: string) => void;
}> = ({ children, activeSection, setActiveSection }) => {
  const router = useRouter();
  const eventId = router.query.eventId as string;

  const menuItems = [{ label: "My Events", href: "/user/dashboard" }];

  return (
    <>
      <Header menuItems={menuItems} showUserProfile={true} />
      <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
        <EventProvider eventId={eventId}>
          <ContentWithLoading
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          >
            {children}
          </ContentWithLoading>
        </EventProvider>
      </div>
    </>
  );
};

const ContentWithLoading: React.FC<{
  children: (eventDetails: any) => React.ReactNode;
  activeSection: string;
  setActiveSection: (section: string) => void;
}> = ({ children, activeSection, setActiveSection }) => {
  const { eventDetails, isLoading } = useEventContext();

  // TODO: we can probably cache with TanQuery in the provider or layout here.
  // So that each tab we click doesn't have to re-fetch the event details.
  return (
    <>
      <div className="flex flex-1 min-h-screen">
        <Sidebar
          eventDetails={eventDetails}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <main className="w-full flex-grow p-4">
          {isLoading ? <LoadingSpinner /> : children(eventDetails)}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default EventAdminDashboard;
