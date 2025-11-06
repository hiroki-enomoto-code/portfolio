'use client'
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";

import ScrambledTypewriterText from "@/components/customUi/ScrambledTypewriterText";
import Cube from "@/components/templetes/Cube";
import ArrowRightLinear from '@/components/icon/ArrowRightLinear';
import LightBulbIcon from '@/components/icon/LightBulbIcon';
import MouseFollow from '@/components/ui/MouseFollow';
import Modal from '@/components/ui/Modal';
import Signin from '@/components/auth/Signin';

const displayText = `Hello.

This world is terribly boring. Because of the coronavirus pandemic, I cannot go outside. At such a time, I thought of something. It was to change the world using the "mathematics" in my head. Can I change the world using mathematics? Or is it just a delusion?

I take out paper and pencil, and sit by the window of my room. Outside, the rain continues to fall quietly. I write "E=mc²." The equivalence of energy and mass. Just as this small equation once changed the way we see the world.

I am "Albert Einstein."   It's Complete!!
`;

export default function Page() {

    const searchContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [eventStatus, setEventStatus] = useState<'pending' | 'start' | 'end' | 'endStart'>('pending');
    const [isOpenSuggest, setIsOpenSuggest] = useState<boolean>(false);
    const [isLoginModal, setIsLoginModal] = useState<boolean>(false);
    const [isRegisterModal, setIsRegisterModal] = useState<boolean>(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsOpenSuggest(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const onSubmit = e => {
        e.preventDefault();
        const value = inputRef.current!.value.trim();

        if (
            value === 'cube' ||
            value === 'CUBE'
        ){
            inputRef.current!.blur();
            setEventStatus('start');
            inputRef.current!.value = '';
            setIsOpenSuggest(false);
        }

    }

    const onCryptoAnimeEnd = () => {
        setTimeout(() => {
            setEventStatus('endStart');
        },1500);
        setTimeout(() => {
            setEventStatus('end');
        },3500);
    }
    
    return (
		<main id="app" className="app">
            <div className="app_inner">
                <img className="app_logo" src="/images/logo.svg" alt="" />
                <div className="appSearch">
                    <div ref={searchContainerRef} className="m-Search">
                        <form className="m-SearchInput" onSubmit={ onSubmit }>
                            <input ref={ inputRef } onFocus={ () => setIsOpenSuggest(true) } id="m-Search-input" type="text" placeholder="Ask me anything..." autoComplete="off" />
                            <label htmlFor="m-Search-input" className="m-SearchInput_frame"></label>
                            <button type="submit"><ArrowRightLinear/></button>
                        </form>
                        <AnimatePresence>
                            {
                                isOpenSuggest && (
                                    <motion.div
                                        className="m-SearchSuggest"
                                        variants={{
                                            hidden: { opacity: 0, scale: 1, y: 25 },
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
                                        <div className="m-SearchSuggest_inner">
                                            <div className="m-SearchSuggestItem">
                                                <div className="m-SearchSuggestItem_icon">
                                                    <LightBulbIcon className="hint-icon"/>
                                                </div>
                                                <div className="m-SearchSuggestItem_text">Please enter &quot;cube&quot;</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            }
                        </AnimatePresence>
                    </div>
                </div>
                <div className="appSignin">
                    <button onClick={ () => setIsLoginModal(true) } className="appSignin_button">ログイン</button>
                    <button onClick={ () => setIsRegisterModal(true) } className="appSignin_button">新規登録</button>
                </div>
            </div>

            <div className={`appModal${ (eventStatus === 'end' || eventStatus === 'start' || eventStatus === 'endStart') ? ' is-show' : '' }`}>
                <div className={  `appModalCrypto${ (eventStatus === 'endStart' || eventStatus === 'end') ? ' is-hide' : '' }` }>
                    <ScrambledTypewriterText
                        customText={displayText}
                        speed={10}
                        scrambleSpeed={30}
                        scrambleDuration={30}
                        pause={ eventStatus === 'start' ? false : true }
                        onComplete={onCryptoAnimeEnd}
                    />
                </div>
                <div className={`appModal_cube${ eventStatus === 'end' ? ' is-show' : '' }`}>
                    <Cube enabled={ eventStatus === 'end' ? true : false }/>
                </div>
            </div>
            { eventStatus !== 'end' && <MouseFollow/> }

            <Modal isOpen={isLoginModal} onOpen={() => setIsLoginModal(false)}>
                <Signin.Login />
            </Modal>

            <Modal isOpen={isRegisterModal} onOpen={() => setIsRegisterModal(false)}>
                <Signin.Register />
            </Modal>
        </main>
    )
}