'use client';

import axiosClient from '@/services/axiosClient'; // senin axios ayar dosyan
import type { User } from '@/types/user';

function generateToken(): string {
  // Sadece fallback ya da test için tutabilirsin, 
  // gerçekte bu fonksiyona gerek kalmayabilir
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

const user = {
  id: 'USR-000',
  avatar: '/assets/avatar.png',
  firstName: 'Sofia',
  lastName: 'Rivers',
  email: 'sofia@devias.io',
} satisfies User;

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
    role_id?: number;

}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  token?: string;
  email?: string;
  newPassword?: string;
}

class AuthClient {
  // signUp
  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    try {
      // Örnek: POST /api/auth/register
      // Request body: { email, password, name, vb. } -> projene göre uyarlayabilirsin
   await axiosClient.post('/auth/register', {
        email: params.email,
        password: params.password,
    
        name: `${params.firstName} ${params.lastName}`,
        role_id: params.role_id ?? 2,
      });


      
      return {};
    } catch (err: any) {
      console.error('signUp error:', err);
      return { error: err.response?.data?.message || 'SignUp failed' };
    }
  }

  // signInWithOAuth
  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    // Genellikle sosyal login, backend'e redirect veya popup ile yapılır.
    // Şimdilik "not implemented" döndürelim:
    return { error: 'Social authentication not implemented' };
  }

  // signInWithPassword
  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { email, password } = params;

    try {
      // Örnek: POST /api/auth/login
      // Request body: { email, password }
      const resp = await axiosClient.post('/auth/login', {
        email,
        password
      });

      // resp.data => { token: "...", user: {...}, ... }
      const { token, refreshToken, user, message } = resp.data as any;
      if (!token) {
        return { error: 'Login failed: No token returned' };
      }

      // Token'ı localStorage'a yaz
   try {
        localStorage.setItem('custom-auth-token', token);
        if (refreshToken) {
          localStorage.setItem('custom-refresh-token', refreshToken);
        }
        const payload = { message, token, refreshToken, user };
        localStorage.setItem('auth-data', JSON.stringify(payload));
      } catch (storageError) {
        console.error('localStorage error:', storageError);
      }

      return {};
    } catch (err: any) {
      console.error('signInWithPassword error:', err);
      return { error: err.response?.data?.message || 'Invalid credentials' };
    }
  }

  // resetPassword
  async resetPassword(params: ResetPasswordParams): Promise<{ error?: string }> {
    try {
      // Örnek: POST /api/auth/resetPassword
     await axiosClient.post('/auth/forgotPassword', {
        email: params.email,
      });
      return {};
    } catch (err: any) {
      console.error('resetPassword error:', err);
      return { error: err.response?.data?.message || 'Reset password failed' };
    }
  }

  // updatePassword
  async updatePassword(params: { token: string; newPassword: string }): Promise<{ error?: string }> {
    try {
      // Örnek: PUT /api/auth/updatePassword
     await axiosClient.post('/auth/resetPassword', {
        token: params.token,
        newPassword: params.newPassword,
      });
      return {};
    } catch (err: any) {
      console.error('updatePassword error:', err);
      return { error: err.response?.data?.message || 'Update password failed' };
    }
  }
  async verifyEmail(token: string): Promise<{ error?: string; message?: string }> {
    try {
      const resp = await axiosClient.get<{ message: string }>('/auth/verifyEmail', { params: { token } });
      return { message: resp.data?.message };
    } catch (err: any) {
      console.error('verifyEmail error:', err);
      return { error: err.response?.data?.message || 'Verification failed' };
    }
  }
  // getUser
  async getUser(): Promise<{ data?: User | null; error?: string }> {
    // localStorage'da token varsa, profile endpoint'inden user bilgisi çek
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      return { data: null };
    }

    try {
      // Örnek: GET /api/auth/profile
      // Autorization header (Bearer) interceptor'da ekleniyor olabilir
      const resp = await axiosClient.get('/auth/profile');
      // resp.data => { id, email, firstName, lastName, ... }
      return { data: resp.data as User };
    } catch (err: any) {
      console.error('getUser error:', err);
      return { error: err.response?.data?.message || 'Cannot fetch user' };
    }
  }

  // signOut
  async signOut(): Promise<{ error?: string }> {
    try {
      // İsteğe bağlı: POST /api/auth/logout
      // Bazı projelerde backend'e token invalidation isteği atılabilir.

      // Biz sade token sileriz
      localStorage.removeItem('custom-auth-token');
      localStorage.removeItem('custom-refresh-token');
      localStorage.removeItem('auth-data');
            return {};
    } catch (err: any) {
      console.error('signOut error:', err);
      return { error: 'Sign out failed' };
    }
  }
}

export const authClient = new AuthClient();
