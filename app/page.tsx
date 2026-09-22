import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Handshake, MapPin, ShieldCheck, SlidersHorizontal, WalletCards } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { Reveal } from '@/components/reveal';
import { VehicleCard } from '@/components/vehicle-card';
import { LeadForm } from '@/components/lead-form';
import { getVehicles } from '@/lib/vehicles';
import { site } from '@/lib/config';
import storefront from '@/public/assets/fotoloja.png';
import logo from '@/public/assets/logo3dsemfundo.png';

const services = [
  { number: '01', title: 'COMPRA E VENDA', text: 'Conheça os veículos disponíveis e fale diretamente com nossa equipe.', href: '/veiculos', Icon: Handshake },
  { number: '02', title: 'TROCA DE VEÍCULO', text: 'Envie os dados do seu carro para solicitar uma avaliação.', href: '/venda-seu-veiculo', Icon: SlidersHorizontal },
  { number: '03', title: 'FINANCIAMENTO', text: 'Solicite uma simulação e consulte as condições disponíveis.', href: '/financiamento', Icon: WalletCards },
];

const features = ['VEÍCULOS SELECIONADOS', 'NEGOCIAÇÃO TRANSPARENTE', 'ATENDIMENTO PERSONALIZADO', 'LOJA EM UBÁ'];

export default async function Home() {
  const vehicles = await getVehicles(true);
  return <SiteShell><main>
    <section className="hero">
      <Image className="hero-image" src={storefront} alt="Fachada da Geral Veículos em Ubá" fill priority sizes="100vw" />
      <div className="wrap"><Reveal><div className="hero-copy">
        <div className="eyebrow">Geral Veículos • Ubá, MG</div>
        <h1 className="display">Seu próximo<br /><span>veículo</span><br />começa aqui.</h1>
        <p>Encontre boas oportunidades e escolha seu próximo veículo na Geral Veículos, em Ubá - MG.</p>
        <div className="hero-actions"><Link className="btn" href="/veiculos">Ver estoque <ArrowRight size={16} /></Link><a className="btn btn-outline" href={site.whatsapp} target="_blank">Falar no WhatsApp</a></div>
        <div className="hero-tags"><span>COMPRA</span><span>VENDA</span><span>TROCA</span><span>FINANCIAMENTO</span></div>
      </div></Reveal></div>
    </section>
    <section className="section"><div className="wrap">
      <div className="section-head"><div><div className="eyebrow">Estoque selecionado</div><h2 className="display">Veículos em destaque</h2></div><Link className="btn featured-stock-link" href="/veiculos">VER ESTOQUE COMPLETO <ArrowRight size={16} /></Link></div>
      {vehicles.length ? <><div className="vehicle-grid">{vehicles.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div><div className="featured-stock-cta"><div><div className="eyebrow">Mais opções para você</div><h3 className="display">Encontre seu próximo veículo</h3></div><Link className="btn" href="/veiculos">VER TODO O ESTOQUE <ArrowRight size={18} /></Link></div></> : <div className="empty"><div className="eyebrow">Estoque</div><h3 className="display">Novas oportunidades chegando</h3><p className="text-muted">Fale com nossa equipe para conhecer os veículos disponíveis.</p><a className="btn" href={site.whatsapp}>Consultar estoque</a></div>}
    </div></section>
    <section className="section services"><div className="wrap"><div className="eyebrow">Atendimento completo</div><h2 className="display" style={{ fontSize: 'clamp(46px,5vw,72px)', maxWidth: 620 }}>Tudo para facilitar sua próxima escolha.</h2><div style={{ marginTop: 38 }}>{services.map(({ number, title, text, href, Icon }) => <Link key={number} className="service-row" href={href}><strong>{number}</strong><div><Icon size={20} color="#c51f2b" /><h3>{title}</h3></div><p>{text}</p><ChevronRight size={22} /></Link>)}</div></div></section>
    <section className="section"><div className="wrap"><div className="eyebrow">Por perto, do jeito certo</div><h2 className="display" style={{ fontSize: 'clamp(46px,5vw,72px)', margin: '8px 0 18px' }}>Negociação do<br />jeito certo.</h2><p className="text-muted" style={{ maxWidth: 500 }}>Atendimento próximo para ajudar você a encontrar uma boa oportunidade.</p><div className="feature-grid" style={{ marginTop: 36 }}>{features.map((title, index) => <div className="feature" key={title}>{index === 0 ? <ShieldCheck size={24} /> : index === 1 ? <Handshake size={24} /> : index === 2 ? <SlidersHorizontal size={24} /> : <MapPin size={24} />}<h3>{title}</h3></div>)}</div></div></section>
    <section className="split"><div className="about-visual"><Image src={logo} alt="Logo Geral Veículos" /></div><div className="about-copy"><div className="eyebrow">Sobre a Geral Veículos</div><h2 className="display">Negócio é feito<br />com confiança.</h2><p>A Geral Veículos é uma loja de veículos em Ubá - MG, com atendimento voltado para quem busca boas oportunidades na hora de escolher seu próximo carro.</p><p>Consulte nosso estoque e fale diretamente com nossa equipe.</p><Link href="/sobre" className="btn btn-outline">Conheça a loja</Link></div></section>
    <section className="visit"><div className="visit-image"><Image src={storefront} alt="Fachada da Geral Veículos" fill sizes="(max-width: 900px) 100vw, 55vw" /></div><div className="visit-copy"><div className="eyebrow">Venha nos visitar</div><h2 className="display">Conheça a<br />Geral Veículos.</h2><p className="text-muted">Estamos em Ubá - MG. Venha conhecer nosso estoque e conversar com nossa equipe.</p><a className="btn" href={site.maps} target="_blank">Como chegar <MapPin size={16} /></a></div></section>
    <section className="section form-section"><div className="wrap form-grid"><div className="form-intro"><div className="eyebrow">Venda ou troca</div><h2 className="display">Venda ou<br />troca</h2><p className="text-muted">Envie os dados do seu veículo e fale com nossa equipe.</p></div><LeadForm type="trade" /></div></section>
    <section className="section finance"><div className="wrap form-grid"><div className="form-intro"><div className="eyebrow">Financiamento</div><h2 className="display">Simule seu<br />financiamento</h2><p className="text-muted">Envie seus dados para consultar as possibilidades de financiamento do veículo desejado.</p></div><LeadForm type="finance" /></div></section>
    <section className="section instagram"><div className="wrap"><div className="instagram-box"><Image src={logo} alt="Geral Veículos" /><div><div className="eyebrow">Instagram</div><h2 className="display" style={{ fontSize: 52, margin: '12px 0' }}>Acompanhe a<br />Geral Veículos</h2><p className="text-muted">Veja novidades e veículos no nosso Instagram.<br />{site.instagramHandle}</p></div><a className="btn" href={site.instagram} target="_blank">Seguir no Instagram</a></div></div></section>
    <section className="final-cta"><div className="wrap"><div className="eyebrow">Geral Veículos • Ubá, MG</div><h2 className="display">Seu próximo<br />veículo começa<br />aqui.</h2><a className="btn" href={site.whatsapp} target="_blank">Falar no WhatsApp</a></div></section>
  </main></SiteShell>;
}
