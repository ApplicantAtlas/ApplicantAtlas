import React from "react";

interface DashboardProps {
  eventDetails: EventModel | null;
}

const Dashboard: React.FC<DashboardProps> = ({ eventDetails }) => {
  return (
    <div>
      <h1>Dashboard</h1>
      <h1>Name: {eventDetails?.metadata.name}</h1>
      <p>{JSON.stringify(eventDetails)}</p>
    </div>
  );
};

export default Dashboard;
