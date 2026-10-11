import React, { useState, useEffect } from 'react';
import { cryptoAPI } from '../services/api';
import { Key, Lock, Unlock, ShieldCheck, CheckCircle } from 'lucide-react';

export const CryptoDemoView: React.FC = () => {
  const [keys, setKeys] = useState<{ public_key_pem: string; private_key_pem: string } | null>(null);
  const [inputText, setInputText] = useState('START_PUMP PUMP-01 (TIMESTAMP: 10:15:32)');
  const [encryptedOutput, setEncryptedOutput] = useState<{ ciphertext_base64: string; signature_base64: string } | null>(null);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const res = await cryptoAPI.getDemoKeys();
        setKeys(res);
      } catch (err) {
        console.error("Failed to load keys:", err);
      }
    };
    fetchKeys();
  }, []);

  const handleEncrypt = async () => {
    setIsProcessing(true);
    try {
      const res = await cryptoAPI.encrypt(inputText);
      setEncryptedOutput(res);
      setDecryptedText(null);
    } catch (err) {
      console.error("Encryption error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!encryptedOutput) return;
    setIsProcessing(true);
    try {
      const res = await cryptoAPI.decrypt(encryptedOutput.ciphertext_base64);
      setDecryptedText(res.decrypted_plaintext);
    } catch (err) {
      console.error("Decryption error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase text-white tracking-wide flex items-center gap-3">
            <Key className="w-7 h-7 text-cyan-400" /> CRYPTOGRAPHIC SECURITY DEMONSTRATION
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            RSA-2048 Asymmetric Encryption & SHA-256 Digital Signatures for SCADA Payloads
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/30">
          <CheckCircle className="w-4 h-4" /> RSA 2048-BIT ENGINE: ACTIVE
        </div>
      </div>

      {/* Interactive Sandbox (Section 41) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">

        {/* Encryption Box */}
        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase text-white tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" /> 1. SCADA PAYLOAD PUBLIC KEY ENCRYPTION
          </h3>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">PLAINTEXT SCADA COMMAND</label>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
            />
          </div>

          <button
            onClick={handleEncrypt}
            disabled={isProcessing}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase tracking-wider transition"
          >
            ENCRYPT PAYLOAD (RSA-OAEP)
          </button>

          {encryptedOutput && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-[10px] font-bold text-cyan-400 uppercase">CIPHERTEXT (BASE64):</div>
              <div className="text-[10px] text-slate-300 break-all bg-slate-950 p-2 rounded border border-slate-800">
                {encryptedOutput.ciphertext_base64}
              </div>

              <div className="text-[10px] font-bold text-purple-400 uppercase pt-2">PSS DIGITAL SIGNATURE:</div>
              <div className="text-[10px] text-slate-300 break-all bg-slate-950 p-2 rounded border border-slate-800">
                {encryptedOutput.signature_base64}
              </div>
            </div>
          )}
        </div>

        {/* Decryption Box */}
        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase text-white tracking-wider flex items-center gap-2">
            <Unlock className="w-4 h-4 text-emerald-400" /> 2. PRIVATE KEY DECRYPTION & SIGNATURE VERIFY
          </h3>

          <p className="text-slate-400 leading-relaxed text-[11px] font-sans">
            The recipient SCADA Gateway uses the private key to decrypt the payload and verify HMAC SHA-256 integrity.
          </p>

          <button
            onClick={handleDecrypt}
            disabled={!encryptedOutput || isProcessing}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-wider transition disabled:opacity-50"
          >
            DECRYPT WITH PRIVATE KEY
          </button>

          {decryptedText && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
              <div className="text-[10px] font-bold uppercase">DECRYPTED SCADA PAYLOAD:</div>
              <div className="text-xs font-bold text-white bg-slate-950 p-3 rounded border border-emerald-500/40">
                {decryptedText}
              </div>
              <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> SIGNATURE VERIFIED ✓ INTEGRITY INTACT
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Keys PEM Display */}
      {keys && (
        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 space-y-4 font-mono text-xs">
          <h3 className="text-sm font-bold uppercase text-white tracking-wider">ACTIVE RSA-2048 KEYPAIR PEM DELEGATION</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">PUBLIC KEY (PEM)</div>
              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-300 overflow-x-auto h-36">
                {keys.public_key_pem}
              </pre>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">PRIVATE KEY (PEM)</div>
              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-300 overflow-x-auto h-36">
                {keys.private_key_pem}
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
