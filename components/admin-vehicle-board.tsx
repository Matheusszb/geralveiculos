'use client';

import Link from 'next/link';
import { Search, Trash2 } from 'lucide-react';
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

export function AdminVehicleBoard({ initialVehicles }: { initialVehicles: Vehicle[] }) {
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

  return <>
    <label className="stock-search"><Search size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por nome, modelo ou final da placa" /></label>
    <div className="stock-board">{columns.map(column => {
      const items = filteredVehicles.filter(vehicle => vehicle.status === column.status);
      return <section className={`stock-column ${column.status}`} key={column.status}>
        <header><h2>{column.title}</h2><span>{items.length}</span></header>
        <div className="stock-list">{items.map(vehicle => <article className="stock-card" key={vehicle.id}>
          <div className="stock-card-title"><div><small>{vehicle.brand}</small><h3>{vehicle.model}</h3>{vehicle.version && <p>{vehicle.version}</p>}</div><strong>{money(vehicle.price)}</strong></div>
          <div className="stock-meta"><span>{vehicle.year}/{vehicle.model_year}</span><span>Placa final: {vehicle.plate_end || '—'}</span></div>
          {vehicle.internal_notes && <p className="stock-note">Anotações internas cadastradas</p>}
          <label className="stock-status">Status<select value={vehicle.status} disabled={savingId === vehicle.id} onChange={event => changeStatus(vehicle, event.target.value as Vehicle['status'])}>{columns.map(option => <option value={option.status} key={option.status}>{statusLabels[option.status]}</option>)}</select></label>
          <div className="stock-actions"><Link className="thin-link" href={`/admin/veiculos/${vehicle.id}`}>Editar e anotações</Link><button type="button" onClick={() => remove(vehicle)} disabled={savingId === vehicle.id} aria-label={`Excluir ${vehicle.brand} ${vehicle.model}`}><Trash2 size={15} /> Excluir</button></div>
        </article>)}</div>
        {!items.length && <p className="stock-empty">{column.empty}</p>}
      </section>;
    })}</div>
  </>;
}
