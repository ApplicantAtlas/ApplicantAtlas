import React from "react";
import ElipsesIcon from "./ElipsesIcon";
import XMarkIcon from "./XMarkIcon";
import CheckMarkIcon from "./CheckMarkIcon";
import CircularArrowIcon from "./CircularArrowIcon";

interface StatusIconProps {
    status: string;
}

const StatusIcon: React.FC<StatusIconProps> = ({ status }) => {
    switch (status) {
        case "Pending":
            return <ElipsesIcon />;
        case "Running":
            return <CircularArrowIcon className="w-6 h-6 animate-spin duration-500" />; 
        case "Failure":
            return <XMarkIcon />;
        case "Success":
            return <CheckMarkIcon />;
        default:
            return null;
    }
};

export default StatusIcon;
