// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (error) {
        console.error('Fallback: Oops, unable to copy', error);
        textArea.remove();
        return false;
      }
    }
  } catch (error) {
    console.error('Failed to copy text: ', error);
    return false;
  }
};

// Clean card number (remove spaces)
export const cleanCardNumber = (cardNumber: string): string => {
  return cardNumber.replace(/\s/g, '');
};

// Format card number (4-4-4-4)
export const formatCardNumber = (cardNumber: string): string => {
  const cleaned = cleanCardNumber(cardNumber);
  const match = cleaned.match(/.{1,4}/g);
  return match ? match.join(' ') : cleaned;
};

// Format expiry date (MM/YY)
export const formatExpiryDate = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Limit to 4 digits (MMYY)
  const limited = digits.slice(0, 4);
  
  // Format as MM/YY
  if (limited.length >= 3) {
    return `${limited.slice(0, 2)}/${limited.slice(2)}`;
  } else if (limited.length >= 1) {
    return limited;
  }
  
  return '';
};

// Get local IP for QR code
export const getLocalIP = (): string => {
  return window.location.hostname;
};

// Format date
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('az-AZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format time
export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('az-AZ', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format datetime
export const formatDateTime = (date: string | Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

// Truncate text
export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

// Generate random color
export const generateRandomColor = (): string => {
  const colors = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#4facfe',
    '#00f2fe',
    '#43e97b',
    '#38f9d7',
    '#fa709a',
    '#fee140',
    '#30cfd0',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};