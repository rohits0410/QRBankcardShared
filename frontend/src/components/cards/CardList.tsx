import CreditCard from './CreditCard';
import { Card } from '@/types';
import './CardList.css';

interface CardListProps {
  cards: Card[];
  onEdit: (card: Card) => void;
  onDelete: (id: number) => void;
}

export default function CardList({ cards, onEdit, onDelete }: CardListProps) {
  if (cards.length === 0) {
    return (
      <div className="card-list-empty">
        <div className="empty-icon">💳</div>
        <h3>Heç bir kartınız yoxdur</h3>
        <p>Yeni kart əlavə etmək üçün yuxarıdakı düyməni basın</p>
      </div>
    );
  }

  return (
    <div className="card-list">
      {cards.map((card) => (
        <CreditCard
          key={card.id}
          card={card}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions={true}
        />
      ))}
    </div>
  );
}