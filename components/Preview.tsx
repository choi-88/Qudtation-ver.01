
import React from 'react';
import { QuotationState, QuotationType, CompanyProfile } from '../types';

interface PreviewProps {
  state: QuotationState;
  type: QuotationType;
}

export const Preview: React.FC<PreviewProps> = ({ state, type }) => {
  const { provider, recipient, items, date } = state;
  const totalQty = items.reduce((acc, cur) => acc + cur.quantity, 0);
  const totalAmt = items.reduce((acc, cur) => acc + cur.unitPrice * cur.quantity, 0);

  // Style for the stamp to make it darker, more vivid, and realistic
  const stampStyle: React.CSSProperties = {
    filter: 'saturate(1.8) brightness(0.65) contrast(1.5)',
    mixBlendMode: 'multiply',
    opacity: 0.98,
  };

  // Format date for third party: 년 월 일
  const formatDateKorean = (dStr: string) => {
    const d = new Date(dStr);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  // Common container style for A4 (210mm x 297mm)
  const a4Style = "bg-white p-[15mm] w-[210mm] min-h-[297mm] mx-auto shadow-2xl border border-slate-300 text-black overflow-hidden print:shadow-none print:border-none";

  if (type === 'MY_COMPANY') {
    // Cast provider to CompanyProfile as it is guaranteed to be that type for MY_COMPANY
    const myProvider = provider as CompanyProfile;
    return (
      <div id="quotation-print-area" className={a4Style}>
        {/* Minimal Living Template */}
        <div className="flex justify-between items-start mb-10">
          <div className="w-24 h-24 flex items-center justify-center">
            {/* Fix: Use myProvider.logoUrl instead of provider.logoUrl */}
            {myProvider.logoUrl ? (
              <img src={myProvider.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-xs text-black border-2 border-black p-2 uppercase font-bold">Logo</div>
            )}
          </div>
          <div className="flex-1 text-center">
             <h1 className="text-4xl font-bold tracking-[0.5em] border-2 border-black py-2 px-10 inline-block mb-4 text-black">견 적 서</h1>
          </div>
          <div className="w-24"></div>
        </div>

        <div className="flex justify-between gap-8 mb-8 text-sm text-black">
          {/* Provider Column */}
          <div className="flex-1 space-y-1">
            <p><span className="font-bold">공급자 :</span> {provider.companyName}</p>
            <div className="flex items-center gap-2">
              <span className="font-bold">대표자:</span> 
              <span className="font-bold">{provider.representative}</span>
              <div className="relative w-10 h-10 flex items-center justify-center">
                {/* (인) 텍스트 칼라만 연한 그레이로 변경, 테두리 없음 */}
                <span className="text-[12px] text-slate-300 font-bold">(인)</span>
                {provider.stampUrl && (
                  <img 
                    src={provider.stampUrl} 
                    className="absolute inset-0 w-full h-full object-contain z-10" 
                    style={stampStyle}
                    alt="stamp" 
                  />
                )}
              </div>
            </div>
            <p><span className="font-bold">사업자번호:</span> {provider.businessNumber}</p>
            <p>{provider.address}</p>
            <p><span className="font-bold">e-mail:</span> {provider.email}</p>
            <p className="font-bold">TEL. {provider.contact}</p>
          </div>

          {/* Recipient Column */}
          <div className="flex-1">
            <div className="flex gap-2 text-sm mb-4 border-b-2 border-black pb-1 text-black">
               <span className="font-bold">DATE:</span>
               <span className="font-bold">{date}</span>
            </div>
            <div className="space-y-1 text-black">
              <p><span className="font-bold">공급받는자 :</span> {recipient.companyName}</p>
              <p><span className="font-bold">사업자번호:</span> {recipient.businessNumber}</p>
              <p>{recipient.address || '-'}</p>
              <p><span className="font-bold">e-mail:</span> {recipient.email || '-'}</p>
              <p><span className="font-bold">TEL.</span> {recipient.contact || '-'}</p>
            </div>
          </div>
        </div>

        <table className="w-full border-t-2 border-b-2 border-black mb-8 border-collapse">
          <thead>
            <tr className="bg-slate-100 text-[11px] font-bold border-b-2 border-black text-black">
              <th className="py-2 text-left px-2 border-r border-black">번호</th>
              <th className="py-2 text-left px-2 border-r border-black">주문물품</th>
              <th className="py-2 text-right px-2 border-r border-black">판매가</th>
              <th className="py-2 text-right px-2 border-r border-black">수량</th>
              <th className="py-2 text-right px-2">가격</th>
            </tr>
          </thead>
          <tbody className="text-[11px] text-black font-medium">
            {items.map((item, idx) => (
              <tr key={item.id} className="border-b border-black/40">
                <td className="py-2 px-2 border-r border-black/40">{idx + 1}</td>
                <td className="py-2 px-2 border-r border-black/40 font-bold">{item.name}</td>
                <td className="py-2 px-2 text-right border-r border-black/40">₩{item.unitPrice.toLocaleString()}</td>
                <td className="py-2 px-2 text-right border-r border-black/40 font-bold">{item.quantity}</td>
                <td className="py-2 px-2 text-right font-bold">₩{(item.unitPrice * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 8 - items.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="border-b border-black/20">
                <td className="py-4 border-r border-black/20"></td>
                <td className="py-4 border-r border-black/20"></td>
                <td className="py-4 border-r border-black/20"></td>
                <td className="py-4 border-r border-black/20"></td>
                <td className="py-4"></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t-2 border-black text-black">
              <td colSpan={3} className="py-2 px-2 border-r border-black font-bold text-right">총 수량:</td>
              <td className="py-2 px-2 border-r border-black text-right font-bold">{totalQty}</td>
              <td className="py-2"></td>
            </tr>
            <tr className="bg-slate-100 border-t-2 border-black text-black">
              <td colSpan={3} className="py-2 px-2 border-r border-black font-bold text-right text-lg">총 가격 (VAT포함):</td>
              <td colSpan={2} className="py-2 px-2 text-right font-bold text-2xl">₩{totalAmt.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div className="text-[10px] space-y-1.5 text-black mt-10 font-bold leading-relaxed">
          <p>* 결제는 선입금으로 이루어지며, 발주시 미리 납기일을 알려주셔야 합니다.</p>
          <p>* 견적 유효 기간은 발행일로부터 7일입니다.</p>
          <p>* 단체 주문의 경우, 최소 납기일로부터 1-2주 전에 주문해주셔야 합니다.</p>
          <p>* 재고 사정에 따라 납품 기일은 발주 전 상호협의를 통해 결정되며, 입고 상황에 따라 1-3일정도의 변동이 있을 수 있습니다.</p>
          <p>* 제품의 초기 불량은 교환 및 반품이 가능하며, 사용후에는 불가합니다.</p>
          <p>* 제품 초기 불량의 교환 및 반품은 발송일 기준 3일 이내 알려주셔야 하며, 당사로 7일 이내 보내주셔야 합니다 (반품택배비는 당사가 부담합니다)</p>
        </div>
        
        <div className="mt-16 flex justify-end">
          <div className="w-16 h-16 grayscale opacity-30">
             {/* Fix: Use myProvider.logoUrl instead of provider.logoUrl */}
             {myProvider.logoUrl && <img src={myProvider.logoUrl} alt="bg" className="w-full h-full object-contain" />}
          </div>
        </div>
      </div>
    );
  }

  // Third Party Template
  return (
    <div id="quotation-print-area" className={a4Style}>
      <h1 className="text-4xl text-center font-bold mb-8 underline decoration-double underline-offset-8 text-black">견 적 서</h1>
      
      <div className="flex mb-4">
        <div className="flex-1 border-b-2 border-black pb-2 mr-10">
          <div className="text-lg mb-2 font-bold text-black">{formatDateKorean(date)}</div>
          <div className="text-2xl font-bold flex items-end gap-2 text-black">
            <span className="border-b-2 border-black min-w-[200px] text-center inline-block pb-1">{recipient.companyName || '           '}</span>
            <span className="text-lg font-bold">귀하</span>
          </div>
          <p className="mt-6 text-sm font-bold text-black">아래와 같이 견적합니다.</p>
        </div>
        
        <div className="flex-none w-[350px]">
          <table className="w-full text-xs border-collapse border-2 border-black">
             <tbody>
               <tr>
                 <td rowSpan={5} className="border border-black w-8 text-center bg-slate-100 font-bold text-black">공급자</td>
                 <td className="border border-black px-2 py-1 bg-slate-100 font-bold text-black">등록번호</td>
                 <td colSpan={3} className="border border-black px-2 py-1 font-bold text-black text-sm">{provider.businessNumber}</td>
               </tr>
               <tr>
                 <td className="border border-black px-2 py-1 bg-slate-100 font-bold text-black">상호(법인명)</td>
                 <td className="border border-black px-2 py-1 text-black font-bold">{provider.companyName}</td>
                 <td className="border border-black px-2 py-1 bg-slate-100 font-bold text-black">성명</td>
                 <td className="border border-black px-2 py-1 relative text-black">
                    <span className="relative z-0 font-bold">{provider.representative} (인)</span>
                    {provider.stampUrl && (
                      <img 
                        src={provider.stampUrl} 
                        className="absolute right-0 top-0 w-8 h-8 z-10" 
                        style={stampStyle}
                        alt="stamp" 
                      />
                    )}
                 </td>
               </tr>
               <tr>
                 <td className="border border-black px-2 py-1 bg-slate-100 font-bold text-black">사업장주소</td>
                 <td colSpan={3} className="border border-black px-2 py-1 text-black font-bold">{provider.address}</td>
               </tr>
               <tr>
                 <td className="border border-black px-2 py-1 bg-slate-100 font-bold text-black">업태</td>
                 <td className="border border-black px-2 py-1 text-black font-bold">{provider.uptae || '도소매'}</td>
                 <td className="border border-black px-2 py-1 bg-slate-100 font-bold text-black">종목</td>
                 <td className="border border-black px-2 py-1 text-black font-bold">{provider.jongmok || '생활용품'}</td>
               </tr>
               <tr>
                 <td className="border border-black px-2 py-1 bg-slate-100 font-bold text-black">전화번호</td>
                 <td colSpan={3} className="border border-black px-2 py-1 text-black font-bold text-sm">{provider.contact}</td>
               </tr>
             </tbody>
          </table>
        </div>
      </div>

      <div className="border-2 border-black flex items-center mb-4 p-3 bg-slate-100">
        <span className="font-bold mr-10 text-xl text-black">합 계 금 액</span>
        <span className="text-2xl font-bold flex-1 text-center text-black">
          원정 ( ₩ {totalAmt.toLocaleString()} )
        </span>
      </div>

      <table className="w-full border-collapse border-2 border-black text-xs text-center">
        <thead>
          <tr className="bg-slate-200 text-black font-bold border-b-2 border-black">
            <th className="border border-black py-2 w-1/4">품명</th>
            <th className="border border-black py-2 w-1/12">규격</th>
            <th className="border border-black py-2 w-1/12">수량</th>
            <th className="border border-black py-2 w-1/6">단가</th>
            <th className="border border-black py-2 w-1/6">공급가액</th>
            <th className="border border-black py-2 w-1/6">세액</th>
            <th className="border border-black py-2 w-1/12">비고</th>
          </tr>
        </thead>
        <tbody className="text-black font-bold">
          {items.map(item => (
            <tr key={item.id} className="border-b border-black">
              <td className="border border-black py-2 px-1 text-left">{item.name}</td>
              <td className="border border-black py-2 px-1">{item.spec}</td>
              <td className="border border-black py-2 px-1">{item.quantity}</td>
              <td className="border border-black py-2 px-1 text-right">{item.unitPrice.toLocaleString()}</td>
              <td className="border border-black py-2 px-1 text-right">{(item.unitPrice * item.quantity).toLocaleString()}</td>
              <td className="border border-black py-2 px-1 text-right">0</td>
              <td className="border border-black py-2 px-1">{item.note}</td>
            </tr>
          ))}
          {Array.from({ length: Math.max(0, 8 - items.length) }).map((_, i) => (
            <tr key={i} className="border-b border-black">
              <td className="border border-black py-4"></td>
              <td className="border border-black py-4"></td>
              <td className="border border-black py-4"></td>
              <td className="border border-black py-4"></td>
              <td className="border border-black py-4"></td>
              <td className="border border-black py-4"></td>
              <td className="border border-black py-4"></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-100 font-bold text-black">
            <td colSpan={2} className="border border-black py-2 text-sm">총 계</td>
            <td className="border border-black py-2 text-sm">{totalQty}</td>
            <td className="border border-black py-2"></td>
            <td className="border border-black py-2 text-right text-sm">{totalAmt.toLocaleString()}</td>
            <td className="border border-black py-2 text-right text-sm">0</td>
            <td className="border border-black py-2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
