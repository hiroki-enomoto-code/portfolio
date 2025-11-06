'use client'
import React, { FC, LegacyRef, useState, useEffect, useRef, memo, ChangeEvent } from 'react';
import imageCompression from 'browser-image-compression';
import { motion } from 'framer-motion';
import axios from 'axios';

import { GOOGLE_EMOJI } from '@/data';
import { EnqueteType } from '@/app/(default)/amusement/Enquete';
import { CharacterType, ChatType, QuizType } from './[id]/page';
import useNotification from '@/hooks/useNotification';

import Enquete from '@/app/(default)/amusement/Enquete';

import { Paragraph } from '@/components/ui/Typography/Typography';
import Space from '@/components/ui/Space/Space';
import Flex from '@/components/ui/Flex/Flex';
import Tab from '@/components/ui/Tab/Tab';
import Radio from '@/components/ui/Radio/Radio';
import Table, { TableBody, TableHeader, TableRow, TableCell } from '@/components/ui/Table/Table';
import DrawingBoard from '@/components/ui/DrawingBoard/DrawingBoard';
import Modal from '@/components/ui/Modal';
import Image from '@/components/ui/Image/Image';
import Button from '@/components/ui/Button/Button';
import PenIcon from '@/components/icon/PenIcon';
import SendIcon from '@/components/icon/SendIcon';
import ReverseIcon from '@/components/icon/ReverseIcon';
import EmojiIcon from '@/components/icon/EmojiIcon';
import CrossIcon from '@/components/icon/CrossIcon';
import ImageIcon from '@/components/icon/ImageIcon';
import PaintPalletIcon from '@/components/icon/PaintPalletIcon';
import QuizIcon from '@/components/icon/QuizIcon';
import { QuizProps } from '@/types/quiz';

const TEST_QUIZ_DATA: any = [
    { "id": 46, "title": "dwqdwq", "thumbnail": "", "count": 3, "question_count": 2, "avg_score": 33 },
    { "id": 45, "title": "1212", "thumbnail": "", "count": 0, "question_count": 2, "avg_score": 0 },
    { "id": 43, "title": "fewaf", "thumbnail": "", "count": 2, "question_count": 2, "avg_score": 50 },
    { "id": 42, "title": "TEST", "thumbnail": "", "count": 1, "question_count": 2, "avg_score": 100 },
    { "id": 41, "title": "クイズのタイトル1", "thumbnail": "", "count": 1, "question_count": 1, "avg_score": 0 },
    { "id": 40, "title": "クイズのタイトル2", "thumbnail": "", "count": 0, "question_count": 1, "avg_score": 0 },
    { "id": 39, "title": "クイズのタイトル3", "thumbnail": "", "count": 0, "question_count": 2, "avg_score": 0 },
    { "id": 38, "title": "クイズのタイトル4", "thumbnail": "thumbnail.jpg", "count": 0, "question_count": 2, "avg_score": 0 },
    { "id": 37, "title": "クイズのタイトル5", "thumbnail": "", "count": 0, "question_count": 2, "avg_score": 0 },
    { "id": 34, "title": "クイズのタイトル6", "thumbnail": "", "count": 11, "question_count": 6, "avg_score": 35 },
    { "id": 33, "title": "クイズのタイトル7", "thumbnail": "", "count": 0, "question_count": 2, "avg_score": 0 }
];

const IS_TEST = true;

type Props = {
    user: CharacterType;
    users: CharacterType[];
    onMoved?: (id: string, position: { x: number, y: number }) => void;
    chats: ChatType[];
    onReflection: () => void;
    onMessage: (message: string, type: 'text' | 'image') => void;
    onGesture: (gesture: string) => void;
    onEnquete: (data: { answers: { id: string, value: string | number, count: number }[], detail: string }) => void;
    onSelectEnquete: (answerId: string) => void;
    enquete: EnqueteType | null
    isSelectEnquete: boolean;
    timerRef: LegacyRef<HTMLInputElement>;
    quizTimerRef: LegacyRef<HTMLDivElement>;
    onQuizSelect: (id: number) => void;
    quiz: QuizType | null;
    onJoinQuiz: () => void;
    quizJoinUsers: string[];
    onQuizStart: () => void;
    onQuizCancel: () => void;
    onSelectQuestion: (value: number | string | null) => void;
}

