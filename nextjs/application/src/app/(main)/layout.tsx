'use server'
import { cookies } from 'next/headers'
import authAxios from '@/lib/auth-axios';
import { DataProvider } from '@/context/DataContext';
import Layout from '@/components/templetes/Layout';
import { User } from '@/types/user';

export default async function RootLayout({ children }: {
    children: React.ReactNode,
}) {
    let account: User | null = null;
    let users: {[Key:number] : Pick<User, 'id' | 'mbti' | 'nickname' | 'avatar'>} = {};
    let mode: 'light' | 'dark' = 'light';

    const cookieStore = cookies();
    const cookieMode = (await cookieStore).get('mode');

    if(cookieMode && (cookieMode.value === 'dark') ){
        mode = 'dark';
    }

    await authAxios.get(`/managed-api/user`)
        .then((res) => {
            if (res.data && res.status === 200) {
                account = res.data;
            }
        })
        .catch((error) => {
            console.log(error);
        });

    console.log(account);

    await authAxios.get(`/managed-api/users`)
        .then((res) => {
            if (res.data && res.status === 200) {
                users = res.data;
            }
        })
        .catch((error) => {
            console.log(error);
        });

    return (
        <DataProvider
            _account={account}
            _mode={ mode }
            _users={users}
        >
            <Layout>
                {children}
            </Layout>
        </DataProvider>
    )
}