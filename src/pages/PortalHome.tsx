import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Megaphone, Send, CheckCircle2, Image as ImageIcon, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { MapPicker } from '../components/MapPicker';

const schema = z.object({
  cidadao: z.string().min(3, "Nome é obrigatório e deve ter no mínimo 3 caracteres"),
  bairro: z.string().min(1, "Selecione um bairro"),
  endereco: z.string().min(5, "Endereço detalhado é obrigatório"),
  tipo: z.string().min(1, "Selecione o tipo de problema"),
  urgencia: z.string().min(1, "Selecione a urgência"),
  descricao: z.string().min(10, "Descreva o problema com pelo menos 10 caracteres"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

type FormData = z.infer<typeof schema>;

export function PortalHome({ user }: { user: any }) {
  const [bairros, setBairros] = useState<string[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [protocolo, setProtocolo] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{tipo: string, bairro: string} | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const { register, handleSubmit, control, setValue, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      cidadao: user?.user_metadata?.full_name || '',
      bairro: 'Todos',
      tipo: 'Outros',
      urgencia: 'Média'
    }
  });

  useEffect(() => {
    const fetchDados = async () => {
      const { data: bData } = await supabase.from('bairros').select('nome').order('nome', { ascending: true });
      if (bData) setBairros(bData.map(b => b.nome));

      const { data: tData } = await supabase.from('tipos_demanda').select('nome').order('nome', { ascending: true });
      if (tData) setTipos(tData.map(t => t.nome));
    };
    fetchDados();
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      let anexoUrl = null;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user?.id || 'anon'}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('demandas_anexos')
          .upload(filePath, file);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('demandas_anexos').getPublicUrl(filePath);
          anexoUrl = publicUrlData.publicUrl;
        } else {
            console.error("Erro ao fazer upload do anexo", uploadError);
            // Continua mesmo se falhar a imagem
        }
      }

      const newDemanda = {
        cidadao: data.cidadao,
        bairro: data.bairro,
        endereco: data.endereco,
        tipo: data.tipo,
        urgencia: data.urgencia,
        descricao: data.descricao,
        latitude: data.lat,
        longitude: data.lng,
        anexo_url: anexoUrl,
        registro: new Date().toISOString().split('T')[0],
        status: "Recebida",
        user_id: user?.id || null
      };

      const { data: resultData, error } = await supabase.from('demandas').insert([newDemanda]).select();

      if (error) throw error;

      if (resultData && resultData[0]) setProtocolo(resultData[0].id);
      
      setSubmittedData({ tipo: data.tipo, bairro: data.bairro });
      setSubmitted(true);
      reset();
      setFile(null);
    } catch (err: any) {
      alert('Erro ao enviar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const telefone = "5515988312855";
    const texto = `Olá Vereador! Acabei de registrar uma demanda (Protocolo #${protocolo || 'Recebido'}) no seu Gabinete Digital. O problema é sobre *${submittedData?.tipo || 'assunto'}* no bairro *${submittedData?.bairro || 'não informado'}*.`;
    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  if (submitted) {
    return (
      <div className="glass p-12 rounded-3xl text-center space-y-6 shadow-xl border-t-8 border-t-green-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Solicitação Enviada!</h2>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 inline-block mx-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Seu Protocolo</p>
          <p className="text-4xl font-black text-primary">#{protocolo || 'Recebido'}</p>
        </div>
        <p className="text-slate-600 text-lg">Obrigado por contribuir com a melhoria da nossa cidade. O gabinete do Vereador já recebeu o seu relato.</p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button onClick={handleWhatsApp} className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto flex items-center justify-center gap-2">
                <MessageCircle size={22} />
                Avisar no WhatsApp
            </button>
            <button onClick={() => { setSubmitted(false); setSubmittedData(null); }} className="bg-slate-100 text-slate-600 px-8 py-4 rounded-xl font-bold hover:bg-slate-200 active:scale-95 transition-all w-full sm:w-auto">
                Novo relato
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-8 md:p-12 rounded-3xl shadow-xl border-t-8 border-t-primary">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
          <Megaphone size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Portal do Cidadão</h1>
          <p className="text-slate-500">Gabinete Digital - Registre sua demanda abaixo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Seu Nome Completo *</label>
            <input
              {...register('cidadao')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Ex: Maria José"
            />
            {errors.cidadao && <p className="text-red-500 text-xs">{errors.cidadao.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Seu Bairro *</label>
            <select {...register('bairro')} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="">Selecione o Bairro</option>
              {bairros.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            {errors.bairro && <p className="text-red-500 text-xs">{errors.bairro.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">Endereço Completo *</label>
            <input {...register('endereco')} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Rua, Número, Referência..." />
            {errors.endereco && <p className="text-red-500 text-xs">{errors.endereco.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
             <label className="text-sm font-bold text-slate-700">Localização Exata (Opcional)</label>
             <p className="text-xs text-slate-500 mb-2">Clique no mapa para marcar o local exato do problema.</p>
             <Controller
                control={control}
                name="lat"
                render={({ field: { onChange } }) => (
                    <MapPicker onLocationSelect={(lat, lng) => {
                        onChange(lat);
                        setValue('lng', lng);
                    }} />
                )}
             />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Tipo de Problema *</label>
            <select {...register('tipo')} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="">Selecione</option>
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.tipo && <p className="text-red-500 text-xs">{errors.tipo.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Urgência Percebida *</label>
            <select {...register('urgencia')} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="Baixa">Baixa - Pode aguardar</option>
              <option value="Média">Média - Necessita atenção</option>
              <option value="Alta">Alta - Problema urgente</option>
              <option value="Crítica">Crítica - Risco iminente</option>
            </select>
            {errors.urgencia && <p className="text-red-500 text-xs">{errors.urgencia.message}</p>}
          </div>
          
          <div className="space-y-2 md:col-span-2">
             <label className="text-sm font-bold text-slate-700">Foto do Problema (Opcional)</label>
             <div className="flex items-center gap-4">
                 <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors border border-dashed border-slate-300 w-full">
                     <ImageIcon size={20} />
                     <span className="text-sm font-medium">{file ? file.name : "Clique para anexar uma foto"}</span>
                     <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                         if (e.target.files && e.target.files.length > 0) {
                             setFile(e.target.files[0]);
                         }
                     }} />
                 </label>
             </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Descrição Detalhada *</label>
          <textarea {...register('descricao')} rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Descreva o que está acontecendo..."></textarea>
          {errors.descricao && <p className="text-red-500 text-xs">{errors.descricao.message}</p>}
        </div>

        <button type="submit" disabled={loading} className={`w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70' : ''}`}>
          {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Send size={20} />}
          Enviar para o Vereador
        </button>
      </form>
    </div>
  );
}
