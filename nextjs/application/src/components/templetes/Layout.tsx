"use client";
import { ReactNode, memo } from "react";
import { NextPage } from 'next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { redirect } from 'next/navigation';

import '@/scss/style.scss';

import Header from "@/components/templetes/Header/Header";
import Main from "@/components/templetes/Main";
import Nickname from "@/components/templetes/Nickname/Nickname";
import Notification from "@/components/ui/Notification/Notification";

import { useData } from "@/context/DataContext";

const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
});

type Props = {
    children : ReactNode;
}

const Layout : NextPage<Props> = memo(({ children }) => {

	const { account, mode } = useData();
	const pathname = usePathname();

	if(
		pathname === '/register/' ||
		pathname === '/reset-password/' ||
		pathname === '/app/'
	){
		return (
			<html className={ mode } lang='ja' suppressHydrationWarning>
				<body>
					{ children }
					<Notification/>
				</body>
			</html>
		);
	}

	if(pathname === '/componets/'){
		return (
			<html className={ mode } lang='ja' suppressHydrationWarning>
				<body>
					<QueryClientProvider client={queryClient}>
						<Main>{children}</Main>
						<Notification/>
					</QueryClientProvider>
				</body>
			</html>
		)
	}

	if(!account){
		redirect('/app/');
	};

	
	if(account && (!account.nickname || !account.avatar) ){
		return (
			<html className={ mode } lang='ja' suppressHydrationWarning>
				<body>
					<Nickname/>
					<Notification/>
				</body>
			</html>
		)
	}

	return (
		<html className={ mode } lang='ja' suppressHydrationWarning>
            <body>
				<QueryClientProvider client={queryClient}>
					<Header/>
					<Main>{children}</Main>
					<Notification/>
				</QueryClientProvider>
			</body>
        </html>
	)
});

export default Layout;