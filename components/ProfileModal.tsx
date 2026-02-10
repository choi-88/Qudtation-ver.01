
import React, { useState, useEffect } from 'react';
import { CompanyProfile } from '../types';
import { X, Camera, ShieldCheck, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { extractBusinessInfo } from '../services/geminiService';

interface ProfileModalProps {
  initialData?: CompanyProfile | null;
  onClose: () => void;
  onSave: (profile: CompanyProfile) => void;
  apiKey: string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ initialData, onClose, onSave, apiKey }) => {
  const [formData, setFormData] = useState<Partial<CompanyProfile>>({
    companyName: '',
    representative: '',
    businessNumber: '',
    address: '',
    contact: '',
    email: '',
    uptae: '',
    jongmok: ''
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [stampPreview, setStampPreview] = useState<string | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);

  // 수정 시 데이터 채우기
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.logoUrl) setLogoPreview(initialData.logoUrl);
      if (initialData.stampUrl) setStampPreview(initialData.stampUrl);
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'stamp') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'logo') {
          setLogoPreview(result);
          setFormData(prev => ({ ...prev, logoUrl: result }));
        } else {
          setStampPreview(result);
          setFormData(prev => ({ ...prev, stampUrl: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      // Fix: Passed apiKey as the second argument to extractBusinessInfo
      const info = await extractBusinessInfo(base64, apiKey);
      if (info) {
        setFormData(prev => ({
          ...prev,
          companyName: info.companyName || prev.companyName,
          businessNumber: info.businessNumber || prev.businessNumber,
          representative: info.representative || prev.representative,
          address: info.address || prev.address
        }));
      }
      setIsOcrLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: initialData?.id || Date.now().toString(),
    } as CompanyProfile);
  };

  const inputClasses = "w-full px-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium placeholder-slate-400 shadow-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {initialData ? '공급자 정보 수정' : '새 공급자 정보 등록'}
            </h2>
            <p className="text-sm text-slate-600 mt-1 font-medium">자주 사용하는 업체 정보를 저장하고 불러올 수 있습니다.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 bg-white">
          <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-2.5 rounded-lg text-white shadow-md">
                <Upload size={22} />
              </div>
              <div>
                <p className="text-base font-bold text-blue-900">사업자등록증 자동 완성</p>
                <p className="text-xs text-blue-700 font-bold">이미지 파일을 선택하면 정보를 자동으로 분석합니다.</p>
              </div>
            </div>
            <label className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-lg ${isOcrLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isOcrLoading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
              {isOcrLoading ? '분석 중...' : '등록증 파일 선택'}
              <input type="file" className="hidden" accept="image/*" onChange={handleOcrUpload} disabled={isOcrLoading} />
            </label>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center gap-6">
              <div className="group relative">
                <label className="block text-xs font-bold text-slate-500 mb-2 text-center uppercase tracking-wider">회사 로고</label>
                <div className="w-32 h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center overflow-hidden bg-slate-50 relative hover:border-blue-400 transition-colors cursor-pointer group shadow-inner">
                  {logoPreview ? (
                    <img src={logoPreview} alt="logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-300">
                      <ImageIcon size={28} />
                      <span className="text-[10px] font-bold mt-2">LOGO UPLOAD</span>
                    </div>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleImageChange(e, 'logo')} />
                </div>
              </div>
              
              <div className="group relative">
                <label className="block text-xs font-bold text-slate-500 mb-2 text-center uppercase tracking-wider">법인 인감 (도장)</label>
                <div className="w-24 h-24 border-2 border-dashed border-red-100 rounded-full flex flex-col items-center justify-center overflow-hidden bg-red-50/30 relative hover:border-red-300 transition-colors cursor-pointer shadow-inner group">
                  {stampPreview ? (
                    <img src={stampPreview} alt="stamp" className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="flex flex-col items-center text-red-200">
                      <ShieldCheck size={24} />
                      <span className="text-[10px] font-bold mt-1">인감 업로드</span>
                    </div>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleImageChange(e, 'stamp')} />
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tight">회사명 (상호) <span className="text-red-500">*</span></label>
                <input required placeholder="예: (주)미니멀리빙" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className={inputClasses} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tight">대표자명 <span className="text-red-500">*</span></label>
                <input required placeholder="성함 입력" value={formData.representative} onChange={e => setFormData({...formData, representative: e.target.value})} className={inputClasses} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tight">사업자번호 <span className="text-red-500">*</span></label>
                <input required placeholder="000-00-00000" value={formData.businessNumber} onChange={e => setFormData({...formData, businessNumber: e.target.value})} className={inputClasses} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tight">사업장 주소 <span className="text-red-500">*</span></label>
                <input required placeholder="도로명 주소 등 상세 주소" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={inputClasses} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tight">연락처</label>
                <input placeholder="전화번호" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className={inputClasses} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tight">이메일</label>
                <input type="email" placeholder="email@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClasses} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tight">업태</label>
                <input placeholder="예: 도소매" value={formData.uptae} onChange={e => setFormData({...formData, uptae: e.target.value})} className={inputClasses} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tight">종목</label>
                <input placeholder="예: 생활용품" value={formData.jongmok} onChange={e => setFormData({...formData, jongmok: e.target.value})} className={inputClasses} />
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t flex justify-end gap-4 mt-4">
            <button type="button" onClick={onClose} className="px-8 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition font-bold border border-slate-200">취소</button>
            <button type="submit" className="px-10 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-black transition font-bold shadow-xl shadow-slate-200">
              {initialData ? '수정사항 저장' : '공급자 저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
