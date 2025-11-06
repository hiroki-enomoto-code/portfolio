import axios from 'axios'
import { cookies } from "next/headers";

// 環境変数からAPIのURLを取得し、未設定の場合はデフォルト値を使用
const API_BASE_URL = process.env.API_URL || 'https://switcha'

// カスタムaxiosインスタンスの作成
const authAxios = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Referer': API_BASE_URL
    }
})

// リクエストインターセプターを追加
authAxios.interceptors.request.use( async (config) => {
    const cookieStore = await cookies()

    // Cookieとxsrfトークンを設定
    config.headers.Cookie = cookieStore.toString()
    config.headers['X-XSRF-TOKEN'] = cookieStore.get('XSRF-TOKEN')?.value

    return config
})

export default authAxios