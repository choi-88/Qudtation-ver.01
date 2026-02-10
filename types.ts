
export interface CompanyProfile {
  id: string;
  logoUrl?: string;
  stampUrl?: string;
  companyName: string;
  representative: string;
  businessNumber: string;
  address: string;
  contact: string;
  email: string;
  uptae?: string;
  jongmok?: string;
}

export interface ProviderInfo {
  companyName: string;
  businessNumber: string;
  representative: string;
  address: string;
  contact: string;
  email: string;
  uptae?: string;
  jongmok?: string;
  stampUrl?: string;
}

export interface QuotationItem {
  id: string;
  name: string;
  spec?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  note?: string;
}

export interface RecipientInfo {
  companyName: string;
  businessNumber: string;
  representative?: string;
  address?: string;
  contact?: string;
  email?: string;
}

export type QuotationType = 'MY_COMPANY' | 'THIRD_PARTY';

export interface QuotationState {
  date: string;
  provider: CompanyProfile | ProviderInfo;
  recipient: RecipientInfo;
  items: QuotationItem[];
  totalQuantity: number;
  totalAmount: number;
  notes?: string;
}