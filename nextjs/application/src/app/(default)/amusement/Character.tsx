'use client'
import React, { FC, useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';

import { CharacterType, ChatType } from '@/app/(default)/amusement/[id]/page';

type Props = {
    user: CharacterType;
    chats: ChatType[];
    isReflection?: boolean;
    gesture: string;
}

const Character: FC<Props> = memo(({ user, chats, gesture: _gesture }) => {

    const [gesture, setGesture] = useState<string>(_gesture);

    useEffect(() => {
        if (gesture) return;
        setGesture(_gesture);
        setTimeout(() => {
            setGesture('');
        }, 6000);
    }, [_gesture]);

    return (
        <div
            className="character is-yours"
            style={{ transform: `translate(${user.x}vw, ${user.y}vh)` }}
        >
            <div className="characterProfile">
                {
                    gesture && (
                        <div className="characterProfileEmotion">
                            <div className="">{gesture}</div>
                        </div>
                    )
                }
                <div className="characterProfile_image">
                    <img className={user.reflection ? 'is-reflection' : ''} src={`/images/amusement/character_${user.character}.png`} alt="" />
                </div>
                <div className="characterProfile_name">
                    <p>{user.name}</p>
                </div>
            </div>
            <div className="characterMessageList">
                {
                    chats.map(chat => (
                        <motion.div
                            key={chat.data.time}
                            variants={{
                                hidden: { opacity: 0, scale: 0.7, y: 40 },
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
                            <React.Fragment key={chat.data.time}>
                                {chat.type === 'image' && (
                                    <div style={{ '--ty': `-${user.y + 30}vh` } as any} key={chat.data.time} className="characterMessageListItem">
                                        <img src={chat.data.image} alt="" />
                                    </div>
                                )}
                                {chat.type === 'text' && (
                                    <div style={{ '--ty': `-${user.y + 30}vh` } as any} key={chat.data.time} className="characterMessageListItem">
                                        <p>{chat.data.text}</p>
                                    </div>
                                )}
                            </React.Fragment>
                        </motion.div>
                    ))
                }
            </div>
        </div>
    );
});

export default Character;