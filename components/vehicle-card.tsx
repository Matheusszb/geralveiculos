import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import { money, km } from '@/lib/format';
import { whatsappLink } from '@/lib/config';

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const title = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
  return <article className="vehicle-card">
    <Link href={`/veiculos/${vehicle.slug}`}><div className="vehicle-photo">{vehicle.cover_image ? <Image src={vehicle.cover_image} alt={title} fill sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw" /> : <div aria-label="Imagem indisponível" />}</div></Link>
    <div className="vehicle-body"><div className="vehicle-brand">{vehicle.brand}</div><h3 className="display">{vehicle.model}</h3><p className="vehicle-info">{vehicle.version || 'Versão sob consulta'}<br />{vehicle.year}/{vehicle.model_year} · {km(vehicle.mileage)} · {vehicle.transmission || 'Câmbio sob consulta'}</p><div className="vehicle-price">{money(vehicle.price)}</div><div className="card-actions"><Link className="thin-link" href={`/veiculos/${vehicle.slug}`}>VER DETALHES <ArrowUpRight size={15} /></Link><a className="thin-link" href={whatsappLink(`Olá! Vi no site da Geral Veículos o ${title} e gostaria de mais informações.`)} target="_blank">INTERESSE</a></div></div>
  </article>;
}
