import { useRouter } from 'next/router';

import Metadata from '@/components/Metadata';

const EventParticipant = () => {
  const router = useRouter();
  const { eventId } = router.query;

  return (
    <>
      <Metadata title={'Event ID ' + eventId + ' | ApplicantAtlas'} />
      <div>
        <h1>Event Participant Page for Event ID: {eventId}</h1>
      </div>
    </>
  );
};

export default EventParticipant;
