import React, { FC, useState, useEffect, useRef } from 'react';

const getRandomChar = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?/';
    return chars.charAt(Math.floor(Math.random() * chars.length));
};

type Props = {
    customText?: string;
    speed?: number; // タイピング速度
    scrambleSpeed?: number; // スクランブル速度
    scrambleDuration?: number; // スクランブルの持続時間
    pause? : boolean;
    onComplete?: () => void; // タイピング完了時のコールバック
};

const ScrambledTypewriterText: FC<Props> = ({ customText, speed = 20, scrambleSpeed = 30, scrambleDuration = 20, pause = false, onComplete = null }) => {
    const [text, setText] = useState('');
    const [displayedChars, setDisplayedChars] = useState<any>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const typeIntervalRef = useRef<any>(null);

    // スクランブル中の文字を追跡
    const scramblingCharsRef = useRef({});

    useEffect(() => {
        setText(customText || 'テキストを入力してください。');
        resetTypewriter();
    }, [customText]);

    // 一文字追加する処理
    useEffect(() => {
        if (!pause && text && currentIndex < text.length) {
            typeIntervalRef.current = setInterval(() => {
                const newChar = {
                    targetChar: text[currentIndex],
                    currentChar: text[currentIndex],
                    isScrambling: true,
                    scrambleCount: 0
                };

                setDisplayedChars(prev => [...prev, newChar]);
                setCurrentIndex(prev => prev + 1);

                // この文字のスクランブルを開始
                const charIndex = currentIndex;
                scramblingCharsRef.current[charIndex] = true;

                // スクランブル処理のためのインターバル
                const scrambleInterval = setInterval(() => {
                    if (!scramblingCharsRef.current[charIndex]) {
                        clearInterval(scrambleInterval);
                        return;
                    }

                    setDisplayedChars(prev => {
                        const newDisplayed = [...prev];
                        if (newDisplayed[charIndex]) {

                            // スクランブルカウントが上限に達したら、正しい文字に固定
                            if (newDisplayed[charIndex].scrambleCount >= scrambleDuration) {
                                newDisplayed[charIndex] = {
                                    ...newDisplayed[charIndex],
                                    currentChar: newDisplayed[charIndex].targetChar,
                                    isScrambling: false
                                };
                                scramblingCharsRef.current[charIndex] = false;
                            } else {
                                // ランダムな文字に変更
                                newDisplayed[charIndex] = {
                                    ...newDisplayed[charIndex],
                                    currentChar: getRandomChar(),
                                    scrambleCount: newDisplayed[charIndex].scrambleCount + 1
                                };
                            }
                        }
                        return newDisplayed;
                    });
                }, scrambleSpeed);

            }, speed);
        } else if (typeIntervalRef.current) {
            clearInterval(typeIntervalRef.current);
            if(onComplete) onComplete();
        }

        return () => {
            if (typeIntervalRef.current) {
                clearInterval(typeIntervalRef.current);
            }
        };
    }, [text, currentIndex, pause, speed, scrambleSpeed, scrambleDuration]);

    const resetTypewriter = () => {
        if (typeIntervalRef.current) {
            clearInterval(typeIntervalRef.current);
        }

        // すべてのスクランブル処理を停止
        Object.keys(scramblingCharsRef.current).forEach(key => {
            scramblingCharsRef.current[key] = false;
        });

        setDisplayedChars([]);
        setCurrentIndex(0);
        scramblingCharsRef.current = {};
    };

    // 表示すべき文字を整形
    const formatDisplayedText = () => {
        return displayedChars.map((char, index) => {
            if (char.targetChar === '\n') {
                return <br key={index} />;
            }

            return (
                <span
                    key={index}
                    className={`char ${char.isScrambling ? 'scrambling' : 'fixed'}`}
                >
                    {char.currentChar}
                </span>
            );
        });
    };

    return (
        <div className="typewriter-text">
            {formatDisplayedText()}
        </div>
    );
};

export default ScrambledTypewriterText;