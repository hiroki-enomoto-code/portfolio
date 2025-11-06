'use client'
import React, { useEffect, useRef, useState } from 'react';

import DrawBoard from '@/components/ui/DrawBoard';


export default function Page() {
    
    return (
		<main id="" className="">
            <div 
            style={{
                position: 'fixed',
                top: 400,
                left: 400,
                width: 'fit-content',
                height: 'fit-content',
                backgroundColor: 'white',
            }}
            >
            <DrawBoard onExport={ img => {} } />
            </div>
        </main>
    )
}