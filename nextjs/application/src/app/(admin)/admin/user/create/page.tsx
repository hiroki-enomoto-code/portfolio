'use client';
import { useState } from "react";
import axios from "axios";
import { Space, Button } from 'antd';
import TextField from '@/components/ui/TextField/TextField';
import { useForm, SubmitHandler, Controller, set } from "react-hook-form";

import { User } from "@/types/user";
import usePasswordGenerator from "@/hooks/usePasswordGenerator";
import useNotification from "@/hooks/useNotification";

import Breadcrumbs from '@/components/ui/Breadcrumbs/Breadcrumbs';

export default function Page() {

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({ shouldUnregister: false });
    const { generate } = usePasswordGenerator();

    const { success } = useNotification();

    const [loading, setLoading] = useState<boolean>(false);
    const [slackLoading, setSlackLoading] = useState<boolean>(false);

    const onCreate: SubmitHandler<any> = async (formValues, e: any) => {

        if (loading) return;

        const datas = {
            name_ja: formValues.name_ja,
            birthday: formValues.birthday,
            history: formValues.history,
            email: formValues.email,
            password: formValues.password,
            value: formValues.value,
            label: formValues.label,
        }

        setLoading(true);
        await axios.get(`/managed-api/sanctum/csrf-cookie`);
        await axios.post<User>(`/managed-api/admin/user/register`, datas)
            .then((res) => {
                console.log(res.data);
                reset();
                success({ message: 'ユーザーを作成しました' });
            })
            .catch((error) => {
                console.log(error);
                if(error.response.data.message){
                    success({ message: error.response.data.message });
                }
            })
            .finally(() => setLoading(false));
    }

    const onGetSlackUserData = async () => {

        const email = watch("email").trim();

        if (slackLoading || !email) return;

        setSlackLoading(true);
        await axios.get(`/managed-api/sanctum/csrf-cookie`);
        await axios.post(`/managed-api/admin/user/slack`, { email })
            .then((res) => {
                if (res.data && res.status === 200) {
                    setValue("name_ja", res.data.name_ja);
                    setValue("value", res.data.value);
                    setValue("label", res.data.label);
                }
            })
            .catch((error) => console.log(error))
            .finally(() => setSlackLoading(false));
    }

    const onGeneratePassword = () => {
        const password = generate(16);
        setValue("password", password);
    }

    const reset = () => {
        setValue("email", "");
        setValue("password", "");
        setValue("name_ja", "");
        setValue("value", "");
        setValue("label", "");
        setValue("history", "0000-00-00");
        setValue("birthday", "00-00");
    }

    return (
        <div className="">
            <Breadcrumbs data={ [
                { name: 'TOP', href: '/' },
                { name: 'ユーザー管理', href: '/admin/user' },
                { name: 'ユーザー作成' },
            ] }/>
            <form
                onSubmit={handleSubmit(onCreate)}
                style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '600px', margin: '0 auto' }}
            >

                <Space direction="vertical" style={{ width: '100%' }}>
                    <TextField
                        label="メールアドレス"
                        id="メールアドレス"
                        {...register("email", { required: true })}
                        placeholder="メールアドレスを入力"
                        error={errors.email && 'メールアドレスを入力してください'}
                    />
                    <Button
                        type="dashed"
                        htmlType="button"
                        loading={slackLoading}
                        onClick={onGetSlackUserData}
                    >Slack検索</Button>
                </Space>

                <Space direction="vertical" style={{ width: '100%' }}>
                    <TextField
                        label="パスワード(8文字以上)"
                        id="パスワード"
                        {...register("password", { required: true, minLength: 8 })}
                        placeholder="パスワードを入力"
                        error={errors.password && 'パスワードを入力してください'}
                    />
                    <Button
                        type="dashed"
                        htmlType="button"
                        onClick={onGeneratePassword}
                    >パスワード生成</Button>
                </Space>

                <TextField
                    label="Slack名"
                    id="Slack名"
                    {...register("label", { required: true })}
                    placeholder="日髙 直子 (ひだか なおこ)"
                    error={errors.label && 'Slack名を入力してください'}
                />

                <TextField
                    label="名前"
                    id="名前"
                    {...register("name_ja", { required: true })}
                    placeholder="日髙 直子"
                    error={errors.name_ja && '名前を入力してください'}
                />

                <TextField
                    label="Slack ID"
                    id="Slack ID"
                    {...register("value", { required: true })}
                    placeholder="U12345678"
                    error={errors.value && 'Slack IDを入力してください'}
                />

                <TextField
                    label="入社日(例: 2023-01-01)"
                    id="入社日"
                    {...register("history", { required: true, pattern: /^\d{4}-\d{2}-\d{2}$/ })}
                    placeholder="入社日を入力"
                    defaultValue="0000-00-00"
                    error={errors.history && '入社日を入力してください'}
                />

                <TextField
                    label="誕生日(例: 01-01)"
                    id="誕生日"
                    {...register("birthday", { required: true, pattern: /^\d{2}-\d{2}$/ })}
                    placeholder="誕生日を入力"
                    defaultValue="00-00"
                    error={errors.birthday && '誕生日を入力してください'}
                />

                <Button type="primary" htmlType="submit" loading={loading}>作成</Button>
            </form>
        </div>
    )
}