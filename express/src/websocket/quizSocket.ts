import { Socket } from 'socket.io';
import shared from '../shared';
import Database from '../database';


import {
    ServerToClientEvents,
    ClientToServerEvents,
    QuizProps,
    QuestionProps,
} from '../types';

type QuizType = Omit<QuizProps, 'answer' | 'created_at' | 'updated_at' | 'status' | 'create_user' | 'questions'> & {
    create_user: string;
    status: 'join' | 'countdown' | 'active' | 'end';
    countdown: number;
    currentQ : QuestionProps | null;
    currentQIndex : number | null;
}

const TEST_QUIZ_DATA : QuizProps = {
    id: 34,
    title: 'ちびまる子ちゃんクイズ',
    description: '',
    thumbnail: '',
    questions: [
        {
            id: 'b291f4a5-7e32-4cf1-9f8a-b2a8d8e9c001',
            time: 20,
            image: '',
            options: [{ id: 'opt1-b291', text: 'さくらももこ' }, { id: 'opt2-b291', text: 'まる子' }, { id: 'opt3-b291', text: 'ちびまる子' }],
            question: 'まる子の本名は何でしょうか？'
        },
        {
            id: 'b291f4a5-7e32-4cf1-9f8a-b2a8d8e9c002',
            time: 20,
            image: '',
            options: [{ id: 'opt1-b292', text: 'さくらももこ' }, { id: 'opt2-b292', text: 'まる子' }, { id: 'opt3-b292', text: 'ちびまる子' }],
            question: 'まる子の通っている小学校のクラスは何組でしょうか？'
        },
        // {
        //   id: 'b291f4a5-7e32-4cf1-9f8a-b2a8d8e9c003',
        //   time: '30',
        //   image: '',
        //   options: [{ id: 'opt1-b291', text: 'さくらももこ'}, {id: 'opt2-b291', text: 'まる子'}, {id: 'opt3-b291', text: 'ちびまる子'}],
        //   question: 'まる子の好きなお菓子といえば？'
        // },
        // {
        //   id: 'b291f4a5-7e32-4cf1-9f8a-b2a8d8e9c004',
        //   time: '30',
        //   image: '',
        //   options: [{ id: 'opt1-b291', text: 'さくらももこ'}, {id: 'opt2-b291', text: 'まる子'}, {id: 'opt3-b291', text: 'ちびまる子'}],
        //   question: 'まる子の父・ヒロシの職業は？'
        // },
        // {
        //   id: 'b291f4a5-7e32-4cf1-9f8a-b2a8d8e9c005',
        //   time: '30',
        //   image: '',
        //   options: [{ id: 'opt1-b291', text: 'さくらももこ'}, {id: 'opt2-b291', text: 'まる子'}, {id: 'opt3-b291', text: 'ちびまる子'}],
        //   question: 'アニメ『ちびまる子ちゃん』の舞台となっている静岡県のどの市が舞台？'
        // },
        // {
        //   id: 'b291f4a5-7e32-4cf1-9f8a-b2a8d8e9c006',
        //   time: '30',
        //   image: '',
        //   options: [{ id: 'opt1-b291', text: 'さくらももこ'}, {id: 'opt2-b291', text: 'まる子'}, {id: 'opt3-b291', text: 'ちびまる子'}],
        //   question: 'まる子の姉の名前は？'
        // }
    ],
    create_user: 221,
    count: 11,
    question_count: 6,
    avg_score: 35,
    status: 2,
    answer: {
        'b291f4a5-7e32-4cf1-9f8a-b2a8d8e9c001': 'opt2-b291',
        'b291f4a5-7e32-4cf1-9f8a-b2a8d8e9c002': 'opt3-b292',
        // 'b291f4a5-7e32-4cf1-9f8a-b2a8d8e9c003': 'opt1-b293',
        // 'b291f4a5-7e32-4cf1-9f8a-b2a8d8e9c004': 'opt1-b294',
        // 'b291f4a5-7e32-4cf1-9f8a-b2a8d8e9c005': 'opt1-b295',
        // 'b291f4a5-7e32-4cf1-9f8a-b2a8d8e9c006': 'opt2-b296'
    },
    created_at: '2025-02-15T17:00:15.000Z',
    updated_at: '2025-02-16T14:32:03.000Z'
};
const IS_TEST = true;

