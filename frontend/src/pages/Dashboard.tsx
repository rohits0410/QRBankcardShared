import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, Share2 } from 'lucide-react';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import CardList from '@/components/cards/CardList';
import AddCardModal from '@/components/cards/AddCardModal';
import EditCardModal from '@/components/cards/EditCardModal';
import QRModal from '@/components/QRModal';
import { useAuth } from '@/contexts/AuthContext';
import { cardService } from '@/services/card.service';
import { Card, AddCardDto, UpdateCardDto } from '@/types';
import toast from 'react-hot-toast';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { username, logout } = useAuth();

  // State
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Load cards on mount
  useEffect(() => {
    loadCards();
  }, []);

  // Load all cards
  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await cardService.getAll();
      setCards(data);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        'Kartlar yüklənə bilmədi';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Add new card
  const handleAddCard = async (data: AddCardDto) => {
    try {
      const newCard = await cardService.create(data);
      setCards([newCard, ...cards]);
      toast.success('Kart əlavə edildi!', {
        icon: '✅',
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
        },
      });
      setShowAddModal(false);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        'Kart əlavə edilə bilmədi';
      toast.error(message);
      throw error; // Modal-da error göstərmək üçün
    }
  };

  // Edit existing card
  const handleEditCard = async (id: number, data: UpdateCardDto) => {
    try {
      const updatedCard = await cardService.update(id, data);
      setCards(cards.map((c) => (c.id === id ? updatedCard : c)));
      toast.success('Kart yeniləndi!', {
        icon: '✅',
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
        },
      });
      setShowEditModal(false);
      setSelectedCard(null);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        'Kart yenilənə bilmədi';
      toast.error(message);
      throw error;
    }
  };

  // Delete card
  const handleDeleteCard = async (id: number) => {
    // Confirmation dialog
    const card = cards.find((c) => c.id === id);
    if (
      !window.confirm(
        `"${card?.cardName}" kartını silmək istədiyinizə əminsiniz?`
      )
    ) {
      return;
    }

    try {
      await cardService.delete(id);
      setCards(cards.filter((c) => c.id !== id));
      toast.success('Kart silindi!', {
        icon: '🗑️',
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
        },
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        'Kart silinə bilmədi';
      toast.error(message);
    }
  };

  // Open edit modal
  const handleEditClick = (card: Card) => {
    setSelectedCard(card);
    setShowEditModal(true);
  };

  // Logout
  const handleLogout = () => {
    logout();
    toast.success('Çıxış edildi', {
      icon: '👋',
    });
    navigate('/login');
  };

  // Loading state
  if (loading) {
    return <Loading fullScreen text="Kartlar yüklənir..." />;
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <div className="logo">💳</div>
              <div className="header-info">
                <h1>Card Manager</h1>
                <p>
                  Xoş gəldiniz, <strong>{username}</strong>
                </p>
              </div>
            </div>

            <div className="header-actions">
              <Button
                variant="outline"
                size="md"
                icon={<Share2 size={18} />}
                onClick={() => setShowQRModal(true)}
              >
                <span className="btn-text-desktop">QR Paylaş</span>
                <span className="btn-text-mobile">QR</span>
              </Button>
              <Button
                variant="ghost"
                size="md"
                icon={<LogOut size={18} />}
                onClick={handleLogout}
              >
                <span className="btn-text-desktop">Çıxış</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="container">
          {/* Toolbar */}
          <div className="dashboard-toolbar">
            <div className="toolbar-left">
              <h2>Kartlarım</h2>
              <span className="card-count">{cards.length} kart</span>
            </div>
            <Button
              variant="primary"
              size="md"
              icon={<Plus size={20} />}
              onClick={() => setShowAddModal(true)}
            >
              <span className="btn-text-desktop">Yeni Kart</span>
              <span className="btn-text-mobile">Əlavə Et</span>
            </Button>
          </div>

          {/* Cards List */}
          <CardList
            cards={cards}
            onEdit={handleEditClick}
            onDelete={handleDeleteCard}
          />
        </div>
      </main>

      {/* Modals */}
      <AddCardModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCard}
      />

      <EditCardModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCard(null);
        }}
        onSubmit={handleEditCard}
        card={selectedCard}
      />

      <QRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
    </div>
  );
}