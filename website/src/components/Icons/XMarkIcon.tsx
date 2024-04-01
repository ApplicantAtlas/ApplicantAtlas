interface XMarkIconProps {
  className?: string;
  onClick?: () => void;
}

// From heroicons.com
const XMarkIcon = ({ className = "w-6 h-6", onClick }: XMarkIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      onClick={onClick}
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  );
};

export default XMarkIcon;
