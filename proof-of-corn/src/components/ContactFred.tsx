'use client';

import { useState } from 'react';

export function ContactFred() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      // Send via mailto for now (will be replaced with API when email is set up)
      const subject = encodeURIComponent(`[${category}] Message from ${name}`);
      const body = encodeURIComponent(`From: ${name} <${email}>\nCategory: ${category}\n\n${message}`);

      // Open mailto link
      window.location.href = `mailto:fred@proofofcorn.com?subject=${subject}&body=${body}`;

      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
      setCategory('general');

      // Reset status after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl">
          🌽
        </div>
        <div>
          <h3 className="font-bold text-zinc-900">Contact Farmer Fred</h3>
          <p className="text-sm text-zinc-500">Fred reads every message</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:ring-amber-500 focus:border-amber-500"
              placeholder="John Farmer"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:ring-amber-500 focus:border-amber-500"
              placeholder="john@farm.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-zinc-700 mb-1">
            I am a...
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="farmer">Farmer / Land Owner</option>
            <option value="operator">Farm Operator / Contractor</option>
            <option value="vendor">Vendor / Supplier</option>
            <option value="developer">Developer / Vibe Coder</option>
            <option value="investor">Investor</option>
            <option value="general">General Inquiry</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-zinc-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:ring-amber-500 focus:border-amber-500 resize-none"
            placeholder="Tell Fred about your land, expertise, or ideas..."
          />
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          className={`w-full py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
            status === 'sent'
              ? 'bg-green-600 text-white'
              : status === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-amber-600 hover:bg-amber-700 text-white'
          } disabled:opacity-50`}
        >
          {status === 'sending' && 'Opening email...'}
          {status === 'sent' && 'Email client opened!'}
          {status === 'error' && 'Error - try again'}
          {status === 'idle' && 'Send Message to Fred'}
        </button>

        <p className="text-xs text-zinc-500 text-center">
          Fred processes emails as part of his daily check routine.
          Priority given to farmers and operators.
        </p>
      </form>
    </div>
  );
}
