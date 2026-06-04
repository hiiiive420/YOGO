export function getContactPath({
  inquiryType = 'General',
  relatedLocation = '',
  relatedTheme = '',
  selectedItemSlug = '',
  selectedItemTitle = '',
  selectedPlace = '',
  selectedTourPackage = '',
  source = '',
  totalDays = '',
} = {}) {
  const params = new URLSearchParams();
  const title = selectedItemTitle || selectedTourPackage;

  if (inquiryType) params.set('inquiryType', inquiryType);
  if (title) params.set('selectedItemTitle', title);
  if (selectedItemSlug) params.set('selectedItemSlug', selectedItemSlug);
  if (relatedTheme) params.set('relatedTheme', relatedTheme);
  if (relatedLocation) params.set('relatedLocation', relatedLocation);
  if (selectedPlace) params.set('selectedPlace', selectedPlace);
  if (totalDays) params.set('totalDays', totalDays);

  if (source) {
    params.set('source', source);
  }

  const query = params.toString();

  return `/contact${query ? `?${query}` : ''}#contact-form`;
}
