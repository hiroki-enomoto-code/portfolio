export const selectValueByObject = (name: any, obj: {}[], key: string, value: string): any => {
    const item = Object.values(obj).find((item: any) => item[key] === name);
    if (item) return item[value];
    return '-';
};

export const GetUniqueStr = (id: any = null) => {
    return new Date().getTime().toString(16) + "_" + (id ? id : '');
}

export const Autolink = (text: string) => {
    const regexp_url = /(https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+)/g;
    return text.replace(regexp_url, '<a href="$1" target="_blank">$1</a>');
}

export const FormatDate = (date, pattern = 'YYYY-MM-DD HH:mm:ss') =>{
    const d = new Date(date);

    // 無効な日付の場合はエラーを投げる
    if (isNaN(d.getTime())) {
        throw new Error('Invalid date provided');
    }

    // 各要素を取得し、必要に応じてゼロパディング
    const year = String(d.getFullYear());
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    // パターンに応じて置換
    return pattern
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

export const TimeAgo = (time: number) => {
    const timestamp = new Date().getTime();
    const diff = timestamp - time;

    const date = Math.floor(diff / (24 * 60 * 60 * 1000));

    if (date) {
        return `${date}日前`;
    } else {
        const hour = Math.floor(diff / (60 * 60 * 1000));
        if (hour) {
            return `${hour}時間前`;
        } else {
            const minute = Math.floor(diff / (60 * 1000));
            return `${minute}分前`;
        }
    }
}

export function* Range(start: number, end: number) {
    for (let i = start; i < end; i++) {
        yield i;
    }
}