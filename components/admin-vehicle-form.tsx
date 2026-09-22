'use client';
import { useState, type FormEvent } from 'react';
import { ChevronLeft, ChevronRight, Star, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Vehicle } from '@/lib/types';

const options = [
  'Ar-condicionado', 'Ar-condicionado digital', 'Vidros elétricos', 'Travas elétricas',
  'Alarme', 'Chave presencial / Keyless', 'Partida por botão', 'Computador de bordo', 'Volante multifuncional',
  'Controle de som no volante', 'Central multimídia', 'Apple CarPlay / Android Auto', 'GPS',
  'Bluetooth', 'Sensor de chuva', 'Farol de neblina', 'Faróis de LED', 'Retrovisores elétricos',
  'Retrovisores rebatíveis eletricamente', 'Rodas de liga leve', 'Controle de tração', 'Controle de estabilidade',
  'Freios ABS', 'Airbags', 'Câmera de ré', 'Câmera 360°', 'Sensor dianteiro',
  'Sensor traseiro', 'Teto solar', 'Bancos em couro', 'Bancos elétricos', 'Ajuste de altura do banco do motorista',
  'Piloto automático', 'Piloto automático adaptativo',
];
type Editable = Record<string, string | number | undefined>;
type GalleryItem = { key: string; id?: string; file?: File; url: string; x: number; y: number };
const parsePosition = (position?: string | null) => { const match = position?.match(/(\d+)%\s+(\d+)%/); return { x: Number(match?.[1] || 50), y: Number(match?.[2] || 50) }; };

