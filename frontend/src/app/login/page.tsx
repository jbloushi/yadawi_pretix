'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { COLORS } from '@/lib/theme';


export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        // Store role in cookies for API calls
        let userRole = 'admin';
        if (email.includes('usher')) {
          userRole = 'usher';
        } else if (email.includes('viewer')) {
          userRole = 'viewer';
        }
        
        // Set cookie
        document.cookie = `yadawi_role=${userRole}; path=/; max-age=86400`;
        document.cookie = `yadawi_email=${email}; path=/; max-age=86400`;
        
        let redirectUrl = '/admin';
        if (userRole === 'usher') {
          redirectUrl = '/admin/checkin';
        } else if (userRole === 'viewer') {
          redirectUrl = '/admin/reports';
        }
        
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${COLORS.bark} 0%, #5D3A22 50%, ${COLORS.terracotta} 100%)`,
      padding: 20,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: COLORS.cream,
        borderRadius: 24,
        padding: 40,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${COLORS.terracotta}, #E8873A)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 28,
            color: 'white',
            fontWeight: 'bold',
            fontFamily: "'Playfair Display', serif",
          }}>
            ي
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 900,
            color: COLORS.bark,
            marginBottom: 8,
          }}>
            Yadawi Admin
          </h1>
          <p style={{ color: COLORS.smoke, fontSize: 14 }}>
            Sign in to manage your workshops
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '2px solid #FECACA',
              borderRadius: 12,
              padding: 12,
              marginBottom: 20,
              color: '#DC2626',
              fontSize: 14,
              fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: COLORS.bark,
              marginBottom: 8,
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 12,
                border: `2px solid ${COLORS.sand}`,
                background: COLORS.sand,
                fontSize: 15,
                color: COLORS.bark,
                outline: 'none',
              }}
              placeholder="admin@yadawi.com"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: COLORS.bark,
              marginBottom: 8,
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 12,
                border: `2px solid ${COLORS.sand}`,
                background: COLORS.sand,
                fontSize: 15,
                color: COLORS.bark,
                outline: 'none',
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 14,
              background: loading ? '#9CA3AF' : `linear-gradient(135deg, ${COLORS.terracotta}, #E8873A)`,
              color: 'white',
              border: 'none',
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: 24,
          padding: 16,
          background: COLORS.sand,
          borderRadius: 12,
          fontSize: 13,
          color: COLORS.smoke,
          textAlign: 'center',
        }}>
          <strong>Demo Credentials:</strong><br/>
          admin@yadawi.com / admin123<br/>
          usher@yadawi.com / usher123<br/>
          viewer@yadawi.com / viewer123
        </div>
      </div>
    </div>
  );
}
