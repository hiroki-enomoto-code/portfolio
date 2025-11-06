"use client";
import { ReactNode, memo } from "react";
import { NextPage } from 'next';
import { redirect } from 'next/navigation';

import '@/scss/style.scss';

import Header from "@/components/templetes/Header/Header";
import Main from "@/components/templetes/Main";
import Notification from "@/components/ui/Notification/Notification";

import { useData } from "@/context/DataContext";

type Props = {
    children : ReactNode;
}

const Layout : NextPage<Props> = memo(({ children }) => {

	const { account, mode } = useData();

	if(!account || account.auth < 3) {
		redirect('/app/');
	};

	return (
		<html className={ mode } lang='ja' suppressHydrationWarning>
            <body>
				<Header/>
				<Main>{children}</Main>
				<Notification/>
			</body>
        </html>
	)
});

export default Layout;