export function AdminVehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>(() => [...(vehicle?.vehicle_images || [])].sort((a, b) => a.position - b.position).map(image => ({ key: image.id, id: image.id, url: image.url, ...parsePosition(image.object_position) })));
  const values = vehicle as unknown as Editable;
  const field = (name: string, label: string, type = 'text') => <label>{label}<input name={name} type={type} required={['brand', 'model', 'year', 'model_year', 'price'].includes(name)} defaultValue={values?.[name] ?? ''} /></label>;
  const updateItem = (key: string, patch: Partial<GalleryItem>) => setGallery(items => items.map(item => item.key === key ? { ...item, ...patch } : item));
  const move = (index: number, direction: -1 | 1) => setGallery(items => { const target = index + direction; if (target < 0 || target >= items.length) return items; const copy = [...items]; [copy[index], copy[target]] = [copy[target], copy[index]]; return copy; });
  const setCover = (index: number) => setGallery(items => { const copy = [...items]; const [item] = copy.splice(index, 1); return item ? [item, ...copy] : items; });
  const remove = (item: GalleryItem) => { if (item.id) setDeletedImageIds(ids => [...ids, item.id!]); if (item.file) URL.revokeObjectURL(item.url); setGallery(items => items.filter(entry => entry.key !== item.key)); };
  const addFiles = (files: FileList | null) => { if (!files) return; const newItems = Array.from(files).filter(file => file.type.startsWith('image/')).map(file => ({ key: crypto.randomUUID(), file, url: URL.createObjectURL(file), x: 50, y: 50 })); setGallery(items => [...items, ...newItems]); };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    const form = new FormData(event.currentTarget); const db = createClient(); const brand = String(form.get('brand')); const model = String(form.get('model')); const steeringType = String(form.get('steering_type') || ''); const internalNotes = String(form.get('internal_notes') || '');
    const data = { slug: `${brand}-${model}-${form.get('year')}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), brand, model, version: String(form.get('version') || '') || null, year: Number(form.get('year')), model_year: Number(form.get('model_year')), price: Number(form.get('price')), mileage: Number(form.get('mileage')) || null, transmission: String(form.get('transmission') || '') || null, ...(steeringType ? { steering_type: steeringType } : {}), fuel: String(form.get('fuel') || '') || null, color: String(form.get('color') || '') || null, doors: Number(form.get('doors')) || null, plate_end: String(form.get('plate_end') || '') || null, description: String(form.get('description') || '') || null, ...(internalNotes ? { internal_notes: internalNotes } : {}), features: options.filter(option => form.get(`feature-${option}`) === 'on'), status: String(form.get('status')) as Vehicle['status'], featured: form.get('featured') === 'on', show_when_sold: form.get('show_when_sold') === 'on' };
    let id = vehicle?.id;
    if (id) { const { error } = await db.from('vehicles').update(data).eq('id', id); if (error) { alert(error.message); setBusy(false); return; } }
    else { let result = await db.from('vehicles').insert(data).select('id').single(); if (result.error?.code === '23505') result = await db.from('vehicles').insert({ ...data, slug: `${data.slug}-${crypto.randomUUID().slice(0, 6)}` }).select('id').single(); const { data: created, error } = result; if (error || !created) { alert(error?.message || 'Não foi possível salvar'); setBusy(false); return; } id = created.id; }
    if (!id) { alert('Não foi possível identificar o veículo salvo.'); setBusy(false); return; }
    if (deletedImageIds.length) await db.from('vehicle_images').delete().in('id', deletedImageIds);
    const finalGallery: GalleryItem[] = [];
    for (let index = 0; index < gallery.length; index += 1) {
      const item = gallery[index]; const object_position = `${item.x}% ${item.y}%`;
      if (item.file) { const path = `${id}/${crypto.randomUUID()}-${item.file.name}`; const { error } = await db.storage.from('vehicle-images').upload(path, item.file); if (error) { alert(`Não foi possível enviar ${item.file.name}: ${error.message}`); setBusy(false); return; } const { data: publicUrl } = db.storage.from('vehicle-images').getPublicUrl(path); const uploaded = { ...item, url: publicUrl.publicUrl }; const { error: imageError } = await db.from('vehicle_images').insert({ vehicle_id: id, url: uploaded.url, position: index, object_position }); if (imageError) { const { error: legacyError } = await db.from('vehicle_images').insert({ vehicle_id: id, url: uploaded.url, position: index }); if (legacyError) { alert(`O veículo foi salvo, mas a foto não: ${legacyError.message}`); setBusy(false); return; } } finalGallery.push(uploaded); }
      else { const { error: imageError } = await db.from('vehicle_images').update({ position: index, object_position }).eq('id', item.id!); if (imageError) await db.from('vehicle_images').update({ position: index }).eq('id', item.id!); finalGallery.push(item); }
    }
    await db.from('vehicles').update({ cover_image: finalGallery[0]?.url || null }).eq('id', id);
    router.push('/admin/veiculos'); router.refresh();
  }

  return <form className="form-card" onSubmit={submit}><div className="form-fields">
    {field('brand', 'Marca')}{field('model', 'Modelo')}{field('version', 'Versão')}{field('year', 'Ano fabricação', 'number')}{field('model_year', 'Ano modelo', 'number')}{field('price', 'Preço', 'number')}{field('mileage', 'Quilometragem', 'number')}
    <label>Câmbio<select name="transmission" defaultValue={vehicle?.transmission || ''}><option value="">Selecione</option><option>Manual</option><option>Automático</option><option>Automatizado</option></select></label><label>Tipo de direção<select name="steering_type" defaultValue={vehicle?.steering_type || ''}><option value="">Selecione</option><option>Hidráulica</option><option>Elétrica</option><option>Eletro-hidráulica</option><option>Mecânica</option></select></label><label>Combustível<select name="fuel" defaultValue={vehicle?.fuel || ''}><option value="">Selecione</option><option>Flex</option><option>Gasolina</option><option>Etanol</option><option>Diesel</option><option>Elétrico</option><option>Híbrido</option></select></label>
    {field('color', 'Cor')}{field('doors', 'Portas', 'number')}{field('plate_end', 'Final da placa')}<label>Status<select name="status" defaultValue={vehicle?.status || 'available'}><option value="available">Disponível</option><option value="reserved">Reservado</option><option value="sold">Vendido</option></select></label>
    <label className="full">Descrição<textarea name="description" defaultValue={vehicle?.description || ''} /></label><label className="full">Anotações internas<textarea name="internal_notes" defaultValue={vehicle?.internal_notes || ''} placeholder="Visível apenas no painel administrativo." /></label>
    <div className="full image-upload"><label>Fotos do veículo<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={event => { addFiles(event.target.files); event.currentTarget.value = ''; }} /></label><small>{gallery.length ? `${gallery.length} foto${gallery.length === 1 ? '' : 's'} adicionada${gallery.length === 1 ? '' : 's'}. ` : ''}Você pode tirar ou escolher mais fotos uma por vez: toque em “Escolher arquivos” novamente. A primeira sempre será a capa.</small></div>
    {gallery.length > 0 && <div className="full gallery-manager"><div className="gallery-head"><b>Galeria e enquadramento</b><small>Use os controles para definir capa, ordem e o foco do recorte.</small></div><div className="gallery-grid">{gallery.map((item, index) => <article className="gallery-item" key={item.key}><div className="gallery-preview"><img src={item.url} alt={`Foto ${index + 1} do veículo`} style={{ objectPosition: `${item.x}% ${item.y}%` }} />{index === 0 && <span className="cover-badge"><Star size={12} fill="currentColor" /> CAPA</span>}</div><div className="gallery-actions"><button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Mover foto para trás"><ChevronLeft size={17} /></button><button type="button" onClick={() => move(index, 1)} disabled={index === gallery.length - 1} aria-label="Mover foto para frente"><ChevronRight size={17} /></button><button type="button" onClick={() => setCover(index)} className="set-cover" disabled={index === 0}>Definir capa</button><button type="button" onClick={() => remove(item)} className="remove-photo" aria-label="Remover foto"><Trash2 size={16} /></button></div><label>Enquadramento horizontal<input type="range" min="0" max="100" value={item.x} onChange={event => updateItem(item.key, { x: Number(event.target.value) })} /></label><label>Enquadramento vertical<input type="range" min="0" max="100" value={item.y} onChange={event => updateItem(item.key, { y: Number(event.target.value) })} /></label></article>)}</div></div>}
    <div className="full"><b>Itens e opcionais</b><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8, marginTop: 10 }}>{options.map(option => <label key={option} style={{ display: 'flex', gap: 7, alignItems: 'center' }}><input type="checkbox" name={`feature-${option}`} defaultChecked={vehicle?.features?.includes(option)} />{option}</label>)}</div></div>
    <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" name="featured" defaultChecked={vehicle?.featured} /> Exibir como destaque na home</label>
  </div><button disabled={busy} className="btn" type="submit">{busy ? 'Salvando…' : 'Salvar veículo'}</button></form>;
}
