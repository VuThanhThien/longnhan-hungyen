export interface AdminUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenExpires: number;
  user: AdminUser;
}