class QuizSocket {

    private Quiz: QuizType | null;
    private QuizAnswer: QuizProps['answer'] | null;
    private QuizQuestions: QuizProps['questions'] | null;
    private QuizCurrentQuestion: number;
    private QuizUsers: { [Key:string] : { [Key:string]: string | number } };
    private QuizTickInterval: NodeJS.Timeout | null;
    private QuizEndTimeout: NodeJS.Timeout | null;

    constructor() {
        this.Quiz = null;
        this.QuizAnswer = null;
        this.QuizQuestions = null;
        this.QuizCurrentQuestion = 0;
        this.QuizUsers = {};
        this.QuizTickInterval = null;
        this.QuizEndTimeout = null;
    }

    public socketEvents(socket : Socket<ClientToServerEvents, ServerToClientEvents>) {
        socket.on('createQuiz', this.createQuiz.bind(this, socket));
        socket.on('joinQuiz', this.joinQuiz.bind(this, socket));
        socket.on('startQuiz', this.startQuiz.bind(this, socket));
        socket.on('selectQuestion', this.selectQuestion.bind(this, socket));
    }

    private createQuiz : ClientToServerEvents['createQuiz'] = async (socket, id, callback) => {
        try {

            if (!id) throw new Error('クイズIDは必須です');

            if (this.Quiz) throw new Error('クイズが既に存在します');

            let quizData : QuizProps = null;

            if (IS_TEST) {
                quizData = TEST_QUIZ_DATA;
            } else {
                quizData = await Database.getQuizById(id);
            }

            if (!quizData) throw new Error('クイズが存在しませんでした');

            this.Quiz = {
                id: quizData.id,
                title: quizData.title,
                description: quizData.description,
                count: quizData.count,
                avg_score: quizData.avg_score,
                thumbnail: quizData.thumbnail,
                question_count: quizData.question_count,
                currentQ : null,
                currentQIndex : null,
                countdown: 3,
                create_user: socket.id,
                status: 'join',
            };

            this.QuizAnswer = quizData.answer;
            this.QuizQuestions = quizData.questions;
            this.QuizUsers = {};
            this.QuizUsers[socket.id] = {};
            this.QuizCurrentQuestion = 0;
            this.QuizTickInterval = null;
            this.QuizEndTimeout = null;

            shared.io.emit('joinQuiz', Object.keys(this.QuizUsers));
            shared.io.emit('changeQuizData', this.Quiz);

            callback({ status: 'success', message: 'クイズの作成に成功しました' });
        } catch (error) {
            callback({ status: 'error', message: error.message });
        }
    }

    private joinQuiz : ClientToServerEvents['joinQuiz'] = (socket, _, callback) => {
        try {
            
            if (!this.Quiz || this.Quiz.status !== 'join') throw new Error('参加可能なクイズがありません');

            const mine = shared.online_users.find(user => user.id === socket.id);

            if (!mine) throw new Error('ユーザーが見つかりません');

            if (this.QuizUsers[socket.id]) throw new Error('既にクイズに参加しています');

            this.QuizUsers[socket.id] = {};

            shared.io.emit('joinQuiz', Object.keys(this.QuizUsers));

            callback({ status:'success', message: 'クイズに参加しました' });
        } catch (error) {
            callback({ status: 'error', message: error.message });
        }
    }

    private startQuiz : ClientToServerEvents['startQuiz'] = async (socket, _, callback) => {
        try {
            if (!this.Quiz || this.Quiz.status !== 'join' || this.Quiz.create_user !== socket.id) {
                throw new Error('クイズの認証エラー');
            }

            this._clearQuizTimers();
            this.QuizCurrentQuestion = 0;

            let countdown = 3;
            await new Promise(resolve => {
                const countdownInterval = setInterval(() => {
                    try {
                        if (countdown >= 0) {
                            this.Quiz.status = 'countdown';
                            this.Quiz.countdown = countdown;
                            shared.io.emit('quizCountdown', this.Quiz);
                            countdown -= 1;
                        } else {
                            clearInterval(countdownInterval);

                            this.Quiz.status = 'active';
                            this.Quiz.countdown = 0;
                            this._startQuestion(this.QuizCurrentQuestion);
                        }
                    } catch (error) {
                        clearInterval(countdownInterval);
                    }
                }, 1000);
            });

            callback({ status: 'success', message: 'クイズを開始しました' });
        } catch (error) {
            callback({ status: 'error', message: error.message });
        }
    }

