import { useRouter } from 'next/router';

const EventParticipant = () => {
  const router = useRouter();
  const { eventId } = router.query;

  return (
    <div>
      <h1>Event Participant Page for Event ID: {eventId}</h1>
    </div>
  );
};

export default EventParticipant;
