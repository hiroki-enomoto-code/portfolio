import mysql, { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';
import { QuizProps } from './types';

// クイズデータの型定義
interface Quiz extends RowDataPacket {
    id: number;
    title: string;
    question: string;
    options: string;
    answer: string;
    category?: string;
    difficulty?: string;
    created_at?: Date;
    updated_at?: Date;
}

interface DatabaseConfig {
    host: string;
    user: string;
    password: string;
    port: number;
    database: string;
    waitForConnections: boolean;
    connectionLimit: number;
    queueLimit: number;
}

const dbConfig: DatabaseConfig = {
    host: process.env.DB_HOST || '172.16.249.69',
    user: process.env.DB_USERNAME || 'office_tool',
    password: process.env.DB_PASSWORD || 'YvPQEGWmDDr7b',
    // host: process.env.DB_HOST || 'localhost',
    // user: process.env.DB_USERNAME || 'root',
    // password: process.env.DB_PASSWORD || 'password',
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_DATABASE || 'dev_office_tool',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};


const pool: Pool = mysql.createPool(dbConfig);

class Database {
    
    public static async getAllQuizzes(): Promise<Quiz[]> {
        const connection: PoolConnection = await pool.getConnection();
        try {
            const [rows] = await connection.execute<Quiz[]>('SELECT * FROM quiz_tbl ORDER BY id');
            return rows;
        } finally {
            connection.release();
        }
    }

    public static async getQuizById(id: number): Promise<QuizProps | null> {
        const connection: PoolConnection = await pool.getConnection();
        try {
            const [rows] = await connection.execute('SELECT * FROM quiz_tbl WHERE id = ?', [id]);
            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    public static async query<T extends RowDataPacket>(sql: string, params: any[] = []): Promise<T[]> {
        const connection: PoolConnection = await pool.getConnection();
        try {
            const [rows] = await connection.execute<T[]>(sql, params);
            return rows;
        } finally {
            connection.release();
        }
    }


    public static async queryOne<T extends RowDataPacket>(sql: string, params: any[] = []): Promise<T | null> {
        const connection: PoolConnection = await pool.getConnection();
        try {
            const [rows] = await connection.execute<T[]>(sql, params);
            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    public static async execute(sql: string, params: any[] = []): Promise<mysql.ResultSetHeader> {
        const connection: PoolConnection = await pool.getConnection();
        try {
            const [result] = await connection.execute<mysql.ResultSetHeader>(sql, params);
            return result;
        } finally {
            connection.release();
        }
    }


    // トランザクション
    public static async testConnection(): Promise<boolean> {
        try {
            const connection: PoolConnection = await pool.getConnection();
            await connection.ping();
            connection.release();
            return true;
        } catch (error: any) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }

    public static async closePool(): Promise<void> {
        await pool.end();
    }
}

export default Database;