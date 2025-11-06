import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    target?: HTMLElement | null;
}
const Popup: React.FC<Props> = ({ children, isOpen, onClose, target = null }) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const [adjustedPosition, setAdjustedPosition] = useState({ x: 0, y: 0 });
    const [isMounted, setIsMounted] = useState(false);

    const adjustPosition = () => {
        if (!target || !popupRef.current) return;
        
        const targetRect = target.getBoundingClientRect();
        const popupRect = popupRef.current.getBoundingClientRect();
        const popupWidth = popupRect.width;
        const popupHeight = popupRect.height;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let adjustedX = targetRect.x;
        let adjustedY = targetRect.y;

        if (adjustedX + popupWidth > viewportWidth) {
            adjustedX = Math.max(10, viewportWidth - popupWidth - 10);
        }

        if (adjustedY + popupHeight > viewportHeight) {
            adjustedY = Math.max(10, viewportHeight - popupHeight - 10);
        }

        if (adjustedX < 10) {
            adjustedX = 10;
        }

        if (adjustedY < 10) {
            adjustedY = 10;
        }

        setAdjustedPosition({ x: adjustedX, y: adjustedY });
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            adjustPosition();
            window.addEventListener('resize', adjustPosition);
            window.addEventListener('scroll', adjustPosition);
        }
    
        return () => {
          window.removeEventListener('resize', adjustPosition);
          window.removeEventListener('scroll', adjustPosition);
        };
    }, [isOpen]);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    if (!isMounted) return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <div
                    className="m-Popup"
                    style={adjustedPosition ? { 
                        left: adjustedPosition.x,
                        top: adjustedPosition.y,
                        position: 'fixed',
                    } : {}}
                > 
                    <motion.div
                        ref={popupRef}
                        className="m-PopupBox"
                        variants={{
                            hidden: { opacity: 0, scale: 1, y: 50 },
                            visible: {
                                opacity: 1,
                                scale: 1,
                                y: 0,
                                transition: {
                                    type: 'spring',
                                    damping: 10,
                                    stiffness: 200,
                                    mass: 0.8
                                }
                            },
                            exit: {
                                opacity: 0,
                                scale: 1,
                                y: 20,
                                transition: {
                                    duration: 0.2
                                }
                            }
                        }}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default Popup;