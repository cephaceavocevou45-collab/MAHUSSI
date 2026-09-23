import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Message sent! We\'ll get back to you soon.', 'success');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink-800 mb-2">Get in Touch</h1>
        <p className="text-ink-500">We'd love to hear from you</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {[
            { icon: MapPin, title: 'Visit Us', value: '123 Avenue de la Paix, Dakar, Senegal' },
            { icon: Phone, title: 'Call Us', value: '+221 33 800 1234' },
            { icon: Mail, title: 'Email Us', value: 'contact@mahussi.com' },
            { icon: Clock, title: 'Opening Hours', value: 'Mon-Sun: 8:00 AM - 10:00 PM' },
          ].map((item, i) => (
            <div key={i} className="card p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-terracotta-50 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-terracotta-500" />
              </div>
              <div>
                <h3 className="font-semibold text-ink-800 text-sm">{item.title}</h3>
                <p className="text-sm text-ink-500 mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Your Name</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Jane Doe" />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea required value={message} onChange={e => setMessage(e.target.value)} rows={4} className="input resize-none" placeholder="How can we help?" />
          </div>
          <button type="submit" className="btn-primary w-full">
            <Send className="w-4 h-4" /> Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