const MyCharacter: FC<Props> = memo(({
    user,
    users,
    onMoved,
    chats,
    onReflection,
    onMessage,
    onGesture,
    onEnquete,
    enquete,
    onSelectEnquete,
    timerRef,
    isSelectEnquete,
    quizTimerRef,
    onJoinQuiz,
    onQuizSelect,
    quizJoinUsers,
    onQuizStart,
    onQuizCancel,
    onSelectQuestion,
    quiz
}) => {

    const { success } = useNotification();
    const gestureButtonRef = useRef<HTMLButtonElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messageBoxRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const startPosRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

    const containerWidthRef = useRef(window.innerWidth);
    const containerHeightRef = useRef(window.innerHeight);
    const marginXRef = useRef({ start: 0, end: 0 });
    const marginYRef = useRef({ start: 0, end: 0 });

    const [tabValue, setTabValue] = useState<'message' | 'quiz' | 'enquete' | 'gesture' | 'draw'>('message');
    const [position, setPosition] = useState({ x: user.x, y: user.y });
    const [isDragging, setIsDragging] = useState(false);
    const [gesture, setGesture] = useState<string>('');
    const [imageSrc, setImageSrc] = useState<string>('');
    const [isMessaageFocused, setIsMessageFocused] = useState(false);
    const [isOpenGesture, setIsOpenGesture] = useState(false);
    const [isDrawingBoardOpen, setIsDrawingBoardOpen] = useState(false);
    const [isEnqueteOpen, setIsEnqueteOpen] = useState(false);

    // クイズ関連の状態
    const [quizList, setQuizList] = useState<QuizProps[] | null>(null);

    const onMouseStart = (x, y) => {
        setIsDragging(true);
        startPosRef.current = { x, y };
        offsetRef.current = position;
    }

    const onSubmitMessage = (e) => {
        e.preventDefault();

        if (imageSrc) {
            onMessage(imageSrc, 'image');
            setImageSrc('');
            return;
        }

        if (textareaRef.current && textareaRef.current.value.trim()) {
            onMessage(textareaRef.current.value, 'text');
            textareaRef.current.value = '';
        }
    }

    const handleSendPaint = (image: string) => {
        if (!image) return;
        onMessage(image, 'image');
        setIsDrawingBoardOpen(false);
    }

    const handleGesture = (type: string) => {
        if (gesture) return;

        setIsOpenGesture(false);
        setGesture(type);
        onGesture(type);
        setTimeout(() => {
            setGesture('');
        }, 6000);
    }

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const _files = e.target.files;

        if (!_files || _files.length === 0) return;

        const options = {
            maxSizeMB: 0.4,
            maxWidthOrHeight: 500,
            useWebWorker: true,
            fileType: 'image/webp'
        };

        const compressedFile = await imageCompression(_files[0], options);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImageSrc(reader.result as string);

            e.target.value = '';
        };
        reader.readAsDataURL(compressedFile);
        setTabValue('message');
    };

    const handleCloseColtrolTab = () => {
        setTabValue('message');
        setIsMessageFocused(false);
    }

    //Quiz関連のハンドラー
    const handleQuizSelect = (id: number) => {
        try {
            onQuizSelect(id);
        } catch (error) {
            //success({ message: error instanceof Error ? error.message : 'クイズの選択に失敗しました。' });
        }
    };

    const handleStartQuiz = () => {
        try {
            onQuizStart();
        } catch (error) {
            success({ message: error instanceof Error ? error.message : 'クイズの開始に失敗しました。' });
        }
    };

    const handleCancelQuiz = () => {
        try {
            onQuizCancel();
        } catch (error) {
            success({ message: error instanceof Error ? error.message : 'クイズの終了に失敗しました。' });
        }
    };

    const handleJoinQuiz = () => {
        try {
            onJoinQuiz();
        } catch (error) {
            success({ message: error instanceof Error ? error.message : 'クイズの参加に失敗しました。' });
        }
    }

    useEffect(() => {
        const handleMouseMove = ({ clientX, clientY }) => {
            if (!isDragging) return;

            const deltaX = clientX - startPosRef.current.x;
            const deltaY = clientY - startPosRef.current.y;

            const newX = offsetRef.current.x + (deltaX / containerWidthRef.current) * 100;
            const newY = offsetRef.current.y + (deltaY / containerHeightRef.current) * 100;

            const limitedX = Math.max(marginXRef.current.start, Math.min(newX, 100 - marginXRef.current.end));
            const limitedY = Math.max(marginYRef.current.start, Math.min(newY, 100 - marginYRef.current.end));

            setPosition({ x: limitedX, y: limitedY });
        };

        const handleMouseUp = ({ clientX, clientY }) => {
            setIsDragging(false);

            const deltaX = clientX - startPosRef.current.x;
            const deltaY = clientY - startPosRef.current.y;

            const newX = offsetRef.current.x + (deltaX / containerWidthRef.current) * 100;
            const newY = offsetRef.current.y + (deltaY / containerHeightRef.current) * 100;

            const limitedX = Math.max(marginXRef.current.start, Math.min(newX, 100 - marginXRef.current.end));
            const limitedY = Math.max(marginYRef.current.start, Math.min(newY, 100 - marginYRef.current.end));

            if (onMoved) {
                onMoved(user.id, { x: limitedX, y: limitedY });
            }
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    useEffect(() => {
        const resizeHandler = () => {
            containerWidthRef.current = window.innerWidth;
            containerHeightRef.current = window.innerHeight;

            marginXRef.current = { start: (100 / containerWidthRef.current) * 100, end: (170 / containerWidthRef.current) * 100 };
            marginYRef.current = { start: (100 / containerHeightRef.current) * 100, end: (280 / containerHeightRef.current) * 100 };
        }
        window.addEventListener('resize', resizeHandler);
        resizeHandler();
        return () => {
            window.removeEventListener('resize', resizeHandler);
        }
    }, []);

    useEffect(() => {
        if (!messageBoxRef.current) return;
        messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;

    }, [chats, enquete]);

    useEffect(() => {
        if (tabValue === 'quiz' && !quizList) {
            if (IS_TEST) {
                setQuizList(TEST_QUIZ_DATA);
                return;
            }
            axios.get('/managed-api/public/quiz')
                .then(response => {
                    setQuizList(response.data);
                })
                .catch(error => {
                    setQuizList([]);
                    success({ message: error instanceof Error ? error.message : 'クイズ一覧の取得に失敗しました。' });
                });
        }
    }, [tabValue]);

    return (
        <div
            ref={boxRef}
            className="character is-mine"
            style={{ transform: `translate(${position.x}vw, ${position.y}vh)` }}
        >
            <div className="characterProfile">
                {
                    gesture && (
                        <div className="characterProfileEmotion">
                            <div className="">{gesture}</div>
                        </div>
                    )
                }
                <div
                    className={`characterProfile_image is-`}
                    onMouseDown={e => onMouseStart(e.clientX, e.clientY)}
                    onTouchStart={e => onMouseStart(e.touches[0].clientX, e.touches[0].clientY)}
                >
                    <img className={user.reflection ? 'is-reflection' : ''} src={`/images/amusement/character_${user.character}.png`} alt="" />
                </div>
                <div className="characterProfile_name">
                    <p>{user.name}</p>
                </div>
            </div>
            <div ref={messageBoxRef} className="characterMessageList">
                {
                    chats.map(chat => {
                        let totalCount = 0;
                        if (chat.type === 'enquete') {
                            totalCount = chat.data.enquete.answers.reduce((acc, answer) => acc + answer.count, 0);
                        }
                        return (
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
                                        <div style={{ '--ty': `-${position.y + 30}vh` } as any} key={chat.data.time} className="characterMessageListItem">
                                            <img src={chat.data.image} alt="" />
                                        </div>
                                    )}
                                    {chat.type === 'text' && (
                                        <div style={{ '--ty': `-${position.y + 30}vh` } as any} key={chat.data.time} className="characterMessageListItem">
                                            <p>{chat.data.text}</p>
                                        </div>
                                    )}
                                    {
                                        chat.type === 'enquete' && (
                                            <div style={{ '--ty': `-${position.y + 30}vh` } as any} className="characterMessageListEnquete is-end">
                                                <div ref={timerRef} className="characterMessageListEnquete_endButton">終了</div>
                                                <div className="characterMessageListEnquete_title">{users.find(u => u.id === chat.data.enquete.id)?.name || 'Unknown'}さんからのアンケート</div>
                                                <p className="characterMessageListEnquete_detail">{chat.data.enquete.detail}</p>
                                                <ul className="characterMessageListEnqueteAnswers">
                                                    {
                                                        chat.data.enquete.answers.map(answer => (
                                                            <div style={{ '--w': `${(totalCount / answer.count) * 100}%` } as any} className="characterMessageListEnqueteAnswers_select" key={answer.id}>
                                                                <span className="is-a">{answer.value}</span>
                                                                {isSelectEnquete && <span className="is-count">({answer.count}票)</span>}
                                                            </div>
                                                        ))
                                                    }
                                                </ul>
                                            </div>
                                        )
                                    }
                                </React.Fragment>
                            </motion.div>
                        )
                    })
                }
                {
                    enquete && (
                        <div className="characterMessageListEnquete">
                            <div ref={timerRef} className="characterMessageListEnquete_endButton">
                                {enquete.status === 'end' ? '終了' : 60}
                            </div>
                            <div className="characterMessageListEnquete_title">{users.find(u => u.id === enquete.id)?.name || 'Unknown'}さんからのアンケート</div>
                            <p className="characterMessageListEnquete_detail">{enquete.detail}</p>
                            <ul className="characterMessageListEnqueteAnswers">
                                {
                                    enquete.answers.map(answer => (
                                        <button style={{ '--w': `${(enquete.answers.reduce((acc, answer) => acc + answer.count, 0) / answer.count) * 100}%` } as any} className="characterMessageListEnqueteAnswers_select" key={answer.id} onClick={() => onSelectEnquete(answer.id)} disabled={isSelectEnquete}>
                                            <span className="is-a">{answer.value}</span>
                                            {isSelectEnquete && <span className="is-count">({answer.count}票)</span>}
                                        </button>
                                    ))
                                }
                            </ul>
                        </div>
                    )
                }
                {quiz && (
                    <>
                        {(quiz.status === 'join' && quiz.create_user !== user.id) && (
                            quizJoinUsers.includes(user.id) ? (
                                <div className="characterMessageListQuiz">
                                    <Flex vertical gap={8}>
                                        <Paragraph weight="bold">【{quiz.title}】</Paragraph>
                                        <Paragraph size="xs" type="secondary">{users.find(u => u.id === quiz.create_user)?.name || 'Unknown'}さんがクイズに参加しました。</Paragraph>
                                        <Button color="primary" onClick={handleJoinQuiz}>参加を取り消す</Button>
                                    </Flex>
                                </div>
                            ) : (
                                <div className="characterMessageListQuiz">
                                    <Flex vertical gap={8}>
                                        <Paragraph weight="bold">【{quiz.title}】</Paragraph>
                                        <Paragraph size="xs" type="secondary">{users.find(u => u.id === quiz.create_user)?.name || 'Unknown'}さんがクイズの参加募集を開始しました。</Paragraph>
                                        <Button color="primary" onClick={handleJoinQuiz}>参加する</Button>
                                    </Flex>
                                </div>
                            )
                        )}

                        {(quiz.status === 'countdown' && quizJoinUsers.includes(user.id)) && (
                            <div className="characterMessageListQuiz">
                                {quiz.countdown}
                            </div>
                        )}

                        {/* {(quiz.status === 'active' && quizJoinUsers.includes(user.id)) && (
                            <div className="characterMessageListQuiz">
                                クイズ中
                            </div>
                        )} */}
                    </>
                )}
            </div>
            <div className={`characterOperation${isMessaageFocused ? ' is-focused' : ''}`}>
                {
                    (quiz && quiz.status === 'active' && quizJoinUsers.includes(user.id) && quiz.currentQ) ? (
                        <div className="characterOperationQuizStart">
                            <div ref={ quizTimerRef } className="characterOperationQuizStart_timer">{ quiz.currentQ.time }</div>
                            <Flex vertical gap={8}>
                                <Flex vertical gap={4}>
                                    { quiz.currentQ.image && <Image src={ quiz.currentQ.image } alt="" width="100%" /> }
                                    <Paragraph size="sm" align="left">{quiz.currentQ.question}</Paragraph>
                                </Flex>
                                <Flex vertical gap={4}>
                                    { quiz.currentQ.options.map(option => (
                                        <Radio onChange={ () => onSelectQuestion(option.id) } key={`${quiz.currentQ!.id}-${option.id}`} name="answer" size="sm" value={option.id} label={option.text} />
                                    ))}
                                </Flex>
                            </Flex>
                        </div>
                    ) : (
                        <>
                            <div className="characterOperationTab">
                                <Tab value={tabValue}>
                                    <Tab.Item value="message">
                                        <form
                                            onSubmit={onSubmitMessage}
                                            className="characterOperationMessage"
                                        >
                                            {
                                                imageSrc ? (
                                                    <div className="characterOperationMessage_image">
                                                        <img src={imageSrc} alt="" />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setImageSrc('');
                                                            }}
                                                        ><CrossIcon /></button>
                                                    </div>
                                                ) : (
                                                    <textarea
                                                        ref={textareaRef}
                                                        onFocus={() => setIsMessageFocused(true)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter' && e.shiftKey) {
                                                                e.preventDefault();
                                                                onSubmitMessage(e);
                                                            }
                                                        }}
                                                        placeholder="入力"
                                                    />
                                                )
                                            }
                                            <div className="characterOperationMessage_button">
                                                <Button color="danger" border type="submit" size="xs">
                                                    <SendIcon size={14} />
                                                </Button>
                                            </div>
                                        </form>
                                    </Tab.Item>
                                    <Tab.Item value="gesture">
                                        <div className="characterOperationGesture">
                                            {GOOGLE_EMOJI.map((emoji, idx) => <button key={idx} onClick={() => handleGesture(emoji)}>{emoji}</button>)}
                                        </div>
                                    </Tab.Item>
                                    <Tab.Item value="quiz">
                                        <div className="characterOperationQuiz">
                                            {
                                                /* 参加確認中 */
                                                (quiz && quiz.status === 'join' && quiz.create_user === user.id) && (
                                                    //true ? (
                                                    <Space padding={8}>
                                                        <Flex vertical gap={8}>
                                                            <Flex justify="between" align="center">
                                                                <Paragraph size="md" align="left">{quiz.title}</Paragraph>
                                                                <Flex justify="start" gap={4} width="fit-content">
                                                                    <Button onClick={handleStartQuiz} width={40} size="xs" color="success" border type="button">開始</Button>
                                                                    <Button onClick={handleCancelQuiz} width={40} size="xs" color="danger" border type="button">終了</Button>
                                                                </Flex>
                                                            </Flex>
                                                            <Flex vertical gap={4}>
                                                                <Paragraph size="xs">参加者一覧</Paragraph>
                                                                <Flex vertical gap={4}>
                                                                    {
                                                                        quizJoinUsers.map((u, idx) => (
                                                                            <Paragraph size="xxs" type="secondary" key={idx}>
                                                                                {users.find(c => c.id === u)?.name || 'Unknown User'}
                                                                            </Paragraph>
                                                                        ))
                                                                    }
                                                                </Flex>
                                                            </Flex>
                                                        </Flex>
                                                    </Space>
                                                )
                                            }

                                            {
                                                /* クイズ一覧 */
                                                !quiz && (
                                                    (quizList && quizList.length) && (
                                                        <Table columns="75% 25%" size="xs">
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableCell>クイズ名</TableCell>
                                                                    <TableCell></TableCell>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody gap={4}>
                                                                {
                                                                    (quizList && quizList.length) && (
                                                                        quizList.map(q => (
                                                                            <TableRow key={q.id} clickable onClick={() => handleQuizSelect(q.id)}>
                                                                                <TableCell>{q.title}</TableCell>
                                                                                <TableCell>
                                                                                    <Button size="xs" color="success" type="button">募集する</Button>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))
                                                                    )
                                                                }

                                                                {
                                                                    (!quizList) && (
                                                                        <TableRow>
                                                                            クイズがありません
                                                                        </TableRow>
                                                                    )
                                                                }
                                                            </TableBody>
                                                        </Table>
                                                    )
                                                )
                                            }
                                        </div>
                                    </Tab.Item>
                                </Tab>
                            </div>
                            <div className="characterOperationControl">
                                <div className="characterOperationControlButtons">
                                    <button className="characterOperationControlButtons_button" type="button" onClick={onReflection}><ReverseIcon /></button>
                                    <button
                                        className={`characterOperationControlButtons_button${tabValue === 'message' ? ' is-active' : ''}`}
                                        type="button"
                                        onClick={() => {
                                            setTabValue('message');
                                            textareaRef.current?.focus();
                                        }}
                                    ><PenIcon size={17} /></button>
                                    <button className={`characterOperationControlButtons_button${tabValue === 'gesture' ? ' is-active' : ''}`} type="button" onClick={() => setTabValue('gesture')}><EmojiIcon /></button>

                                    <div className="characterOperationControlButtons_button is-close">
                                        <input type="file" onChange={e => handleFileChange(e)}></input>
                                        <ImageIcon />
                                    </div>

                                    <button className="characterOperationControlButtons_button is-close" type="button" onClick={() => setIsDrawingBoardOpen(true)}><PaintPalletIcon /></button>
                                    <button className="characterOperationControlButtons_button is-close" type="button" onClick={() => setIsEnqueteOpen(true)}>E</button>
                                    <button className={`characterOperationControlButtons_button is-close${tabValue === 'quiz' ? ' is-active' : ''}`} type="button" onClick={() => setTabValue('quiz')}><QuizIcon size={20} /></button>
                                    <button className="characterOperationControlButtons_button is-close" type="button" onClick={ handleCloseColtrolTab }><CrossIcon /></button>
                                </div>
                            </div>
                        </>
                    )
                }
            </div>

            <Modal isOpen={isDrawingBoardOpen} onOpen={() => setIsDrawingBoardOpen(false)}>
                <DrawingBoard onExport={handleSendPaint} />
            </Modal>

            <Modal isOpen={isEnqueteOpen} onOpen={() => setIsEnqueteOpen(false)}>
                <div className="amusementEnqueteModal">
                    <Enquete onSubmit={data => {
                        onEnquete(data);
                        setIsEnqueteOpen(false);
                    }} />
                </div>
            </Modal>
        </div>
    );
});

export default MyCharacter;