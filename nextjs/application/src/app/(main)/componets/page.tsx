'use client'
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion";

import { API_PATH } from '@/data';
import useQueryApi from '@/hooks/useQueryApi';
import { BeatProps } from '@/types/beat';
import { EmojiType } from '@/types/emoji';

import BeatItem from '@/components/templetes/beat/BeatItem/BeatItem';
import Button from '@/components/ui/Button/Button';
import Radio from '@/components/ui/Radio/Radio';
import Breadcrumbs from '@/components/ui/Breadcrumbs/Breadcrumbs';

const BeatItems: BeatProps[] = [
    {
        attachment: [],
        comments: 0,
        content: "1コメ",
        created_at: "2025-04-29T08:12:47.000000Z",
        id: 22,
        is_private: 0,
        reaction: { 22: [204] },
        reply: 15,
        status: 1,
        updated_at: "2025-05-04T04:30:15.000000Z",
        user_id: 204
    },
    {
        attachment: ["0dd7b9e04ca1220735c91e6ada4dee4d.jpg"],
        comments: 0,
        content: "3こめだよーーーん<div>3こめだよーーーん3こめだよーーーん3こめだよーーーん3こめだよーーーん3こめだよーーーん3こめだよーーーん3こめだよーーーん3こめだよーーーん3こめだよーーーん3こめだよーーーん3こめだよーーーん3こめだよーーーん3こめだよーーーん3こめだよーーーん3こめだよーーーん3こめだよーーーん</div>",
        created_at: "2025-04-29T08:12:47.000000Z",
        id: 22,
        is_private: 0,
        reaction: { 22: [204] },
        reply: 15,
        status: 1,
        updated_at: "2025-05-04T04:30:15.000000Z",
        user_id: 204
    }
];

export default function Page() {

    //const emojiApi = useQueryApi<EmojiType>({ queryKey: ['emoji'], url: `${API_PATH}/emoji` });
    const [result, setResult] = useState<{ answer_count: number; question_count: number; answer: { question: string; answer: string; result: string; isCollect: boolean }[]; rank: number; total: number }>({
        answer_count: 4,
        question_count: 5,
        answer: [
            {
                question: "日本の首都は？",
                answer: "東京",
                result: "正解",
                isCollect: true
            },
            {
                question: "2+3の計算結果は？",
                answer: "5",
                result: "正解",
                isCollect: true
            },
            {
                question: "富士山の標高は？",
                answer: "3000m",
                result: "不正解",
                isCollect: false
            },
            {
                question: "地球の衛星は？",
                answer: "月",
                result: "正解",
                isCollect: true
            }
        ],
        rank: 2,
        total: 10
    });

    const channelRef = useRef(null);

    // 時間を分:秒形式に変換
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <main id="page-componets" className="componets">

            <Breadcrumbs data={[
                { name: 'APP', href: '/app/' },
                { name: 'Beat', href: '/app/beat' },
            ]} />
        </main>
    )
}