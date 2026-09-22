import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SiteShell } from '@/components/site-shell';
import { getVehicle } from '@/lib/vehicles';
import { money, km } from '@/lib/format';
import { whatsappLink } from '@/lib/config';
import { LeadForm } from '@/components/lead-form';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const vehicle = await getVehicle(params.slug);
  return {
    title: vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year} em Ubá MG | Geral Veículos` : 'Veículo | Geral Veículos',
    description: vehicle?.description || 'Consulte este veículo na Geral Veículos em Ubá - MG',
  };
}

export default async function Detail({ params }: { params: { slug: string } }) {
  const vehicle = await getVehicle(params.slug);
  if (!vehicle) return notFound();

  const images = [...(vehicle.vehicle_images || [])].sort((a, b) => a.position - b.position);
  const cover = images.find(image => image.url === vehicle.cover_image) || images[0];
  const label = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
  const specs = [
    ['Marca', vehicle.brand], ['Modelo', vehicle.model], ['Versão', vehicle.version],
    ['Ano fabricação', vehicle.year], ['Ano modelo', vehicle.model_year], ['Quilometragem', km(vehicle.mileage)],
    ['Câmbio', vehicle.transmission], ['Combustível', vehicle.fuel], ['Cor', vehicle.color],
    ['Portas', vehicle.doors], ['Final da placa', vehicle.plate_end],
  ].filter(([, value]) => value !== null && value !== undefined);

  return <SiteShell><main className="detail"><div className="wrap">
    <div className="crumb">Início / Veículos / {label}</div>
    <div className="detail-layout"><div>
      <div className="gallery-main">{cover && <Image src={cover.url} alt={label} fill sizes="(max-width: 900px) 100vw, 60vw" style={{ objectPosition: cover.object_position || '50% 50%' }} />}</div>
      <div className="eyebrow" style={{ marginTop: 30 }}>{vehicle.brand}</div>
      <h1 className="display detail-title">{vehicle.model}</h1>
      {vehicle.version && <p className="text-muted">{vehicle.version}</p>}
      <div className="specs">{specs.map(([name, value]) => <div className="spec" key={name as string}><span>{name}</span><b>{value as string}</b></div>)}</div>
      {vehicle.description && <section style={{ marginTop: 36 }}><div className="eyebrow">Descrição</div><p className="text-muted">{vehicle.description}</p></section>}
      {vehicle.features?.length ? <section style={{ marginTop: 36 }}><div className="eyebrow">Itens e opcionais</div><div className="feature-grid" style={{ marginTop: 15 }}>{vehicle.features.map(feature => <div className="feature" style={{ minHeight: 0, padding: 16 }} key={feature}>{feature}</div>)}</div></section> : null}
    </div><aside className="interest"><div className="eyebrow">Valor do veículo</div><div className="price">{money(vehicle.price)}</div><p className="text-muted">Fale com nossa equipe e tire todas as suas dúvidas.</p><a className="btn" target="_blank" href={whatsappLink(`Olá! Vi no site da Geral Veículos o ${label} e gostaria de mais informações.`)}>Tenho interesse</a><a className="btn btn-outline" href="#financiamento">Simular financiamento</a><a className="btn btn-outline" href="/venda-seu-veiculo">Tenho veículo para troca</a></aside></div>
    <section id="financiamento" className="section" style={{ paddingBottom: 0 }}><div className="form-grid"><div className="form-intro"><div className="eyebrow">Financiamento</div><h2 className="display">Faça sua<br />simulação</h2></div><LeadForm type="finance" vehicle={label} /></div></section>
  </div></main></SiteShell>;
}
