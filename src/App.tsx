import React, { useState, useEffect, useRef } from 'react';
import { 
  ClipboardList, CheckCircle2, AlertTriangle, XCircle, RotateCcw, 
  Printer, Scale, Microscope, Eye, FileText, MapPin, Clock, 
  Camera, Trash2, Image as ImageIcon, Timer, Package, Box, 
  CheckSquare, PlayCircle, MessageSquare, Zap, Loader2, 
  Calculator, User, PenTool, Eraser, Droplets, Ruler, ScanLine,
  Factory, Sprout, LayoutGrid, ArrowRight, Building2, Table, FileCheck
} from 'lucide-react';

// --- Interfaces ---

interface Standards {
  countNe: number; countTolerance: number; minCSP: number; minRKM: number;
  maxU: number; maxIPI: number; maxHairiness: number;
  maxVisualDefectsPercent: number; maxMoisture: number;
}

interface PhotoEvidence { id: string; url: string; name: string; timestamp: string; }

interface DefectData { count: number; remarks: string; photos: PhotoEvidence[]; }

interface VisualDefects {
  stitching: DefectData; ribboning: DefectData; oilStain: DefectData;
  damagedCone: DefectData; softCone: DefectData; entanglement: DefectData;
  shadeVariation: DefectData;
}

interface CheckPointData { status: 'pass' | 'fail'; remarks: string; photos: PhotoEvidence[]; }
interface TareItem { weight: string; photos: PhotoEvidence[]; }
interface WeightEntry { no: string; val: string; }
interface WeightStats { avg: string; min: string; max: string; cv: string; }

interface PackagingChecks {
  cartonCondition: CheckPointData; strapping: CheckPointData; markings: CheckPointData;
  polybagQuality: CheckPointData; separators: CheckPointData; paperConeTips: CheckPointData;
  modeOfPacking: 'Box' | 'Pallet' | 'Bag';
  cartonSize: string; strapColor: string; plyInfo: string;
  totalCartonsInLot: number; isWaxed: 'Waxed' | 'Unwaxed';
  tareEmptyCarton: TareItem; tareSeparators: TareItem; tarePaperCones: TareItem;
  tarePolybags: TareItem; tareStraps: TareItem; calculatedTare: string;
  cartonWeights: WeightEntry[]; cartonStats: WeightStats;
  coneWeights: string[]; coneStats: WeightStats;
  emptyConeWeight: string; packagingComments: string;
}

interface CottonParams {
  spanLength: string; mic: string; strength: string; trash: string;
  sfi: string; rd: string; plusB: string; moisture: string;
  remarks: string; photos: PhotoEvidence[];
}

interface MachineryDetails {
  blowRoom: string; carding: string; comber: string; drawFrame: string;
  simplex: string; ringFrame: string; compact: string; autoConer: string;
}

interface LabData {
  actualCount: string; countCV: string; csp: string; strength: string; strengthCV: string;
  rkm: string; tpi: string; moisture: string;
  uPercent: string; usterCV: string; hairiness: string; hairinessCV: string;
  thin30: string; thin40: string; thin50: string;
  thick35: string; thick50: string;
  neps140: string; neps200: string;
  cutsPer100km: string; uvCheck: 'pass' | 'fail'; blackBoard: 'A+' | 'A' | 'B' | 'C';
  labRemarks: string; reportPhotos: PhotoEvidence[];
}

interface InspectionState {
  buyerName: string; buyerDetails: string;
  supplierName: string; lotNo: string; yarnCountLabel: string;
  date: string; inspectorName: string;
  productionStartDate: string; productionEndDate: string;
  totalConesInspected: number;
  location: { lat: number; lng: number; timestamp: string; isMock?: boolean } | null;
  startTime: number | null; endTime: number | null;
  inspectorSelfie: string | null;
  signatures: { inspector: string | null; manufacturer: string | null };
  cotton: CottonParams;
  machinery: MachineryDetails;
  packaging: PackagingChecks;
  visualDefects: VisualDefects;
  labData: LabData;
  standards: Standards;
  status: 'draft' | 'in-progress' | 'completed';
}

// --- Initial States ---

const INITIAL_WEIGHT_STATS: WeightStats = { avg: '', min: '', max: '', cv: '' };
const createTare = (): TareItem => ({ weight: '', photos: [] });
const createDefect = (): DefectData => ({ count: 0, remarks: '', photos: [] });
const createCheck = (): CheckPointData => ({ status: 'pass', remarks: '', photos: [] });
const createCartonEntries = () => Array.from({ length: 20 }, () => ({ no: '', val: '' }));

const INITIAL_PACKAGING: PackagingChecks = {
  cartonCondition: createCheck(), strapping: createCheck(), markings: createCheck(),
  polybagQuality: createCheck(), separators: createCheck(), paperConeTips: createCheck(),
  modeOfPacking: 'Box', cartonSize: '740*380*510 MM', strapColor: 'Green', plyInfo: '5 Ply',
  totalCartonsInLot: 480, isWaxed: 'Unwaxed',
  tareEmptyCarton: createTare(), tareSeparators: createTare(), tarePaperCones: createTare(),
  tarePolybags: createTare(), tareStraps: createTare(), calculatedTare: '0.00',
  cartonWeights: createCartonEntries(), cartonStats: INITIAL_WEIGHT_STATS,
  coneWeights: Array(20).fill(''), coneStats: INITIAL_WEIGHT_STATS,
  emptyConeWeight: '55', packagingComments: ''
};

