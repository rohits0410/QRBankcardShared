import React, { useState, useEffect } from 'react';
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
    }
  }, [card]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'expiryDate') {
      const formatted = formatExpiryDate(value);
      if (formatted.length <= 5) {
        setFormData({ ...formData, expiryDate: formatted });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Kart adı tələb olunur';
    }

    if (!validateExpiryDate(formData.expiryDate)) {
      newErrors.expiryDate = 'Düzgün bitmə tarixi daxil edin (MM/YY)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !card) return;

    setLoading(true);
    try {
      await onSubmit(card.id, formData);
      handleClose();
    } catch (error) {
      console.error('Edit card error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!card) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Kartı Redaktə Et" size="md">
      <form onSubmit={handleSubmit} className="edit-card-form">
        {/* Card Number (disabled) */}
        <div className="disabled-field">
          <Input
            label="Kart Nömrəsi"
            type="text"
            value={card.cardNumber}
            disabled
            icon={<CreditCard size={20} />}
            fullWidth
          />
          <p className="field-note">Kart nömrəsi dəyişdirilə bilməz</p>
        </div>

        {/* Card Name */}
        <Input
          label="Kart Adı"
          name="cardName"
          type="text"
          placeholder="Məsələn: İş kartı, Şəxsi kart"
          value={formData.cardName}
          onChange={handleChange}
          error={errors.cardName}
          icon={<CreditCard size={20} />}
          fullWidth
          autoComplete="off"
        />

        {/* Expiry Date */}
        <Input
          label="Bitmə Tarixi"
          name="expiryDate"
          type="text"
          placeholder="MM/YY"
          value={formData.expiryDate}
          onChange={handleChange}
          error={errors.expiryDate}
          icon={<Calendar size={20} />}
          fullWidth
          autoComplete="off"
        />

        {/* Color Picker */}
        <ColorPicker
          label="Kart Rəngi"
          value={formData.cardColor}
          onChange={(color) => setFormData({ ...formData, cardColor: color })}
        />

        {/* Preview */}
        <div className="card-preview">
          <p className="preview-label">Önizləmə:</p>
          <div
            className="card-preview-mini"
            style={{
              background: `linear-gradient(135deg, ${formData.cardColor} 0%, ${adjustColor(formData.cardColor, -30)} 100%)`,
            }}
          >
            <div className="preview-chip"></div>
            <div className="preview-number">{card.cardNumber}</div>
            <div className="preview-footer">
              <span className="preview-name">{formData.cardName}</span>
              <span className="preview-expiry">{formData.expiryDate}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
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

// Helper
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}