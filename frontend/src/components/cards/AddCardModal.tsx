import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import ColorPicker from '@/components/common/ColorPicker';
import { CreditCard } from 'lucide-react';
import { AddCardDto } from '@/types';
import { validateCardNumber, validateExpiryDate } from '@/utils/validators';
import { formatExpiryDate } from '@/utils/helpers';
import './AddCardModal.css';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddCardDto) => Promise<void>;
}

export default function AddCardModal({
  isOpen,
  onClose,
  onSubmit,
}: AddCardModalProps) {
  const [formData, setFormData] = useState<AddCardDto>({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cardColor: '#667eea',
  });

  const [errors, setErrors] = useState<{
    cardName?: string;
    cardNumber?: string;
    expiryDate?: string;
  }>({});

  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        cardName: '',
        cardNumber: '',
        expiryDate: '',
        cardColor: '#667eea',
      });
      setErrors({});
      setLoading(false);
    }
  }, [isOpen]);

  // Format card number (4-4-4-4)
  const handleCardNumberChange = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 16 digits
    const limited = digits.slice(0, 16);
    
    // Format with spaces (4-4-4-4)
    const formatted = limited.match(/.{1,4}/g)?.join(' ') || limited;
    
    setFormData({ ...formData, cardNumber: formatted });
    
    // Clear error
    if (errors.cardNumber) {
      setErrors({ ...errors, cardNumber: undefined });
    }
  };

  // Format expiry date (MM/YY)
  const handleExpiryDateChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    setFormData({ ...formData, expiryDate: formatted });
    
    // Clear error
    if (errors.expiryDate) {
      setErrors({ ...errors, expiryDate: undefined });
    }
  };

  // Handle color change
  const handleColorChange = (color: string) => {
    setFormData({ ...formData, cardColor: color });
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    // Card name
    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Kart adı tələb olunur';
    }

    // Card number
    const cardNumberError = validateCardNumber(formData.cardNumber);
    if (cardNumberError) {
      newErrors.cardNumber = cardNumberError;
    }

    // Expiry date
    const expiryError = validateExpiryDate(formData.expiryDate);
    if (expiryError) {
      newErrors.expiryDate = expiryError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to add card:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yeni Kart Əlavə Et">
      <form onSubmit={handleSubmit} className="add-card-form">
        {/* Card Name */}
        <Input
          label="Kart Adı"
          value={formData.cardName}
          onChange={(e) => {
            setFormData({ ...formData, cardName: e.target.value });
            if (errors.cardName) {
              setErrors({ ...errors, cardName: undefined });
            }
          }}
          error={errors.cardName}
          placeholder="Məsələn: İş kartı, Şəxsi kart"
          icon={<CreditCard size={20} />}
          maxLength={50}
          autoFocus
        />

        {/* Card Number */}
        <Input
          label="Kart Nömrəsi"
          value={formData.cardNumber}
          onChange={(e) => handleCardNumberChange(e.target.value)}
          error={errors.cardNumber}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          inputMode="numeric"
        />

        {/* Expiry Date */}
        <Input
          label="Bitmə Tarixi"
          value={formData.expiryDate}
          onChange={(e) => handleExpiryDateChange(e.target.value)}
          error={errors.expiryDate}
          placeholder="MM/YY"
          maxLength={5}
          inputMode="numeric"
        />

        {/* Card Color */}
        <ColorPicker
          label="Kart Rəngi"
          value={formData.cardColor}
          onChange={handleColorChange}
        />

        {/* Preview */}
        <div className="add-card-preview">
          <div className="preview-label">Önizləmə:</div>
          <div
            className="preview-card"
            style={{
              background: `linear-gradient(135deg, ${formData.cardColor} 0%, ${adjustColor(
                formData.cardColor,
                -20
              )} 100%)`,
            }}
          >
            <div className="preview-card-chip"></div>
            <div className="preview-card-number">
              {formData.cardNumber || '•••• •••• •••• ••••'}
            </div>
            <div className="preview-card-footer">
              <div className="preview-card-name">
                {formData.cardName || 'KART ADI'}
              </div>
              <div className="preview-card-expiry">
                {formData.expiryDate || 'MM/YY'}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="add-card-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Ləğv Et
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Əlavə Et
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Helper function to adjust color brightness
function adjustColor(color: string, percent: number): string {
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
}