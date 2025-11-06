'use server'
import { Suspense } from 'react';
import { DataProvider } from '@/context/DataContext';
import { ChakraProviders } from '@/provider/ChakraProviders';

import DefaultLayout from '@/components/templetes/DefaultLayout';

import '@/scss/default.scss';

export default async function RootLayout({ children }: {
    children: React.ReactNode,
}) {

    return (
        <DataProvider _account={null} _mode={'light'} _users={{}}>
            <DefaultLayout>
                <html className={'light'} lang='ja' suppressHydrationWarning>
                    <body>
                        <ChakraProviders>{children}</ChakraProviders>
                    </body>
                </html>
            </DefaultLayout>
        </DataProvider>
    )
}