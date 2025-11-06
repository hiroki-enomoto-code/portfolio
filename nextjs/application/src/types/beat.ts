export type BeatProps = {
    id:number;
    content: string;
    attachment: string[];
    user_id: number;
    comments: number;
    reaction: { [Key:number] : number[] } | null;
    reply: null | number;
    status: 0 | 1 | 2;
    is_private: 0 | 1;
    created_at: string;
    updated_at: string;
}

export type BeatListProps = {
    data: BeatProps[];
    more: boolean;
}