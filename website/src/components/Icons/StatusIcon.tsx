import React from 'react';

import ElipsesIcon from './ElipsesIcon';
import XMarkIcon from './XMarkIcon';
import CheckMarkIcon from './CheckMarkIcon';
import CircularArrowIcon from './CircularArrowIcon';

interface StatusIconProps {
  status: string;
  className?: string;
}

const StatusIcon: React.FC<StatusIconProps> = ({ status, className }) => {
  const defaultClassName = 'w-6 h-6';
  const iconClassName = className
    ? defaultClassName + ' ' + className
    : defaultClassName;

  switch (status) {
    case 'Pending':
      return <ElipsesIcon className={iconClassName} />;
    case 'Running':
      return (
        <CircularArrowIcon
          className={iconClassName + ' animate-spin duration-500'}
        />
      );
    case 'Failure':
      return <XMarkIcon className={iconClassName} />;
    case 'Success':
      return <CheckMarkIcon className={iconClassName} />;
    default:
      return null;
  }
};

export default StatusIcon;
