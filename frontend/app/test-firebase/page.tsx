'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function TestFirebase() {
  const [status, setStatus] = useState('Testando...');

  useEffect(() => {
    async function testConnection() {
      try {
        const testCollection = collection(db, 'test');
        await getDocs(testCollection);
        setStatus('Firebase conectado com sucesso!');
      } catch (error) {
        setStatus(`Erro: ${error}`);
      }
    }
    testConnection();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Conexão Firebase</h1>
      <p>{status}</p>
    </div>
  );
}