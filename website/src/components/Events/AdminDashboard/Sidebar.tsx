import { AppDispatch } from '@/store';
import { resetEventState } from '@/store/slices/eventSlice';
import { resetFormState } from '@/store/slices/formSlice';
import { resetPipelineState } from '@/store/slices/pipelineSlice';
import { EventModel } from '@/types/models/Event';
import React, { memo } from 'react';
import { useDispatch } from 'react-redux';

interface SidebarProps {
    eventDetails?: EventModel | null;
    activeSection: string;
    setActiveSection: (section: string) => void;
}

interface SidebarLink {
    title: string;
    sectionName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ eventDetails, activeSection, setActiveSection }) => {
    const dispatch: AppDispatch = useDispatch();

    const links: SidebarLink[] = [
        { title: 'Dashboard', sectionName: 'dashboard' },
        { title: 'Forms', sectionName: 'forms' },
        { title: 'Event Details', sectionName: 'event-details'},
        { title: 'Announcements', sectionName: 'announcements' },
        { title: 'Pipelines', sectionName: 'pipelines'},
        { title: 'Email Templates', sectionName: 'email-templates'},
        { title: 'Settings', sectionName: 'settings' },
    ];

    const handleLinkClick = (sectionName: string) => {
        // reset any of the tabs held state for tabs
        dispatch(resetEventState());
        dispatch(resetFormState());
        dispatch(resetPipelineState());


        setActiveSection(sectionName);
    };

    return (
        <div className="sidebar bg-base-200 text-base-content">
            <div className="flex flex-col w-64 h-full p-4 overflow-y-auto">
                <h2 className="text-lg font-bold">{eventDetails?.metadata.name}</h2>
                <ul className="menu menu-compact flex flex-col p-0">
                    {links.map(link => (
                        <li key={link.sectionName} className={`${activeSection === link.sectionName ? 'bg-primary text-primary-content rounded transition-colors duration-300' : ''}`}>
                                <span onClick={() => handleLinkClick(link.sectionName)}>{link.title}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default memo(Sidebar);
