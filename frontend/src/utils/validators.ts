// Email validation
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email tələb olunur';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email formatı düzgün deyil';
  }
  
  return null;
};

// Password validation
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Şifrə tələb olunur';
  }
  
  if (password.length < 6) {
    return 'Şifrə ən azı 6 simvol olmalıdır';
  }
  
  return null;
};

// Card number validation
export const validateCardNumber = (cardNumber: string): string | null => {
  if (!cardNumber) {
    return 'Kart nömrəsi tələb olunur';
  }
  
  // Remove spaces
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  // Check if 16 digits
  if (cleanNumber.length !== 16) {
    return 'Kart nömrəsi 16 rəqəm olmalıdır';
  }
  
  // Check if all digits
  if (!/^\d+$/.test(cleanNumber)) {
    return 'Kart nömrəsi yalnız rəqəmlərdən ibarət olmalıdır';
  }
  
  // Luhn algorithm (optional - backend also validates)
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  if (sum % 10 !== 0) {
    return 'Kart nömrəsi düzgün deyil';
  }
  
  return null;
};

// Expiry date validation
export const validateExpiryDate = (expiryDate: string): string | null => {
  if (!expiryDate) {
    return 'Bitmə tarixi tələb olunur';
  }
  
  // Check format MM/YY
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!expiryRegex.test(expiryDate)) {
    return 'Bitmə tarixi formatı MM/YY olmalıdır';
  }
  
  // Extract month and year
  const [monthStr, yearStr] = expiryDate.split('/');
  const month = parseInt(monthStr, 10);
  const year = parseInt('20' + yearStr, 10); // Convert YY to YYYY
  
  // Get current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 0-indexed
  
  // Check if expired
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'Kartın bitmə tarixi keçmişdir';
  }
  
  // Check if too far in future (e.g., more than 10 years)
  if (year > currentYear + 10) {
    return 'Bitmə tarixi çox uzaqdadır';
  }
  
  return null; // Valid!
};

// Username validation
export const validateUsername = (username: string): string | null => {
  if (!username) {
    return 'İstifadəçi adı tələb olunur';
  }
  
  if (username.length < 3) {
    return 'İstifadəçi adı ən azı 3 simvol olmalıdır';
  }
  
  if (username.length > 50) {
    return 'İstifadəçi adı 50 simvoldan çox olmamalıdır';
  }
  
  return null;
};