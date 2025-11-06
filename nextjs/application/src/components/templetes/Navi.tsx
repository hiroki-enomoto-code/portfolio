'use client'
import { FC, memo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';

import HomeIcon from '@/components/icon/HomeIcon';
import QuestionIcon from '@/components/icon/QuestionIcon';
import MessageIcon from '@/components/icon/MessageIcon';
import LetterIcon from '@/components/icon/LetterIcon';
import SettingIcon from '@/components/icon/SettingIcon';

const Navi: FC = memo(() => {

    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="m-Navi">
            <div className="m-NaviBox">
                <nav className="m-Navi_inner">
                    <Link onClick={ () => setActiveIndex(0) } href="/#" className={  `m-NaviItem${activeIndex === 0 ? ' active' : ''}` }>
                        <HomeIcon className="m-NaviItem_icon" />
                        <span className="text">HOME</span>
                    </Link>
                    <Link onClick={ () => setActiveIndex(1) } href="/#" className={  `m-NaviItem${activeIndex === 1 ? ' active' : ''}` }>
                        <QuestionIcon className="m-NaviItem_icon"/>
                        <span className="text">QUIZ</span>
                    </Link>
                    <Link onClick={ () => setActiveIndex(2) } href="/#" className={  `m-NaviItem${activeIndex === 2 ? ' active' : ''}` }>
                        <MessageIcon className="m-NaviItem_icon"/>
                        <span className="text">MESSAGE</span>
                    </Link>
                    <Link onClick={ () => setActiveIndex(3) } href="/#" className={  `m-NaviItem${activeIndex === 3 ? ' active' : ''}` }>
                        <LetterIcon className="m-NaviItem_icon"/>
                        <span className="text">LETTER</span>
                    </Link>
                    <Link onClick={ () => setActiveIndex(4) } href="/#" className={  `m-NaviItem${activeIndex === 4 ? ' active' : ''}` }>
                        <SettingIcon className="m-NaviItem_icon"/>
                        <span className="text">Settings</span>
                    </Link>
                    <div className="indicator"></div>
                </nav>
            </div>
        </div>
    );
});

export default Navi;