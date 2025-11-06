import { useCallback } from 'react';

function usePasswordGenerator() {

    const getRandomChar = useCallback((chars) => {
        return chars.charAt(Math.floor(Math.random() * chars.length));
    }, []);

    const shuffleString = useCallback((str) => {
        const arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    }, []);

    const generate = useCallback((length = 12) => {
        // 最小長を8文字に設定
        if (length < 8) {
            length = 8;
        }

        // 使用する文字セット
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?~`/\\';

        // 全ての文字を結合
        const allChars = lowercase + uppercase + numbers + symbols;

        let newPassword = '';

        // 各カテゴリから最低文字数を含めることを保証
        newPassword += getRandomChar(lowercase);  // 小文字1文字以上
        newPassword += getRandomChar(uppercase);  // 大文字1文字以上
        newPassword += getRandomChar(numbers);    // 数字1文字以上

        // 記号を2文字以上含める
        for (let i = 0; i < 2; i++) {
            newPassword += getRandomChar(symbols);
        }

        // 残りの文字をランダムに生成
        for (let i = 5; i < length; i++) {
            newPassword += getRandomChar(allChars);
        }

        // パスワードの文字をシャッフル
        const finalPassword = shuffleString(newPassword);

        return finalPassword;
    }, [getRandomChar, shuffleString]);

    return { generate };
}

export default usePasswordGenerator;