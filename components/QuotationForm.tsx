
import React from 'react';
import { QuotationItem, RecipientInfo, QuotationType, CompanyProfile, ProviderInfo } from '../types';
import { Trash2, Plus, Upload, Loader2, Image as ImageIcon, Building, User } from 'lucide-react';

interface QuotationFormProps {
  type: QuotationType;
  recipient: RecipientInfo;
  thirdPartyProvider: ProviderInfo;
  currentProfile: CompanyProfile;
  items: QuotationItem[];
  onRecipientChange: (field: keyof RecipientInfo, value: string) => void;
  onProviderChange: (field: keyof ProviderInfo, value: string) => void;
  onCurrentProfileChange: (field: keyof CompanyProfile, value: string) => void;
  onItemChange: (id: string, field: keyof QuotationItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onOcrUpload: (file: File, target: 'RECIPIENT' | 'PROVIDER') => void;
  onStampUpload: (file: File) => void;
  isOcrLoading: boolean;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({
  type,
  recipient,
  thirdPartyProvider,
  currentProfile,
  items,
  onRecipientChange,
  onProviderChange,
  onCurrentProfileChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onOcrUpload,
  onStampUpload,
  isOcrLoading
}) => {
  // Common style for input fields - Light Gray background
  const inputBaseClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition-all text-slate-900 shadow-sm placeholder-slate-400";

  return (
    <div className="space-y-6">
      {/* 1. Provider Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-300">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building className="text-blue-600" size={20} />
            {type === 'MY_COMPANY' ? '우리 회사 (공급자) 정보' : '공급자 정보 (견적서 기재용)'}
          </h3>
          {type === 'THIRD_PARTY' && (
            <label className={`flex items-center gap-1.5 cursor-pointer bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-md text-xs transition font-bold shadow-md ${isOcrLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isOcrLoading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              사업자등록증 인식
              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onOcrUpload(e.target.files[0], 'PROVIDER')} disabled={isOcrLoading} />
            </label>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">상호 (회사명)</label>
            <input 
              type="text" 
              value={type === 'MY_COMPANY' ? currentProfile.companyName : thirdPartyProvider.companyName}
              onChange={(e) => type === 'MY_COMPANY' ? onCurrentProfileChange('companyName', e.target.value) : onProviderChange('companyName', e.target.value)}
              className={`${inputBaseClass} font-bold`}
              placeholder="공급자 회사명"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">사업자번호</label>
            <input 
              type="text" 
              value={type === 'MY_COMPANY' ? currentProfile.businessNumber : thirdPartyProvider.businessNumber}
              onChange={(e) => type === 'MY_COMPANY' ? onCurrentProfileChange('businessNumber', e.target.value) : onProviderChange('businessNumber', e.target.value)}
              className={inputBaseClass}
              placeholder="000-00-00000"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">대표자명</label>
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={type === 'MY_COMPANY' ? currentProfile.representative : thirdPartyProvider.representative}
                onChange={(e) => type === 'MY_COMPANY' ? onCurrentProfileChange('representative', e.target.value) : onProviderChange('representative', e.target.value)}
                className={inputBaseClass}
              />
              <span className="absolute right-3 text-slate-300 font-bold text-sm pointer-events-none">(인)</span>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">사업장 주소</label>
            <input 
              type="text" 
              value={type === 'MY_COMPANY' ? currentProfile.address : thirdPartyProvider.address}
              onChange={(e) => type === 'MY_COMPANY' ? onCurrentProfileChange('address', e.target.value) : onProviderChange('address', e.target.value)}
              className={inputBaseClass}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">연락처</label>
            <input 
              type="text" 
              value={type === 'MY_COMPANY' ? currentProfile.contact : thirdPartyProvider.contact}
              onChange={(e) => type === 'MY_COMPANY' ? onCurrentProfileChange('contact', e.target.value) : onProviderChange('contact', e.target.value)}
              className={inputBaseClass}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">이메일</label>
            <input 
              type="text" 
              /* Fixed: Removed as any cast now that email is in ProviderInfo */
              value={type === 'MY_COMPANY' ? currentProfile.email : thirdPartyProvider.email}
              onChange={(e) => type === 'MY_COMPANY' ? onCurrentProfileChange('email', e.target.value) : onProviderChange('email', e.target.value)}
              className={inputBaseClass}
            />
          </div>
          {type === 'THIRD_PARTY' && (
            <div className="flex items-center gap-4 md:col-span-2 mt-2 p-3 bg-slate-50/50 rounded-lg border border-slate-200 border-dashed">
               <div className="w-16 h-16 border-2 border-dashed border-red-200 rounded-lg flex items-center justify-center bg-white relative overflow-hidden shadow-inner group">
                 {thirdPartyProvider.stampUrl ? (
                   <img src={thirdPartyProvider.stampUrl} className="w-full h-full object-contain p-1" alt="stamp" />
                 ) : <ImageIcon size={20} className="text-red-200" />}
                 <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 transition-colors pointer-events-none" />
                 <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => e.target.files?.[0] && onStampUpload(e.target.files[0])} title="도장 이미지 업로드" />
               </div>
               <div className="text-xs text-slate-500 font-medium">
                 <p className="font-bold text-slate-700">공급자 인감 등록</p>
                 <p>클릭하여 도장 이미지를 업로드하세요.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Recipient Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-300">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="text-blue-600" size={20} />
            {type === 'MY_COMPANY' ? '공급받는 자 정보' : '공급받는 자 (귀하) 정보'}
          </h3>
          {type === 'MY_COMPANY' && (
            <label className={`flex items-center gap-1.5 cursor-pointer bg-slate-900 text-white hover:bg-black px-3 py-1.5 rounded-md text-xs transition font-bold shadow-md ${isOcrLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isOcrLoading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              사업자등록증 인식
              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onOcrUpload(e.target.files[0], 'RECIPIENT')} disabled={isOcrLoading} />
            </label>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">상호 (회사명)</label>
            <input 
              type="text" 
              value={recipient.companyName}
              onChange={(e) => onRecipientChange('companyName', e.target.value)}
              className={`${inputBaseClass} font-bold`}
              placeholder="회사명을 입력하세요"
            />
          </div>
          {type === 'MY_COMPANY' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">사업자번호</label>
                <input 
                  type="text" 
                  value={recipient.businessNumber}
                  onChange={(e) => onRecipientChange('businessNumber', e.target.value)}
                  className={inputBaseClass}
                  placeholder="000-00-00000"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">대표자명</label>
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={recipient.representative || ''}
                    onChange={(e) => onRecipientChange('representative', e.target.value)}
                    className={inputBaseClass}
                    placeholder="성함"
                  />
                  <span className="absolute right-3 text-slate-300 font-bold text-sm pointer-events-none">(인)</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">주소</label>
                <input 
                  type="text" 
                  value={recipient.address || ''}
                  onChange={(e) => onRecipientChange('address', e.target.value)}
                  className={inputBaseClass}
                  placeholder="주소 입력"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">전화번호</label>
                <input 
                  type="text" 
                  value={recipient.contact || ''}
                  onChange={(e) => onRecipientChange('contact', e.target.value)}
                  className={inputBaseClass}
                  placeholder="010-0000-0000"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">이메일주소</label>
                <input 
                  type="text" 
                  value={recipient.email || ''}
                  onChange={(e) => onRecipientChange('email', e.target.value)}
                  className={inputBaseClass}
                  placeholder="email@example.com"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3. Items Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-300 overflow-x-auto">
        <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">견적 내역 작성</h3>
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-[10px] uppercase font-bold tracking-widest border-y border-slate-200">
              <th className="px-4 py-3 text-left w-12">No.</th>
              <th className="px-4 py-3 text-left">품명/주문물품</th>
              {type === 'THIRD_PARTY' && <th className="px-4 py-3 text-left">규격</th>}
              <th className="px-4 py-3 text-right w-32">판매가/단가</th>
              <th className="px-4 py-3 text-right w-24">수량</th>
              <th className="px-4 py-3 text-right w-32">금액(합계)</th>
              <th className="px-4 py-3 text-center w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4 text-xs text-slate-400 font-bold">{index + 1}</td>
                <td className="px-4 py-4">
                  <input 
                    type="text" 
                    value={item.name}
                    onChange={(e) => onItemChange(item.id, 'name', e.target.value)}
                    className="w-full bg-slate-50/50 border-b border-slate-200 focus:border-blue-500 focus:bg-white outline-none text-sm py-1.5 px-2 rounded-t transition-all text-slate-900 font-bold"
                  />
                </td>
                {type === 'THIRD_PARTY' && (
                  <td className="px-4 py-4">
                    <input 
                      type="text" 
                      value={item.spec || ''}
                      onChange={(e) => onItemChange(item.id, 'spec', e.target.value)}
                      className="w-full bg-slate-50/50 border-b border-slate-200 focus:border-blue-500 focus:bg-white outline-none text-sm py-1.5 px-2 rounded-t transition-all text-slate-900"
                    />
                  </td>
                )}
                <td className="px-4 py-4">
                  <input 
                    type="number" 
                    value={item.unitPrice}
                    onChange={(e) => onItemChange(item.id, 'unitPrice', Number(e.target.value))}
                    className="w-full bg-slate-50/50 border-b border-slate-200 focus:border-blue-500 focus:bg-white outline-none text-sm py-1.5 px-2 rounded-t transition-all text-right text-slate-900 font-bold"
                  />
                </td>
                <td className="px-4 py-4">
                  <input 
                    type="number" 
                    value={item.quantity}
                    onChange={(e) => onItemChange(item.id, 'quantity', Number(e.target.value))}
                    className="w-full bg-slate-50/50 border-b border-slate-200 focus:border-blue-500 focus:bg-white outline-none text-sm py-1.5 px-2 rounded-t transition-all text-right font-bold text-slate-900"
                  />
                </td>
                <td className="px-4 py-4 text-sm text-right font-bold text-slate-900">
                  ₩{(item.unitPrice * item.quantity).toLocaleString()}
                </td>
                <td className="px-4 py-4 text-center">
                  <button onClick={() => onRemoveItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <button 
          onClick={onAddItem}
          className="mt-6 flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg active:scale-95"
        >
          <Plus size={18} />
          항목 추가하기
        </button>
      </div>
    </div>
  );
};