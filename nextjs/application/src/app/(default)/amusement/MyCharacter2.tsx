'use client'
import { FC, useEffect, useRef, useState, memo } from 'react';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import {
    Box, Card, Image, Text, Flex, Tabs,
    Textarea, IconButton, FileUpload, Icon, Grid,
    Popover, Stack, Portal, Dialog
} from "@chakra-ui/react"
import { GoPencil } from "react-icons/go";
import { BsEmojiSmile } from "react-icons/bs";
import { CgClose } from "react-icons/cg";
import { SiQuizlet } from "react-icons/si";
import { SlNotebook } from "react-icons/sl";
import { MdGesture } from "react-icons/md";
import { GoImage } from "react-icons/go";
import { TbSend2 } from "react-icons/tb";
import { LuUpload, LuRotateCw } from "react-icons/lu";

import { GOOGLE_EMOJI } from '@/data';
import { CharacterType, ChatType, QuizType } from './[id]/page';
import { QuizProps } from '@/types/quiz';

import DrawBoard from '@/components/ui/DrawBoard';
import Enquete from '@/app/(default)/amusement/Enquete';
import Quiz from '@/app/(default)/amusement/Quiz';

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
    onReflection: () => void;
    onEnquete: (data: { answers: { id: string, value: string | number, count: number }[], detail: string }) => void;
};

