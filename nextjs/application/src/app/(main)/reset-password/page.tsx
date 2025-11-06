'use client'
import { useState } from 'react';
import { useSearchParams } from 'next/navigation'
import Link from 'next/link';
import axios from 'axios';
import { useForm, SubmitHandler } from "react-hook-form"

import { API_PATH } from '@/data';
import TextField from '@/components/ui/TextField/TextField';
import Button from '@/components/ui/Button/Button';
import Modal from '@/components/ui/Modal';
import useNotification from '@/hooks/useNotification';

export default function Page() {

    const searchParams = useSearchParams()
    const tk = searchParams.get('tk');

    const notification = useNotification();
    const { register, handleSubmit, formState: { errors } } = useForm<{ password:string, password_confirmation:string, email:string }>({ shouldUnregister: false });

    const [isLoad, setIsLoad] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const onSubmit:SubmitHandler<{ password:string, password_confirmation:string, email:string }> = async (data) => {

        try {
            setIsLoad(true);
            await axios.get(`${ API_PATH }/sanctum/csrf-cookie`);

            const request = {
                email: data.email,
                password: data.password,
                password_confirmation: data.password_confirmation,
                token : tk,
                reset : true
            }
            
            await axios.post(`${ API_PATH }/password/reset`, request)
            .then(res => {
                console.log(res);
                setIsComplete(true);
            })
            .catch(error => {
                console.log(error);
                
                if (error.response.status !== 409) throw error
            });

        } catch (error: any) {
            console.log(error.message);
            notification.success({
                message : error.message,
            });
        }finally{
            setIsLoad(false);
        }
	}
    
    return (
        <div id="page-register" className="page-register">
            <div className="page-register_inner">
                <div className="page-register_logo">
                    <img src="/images/logo.svg" />
                </div>

                <div className="page-registerForm">
                    <div className="page-registerForm_title">ユーザー登録</div>
                    <form action="" onSubmit={ handleSubmit(onSubmit) }>
                        <TextField
                            type="text"
                            label="メールアドレス"
                            id="email"
                            {...register("email", { required: "メールアドレスを入力してください" })}
                            error={ errors.email ? errors.email.message : null }
                        />
                        <TextField
                            type="password"
                            label="パスワード"
                            id="password"
                            {...register("password", { required: "パスワードを入力してください" })}
                            error={ errors.password ? errors.password.message : null }
                        />
                        <TextField
                            type="password"
                            label="パスワード (確認)"
                            id="password_confirmation"
                            {...register("password_confirmation", { required: "パスワードを入力してください" })}
                            error={ errors.password_confirmation ? errors.password_confirmation.message : null }
                        />
                        <Button type="submit" size="m" className="w-full" loading={ isLoad }>送信</Button>
                    </form>
                </div>
            </div>
            <Modal
                isOpen={ isComplete }
                onOpen={ () => {} }
            >
                <div className="page-registerComplete">
                    <div className="page-registerComplete_title">パスワードのリセットが完了しました。</div>
                    <Link href="app/?login">ログイン</Link>
                </div>
            </Modal>
        </div>
    )
}