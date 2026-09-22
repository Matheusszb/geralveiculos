'use client';

import Link from 'next/link';
import { Download, Printer, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { money } from '@/lib/format';
import type { Vehicle } from '@/lib/types';

const columns: Array<{ status: Vehicle['status']; title: string; empty: string }> = [
  { status: 'available', title: 'Disponíveis', empty: 'Nenhum veículo disponível.' },
  { status: 'reserved', title: 'Reservados', empty: 'Nenhum veículo reservado.' },
  { status: 'sold', title: 'Vendidos', empty: 'Nenhum veículo vendido.' },
];

const statusLabels: Record<Vehicle['status'], string> = {
  available: 'Disponível', reserved: 'Reservado', sold: 'Vendido',
};

export function AdminVehicleBoard({ initialVehicles, isAdmin }: { initialVehicles: Vehicle[]; isAdmin: boolean }) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const filteredVehicles = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    if (!term) return vehicles;
    return vehicles.filter(vehicle => `${vehicle.brand} ${vehicle.model} ${vehicle.version || ''} ${vehicle.plate_end || ''}`.toLocaleLowerCase('pt-BR').includes(term));
  }, [search, vehicles]);

  async function changeStatus(vehicle: Vehicle, status: Vehicle['status']) {
    if (vehicle.status === status) return;
    setSavingId(vehicle.id);
    setVehicles(items => items.map(item => item.id === vehicle.id ? { ...item, status } : item));
    const { error } = await createClient().from('vehicles').update({ status, show_when_sold: false }).eq('id', vehicle.id);
    if (error) {
      setVehicles(items => items.map(item => item.id === vehicle.id ? vehicle : item));
      alert(`Não foi possível alterar o status: ${error.message}`);
    } else router.refresh();
    setSavingId(null);
  }

  async function remove(vehicle: Vehicle) {
    if (!confirm(`Excluir ${vehicle.brand} ${vehicle.model}? Esta ação não pode ser desfeita.`)) return;
    setSavingId(vehicle.id);
    const { error } = await createClient().from('vehicles').delete().eq('id', vehicle.id);
    if (error) alert(`Não foi possível excluir: ${error.message}`);
    else { setVehicles(items => items.filter(item => item.id !== vehicle.id)); router.refresh(); }
    setSavingId(null);
  }

  function exportCsv() {
    const rows = [['Veículo', 'Versão', 'Ano', 'Quilometragem', 'Placa final', 'Preço', 'Status'], ...vehicles.map(vehicle => [
      `${vehicle.brand} ${vehicle.model}`, vehicle.version || '', `${vehicle.year}/${vehicle.model_year}`, vehicle.mileage ? `${vehicle.mileage} km` : '', vehicle.plate_end || '', String(vehicle.price), statusLabels[vehicle.status],
    ])];
    const csv = '\uFEFF' + rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = 'estoque-geral-veiculos.csv'; link.click(); URL.revokeObjectURL(url);
  }

  function printStock() {
    const escape = (value: string | number | null) => String(value || '—').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] || character);
    const rows = vehicles.map(vehicle => `<tr><td><strong>${escape(`${vehicle.brand} ${vehicle.model}`)}</strong>${vehicle.version ? `<br><small>${escape(vehicle.version)}</small>` : ''}</td><td>${escape(`${vehicle.year}/${vehicle.model_year}`)}</td><td>${escape(vehicle.plate_end)}</td><td>${escape(money(vehicle.price))}</td><td>${escape(statusLabels[vehicle.status])}</td></tr>`).join('');
    const page = window.open('', '_blank', 'noopener,noreferrer');
    if (!page) { alert('Permita pop-ups neste navegador para imprimir o estoque.'); return; }
    page.document.write(`<!doctype html><html lang="pt-BR"><head><title>Estoque — Geral Veículos</title><style>body{font-family:Arial,sans-serif;color:#16181c;padding:28px}h1{margin:0;font-size:28px}p{color:#666;margin:7px 0 22px}table{border-collapse:collapse;width:100%;font-size:12px}th{text-align:left;background:#17191d;color:#fff;padding:11px}td{padding:11px;border-bottom:1px solid #ddd}small{color:#666}@media print{body{padding:0}}</style></head><body><h1>Geral Veículos — Estoque</h1><p>Relatório gerado em ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date())} · ${vehicles.length} veículo(s)</p><table><thead><tr><th>Veículo</th><th>Ano</th><th>Placa final</th><th>Preço</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
    page.document.close(); page.focus(); page.print();
  }

  return <>
    <div className="stock-toolbar"><label className="stock-search"><Search size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por nome, modelo ou final da placa" /></label><div><button className="export-button" onClick={exportCsv}><Download size={16} /> Exportar CSV</button><button className="export-button" onClick={printStock}><Printer size={16} /> Imprimir estoque</button></div></div>
    <div className="stock-board">{columns.map(column => {
      const items = filteredVehicles.filter(vehicle => vehicle.status === column.status);
      return <section className={`stock-column ${column.status}`} key={column.status}>
        <header><h2>{column.title}</h2><span>{items.length}</span></header>
        <div className="stock-list">{items.map(vehicle => <article className="stock-card" key={vehicle.id}>
          <div className="stock-card-title"><div><small>{vehicle.brand}</small><h3>{vehicle.model}</h3>{vehicle.version && <p>{vehicle.version}</p>}</div><strong>{money(vehicle.price)}</strong></div>
          <div className="stock-meta"><span>{vehicle.year}/{vehicle.model_year}</span><span>Placa final: {vehicle.plate_end || '—'}</span></div>
          {vehicle.internal_notes && <p className="stock-note">Anotações internas cadastradas</p>}
          {isAdmin && vehicle.status !== 'sold' ? <label className="stock-status">Status<select value={vehicle.status} disabled={savingId === vehicle.id} onChange={event => changeStatus(vehicle, event.target.value as Vehicle['status'])}><option value="available">Disponível</option><option value="reserved">Reservado</option></select></label> : <p className="stock-status-readonly">Status: <b>{statusLabels[vehicle.status]}</b></p>}
          <div className="stock-actions">{vehicle.status === 'available' && <Link className="thin-link" href={`/admin/vendas/registrar/${vehicle.id}`}>Registrar venda</Link>}{isAdmin && <Link className="thin-link" href={`/admin/veiculos/${vehicle.id}`}>Editar e anotações</Link>}{isAdmin && <button type="button" onClick={() => remove(vehicle)} disabled={savingId === vehicle.id} aria-label={`Excluir ${vehicle.brand} ${vehicle.model}`}><Trash2 size={15} /> Excluir</button>}</div>
        </article>)}</div>
        {!items.length && <p className="stock-empty">{column.empty}</p>}
      </section>;
    })}</div>
  </>;
}
