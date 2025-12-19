import { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2, Copy, Check } from 'lucide-react';
import { Card } from '@/types';
import { copyToClipboard, cleanCardNumber } from '@/utils/helpers';
import toast from 'react-hot-toast';
import './CreditCard.css';

interface CreditCardProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (id: number) => void;
  showActions?: boolean;
}

export default function CreditCard({
  card,
  onEdit,
  onDelete,
  showActions = true,
}: CreditCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(22);
  const cardNumberRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dinamik font size hesabla
  useEffect(() => {
    const calculateFontSize = () => {
      if (!cardNumberRef.current || !containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.offsetWidth - 40;
      const textLength = card.cardNumber.length;

      let newFontSize = 22;

      if (containerWidth < 300) {
        newFontSize = textLength > 18 ? 14 : 16;
      } else if (containerWidth < 400) {
        newFontSize = textLength > 18 ? 18 : 20;
      } else {
        newFontSize = textLength > 18 ? 20 : 22;
      }

      setFontSize(newFontSize);
    };

    calculateFontSize();
    window.addEventListener('resize', calculateFontSize);

    return () => {
      window.removeEventListener('resize', calculateFontSize);
    };
  }, [card.cardNumber]);

  // Copy card number
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanNumber = cleanCardNumber(card.cardNumber);
    const success = await copyToClipboard(cleanNumber);

    if (success) {
      setCopied(true);
      toast.success('Kart nömrəsi kopyalandı!', {
        icon: '📋',
      });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Kopyalama uğursuz oldu');
    }
  };

  // Adjust color brightness
  const adjustColor = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
        .toUpperCase()
    );
  };

  return (
    <div className="credit-card-wrapper">
      <div
        ref={containerRef}
        className={`credit-card-container ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Side */}
        <div
          className="credit-card credit-card-front"
          style={{
            background: `linear-gradient(135deg, ${card.cardColor} 0%, ${adjustColor(
              card.cardColor,
              -20
            )} 100%)`,
          }}
        >
          {/* Pattern Overlay */}
          <div className="card-pattern"></div>

          {/* Card Type Badge */}
          <div className="card-type-badge">{card.cardType.toUpperCase()}</div>

          {/* Chip */}
          <div className="card-chip"></div>

          {/* Card Number + Copy Button */}
          <div className="card-number-wrapper">
            <div
              ref={cardNumberRef}
              className="card-number"
              style={{
                fontSize: `${fontSize}px`,
                letterSpacing: fontSize > 18 ? '2px' : '1px',
              }}
            >
              {card.cardNumber}
            </div>
            {showActions && (
              <button
                className={`card-copy-inline ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
                title="Kart nömrəsini kopyala"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            )}
          </div>

          {/* Card Footer */}
          <div className="card-footer">
            <div className="card-holder">
              <div className="card-label">KART SAHİBİ</div>
              <div className="card-name">{card.cardName}</div>
            </div>
            <div className="card-expiry-section">
              <div className="card-label">BİTMƏ</div>
              <div className="card-expiry">{card.expiryDate}</div>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div
          className="credit-card credit-card-back"
          style={{
            background: `linear-gradient(135deg, ${card.cardColor} 0%, ${adjustColor(
              card.cardColor,
              -20
            )} 100%)`,
          }}
        >
          {/* Magnetic Strip */}
          <div className="card-strip"></div>

          {/* Signature Panel */}
          <div className="card-signature">
            <div className="signature-label">İmza</div>
            <div className="cvv-box">
              <span>CVV</span>
              <span className="cvv-value">***</span>
            </div>
          </div>

          {/* Card Number (small) */}
          <div className="card-number-back">{card.cardNumber}</div>

          {/* Warning */}
          <div className="card-warning">
            Bu kartı qoruyun və paylaşmayın
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="card-actions">
          <button
            className="card-action-btn card-action-edit"
            onClick={() => onEdit(card)}
            title="Redaktə et"
          >
            <Edit2 size={18} />
            <span>Redaktə</span>
          </button>
          <button
            className="card-action-btn card-action-delete"
            onClick={() => onDelete(card.id)}
            title="Sil"
          >
            <Trash2 size={18} />
            <span>Sil</span>
          </button>
        </div>
      )}
    </div>
  );
}