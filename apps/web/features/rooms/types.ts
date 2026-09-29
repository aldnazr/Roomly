export interface RoomResponse {
  data: Room[];
}

export interface Room {
  id: number;
  name: string;
  base_price: number;
  capacity: number;
  description: string;
  amenities: string[];
  photos: any[];
  total_rooms: number;
}

export interface RoomDetailResponse {
  data: Room;
}

export interface RoomPayload {
  name: string;
  capacity: number;
  base_price: number;
  description?: string;
  amenities?: string[];
  photos?: any[];
}
