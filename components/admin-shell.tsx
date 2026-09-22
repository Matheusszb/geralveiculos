'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import logo from '@/public/assets/logo3dsemfundo.png';
import { AdminSignOut } from './admin-sign-out';

const links = [
  ['Dashboard', '/admin'],
  ['Veículos', '/admin/veiculos'],
  ['Adicionar veículo', '/admin/veiculos/novo'],
  ['Vendas', '/admin/vendas'],
  ['Vendedores', '/admin/vendedores'],
  ['Backup', '/admin/backup'],
  ['Minha senha', '/admin/minha-conta'],
  ['Leads', '/admin/leads'],
  ['Configurações', '/admin/configuracoes'],
  ['Ver site', '/'],
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <main className="admin"><div className="admin-shell"><aside className="admin-side">
    <div className="admin-bar"><Image src={logo} alt="Geral Veículos" /><button className="admin-menu-toggle" aria-label="Abrir menu administrativo" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div>
    <nav className={`admin-nav ${open ? 'open' : ''}`}>{links.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)}>{label}</Link>)}<AdminSignOut /></nav>
  </aside><section className="admin-main">{children}</section></div></main>;
}
