import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Header from '@/components/Header';
import withAuth from '@/middleware/WithAuth';
import { listMyEvents, createEvent } from '@/services/EventService';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import { ToastType, useToast } from '@/components/Toast/ToastContext';
import { EventModel } from '@/types/models/Event';
import Footer from '@/components/Footer';
import Metadata from '@/components/Metadata';

const Dashboard: React.FC = () => {
  const [events, setEvents] = useState<EventModel[]>([]);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await listMyEvents();
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    createEvent({ name: newEventName })
      .then((r) => {
        showToast(
          'Event created successfully, redirecting to admin page',
          ToastType.Success,
        );
        router.push(`/events/${r.data.id}/admin`);
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <Metadata title="Dashboard | ApplicantAtlas" />
      <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
        <Header
          menuItems={[{ label: 'My Events', href: '/user/dashboard' }]}
          showUserProfile={true}
        />
        <div className="container mx-auto px-4 py-8">
          {isLoading && <LoadingSpinner />}

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">My Events</h2>
            {!showAddEventForm ? (
              <button
                className="btn btn-circle btn-outline btn-primary"
                onClick={() => setShowAddEventForm(true)}
              >
                <span className="text-2xl">+</span>
              </button>
            ) : (
              <form onSubmit={handleCreateEvent} className="form-control">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Event Name"
                    className="input input-bordered"
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary">
                    Add
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-error"
                    onClick={() => setShowAddEventForm(false)}
                  >
                    X
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Event Cards */}
            {events.map((event) => (
              <div
                key={event.ID}
                className="card card-compact bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="card-body">
                  <h3 className="card-title text-lg">{event.metadata.name}</h3>
                  <p className="text-sm text-gray-600">
                    {event.metadata.description}
                  </p>

                  <div className="card-actions justify-end mt-4">
                    <Link href={`/events/${event.ID}/admin`}>
                      <span className="btn btn-outline btn-primary">
                        Edit Event
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default withAuth(Dashboard);
