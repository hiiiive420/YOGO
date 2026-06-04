import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ImagePlus, Loader2, MapPin, Save, Search, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCoordinate } from '../../../utils/googleMapsCoordinates';
import { isCoordinateInSriLanka } from '../../../utils/sriLankaMap';
import GalleryUpload from '../form/GalleryUpload';
import TextArea from '../form/TextArea';
import TextInput from '../form/TextInput';
import LocationMapPicker from './LocationMapPicker';

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
const SRI_LANKA_VIEWBOX = '79.5,10.0,82.1,5.8';
const SEARCH_DEBOUNCE_MS = 450;

const emptyValues = {
  description: '',
  gallery: [],
  image: null,
  isTopLocation: false,
  latitude: '',
  longitude: '',
  name: '',
};

function getDefaultValues(initialValues) {
  return {
    description: initialValues?.description ?? '',
    image: null,
    isTopLocation: Boolean(initialValues?.isTopLocation),
    latitude: initialValues?.latitude ?? '',
    longitude: initialValues?.longitude ?? '',
    name: initialValues?.name ?? '',
  };
}

function isValidCoordinate(latitude, longitude) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    isCoordinateInSriLanka(latitude, longitude)
  );
}

function getSearchResultName(result) {
  return (
    result.name ||
    result.display_name?.split(',')[0]?.trim() ||
    result.address?.village ||
    result.address?.town ||
    result.address?.city ||
    'Sri Lanka location'
  );
}

function normalizeSearchResult(result) {
  const latitude = Number(result.lat);
  const longitude = Number(result.lon);

  if (!isValidCoordinate(latitude, longitude)) return null;

  return {
    displayName: result.display_name || getSearchResultName(result),
    latitude,
    longitude,
    name: getSearchResultName(result),
    type: result.type || result.class || 'place',
  };
}

function buildSearchUrl(query) {
  const params = new URLSearchParams({
    addressdetails: '1',
    bounded: '1',
    countrycodes: 'lk',
    dedupe: '1',
    format: 'jsonv2',
    limit: '6',
    q: query,
    viewbox: SRI_LANKA_VIEWBOX,
  });

  return `${NOMINATIM_SEARCH_URL}?${params.toString()}`;
}

function getInitialPinStatus(initialValues) {
  const latitude = Number(initialValues?.latitude);
  const longitude = Number(initialValues?.longitude);

  if (!isValidCoordinate(latitude, longitude)) {
    return {
      message: 'Search for a Sri Lankan location or click the map to place a pin.',
      type: 'idle',
    };
  }

  return {
    message: 'Existing pin loaded. Drag the marker to adjust it.',
    type: 'success',
  };
}

