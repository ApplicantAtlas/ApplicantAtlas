import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = ({}) => {
  const eventDetails = useSelector(
    (state: RootState) => state.event.eventDetails,
  );

  return (
    <div>
      <h1>Dashboard</h1>
      <h1>Name: {eventDetails?.metadata.name}</h1>
      <p>{JSON.stringify(eventDetails)}</p>
    </div>
  );
};

export default Dashboard;
