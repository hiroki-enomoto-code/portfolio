"use client";
import { useEffect, useState, useRef } from 'react'
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import { QuizAttempt } from '@/types/quiz'
import { API_PATH } from '@/data'

import Breadcrumbs from '@/components/ui/Breadcrumbs/Breadcrumbs';
import Button from '@/components/ui/Button/Button';
import Modal from '@/components/ui/Modal';
import CircleIcon from '@/components/icon/CircleIcon';
import CrossIcon from '@/components/icon/CrossIcon';

export default function Page() {

    const isFirstRender = useRef(false);

    const [isFirstAttempt, setIsFirstAttempt] = useState<boolean>(false);
    const [attempts, setAttempts] = useState<QuizAttempt[] | []>([]);
    const [firstAttempts, setFirstAttempts] = useState<QuizAttempt[] | []>([]);
    const [isFetching, setIsFetching] = useState<boolean>(true);
    const [openAttempt, setOpenAttempt] = useState<QuizAttempt | null>(null);

    useEffect(() => {
        if (!isFirstRender.current) {
            isFirstRender.current = true;
            (async () => {
                await axios.get<QuizAttempt[]>(`${API_PATH}/quiz/attempt`)
                    .then(res => {
                        console.log(res);
                        if (res.data && res.status === 200) {
                            setAttempts(res.data);
                            const firstAttempt = res.data.filter((item) => item.is_first_attempt === 1);
                            setFirstAttempts(firstAttempt);
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
    }, []);

    return (
        <div className="page-quiz-attempt">

            <Breadcrumbs
                data={[
                    { name: 'TOP', href: '/' },
                    { name: 'クイズ', href: '/quiz/' },
                    { name: 'マイチャレンジ' },
                ]}
                back={`/quiz/`}
            />

            {isFetching && (
                <div className="flex justify-center items-center h-screen">
                    <div className="loading">Loading...</div>
                </div>
            )}

            {
                (attempts && firstAttempts) && (
                    <>
                        <div className="page-quiz-attemptTab">
                            <div className="page-quiz-attemptTab_item">
                                <Button onClick={() => setIsFirstAttempt(true)}>初挑戦のみ</Button>
                            </div>
                            <div className="page-quiz-attemptTab_item">
                                <Button onClick={() => setIsFirstAttempt(false)}>すべて</Button>
                            </div>
                        </div>

                        <div className="page-quiz-attemptHead is-myattempt">
                            <div className="page-quiz-attemptHead_item is-name">クイズ名</div>
                            <div className="page-quiz-attemptHead_item">スコア</div>
                            <div className="page-quiz-attemptHead_item">問題/正解</div>
                            <div className="page-quiz-attemptHead_item">詳細</div>
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
                                            {attempts.map((item: QuizAttempt) => (
                                                <div className="page-quiz-attemptList_item is-myattempt" key={item.id}>
                                                    <div className="page-quiz-attemptList_title">{item.quiz?.title}</div>
                                                    <div className="page-quiz-attemptList_score">
                                                        {item.score}%
                                                    </div>
                                                    <div className="page-quiz-attemptList_qa">
                                                        {item.question_count}/{item.answer_count}
                                                    </div>
                                                    <div className="page-quiz-attemptList_result">
                                                        { item.snapshot && <Button onClick={ () => setOpenAttempt(item) }>確認</Button> }
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )
                            ) : (
                                firstAttempts && (
                                    <motion.div
                                        key="profile-edit"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="page-quiz-attemptList">
                                            {firstAttempts.map((item: QuizAttempt) => (
                                                <div className="page-quiz-attemptList_item is-myattempt" key={item.id}>
                                                    <div className="page-quiz-attemptList_rank">{item.quiz?.title}</div>
                                                    <div className="page-quiz-attemptList_score">
                                                        {item.score}%
                                                    </div>
                                                    <div className="page-quiz-attemptList_qa">
                                                        {item.question_count}/{item.answer_count}
                                                    </div>
                                                    <div className="page-quiz-attemptList_result">
                                                        <Button>確認</Button>
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

            <Modal isOpen={ openAttempt ? true : false } onOpen={() => setOpenAttempt(null)}>
                <div className="page-quiz-attempt_modal">
                    <div className="page-quiz-challengeResultList">
                        { openAttempt?.snapshot?.map((obj, idx) => (
                            <div key={idx} className={`page-quiz-challengeResultList_item ${obj.isCollect ? 'is-collect' : 'is-incollect'}`}>
                                <div className="page-quiz-challengeResultList_q"><span>{idx + 1}. </span>{obj.question}</div>
                                <div className="page-quiz-challengeResultList_icon">
                                    { obj.isCollect ? <CircleIcon/> : <CrossIcon/> }
                                </div>
                                <p className="page-quiz-challengeResultList_answer"><span className="text-bold">回答: </span>{obj.result}</p>
                                <p className="page-quiz-challengeResultList_correct"><span className="text-bold">正解: </span>{obj.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

        </div>
    )
}