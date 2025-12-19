import api from './api';
import { Card, AddCardDto, UpdateCardDto, ShareCard } from '@/types';

export const cardService = {
  // Get all user cards
  getAll: async (): Promise<Card[]> => {
    const response = await api.get<Card[]>('/cards');
    return response.data;
  },

  // Get single card
  getById: async (id: number): Promise<Card> => {
    const response = await api.get<Card>(`/cards/${id}`);
    return response.data;
  },

  // Add new card
  create: async (data: AddCardDto): Promise<Card> => {
    const response = await api.post<Card>('/cards', data);
    return response.data;
  },

  // Update card
  update: async (id: number, data: UpdateCardDto): Promise<Card> => {
    const response = await api.put<Card>(`/cards/${id}`, data);
    return response.data;
  },

  // Delete card
  delete: async (id: number): Promise<void> => {
    await api.delete(`/cards/${id}`);
  },

  // Get shared cards (QR)
  getShared: async (token: string): Promise<ShareCard[]> => {
    const response = await api.get<ShareCard[]>(`/cards/shared?token=${token}`);
    return response.data;
  },

  // Generate share token
  generateShareToken: async (): Promise<string> => {
    const response = await api.get<{ token: string }>('/cards/generate-share-token');
    return response.data.token;
  },
};