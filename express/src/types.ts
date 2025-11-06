import { Socket } from 'socket.io';

type CharacterType = {
    id: string;
    name: string;
    x: number;
    y: number;
    reflection: boolean;
    character: number;
    gesture: string;
}

export type EnqueteType = {
    id : string,
    answers: {
        id: string,
        value: string | number,
        count: number
    }[],
    detail : string,
    status : 'active' | 'end',
};

export type ChatType = {
    type: 'text';
    data: {
        time: number;
        text: string;
    }
} | {
    type: 'image';
    data: {
        time: number;
        image: string;
    }
} | {
    type: 'enquete';
    data: {
        time: number;
        enquete: EnqueteType;
    };
}

//QUIZ TYPES
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

export type ClientToServerEvent<T> = (
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    data: T,
    callback: (response: { status : 'success' | 'error' | 'alert', message: string}) => void,
) => void;

export type ServerToClientEvent<T> = (response : T) => void;

export type ClientToServerEvents = {
    fetchRoomInfo: ClientToServerEvent<null>;
    exitChatRoom: ClientToServerEvent<null>;
    loginToRoom: ClientToServerEvent<{id:string, name:string, character:number}>;
    moveUserInChatRoom: ClientToServerEvent<{ id: string, position: { x: number, y: number } }>;
    addMessagesToChatRoom: ClientToServerEvent<{ chats: ChatType, id: string }[]>;
    flipUserDirection: ClientToServerEvent<{ id: CharacterType['id'], reflection: CharacterType['reflection'] }>;
    performUserGesture: ClientToServerEvent<{ id : string, gesture : string }>;

    // Enquete related events
    createEnquete: ClientToServerEvent<EnqueteType>;
    selectEnquete: ClientToServerEvent<string>;
    endEnquete: ClientToServerEvent<null>;

    // Quiz related events
    createQuiz: ClientToServerEvent<number>;
    joinQuiz: ClientToServerEvent<null>;
    startQuiz: ClientToServerEvent<null>;
    selectQuestion: ClientToServerEvent<number | string | null>;
    answerQuiz: ClientToServerEvent<{ questionId: string, answer: string }>;
    endQuiz: ClientToServerEvent<null>;
    quizTimeUpdate: ClientToServerEvent<number>;
    quizEnd: ClientToServerEvent<null>;
}

export type ServerToClientEvents = {
    fetchRoomInfo: ServerToClientEvent<FetchRoomInfo>;
    roomUserDisconnect: ServerToClientEvent<RoomUserDisconnect>;
    loginToRoom: ServerToClientEvent<LoginToRoom>;
    changeUsersData: ServerToClientEvent<CharacterType[]>;
    addMessagesToChatRoom: ServerToClientEvent<{ chats: ChatType, id: string }[]>;
    performUserGesture: ServerToClientEvent<{ id : string, gesture : string }>;
}

export type FetchRoomInfo = { users: string[], id: string };
export type RoomUserDisconnect = number;
export type LoginToRoom = { users: CharacterType[], mine: CharacterType};