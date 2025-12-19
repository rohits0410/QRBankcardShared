import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { Download, Link as LinkIcon } from 'lucide-react';
import { cardService } from '@/services/card.service';
import { copyToClipboard } from '@/utils/helpers';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import './QRModal.css';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRModal({ isOpen, onClose }: QRModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateQR();
    }
  }, [isOpen]);

  const generateQR = async () => {
    try {
      setLoading(true);

      // Share token generate et
      const token = await cardService.generateShareToken();

      // URL yarat
      const url = `${window.location.origin}/shared?token=${encodeURIComponent(token)}`;
      setShareUrl(url);

      // QR kod yarad
      const qrImage = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      setQrDataUrl(qrImage);
    } catch (error) {
      toast.error('QR kod yaradıla bilmədi');
      console.error('QR generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      toast.success('Link kopyalandı!');
    } else {
      toast.error('Link kopyalana bilmədi');
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `cards-share-qr-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR kod yükləndi!');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Kartları Paylaş" size="md">
      <div className="qr-modal-content">
        {loading ? (
          <div className="qr-loading">
            <div className="spinner"></div>
            <p>QR kod yaradılır...</p>
          </div>
        ) : (
          <>
            <div className="qr-header">
              <div className="qr-icon">📱</div>
              <p className="qr-description">
                Bütün kartlarınızı paylaşmaq üçün QR kodu skan edin
              </p>
            </div>

            {qrDataUrl && (
              <div className="qr-code-container">
                <div className="qr-code-wrapper">
                  <img src={qrDataUrl} alt="QR Code" className="qr-image" />
                  <div className="qr-corners">
                    <div className="corner top-left"></div>
                    <div className="corner top-right"></div>
                    <div className="corner bottom-left"></div>
                    <div className="corner bottom-right"></div>
                  </div>
                </div>
              </div>
            )}

            <div className="qr-instructions">
              <div className="instruction-item">
                <span className="step">1</span>
                <span>QR kodu telefonla skan edin</span>
              </div>
              <div className="instruction-item">
                <span className="step">2</span>
                <span>Brauzer açılacaq - bütün kartlarınız görünəcək</span>
              </div>
              <div className="instruction-item">
                <span className="step">3</span>
                <span>Tam 16 rəqəmli nömrələri görün və kopyalayın</span>
              </div>
            </div>

            <div className="qr-link-section">
              <label>Və ya bu linki kopyalayın:</label>
              <div className="link-input-group">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="share-link-input"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  variant="outline"
                  size="sm"
                  icon={<LinkIcon size={16} />}
                  onClick={handleCopyLink}
                >
                  Kopyala
                </Button>
              </div>
            </div>

            <div className="qr-actions">
              <Button
                variant="primary"
                fullWidth
                icon={<Download size={18} />}
                onClick={handleDownload}
              >
                QR Kodu Yüklə
              </Button>
            </div>

            <div className="qr-note">
              <span className="warning-icon">⚠️</span>
              <div>
                <strong>Diqqət!</strong>
                <p>
                  Bu link <strong>müddətsizdir</strong> və bütün kartlarınızı göstərir. 
                  Yalnız etibarlı şəxslərlə paylaşın!
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}