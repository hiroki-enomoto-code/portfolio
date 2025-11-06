'use client';
import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Space, Button, Modal } from 'antd';
import TextField from '@/components/ui/TextField/TextField';
import type { TableColumnsType } from 'antd';
import { useForm, SubmitHandler } from "react-hook-form";

import { User } from "@/types/user";
import Breadcrumbs from '@/components/ui/Breadcrumbs/Breadcrumbs';
import useNotification from "@/hooks/useNotification";

export default function Page() {

    const { control, register, handleSubmit, setValue, formState: { errors } } = useForm<any>({ shouldUnregister: false });
    const { success } = useNotification();

    const [users, setUsers] = useState<User[]>([]);
    const [updateUser, setUpdateUser] = useState<User | null>(null);
    const [updateLoading, setUpdateLoading] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

    const onSetUpdateUser = (user: User) => {
        setUpdateUser(user);
        setValue("name_ja", user.name_ja);
        setValue("birthday", user.birthday);
        setValue("history", user.history);
    }

    const columns: TableColumnsType = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 50,
        },
        {
            title: '名前',
            dataIndex: 'name_ja',
        },
        {
            title: '権限',
            dataIndex: 'auth',
            width: 80,
            sorter: {
                compare: (a, b) => a.auth - b.auth,
                multiple: 2,
            },
        },
        {
            title: '誕生日',
            dataIndex: 'birthday',
            width: 120,
            sorter: {
                compare: (a, b) => a.birthday - b.birthday,
                multiple: 2,
            },
        },
        {
            title: '入社日',
            dataIndex: 'history',
            width: 150,
            sorter: {
                compare: (a, b) => a.history - b.history,
                multiple: 1,
            },
        },
        {
            title: 'Action',
            width: 100,
            fixed: 'right',
            render: (_, user: any) => (
                <Space>
                    <Button onClick={() => onSetUpdateUser(user)} type="primary">編集</Button>
                </Space>
            ),
        },
    ];

    const onUpdate: SubmitHandler<any> = async (formValues, e: any) => {

        if (!updateUser || updateLoading) return;

        const datas = {
            name_ja: formValues.name_ja,
            birthday: formValues.birthday,
            history: formValues.history,
        }

        setUpdateLoading(true);
        await axios.get(`/managed-api/sanctum/csrf-cookie`);
        await axios.put<User>(`/managed-api/admin/user/${updateUser?.id}`, datas)
            .then((res) => {
                console.log(res.data);
            })
            .catch((error) => console.log(error))
            .finally(() => setUpdateLoading(false));
    }

    const onDelete = async (userId: number) => {
        if (deleteLoading) return;

        setDeleteLoading(true);
        await axios.get(`/managed-api/sanctum/csrf-cookie`);
        await axios.delete(`/managed-api/admin/user/${userId}`)
            .then((res) => {
                console.log(res.data);
                setUsers(users.filter(user => user.id !== userId));
                setUpdateUser(null);
                success({ message: 'ユーザーを削除しました' });
            })
            .catch((error) => console.log(error))
            .finally(() => setDeleteLoading(false));
    }

    useEffect(() => {
        axios.get(`/managed-api/admin/users`)
            .then((res) => {
                if (res.data && res.status === 200) {
                    setUsers(res.data);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    return (
        <div className="">
            <Breadcrumbs data={[
                { name: 'TOP', href: '/' },
                { name: 'ユーザー管理' },
            ]} />
            <Button href="/admin/user/create">ユーザー作成</Button>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                pagination={false}
            />
            <Modal
                open={!!updateUser}
                onOk={() => setUpdateUser(null)}
                onCancel={() => setUpdateUser(null)}
                title="編集"
                footer={null}
            >
                <form
                    onSubmit={handleSubmit(onUpdate)}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                    <TextField
                        label="名前"
                        id="名前"
                        {...register("name_ja", { required: true })}
                        placeholder="名前を入力"
                        error={errors.name_ja && '名前を入力してください'}
                    />

                    <TextField
                        label="入社日(例: 2023-01-01)"
                        id="入社日"
                        {...register("history", { required: true, pattern: /^\d{4}-\d{2}-\d{2}$/ })}
                        placeholder="入社日を入力"
                        error={errors.history && '入社日を入力してください'}
                    />

                    <TextField
                        label="誕生日(例: 01-01)"
                        id="誕生日"
                        {...register("birthday", { required: true, pattern: /^\d{2}-\d{2}$/ })}
                        placeholder="誕生日を入力"
                        error={errors.birthday && '誕生日を入力してください'}
                    />

                    <Space>
                        <Button type="primary" htmlType="submit" loading={updateLoading}>更新</Button>
                        <Button onClick={() => onDelete(updateUser!.id)} danger loading={deleteLoading}>削除</Button>
                        <Button onClick={() => setUpdateUser(null)}>キャンセル</Button>
                    </Space>
                </form>
            </Modal>
        </div>
    )
}