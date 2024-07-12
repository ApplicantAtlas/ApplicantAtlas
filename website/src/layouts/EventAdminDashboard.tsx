import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import Sidebar from '@/components/Events/AdminDashboard/Sidebar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import Header from '@/components/Header';
import { AppDispatch, RootState } from '@/store';
import { getEvent } from '@/services/EventService';
import {
  setEventDetails,
  setEventStateIsLoading,
} from '@/store/slices/eventSlice';

const EventAdminDashboard: React.FC<{
  children: () => React.ReactNode;
  activeSection: string;
  setActiveSection: (section: string) => void;
}> = ({ children, activeSection, setActiveSection }) => {
  const router = useRouter();
  const eventId = router.query.eventId as string;
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (eventId) {
      dispatch(setEventStateIsLoading(true));
      getEvent(eventId)
        .then((details) => {
          dispatch(setEventDetails(details.data.event));
          dispatch(setEventStateIsLoading(false));
        })
        .catch((_) => {
          dispatch(setEventStateIsLoading(false));
        });
    }
  }, [eventId, dispatch]);

  const menuItems = [{ label: 'My Events', href: '/user/dashboard' }];

  return (
    <>
      <Header menuItems={menuItems} showUserProfile={true} />
      <div
        className="flex flex-col min-h-screen bg-gray-100 text-gray-900"
        style={{ maxWidth: '100vw' }}
      >
        <ContentWithLoading
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        >
          {children}
        </ContentWithLoading>
      </div>
    </>
  );
};

const ContentWithLoading: React.FC<{
  children: () => React.ReactNode;
  activeSection: string;
  setActiveSection: (section: string) => void;
}> = ({ children, activeSection, setActiveSection }) => {
  const isLoading = useSelector((state: RootState) => state.event.loading);
  return (
    <>
      <div className="flex flex-1 min-h-screen w-full overflow-hidden">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <main className="flex-grow w-full p-4 overflow-x-auto">
          {isLoading ? <LoadingSpinner /> : children()}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default EventAdminDashboard;
