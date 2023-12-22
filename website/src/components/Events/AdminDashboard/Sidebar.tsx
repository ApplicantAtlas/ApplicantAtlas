import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/router';

interface SidebarProps {
    eventDetails?: EventModel | null;
}

interface SidebarLink {
    href: string;
    title: string;
}

const Sidebar: React.FC<SidebarProps> = ({ eventDetails }) => {
    const router = useRouter();
    let eventId = eventDetails?.ID;

    const links: SidebarLink[] = [
        { href: `/events/${eventId}/admin`, title: 'Dashboard' },
        { href: `/events/${eventId}/admin/rsvps`, title: 'RSVP' },
        { href: `/events/${eventId}/admin/applications`, title: 'Applications' },
        { href: `/events/${eventId}/admin/announcements`, title: 'Announcements' },
        { href: `/events/${eventId}/admin/settings`, title: 'Settings' },
    ];

    const isActive = (path: string) => {
        return router.asPath === path;
    };

    return (
        <div className="sidebar bg-base-200 text-base-content">
            <div className="flex flex-col w-64 h-full p-4 overflow-y-auto">
                <h2 className="text-lg font-bold">{eventDetails?.metadata.name}</h2>
                <ul className="menu menu-compact flex flex-col p-0">
                    {links.map(link => (
                        <li key={link.href} className={`${isActive(link.href) ? 'bg-primary text-primary-content rounded' : ''}`}>
                            <Link href={link.href}><span>{link.title}</span></Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
