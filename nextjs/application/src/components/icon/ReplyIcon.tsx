import React from 'react';

const ReplyIcon: React.FC<React.HTMLAttributes<SVGElement>> = (htmlProps) => {
    return (
        <svg width="24" height="25" viewBox="0 0 24 25" stroke="currentColor" { ...htmlProps } xmlns="http://www.w3.org/2000/svg">
            <path d="M4.30001 17.4358C3.15385 15.5557 2.73673 13.3206 3.1276 11.1536C3.51847 8.98658 4.69021 7.03807 6.42104 5.67685C8.15186 4.31564 10.3217 3.63618 12.5197 3.76709C14.7178 3.898 16.7916 4.83018 18.3486 6.38721C19.9057 7.94423 20.8378 10.018 20.9688 12.2161C21.0997 14.4142 20.4202 16.584 19.059 18.3148C17.6978 20.0456 15.7493 21.2174 13.5823 21.6082C11.4153 21.9991 9.18016 21.582 7.30001 20.4358L3.00001 21.7358L4.30001 17.4358Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
    )
};

export default ReplyIcon;