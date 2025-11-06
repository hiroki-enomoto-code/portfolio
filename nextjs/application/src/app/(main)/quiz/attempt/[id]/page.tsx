"use client";
import { use, useEffect, useState, useRef } from 'react'
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import { useData } from "@/context/DataContext";
import { QuizAttempt, QuizProps } from '@/types/quiz'
import { API_PATH } from '@/data'

import Breadcrumbs from '@/components/ui/Breadcrumbs/Breadcrumbs';
import Avatar from '@/components/ui/Avatar/Avatar';
import Button from '@/components/ui/Button/Button';

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default function Page({ params }: PageProps) {

    const { id } = use(params);

    const { users } = useData();

    const isFirstRender = useRef(false);

    const [isFirstAttempt, setIsFirstAttempt] = useState<boolean>(true);
    const [quiz, setQuiz] = useState<QuizProps | null>(null);
    const [attempts, setAttempts] = useState<QuizAttempt[] | []>([]);
    const [firstAttemptResults, setFirstAttemptResults] = useState<QuizAttempt[] | []>([]);
    const [isFetching, setIsFetching] = useState<boolean>(true);

    useEffect(() => {
        if (id && !isFirstRender.current) {
            isFirstRender.current = true;
            (async () => {
                await axios.get<{ quiz: QuizProps, results: QuizAttempt[] }>(`${API_PATH}/quiz/attempt/${id}`)
                    .then(res => {
                        if (res.data && res.status === 200) {
                            setAttempts(res.data.results);
                            const firstAttempt = res.data.results.filter((item) => item.is_first_attempt === 1);
                            setFirstAttemptResults(firstAttempt);

                            setQuiz(res.data.quiz);
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    })
                    .finally(() => {
                        setIsFetching(false);
                    });
            })();
        }
    }, [id]);

    return (
        <div className="page-quiz-attempt">

            <Breadcrumbs
                data={[
                    { name: 'TOP', href: '/' },
                    { name: 'クイズ', href: '/quiz/' },
                    { name: 'クイズ結果' },
                ]}
                back={ `/quiz/` }
            />

            {isFetching && (
                <div className="flex justify-center items-center h-screen">
                    <div className="loading">Loading...</div>
                </div>
            )}

            {
                quiz && (
                    <>
                        <div className="page-quiz-attemptQuiz">
                            <div className="page-quiz-attemptQuiz_thumbnail">
                                <img src={quiz.thumbnail ? `/public/quiz/${quiz.id}/${quiz.thumbnail}` : `/images/quiz/quiz_default_thumbnail.jpg`} alt="" />
                            </div>
                            <div className="page-quiz-attemptQuiz_title">
                                {quiz.title}
                            </div>

                            <div className="page-quiz-attemptQuiz_button">
                                <Button size="m" href={`/quiz/${quiz.id}/`}>クイズに挑戦</Button>
                            </div>
                        </div>

                        <div className="page-quiz-attemptTab">
                            <div className="page-quiz-attemptTab_item">
                                <Button onClick={() => setIsFirstAttempt(true)}>初挑戦のみ</Button>
                            </div>
                            <div className="page-quiz-attemptTab_item">
                                <Button onClick={() => setIsFirstAttempt(false)}>すべて</Button>
                            </div>
                        </div>

                        <div className="page-quiz-attemptHead">
                            <div className="page-quiz-attemptHead_item">順</div>
                            <div className="page-quiz-attemptHead_item is-name">名前</div>
                            <div className="page-quiz-attemptHead_item">スコア</div>
                            <div className="page-quiz-attemptHead_item">問題/正解</div>
                        </div>

                        <AnimatePresence mode="wait">
                            {!isFirstAttempt ? (
                                attempts && (
                                    <motion.div
                                        key="profile-view"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="page-quiz-attemptList">
                                            {attempts.map((item: QuizAttempt, idx) => (
                                                <div className="page-quiz-attemptList_item" key={item.id}>
                                                    <div className="page-quiz-attemptList_rank">{idx + 1}位</div>
                                                    <div className="page-quiz-attemptList_user">
                                                        <Avatar size={30} src={(users[item.user_id] && users[item.user_id].avatar) ? `/public/avatar/${users[item.user_id].avatar!}` : ''} />
                                                        <p>{users[item.user_id] ? users[item.user_id].nickname : '---'}</p>
                                                    </div>
                                                    <div className="page-quiz-attemptList_score">
                                                        {item.score}%
                                                    </div>
                                                    <div className="page-quiz-attemptList_qa">
                                                        {item.question_count}/{item.answer_count}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )
                            ) : (
                                firstAttemptResults && (
                                    <motion.div
                                        key="profile-edit"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="page-quiz-attemptList">
                                            {firstAttemptResults.map((item: QuizAttempt, idx) => (
                                                <div className="page-quiz-attemptList_item" key={item.id}>
                                                    <div className="page-quiz-attemptList_rank">{idx + 1}位</div>
                                                    <div className="page-quiz-attemptList_user">
                                                        <Avatar size={30} src={(users[item.user_id] && users[item.user_id].avatar) ? `/public/avatar/${users[item.user_id].avatar!}` : ''} />
                                                        <p>{users[item.user_id] ? users[item.user_id].nickname : '---'}</p>
                                                    </div>
                                                    <div className="page-quiz-attemptList_score">
                                                        {item.score}%
                                                    </div>
                                                    <div className="page-quiz-attemptList_qa">
                                                        {item.question_count}/{item.answer_count}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )
                            )}
                        </AnimatePresence>
                    </>
                )
            }

        </div>
    )
}