export default function LocationForm({
  initialValues = emptyValues,
  mode = 'create',
  onSubmit,
}) {
  const isEdit = mode === 'edit';
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState(
    initialValues?.gallery || [],
  );
  const [hasSelectedSearchResult, setHasSelectedSearchResult] = useState(false);
  const [pinStatus, setPinStatus] = useState(getInitialPinStatus(initialValues));
  const [previewUrl, setPreviewUrl] = useState(initialValues?.image || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchStatus, setSearchStatus] = useState('idle');
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: getDefaultValues(initialValues),
  });
  const selectedFile = watch('image')?.[0];
  const latitudeValue = watch('latitude');
  const longitudeValue = watch('longitude');
  const coordinateError =
    errors.latitude?.message || errors.longitude?.message || '';
  const markerPosition = useMemo(() => {
    if (latitudeValue === '' || longitudeValue === '') return null;

    const latitude = Number(latitudeValue);
    const longitude = Number(longitudeValue);

    if (!isValidCoordinate(latitude, longitude)) return null;

    return [latitude, longitude];
  }, [latitudeValue, longitudeValue]);

  const applyCoordinates = useCallback(
    (coordinates) => {
      if (!coordinates) return false;

      const latitude = Number(coordinates.latitude ?? coordinates.lat);
      const longitude = Number(coordinates.longitude ?? coordinates.lng);

      if (!isValidCoordinate(latitude, longitude)) return false;

      setValue('latitude', formatCoordinate(latitude), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue('longitude', formatCoordinate(longitude), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      return true;
    },
    [setValue],
  );

  useEffect(() => {
    reset(getDefaultValues(initialValues));
    setGalleryFiles([]);
    setGalleryPreviews(initialValues?.gallery || []);
    setHasSelectedSearchResult(false);
    setPinStatus(getInitialPinStatus(initialValues));
    setPreviewUrl(initialValues?.image || '');
    setSearchQuery('');
    setSearchResults([]);
    setSearchStatus('idle');
  }, [initialValues, reset]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(initialValues?.image || '');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [initialValues?.image, selectedFile]);

  useEffect(() => {
    const query = searchQuery.trim();

    if (hasSelectedSearchResult) return undefined;

    if (query.length < 2) {
      setSearchResults([]);
      setSearchStatus('idle');
      return undefined;
    }

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setSearchStatus('loading');

      try {
        const response = await fetch(buildSearchUrl(query), {
          headers: { Accept: 'application/json' },
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error('Location search is unavailable right now.');
        }

        const data = await response.json();
        const nextResults = (Array.isArray(data) ? data : [])
          .map(normalizeSearchResult)
          .filter(Boolean);

        setSearchResults(nextResults);
        setSearchStatus(nextResults.length ? 'success' : 'empty');
      } catch (error) {
        if (error.name === 'AbortError') return;

        setSearchResults([]);
        setSearchStatus('error');
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      abortController.abort();
      window.clearTimeout(timeoutId);
    };
  }, [hasSelectedSearchResult, searchQuery]);

  function handleSearchInputChange(event) {
    setHasSelectedSearchResult(false);
    setSearchQuery(event.target.value);
  }

  function handleSearchResultSelect(result) {
    setHasSelectedSearchResult(true);
    setSearchQuery(result.name);
    setSearchResults([]);
    setSearchStatus('selected');
    setValue('name', result.name, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    if (applyCoordinates(result)) {
      setPinStatus({
        message: 'Pin placed from search. Verify it on the map or drag to adjust.',
        type: 'success',
      });
      return;
    }

    setPinStatus({
      message: 'Selected location is outside Sri Lanka. Try another result.',
      type: 'error',
    });
  }

  const handleMapPositionChange = useCallback(
    (latlng) => {
      if (applyCoordinates(latlng)) {
        setPinStatus({
          message: 'Pin selected. Drag the marker to fine tune the exact point.',
          type: 'success',
        });
        return;
      }

      setPinStatus({
        message: 'Please choose a point inside Sri Lanka.',
        type: 'error',
      });
    },
    [applyCoordinates],
  );

  async function handleFormSubmit(values) {
    const formData = new FormData();

    formData.append('name', values.name);
    formData.append('latitude', values.latitude);
    formData.append('longitude', values.longitude);
    formData.append('description', values.description);
    formData.append('isTopLocation', values.isTopLocation ? 'true' : 'false');
    formData.append('existingGallery', JSON.stringify(galleryPreviews));

    if (values.image?.[0]) {
      formData.append('image', values.image[0]);
    }

    galleryFiles.forEach((file) => {
      formData.append('gallery', file);
    });

    await onSubmit(formData);
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onSubmit={handleSubmit(handleFormSubmit)}
      className="grid gap-6 rounded-lg border border-black/10 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-7"
    >
      <div className="border-b border-black/10 pb-5">
        <p className="font-display text-3xl font-semibold text-obsidian">
          Location Details
        </p>
        <p className="mt-2 text-sm leading-6 text-black/70">
          Search, select, or pin a Sri Lankan location. Coordinates are saved
          internally and never need to be typed manually.
        </p>
      </div>

      <input
        type="hidden"
        {...register('latitude', {
          required: 'Search or click the Sri Lanka map to choose a location',
          validate: (value) =>
            !longitudeValue ||
            isCoordinateInSriLanka(value, longitudeValue) ||
            'Location pin must be inside Sri Lanka',
        })}
      />
      <input
        type="hidden"
        {...register('longitude', {
          required: 'Search or click the Sri Lanka map to choose a location',
          validate: (value) =>
            !latitudeValue ||
            isCoordinateInSriLanka(latitudeValue, value) ||
            'Location pin must be inside Sri Lanka',
        })}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="grid gap-5">
          <TextInput
            error={errors.name}
            label="Location Name"
            placeholder="Sigiriya"
            register={register('name', { required: 'Name is required' })}
          />

          <div className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-black/70">
              Location Search
            </span>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/50"
                size={18}
              />
              <input
                type="search"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search Sigiriya, Kandy, Galle, Ella..."
                className="min-h-12 w-full rounded-lg border border-black/10 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-obsidian outline-none transition placeholder:text-black/50 focus:border-obsidian"
              />
            </div>

            {searchStatus === 'loading' && (
              <p className="flex items-center gap-2 text-sm font-bold text-black/70">
                <Loader2 className="animate-spin" size={15} />
                Searching Sri Lanka locations
              </p>
            )}

            {searchStatus === 'empty' && (
              <p className="text-sm font-bold text-black/70">
                No Sri Lanka search result found. Click the map to place the pin
                manually.
              </p>
            )}

            {searchStatus === 'error' && (
              <p className="text-sm font-bold text-red-600">
                Search is unavailable. You can still click the map to place the
                pin.
              </p>
            )}

            {searchStatus === 'selected' && (
              <p className="text-sm font-bold text-black/70">
                Search result selected. Verify the pin on the map below.
              </p>
            )}

            {searchResults.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
                {searchResults.map((result) => (
                  <button
                    key={`${result.displayName}-${result.latitude}-${result.longitude}`}
                    type="button"
                    onClick={() => handleSearchResultSelect(result)}
                    className="flex w-full items-start gap-3 border-b border-black/5 px-4 py-3 text-left transition last:border-b-0 hover:bg-pearl"
                  >
                    <MapPin
                      className="mt-0.5 shrink-0 text-obsidian"
                      size={17}
                    />
                    <span>
                      <span className="block text-sm font-black text-obsidian">
                        {result.name}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-xs leading-5 text-black/60">
                        {result.displayName}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-black/70">
                Interactive Map
              </span>
              <span
                className={`text-xs font-black uppercase tracking-[0.14em] ${
                  pinStatus.type === 'error' ? 'text-red-600' : 'text-black/70'
                }`}
              >
                {markerPosition ? 'Pin ready' : 'Pin required'}
              </span>
            </div>
            <LocationMapPicker
              onPositionChange={handleMapPositionChange}
              position={markerPosition}
            />
            <p
              className={`text-sm font-bold ${
                pinStatus.type === 'error' || coordinateError
                  ? 'text-red-600'
                  : 'text-black/70'
              }`}
            >
              {coordinateError || pinStatus.message}
            </p>
          </div>

          <TextArea
            error={errors.description}
            label="Description"
            placeholder="Describe the destination, scenery, travel mood, and why it belongs in a luxury Sri Lanka journey."
            register={register('description', {
              required: 'Description is required',
              minLength: { value: 10, message: 'Minimum 10 characters' },
            })}
            rows={8}
          />

          <label className="inline-flex w-fit cursor-pointer items-center gap-3 rounded-lg border border-black/10 bg-pearl px-4 py-3 text-sm font-bold text-black/70 transition hover:border-cinnamon">
            <input
              type="checkbox"
              {...register('isTopLocation')}
              className="h-4 w-4 accent-obsidian"
            />
            <Star size={17} className="text-cinnamon" />
            Top Location
          </label>
        </div>

        <div className="grid content-start gap-6">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-black/70">
              Hero Image {isEdit ? '(optional)' : ''}
            </span>
            <span className="mt-2 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-black/20 bg-pearl px-4 text-sm font-black uppercase tracking-[0.14em] text-black/70 transition hover:border-cinnamon hover:text-cinnamon">
              <ImagePlus size={18} />
              Upload hero image
            </span>
            <input
              type="file"
              accept="image/*"
              {...register('image', {
                validate: (files) =>
                  isEdit || files?.length > 0 || 'Hero image is required',
              })}
              className="sr-only"
            />
            {errors.image && (
              <p className="mt-2 text-sm text-red-600">{errors.image.message}</p>
            )}
          </label>

          <div className="overflow-hidden rounded-lg border border-black/10 bg-black/[0.03]">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Location preview"
                className="h-72 w-full object-cover xl:h-96"
              />
            ) : (
              <div className="grid h-72 place-items-center px-8 text-center xl:h-96">
                <div>
                  <ImagePlus className="mx-auto text-black/40" size={38} />
                  <p className="mt-4 text-sm font-bold text-black/70">
                    Preview appears after image selection.
                  </p>
                </div>
              </div>
            )}
          </div>

          <GalleryUpload
            existingImages={galleryPreviews}
            files={galleryFiles}
            label="Gallery Images"
            maxCount={12}
            onExistingImagesChange={setGalleryPreviews}
            onFilesChange={setGalleryFiles}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-obsidian px-5 text-sm font-black uppercase tracking-[0.16em] text-pearl transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          {isEdit ? 'Save changes' : 'Create location'}
        </button>
      </div>
    </motion.form>
  );
}
