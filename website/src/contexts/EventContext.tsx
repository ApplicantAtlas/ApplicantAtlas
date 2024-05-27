import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getEvent } from '@/services/EventService';
import { EventModel } from '@/types/models/Event';

const EventContext = createContext<{ eventDetails: EventModel | null; isLoading: boolean }>({ eventDetails: null, isLoading: true });

export const useEventContext = () => useContext(EventContext);

interface EventProviderProps {
    children: ReactNode;
    eventId: string;
}

export const EventProvider: React.FC<EventProviderProps> = ({ children, eventId }) => {
    const [eventDetails, setEventDetails] = useState<EventModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (eventId) {
            getEvent(eventId)
                .then(details => {
                    setEventDetails(details.data.event)
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching event details:', error)
                    setIsLoading(false);
                })
        }
    }, [eventId]);

    return (
        <EventContext.Provider value={{eventDetails, isLoading}}>
            {children}
        </EventContext.Provider>
    );
};
