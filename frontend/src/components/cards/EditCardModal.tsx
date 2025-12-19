import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import ColorPicker from '@/components/common/ColorPicker';
import { Card, UpdateCardDto } from '@/types';
import { validateExpiryDate } from '@/utils/validators';
import { formatExpiryDate } from '@/utils/helpers';
import { CreditCard, Calendar } from 'lucide-react';
import './EditCardModal.css';

interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: UpdateCardDto) => Promise<void>;
  card: Card | null;
}

export default function EditCardModal({
  isOpen,
  onClose,
  onSubmit,
  card,
}: EditCardModalProps) {
  const [formData, setFormData] = useState<UpdateCardDto>({
    cardName: '',
    expiryDate: '',
    cardColor: '#667eea',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Card dəyişdikdə formu doldur
  useEffect(() => {
    if (card) {
      setFormData({
        cardName: card.cardName,
        expiryDate: card.expiryDate,
        cardColor: card.cardColor,
      });
      // Errors-u təmizlə
      setErrors({});
    }
  }, [card]);

  // Card name dəyişimi
  const handleCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, cardName: value });
    
    // Error-u təmizlə
    if (errors.cardName) {
      setErrors({ ...errors, cardName: '' });
    }
  };

  // Expiry date dəyişimi
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setFormData({ ...formData, expiryDate: formatted });
    
    // Error-u təmizlə
    if (errors.expiryDate) {
      setErrors({ ...errors, expiryDate: '' });
    }
  };

  // Color dəyişimi
  const handleColorChange = (color: string) => {
    setFormData({ ...formData, cardColor: color });
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Card name
    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Kart adı tələb olunur';
    }

    // Expiry date - validateExpiryDate string qaytarır (error mesajı) və ya null
    const expiryError = validateExpiryDate(formData.expiryDate);
    if (expiryError) {
      newErrors.expiryDate = expiryError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !card) return;

    setLoading(true);
    try {
      await onSubmit(card.id, formData);
    } catch (error) {
      console.error('Edit card error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!card) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Kartı Redaktə Et" size="md">
      <form onSubmit={handleSubmit} className="edit-card-form">
        {/* Card Number (disabled) */}
        <div className="disabled-field">
          <Input
            label="Kart Nömrəsi"
            type="text"
            value={card.cardNumber}
            disabled
            icon={<CreditCard size={20} />}
          />
          <p className="field-note">Kart nömrəsi dəyişdirilə bilməz</p>
        </div>

        {/* Card Name */}
        <Input
          label="Kart Adı"
          type="text"
          placeholder="Məsələn: İş kartı, Şəxsi kart"
          value={formData.cardName}
          onChange={handleCardNameChange}
          error={errors.cardName}
          icon={<CreditCard size={20} />}
          maxLength={50}
        />

        {/* Expiry Date */}
        <Input
          label="Bitmə Tarixi"
          type="text"
          placeholder="MM/YY"
          value={formData.expiryDate}
          onChange={handleExpiryDateChange}
          error={errors.expiryDate}
          icon={<Calendar size={20} />}
          maxLength={5}
          inputMode="numeric"
        />

        {/* Color Picker */}
        <ColorPicker
          label="Kart Rəngi"
          value={formData.cardColor}
          onChange={handleColorChange}
        />

        {/* Preview */}
        <div className="card-preview">
          <p className="preview-label">Önizləmə:</p>
          <div
            className="card-preview-mini"
            style={{
              background: `linear-gradient(135deg, ${formData.cardColor} 0%, ${adjustColor(
                formData.cardColor,
                -30
              )} 100%)`,
            }}
          >
            <div className="preview-chip"></div>
            <div className="preview-number">{card.cardNumber}</div>
            <div className="preview-footer">
              <span className="preview-name">{formData.cardName || 'KART ADI'}</span>
              <span className="preview-expiry">{formData.expiryDate || 'MM/YY'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Ləğv et
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Yadda Saxla
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Helper function
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
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
}