import React, { useState, useEffect, useRef } from 'react';

const TypewriterText = ({ text, speed = 50 }) => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const intervalRef = useRef<any>(null);

    // テキストを一文字ずつ表示する
    useEffect(() => {
        if (text && currentIndex < text.length) {
            intervalRef.current = setInterval(() => {
                setDisplayText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);
        } else if (currentIndex >= text.length && intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [text, currentIndex, speed]);

    // テキスト表示をリセットする
    const resetTypewriter = () => {
        setDisplayText('');
        setCurrentIndex(0);
    };

    // スピードを変更する
    const changeSpeed = (newSpeed) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        speed = newSpeed;

        if (currentIndex < text.length) {
            intervalRef.current = setInterval(() => {
                setDisplayText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);
        }
    };

    return (
        <div className="typewriter-container" style={{ color: 'white', fontSize: '20px' }}>
            <div className="typewriter-text">
                {displayText.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                        {line}
                        {index < displayText.split('\n').length - 1 && <br />}
                    </React.Fragment>
                ))}
                <span className="cursor">|</span>
            </div>
            <div className="controls">
                <button onClick={resetTypewriter}>リセット</button>
                <button onClick={() => changeSpeed(speed * 0.5)}>速く</button>
                <button onClick={() => changeSpeed(speed * 2)}>遅く</button>
            </div>
        </div>
    );
};

export default TypewriterText;