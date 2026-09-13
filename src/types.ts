export type PropertyType = 'Residential' | 'Commercial';

export type ServiceType = 
  | 'Air Duct Cleaning'
  | 'Carpet Cleaning'
  | 'Window Cleaning'
  | 'Multiple Services'
  | 'Residential Cleaning'
  | 'Commercial Cleaning';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  photoURL?: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

export type BookingStatus = 'pending' | 'approved' | 'confirmed' | 'completed' | 'cancelled' | 'deleted';

export interface BookingRecord {
  id?: string;
  userId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  serviceType: string;
  packageTier?: string;
  propertyType?: PropertyType | string;
  address?: string;
  preferredDate?: string;
  preferredTimeSlot?: string;
  estimatedPriceCAD?: number;
  additionalNotes?: string;
  status: BookingStatus;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  consumerConfirmationSent?: boolean;
  adminNotificationSent?: boolean;
}

export interface AdminNotification {
  id: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceType: string;
  propertyType?: string;
  address?: string;
  preferredDate?: string;
  preferredTimeSlot?: string;
  createdAt: string;
  read: boolean;
  status: 'pending' | 'approved' | 'cancelled';
  approvedAt?: string;
}

export interface ReviewRecord {
  id?: string;
  userId?: string;
  authorName: string;
  rating: number;
  service: string;
  neighborhood: string;
  comment: string;
  verified?: boolean;
  createdAt: string;
}

export interface QuoteFormData {
  fullName: string;
  phone: string;
  email: string;
  propertyType: PropertyType;
  services: ServiceType[];
  address: string;
  preferredDate: string;
  message: string;
}

export interface BeforeAfterItem {
  id: string;
  title: string;
  category: 'Carpet Cleaning' | 'Air Duct Cleaning' | 'Window Cleaning';
  description: string;
  beforeImage: string;
  afterImage: string;
  tag: string;
  specs: string[];
}

export interface ServiceCardData {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  icon: string;
  image: string;
  features: string[];
  ctaText: string;
}

