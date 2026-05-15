'use client';

import { useEffect, useState } from 'react';
import { getOrCreateDeviceId } from '@/lib/deviceId';

type TokenGateProps = {
  appCode: 'IN' | 'UB' | 'IF' | '9P';
  children: React.ReactNode;
};

export function TokenGate({ appCode, children }: TokenGateProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedToken = localStorage.getItem(`access_token_${appCode}`);

    if (!savedToken) {
      setLoading(false);
      return;
    }

    const deviceId = getOrCreateDeviceId();

    const validate = async () => {
      try {
        const res = await fetch(
          'https://serveapppedro.vercel.app/api/licenca',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: savedToken,
              deviceId,
            }),
          }
        );

        const data = await res.json();

        if (!res.ok || !data.allowed) {
          localStorage.removeItem(`access_ok_${appCode}`);
          localStorage.removeItem(`access_expires_${appCode}`);
          localStorage.removeItem(`access_token_${appCode}`);

          setAuthorized(false);
        } else {
          localStorage.setItem(`access_ok_${appCode}`, 'true');

          if (data.expires_at) {
            localStorage.setItem(
              `access_expires_${appCode}`,
              data.expires_at
            );
          }

          setAuthorized(true);
        }
      } catch (err) {
        console.error('Erro ao validar sessão', err);
      } finally {
        setLoading(false);
      }
    };

    validate();
  }, [appCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setSubmitting(true);

    try {
      const deviceId = getOrCreateDeviceId();
      const token = tokenInput.trim();

      const res = await fetch(
        'https://serveapppedro.vercel.app/api/licenca',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            deviceId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.allowed) {
        setError(data.reason || 'Acesso negado.');
        setSubmitting(false);
        return;
      }

      localStorage.setItem(`access_ok_${appCode}`, 'true');
      localStorage.setItem(`access_token_${appCode}`, token);

      if (data.expires_at) {
        localStorage.setItem(
          `access_expires_${appCode}`,
          data.expires_at
        );
      }

      setAuthorized(true);
    } catch (err) {
      console.error(err);
      setError('Erro ao validar token.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    // Retorna null para permitir que a splash screen do app seja exibida
    return null;
  }

  if (authorized) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ffe323]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl w-full max-w-sm space-y-4 mx-4 shadow-lg"
      >
        <div className="flex justify-center mb-2">
          <span className="text-[60px] font-black text-[#1a1a1a] tracking-tight">99</span>
        </div>

        <h1 className="text-[#1a1a1a] text-xl font-bold text-center">
          Acesso ao App
        </h1>

        <p className="text-gray-500 text-sm text-center">
          Digite seu token para acessar.
        </p>

        <input
          type="text"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="Ex: ADMINPEDRO1"
          className="w-full px-4 py-3 rounded-xl bg-gray-100 text-[#1a1a1a] outline-none border-2 border-transparent focus:border-[#ffe323] transition-colors"
        />

        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !tokenInput}
          className="w-full py-3 rounded-xl font-semibold bg-[#1a1a1a] text-white disabled:opacity-60 transition-opacity"
        >
          {submitting ? 'Validando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
