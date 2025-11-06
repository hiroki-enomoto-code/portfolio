"use client";
import { motion } from "framer-motion";

import useQueryApi from '@/hooks/useQueryApi';
import { API_PATH } from '@/data';
import { QuizListProps, QuizProps } from '@/types/quiz';

import Breadcrumbs from '@/components/ui/Breadcrumbs/Breadcrumbs';
import QuizListItem from '@/app/(main)/quiz/QuizListItem';

const args = {
    page: 1,
    per_page: 20,
    orderby: 'created_at',
    order: 'desc',
}

export default function Page() {

    const quizAPi = useQueryApi<QuizListProps<QuizProps[]>>({ queryKey:['quiz'], url: `${API_PATH}/quiz/?${new URLSearchParams(args as any)}` });

    console.log(quizAPi);

    return (
        <>
            <div className="page-quiz page-quiz-top">
                <Breadcrumbs data={ [
                    { name: 'TOP', href: '/' },
                    { name: 'クイズ' },
                ] }/>
                
                {
                    quizAPi.isFetching && <div className="loading">Loading...</div>
                }

                {
                    (quizAPi.status === 'success' && quizAPi.data && quizAPi.data.data) && (
                        <div className="page-quizList">
                            {
                                quizAPi.data.data.map((quiz) => (
                                    <motion.div key={ quiz.id } className="page-quizList_item">
                                        <QuizListItem quiz={ quiz } />
                                    </motion.div>
                                ))
                            }
                        </div>
                    )
                }
            </div>
        </>
    )
}