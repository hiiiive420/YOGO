import {
  BedDouble,
  BookOpenText,
  Compass,
  Map,
  LayoutDashboard,
  ListTree,
  MapPinned,
  Route,
  Settings,
  Sunrise,
} from 'lucide-react';

export const adminNavigation = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Locations', href: '/admin/locations', icon: MapPinned },
  { label: 'Discover Sri Lanka', href: '/admin/discover', icon: Compass },
  { label: 'Day Tours', href: '/admin/day-tours', icon: Map },
  {
    label: 'Travel Themes',
    href: '/admin/itinerary-categories',
    icon: ListTree,
  },
  { label: 'Activity Packages', href: '/admin/itineraries', icon: Route },
  { label: 'Accommodations', href: '/admin/accommodations', icon: BedDouble },
  { label: 'Blogs', href: '/admin/blogs', icon: BookOpenText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export const adminBrandIcon = Sunrise;
