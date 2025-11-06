import Head from 'next/head';

const CommonMeta = ({ title = "ACCESS NAVI"}) => {
    return (
        <Head>
            <title>{title}</title>
            <link rel="shortcut icon" href="/favicon.ico" type="image/vnd.microsoft.icon" />
        </Head>
    );
};

export default CommonMeta;