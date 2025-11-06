import React from 'react';

const ArrowRightLinear: React.FC<React.HTMLAttributes<SVGElement>> = (htmlProps) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" {...htmlProps} xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12H20M20 12L14 6M20 12L14 18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
};

export default ArrowRightLinear;