import { EventModel } from '@/types/models/Event';
import React from 'react';

interface AnnouncementsProps {
  eventDetails: EventModel | null;
}

const Announcements: React.FC<AnnouncementsProps> = ({ eventDetails }) => {
  return (
    <div>
        <h1>Announcements</h1>
      <h1>Name: {eventDetails?.metadata.name}</h1>
      <p>Description: {eventDetails?.metadata.description}</p>
    </div>
  );
};

export default Announcements;
