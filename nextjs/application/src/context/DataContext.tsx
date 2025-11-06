'use client'
import { useState } from 'react';
import { User } from '@/types/user';
import { NotificationProps } from '@/components/ui/Notification/Notification';
import { createContext, useContext } from 'react';

// 型定義
interface ContextData {
    account: User | null;
    setAccount: (account: User | null) => void;
    users: {[Key:number] : Pick<User, 'id' | 'mbti' | 'nickname' | 'avatar'>};
    mode : 'light' | 'dark';
    setMode: (mode: 'light' | 'dark') => void;
    notification: NotificationProps[];
    setNotification: (notification: NotificationProps, isDelete?: boolean) => void;
    chatSession : {
        id: string;
        name: string;
        character: number;
    } | null;
    setChatSession: (session: { id: string; name: string; character: number }) => void;
}

const DataContext = createContext<ContextData | null>(null);

export function DataProvider({
    children,
    _account,
    _users,
    _mode,
}: {
    children: React.ReactNode;
    _account: User | null;
    _users: {[Key:number] : Pick<User, 'id' | 'mbti' | 'nickname' | 'avatar'>};
    _mode: 'light' | 'dark';
}) {
    const [account, setAccount] = useState<User| null>(_account);
    const [mode, setMode] = useState<'light' | 'dark'>(_mode);
    const [notification, setNotification] = useState<NotificationProps[]>([]);
    const [chatSession, setChatSession] = useState<{ id: string; name: string; character: number }|null>(null);

    const handleNotification = (notification: NotificationProps, isDelete: boolean = false) => {
        if(isDelete){
            setNotification((prev) => prev.filter((item) => item.id !== notification.id));
        }else{
            setNotification((prev) => [...prev, notification]);
        }
    }

    return (
        <DataContext.Provider value={{
            account,
            setAccount,
            users : _users,
            mode,
            setMode,
            notification,
            setNotification : handleNotification,
            chatSession,
            setChatSession
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === null) {
      throw new Error('useData must be used within a DataProvider');
    }
    return context;
}