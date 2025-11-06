'use client'
import React, { useState, useEffect, FC } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

import { STATUS_TEXT, API_PATH } from '@/data';
import { QuizProps, QuestionOptionProps, QuestionProps } from '@/types/quiz';
import FileUpload, { FileProps } from '@/components/customUi/FileUpload';

import Breadcrumbs from '@/components/ui/Breadcrumbs/Breadcrumbs';
import Button from '@/components/ui/Button/Button';
import TextField from '@/components/ui/TextField/TextField';
import Textarea from '@/components/ui/Textarea/Textarea';
import Radio from '@/components/ui/Radio/Radio';
import DeleteIcon from '@/components/icon/DeleteIcon';
import ArrowRightIcon from '@/components/icon/ArrowRightIcon';
import Swich from '@/components/ui/Swich/Swich';

const generateQuestion = (questionId: string, collectId: string): QuestionProps => {

    const options: QuestionOptionProps = [
        {
            text: '',
            id: collectId
        },
        {
            id: `${uuidv4()}-1`,
            text: '',
        },
    ]

    return {
        id: questionId,
        question: '',
        image: '',
        type: 'select',
        options,
        time: 20,
    }
}

type defaultValuesType = {
    answer: { [Key: string]: string };
    questions: QuestionProps[];
    images: { [Key: string]: FileProps };
    thumbnail: FileProps;
    status: 0 | 1 | 2 | null;
}

const generateQuestionValues = (quiz?: QuizProps, isParse = true): defaultValuesType => {
    const response: defaultValuesType = {
        answer: {},
        questions: [],
        images: {},
        thumbnail: {
            file: null,
            preview: null,
        },
        status: quiz ? quiz.status : null
    }

    if (quiz) {
        if (quiz.thumbnail) {
            response.thumbnail = {
                file: null,
                preview: `/public/quiz/${quiz.id}/${quiz.thumbnail}`,
            }
        }

        response.status = quiz.status;
        response.answer = typeof quiz.answer === 'string' ? JSON.parse(quiz.answer) : quiz.answer;

        response.questions = typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions;
        response.questions.forEach(question => {
            response.images[question.id] = {
                file: null,
                preview: question.image ? `/public/quiz/${quiz.id}/${question.image}` : null,
            }
        });
    } else {
        const firstId = `${uuidv4()}-0`;
        const collectId = `${uuidv4()}-0`;
        response.questions = [generateQuestion(firstId, collectId)];
        response.answer[firstId] = collectId;
        response.images[firstId] = {
            file: null,
            preview: null,
        }
    }

    return response;
}

