'use client'
import React, { useEffect, useRef, useState, use } from 'react';
import { redirect } from 'next/navigation';
import { Socket } from "socket.io-client";
import { getSocket } from '@/lib/amuse-socket';
import axios from 'axios';

import { useData } from '@/context/DataContext';
import { EnqueteType } from '@/app/(default)/amusement/Enquete';
import { QuizProps, QuestionProps } from '@/types/quiz';
import {
    ServerToClientEvent,
    LoginToRoom,
    ClientToServerCallbackProps,
} from '@/types/socket';

import useNotification from '@/hooks/useNotification';
import Flex from '@/components/ui/Flex/Flex';
import Character from '@/app/(default)/amusement/Character';
import MyCharacter from '@/app/(default)/amusement/MyCharacter';
import LogoutIcon from '@/components/icon/LogoutIcon';
import LogIcon from '@/components/icon/LogIcon';
import SettingIcon from '@/components/icon/SettingIcon';
import Button from '@/components/ui/Button/Button';
import TextField from '@/components/ui/TextField/TextField';

const MAX_USERS = parseInt(process.env.CHAT_SOCKET_MAX_USERS || '10');

export type CharacterType = {
    id: string;
    name: string;
    x: number;
    y: number;
    reflection: boolean;
    character: number;
    gesture: string;
}

export type ChatType = {
    type: 'text';
    data: {
        time: number;
        text: string;
    }
} | {
    type: 'image';
    data: {
        time: number;
        image: string;
    }
} | {
    type: 'enquete';
    data: {
        time: number;
        enquete: EnqueteType;
    };
}

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export type QuizType = Omit<QuizProps, 'answer' | 'created_at' | 'updated_at' | 'status' | 'create_user' | 'questions'> & {
    create_user: string;
    status: 'join' | 'countdown' | 'active' | 'end';
    countdown: number;
    currentQ : QuestionProps | null;
    currentQIndex : number | null;
}

/*
TODO
- 画面OFF時のスリープ状態表示
*/

