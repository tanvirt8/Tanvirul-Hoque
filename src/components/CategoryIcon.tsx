import React from 'react';
import {
  ShoppingBag,
  Utensils,
  Home,
  Zap,
  Car,
  PhoneCall,
  HeartPulse,
  Shirt,
  GraduationCap,
  Gift,
  Camera,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  Laptop,
  Building,
  Sparkles,
  Coins,
  Banknote,
  Smartphone,
  SmartphoneNfc,
  Landmark,
  Wallet,
  ArrowRightLeft,
  CircleHelp,
} from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  className?: string;
  color?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag,
  Utensils,
  Home,
  Zap,
  Car,
  PhoneCall,
  HeartPulse,
  Shirt,
  GraduationCap,
  Gift,
  Camera,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  Laptop,
  Building,
  Sparkles,
  Coins,
  Banknote,
  Smartphone,
  SmartphoneNfc,
  Landmark,
  Wallet,
  ArrowRightLeft,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  className = 'w-5 h-5',
}) => {
  const IconComponent = ICON_MAP[iconName] || CircleHelp;
  return <IconComponent className={className} />;
};
