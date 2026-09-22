'use client';

import { Download, Search, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { money } from '@/lib/format';
import type { Sale, Seller } from '@/lib/sales';

const dateLabel = (date: string) => new Intl.DateTimeFormat('pt-BR').format(new Date(`${date}T12:00:00`));
const toDate = (date: string) => new Date(`${date}T12:00:00`);

export function AdminSalesHistory({ initialSales, sellers, isAdmin, exportEnabled = false }: { initialSales: Sale[]; sellers: Seller[]; isAdmin: boolean; exportEnabled?: boolean }) {
  const router = useRouter();
  const [sales, setSales] = useState(initialSales); const [search, setSearch] = useState(''); const [sellerId, setSellerId] = useState(''); const [status, setStatus] = useState('all'); const [period, setPeriod] = useState('all'); const [from, setFrom] = useState(''); const [to, setTo] = useState(''); const [busyId, setBusyId] = useState<string | null>(null);
  const filtered = useMemo(() => {
    const now = new Date(); const term = search.toLocaleLowerCase('pt-BR');
    return sales.filter(sale => {
      const haystack = `${sale.vehicle?.brand || ''} ${sale.vehicle?.model || ''} ${sale.vehicle?.plate_end || ''} ${sale.seller?.full_name || ''}`.toLocaleLowerCase('pt-BR');
      if (term && !haystack.includes(term)) return false;
      if (sellerId && sale.seller_id !== sellerId) return false;
      if (status !== 'all' && sale.status !== status) return false;
      const date = toDate(sale.sale_date);
      if (period === 'today' && date.toDateString() !== now.toDateString()) return false;
      if (period === 'week') { const start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0, 0, 0, 0); if (date < start) return false; }
      if (period === 'month' && (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear())) return false;
      if (period === 'year' && date.getFullYear() !== now.getFullYear()) return false;
      if (period === 'custom' && from && date < toDate(from)) return false;
      if (period === 'custom' && to && date > toDate(to)) return false;
      return true;
    });
  }, [sales, search, sellerId, status, period, from, to]);
  const completed = filtered.filter(sale => sale.status === 'completed'); const total = completed.reduce((sum, sale) => sum + Number(sale.sale_price), 0);

  async function cancel(sale: Sale) {
    if (!confirm(`Tem certeza que deseja cancelar esta venda? O ${sale.vehicle?.brand || 'veículo'} voltará para o estoque.`)) return;
    setBusyId(sale.id); const { error } = await createClient().rpc('cancel_sale', { p_sale_id: sale.id });
    if (error) alert(`Não foi possível cancelar: ${error.message}`); else { setSales(items => items.map(item => item.id === sale.id ? { ...item, status: 'cancelled' } : item)); router.refresh(); }
    setBusyId(null);
  }

  function exportCsv() {
    const rows = [['Veículo', 'Ano', 'Placa', 'Vendedor', 'Anunciado', 'Vendido', 'Diferença', 'Data', 'Status'], ...filtered.map(sale => [`${sale.vehicle?.brand || ''} ${sale.vehicle?.model || ''}`, String(sale.vehicle?.year || ''), sale.vehicle?.plate_end || '', sale.seller?.full_name || '', String(sale.advertised_price), String(sale.sale_price), String(Number(sale.advertised_price) - Number(sale.sale_price)), sale.sale_date, sale.status === 'completed' ? 'Concluída' : 'Cancelada'])];
    const csv = '\uFEFF' + rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(';')).join('\n'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = 'relatorio-vendas.csv'; link.click(); URL.revokeObjectURL(url);
  }

  return <><div className="sales-filters"><label className="stock-search"><Search size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar veículo, vendedor ou placa" /></label>{isAdmin && <select value={sellerId} onChange={event => setSellerId(event.target.value)}><option value="">Todos os vendedores</option>{sellers.map(seller => <option value={seller.id} key={seller.id}>{seller.full_name || 'Sem nome'}</option>)}</select>}<select value={status} onChange={event => setStatus(event.target.value)}><option value="all">Todas as vendas</option><option value="completed">Concluídas</option><option value="cancelled">Canceladas</option></select><select value={period} onChange={event => setPeriod(event.target.value)}><option value="all">Todo período</option><option value="today">Hoje</option><option value="week">Esta semana</option><option value="month">Este mês</option><option value="year">Este ano</option><option value="custom">Período personalizado</option></select>{period === 'custom' && <><input type="date" value={from} onChange={event => setFrom(event.target.value)} /><input type="date" value={to} onChange={event => setTo(event.target.value)} /></>}{exportEnabled && <button className="export-button" onClick={exportCsv}><Download size={16} /> CSV</button>}</div>
    <div className="sales-summary"><span>{completed.length} vendas concluídas</span><strong>{money(total)}</strong><span>Ticket médio: {money(completed.length ? total / completed.length : 0)}</span></div>
    <div className="sales-table-wrap"><table className="admin-table sales-table"><thead><tr><th>Veículo</th><th>Vendedor</th><th>Anunciado</th><th>Vendido</th><th>Diferença</th><th>Data</th><th>Status</th>{isAdmin && <th>Ações</th>}</tr></thead><tbody>{filtered.map(sale => { const difference = Number(sale.advertised_price) - Number(sale.sale_price); return <tr key={sale.id}><td><b>{sale.vehicle?.brand} {sale.vehicle?.model}</b><br /><small>{sale.vehicle?.year} · placa final {sale.vehicle?.plate_end || '—'}</small></td><td>{sale.seller?.full_name || 'Vendedor'}</td><td>{money(Number(sale.advertised_price))}</td><td>{money(Number(sale.sale_price))}</td><td className={difference > 0 ? 'discount' : ''}>{difference > 0 ? `Desconto ${money(difference)}` : difference < 0 ? `+${money(Math.abs(difference))}` : '—'}</td><td>{dateLabel(sale.sale_date)}</td><td><span className={`sale-status ${sale.status}`}>{sale.status === 'completed' ? 'Concluída' : 'Cancelada'}</span></td>{isAdmin && <td>{sale.status === 'completed' && <button className="cancel-sale" disabled={busyId === sale.id} onClick={() => cancel(sale)}><XCircle size={15} /> Cancelar</button>}</td>}</tr>; })}</tbody></table></div>{!filtered.length && <p className="text-muted">Nenhuma venda encontrada com estes filtros.</p>}</>;
}
