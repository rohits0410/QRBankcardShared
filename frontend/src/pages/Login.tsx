import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/contexts/AuthContext';
import { validateEmail } from '@/utils/validators';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email tələb olunur';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Düzgün email daxil edin';
    }

    if (!formData.password) {
      newErrors.password = 'Şifrə tələb olunur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authService.login(formData);
      login(response.token, response.userId, response.username);
      toast.success(`Xoş gəldiniz, ${response.username}!`);
      navigate('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data || 'Giriş uğursuz oldu';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-shape shape-1"></div>
        <div className="auth-shape shape-2"></div>
        <div className="auth-shape shape-3"></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">💳</div>
          <h1>Xoş gəlmisiniz</h1>
          <p>Hesabınıza daxil olun</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={<Mail size={20} />}
            fullWidth
            autoComplete="email"
          />

          <Input
            label="Şifrə"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={<Lock size={20} />}
            fullWidth
            autoComplete="current-password"
          />

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Daxil ol
          </Button>
        </form>

        <div className="auth-footer">
          Hesabınız yoxdur?{' '}
          <Link to="/register" className="auth-link">
            Qeydiyyat
          </Link>
        </div>
      </div>
    </div>
  );
}