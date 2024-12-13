export interface Coordinate {
    latitude: number,
    longitude: number
}

export interface Location {
    address: string,
    coordinates: Coordinate
}

export interface RecycleCenter {
    id: string,
    name: string,
    location: Location,
    type: string[],
    addedBy: string
    verified: boolean,
    createdAt: Date,
    updatedAt: Date
}