"use client";
import { use, useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios';

import { QuizProps } from '@/types/quiz'
import { API_PATH } from '@/data'

import Breadcrumbs from '@/components/ui/Breadcrumbs/Breadcrumbs';
import Radio from '@/components/ui/Radio/Radio';
import Button from '@/components/ui/Button/Button';
import TextField from '@/components/ui/TextField/TextField';
import CrossIcon from '@/components/icon/CrossIcon';
import CircleIcon from '@/components/icon/CircleIcon';

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default function Page({ params }: PageProps) {

    const { id } = use(params);
    const searchParams = useSearchParams();
    const preview = searchParams.get('preview');

    const answer = useRef({});
    const isFirstRender = useRef(false);
    const questions = useRef<QuizProps['questions']>([]);
    const selected = useRef('');
    const audioRef = useRef<HTMLAudioElement>(null);

    const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
    const [currentQ, setCurrentQ] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [textFieldValue, setTextFieldValue] = useState<string>('');
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isLoad, setIsLoad] = useState<boolean>(false);
    const [result, setResult] = useState<{ answer_count: number; question_count: number; answer: { question: string; answer: string; result: string; isCollect: boolean }[]; rank: number; total: number }>({
        answer_count: 0,
        question_count: 0,
        answer: [],
        rank: 0,
        total: 0,
    });

    const [quiz, setQuiz] = useState<QuizProps | null>(null);
    const [isFetching, setIsFetching] = useState<boolean>(true);

    const startQuiz = () => {
        setGameState('playing');
        setIsTimerRunning(true);
    };

    const handleNextQuestion = () => {

        if (questions.current[currentQ].type && questions.current[currentQ].type === 'input') {

            let _textFieldValue = textFieldValue.trim();
            _textFieldValue = _textFieldValue.replace(/[\s　]/g, '');

            console.log('_textFieldValue', _textFieldValue);

            answer.current[questions.current[currentQ].id] = _textFieldValue || '';
        } else {
            answer.current[questions.current[currentQ].id] = selected.current || '';
        }

        setTextFieldValue('');
        selected.current = '';

        const nextQuestion = currentQ + 1;
        if (questions.current[nextQuestion]) {
            setTimeLeft(questions.current[nextQuestion].time);
            setCurrentQ(nextQuestion);
        } else {
            handleResult();
        }
    };

    const handleResult = async () => {
        setIsTimerRunning(false);
        setGameState('result');

        const data = {
            result: answer.current
        };

        setIsLoad(true);
        await axios.get(`${API_PATH}/sanctum/csrf-cookie`);
        await axios.post<any>(`${API_PATH}/quiz/result/${id}`, data)
            .then((res) => {
                console.log(res);
                
                if (res.data && res.status === 200) {
                    setResult(res.data);
                }
            })
            .catch((error) => console.log(error))
            .finally(() => setIsLoad(false));
    }

    useEffect(() => {
        if (!isTimerRunning) return;

        if(audioRef.current){
            audioRef.current.play().catch((error) => {
                console.error('Audio playback failed:', error);
            });
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleNextQuestion();
                    return questions.current[currentQ].time;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isTimerRunning, currentQ]);

    useEffect(() => {
        if (id && !isFirstRender.current) {
            isFirstRender.current = true;
            (async () => {
                let url = `${API_PATH}/quiz/${id}`;
                if (preview) {
                    url += `?preview=1`;
                }
                await axios.get(url)
                    .then(res => {
                        if (res.data && res.status === 200) {
                            questions.current = JSON.parse(res.data.questions as any)
                            setTimeLeft(questions.current[0].time);
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
    }, [id]);

    return (
        <div className="page-quiz-challenge">
            <Breadcrumbs data={ [
                { name: 'TOP', href: '/' },
                { name: 'クイズ一覧', href: '/quiz/' },
                { name: 'クイズ詳細' },
            ] }/>
            {isFetching && (
                <div className="flex justify-center items-center h-screen">
                    <div className="loading">Loading...</div>
                </div>
            )}

            {
                quiz && (
                    <>
                        {gameState === 'start' && (
                            <div className="page-quiz-challengeStart">
                                <div className="page-quiz-challengeStart_thumbnail">
                                    <img
                                        src={quiz.thumbnail ? `/public/quiz/${quiz.id}/${quiz.thumbnail}` : "/images/quiz/quiz_default_thumbnail.jpg"}
                                        alt={quiz.title}
                                        className="w-full h-64 object-cover rounded-t-lg"
                                        onError={e => e.currentTarget.src = "/images/quiz/quiz_default_thumbnail.jpg"}
                                    />
                                </div>
                                <div className="page-quiz-challengeStart_title">{quiz.title}</div>
                                <p className="page-quiz-challengeStart_description">{quiz.description}</p>
                                <div className="page-quiz-challengeStart_counts">
                                    <div>
                                        全{quiz.question_count}問
                                    </div>
                                </div>
                                <div className="page-quiz-challengeStart_startButton">
                                    <Button size="m" onClick={startQuiz} className="w-full">
                                        スタート
                                    </Button>
                                </div>
                            </div>
                        )}

                        {gameState === 'playing' && (
                            <div className="page-quiz-challengePlaying">
                                <div className="page-quiz-challengePlaying_title">{quiz.title}</div>

                                <div className="page-quiz-challengePlaying_qCount">
                                    問題 {currentQ + 1} / 全{quiz.question_count}問
                                </div>

                                <div className="page-quiz-challengePlaying_timer">
                                    <span>{timeLeft}</span>秒
                                </div>

                                <div className="page-quiz-challengePlayingBox">
                                    {
                                        questions.current[currentQ].image && (
                                            !questions.current[currentQ].image.includes('.mp3') ? (
                                                <div className="page-quiz-challengePlaying_image">
                                                    <img
                                                        src={`/public/quiz/${quiz.id}/${questions.current[currentQ].image}`}
                                                        className=""
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="page-quiz-challengePlaying_musicThumb">
                                                        <img src="/images/quiz/quiz_music.jpg"/>
                                                    </div>
                                                    <div className="">
                                                        <audio
                                                            ref={audioRef}
                                                            src={`/public/quiz/${quiz.id}/${questions.current[currentQ].image}`}
                                                            loop
                                                            // onLoadedMetadata={ e => console.log(e) }
                                                            // onEnded={() => setIsPlaying(false)}
                                                            // onPlay={() => setIsPlaying(true)}
                                                        />
                                                    </div>
                                                </>
                                            )
                                        )
                                    }
                                    <div className="page-quiz-challengePlaying_question">{questions.current[currentQ].question}</div>
                                    <div className="page-quiz-challengePlaying_answer">
                                        {
                                            (questions.current[currentQ].type && questions.current[currentQ].type === 'input') ? (
                                                <div className="">
                                                    <TextField
                                                        onChange={e => setTextFieldValue(e.target.value)}
                                                        value={textFieldValue}
                                                        placeholder="回答を入力してください"
                                                    />
                                                </div>
                                            ) : (
                                                <Radio.Group>
                                                    {questions.current[currentQ].options.map(option => (
                                                        <Radio
                                                            key={option.id}
                                                            name="answer"
                                                            value={option.id}
                                                            label={option.text}
                                                            onChange={value => selected.current = value.target.value}
                                                            disabled={false}
                                                            error={null}
                                                        />
                                                    ))}
                                                </Radio.Group>
                                            )
                                        }
                                    </div>
                                    <div className="page-quiz-challengePlaying_button">
                                        <Button type="button" size="m" onClick={handleNextQuestion} className="w-full" disabled={selected.current ? false : true}>{currentQ < quiz.question_count - 1 ? '次へ' : '結果を見る'}</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {gameState === 'result' && (
                            <div className="page-quiz-challengeResult">
                                <div className="page-quiz-challengeResult_title">クイズ結果</div>

                                <div className="page-quiz-challengeResult_attempt">
                                    <Button href={ `/quiz/attempt/${ quiz.id }/` } size="m">みんなの結果を見る</Button>
                                </div>

                                <div className="page-quiz-challengeResult_answer">{result.question_count}問中 / {result.answer_count}問正解</div>
                                <div className="page-quiz-challengeResult_rank">順位: {result.rank}位/{result.total}人中</div>

                                <div className="page-quiz-challengeResultList">
                                    {result.answer.map((obj, idx) => (
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
                        )}
                    </>
                )
            }

        </div>
    )
}