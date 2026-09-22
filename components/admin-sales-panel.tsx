'use client';

import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AdminSalesHistory } from '@/components/admin-sales-history';
import { SaleRegisterForm } from '@/components/sale-register-form';
import { money } from '@/lib/format';
import type { Sale, Seller, UserProfile } from '@/lib/sales';
import type { Vehicle } from '@/lib/types';

export function AdminSalesPanel({ sales, sellers, vehicles, profile }: { sales: Sale[]; sellers: Seller[]; vehicles: Vehicle[]; profile: UserProfile }) {
  const [registering, setRegistering] = useState(false); const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null); const [search, setSearch] = useState('');
  const availableVehicles = useMemo(() => vehicles.filter(vehicle => vehicle.status === 'available' && `${vehicle.brand} ${vehicle.model} ${vehicle.version || ''} ${vehicle.plate_end || ''}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))), [vehicles, search]);
  const isAdmin = profile.role === 'admin'; const saleSellers = isAdmin ? sellers : [{ id: profile.id, full_name: profile.full_name }];
  function closeRegister() { setRegistering(false); setSelectedVehicle(null); setSearch(''); }
  if (selectedVehicle) return <section className="inline-sale"><button className="close-inline-sale" onClick={closeRegister}><X size={16} /> Voltar para vendas</button><SaleRegisterForm vehicle={selectedVehicle} sellers={saleSellers} currentSellerId={profile.id} isAdmin={isAdmin} onCancel={closeRegister} onSuccess={closeRegister} /></section>;
  if (registering) return <section className="vehicle-sale-picker"><div className="section-head"><div><div className="eyebrow">Registrar venda</div><h2 className="display">Selecione o veículo</h2></div><button className="close-inline-sale" onClick={closeRegister}><X size={16} /> Cancelar</button></div><label className="stock-search"><Search size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar veículo por marca, modelo ou placa" /></label><div className="sale-picker-grid">{availableVehicles.map(vehicle => <button key={vehicle.id} onClick={() => setSelectedVehicle(vehicle)}><small>{vehicle.brand}</small><b>{vehicle.model}</b><span>{vehicle.year}/{vehicle.model_year} · Placa final {vehicle.plate_end || '—'}</span><strong>{money(vehicle.price)}</strong></button>)}</div>{!availableVehicles.length && <p className="text-muted">Nenhum veículo disponível encontrado.</p>}</section>;
  return <><div className="section-head sales-header"><div><div className="eyebrow">Controle de vendas</div><h1 className="display" style={{ fontSize: 58, margin: 8 }}>{isAdmin ? 'Vendas' : 'Minhas vendas'}</h1></div><button className="btn" onClick={() => setRegistering(true)}>Registrar venda</button></div><AdminSalesHistory initialSales={sales} sellers={sellers} isAdmin={isAdmin} exportEnabled={isAdmin} /></>;
}
