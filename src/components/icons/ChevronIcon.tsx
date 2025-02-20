const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
    <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
    >
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

export default ChevronIcon;