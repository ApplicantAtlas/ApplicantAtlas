import { RootState } from '@/store';
import { EventModel } from '@/types/models/Event';
import React from 'react';
import { useSelector } from 'react-redux';

interface AnnouncementsProps { }

const Announcements: React.FC<AnnouncementsProps> = ({ }) => {
  const eventDetails = useSelector((state: RootState) => state.event.eventDetails);

  return (
    <div>
        <h1>Announcements</h1>
      <h1>Name: {eventDetails?.metadata.name}</h1>
      <p>Description: {eventDetails?.metadata.description}</p>
    </div>
  );
};

export default Announcements;
