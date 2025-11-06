'use client'
import React, { useEffect, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Socket } from "socket.io-client";
import {
    For, Card, Dialog, List, Text,
    IconButton, Image, Button,
    Portal, CloseButton, DataList
} from "@chakra-ui/react"

import { QuizProps, QuestionProps } from '@/types/quiz';
import { EnqueteType } from '@/app/(default)/amusement/Enquete';
import MyCharacter from '../amusement/MyCharacter2';

import { SlSettings } from "react-icons/sl";
import { BsChatLeftText } from "react-icons/bs";
import { LuCircleCheck, LuCircleDashed } from "react-icons/lu"

import {
    ServerToClientEvent,
    LoginToRoom,
    ClientToServerCallbackProps,
} from '@/types/socket';

export type QuizType = Omit<QuizProps, 'answer' | 'created_at' | 'updated_at' | 'status' | 'create_user' | 'questions'> & {
    create_user: string;
    status: 'join' | 'countdown' | 'active' | 'end';
    countdown: number;
    currentQ: QuestionProps | null;
    currentQIndex: number | null;
}

export type CharacterType = {
    id: string;
    name: string;
    x: number;
    y: number;
    reflection: boolean;
    character: number;
    gesture: string;
}

export default function Page() {

    const socket = useRef<Socket | null>(null);

    const [myCharacter, setMyCharacter] = useState<CharacterType | null>(null);

    //アンケート関連
    const [enquete, setEnquete] = useState<EnqueteType | null>(null);
    const [isSelectEnquete, setIsSelectEnquete] = useState<boolean>(false);

    //クイズ関連
    const [quiz, setQuiz] = useState<QuizType | null>(null);
    const [quizJoinUsers, setQuizJoinUsers] = useState<string[]>([]);
    const quizSelectRef = useRef<number | string | null>(null);

    const onReflection = () => {
        if (!myCharacter) return;

        const updatedCharacter = {
            ...myCharacter,
            reflection: !myCharacter.reflection
        };
        setMyCharacter(updatedCharacter);
        socket.current!.emit(
            'flipUserDirection',
            { id: myCharacter!.id, reflection: !myCharacter.reflection },
            (response: ClientToServerCallbackProps) => response.status === 'error' ? console.log(response.message) : null
        );
    }

    const onEnqueteSubmit = (data: Omit<EnqueteType, 'id' | 'status'>) => {
        if (enquete) throw new Error('アンケートはすでに存在します。');

        const newEnquete = {
            ...data,
            time: Date.now(),
        };

        socket.current!.emit(
            'createEnquete',
            newEnquete,
            (response: ClientToServerCallbackProps) => {
                if (response.status === 'error') {
                    throw new Error(response.message);
                }
            }
        );
    }

    return (
        <main style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <Card.Root
                size="sm"
                variant="elevated"
                //width={200}
                position="fixed"
                top="50%"
                right="2"
                transform="translateY(-50%)"
            >
                <Card.Body
                    padding="1"
                    gap={2}
                >
                    <IconButton
                        height="25px"
                        variant="ghost"
                        size="xs"
                    >
                        <SlSettings />
                    </IconButton>
                    <IconButton
                        height="25px"
                        variant="ghost"
                        size="xs"
                    >
                        <BsChatLeftText />
                    </IconButton>
                </Card.Body>
            </Card.Root>
            {
                true && (
                    <MyCharacter
                        onReflection={onReflection}
                        onEnquete={onEnqueteSubmit}
                    />
                )
            }

            <Dialog.Root
                closeOnInteractOutside={false}
                modal={false}
                open={false}
            >
                <Portal>
                    <Dialog.Positioner pointerEvents="none">
                        <Dialog.Content backgroundColor="whiteAlpha.700">
                            <Dialog.Header>
                                <Dialog.Title>クイズの参加募集が開始されました。</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                {false && <Image maxW="150px" src="/images/chibi_maruko_quiz.png" alt="" />}
                                <DataList.Root orientation="horizontal">
                                    <DataList.Item>
                                        <DataList.ItemLabel>クイズ名</DataList.ItemLabel>
                                        <DataList.ItemValue>ちびまる子ちゃんクイズ</DataList.ItemValue>
                                    </DataList.Item>
                                    <DataList.Item>
                                        <DataList.ItemLabel>プレイ回数</DataList.ItemLabel>
                                        <DataList.ItemValue>12回</DataList.ItemValue>
                                    </DataList.Item>
                                    <DataList.Item>
                                        <DataList.ItemLabel>正解率</DataList.ItemLabel>
                                        <DataList.ItemValue>34%</DataList.ItemValue>
                                    </DataList.Item>
                                </DataList.Root>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button colorPalette="blue">参加する</Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            <Dialog.Root
                closeOnInteractOutside={false}
                modal={false}
                open={false}
            >
                <Portal>
                    <Dialog.Positioner pointerEvents="none">
                        <Dialog.Content backgroundColor="whiteAlpha.700">
                            <Dialog.Header>
                                <Dialog.Title>クイズ参加者一覧</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <List.Root gap="2" variant="plain" flexWrap="wrap" flexDirection="row" align="center">
                                    <For each={['山田太郎', '鈴木次郎', '佐藤花子', '田中一郎', '高橋三郎']}>
                                        {(name, idx) => (
                                            <List.Item key={idx} maxW="50%">
                                                {idx === 2 ? (
                                                    <>
                                                        <List.Indicator asChild color="green.500">
                                                            <LuCircleCheck />
                                                        </List.Indicator>
                                                        <Text textStyle="sm">{name}</Text>
                                                    </>
                                                ) : (
                                                    <>
                                                        <List.Indicator asChild color="gray.200">
                                                            <LuCircleDashed />
                                                        </List.Indicator>
                                                        <Text textStyle="sm" color="gray.400">{name}</Text>
                                                    </>
                                                )}
                                            </List.Item>
                                        )}
                                    </For>
                                </List.Root>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button colorPalette="blue">クイズスタート</Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </main >
    )
}