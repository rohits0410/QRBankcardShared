// User types
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
}

// Card types
export interface Card {
  id: number;
  cardName: string;
  cardNumber: string; // Formatlanmış: "1234 5678 9012 3456"
  cardType: string; // Visa, Mastercard, Humo
  expiryDate: string; // MM/YY
  cardColor: string; // #hex
  createdAt: string;
}

export interface AddCardDto {
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  cardColor: string;
}

export interface UpdateCardDto {
  cardName: string;
  expiryDate: string;
  cardColor: string;
}

// Share Card (QR)
export interface ShareCard {
  id: number;
  cardName: string;
  cardNumber: string;
  cardType: string;
  expiryDate: string;
}

// API Error
export interface ApiError {
  message: string;
  statusCode?: number;
}