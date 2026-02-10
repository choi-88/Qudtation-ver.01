
import React, { useState, useEffect } from 'react';
import { CompanyProfile, ProviderInfo, QuotationItem, RecipientInfo, QuotationType, QuotationState } from './types';
import { ProfileSelector } from './components/ProfileSelector';
import { QuotationForm } from './components/QuotationForm';
import { Preview } from './components/Preview';
import { ProfileModal } from './components/ProfileModal';
import { extractBusinessInfo } from './services/geminiService';
import { FileText, Building2, Download, ExternalLink, Printer, Home, LogOut, Key, UserCheck, ShieldAlert, CheckCircle, Trash2, X } from 'lucide-react';
import * as XLSX from 'xlsx';

// --- Types for Auth ---
interface User {
  id: string;
  password: string;
  status: 'pending' | 'approved';
  isAdmin?: boolean;
}

const DEFAULT_ITEMS: QuotationItem[] = [
  { id: '1', name: '', unitPrice: 0, quantity: 1, totalPrice: 0 },
];

const INITIAL_RECIPIENT: RecipientInfo = {
  companyName: '',
  businessNumber: '',
  representative: '',
  address: '',
  contact: '',
  email: ''
};

const INITIAL_THIRD_PARTY_PROVIDER: ProviderInfo = {
  companyName: '',
  businessNumber: '',
  representative: '',
  address: '',
  contact: '',
  email: '',
  uptae: '도소매',
  jongmok: '생활용품',
  stampUrl: ''
};

