'use client'
import { use, useEffect, useState, useRef } from 'react'
import axios from 'axios';

import { QuizProps } from '@/types/quiz'
import { API_PATH } from '@/data'
import QuizEdit from '@/app/(main)/quiz/edit/QuizEdit';

type PageProps = {
    params: Promise<{
      id: string;
    }>;
};

export default function Page({ params }: PageProps) {

    const { id } = use(params);

    const isFirstRender = useRef(false);

    const [quiz, setQuiz] = useState<QuizProps | null>(null);
    const [isFetching, setIsFetching] = useState<boolean>(true);

    useEffect(() => {
        if(id && !isFirstRender.current){
            isFirstRender.current = true;
            (async () => {
                await axios.get(`${API_PATH}/quiz/edit/${ id }`)
                    .then( res => {
                        if (res.data && res.status === 200) {
                            setQuiz(res.data);
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
    },[id]);

    return (
        isFetching ? <div className="loading">Loading...</div> : <QuizEdit quiz={ quiz } />
    )
}