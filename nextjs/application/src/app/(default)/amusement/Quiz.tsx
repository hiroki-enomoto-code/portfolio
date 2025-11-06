'use client'
import React, { FC, useState, memo, useEffect } from 'react';

import { QuizProps } from '@/types/quiz';
import { CharacterType, QuizType } from '@/app/(default)/amusement/[id]/page';

import {
    Box,
    Table,
    Button,
    For,
    Skeleton,
    Stack
} from "@chakra-ui/react"

type Props = {
    quiz: QuizProps[] | null;
    onQuizSelect: (id: number) => void;
}

const Quiz: FC<Props> = memo(({ quiz, onQuizSelect }) => {

    const handleQuizSelect = (id: number) => {
        try {
            onQuizSelect(id);
        } catch (error) {
            //success({ message: error instanceof Error ? error.message : 'クイズの選択に失敗しました。' });
        }
    };

    return (
        <Box padding="8">

            {
                !quiz && (
                    <Stack flex="1">
                        <Skeleton height="5" />
                        <Skeleton height="5" />
                        <Skeleton height="5" />
                        <Skeleton height="5" />
                        <Skeleton height="5" />
                    </Stack>
                )
            }

            {
                quiz && (
                    <Table.Root size="sm" interactive>
                        <Table.Caption captionSide="top">
                            みんなと挑戦するクイズを選択してください
                        </Table.Caption>
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader width="50%">クイズ名</Table.ColumnHeader>
                                <Table.ColumnHeader>プレイ回数</Table.ColumnHeader>
                                <Table.ColumnHeader>正解率</Table.ColumnHeader>
                                <Table.ColumnHeader></Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <For each={quiz || []}>
                                {item => (
                                    <Table.Row key={item.id}>
                                        <Table.Cell width="50%">{item.title}</Table.Cell>
                                        <Table.Cell>{item.count}</Table.Cell>
                                        <Table.Cell>{item.avg_score}%</Table.Cell>
                                        <Table.Cell textAlign="end">
                                            <Button
                                                size="2xs"
                                                variant="outline"
                                                colorPalette="blue"
                                                onClick={ () => handleQuizSelect(item.id) }
                                            >選択</Button>
                                        </Table.Cell>
                                    </Table.Row>
                                )}
                            </For>
                        </Table.Body>
                    </Table.Root>
                )
            }
        </Box>
    );
});

export default Quiz;


{/* <Flex vertical gap={10}>
<Title level={3} center>クイズ一覧</Title>
<button onClick={ () => handleQuizSelect(46) }>TEST</button>
<Table columns="70% 15% 15%">
    <TableHeader>
        <TableRow>
            <TableCell>クイズ名</TableCell>
            <TableCell>正解率</TableCell>
            <TableCell>挑戦数</TableCell>
        </TableRow>
    </TableHeader>
    <TableBody gap={4}>
        {
            (quiz && quiz.length) && (
                quiz.map( q => (
                    <TableRow key={ q.id} clickable onClick={() => handleQuizSelect( q.id)}>
                        <TableCell>{ q.title}</TableCell>
                        <TableCell>{ q.avg_score}%</TableCell>
                        <TableCell>{ q.count}回</TableCell>
                    </TableRow>
                ))
            )
        }

        {
            (!quiz) && (
                <TableRow>
                    クイズがありません
                </TableRow>
            )
        }
    </TableBody>
</Table>
</Flex> */}