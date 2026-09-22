'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { money } from '@/lib/format';
import type { Seller } from '@/lib/sales';

type SaleVehicle = { id: string; brand: string; model: string; version: string | null; year: number; price: number; cover_image: string | null };

export function SaleRegisterForm({ vehicle, sellers, currentSellerId, isAdmin, onCancel, onSuccess }: { vehicle: SaleVehicle; sellers: Seller[]; currentSellerId: string; isAdmin: boolean; onCancel?: () => void; onSuccess?: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const today = new Date().toISOString().slice(0, 10);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const form = new FormData(event.currentTarget);
    const sellerId = String(form.get('seller_id') || currentSellerId);
    const price = Number(form.get('sale_price'));
    const date = String(form.get('sale_date') || today);
    const seller = sellers.find(item => item.id === sellerId)?.full_name || 'vendedor selecionado';
    if (!sellerId || !Number.isFinite(price) || price < 0) { setError('Informe o vendedor e um valor de venda válido.'); return; }
    if (!confirm(`Tem certeza que deseja registrar este veículo como vendido?\n\nVeículo: ${vehicle.brand} ${vehicle.model}\nVendedor: ${seller}\nValor: ${money(price)}\nData: ${new Intl.DateTimeFormat('pt-BR').format(new Date(`${date}T12:00:00`))}`)) return;
    setBusy(true);
    const { error: rpcError } = await createClient().rpc('record_sale', { p_vehicle_id: vehicle.id, p_seller_id: sellerId, p_sale_price: price, p_sale_date: date, p_customer_name: String(form.get('customer_name') || ''), p_notes: String(form.get('notes') || '') });
    if (rpcError) { setError(rpcError.message); setBusy(false); return; }
    if (onSuccess) { onSuccess(); router.refresh(); return; }
    router.push('/admin/vendas?success=Venda registrada com sucesso.'); router.refresh();
  }

  return <form className="form-card sale-form" onSubmit={submit}>
    <div className="sale-vehicle-summary">{vehicle.cover_image && <Image src={vehicle.cover_image} alt={`${vehicle.brand} ${vehicle.model}`} width={170} height={110} />}<div><div className="eyebrow">Veículo</div><h2 className="display">{vehicle.brand} {vehicle.model}</h2>{vehicle.version && <p>{vehicle.version}</p>}<p>{vehicle.year} · Anunciado: <b>{money(vehicle.price)}</b></p></div></div>
    <div className="form-fields">
      {isAdmin ? <label className="full">Vendedor<select name="seller_id" required defaultValue=""><option value="">Selecione o vendedor</option>{sellers.map(seller => <option value={seller.id} key={seller.id}>{seller.full_name || 'Vendedor sem nome'}</option>)}</select></label> : <><input type="hidden" name="seller_id" value={currentSellerId} /><label className="full">Vendedor<input value={sellers[0]?.full_name || 'Sua conta'} disabled /></label></>}
      <label>Valor anunciado<input value={money(vehicle.price)} disabled /></label><label>Valor final da venda<input name="sale_price" type="number" min="0" step="0.01" defaultValue={vehicle.price} required /></label>
      <label>Data da venda<input name="sale_date" type="date" defaultValue={today} disabled={!isAdmin} /></label><label>Cliente (opcional)<input name="customer_name" /></label>
      <label className="full">Observações (opcional)<textarea name="notes" /></label>
    </div>
    {error && <p className="seller-error">{error}</p>}<div className="sale-form-actions"><button type="button" className="btn btn-outline" onClick={() => onCancel ? onCancel() : router.back()}>Cancelar</button><button className="btn" disabled={busy || (isAdmin && !sellers.length)}>{busy ? 'Registrando…' : 'Confirmar venda'}</button></div>
  </form>;
}