    private selectQuestion : ClientToServerEvents['selectQuestion'] = (socket, value, callback) => {
        try {
            if(!this.QuizUsers[socket.id]) throw new Error('ユーザーがクイズに参加していません');
            if(!this.Quiz || this.Quiz.status !== 'active') throw new Error('クイズがアクティブではありません');

            if(!this.Quiz.currentQ || !this.QuizQuestions[this.QuizCurrentQuestion]) throw new Error('現在の質問が存在しません');

            const q = this.QuizQuestions[this.QuizCurrentQuestion];

            if(q.type === 'select'){
                const select = q.options.find(opt => opt.id === value);
                if(select){
                    this.QuizUsers[socket.id][q.id] = select.id;
                }
            }else{
                this.QuizUsers[socket.id][q.id] = value;
            }
            
            callback({ status: 'success', message: '問題を選択しました' });
        } catch (error) {
            callback({ status: 'error', message: error.message });
        }
    }

    private _clearQuizTimers() {
        if (this.QuizTickInterval) {
            clearInterval(this.QuizTickInterval);
            this.QuizTickInterval = null;
        }
        if (this.QuizEndTimeout) {
            clearTimeout(this.QuizEndTimeout);
            this.QuizEndTimeout = null;
        }
    }

    private _startQuestion(qIndex : number) {
        this._clearQuizTimers();

        const question = this.QuizQuestions[qIndex];
        if (!question) {
            this._finishQuiz();
            throw new Error('問題が存在しません : _startQuestion');
        }

        const durationMs = question.time * 1000 || 30000;
        const deadline = Date.now() + durationMs;

        this.Quiz.currentQ = question;
        this.Quiz.currentQIndex = qIndex;

        shared.io.emit('changeQuizData', this.Quiz);

        this.QuizTickInterval = setInterval(() => {
            const remainingSec = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
            shared.io.emit('quizTimeUpdate', {
                index: qIndex,
                remainingMs: remainingSec,
            });
        }, 1000);

        this.QuizEndTimeout = setTimeout(() => {
            this._endQuestion(qIndex);
        }, durationMs);
    }

    private _endQuestion(qIndex : number) {
        this._clearQuizTimers();

        const nextIndex = qIndex + 1;
        const hasNext = !!(this.QuizQuestions[nextIndex]);
        if (hasNext) {
            this.QuizCurrentQuestion = nextIndex;

            //答え合わせ
            const currentQuestion = this.QuizQuestions[qIndex];
            const correctAnswer = this.QuizAnswer[currentQuestion.id];
            const chats = [];
            Object.entries(this.QuizUsers).forEach(([userId, answer]) => {
                chats.push({
                    id : userId,
                    chat : {
                        type : 'text',
                        data : {
                            text : answer[currentQuestion.id] === correctAnswer ? '正解！' : '不正解',
                            time : Date.now(),
                        }
                    }
                });
            });

            shared.io.emit('addMessagesToChatRoom', chats);

            this._startQuestion(nextIndex);
        } else {
            this._finishQuiz();
        }
    }

    private _finishQuiz() {
        this._clearQuizTimers();
        if (!this.Quiz) throw new Error('クイズが存在しません : _finishQuiz');

        const results : { users : { [Key : string] : number }, question_count : number } = {
            users : {},
            question_count : this.QuizQuestions.length,
        };
        Object.entries(this.QuizUsers).forEach(([userId, answers]) => {
            const score = Object.entries(answers).reduce((acc, [questionId, answer]) => {
                const correctAnswer = this.QuizAnswer[questionId];
                
                return acc + (answer === correctAnswer ? 1 : 0);
            }, 0);
            results['users'][userId] = score;
        });

        shared.io.emit('quizEnded', results);

        this._clearQuiz();
    }

    private _clearQuiz(){
        this.Quiz = null;
        this.QuizAnswer = null;
        this.QuizQuestions = null;
        this.QuizCurrentQuestion = 0;
        this.QuizUsers = {};
        this.QuizTickInterval = null;
        this.QuizEndTimeout = null;
    }
}

export default QuizSocket;