import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronsUpDown,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getApiError } from '../../../api/client';
import { fetchLocations } from '../../../api/locations';
import { useToast } from '../../../context/ToastContext';
import CreateLocationModal from './CreateLocationModal';

function getId(value) {
  if (typeof value === 'string') return value;
  if (!value) return '';
  return value._id || value.id || value.value || '';
}

function toArray(value) {
  const items = Array.isArray(value) ? value : value ? [value] : [];
  return items.map((item) => getId(item)).filter(Boolean);
}

function toObjectArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : value ? [value] : [];
}

function normalizeLocation(location) {
  const id = getId(location) || location?.slug || location?.name;

  if (!id || typeof location !== 'object') return null;

  return {
    ...location,
    _id: id,
  };
}

function mergeLocation(locations, location) {
  const locationId = getId(location);
  if (!locationId) return locations;

  return [
    { ...location, _id: locationId },
    ...locations.filter((item) => getId(item) !== locationId),
  ].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

export default function LocationSelectWithCreate({
  className = '',
  createButtonLabel = 'Add Location',
  createOnly = false,
  disabled = false,
  error,
  excludeIds = [],
  label = 'Select Location',
  locations: providedLocations,
  multiple = false,
  onChange,
  onLocationSelect,
  onLocationsChange,
  placeholder = 'Select location',
  selectedLocationObjects = [],
  value,
}) {
  const { showToast } = useToast();
  const [internalLocations, setInternalLocations] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const locations = providedLocations ?? internalLocations;
  const selectedIds = useMemo(() => toArray(value), [value]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const excludedSet = useMemo(() => new Set(toArray(excludeIds)), [excludeIds]);
  const visibleLocations = useMemo(
    () => locations.filter((location) => !excludedSet.has(getId(location))),
    [excludedSet, locations],
  );
  const selectedLocations = useMemo(() => {
    const selectedById = new Map();

    locations.forEach((location) => {
      const id = getId(location);
      if (id && selectedSet.has(id)) {
        selectedById.set(id, { ...location, _id: id });
      }
    });

    toObjectArray(selectedLocationObjects)
      .map(normalizeLocation)
      .filter(Boolean)
      .forEach((location) => {
        if (selectedSet.has(location._id) && !selectedById.has(location._id)) {
          selectedById.set(location._id, location);
        }
      });

    return Array.from(selectedById.values());
  }, [locations, selectedLocationObjects, selectedSet]);
  const filteredLocations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return visibleLocations;

    return visibleLocations.filter((location) =>
      location.name?.toLowerCase().includes(normalizedQuery),
    );
  }, [query, visibleLocations]);

  const setLocations = useCallback(
    (nextLocations) => {
      if (onLocationsChange) {
        onLocationsChange(nextLocations);
        return;
      }

      setInternalLocations(nextLocations);
    },
    [onLocationsChange],
  );

  useEffect(() => {
    if (providedLocations !== undefined) return undefined;

    let isMounted = true;

    async function loadLocations() {
      setIsLoading(true);
      try {
        const data = await fetchLocations();
        if (!isMounted) return;
        setLocations(data);
      } catch (error) {
        if (!isMounted) return;
        showToast({
          type: 'error',
          title: 'Could not load locations',
          message: getApiError(error),
        });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadLocations();

    return () => {
      isMounted = false;
    };
  }, [onLocationsChange, providedLocations, setLocations, showToast]);

  function selectLocation(location) {
    const locationId = getId(location);
    if (!locationId) return;

    if (multiple) {
      const nextSet = new Set(selectedIds);
      if (nextSet.has(locationId)) nextSet.delete(locationId);
      else nextSet.add(locationId);
      onChange?.(Array.from(nextSet), location);
    } else {
      onChange?.(locationId, location);
      setIsPickerOpen(false);
    }

    onLocationSelect?.(location);
  }

  function handleCreated(location) {
    const nextLocations = mergeLocation(locations, location);
    setLocations(nextLocations);

    if (multiple) {
      const nextSet = new Set(selectedIds);
      nextSet.add(getId(location));
      onChange?.(Array.from(nextSet), location);
    } else {
      onChange?.(getId(location), location);
      setIsPickerOpen(false);
    }

    onLocationSelect?.(location);
  }

  if (createOnly) {
    return (
      <div className={`grid gap-3 ${className}`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-black/70">
            {label}
          </span>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            disabled={disabled}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-obsidian px-4 text-xs font-black uppercase tracking-[0.14em] text-pearl transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={15} />
            {createButtonLabel}
          </button>
        </div>

        <SelectedLocationPreview
          multiple={multiple}
          onRemove={selectLocation}
          placeholder={placeholder}
          selectedLocations={selectedLocations}
        />

        {error && <p className="text-sm text-red-600">{error.message}</p>}

        <CreateLocationModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={handleCreated}
        />
      </div>
    );
  }

  return (
    <div className={`grid gap-2 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-black/70">
          {label}
        </span>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-xs font-black uppercase tracking-[0.14em] text-obsidian transition hover:border-cinnamon hover:text-cinnamon"
        >
          <Plus size={15} />
          Add New Location
        </button>
      </div>

      <div className="relative">
        <button
          type="button"
          disabled={disabled || isLoading}
          onClick={() => setIsPickerOpen((current) => !current)}
          className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border bg-white px-4 text-left text-sm font-bold outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
            error
              ? 'border-red-300'
              : 'border-black/10 hover:border-cinnamon focus:border-obsidian'
          }`}
        >
          <span className="min-w-0 flex-1 truncate text-black/70">
            {isLoading
              ? 'Loading locations...'
              : multiple
                ? selectedLocations.length
                  ? `${selectedLocations.length} location${selectedLocations.length === 1 ? '' : 's'} selected`
                  : placeholder
                : selectedLocations[0]?.name || placeholder}
          </span>
          {isLoading ? (
            <Loader2 className="animate-spin text-black/40" size={17} />
          ) : (
            <ChevronsUpDown className="text-black/40" size={17} />
          )}
        </button>

        <AnimatePresence>
          {isPickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.16)]"
            >
              <div className="flex items-center gap-2 border-b border-black/10 px-3 py-2">
                <Search size={16} className="text-black/38" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search saved locations"
                  className="min-h-10 flex-1 bg-transparent text-sm font-semibold text-obsidian outline-none placeholder:text-black/50"
                />
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {!isLoading && visibleLocations.length === 0 && (
                  <EmptyLocations onCreate={() => setIsCreateOpen(true)} />
                )}

                {!isLoading &&
                  visibleLocations.length > 0 &&
                  filteredLocations.length === 0 && (
                    <p className="px-3 py-6 text-center text-sm font-semibold text-black/50">
                      No matching locations found.
                    </p>
                  )}

                {filteredLocations.map((location) => {
                  const locationId = getId(location);
                  const isSelected = selectedSet.has(locationId);

                  return (
                    <button
                      key={locationId}
                      type="button"
                      onClick={() => selectLocation(location)}
                      className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition ${
                        isSelected
                          ? 'bg-obsidian text-pearl'
                          : 'hover:bg-black/[0.04]'
                      }`}
                    >
                      {location.image ? (
                        <img
                          src={location.image}
                          alt={location.name}
                          className="h-12 w-14 rounded-md object-cover"
                        />
                      ) : (
                        <span className="grid h-12 w-14 place-items-center rounded-md bg-pearl text-black/30">
                          <ImagePlus size={17} />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black">
                          {location.name}
                        </span>
                        <span
                          className={`mt-0.5 line-clamp-1 block text-xs ${
                            isSelected ? 'text-white/60' : 'text-black/50'
                          }`}
                        >
                          {location.description || 'Reusable Sri Lanka location'}
                        </span>
                      </span>
                      {isSelected ? <Check size={17} /> : <MapPin size={16} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {multiple && selectedLocations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLocations.map((location) => (
            <button
              key={location._id}
              type="button"
              onClick={() => selectLocation(location)}
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-black/10 bg-white py-1 pl-1 pr-3 text-xs font-black text-black/70 transition hover:border-red-300 hover:text-red-600"
            >
              {location.image && (
                <img
                  src={location.image}
                  alt=""
                  className="h-7 w-8 rounded-full object-cover"
                />
              )}
              <span className="truncate">{location.name}</span>
              <X size={13} />
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <CreateLocationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}

function SelectedLocationPreview({
  multiple,
  onRemove,
  placeholder,
  selectedLocations,
}) {
  if (!selectedLocations.length) {
    return (
      <div className="rounded-lg border border-dashed border-black/20 bg-pearl px-4 py-5 text-sm font-bold text-black/50">
        {placeholder}
      </div>
    );
  }

  if (!multiple) {
    const location = selectedLocations[0];

    return (
      <div className="flex items-center gap-3 rounded-lg border border-black/10 bg-white p-3">
        {location.image ? (
          <img
            src={location.image}
            alt={location.name}
            className="h-14 w-16 rounded-md object-cover"
          />
        ) : (
          <span className="grid h-14 w-16 place-items-center rounded-md bg-pearl text-black/30">
            <ImagePlus size={18} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-black text-obsidian">
            {location.name}
          </span>
          <span className="mt-1 line-clamp-2 block text-xs leading-5 text-black/60">
            {location.description || 'New location attached from Location Management.'}
          </span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {selectedLocations.map((location) => (
        <button
          key={location._id}
          type="button"
          onClick={() => onRemove(location)}
          className="inline-flex max-w-full items-center gap-2 rounded-full border border-black/10 bg-white py-1 pl-1 pr-3 text-xs font-black text-black/70 transition hover:border-red-300 hover:text-red-600"
        >
          {location.image && (
            <img
              src={location.image}
              alt=""
              className="h-7 w-8 rounded-full object-cover"
            />
          )}
          <span className="truncate">{location.name}</span>
          <X size={13} />
        </button>
      ))}
    </div>
  );
}

function EmptyLocations({ onCreate }) {
  return (
    <div className="px-3 py-6 text-center">
      <p className="text-sm font-semibold text-black/50">
        No locations have been created yet.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-obsidian px-4 text-xs font-black uppercase tracking-[0.14em] text-pearl"
      >
        <Plus size={15} />
        Create Location
      </button>
    </div>
  );
}