const App: React.FC = () => {
  // --- Auth & API States ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'admin'>('login');
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [loginInput, setLoginInput] = useState({ id: '', pw: '' });

  // --- Main App States ---
  const [activeTab, setActiveTab] = useState<QuotationType>('MY_COMPANY');
  const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CompanyProfile | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [myCompanyRecipient, setMyCompanyRecipient] = useState<RecipientInfo>(INITIAL_RECIPIENT);
  const [myCompanyItems, setMyCompanyItems] = useState<QuotationItem[]>(DEFAULT_ITEMS);
  const [thirdPartyProvider, setThirdPartyProvider] = useState<ProviderInfo>(INITIAL_THIRD_PARTY_PROVIDER);
  const [thirdPartyRecipient, setThirdPartyRecipient] = useState<RecipientInfo>(INITIAL_RECIPIENT);
  const [thirdPartyItems, setThirdPartyItems] = useState<QuotationItem[]>(DEFAULT_ITEMS);

  // --- Persistent Storage Logic ---
  useEffect(() => {
    const savedUsers = localStorage.getItem('quot_users');
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    else {
      // 초기 비밀번호 설정: n47867000@nm
      const admin: User = { id: 'admin', password: 'n47867000@nm', status: 'approved', isAdmin: true };
      setUsers([admin]);
      localStorage.setItem('quot_users', JSON.stringify([admin]));
    }

    const savedSession = localStorage.getItem('quot_session');
    if (savedSession) setCurrentUser(JSON.parse(savedSession));

    const savedKey = localStorage.getItem('quot_gemini_key');
    if (savedKey) setApiKey(savedKey);

    const savedProfiles = localStorage.getItem('quotation_profiles');
    if (savedProfiles) {
      const parsed = JSON.parse(savedProfiles);
      if (parsed.length > 0) {
        setProfiles(parsed);
        setSelectedProfileId(parsed[0].id);
      }
    } else {
      const defaultProfile: CompanyProfile = {
        id: 'default_01', companyName: '미니멀리빙', representative: '최선미', businessNumber: '669-22-00704',
        address: '서울특별시 어디구 어디동 123-45', contact: '010-1234-5678', email: 'minimal@example.com',
        uptae: '도소매', jongmok: '생활용품', logoUrl: '', stampUrl: ''
      };
      setProfiles([defaultProfile]);
      setSelectedProfileId('default_01');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('quot_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (profiles.length > 0) localStorage.setItem('quotation_profiles', JSON.stringify(profiles));
  }, [profiles]);

  // --- Auth Handlers ---
  const handleAuth = () => {
    if (authMode === 'login') {
      const user = users.find(u => u.id === loginInput.id && u.password === loginInput.pw);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('quot_session', JSON.stringify(user));
        setLoginInput({ id: '', pw: '' });
      } else {
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
      }
    } else if (authMode === 'signup') {
      if (users.find(u => u.id === loginInput.id)) {
        alert('이미 존재하는 아이디입니다.');
        return;
      }
      const newUser: User = { id: loginInput.id, password: loginInput.pw, status: 'pending' };
      setUsers([...users, newUser]);
      alert('회원가입 신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다.');
      setAuthMode('login');
      setLoginInput({ id: '', pw: '' });
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('quot_session');
  };

  const handleApiKeySave = () => {
    localStorage.setItem('quot_gemini_key', apiKey);
    setShowApiKeyModal(false);
    alert('API 키가 저장되었습니다.');
  };

  // --- Profile Management Handlers ---
  const openAddModal = () => {
    setEditingProfile(null);
    setIsProfileModalOpen(true);
  };

  const openEditModal = (id: string) => {
    const profile = profiles.find(p => p.id === id);
    if (profile) {
      setEditingProfile(profile);
      setIsProfileModalOpen(true);
    }
  };

  const saveProfile = (profile: CompanyProfile) => {
    if (editingProfile) {
      setProfiles(profiles.map(p => (p.id === profile.id ? profile : p)));
    } else {
      setProfiles([...profiles, profile]);
      if (profiles.length === 0) {
        setSelectedProfileId(profile.id);
      }
    }
    setIsProfileModalOpen(false);
  };

  // --- Main App Logic ---
  const currentProfile = profiles.find(p => p.id === selectedProfileId) || (profiles.length > 0 ? profiles[0] : {
    id: '', companyName: '', representative: '', businessNumber: '', address: '', contact: '', email: '', logoUrl: '', stampUrl: '', uptae: '도소매', jongmok: '생활용품'
  });

  const handleOcr = async (file: File, target: 'RECIPIENT' | 'PROVIDER') => {
    if (!apiKey) {
      alert('Gemini API 키를 먼저 등록해주세요.');
      setShowApiKeyModal(true);
      return;
    }
    setIsOcrLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const info = await extractBusinessInfo(base64, apiKey);
      if (info) {
        if (target === 'RECIPIENT') {
          const setter = activeTab === 'MY_COMPANY' ? setMyCompanyRecipient : setThirdPartyRecipient;
          setter(prev => ({
            ...prev,
            companyName: info.companyName || '',
            businessNumber: info.businessNumber || '',
            representative: info.representative || '',
            address: info.address || ''
          }));
        } else {
          setThirdPartyProvider(prev => ({
            ...prev,
            companyName: info.companyName || '',
            businessNumber: info.businessNumber || '',
            representative: info.representative || '',
            address: info.address || ''
          }));
        }
      }
      setIsOcrLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCurrentProfileChange = (field: keyof CompanyProfile, value: string) => {
    const targetId = selectedProfileId || (profiles.length > 0 ? profiles[0].id : null);
    if (!targetId) return;
    setProfiles(prev => prev.map(p => p.id === targetId ? { ...p, [field]: value } : p));
  };

  const switchToThirdParty = () => {
    setThirdPartyRecipient({ ...INITIAL_RECIPIENT, companyName: currentProfile.companyName });
    setThirdPartyItems([...myCompanyItems]);
    setActiveTab('THIRD_PARTY');
  };

  const navigateToThirdParty = () => {
    setThirdPartyProvider(INITIAL_THIRD_PARTY_PROVIDER);
    setThirdPartyRecipient(INITIAL_RECIPIENT);
    setThirdPartyItems(DEFAULT_ITEMS);
    setActiveTab('THIRD_PARTY');
  };

  const exportToExcel = () => {
    const qState = quotationState;
    const ws_data = [
        ["견 적 서", null, null, null, null],
        [],
        [`공급자 : ${qState.provider.companyName}`, null, null, "DATE :", qState.date],
        [`대표자 : ${qState.provider.representative} (인)`, null, null, "공급받는자 :", qState.recipient.companyName],
        [`사업자번호 : ${qState.provider.businessNumber}`, null, null, "사업자번호 :", qState.recipient.businessNumber || "-"],
        [`e-mail : ${qState.provider.email || "-"}`, null, null, "e-mail :", qState.recipient.email || "-"],
        [`TEL : ${qState.provider.contact}`, null, null, "TEL :", qState.recipient.contact || "-"],
        [],
        ["번호", "주문물품", "판매가", "수량", "가격"],
        ...qState.items.slice(0, 15).map((item, idx) => [
          idx + 1, item.name, item.unitPrice, item.quantity, item.unitPrice * item.quantity
        ]),
        ...Array.from({ length: Math.max(0, 15 - qState.items.length) }).map((_, i) => [
          qState.items.length + i + 1, "", "", "", ""
        ]),
        [null, null, "총 수량:", qState.totalQuantity, null],
        [null, null, "총 가격(VAT포함):", `₩${qState.totalAmount.toLocaleString()}`, null]
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!cols'] = [ { wch: 10 }, { wch: 30 }, { wch: 15 }, { wch: 10 }, { wch: 15 } ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quotation");
    XLSX.writeFile(wb, `견적서_${qState.date}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const quotationState: QuotationState = {
    date,
    provider: activeTab === 'MY_COMPANY' ? currentProfile : thirdPartyProvider,
    recipient: activeTab === 'MY_COMPANY' ? myCompanyRecipient : thirdPartyRecipient,
    items: activeTab === 'MY_COMPANY' ? myCompanyItems : thirdPartyItems,
    totalQuantity: (activeTab === 'MY_COMPANY' ? myCompanyItems : thirdPartyItems).reduce((acc, cur) => acc + cur.quantity, 0),
    totalAmount: (activeTab === 'MY_COMPANY' ? myCompanyItems : thirdPartyItems).reduce((acc, cur) => acc + (cur.unitPrice * cur.quantity), 0),
  };

  // --- Auth Screens ---
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
              <FileText className="text-blue-600" size={32} /> 견적 마스터 2.0
            </h1>
            <p className="text-slate-500 mt-2 font-medium">관리자 승인형 견적 발급 시스템</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${authMode === 'login' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>로그인</button>
              <button onClick={() => setAuthMode('signup')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${authMode === 'signup' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>회원가입</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">아이디</label>
                <input 
                  type="text" 
                  value={loginInput.id} 
                  onChange={e => setLoginInput({...loginInput, id: e.target.value})} 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-black" 
                  placeholder="ID" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">비밀번호</label>
                <input 
                  type="password" 
                  value={loginInput.pw} 
                  onChange={e => setLoginInput({...loginInput, pw: e.target.value})} 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-black" 
                  placeholder="••••••••" 
                />
              </div>
            </div>
            <button onClick={handleAuth} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-200">
              {authMode === 'login' ? '로그인 하기' : '승인 요청하기'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-sm border border-slate-200">
          <div className="bg-yellow-100 text-yellow-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">승인 대기 중</h2>
          <p className="text-slate-500 mb-8 font-medium">관리자의 승인이 완료된 후에 서비스 이용이 가능합니다. 잠시만 기다려주세요.</p>
          <button onClick={logout} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">로그아웃</button>
        </div>
      </div>
    );
  }

  // --- Main App Screen ---
  return (
    <div className="min-h-screen flex bg-slate-100 font-sans text-slate-900 overflow-x-hidden">
      <aside className="w-64 bg-slate-900 text-white flex flex-col no-print fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText className="text-blue-400" /> 견적 마스터 2.0
          </h1>
          <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">{currentUser.id} logged in</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button onClick={() => setActiveTab('MY_COMPANY')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold ${activeTab === 'MY_COMPANY' ? 'bg-blue-600 shadow-lg text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Home size={20} /> 우리 회사 견적
          </button>
          <button onClick={navigateToThirdParty} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold ${activeTab === 'THIRD_PARTY' ? 'bg-blue-600 shadow-lg text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Building2 size={20} /> 타사 견적 발급
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button onClick={() => setShowApiKeyModal(true)} className="w-full flex items-center justify-between px-4 py-2 bg-slate-800 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition">
            <div className="flex items-center gap-2"><Key size={14} /> Gemini API</div>
            {apiKey ? <CheckCircle size={12} className="text-green-500" /> : <ShieldAlert size={12} className="text-red-500" />}
          </button>
          <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition">
            <LogOut size={14} /> 로그아웃
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 pb-32 no-print">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">
                {activeTab === 'MY_COMPANY' ? '우리 회사 견적서 발급' : '타사 견적서 발급해주기'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
               <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg shadow-sm font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none text-black" />
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <ProfileSelector profiles={profiles} selectedProfileId={selectedProfileId} onSelect={setSelectedProfileId} onAdd={openAddModal} onEdit={openEditModal} onDelete={(id) => { const newProfiles = profiles.filter(p => p.id !== id); setProfiles(newProfiles); if (selectedProfileId === id && newProfiles.length > 0) setSelectedProfileId(newProfiles[0].id); }} />
              <QuotationForm type={activeTab} recipient={activeTab === 'MY_COMPANY' ? myCompanyRecipient : thirdPartyRecipient} thirdPartyProvider={thirdPartyProvider} currentProfile={currentProfile} items={activeTab === 'MY_COMPANY' ? myCompanyItems : thirdPartyItems} onRecipientChange={(f, v) => { const setter = activeTab === 'MY_COMPANY' ? setMyCompanyRecipient : setThirdPartyRecipient; setter(prev => ({ ...prev, [f]: v })); }} onProviderChange={(f, v) => setThirdPartyProvider({ ...thirdPartyProvider, [f]: v })} onCurrentProfileChange={handleCurrentProfileChange} onItemChange={(id, f, v) => { const items = activeTab === 'MY_COMPANY' ? myCompanyItems : thirdPartyItems; const setter = activeTab === 'MY_COMPANY' ? setMyCompanyItems : setThirdPartyItems; setter(items.map(it => it.id === id ? { ...it, [f]: v, totalPrice: (f === 'unitPrice' ? Number(v) : it.unitPrice) * (f === 'quantity' ? Number(v) : it.quantity) } : it)); }} onAddItem={() => { const items = activeTab === 'MY_COMPANY' ? myCompanyItems : thirdPartyItems; const setter = activeTab === 'MY_COMPANY' ? setMyCompanyItems : setThirdPartyItems; setter([...items, { id: Date.now().toString(), name: '', unitPrice: 0, quantity: 1, totalPrice: 0 }]); }} onRemoveItem={(id) => { const items = activeTab === 'MY_COMPANY' ? myCompanyItems : thirdPartyItems; const setter = activeTab === 'MY_COMPANY' ? setMyCompanyItems : setThirdPartyItems; if (items.length > 1) setter(items.filter(it => it.id !== id)); }} onOcrUpload={handleOcr} onStampUpload={(file) => { const r = new FileReader(); r.onloadend = () => setThirdPartyProvider({...thirdPartyProvider, stampUrl: r.result as string}); r.readAsDataURL(file); }} isOcrLoading={isOcrLoading} />
              {activeTab === 'MY_COMPANY' && (
                <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div><h4 className="font-bold text-blue-900 text-sm">연동 기능</h4><p className="text-blue-700 text-xs font-bold">우리 회사 정보를 귀하(공급받는자)로 자동 설정합니다.</p></div>
                  <button type="button" onClick={switchToThirdParty} className="flex items-center gap-1.5 bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-800 transition-all shadow-lg active:scale-95"><ExternalLink size={16} /> 타사 견적서로 전환</button>
                </div>
              )}
            </div>
            <div className="sticky top-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900 text-lg">실시간 미리보기</h3>
                <div className="flex gap-2">
                  <button type="button" onClick={exportToExcel} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-md transition-all active:scale-95">
                    <Download size={14} /> 엑셀 다운로드
                  </button>
                  {/* 사용자 요청에 따라 ID를 print-pdf-button으로 변경 */}
                  <button id="print-pdf-button" type="button" className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black shadow-lg transition-all active:scale-95">
                    <Printer size={14} /> PDF / 인쇄
                  </button>
                </div>
              </div>
              <div className="transform scale-[0.6] origin-top border-4 border-slate-300 rounded-2xl shadow-2xl bg-slate-200 p-2">
                <Preview state={quotationState} type={activeTab} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 인쇄 전용 컨테이너 */}
      <div id="invoice-container" className="print-only">
        <Preview state={quotationState} type={activeTab} />
      </div>

      {isProfileModalOpen && <ProfileModal initialData={editingProfile} onClose={() => setIsProfileModalOpen(false)} onSave={saveProfile} apiKey={apiKey} />}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2"><Key className="text-blue-600" /> Gemini API 설정</h2>
                <button onClick={() => setShowApiKeyModal(false)} className="text-slate-400 hover:text-slate-900 transition"><X size={20} /></button>
             </div>
             <p className="text-sm text-slate-500 mb-4 font-medium">사업자등록증 OCR 기능을 위해 Gemini API 키가 필요합니다.</p>
             <div className="space-y-4">
                <input 
                  type="password" 
                  value={apiKey} 
                  onChange={e => setApiKey(e.target.value)} 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-black" 
                  placeholder="AI... API Key" 
                />
                <button onClick={handleApiKeySave} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">저장 및 업데이트</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
