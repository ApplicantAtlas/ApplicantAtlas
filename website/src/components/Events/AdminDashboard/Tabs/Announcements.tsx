import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';

interface AnnouncementsProps {}

const Announcements: React.FC<AnnouncementsProps> = ({}) => {
  const eventDetails = useSelector(
    (state: RootState) => state.event.eventDetails,
  );

  return (
    <div>
      <h1>Announcements</h1>
      <h1>Name: {eventDetails?.metadata.name}</h1>
      <p>Description: {eventDetails?.metadata.description}</p>
    </div>
  );
};

export default Announcements;