const MyCharacter: FC<Props> = memo(({
    onReflection,
    onEnquete,
}) => {

    const messageTextareaRef = useRef<HTMLTextAreaElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const startPosRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const containerWidthRef = useRef(0);
    const containerHeightRef = useRef(0);
    const marginXRef = useRef({ start: 0, end: 0 });
    const marginYRef = useRef({ start: 0, end: 0 });

    const [selectedTab, setSelectedTab] = useState<string | null>('message');
    const [imageSrc, setImageSrc] = useState<string>('');
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [isDrawModal, setIsDrawModal] = useState(false);
    const [isEnqueteOpen, setIsEnqueteOpen] = useState(false);
    const [isQuizOpen, setIsQuizOpen] = useState(false);

    const [quizList, setQuizList] = useState<QuizProps[] | null>(null);

    const handleChangeTab = (tab: string) => {
        setSelectedTab(tab);
        if (tab === 'message' && messageTextareaRef.current) {
            messageTextareaRef.current.focus();
        }
    }

    const onMouseStart = (x, y) => {
        setIsDragging(true);
        startPosRef.current = { x, y };
        offsetRef.current = position;
    }

    const onSubmitMessage = (e) => {
        e.preventDefault();

        if (imageSrc) {
            //onMessage(imageSrc, 'image');
            setImageSrc('');
            return;
        }

        if (messageTextareaRef.current && messageTextareaRef.current.value.trim()) {
            //onMessage(messageTextareaRef.current.value, 'text');
            messageTextareaRef.current.value = '';
        }
    }

    const handleFileChange = async (files: File[]) => {
        if (!files || files.length === 0) return;

        const options = {
            maxSizeMB: 0.4,
            maxWidthOrHeight: 500,
            useWebWorker: true,
            fileType: 'image/webp'
        };

        const compressedFile = await imageCompression(files[0], options);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImageSrc(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);
    };

    const handleGesture = (emoji: string) => {
        if (!messageTextareaRef.current) return;
        const currentText = messageTextareaRef.current.value;

        // Insert the emoji at the cursor position
        const start = messageTextareaRef.current.selectionStart;
        const end = messageTextareaRef.current.selectionEnd;
        const newText = currentText.substring(0, start) + emoji + currentText.substring(end);
        messageTextareaRef.current.value = newText;

        messageTextareaRef.current.selectionStart = messageTextareaRef.current.selectionEnd = start + emoji.length;
        messageTextareaRef.current.focus();
    }

    const handleSendEnquete = (data: { answers: { id: string, value: string | number, count: number }[], detail: string }) => {
        try {
            onEnquete(data);
            setIsEnqueteOpen(false);
        } catch (error) {
            console.log(error);
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

            // if (onMoved) {
            //     onMoved(user.id, { x: limitedX, y: limitedY });
            // }
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
        if (isQuizOpen && !quizList) {
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
                });
        }
    }, [isQuizOpen]);

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

    return (
        <Box
            ref={boxRef}
            position="fixed"
            width="fit-content"
            style={{ transform: `translate(${position.x}vw, ${position.y}vh)` }}
        >
            <Flex
                position="relative"
                gap={2}
                flexDirection={'column'}
                justify={'center'}
                alignItems={'center'}
            >
                <Box
                    width="fit-content"
                    _hover={{ cursor: 'grab' }}
                    onMouseDown={e => onMouseStart(e.clientX, e.clientY)}
                    onTouchStart={e => onMouseStart(e.touches[0].clientX, e.touches[0].clientY)}
                >
                    <Image
                        height="80px"
                        width={'auto'}
                        objectFit="contain"
                        src={`/images/amusement/character_5.png`}
                        pointerEvents="none"
                    />
                </Box>
                <Text
                    textStyle="xs"
                    fontWeight="bold"
                >名無しさん</Text>
            </Flex>

            <Card.Root
                size="sm"
                variant="elevated"
                position="absolute"
                top={`calc(100% + 5px)`}
                left="50%"
                transform="translateX(-50%)"
            >
                <Card.Body
                    padding="1"
                >
                    <Tabs.Root
                        value={selectedTab || null}
                        variant="plain"
                        size="sm"
                        fitted={true}
                        maxWidth="100%"
                    >
                        {
                            selectedTab && (
                                <>
                                    <Tabs.Content paddingTop="0" paddingBottom="1" value="message" position="relative">
                                        <Textarea
                                            ref={messageTextareaRef}
                                            size="xs"
                                            height="80px"
                                            border="none"
                                            placeholder="Type your message here..."
                                            resize="none"
                                            outline="none"
                                            paddingRight="40px"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && e.shiftKey) {
                                                    onSubmitMessage(e);
                                                }
                                            }}
                                        />
                                        <Stack
                                            position="absolute"
                                            right="0"
                                            bottom="2"
                                        >
                                            <Popover.Root size="xs">
                                                <Popover.Trigger asChild>
                                                    <IconButton
                                                        colorPalette="blue"
                                                        variant="subtle"
                                                        size="xs"
                                                        height="auto"
                                                        minHeight="25px"
                                                    >
                                                        <BsEmojiSmile />
                                                    </IconButton>
                                                </Popover.Trigger>
                                                <Portal>
                                                    <Popover.Positioner>
                                                        <Popover.Content width="fit-content">
                                                            <Popover.Body padding="1">
                                                                <Grid templateColumns="repeat(8, 30px)" gap="1">
                                                                    {GOOGLE_EMOJI.map((emoji, idx) => (
                                                                        <IconButton
                                                                            key={idx}
                                                                            onClick={() => handleGesture(emoji)}
                                                                            size="2xs"
                                                                            variant="ghost"
                                                                            height="30px"
                                                                            width="30px"
                                                                        >
                                                                            <Text textStyle="md">{emoji}</Text>
                                                                        </IconButton>
                                                                    ))}
                                                                </Grid>
                                                            </Popover.Body>
                                                        </Popover.Content>
                                                    </Popover.Positioner>
                                                </Portal>
                                            </Popover.Root>

                                            <IconButton
                                                colorPalette="pink"
                                                variant="subtle"
                                                size="xs"
                                                height="auto"
                                                minHeight="25px"
                                                onClick={onSubmitMessage}
                                            >
                                                <TbSend2 />
                                            </IconButton>
                                        </Stack>
                                    </Tabs.Content>
                                    <Tabs.Content paddingTop="0" paddingBottom="1" value="image">
                                        {
                                            imageSrc ? (
                                                <Flex
                                                    justify="space-between"
                                                    align="flex-end"
                                                >
                                                    <Box
                                                        padding={1}
                                                        rounded="md"
                                                        border="1px solid"
                                                        borderColor="gray.100"
                                                        width="fit-content"
                                                        position="relative"
                                                    >
                                                        <IconButton
                                                            size="2xs"
                                                            onClick={() => setImageSrc('')}
                                                            rounded="circle"
                                                            position="absolute"
                                                            top={1}
                                                            right={1}
                                                            zIndex={1}
                                                        >
                                                            <CgClose />
                                                        </IconButton>
                                                        <Image
                                                            objectFit="cover"
                                                            maxW="200px"
                                                            maxH="100px"
                                                            rounded="sm"
                                                            src={imageSrc}
                                                        />
                                                    </Box>
                                                    <IconButton
                                                        colorPalette="pink"
                                                        variant="subtle"
                                                        size="xs"
                                                        height="auto"
                                                        minHeight="20px"
                                                    >
                                                        <TbSend2 />
                                                    </IconButton>
                                                </Flex>
                                            ) : (
                                                <FileUpload.Root
                                                    maxW="xl"
                                                    minH="80px"
                                                    height="80px"
                                                    alignItems="stretch"
                                                    maxFiles={1}
                                                    onFileChange={file => handleFileChange(file.acceptedFiles)}
                                                >
                                                    <FileUpload.HiddenInput />
                                                    <FileUpload.Dropzone height="80px" minH="80px">
                                                        <Icon size="md" color="fg.muted">
                                                            <LuUpload />
                                                        </Icon>
                                                    </FileUpload.Dropzone>
                                                </FileUpload.Root>
                                            )
                                        }
                                    </Tabs.Content>
                                </>
                            )
                        }

                        <Tabs.List bg="bg.muted" rounded="l3" p="1" minHeight="auto" gap="1">
                            {
                                [
                                    { value: 'message', icon: <GoPencil />, hidden: false },
                                    { value: 'image', icon: <GoImage />, hidden: false },
                                ].map((tab, idx) => (
                                    (tab.hidden && !selectedTab) ? null : (
                                        <Tabs.Trigger
                                            key={idx}
                                            height="25px"
                                            padding="4px 8px"
                                            minWidth="auto"
                                            value={tab.value}
                                            onClick={() => handleChangeTab(tab.value)}
                                        >
                                            {tab.icon}
                                        </Tabs.Trigger>
                                    )
                                ))
                            }
                            {
                                selectedTab && (
                                    <>
                                        <Dialog.Root
                                            open={isDrawModal}
                                            onOpenChange={() => setIsDrawModal(!isDrawModal)}
                                        >
                                            <Dialog.Trigger asChild>
                                                <IconButton
                                                    size="xs"
                                                    height="25px"
                                                    width="25px"
                                                    variant="subtle"
                                                >
                                                    <MdGesture />
                                                </IconButton>
                                            </Dialog.Trigger>
                                            <Portal>
                                                <Dialog.Backdrop />
                                                <Dialog.Positioner>
                                                    <Dialog.Content>
                                                        <DrawBoard onExport={i => console.log(i)} />
                                                    </Dialog.Content>
                                                </Dialog.Positioner>
                                            </Portal>
                                        </Dialog.Root>

                                        {/* QUIZ */}
                                        <Dialog.Root
                                            open={isQuizOpen}
                                            onOpenChange={() => setIsQuizOpen(!isQuizOpen)}
                                        >
                                            <Dialog.Trigger asChild>
                                                <IconButton
                                                    size="xs"
                                                    height="25px"
                                                    width="25px"
                                                    variant="subtle"
                                                >
                                                    <SiQuizlet />
                                                </IconButton>
                                            </Dialog.Trigger>
                                            <Portal>
                                                <Dialog.Backdrop />
                                                <Dialog.Positioner>
                                                    <Dialog.Content>
                                                        <Quiz
                                                            quiz={quizList}
                                                            onQuizSelect={id => { }}
                                                        />
                                                    </Dialog.Content>
                                                </Dialog.Positioner>
                                            </Portal>
                                        </Dialog.Root>

                                        {/* ENQUETE */}
                                        <Dialog.Root
                                            open={isEnqueteOpen}
                                            onOpenChange={() => setIsEnqueteOpen(!isEnqueteOpen)}
                                        >
                                            <Dialog.Trigger asChild>
                                                <IconButton
                                                    size="xs"
                                                    height="25px"
                                                    width="25px"
                                                    variant="subtle"
                                                >
                                                    <SlNotebook />
                                                </IconButton>
                                            </Dialog.Trigger>
                                            <Portal>
                                                <Dialog.Backdrop />
                                                <Dialog.Positioner>
                                                    <Dialog.Content>
                                                        <Enquete onSubmit={data => handleSendEnquete(data)} />
                                                    </Dialog.Content>
                                                </Dialog.Positioner>
                                            </Portal>
                                        </Dialog.Root>

                                        <IconButton
                                            size="xs"
                                            height="25px"
                                            width="25px"
                                            variant="subtle"
                                            onClick={onReflection}
                                        >
                                            <LuRotateCw />
                                        </IconButton>

                                        <IconButton
                                            size="xs"
                                            height="25px"
                                            width="25px"
                                            variant="subtle"
                                            onClick={() => setSelectedTab(null)}
                                        >
                                            <CgClose />
                                        </IconButton>
                                        <Tabs.Indicator rounded="l2" />
                                    </>
                                )
                            }
                        </Tabs.List>
                    </Tabs.Root>
                </Card.Body>
            </Card.Root>
        </Box>
    )
});

export default MyCharacter;