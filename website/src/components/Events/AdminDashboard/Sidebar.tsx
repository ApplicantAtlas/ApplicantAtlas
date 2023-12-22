import Link from 'next/link';
import React, { memo } from 'react';

interface SidebarProps {
    eventDetails?: EventModel | null;
    activeSection: string;
    setActiveSection: (section: string) => void;
}

interface SidebarLink {
    href: string;
    title: string;
    sectionName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ eventDetails, activeSection, setActiveSection }) => {
    let eventId = eventDetails?.ID;

    const links: SidebarLink[] = [
        { href: `/events/${eventId}/admin`, title: 'Dashboard', sectionName: 'dashboard' },
        { href: `/events/${eventId}/admin/rsvps`, title: 'RSVP', sectionName: 'rsvps' },
        { href: `/events/${eventId}/admin/applications`, title: 'Applications', sectionName: 'applications' },
        { href: `/events/${eventId}/admin/announcements`, title: 'Announcements', sectionName: 'announcements' },
        { href: `/events/${eventId}/admin/settings`, title: 'Settings', sectionName: 'settings' },
    ];

    const handleLinkClick = (sectionName: string) => {
        setActiveSection(sectionName);
    };

    return (
        <div className="sidebar bg-base-200 text-base-content">
            <div className="flex flex-col w-64 h-full p-4 overflow-y-auto">
                <h2 className="text-lg font-bold">{eventDetails?.metadata.name}</h2>
                <ul className="menu menu-compact flex flex-col p-0">
                    {links.map(link => (
                        <li key={link.href} className={`${activeSection === link.sectionName ? 'bg-primary text-primary-content rounded transition-colors duration-300' : ''}`}>
                           
                                <span onClick={() => handleLinkClick(link.sectionName)}>{link.title}</span>
                            
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default memo(Sidebar);