const QuizEdit: FC<{ quiz: QuizProps | null }> = ({ quiz: _quiz = null }) => {

    const { control, register, handleSubmit, formState: { errors } } = useForm<any>({ shouldUnregister: false });

    const [quiz, setQuiz] = useState<QuizProps | null>(_quiz);
    const [questions, setQuestions] = useState<QuestionProps[]>([]);
    const [answer, setAnswer] = useState<{ [Key: string]: string | { [Key: string]: string } }>({});
    const [thumbnail, setThumbnail] = useState<FileProps | null>(null);
    const [status, setStatus] = useState<0 | 1 | 2 | null>(null);
    const [images, setImages] = useState<{ [Key: string]: FileProps }>({});
    const [isLoad, setIsLoad] = useState<'1' | '2' | ''>('');
    const [cooy, setCooy] = useState('');
    const [closeQIds, setCloseQIds] = useState<string[]>([]);

    const handleChangeCloseQIds = (id:string) => {
        if (closeQIds.includes(id)) {
            setCloseQIds(closeQIds.filter(qId => qId !== id));
        } else {
            setCloseQIds([...closeQIds, id]);
        }
    }

    const addQuestion = () => {
        const newId = `${uuidv4()}-0`;
        const collectId = `${uuidv4()}-0`;
        setQuestions([...questions, generateQuestion(newId, collectId)]);
        answer[newId] = collectId;
        images[newId] = {
            file: null,
            preview: null,
        }
        setImages({ ...images });
        setAnswer({ ...answer });
    }

    const onSubmit: SubmitHandler<any> = async (formValues, e: any) => {
        const formData = new FormData();

        formData.append('title', formValues.title);
        formData.append('description', formValues.description);
        formData.append('question_count', questions.length.toString());

        const status = e!.nativeEvent!.submitter!.value || 1;
        formData.append('status', status);

        if (thumbnail && thumbnail.file) {
            formData.append('thumbnail', thumbnail.file);
        }

        Object.entries(images).forEach(([key, image]) => {
            if (image.file) {
                formData.append(key, image.file);
            }
        })

        questions.forEach((question) => {

            if (formValues[`question-${question.id}`]) {
                question.question = formValues[`question-${question.id}`];
            }

            if (formValues[`time-${question.id}`]) {
                question.time = formValues[`time-${question.id}`];
            }

            if (question.type === 'input') {
                if (typeof answer[question.id] === 'object') {
                    Object.entries(answer[question.id]).forEach(([_id, _], idx) => {
                        if (formValues[`input-${question.id}-${_id}`]) {
                            answer[question.id][_id] = formValues[`input-${question.id}-${_id}`];
                            answer[question.id][_id] = answer[question.id][_id].replace(/[\s　]/g, '');
                        }
                    })
                }
            } else {
                question.options.forEach(option => {
                    if (formValues[`option-${question.id}-${option.id}`]) {
                        option.text = formValues[`option-${question.id}-${option.id}`];
                    }
                });

                if (formValues[`answer-${question.id}`]) {
                    answer[question.id] = formValues[`answer-${question.id}`];
                }
            }
        })

        formData.append('answer', JSON.stringify(answer));
        formData.append('questions', JSON.stringify(questions));

        setIsLoad(status);
        await axios.get(`${API_PATH}/sanctum/csrf-cookie`);
        await axios.post<QuizProps>(`${API_PATH}/quiz`, formData)
            .then((res) => {
                console.log(res.data);

                if (res.data && res.status === 200) {
                    setQuiz(res.data);
                    //URLを変更
                    window.history.pushState({}, '', `/quiz/edit/${res.data.id}`);
                }
            })
            .catch((error) => console.log(error))
            .finally(() => setIsLoad(''));
    }

    const onUpdate: SubmitHandler<any> = async (formValues, event: any) => {
        if (!quiz) return;

        const formData = new FormData();

        formData.append('_method', 'PUT');
        formData.append('title', formValues.title);
        formData.append('description', formValues.description);
        formData.append('thumbnail_name', (thumbnail && thumbnail.preview) ? thumbnail.preview : '');
        formData.append('question_count', questions.length.toString());

        const status = event!.nativeEvent!.submitter!.value || 1;
        formData.append('status', status);

        if (thumbnail && thumbnail.file) formData.append('thumbnail', thumbnail.file)

        questions.forEach((question) => {

            if (!images[question.id] || !images[question.id].preview) {
                question.image = '';
            }

            if (images[question.id] && images[question.id].file) {
                formData.append(question.id, images[question.id].file!);
            }

            if (formValues[`question-${question.id}`]) {
                question.question = formValues[`question-${question.id}`];
            }

            if (formValues[`time-${question.id}`]) {
                question.time = formValues[`time-${question.id}`];
            }

            if (question.type === 'input') {
                if (typeof answer[question.id] === 'object') {
                    Object.entries(answer[question.id]).forEach(([_id, _], idx) => {
                        if (formValues[`input-${question.id}-${_id}`]) {
                            answer[question.id][_id] = formValues[`input-${question.id}-${_id}`];
                            answer[question.id][_id] = answer[question.id][_id].replace(/[\s　]/g, '');
                        }
                    })
                }
            } else {
                question.options.forEach(option => {
                    if (formValues[`option-${question.id}-${option.id}`]) {
                        option.text = formValues[`option-${question.id}-${option.id}`];
                    }
                });

                if (formValues[`answer-${question.id}`]) {
                    answer[question.id] = formValues[`answer-${question.id}`];
                }
            }
        })
        formData.append('questions', JSON.stringify(questions));
        formData.append('answer', JSON.stringify(answer));

        setIsLoad(status);
        await axios.get(`${API_PATH}/sanctum/csrf-cookie`);
        await axios.post<QuizProps>(`${API_PATH}/quiz/edit/${quiz.id}`, formData)
            .then((res) => {
                console.log(res.data);
                if (res.data && res.status === 200) {
                    const quizObj = generateQuestionValues(res.data, false);
                    setQuestions(quizObj.questions);
                    setImages({ ...quizObj.images });
                    setThumbnail(quizObj.thumbnail);
                    setAnswer(quizObj.answer);
                    setStatus(quizObj.status);
                }
            })
            .catch((error) => console.log(error))
            .finally(() => setIsLoad(''));

    }

    const setQuestionObject = () => {
        const obj = JSON.parse(cooy);
        setQuestions(obj.quiz);
        setAnswer(obj.answers);
        setCooy('');
    }

    useEffect(() => {
        if (quiz) {
            const defaultValues = generateQuestionValues(quiz);
            setQuestions(defaultValues.questions);
            setAnswer(defaultValues.answer);
            setImages(defaultValues.images);
            setThumbnail(defaultValues.thumbnail);
            setStatus(defaultValues.status);
        } else {
            const defaultValues = generateQuestionValues(undefined);
            setQuestions(defaultValues.questions);
        }
    }, [quiz]);

    return (
        <div className="page-quiz-edit">
            <Breadcrumbs data={ [
                { name: 'TOP', href: '/' },
                { name: 'クイズ作成一覧', href: '/quiz/edit/list/' },
                { name: 'クイズ作成・編集' },
            ] }/>
            <form className="page-quiz-editForm" onSubmit={handleSubmit(!quiz ? onSubmit : onUpdate)}>

                <div className="page-quiz-editForm_inner">
                    <div className="page-quiz-editForm_box">
                        <div className="page-quiz-editForm_title">基本情報</div>
                        <div className="page-quiz-editForm_content">
                            <TextField
                                label="クイズのタイトル"
                                id="タイトル"
                                {...register("title", { required: true })}
                                placeholder="クイズのタイトルを入力"
                                defaultValue={quiz ? quiz.title : ''}
                                error={errors.title && 'クイズのタイトルを入力してください'}
                            />

                            <Textarea
                                label="クイズの説明"
                                id="description"
                                rows={5}
                                {...register("description", { required: false })}
                                placeholder="クイズの説明を入力"
                                defaultValue={quiz ? quiz.description : ''}
                                error={errors.description && 'クイズの説明を入力を入力してください'}
                            />

                            <div className="space-y-2">
                                <FileUpload label="クイズのサムネイル" onChange={file => setThumbnail(file)}>
                                    {(thumbnail && thumbnail.preview) ? (
                                        <>
                                            <div className="upload_preview">
                                                <img src={thumbnail.preview} alt="" />
                                            </div>
                                            <div className="upload_preview_delete">
                                                <Button onClick={() => setThumbnail(null)} color="transparent" type="button">
                                                    <DeleteIcon />
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="upload_button">画像追加</div>
                                    )}
                                </FileUpload>
                            </div>
                        </div>
                    </div>

                    {questions.map((question, idx) => (
                        <div id={question.id} key={question.id} className="page-quiz-editForm_box">
                            <div className="page-quiz-editFormHead">
                                <div className="page-quiz-editFormHead_left">
                                    <div className={ `page-quiz-editFormHead_toggle${ closeQIds.includes(question.id) ? ` is-close` : `` }` }>
                                        <Button onClick={ () => handleChangeCloseQIds(question.id) } type="button" color="transparent"><ArrowRightIcon/></Button>
                                    </div>
                                    <div className="page-quiz-editForm_title">問題 {idx + 1}</div>
                                </div>
                                <div className="page-quiz-editFormHead_deleteButton">
                                    <Button
                                        color="transparent"
                                        type="button"
                                        onClick={() => {
                                            delete images[question.id];
                                            delete answer[question.id];
                                            setQuestions(questions.filter(q => q.id !== question.id));
                                            setImages({ ...images });
                                            setAnswer({ ...answer });
                                        }}
                                    >
                                        <DeleteIcon />
                                    </Button>
                                </div>
                            </div>
                            <AnimatePresence>
                                {
                                    !closeQIds.includes(question.id) && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            exit={{ height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="page-quiz-editForm_content">
                                                <Textarea
                                                    label="問題文"
                                                    id="description"
                                                    rows={5}
                                                    {...register(`question-${question.id}`, { required: true })}
                                                    placeholder="問題文を入力"
                                                    defaultValue={question.question}
                                                    error={errors[`question-${question.id}`] && '問題文を入力してください'}
                                                />
                                                <FileUpload
                                                    label="問題画像"
                                                    onChange={file => {
                                                        images[question.id] = file;
                                                        setImages({ ...images });
                                                    }}
                                                >
                                                    {(images[question.id] && images[question.id].preview) ? (
                                                        <>
                                                            <div className="upload_preview">
                                                                <img src={images[question.id].preview!} alt="" />
                                                            </div>
                                                            <div className="upload_preview_delete">
                                                                <Button
                                                                    onClick={() => {
                                                                        delete images[question.id];
                                                                        setImages({ ...images });
                                                                    }}
                                                                    color="transparent"
                                                                    type="button"
                                                                >
                                                                    <DeleteIcon />
                                                                </Button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="upload_button">画像追加</div>
                                                    )}
                                                </FileUpload>

                                                <div className="">
                                                    <div className="title">
                                                        { (!question.type || question.type === 'select') ? '選択肢(※答えにチェックを入れてください)' : '答えを入力してください（複数可）' }
                                                        <Swich
                                                            checked={(question.type && question.type === 'input') ? true : false}
                                                            checkedChildren="選択形式"
                                                            unCheckedChildren="入力形式"
                                                            onChange={() => {
                                                                question.type = question.type === 'input' ? 'select' : 'input';
                                                                if (question.type === 'select') {
                                                                    answer[question.id] = '';
                                                                } else {
                                                                    answer[question.id] = { [`${uuidv4()}-${question.options.length}`]: '' };
                                                                }
                                                                setAnswer({ ...answer });
                                                            }}
                                                        />
                                                    </div>

                                                    {
                                                        (!question.type || question.type === 'select') ? (
                                                            <div className="select">
                                                                <Controller
                                                                    name={`answer-${question.id}`}
                                                                    control={control}
                                                                    rules={{ required: true }}
                                                                    defaultValue={answer[question.id] || ''}
                                                                    render={({ field }) => (
                                                                        <Radio.Group>
                                                                            {question.options.map((option, optionIdx) => (
                                                                                <div key={optionIdx}>
                                                                                    <div className="select-option">
                                                                                        <div className="select-option_radio">
                                                                                            <Radio
                                                                                                name={`answer-${question.id}`}
                                                                                                value={option.id}
                                                                                                onChange={value => field.onChange(value)}
                                                                                                checked={field.value === option.id}
                                                                                            />
                                                                                        </div>
                                                                                        <div className="select-option_text">
                                                                                            <TextField
                                                                                                defaultValue={option.text}
                                                                                                {...register(`option-${question.id}-${option.id}`, { required: true })}
                                                                                                placeholder={`選択肢 ${optionIdx + 1}`}
                                                                                                error={errors[`option-${question.id}-${option.id}`] && '選択肢を入力してください'}
                                                                                            />
                                                                                        </div>
                                                                                        <div className="select-option_delete">
                                                                                            <Button
                                                                                                color="transparent"
                                                                                                type='button'
                                                                                                onClick={() => {
                                                                                                    if (question.options.length === 2) return;
                                                                                                    question.options = question.options.filter(o => o.id !== option.id);
                                                                                                    field.onChange('');
                                                                                                    setQuestions([...questions]);
                                                                                                }}
                                                                                                className="h-8 w-8"
                                                                                            >
                                                                                                <DeleteIcon />
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </Radio.Group>
                                                                    )}
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        question.options.push({
                                                                            text: '',
                                                                            id: `${uuidv4()}-${question.options.length}`
                                                                        });
                                                                        setQuestions([...questions]);
                                                                    }}
                                                                >
                                                                    選択肢を追加
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="select">
                                                                {
                                                                    typeof answer[question.id] === 'object' && (
                                                                        Object.entries(answer[question.id]).map(([_id, text], _idx) => (
                                                                            <div key={_idx} className="select-option">
                                                                                <div className="select-option_text">
                                                                                    <TextField
                                                                                        defaultValue={answer[question.id][_id] || ''}
                                                                                        {...register(`input-${question.id}-${_id}`, { required: true })}
                                                                                    />
                                                                                </div>
                                                                                <div className="select-option_delete">
                                                                                    <Button
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            if (Object.keys(answer[question.id]).length === 1) return;
                                                                                            delete answer[question.id][_id];
                                                                                            setAnswer({ ...answer });
                                                                                        }}
                                                                                        className="h-8 w-8"
                                                                                    >
                                                                                        <DeleteIcon />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    )
                                                                }
                                                                <Button
                                                                    color="transparent"
                                                                    type="button"
                                                                    onClick={() => {
                                                                        answer[question.id][`${uuidv4()}-${Object.keys(answer[question.id]).length}`] = '';
                                                                        setAnswer({ ...answer });
                                                                    }}
                                                                >
                                                                    答えの追加
                                                                </Button>
                                                            </div>
                                                        )
                                                    }
                                                </div>

                                                <TextField
                                                    label="回答時間(20~60秒)"
                                                    type="number"
                                                    min={20}
                                                    max={60}
                                                    defaultValue={question.time}
                                                    {...register(`time-${question.id}`, { required: '回答時間を入力してください' })}
                                                    placeholder="回答時間を入力"
                                                />
                                            </div>
                                        </motion.div>
                                    )
                                }
                            </AnimatePresence>
                        </div>
                    ))}

                    <Button type="button" size="m" onClick={addQuestion} color="transparent">
                        問題を追加
                    </Button>
                </div>

                <div className="page-quiz-editFormSide">
                    <div className="">ステータス：{status ? STATUS_TEXT[status] : '作成中'}</div>
                    <div className="page-quiz-editFormSideSubmit">
                        <div className="page-quiz-editFormSideSubmit_button">
                            <Button
                                type="submit"
                                disabled={isLoad !== ''}
                                value={1}
                                loading={isLoad === '1'}
                            >
                                下書き保存
                            </Button>
                        </div>
                        <div className="page-quiz-editFormSideSubmit_button">
                            <Button
                                type="submit"
                                disabled={isLoad !== ''}
                                value={2}
                                loading={isLoad === '2'}
                            >
                                公開する
                            </Button>
                        </div>
                    </div>
                    {
                        quiz && (
                            <div className="page-quiz-editFormSide_preview"><Link href={ `/quiz/${ quiz.id }/?preview=1` } target="_blank" rel="noopener">プレビュー</Link></div>
                        )
                    }
                    <div className="page-quiz-editFormSideToc">
                        <div className="page-quiz-editFormSideToc_title"><Link href="#basic">基本情報</Link></div>
                        <div className="page-quiz-editFormSideTocList">
                            {
                                Object.entries(questions).map(([key, question], idx) => (
                                    <div key={key} className="page-quiz-editFormSideTocList_item"><Link href={`#${question.id}`}>問題 {idx + 1} : {question.question}</Link></div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default QuizEdit;