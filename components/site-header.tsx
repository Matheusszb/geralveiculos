'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import logo from '@/public/assets/logo3dsemfundo.png';
import { site } from '@/lib/config';

const links = [['Início', '/'], ['Veículos', '/veiculos'], ['Venda seu veículo', '/venda-seu-veiculo'], ['Financiamento', '/financiamento'], ['Sobre', '/sobre'], ['Localização', '/contato'], ['Contato', '/contato']];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="header"><div className="wrap">
    <Link className="brand" href="/"><Image src={logo} alt="Geral Veículos" priority sizes="174px" /></Link>
    <nav className="nav">{links.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</nav>
    <a href={site.whatsapp} className="btn" target="_blank">Falar no WhatsApp</a>
    <button className="menu-toggle" aria-label="Abrir menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    <nav className={`mobile-nav ${open ? 'open' : ''}`}>{links.map(([label, href]) => <Link onClick={() => setOpen(false)} key={label} href={href}>{label}</Link>)}<a href={site.whatsapp} className="btn" target="_blank">Falar no WhatsApp</a></nav>
  </div></header>;
}
