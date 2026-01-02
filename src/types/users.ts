export interface PickedUser {
  id: number;
  firstName: string;
  lastName: string;
}

export interface Users {
  users: PickedUser[];
  total: number;
  skip: number;
  limit: number;
}
