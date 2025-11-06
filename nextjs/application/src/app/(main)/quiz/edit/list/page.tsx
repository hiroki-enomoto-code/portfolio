'use client'
import { useState, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';

import useQueryApi from '@/hooks/useQueryApi';
import { QuizListProps, QuizEditProps } from '@/types/quiz'
import { API_PATH, STATUS_TEXT } from '@/data'
import { FormatDate } from '@/utils';

import Breadcrumbs from '@/components/ui/Breadcrumbs/Breadcrumbs';
import Button from '@/components/ui/Button/Button';
import MoreHorizIcon from '@/components/icon/MoreHorizIcon';
import Popup from '@/components/ui/Popup';

const args = {
    page: 1,
    per_page: 20,
    orderby: 'created_at',
    order: 'desc',
}

export default function Page() {

    const quizEditListApi = useQueryApi<QuizListProps<QuizEditProps[]>>({ queryKey: ['quiz-edit-list'], url:`${API_PATH}/quiz/edit?${new URLSearchParams(args as any)}`});

    const popupRef = useRef<any>(null);
    const [popupId, setPopupId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleOpenPopup = (e, id) => {
        popupRef.current = e.currentTarget;
        setPopupId(id);
    }

    const handleDelete = async (id : number) => {
        setIsLoading(true);
        await axios.delete(`${API_PATH}/quiz/edit/${ id }`)
            .then((res) => {
                console.log(res.data);
                
                if (res.data && res.status === 200) {
                    const newData = quizEditListApi.data!.data.filter((item) => item.id !== id);
                    quizEditListApi.setQueryData({
                        ...quizEditListApi.data,
                        data: newData,
                    });
                }
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setPopupId(null);
                setIsLoading(false);
            });
    }

    return (
        <div className="page-quiz-edit-list">
            <Breadcrumbs data={ [
                { name: 'TOP', href: '/' },
                { name: 'クイズ', href: '/quiz/' },
                { name: 'クイズ作成一覧' },
            ] }/>
            <div className="table">
                <div className="tableHead">
                    <div className="tableHeadItem">名前</div>
                    <div className="tableHeadItem">ステータス</div>
                    <div className="tableHeadItem">問題数</div>
                    <div className="tableHeadItem">プレイ数</div>
                    <div className="tableHeadItem">正解率</div>
                    <div className="tableHeadItem"></div>
                </div>
                <div className="tableBody">
                    {
                        quizEditListApi.data && quizEditListApi.data.data && (
                            quizEditListApi.data.data.map((item: QuizEditProps) => (
                                <div className="tableBodyItem" key={item.id}>
                                    <div className="tableBodyItem_column is-title"><Link href={ `/quiz/${ item.id }/` }>{item.title}</Link></div>
                                    <div className="tableBodyItem_column">{ STATUS_TEXT[item.status] || '---' }</div>
                                    <div className="tableBodyItem_column">{item.question_count}</div>
                                    <div className="tableBodyItem_column">{item.count}</div>
                                    <div className="tableBodyItem_column">{item.avg_score}%</div>
                                    <div className="tableBodyItem_column">
                                        <Button onClick={ (e) => handleOpenPopup(e, item.id) } color="transparent">
                                            <MoreHorizIcon className="is-moreIcon"/>
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )
                    }
                    {quizEditListApi.isLoading && (
                        <div className="tableBodyItemLoading">
                            <div className="tableBodyItemLoadingText">Loading...</div>
                        </div>
                    )}
                    {quizEditListApi.isError && (
                        <div className="tableBodyItemError">
                            <div className="tableBodyItemErrorText">Error: {quizEditListApi.error.message}</div>
                        </div>
                    )}
                </div>
            </div>
            <Popup
                target={popupRef.current}
                isOpen={popupId !== null}
                onClose={() => setPopupId(null)}
            >
                <div className="page-quiz-edit-list-popup">
                    <Button href={ `/quiz/edit/${ popupId }` } color="transparent">
                        <div className="page-quiz-edit-list-popup_button">編集</div>
                    </Button>
                    <Button
                        onClick={ () => handleDelete(popupId!) }
                        color="transparent"
                        loading={isLoading}
                    >
                        <div className="page-quiz-edit-list-popup_button is-delete">ごみ箱</div>
                    </Button>
                </div>
            </Popup>
        </div>
    )
}