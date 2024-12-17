export interface BroadcastMessage {
    type: string,
    payload?: any
}

export const signInChannel = new BroadcastChannel('sigin_channel')