const INITIAL_LAB: LabData = {
  actualCount: '', countCV: '', csp: '', strength: '', strengthCV: '', rkm: '', tpi: '', moisture: '',
  uPercent: '', usterCV: '', hairiness: '', hairinessCV: '',
  thin30: '', thin40: '', thin50: '', thick35: '', thick50: '', neps140: '', neps200: '',
  cutsPer100km: '', uvCheck: 'pass', blackBoard: 'A', labRemarks: '', reportPhotos: []
};

const INITIAL_COTTON: CottonParams = { spanLength: '', mic: '', strength: '', trash: '', sfi: '', rd: '', plusB: '', moisture: '', remarks: '', photos: [] };
const INITIAL_MACHINERY: MachineryDetails = { blowRoom: '', carding: '', comber: '', drawFrame: '', simplex: '', ringFrame: '', compact: '', autoConer: '' };
const INITIAL_STANDARDS: Standards = { countNe: 16, countTolerance: 2.0, minCSP: 2800, minRKM: 19.0, maxU: 9.0, maxIPI: 25, maxHairiness: 6.5, maxVisualDefectsPercent: 5.0, maxMoisture: 8.5 };
const INITIAL_VISUAL: VisualDefects = { stitching: createDefect(), ribboning: createDefect(), oilStain: createDefect(), damagedCone: createDefect(), softCone: createDefect(), entanglement: createDefect(), shadeVariation: createDefect() };

// --- External Components ---

