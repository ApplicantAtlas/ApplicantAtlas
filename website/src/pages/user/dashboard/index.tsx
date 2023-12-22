import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Landing/Header';
import withAuth from '@/middleware/WithAuth';
import { listMyEvents } from '@/services/EventService';

const Dashboard: React.FC = () => {
    const [events, setEvents] = useState<EventModel[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await listMyEvents();
                setEvents(response.data.events);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
            <Header />
            <Head>
                <title>Dashboard</title>
            </Head>
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-semibold text-gray-800 my-5">My Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <div key={event.ID} className="card card-compact bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                            <figure className="px-4 pt-4">
                                <img src="path_to_event_image.jpg" alt="Event" className="rounded-xl" /> {/* Replace with actual image path */}
                            </figure>
                            <div className="card-body">
                                <h3 className="card-title text-lg">{event.metadata.name}</h3>
                                <p className="text-sm text-gray-600">{event.metadata.description}</p>
                                <div className="card-actions justify-end mt-4">
                                    <Link href={`/events/${event.ID}/admin`}>
                                        <span className="btn btn-outline btn-primary">Edit Event</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default withAuth(Dashboard);
