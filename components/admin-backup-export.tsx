'use client';

import { Download, FileJson, TableProperties } from 'lucide-react';
import type { Sale } from '@/lib/sales';
import type { Vehicle } from '@/lib/types';

function download(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
}
function csv(rows: Array<Array<string | number | null | undefined>>) { return '\uFEFF' + rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(';')).join('\n'); }

export function AdminBackupExport({ vehicles, sales }: { vehicles: Vehicle[]; sales: Sale[] }) {
  const stamp = new Date().toISOString().slice(0, 10);
  function fullBackup() { download(JSON.stringify({ generated_at: new Date().toISOString(), vehicles, sales }, null, 2), `backup-geral-veiculos-${stamp}.json`, 'application/json'); }
  function vehiclesCsv() { download(csv([['Veículo', 'Versão', 'Ano', 'Km', 'Preço', 'Placa final', 'Status', 'Destaque'], ...vehicles.map(vehicle => [`${vehicle.brand} ${vehicle.model}`, vehicle.version, `${vehicle.year}/${vehicle.model_year}`, vehicle.mileage, vehicle.price, vehicle.plate_end, vehicle.status, vehicle.featured ? 'Sim' : 'Não'])]), `veiculos-${stamp}.csv`, 'text/csv;charset=utf-8'); }
  function salesCsv() { download(csv([['Veículo', 'Vendedor', 'Anunciado', 'Vendido', 'Data', 'Cliente', 'Status'], ...sales.map(sale => [`${sale.vehicle?.brand || ''} ${sale.vehicle?.model || ''}`, sale.seller?.full_name, sale.advertised_price, sale.sale_price, sale.sale_date, sale.customer_name, sale.status])]), `vendas-${stamp}.csv`, 'text/csv;charset=utf-8'); }
  return <div className="backup-grid"><button onClick={fullBackup}><FileJson size={24} /><span><b>Backup completo</b><small>JSON com todos os veículos e vendas.</small></span><Download size={18} /></button><button onClick={vehiclesCsv}><TableProperties size={24} /><span><b>Exportar veículos</b><small>Planilha CSV com {vehicles.length} veículo(s).</small></span><Download size={18} /></button><button onClick={salesCsv}><TableProperties size={24} /><span><b>Exportar vendas</b><small>Planilha CSV com {sales.length} venda(s).</small></span><Download size={18} /></button></div>;
}
