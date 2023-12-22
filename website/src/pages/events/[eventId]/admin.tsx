import { useRouter } from 'next/router';

const EventAdmin = () => {
    const router = useRouter();
    const { eventId } = router.query;

    return (
        <div>
            <h1>Event Admin Page for Event ID: {eventId}</h1>
        </div>
    );
};

export default EventAdmin;
