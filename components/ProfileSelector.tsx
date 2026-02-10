
import React from 'react';
import { CompanyProfile } from '../types';
import { PlusCircle, Trash2, Edit2 } from 'lucide-react';

interface ProfileSelectorProps {
  profiles: CompanyProfile[];
  selectedProfileId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  profiles,
  selectedProfileId,
  onSelect,
  onAdd,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-300 mb-6">
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          공급자 라이브러리
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Storage</span>
        </h3>
        <button 
          onClick={onAdd}
          className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition font-bold shadow-md"
        >
          <PlusCircle size={14} />
          새 공급자 등록
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
        {profiles.map((p) => (
          <div 
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`group relative p-3 rounded-xl border-2 cursor-pointer transition-all ${
              selectedProfileId === p.id 
              ? 'border-blue-500 bg-blue-50 shadow-sm' 
              : 'border-slate-100 bg-slate-50 hover:border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {p.logoUrl ? (
                  <img src={p.logoUrl} alt="logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Logo</div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-bold text-sm text-slate-900 truncate">{p.companyName}</p>
                <p className="text-[10px] text-slate-500 font-medium truncate">{p.businessNumber}</p>
              </div>
            </div>
            
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(p.id); }}
                className="bg-white text-slate-400 hover:text-blue-600 p-1.5 rounded-lg border border-slate-200 shadow-sm hover:border-blue-200"
                title="수정"
              >
                <Edit2 size={12} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                className="bg-white text-slate-400 hover:text-red-500 p-1.5 rounded-lg border border-slate-200 shadow-sm hover:border-red-200"
                title="삭제"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
        {profiles.length === 0 && (
          <div className="col-span-full py-6 text-center text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
            저장된 공급자가 없습니다. 자주 쓰는 업체 정보를 등록하세요.
          </div>
        )}
      </div>
    </div>
  );
};