const TareEvidenceRow = ({ label, data, onChange, onPhotoAdd, onPhotoRemove }: { label: string, data: TareItem, onChange: (v: string) => void, onPhotoAdd: (e: any) => void, onPhotoRemove: (id: string) => void }) => (
  <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <span className="text-xs font-bold text-slate-600 uppercase">{label}</span>
      <div className="flex items-center gap-2">
         <input type="number" step="0.01" className="w-20 p-1 border rounded text-right text-sm font-mono" placeholder="0.00" value={data.weight} onChange={(e) => onChange(e.target.value)} />
         <span className="text-xs text-slate-400">kg</span>
      </div>
    </div>
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
       <label className="cursor-pointer flex-shrink-0 w-8 h-8 bg-blue-50 border border-blue-100 rounded flex items-center justify-center hover:bg-blue-100 transition"><Camera className="w-4 h-4 text-blue-600"/><input type="file" accept="image/*" multiple className="hidden" onChange={onPhotoAdd} /></label>
       {data.photos.map(p => (
         <div key={p.id} className="relative group w-8 h-8 flex-shrink-0 rounded border border-slate-200 overflow-hidden">
           <img src={p.url} className="w-full h-full object-cover" />
           <button onClick={() => onPhotoRemove(p.id)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><XCircle className="w-3 h-3"/></button>
         </div>
       ))}
    </div>
  </div>
);

const CartonWeightTable = ({ weights, onUpdate }: { weights: WeightEntry[], onUpdate: (idx: number, f: 'no'|'val', v: string) => void }) => (
  <div className="overflow-x-auto border rounded mb-2">
    <table className="w-full text-xs text-center border-collapse">
      <thead className="bg-slate-100 text-slate-500 font-bold">
        <tr><th className="p-1 border">#</th><th className="p-1 border">C.No</th><th className="p-1 border">Kg</th><th className="p-1 border">#</th><th className="p-1 border">C.No</th><th className="p-1 border">Kg</th></tr>
      </thead>
      <tbody>
        {Array.from({ length: 10 }).map((_, i) => (
          <tr key={i}>
            <td className="p-1 border bg-slate-50">{i + 1}</td>
            <td className="p-0 border"><input className="w-full p-1 text-center outline-none" value={weights[i].no} onChange={e => onUpdate(i, 'no', e.target.value)} /></td>
            <td className="p-0 border"><input className="w-full p-1 text-center outline-none" type="number" step="0.01" value={weights[i].val} onChange={e => onUpdate(i, 'val', e.target.value)} /></td>
            <td className="p-1 border bg-slate-50">{i + 11}</td>
            <td className="p-0 border"><input className="w-full p-1 text-center outline-none" value={weights[i+10].no} onChange={e => onUpdate(i+10, 'no', e.target.value)} /></td>
            <td className="p-0 border"><input className="w-full p-1 text-center outline-none" type="number" step="0.01" value={weights[i+10].val} onChange={e => onUpdate(i+10, 'val', e.target.value)} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ConeGridInput = ({ values, onInputChange }: { values: string[], onInputChange: (idx: number, v: string) => void }) => (
  <div className="bg-white p-4 rounded border">
    <div className="grid grid-cols-5 gap-2 mb-4">
      {values.map((val, idx) => (
        <input key={idx} type="number" step="0.01" placeholder={`${idx + 1}`} className="w-full p-1 text-center border rounded text-sm focus:border-blue-500 outline-none" value={val} onChange={(e) => onInputChange(idx, e.target.value)} />
      ))}
    </div>
  </div>
);

const PackagingRow = ({ label, item, onStatusChange, onRemarksChange, onPhotoAdd, onPhotoRemove }: any) => (
  <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-2">
    <div className="flex justify-between items-center"><span className="font-semibold text-slate-700 text-sm">{label}</span><div className="flex gap-1"><button onClick={() => onStatusChange('pass')} className={`px-3 py-1 rounded text-xs font-bold ${item.status === 'pass' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'}`}>Pass</button><button onClick={() => onStatusChange('fail')} className={`px-3 py-1 rounded text-xs font-bold ${item.status === 'fail' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500'}`}>Fail</button></div></div>
    <input type="text" placeholder="Remarks..." className="w-full text-xs p-1 border rounded" value={item.remarks} onChange={(e) => onRemarksChange(e.target.value)} />
    <div className="flex flex-wrap items-center gap-2 mt-1"><label className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded border text-[10px] transition"><Camera className="w-3 h-3" /> Add Photo<input type="file" accept="image/*" multiple className="hidden" onChange={onPhotoAdd} /></label>{item.photos.map((p:any) => (<div key={p.id} className="relative group w-8 h-8 rounded overflow-hidden border border-slate-300"><img src={p.url} className="w-full h-full object-cover" /><button onClick={() => onPhotoRemove(p.id)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100"><XCircle className="w-3 h-3"/></button></div>))}</div>
  </div>
);

const DefectRow = ({ label, item, onCountChange, onRemarksChange, onPhotoAdd, onPhotoRemove }: any) => (
  <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-2">
    <div className="flex justify-between items-center"><span className="font-semibold text-slate-700 text-sm capitalize">{label}</span><div className="flex items-center gap-3"><button onClick={() => onCountChange(Math.max(0, item.count - 1))} className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-600">-</button><span className="font-bold w-6 text-center">{item.count}</span><button onClick={() => onCountChange(item.count + 1)} className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center font-bold text-blue-600">+</button></div></div>
    <input type="text" placeholder="Remarks (e.g. Minor/Major)..." className="w-full text-xs p-1 border rounded" value={item.remarks} onChange={(e) => onRemarksChange(e.target.value)} />
    <div className="flex flex-wrap items-center gap-2 mt-1"><label className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded border text-[10px] transition"><Camera className="w-3 h-3" /> Add Photo<input type="file" accept="image/*" multiple className="hidden" onChange={onPhotoAdd} /></label>{item.photos.map((p:any) => (<div key={p.id} className="relative group w-8 h-8 rounded overflow-hidden border border-slate-300"><img src={p.url} className="w-full h-full object-cover" /><button onClick={() => onPhotoRemove(p.id)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100"><XCircle className="w-3 h-3"/></button></div>))}</div>
  </div>
);

const SignaturePad = ({ label, onSave, existingSignature }: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  useEffect(() => { const canvas = canvasRef.current; if (canvas) { const ctx = canvas.getContext('2d'); if (ctx) { ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#000'; } } }, [existingSignature]);
  const startDrawing = (e: any) => { setIsDrawing(true); const ctx = canvasRef.current?.getContext('2d'); const { x, y } = getCoords(e); ctx?.beginPath(); ctx?.moveTo(x, y); };
  const draw = (e: any) => { if (!isDrawing) return; const ctx = canvasRef.current?.getContext('2d'); const { x, y } = getCoords(e); ctx?.lineTo(x, y); ctx?.stroke(); };
  const stopDrawing = () => { setIsDrawing(false); if (canvasRef.current) onSave(canvasRef.current.toDataURL()); };
  const getCoords = (e: any) => { const rect = canvasRef.current!.getBoundingClientRect(); const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left; const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top; return { x, y }; };
  const clear = () => { const ctx = canvasRef.current?.getContext('2d'); ctx?.clearRect(0, 0, 300, 120); onSave(null); };
  if (existingSignature) return <div className="border p-4 rounded bg-white"><img src={existingSignature} className="h-24 mb-2"/><button onClick={clear} className="text-xs text-red-500 flex items-center gap-1"><Eraser className="w-3 h-3"/> Clear</button></div>;
  return <div className="border p-2 rounded bg-white"><div className="flex justify-between mb-2"><span className="text-xs font-bold">{label}</span><button onClick={clear} className="text-xs text-slate-400">Clear</button></div><canvas ref={canvasRef} width={300} height={120} className="border border-dashed bg-slate-50 w-full touch-none" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}/></div>;
};

// --- MAIN APP ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'general' | 'raw_material' | 'packaging' | 'visual' | 'lab' | 'report'>('general');
  const [reportMode, setReportMode] = useState<'summary' | 'detailed'>('summary');
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [isScanningOCR, setIsScanningOCR] = useState(false);
  
  const [data, setData] = useState<InspectionState>({
    buyerName: 'NIVA EXPORTS', buyerDetails: '',
    supplierName: 'RAM SPINNING MILL PVT LTD', lotNo: '162518', yarnCountLabel: 'NE 16/1 CCH',
    date: new Date().toISOString().split('T')[0], inspectorName: '',
    productionStartDate: '', productionEndDate: '', totalConesInspected: 480,
    location: null, startTime: null, endTime: null, inspectorSelfie: null,
    signatures: { inspector: null, manufacturer: null },
    cotton: INITIAL_COTTON, machinery: INITIAL_MACHINERY, packaging: INITIAL_PACKAGING,
    visualDefects: INITIAL_VISUAL, labData: INITIAL_LAB, standards: INITIAL_STANDARDS,
    status: 'draft',
  });

  useEffect(() => {
    let interval: any;
    if (data.status === 'in-progress' && data.startTime) {
      interval = setInterval(() => {
        const diff = Date.now() - data.startTime!;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setElapsedTime(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [data.status, data.startTime]);

  const processFiles = (files: FileList) => Array.from(files).map(f => ({ id: Math.random().toString(36).substr(2,9), url: URL.createObjectURL(f), name: f.name, timestamp: new Date().toLocaleTimeString() }));
  
  const handleStart = () => {
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setData(p => ({...p, status: 'in-progress', startTime: Date.now(), location: { lat: pos.coords.latitude, lng: pos.coords.longitude, timestamp: new Date().toISOString() }})); setLoadingLoc(false); },
      () => { setData(p => ({...p, status: 'in-progress', startTime: Date.now(), location: { lat: 23.0225, lng: 72.5714, timestamp: new Date().toISOString(), isMock: true }})); setLoadingLoc(false); }
    );
  };

  const calculateStats = (vals: number[]): WeightStats => {
    if(!vals.length) return INITIAL_WEIGHT_STATS;
    const sum = vals.reduce((a,b)=>a+b,0);
    const avg = sum/vals.length;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const squareDiffs = vals.map(n => Math.pow(n - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / vals.length;
    const sd = Math.sqrt(avgSquareDiff);
    const cv = avg !== 0 ? (sd / avg) * 100 : 0;
    return { avg: avg.toFixed(3), min: min.toFixed(2), max: max.toFixed(2), cv: cv.toFixed(2) };
  };

  const updateTare = (k: keyof PackagingChecks, v: string) => {
    const pkg = { ...data.packaging, [k]: { ...data.packaging[k] as TareItem, weight: v } };
    const sum = ['tareEmptyCarton','tareSeparators','tarePaperCones','tarePolybags','tareStraps'].reduce((acc, key) => acc + (parseFloat((pkg[key as keyof PackagingChecks] as TareItem).weight) || 0), 0);
    pkg.calculatedTare = sum.toFixed(2);
    setData(p => ({...p, packaging: pkg}));
  };

  const addTarePhoto = (k: keyof PackagingChecks, e: any) => {
    if(e.target.files) {
       const photos = processFiles(e.target.files);
       const currentItem = data.packaging[k] as TareItem;
       setData(p => ({...p, packaging: {...p.packaging, [k]: { ...currentItem, photos: [...currentItem.photos, ...photos] }}}));
    }
  };

  const removeTarePhoto = (k: keyof PackagingChecks, id: string) => {
    const currentItem = data.packaging[k] as TareItem;
    setData(p => ({...p, packaging: {...p.packaging, [k]: { ...currentItem, photos: currentItem.photos.filter(x => x.id !== id) }}}));
  };

  const handleCartonGrid = (i: number, f: 'no'|'val', v: string) => {
    const rows = [...data.packaging.cartonWeights];
    rows[i] = { ...rows[i], [f]: v };
    const nums = rows.map(r => parseFloat(r.val)).filter(n => !isNaN(n));
    setData(p => ({...p, packaging: {...p.packaging, cartonWeights: rows, cartonStats: calculateStats(nums)}}));
  };

  const handleConeGrid = (i: number, v: string) => {
    const vals = [...data.packaging.coneWeights];
    vals[i] = v;
    const nums = vals.map(r => parseFloat(r)).filter(n => !isNaN(n));
    setData(p => ({...p, packaging: {...p.packaging, coneWeights: vals, coneStats: calculateStats(nums)}}));
  };

  const handleSmartOCR = (e: any) => {
    if(e.target.files?.[0]) {
       setIsScanningOCR(true);
       setTimeout(() => {
          setData(p => ({...p, labData: {...p.labData, actualCount: '16.05', countCV: '1.01', csp: '2942', strength: '250', uPercent: '8.28', thick50: '12', thin50: '2', neps200: '35', moisture: '7.20'}}));
          setIsScanningOCR(false);
       }, 1000);
    }
  };

  // Updaters
  const handleGeneral = (f:string, v:any) => setData(p=>({...p, [f]: v}));
  const handleCotton = (f:string, v:any) => setData(p=>({...p, cotton: {...p.cotton, [f]: v}}));
  const addCottonPhoto = (e:any) => { if(e.target.files) setData(p=>({...p, cotton: {...p.cotton, photos: [...p.cotton.photos, ...processFiles(e.target.files)]}})); };
  const handleMachinery = (f:string, v:any) => setData(p=>({...p, machinery: {...p.machinery, [f]: v}}));
  const handleLab = (f:string, v:any) => setData(p=>({...p, labData: {...p.labData, [f]: v}}));
  const handleStd = (f:string, v:any) => setData(p=>({...p, standards: {...p.standards, [f]: v}}));
  const updatePkg = (k:any, f:any, v:any) => setData(p=>({...p, packaging: {...p.packaging, [k]: {...(p.packaging as any)[k], [f]: v}}}));
  const addPkgPhoto = (k:any, e:any) => { if(e.target.files) setData(p=>({...p, packaging: {...p.packaging, [k]: {...(p.packaging as any)[k], photos: [...(p.packaging as any)[k].photos, ...processFiles(e.target.files)]}}})); };
  const updateVisual = (k:any, f:any, v:any) => setData(p=>({...p, visualDefects: {...p.visualDefects, [k]: {...p.visualDefects[k as keyof VisualDefects], [f]: v}}}));
  const addVisualPhoto = (k:any, e:any) => { if(e.target.files) setData(p=>({...p, visualDefects: {...p.visualDefects, [k]: {...p.visualDefects[k as keyof VisualDefects], photos: [...p.visualDefects[k as keyof VisualDefects].photos, ...processFiles(e.target.files)]}}})); };

  const totalDefects = Object.values(data.visualDefects).reduce((a, b) => a + b.count, 0);
  const defectPercentage = data.totalConesInspected > 0 ? ((totalDefects / data.totalConesInspected) * 100).toFixed(2) : "0.00";

  // --- Renderers ---

  const renderGeneral = () => (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded shadow-sm border">
          <h3 className="font-bold mb-4 flex gap-2"><MapPin className="text-blue-600 w-5 h-5"/> Check-In (Mandatory)</h3>
          {!data.location ? <button onClick={handleStart} className="bg-blue-600 text-white px-6 py-2 rounded">{loadingLoc?'Locating...':'Check-In & Start Timer'}</button> : 
          <div className="flex flex-col gap-3">
             <div className="flex gap-4 items-center"><span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded">Active</span><span className="text-xs font-mono">{data.location.lat.toFixed(4)},{data.location.lng.toFixed(4)}</span></div>
             <div className="flex items-center gap-3">
                {data.inspectorSelfie ? <img src={data.inspectorSelfie} className="w-16 h-16 rounded object-cover border" /> : <label className="w-16 h-16 bg-slate-100 flex items-center justify-center rounded cursor-pointer border-2 border-dashed"><Camera className="w-6 h-6 text-slate-400"/><input type="file" accept="image/*" capture="user" className="hidden" onChange={e=>{if(e.target.files?.[0]) setData(p=>({...p,inspectorSelfie:URL.createObjectURL(e.target.files![0])}))}}/></label>}
                <div className="text-sm font-bold text-slate-600">Inspector Selfie</div>
             </div>
          </div>}
       </div>
       
       <div className="bg-white p-6 rounded shadow-sm border">
          <h3 className="font-bold mb-4">Standards</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {Object.keys(data.standards).map(k => (
                <div key={k}>
                   <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{k.replace(/([A-Z])/g, ' $1')}</label>
                   <input type="number" className="w-full p-2 border rounded" value={(data.standards as any)[k]} onChange={e=>handleStd(k, parseFloat(e.target.value))}/>
                </div>
             ))}
          </div>
       </div>
       
       <div className="bg-white p-6 rounded shadow-sm border">
          <h3 className="font-bold mb-4">Lot Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Buyer Name</label><input className="w-full p-2 border rounded" value={data.buyerName} onChange={e=>handleGeneral('buyerName', e.target.value)} /></div>
             <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Supplier Name</label><input className="w-full p-2 border rounded" value={data.supplierName} onChange={e=>handleGeneral('supplierName', e.target.value)} /></div>
             <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Lot No</label><input className="w-full p-2 border rounded" value={data.lotNo} onChange={e=>handleGeneral('lotNo', e.target.value)} /></div>
             <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Count Label</label><input className="w-full p-2 border rounded" value={data.yarnCountLabel} onChange={e=>handleGeneral('yarnCountLabel', e.target.value)} /></div>
             
             {/* New Lot Details */}
             <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Packing Mode</label>
                <select className="w-full p-2 border rounded" value={data.packaging.modeOfPacking} onChange={e=>setData(p=>({...p, packaging: {...p.packaging, modeOfPacking: e.target.value as any}}))} >
                   <option value="Box">Box / Carton</option><option value="Pallet">Pallet</option><option value="Bag">Bag</option>
                </select></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Wax Status</label>
                <select className="w-full p-2 border rounded" value={data.packaging.isWaxed} onChange={e=>setData(p=>({...p, packaging: {...p.packaging, isWaxed: e.target.value as any}}))} >
                   <option value="Unwaxed">Unwaxed</option><option value="Waxed">Waxed</option>
                </select></div>
             </div>
             <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Prod Start</label><input type="date" className="w-full p-2 border rounded" value={data.productionStartDate} onChange={e=>handleGeneral('productionStartDate', e.target.value)}/></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Prod End</label><input type="date" className="w-full p-2 border rounded" value={data.productionEndDate} onChange={e=>handleGeneral('productionEndDate', e.target.value)}/></div>
             </div>
             <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Total Quantity (Cartons)</label><input type="number" className="w-full p-2 border rounded" value={data.packaging.totalCartonsInLot} onChange={e=>setData(p=>({...p, packaging: {...p.packaging, totalCartonsInLot: parseInt(e.target.value)||0}}))}/></div>
          </div>
       </div>
       <div className="flex justify-end"><button onClick={()=>setActiveTab('raw_material')} className="bg-blue-600 text-white px-4 py-2 rounded">Next</button></div>
    </div>
  );

  const renderRaw = () => (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded shadow-sm border">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Sprout className="w-5 h-5 text-green-600"/> Cotton Parameters</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
             {([['2.5% Span Length','spanLength'], ['Micronaire','mic'], ['Strength','strength'], ['Trash%','trash'], ['RD','rd'], ['SFI','sfi'], ['+b','plusB'], ['Moisture%','moisture']] as const).map(([l,k]) => (
                <div key={k}><label className="text-xs font-bold text-slate-500 block mb-1">{l}</label><input className="w-full p-2 border rounded" value={(data.cotton as any)[k]} onChange={e=>handleCotton(k, e.target.value)}/></div>
             ))}
          </div>
          <div className="flex gap-2 items-center border-t pt-4">
             <input className="flex-1 p-2 border rounded" placeholder="Cotton Remarks..." value={data.cotton.remarks} onChange={e=>handleCotton('remarks', e.target.value)}/>
             <label className="cursor-pointer p-2 bg-slate-100 rounded hover:bg-slate-200"><Camera className="w-5 h-5 text-slate-600"/><input type="file" className="hidden" multiple onChange={addCottonPhoto}/></label>
             {data.cotton.photos.map(p=><img key={p.id} src={p.url} className="w-10 h-10 rounded border object-cover"/>)}
          </div>
       </div>
       <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Factory className="w-5 h-5 text-slate-600"/> Machinery</h3>
          <div className="grid grid-cols-2 gap-4">
             {Object.keys(data.machinery).map(k => (
                <div key={k}><label className="text-xs font-bold text-slate-500 uppercase">{k}</label><input className="w-full p-2 border rounded" value={(data.machinery as any)[k]} onChange={e=>handleMachinery(k, e.target.value)}/></div>
             ))}
          </div>
       </div>
       <div className="flex justify-between"><button onClick={()=>setActiveTab('general')} className="text-slate-500">Back</button><button onClick={()=>setActiveTab('packaging')} className="bg-blue-600 text-white px-4 py-2 rounded">Next</button></div>
    </div>
  );

  const renderPkg = () => (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-orange-600"/> Packaging Specs</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
             <input className="border p-1 rounded" placeholder="Carton Size" value={data.packaging.cartonSize} onChange={e=>setData(p=>({...p, packaging: {...p.packaging, cartonSize: e.target.value}}))} />
             <input className="border p-1 rounded" placeholder="Strap Color" value={data.packaging.strapColor} onChange={e=>setData(p=>({...p, packaging: {...p.packaging, strapColor: e.target.value}}))} />
             <input className="border p-1 rounded" placeholder="Ply Info" value={data.packaging.plyInfo} onChange={e=>setData(p=>({...p, packaging: {...p.packaging, plyInfo: e.target.value}}))} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {['cartonCondition','strapping','markings','polybagQuality','separators','paperConeTips'].map(k => (
                <PackagingRow key={k} label={k.replace(/([A-Z])/g, ' $1')} item={(data.packaging as any)[k]} onStatusChange={(s:any)=>updatePkg(k,'status',s)} onRemarksChange={(v:any)=>updatePkg(k,'remarks',v)} onPhotoAdd={(e:any)=>addPkgPhoto(k,e)} onPhotoRemove={()=>{}} />
             ))}
          </div>
       </div>

       <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Scale className="w-5 h-5 text-blue-600"/> Detailed Tare & Weights</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
             {([['Empty Carton','tareEmptyCarton'], ['Separators','tareSeparators'], ['Cones','tarePaperCones'], ['Polybags','tarePolybags'], ['Straps','tareStraps']] as const).map(([l,k]) => (
                <TareEvidenceRow key={k} label={l} data={(data.packaging as any)[k]} onChange={v=>updateTare(k as any,v)} onPhotoAdd={e=>addTarePhoto(k as any,e)} onPhotoRemove={id=>removeTarePhoto(k as any,id)} />
             ))}
          </div>
          <div className="text-right font-bold text-sm mb-6">Total Tare: {data.packaging.calculatedTare} kg</div>

          <h4 className="font-bold text-sm text-slate-600 mb-2">Carton Gross Weights</h4>
          <CartonWeightTable weights={data.packaging.cartonWeights} onUpdate={handleCartonGrid} />
          
          <div className="flex gap-4 mb-6 text-xs bg-slate-50 p-2 rounded justify-center font-bold font-mono border">
             <span>AVG: {data.packaging.cartonStats.avg}</span><span>MIN: {data.packaging.cartonStats.min}</span><span>MAX: {data.packaging.cartonStats.max}</span><span>CV%: {data.packaging.cartonStats.cv}</span>
          </div>
          
          <div className="mt-6">
             <h4 className="font-bold text-sm text-slate-600 mb-2">Cone Weights (Gross)</h4>
             <ConeGridInput values={data.packaging.coneWeights} onInputChange={handleConeGrid} />
             <div className="flex justify-between text-xs bg-slate-50 p-2 rounded font-mono mt-2">
                <span>AVG: <b>{data.packaging.coneStats.avg}</b></span><span>CV%: <b>{data.packaging.coneStats.cv}</b></span>
             </div>
             <div className="mt-4 flex gap-4 items-end bg-blue-50 p-3 rounded border border-blue-100">
                <div>
                   <label className="text-xs font-bold text-blue-800 block mb-1">Single Empty Cone Weight (g)</label>
                   <input type="number" step="0.1" className="p-1 border rounded w-24 text-center font-mono" value={data.packaging.emptyConeWeight} onChange={e=>setData(p=>({...p, packaging: {...p.packaging, emptyConeWeight: e.target.value}}))} />
                </div>
                <div>
                   <div className="text-xs text-blue-600">Avg Net Weight:</div>
                   <div className="text-lg font-bold text-blue-900 font-mono">
                      {data.packaging.coneStats.avg && data.packaging.emptyConeWeight ? (parseFloat(data.packaging.coneStats.avg) - parseFloat(data.packaging.emptyConeWeight)).toFixed(2) : '--'} g
                   </div>
                </div>
             </div>
          </div>
       </div>
       <div className="flex justify-between"><button onClick={()=>setActiveTab('raw_material')} className="text-slate-500">Back</button><button onClick={()=>setActiveTab('visual')} className="bg-blue-600 text-white px-4 py-2 rounded">Next</button></div>
    </div>
  );

  const renderVisual = () => (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-800">Visual Defects Check</h3>
             <div className="flex items-center gap-2"><span className="text-sm font-bold">Sample Size:</span><input type="number" className="border p-1 rounded w-16 text-center" value={data.totalConesInspected} onChange={e => setData(p => ({...p, totalConesInspected: parseInt(e.target.value)||0}))} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {Object.keys(data.visualDefects).map(k => (
                <DefectRow key={k} label={k.replace(/([A-Z])/g, ' $1')} item={(data.visualDefects as any)[k]} onCountChange={(c:any)=>updateVisual(k,'count',c)} onRemarksChange={(v:any)=>updateVisual(k,'remarks',v)} onPhotoAdd={(e:any)=>addVisualPhoto(k,e)} onPhotoRemove={()=>{}} />
             ))}
          </div>
       </div>
       <div className="flex justify-between"><button onClick={()=>setActiveTab('packaging')} className="text-slate-500">Back</button><button onClick={()=>setActiveTab('lab')} className="bg-blue-600 text-white px-6 py-2 rounded">Next</button></div>
    </div>
  );

  const renderLab = () => (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded shadow-sm border">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold flex gap-2"><Microscope className="w-5 h-5 text-teal-600"/> Lab Results</h3>
             <label className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded cursor-pointer flex items-center gap-2"><Zap className="w-3 h-3"/> Auto-fill <input type="file" className="hidden" onChange={handleSmartOCR} /></label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
             {Object.keys(data.labData).filter(k=>!['labRemarks','reportPhotos','thin30','thin40','thin50','thick35','thick50','neps140','neps200'].includes(k)).map(k => (
                <div key={k}><label className="text-xs font-bold text-slate-500 uppercase block mb-1">{k}</label><input className="w-full p-2 border rounded" value={(data.labData as any)[k]} onChange={e=>handleLab(k, e.target.value)}/></div>
             ))}
          </div>
          <h4 className="font-bold text-sm text-slate-700 border-b pb-2 mb-4">Detailed IPI Breakdown</h4>
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-center border-collapse">
                <thead className="bg-slate-100 text-slate-500 uppercase text-xs">
                   <tr><th className="border p-2" colSpan={3}>Thin (-%)</th><th className="border p-2" colSpan={2}>Thick (+%)</th><th className="border p-2" colSpan={2}>Neps (+%)</th></tr>
                   <tr><th className="border p-2">-30%</th><th className="border p-2">-40%</th><th className="border p-2">-50%</th><th className="border p-2">+35%</th><th className="border p-2">+50%</th><th className="border p-2">+140%</th><th className="border p-2">+200%</th></tr>
                </thead>
                <tbody>
                   <tr>
                      {['thin30','thin40','thin50','thick35','thick50','neps140','neps200'].map(k => (
                         <td key={k} className="border p-1"><input className="w-full text-center outline-none" value={(data.labData as any)[k]} onChange={e=>handleLab(k, e.target.value)}/></td>
                      ))}
                   </tr>
                </tbody>
             </table>
          </div>
       </div>
       <div className="flex justify-between"><button onClick={()=>setActiveTab('visual')} className="text-slate-500">Back</button><button onClick={()=>{setData(p=>({...p,status:'completed',endTime:Date.now()}));setActiveTab('report')}} className="bg-green-600 text-white px-4 py-2 rounded">Finish & Preview</button></div>
    </div>
  );

  const renderReport = () => (
    <div className="space-y-6 pb-10">
       <div className="bg-white p-8 rounded shadow-lg print:shadow-none">
          <div className="flex justify-between mb-6">
             <div><h1 className="text-2xl font-bold">Inspection Report</h1><p className="text-slate-500">{data.supplierName}</p></div>
             <button onClick={()=>{setReportMode('detailed');setTimeout(()=>window.print(),100)}} className="bg-blue-600 text-white px-4 py-2 rounded print:hidden flex gap-2"><FileCheck className="w-4 h-4"/> Download Detailed Report</button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm bg-slate-50 p-4 rounded border">
             <div><span className="block text-xs text-slate-400 uppercase">Buyer</span><b>{data.buyerName}</b><div className="text-xs">{data.buyerDetails}</div></div>
             <div className="grid grid-cols-2 gap-2"><div><span className="block text-xs text-slate-400">Lot</span><b>{data.lotNo}</b></div><div><span className="block text-xs text-slate-400">Count</span><b>{data.yarnCountLabel}</b></div></div>
          </div>
          
          <div className="mb-6 break-inside-avoid">
             <h4 className="font-bold border-b mb-2">Weight Data</h4>
             <div className="grid grid-cols-2 gap-4 text-xs">
                <div><div className="font-bold mb-1">Tare (kg)</div>
                   <div className="grid grid-cols-5 gap-1">{Object.keys(data.packaging).filter(k=>k.startsWith('tare')).map(k=><div key={k} className="border p-1 text-center bg-slate-50"><div>{k.replace('tare','')}</div><b>{(data.packaging as any)[k].weight}</b></div>)}</div>
                   <div className="mt-2 font-bold">Total Tare: {data.packaging.calculatedTare} kg</div>
                </div>
                <div><div className="font-bold mb-1">Stats</div>
                   <div className="grid grid-cols-2 gap-1 bg-slate-50 p-2 rounded">
                      <div>Carton Avg: <b>{data.packaging.cartonStats.avg}</b></div><div>Net Wt: <b>{(parseFloat(data.packaging.cartonStats.avg)-parseFloat(data.packaging.calculatedTare)).toFixed(3)}</b></div>
                   </div>
                </div>
             </div>
             {reportMode === 'detailed' && (
                <div className="mt-4">
                   <div className="font-bold text-xs mb-1">Full Carton Weights</div>
                   <div className="grid grid-cols-10 gap-1 text-[10px]">{data.packaging.cartonWeights.map((w,i) => <div key={i} className="border p-1 text-center bg-slate-50">{w.val}</div>)}</div>
                   <div className="font-bold text-xs mb-1 mt-2">Tare Evidence</div>
                   <div className="flex gap-2">{Object.keys(data.packaging).filter(k=>k.startsWith('tare')).map(k => (data.packaging as any)[k].photos.map((p:any) => <img key={p.id} src={p.url} className="w-10 h-10 border rounded"/>))}</div>
                </div>
             )}
          </div>

          <div className="mb-6 break-inside-avoid">
             <h4 className="font-bold border-b mb-2">Lab Results</h4>
             <table className="w-full text-xs text-left mb-4">
                <tbody>
                   <tr><td>Count: <b>{data.labData.actualCount}</b></td><td>CSP: <b>{data.labData.csp}</b></td><td>Strength: <b>{data.labData.strength}</b></td></tr>
                   <tr><td>U%: <b>{data.labData.uPercent}</b></td><td>Hairiness: <b>{data.labData.hairiness}</b></td><td>Moisture: <b>{data.labData.moisture}%</b></td></tr>
                </tbody>
             </table>
             <div className="font-bold text-xs mb-1">IPI Details</div>
             <table className="w-full text-xs text-center border">
                <thead className="bg-slate-100"><tr><th>Thin -50%</th><th>Thick +50%</th><th>Neps +200%</th></tr></thead>
                <tbody><tr><td>{data.labData.thin50}</td><td>{data.labData.thick50}</td><td>{data.labData.neps200}</td></tr></tbody>
             </table>
          </div>
          
          {/* Detailed Evidence Blocks */}
           {reportMode === 'detailed' && (
              <div className="mt-6 break-inside-avoid">
                 <h4 className="font-bold border-b mb-2">Visual Defects Evidence</h4>
                 <div className="grid grid-cols-2 gap-4">
                    {Object.entries(data.visualDefects).map(([k,v]) => v.count > 0 && (
                       <div key={k} className="border p-2 rounded text-xs">
                          <div className="font-bold capitalize">{k.replace(/([A-Z])/g, ' $1')}</div>
                          <div>Count: {v.count}</div>
                          <div className="flex gap-1 mt-1">{v.photos.map(p=><img key={p.id} src={p.url} className="w-8 h-8 border"/>)}</div>
                       </div>
                    ))}
                 </div>
              </div>
           )}

          <div className="flex gap-4 mt-8 pt-4 border-t print:break-inside-avoid">
             <div className="flex-1 text-center"><div className="h-16 border-b border-dashed mb-1 flex items-end justify-center">{data.signatures.inspector && <img src={data.signatures.inspector} className="h-14"/>}</div><div className="text-xs font-bold">Inspector</div></div>
             <div className="flex-1 text-center"><div className="h-16 border-b border-dashed mb-1 flex items-end justify-center">{data.signatures.manufacturer && <img src={data.signatures.manufacturer} className="h-14"/>}</div><div className="text-xs font-bold">Mill Rep</div></div>
          </div>
       </div>
       <div className="print:hidden bg-white p-4 rounded shadow mt-4">
          <h4 className="font-bold mb-4">Signatures</h4>
          <div className="flex gap-4">
             <div className="flex-1"><SignaturePad label="Inspector" existingSignature={data.signatures.inspector} onSave={s=>setData(p=>({...p, signatures: {...p.signatures, inspector: s}}))} /></div>
             <div className="flex-1"><SignaturePad label="Mill Rep" existingSignature={data.signatures.manufacturer} onSave={s=>setData(p=>({...p, signatures: {...p.signatures, manufacturer: s}}))} /></div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 print:hidden p-4 flex justify-between items-center">
         <div className="font-bold text-lg text-blue-900">YarnQuality<span className="text-blue-500">Pro</span></div>
         <div className="flex gap-4 items-center">
            {data.status==='in-progress' && <div className="text-xs font-mono bg-red-100 text-red-600 px-2 py-1 rounded flex gap-1"><Timer className="w-3 h-3"/>{elapsedTime}</div>}
            <div className="flex gap-1 overflow-x-auto">{['general','raw_material','packaging','visual','lab','report'].map(t => <button key={t} onClick={()=>setActiveTab(t)} className={`w-3 h-3 rounded-full ${activeTab===t?'bg-blue-600':'bg-slate-200'}`} title={t}/>)}</div>
         </div>
      </header>
      <main className="max-w-5xl mx-auto p-4 print:max-w-none print:p-0">
         {activeTab==='general' && renderGeneral()}
         {activeTab==='raw_material' && renderRaw()}
         {activeTab==='packaging' && renderPkg()}
         {activeTab==='visual' && renderVisual()}
         {activeTab==='lab' && renderLab()}
         {activeTab==='report' && renderReport()}
      </main>
    </div>
  );
}