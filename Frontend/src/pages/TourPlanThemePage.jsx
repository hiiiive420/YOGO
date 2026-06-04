import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Itineraries from './Itineraries.jsx';

export default function TourPlanThemePage() {
  const { themeSlug } = useParams();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [themeSlug]);

  return (
    <Itineraries
      initialThemeSlug={themeSlug}
      lockedTheme
      showFaq
      showHeader
      syncUrl={false}
      tourPlanDetail
      themeHero
    />
  );
}
