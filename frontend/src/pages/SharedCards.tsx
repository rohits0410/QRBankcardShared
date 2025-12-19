import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Copy, ArrowLeft } from 'lucide-react';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import { ShareCard } from '@/types';
import { cardService } from '@/services/card.service';
import { copyToClipboard, cleanCardNumber } from '@/utils/helpers';
import toast from 'react-hot-toast';
import './SharedCards.css';

export default function SharedCards() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [cards, setCards] = useState<ShareCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    loadSharedCards();
  }, []);

  const loadSharedCards = async () => {
    try {
      const token = searchParams.get('token');

      if (!token) {
        setError('Token tapılmadı');
        setLoading(false);
        return;
      }

      const data = await cardService.getShared(token);
      setCards(data);
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data || 'Kartlar yüklənə bilmədi və ya link vaxtı keçib';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (card: ShareCard) => {
    const cleaned = cleanCardNumber(card.cardNumber);
    const success = await copyToClipboard(cleaned);

    if (success) {
      setCopiedId(card.id);
      toast.success('Kart nömrəsi kopyalandı!', {
        icon: '📋',
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
        },
      });
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      toast.error('Kopyalana bilmədi');
    }
  };

  if (loading) {
    return <Loading fullScreen text="Kartlar yüklənir..." />;
  }

  if (error) {
    return (
      <div className="shared-container">
        <div className="shared-error">
          <div className="error-icon">⚠️</div>
          <h2>Xəta</h2>
          <p>{error}</p>
          <Button
            variant="primary"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate('/')}
          >
            Ana Səhifəyə Qayıt
          </Button>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="shared-container">
        <div className="shared-error">
          <div className="error-icon">🎴</div>
          <h2>Kart Yoxdur</h2>
          <p>Bu istifadəçinin heç bir kartı yoxdur</p>
          <Button
            variant="primary"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate('/')}
          >
            Ana Səhifəyə Qayıt
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-container">
      <div className="shared-header">
        <div className="shared-logo">💳</div>
        <h1>Paylaşılan Kartlar</h1>
        <p className="card-count">{cards.length} kart</p>
      </div>

      <div className="shared-cards-list">
        {cards.map((card) => (
          <div key={card.id} className="shared-card">
            <div className="shared-card-header">
              <div className="card-type-badge">{card.cardType}</div>
              <div className="card-name">{card.cardName}</div>
            </div>

            <div className="card-number-section">
              <div className="card-number-display">{card.cardNumber}</div>
              <button
                onClick={() => handleCopy(card)}
                className={`copy-btn ${copiedId === card.id ? 'copied' : ''}`}
              >
                {copiedId === card.id ? (
                  <>
                    <span className="check-icon">✓</span>
                    Kopyalandı
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Kopyala
                  </>
                )}
              </button>
            </div>

            <div className="card-expiry-display">
              <span className="expiry-label">Bitmə:</span>
              <span className="expiry-value">{card.expiryDate}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="shared-footer">
        <div className="warning-box">
          <span className="warning-icon">⚠️</span>
          <div>
            <strong>Diqqət!</strong>
            <p>Bu məlumatları təhlükəsiz saxlayın. Heç kimlə paylaşmayın.</p>
          </div>
        </div>
        <Button
          variant="primary"
          fullWidth
          icon={<ArrowLeft size={18} />}
          onClick={() => navigate('/')}
        >
          Bitir
        </Button>
      </div>
    </div>
  );
}