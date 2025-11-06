import { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactDOM from 'react-dom';

type Props = {
    isOpen: boolean;
    onOpen: (...arg : any) => void;
    children: React.ReactNode;
}
const Modal: React.FC<Props> =  memo(({ children, isOpen, onOpen }) => {

    const [isMounted, setIsMounted] = useState(false);
  
    useEffect(() => {
      setIsMounted(true);
      return () => setIsMounted(false);
    }, []);

    if (!isMounted) return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="m-Modal"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { duration: 0.2 }
                        },
                        exit: {
                            opacity: 0,
                            transition: { duration: 0.15 }
                        }
                    }}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <div onClick={ onOpen } className="m-Modal_close"></div>
                    <motion.div
                        className="m-ModalContent"
                        variants={{
                            hidden: { opacity: 0, scale: 0.5, y: 50 },
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
                                scale: 0.8,
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
                        { children }
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.querySelector('main') || document.body
    );
});

export default Modal;