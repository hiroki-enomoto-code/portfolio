'use client'
import React, { useEffect, useRef, useState } from 'react';
import { redirect } from 'next/navigation';
import { Socket } from "socket.io-client";
import { getSocket } from '@/lib/amuse-socket';

import { useData } from '@/context/DataContext';
import {
    ServerToClientEvent,
    FetchRoomInfo,
    ClientToServerCallbackProps,
    RoomUserDisconnect
} from '@/types/socket';

import {
    Card,
    Button,
    Field,
    Fieldset,
    For,
    Input,
    NativeSelect,
    Stack,
    Grid,
    GridItem,
    Image,
    Box
} from "@chakra-ui/react"

const MAX_USERS = parseInt(process.env.CHAT_SOCKET_MAX_USERS || '10');

export default function Page() {

    const socket = useRef<Socket | null>(null);
    const sessionId = useRef<string | null>(null);

    const { setChatSession } = useData();

    const [name, setName] = useState<string>('名無しさん');
    const [characterImage, setCharacterImage] = useState<number>(2);
    const [roomUserCount, setRoomUserCount] = useState<number | null>(null);
    const [roomUserNames, setRoomUserNames] = useState<string[] | null>(null);

    const onSetUp = () => {

        const _name = name.trim();

        if (!_name || !sessionId.current) return;

        if (!roomUserNames || roomUserNames.includes(_name)) {
            alert('その名前はすでに使用されています。別の名前を入力してください。');
            return;
        }

        setChatSession({
            id: sessionId.current,
            name: _name,
            character: characterImage
        });

        redirect('/amusement/1/');
    }

    const onFetchRoomInfo: ServerToClientEvent<FetchRoomInfo> = (response) => {
        setRoomUserCount(response.users.length);
        setRoomUserNames(response.users);
        sessionId.current = response.id;
    }

    const onRoomUserDisconnect: ServerToClientEvent<RoomUserDisconnect> = response => {
        setRoomUserCount(response);
    }

    useEffect(() => {
        try {
            socket.current = getSocket();

            if (!socket.current) throw new Error('Socket connection failed');

            socket.current.on('fetchRoomInfo', onFetchRoomInfo);
            socket.current.on('roomUserDisconnect', onRoomUserDisconnect);

            socket.current.emit(
                'fetchRoomInfo',
                null,
                (response: ClientToServerCallbackProps) => response.status === 'error' ? console.log(response.message) : null
            );
        } catch (error) {
            console.log(error);
        }


        return () => {
            if (socket.current) {
                //socket.current.on('disconnect', function() {});
            }
        }
    }, []);

    return (
        <main style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <Card.Root size="sm" width={'100%'} maxWidth={800} margin={'auto'} marginTop={40}>
                <Card.Body color="fg.muted">
                    <Grid templateColumns="minmax(0, 1fr) minmax(0, 150px)" gap="12">
                        <GridItem flex={1}>
                            <Fieldset.Root size="lg">
                                <Fieldset.Content>
                                    <Field.Root>
                                        <Field.Label>名前</Field.Label>
                                        <Input value={name} onChange={e => setName(e.target.value)} />
                                    </Field.Root>

                                    <Field.Root>
                                        <Field.Label>キャラクター選択</Field.Label>
                                        <Grid templateColumns="repeat(4, 100px)" gap="4">
                                            <For each={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}>
                                                {(_, idx) => (
                                                    <Box
                                                        key={idx}
                                                        aspectRatio={1}
                                                        display={'flex'}
                                                        alignItems={'center'}
                                                        justifyContent={'center'}
                                                        rounded="md"
                                                        bg={characterImage === idx + 1 ? "blue.100" : "white"}
                                                        _hover={{ bg: characterImage === idx + 1 ? "blue.100" : "gray.100" }}
                                                        onClick={() => setCharacterImage(idx + 1)}
                                                    >
                                                        <Image
                                                            height={'80%'}
                                                            width={'auto'}
                                                            src={`/images/amusement/character_${idx + 1}.png`}
                                                        />
                                                    </Box>
                                                )}
                                            </For>
                                        </Grid>
                                    </Field.Root>

                                </Fieldset.Content>
                            </Fieldset.Root>
                        </GridItem>
                        <GridItem pt="6">
                            <Button
                                type="button"
                                alignSelf="flex-start"
                                colorPalette="primary"
                                onClick={onSetUp}
                                width={'100%'}
                            >
                                {roomUserCount !== null && roomUserCount >= MAX_USERS ? `満員` : '入室する'}<br />{Number(roomUserCount)} / {MAX_USERS}人参加中
                            </Button>
                        </GridItem>
                    </Grid>
                </Card.Body>
            </Card.Root>
        </main >
    )
}