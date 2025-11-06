export type QuestionOptionProps = {text: string, id: string}[];

export type QuestionProps = {
    id: string;
    question: string;
    image: string;
    type?: 'select' | 'input';
    options: QuestionOptionProps;
    time: number;
}

export type QuizProps = {
    id:number;
    title: string;
    description: string;
    thumbnail: string;
    questions: QuestionProps[];
    count: number;
    question_count: number;
    avg_score: number;
    answer: any;
    create_user : number;
    created_at: string;
    updated_at: string;
    status: 0 | 1 | 2;
}

export type QuizEditProps = Omit<QuizProps, 'questions'|'answer'|'description'|'thumbnail'>;

export type QuizListProps<T> = {
    data: T;
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export type QuizAttempt = {
    id : number;
    quiz_id : number;
    user_id : number;
    score : number;
    answer_count : number;
    question_count : number;
    is_first_attempt : 1 | 0;
    created_at : string;
    snapshot : {
        answer : string;
        result : string;
        isCollect : boolean;
        question : string;
    }[] | null;
    quiz : {
        id : number;
        title : string;
    } | null;
}