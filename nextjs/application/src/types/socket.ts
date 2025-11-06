import { CharacterType } from "@/app/(default)/amusement/[id]/page";

export type ClientToServerCallbackProps = { status : 'success' | 'error' | 'alert', message: string};
export type ServerToClientEvent<T> = (response : T) => void;

export type FetchRoomInfo = { users: string[], id: string };
export type RoomUserDisconnect = number;
export type LoginToRoom = {
    users: CharacterType[],
    mine: CharacterType,
};