export default function Page({ params }: PageProps) {

    const { id } = use(params);
    const isFirstRender = useRef(false);
    const notificationSound = useRef<any>(null);
    const socket = useRef<Socket | null>(null);
    const myChatsRef = useRef<ChatType[]>([]);
    const yourChatsRef = useRef<{ [Key: string]: ChatType[] }>({});
    const timerRef = useRef<any>(null);
    const quizTimerRef = useRef<any>(null);
    const messageDeleteSpeedRef = useRef<number>(5000);

    const { chatSession } = useData();
    const { success } = useNotification();

    const [characters, setCharacters] = useState<CharacterType[]>([]);
    const [myCharacter, setMyCharacter] = useState<CharacterType | null>(null);
    const [myChats, setMyChats] = useState<ChatType[]>([]);
    const [yourChats, setYourChats] = useState<{ [Key: string]: ChatType[] }>({});
    const [userGesturies, setUserGesturies] = useState<{ [Key: string]: string }>({});
    const [isOpenTab, setIsOpenTab] = useState<boolean>(false);
    const [selectedTab, setSelectedTab] = useState<string>('setting');
    const [chatLog, setChatLog] = useState<(ChatType & { name: string })[]>([]);
    const [messageDeleteSpeed, setMessageDeleteSpeed] = useState<number>(5000);

    //アンケート関連
    const [enquete, setEnquete] = useState<EnqueteType | null>(null);
    const [isSelectEnquete, setIsSelectEnquete] = useState<boolean>(false);

    //クイズ関連
    const [quiz, setQuiz] = useState<QuizType | null>(null);
    const [quizJoinUsers, setQuizJoinUsers] = useState<string[]>([]);
    const quizSelectRef = useRef<number|string|null>(null);

    const onReflection = () => {
        if (!myCharacter) return;

        const updatedCharacter = {
            ...myCharacter,
            reflection: !myCharacter.reflection
        };
        setMyCharacter(updatedCharacter);
        socket.current!.emit(
            'flipUserDirection',
            { id:myCharacter!.id, reflection:!myCharacter.reflection },
            (response: ClientToServerCallbackProps) => response.status === 'error' ? console.log(response.message) : null
        );
    }

    const sendGesture = (gesture: string) => {
        socket.current!.emit(
            'performUserGesture',
            { id: myCharacter!.id, gesture },
            (response: ClientToServerCallbackProps) => response.status === 'error' ? console.log(response.message) : null
        );
    }

    const onCharacterMove = (id: string, position: { x: number, y: number }) => {
        socket.current!.emit(
            'moveUserInChatRoom',
            { id, position },
            (response: ClientToServerCallbackProps) => response.status === 'error' ? console.log(response.message) : null
        );
    }

    const onAddMessagesToChatRoom : ServerToClientEvent<{ chat: ChatType, id: string }[]> = (chats) => {
        chats.forEach(({ chat, id }) => {
            if( id === myCharacter!.id){
                setMyChats(prev => [...prev, chat]);
            }else{
                setYourChats(prev => ({
                    ...prev,
                    [id]: [...(prev[id] || []), chat]
                }));
            }
            const name = characters.find(c => c.id === id)?.name || 'Unknown';
            setChatLog([{ ...chat, name }, ...chatLog]);
        });
        if (notificationSound.current) {
            notificationSound.current.currentTime = 0;
            notificationSound.current.play().catch((error) => {
                console.error('Error playing sound:', error);
            });
        }
    };

    const sendMessage = (message: string, type: 'text' | 'image') => {
        if (!message.trim()) return;

        const newChat: ChatType = { type, data: { time: Date.now(), [`${type}`]: message } } as ChatType;

        socket.current!.emit(
            'addMessagesToChatRoom',
            [{ chat: newChat, id: myCharacter!.id }],
            (response: ClientToServerCallbackProps) => response.status === 'error' ? console.log(response.message) : null
        );
    }

    const onExit = () => {
        if (!socket.current) return;
        socket.current.emit('exitChatRoom', null, (response : ClientToServerCallbackProps) => {
            if (response.status === 'error') {
                console.log(response.message);
            }
            redirect('/amusement/');
        });
    }

    const onTabChange = (tab: string) => {
        if (isOpenTab && selectedTab === tab) {
            setIsOpenTab(false);
            return;
        }

        setIsOpenTab(true);
        setSelectedTab(tab);
    }

    const handleEnqueteSubmit = (data: Omit<EnqueteType, 'id' | 'status'>) => {

        try {
            if (enquete) throw new Error('アンケートはすでに存在します。');

            const newEnquete = {
                ...data,
                time: Date.now(),
            };

            socket.current!.emit(
                'createEnquete',
                newEnquete,
                (response: ClientToServerCallbackProps) => response.status === 'error' ? console.log(response.message) : null
            );

        } catch (error) {
            success({ message: error instanceof Error ? error.message : 'アンケートの作成に失敗しました。' });
        }
    }

    const handleSelectEnquete = (answerId: string) => {

        if (!enquete || isSelectEnquete) return;

        socket.current!.emit(
            'selectEnquete',
            answerId,
            (response: ClientToServerCallbackProps) => response.status === 'error' ? console.log(response.message) : null
        );
        setIsSelectEnquete(true);
    }

    const handleQuizSelect = (id: number) => {
        socket.current!.emit(
            'createQuiz',
            id,
            (response: ClientToServerCallbackProps) => response.status === 'error' ? console.log(response.message) : null    
        );
    }

    const handleJoinQuiz = () => {
        if (!quiz) return;

        socket.current!.emit(
            'joinQuiz',
            null,
            (response: ClientToServerCallbackProps) => response.status === 'error' ? console.log(response.message) : null
        );
    }

    const handleStartQuiz = () => {
        if (!quiz) return;

        socket.current!.emit(
            'startQuiz',
            null,
            (response: ClientToServerCallbackProps) => response.status === 'error' ? console.log(response.message) : null
        );
    };

    const handleCancelQuiz = () => {
        if (!quiz) return;

        socket.current!.emit('cancelQuiz', quiz.id, (error) => {
            if (error) {
                throw new Error(error.message || 'クイズの終了に失敗しました。');
            }
            setQuiz(null);
            setQuizJoinUsers([]);
        });
    };

    const handleSelectQuestion = (value: number | string | null) => {
        quizSelectRef.current = value;

        socket.current!.emit(
            'selectQuestion',
            value,
            (response: ClientToServerCallbackProps) => response.status === 'error' ? console.log(response.message) : null
        );
    }

    const onLoginToRoom : ServerToClientEvent<LoginToRoom> = (response) => {
        try {
            if (!response.mine || response.mine.id !== chatSession!.id) throw new Error('ユーザー情報が一致しませんでした');
            
            if (response.users.length >= MAX_USERS) {
                throw new Error('ルームに参加できません。最大人数に達しています。');
            }

            setMyCharacter(response.mine);
            setCharacters(response.users);
        } catch (error) {
            console.log(error);
            redirect('/amusement/');
        }
    };

    useEffect(() => {

        try {
            socket.current = getSocket();

            if (!socket.current) throw new Error('Socket connection failed');
            if (!chatSession) throw new Error('Chat session is not set.');

            socket.current.on('loginToRoom', onLoginToRoom);
            socket.current.emit(
                'loginToRoom',
                chatSession,
                (response: ClientToServerCallbackProps) => response.status === 'error' ? console.log(response.message) : null
            );

        } catch (error) {
            console.log(error);

            redirect('/amusement/');
        }

        return () => {
            if (socket.current) {
                //socket.current.disconnect();
            }
        }
    }, []);

    useEffect(() => {
        if (myCharacter && !isFirstRender.current && socket.current) {
            isFirstRender.current = true;

            socket.current.on('changeUsersData', (response : CharacterType[]) => setCharacters([...response]));
            socket.current.on('addMessagesToChatRoom', onAddMessagesToChatRoom);
            socket.current.on('performUserGesture', ({ id, gesture }) => setUserGesturies( prev => ({ ...prev, [id]: gesture }) ));

            // アンケート関連のイベント
            socket.current.on('createEnquete', (response) => {
                setEnquete(response);
                setIsSelectEnquete(false);
            });
            socket.current.on('selectEnquete', (response: EnqueteType) => {
                setEnquete(response);
            });
            socket.current.on('enqueteTimeUpdate', (time) => {
                if (timerRef.current) {
                    timerRef.current.textContent = Math.floor(time / 1000);
                }
            });
            socket.current.on('endEnquete', (response) => {
                if (response) {
                    setMyChats(prev => [
                        ...prev,
                        { type: 'enquete', data: { time: Date.now(), enquete: response } }
                    ]);
                    setChatLog(prev => [{ type: 'enquete', data: { time: Date.now(), enquete: response }, name: myCharacter!.name }, ...prev]);
                }
                setEnquete(null);
                setIsSelectEnquete(false);
            });

            // クイズ関連のイベント
            socket.current.on('changeQuizData', (response: QuizType) => setQuiz(response) );
            socket.current.on('joinQuiz', (response : CharacterType['id'][]) => setQuizJoinUsers(response) );
            socket.current.on('quizCountdown', (response : QuizType) => setQuiz(response) );
            socket.current.on('selectQuestion', response => {});
            socket.current.on('quizTimeUpdate', (response : { index : number, remainingMs : number }) => {
                if(quizTimerRef.current){
                    quizTimerRef.current.textContent = response.remainingMs;
                }
            });
            socket.current.on('quizEnded', (response : { users : { [Key : string] : number }, question_count : number }) => {

                let message = `【クイズ終了】\n`;

                if (response.users && Object.keys(response.users).length) {
                    Object.entries(response.users).forEach(([userId, score]) => {
                        const user = characters.find(c => c.id === userId);
                        message += `${user ? user.name : 'Unknown'}さん：${ response.question_count }問中 ${score}問正解\n`;
                    });
                } else {
                    message += `参加者がいませんでした。`;
                }

                success({
                    message,
                    duration:0
                });

                setQuiz(null);
                setQuizJoinUsers([]);
            });

            const cleanupOldChats = () => {
                const currentChats = myChatsRef.current;
                const yourChatsArray = Object.values(yourChatsRef.current);
                const now = Date.now();
                if (currentChats) {
                    const filteredChats = currentChats.filter(chat => {
                        return (now - chat.data.time) < messageDeleteSpeedRef.current;
                    });

                    if (filteredChats.length !== currentChats.length) {
                        setMyChats(filteredChats);
                    }
                }

                yourChatsArray.forEach((chats, index) => {
                    if (!chats.length) return;

                    const filteredChats = chats.filter(chat => {
                        return (now - chat.data.time) < messageDeleteSpeedRef.current;
                    });

                    if (filteredChats.length !== chats.length) {
                        setYourChats(prev => ({
                            ...prev,
                            [Object.keys(prev)[index]]: filteredChats
                        }));
                    }
                });
            };
            setInterval(cleanupOldChats, messageDeleteSpeedRef.current + 1000);

            notificationSound.current = new Audio('/sounds/notification02.mp3');
            notificationSound.current.volume = 1;
        }
    }, [myCharacter]);

    useEffect(() => {
        myChatsRef.current = myChats;
    }, [myChats]);

    useEffect(() => {
        yourChatsRef.current = yourChats;
    }, [yourChats]);

    useEffect(() => {
        messageDeleteSpeedRef.current = messageDeleteSpeed;
    }, [messageDeleteSpeed]);

    if (!myCharacter) return null;

    return (
        <main style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <div className={`sideBar${isOpenTab ? ' is-open' : ''}`}>
                <div className="sideBarTab">
                    <button onClick={() => onTabChange('log')} type="button" className={`sideBarTab_item${selectedTab === 'log' ? ' is-active' : ''}`}><LogIcon /></button>
                    <button onClick={() => onTabChange('setting')} type="button" className={`sideBarTab_item${selectedTab === 'setting' ? ' is-active' : ''}`}><SettingIcon /></button>
                </div>
                <div className="sideBarBody">
                    {
                        selectedTab === 'log' && (
                            <div className="chatLog">
                                {
                                    chatLog.map((chat, index) => (
                                        <div key={index} className="chatLogItem">
                                            <div className="chatLogItem_name">『{chat.name}』</div>
                                            {/* <span className="chatLogItem_time">{chat.time}</span> */}
                                            <div className="chatLogItem_message">
                                                {chat.type === 'image' && <img src={chat.data.image} alt="" />}
                                                {chat.type === 'text' && <p>{chat.data.text}</p>}
                                                {
                                                    chat.type === 'enquete' && (
                                                        <div className="characterMessageListEnquete is-end">
                                                            <div className="characterMessageListEnquete_endButton">終了</div>
                                                            <div className="characterMessageListEnquete_title">{characters.find(u => u.id === chat.data.enquete.id)?.name || 'Unknown'}さんからのアンケート</div>
                                                            <p className="characterMessageListEnquete_detail">{chat.data.enquete.detail}</p>
                                                            <ul className="characterMessageListEnqueteAnswers">
                                                                {
                                                                    chat.data.enquete.answers.map(answer => (
                                                                        <div style={{ '--w': `${(chat.data.enquete.answers.reduce((acc, answer) => acc + answer.count, 0) / answer.count) * 100}%` } as any} className="characterMessageListEnqueteAnswers_select" key={answer.id}>
                                                                            <span className="is-a">{answer.value}</span>
                                                                            {isSelectEnquete && <span className="is-count">({answer.count}票)</span>}
                                                                        </div>
                                                                    ))
                                                                }
                                                            </ul>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        )
                    }

                    {
                        selectedTab === 'quiz' && (
                            <div className="">
                                <p>クイズ機能はまだ実装されていません。</p>
                            </div>
                        )
                    }

                    {
                        selectedTab === 'setting' && (
                            <Flex vertical gap={20}>
                                <div className="sideBarSetting">
                                    <TextField
                                        label="メッセージ削除速度"
                                        suffix="秒"
                                        type="number"
                                        value={Math.floor(messageDeleteSpeed / 1000)}
                                        min={3}
                                        max={15}
                                        width={50}
                                        onChange={(e) => setMessageDeleteSpeed(Number(e.target.value) * 1000)}
                                    />
                                </div>
                                <Button width="fit-content" onClick={onExit} type="button" color="danger">
                                    <LogoutIcon />退室
                                </Button>
                            </Flex>
                        )
                    }
                </div>
            </div>

            {characters.map(character => (
                (!myCharacter || character.id !== myCharacter.id) ? (
                    <Character
                        key={character.id}
                        user={character}
                        chats={yourChats[character.id] ?? []}
                        gesture={userGesturies[character.id] || ''}
                    />
                ) : null
            ))}
            {myCharacter && (
                <MyCharacter
                    user={myCharacter}
                    users={characters}
                    onMoved={onCharacterMove}
                    chats={myChats}
                    onReflection={onReflection}
                    onMessage={sendMessage}
                    onGesture={sendGesture}
                    onEnquete={handleEnqueteSubmit}
                    enquete={enquete}
                    isSelectEnquete={isSelectEnquete}
                    onSelectEnquete={handleSelectEnquete}
                    timerRef={timerRef}
                    quizTimerRef={quizTimerRef}
                    onJoinQuiz={handleJoinQuiz}
                    onQuizSelect={handleQuizSelect}
                    onQuizStart={handleStartQuiz}
                    onQuizCancel={handleCancelQuiz}
                    onSelectQuestion={handleSelectQuestion}
                    quizJoinUsers={quizJoinUsers}
                    quiz={quiz}
                />
            )}
        </main>
    )
}