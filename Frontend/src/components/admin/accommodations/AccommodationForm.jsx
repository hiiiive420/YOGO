import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ImagePlus, Loader2, Save, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import GalleryUpload from '../form/GalleryUpload';
import TextArea from '../form/TextArea';
import TextInput from '../form/TextInput';
import LocationSelectWithCreate from '../locations/LocationSelectWithCreate';

const emptyValues = {
  address: '',
  amenities: [],
  checkInTime: '',
  checkOutTime: '',
  contactNumber: '',
  featuredReviews: [],
  fullDescription: '',
  gallery: [],
  heroImage: '',
  highlights: [],
  location: '',
  nearbyAttractions: [],
  policies: [],
  priceRange: '',
  roomTypes: [],
  shortDescription: '',
  slug: '',
  starRating: '',
  title: '',
  website: '',
  whatsappNumber: '',
};

const roomTypesExample = JSON.stringify(
  [
    {
      name: 'Ocean Pool Villa',
      description: 'Private villa with plunge pool and ocean-facing terrace.',
      priceRange: '$650+',
      maxGuests: 2,
    },
  ],
  null,
  2,
);

const reviewsExample = JSON.stringify(
  [
    {
      guestName: 'Amelia R.',
      rating: 5,
      comment: 'Beautiful service, quiet design, and a memorable coastal stay.',
    },
  ],
  null,
  2,
);

function joinLines(items) {
  return (items || []).join('\n');
}

function getId(value) {
  return typeof value === 'string' ? value : value?._id || '';
}

function getLocationIds(items) {
  return (items || []).map((item) => getId(item)).filter(Boolean);
}

function stringifyJson(value) {
  return value?.length ? JSON.stringify(value, null, 2) : '';
}

function getDefaultValues(initialValues) {
  return {
    address: initialValues?.address || '',
    amenities: joinLines(initialValues?.amenities),
    checkInTime: initialValues?.checkInTime || '',
    checkOutTime: initialValues?.checkOutTime || '',
    contactNumber: initialValues?.contactNumber || '',
    featuredReviews: stringifyJson(initialValues?.featuredReviews),
    fullDescription: initialValues?.fullDescription || '',
    gallery: null,
    heroImage: null,
    highlights: joinLines(initialValues?.highlights),
    location: getId(initialValues?.location),
    nearbyAttractions: getLocationIds(initialValues?.nearbyAttractions),
    policies: joinLines(initialValues?.policies),
    priceRange: initialValues?.priceRange || '',
    roomTypes: stringifyJson(initialValues?.roomTypes),
    shortDescription: initialValues?.shortDescription || '',
    slug: initialValues?.slug || '',
    starRating: initialValues?.starRating || '',
    title: initialValues?.title || '',
    website: initialValues?.website || '',
    whatsappNumber: initialValues?.whatsappNumber || '',
  };
}

function appendIfPresent(formData, key, value) {
  if (typeof value !== 'string') return;
  if (value.trim()) formData.append(key, value);
}

export default function AccommodationForm({
  initialValues = emptyValues,
  mode = 'create',
  onSubmit,
}) {
  const isEdit = mode === 'edit';
  const [galleryPreviews, setGalleryPreviews] = useState(
    initialValues?.gallery || [],
  );
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [heroPreview, setHeroPreview] = useState(initialValues?.heroImage || '');
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch,
  } = useForm({
    defaultValues: getDefaultValues(initialValues),
  });
  const selectedHero = watch('heroImage')?.[0];
  const selectedLocationId = watch('location');
  const selectedNearbyAttractions = watch('nearbyAttractions') || [];

  useEffect(() => {
    reset(getDefaultValues(initialValues));
    setHeroPreview(initialValues?.heroImage || '');
    setGalleryPreviews(initialValues?.gallery || []);
    setGalleryFiles([]);
  }, [initialValues, reset]);

  useEffect(() => {
    if (!selectedHero) {
      setHeroPreview(initialValues?.heroImage || '');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedHero);
    setHeroPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [initialValues?.heroImage, selectedHero]);

  async function handleFormSubmit(values) {
    const formData = new FormData();

    if (values.roomTypes.trim()) {
      try {
        JSON.parse(values.roomTypes);
      } catch {
        setError('roomTypes', { message: 'Room types must be valid JSON' });
        return;
      }
    }

    if (values.featuredReviews.trim()) {
      try {
        JSON.parse(values.featuredReviews);
      } catch {
        setError('featuredReviews', {
          message: 'Featured reviews must be valid JSON',
        });
        return;
      }
    }

    [
      'title',
      'shortDescription',
      'fullDescription',
      'location',
      'address',
      'priceRange',
      'starRating',
    ].forEach((key) => formData.append(key, values[key]));

    [
      'slug',
      'amenities',
      'roomTypes',
      'highlights',
      'contactNumber',
      'whatsappNumber',
      'website',
      'checkInTime',
      'checkOutTime',
      'policies',
      'featuredReviews',
    ].forEach((key) => appendIfPresent(formData, key, values[key]));

    if (values.nearbyAttractions?.length) {
      formData.append(
        'nearbyAttractions',
        JSON.stringify(values.nearbyAttractions),
      );
    }

    if (values.heroImage?.[0]) {
      formData.append('heroImage', values.heroImage[0]);
    }

    formData.append('existingGallery', JSON.stringify(galleryPreviews));

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
      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="grid gap-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <TextInput
              error={errors.title}
              label="Title"
              placeholder="Amanwella Tangalle"
              register={register('title', {
                required: 'Title is required',
                minLength: { value: 3, message: 'Minimum 3 characters' },
              })}
            />
            <TextInput
              error={errors.slug}
              label="Slug"
              placeholder="amanwella-tangalle"
              register={register('slug', {
                pattern: {
                  value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                  message: 'Use lowercase words separated by hyphens',
                },
              })}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <input
                type="hidden"
                {...register('location', { required: 'Location is required' })}
              />
              <LocationSelectWithCreate
                error={errors.location}
                label="Location"
                onChange={(locationId) =>
                  setValue('location', locationId, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
                placeholder="Select accommodation location"
                value={selectedLocationId}
              />
            </div>
            <TextInput
              error={errors.starRating}
              label="Star rating"
              max="5"
              min="1"
              placeholder="5"
              register={register('starRating', {
                required: 'Star rating is required',
                min: { value: 1, message: 'Minimum 1' },
                max: { value: 5, message: 'Maximum 5' },
              })}
              step="0.1"
              type="number"
            />
          </div>

          <TextArea
            error={errors.shortDescription}
            label="Short description"
            placeholder="A refined coastal stay with private villa rhythm, ocean views, and quiet service."
            register={register('shortDescription', {
              required: 'Short description is required',
              minLength: { value: 10, message: 'Minimum 10 characters' },
            })}
            rows={4}
          />

          <TextArea
            error={errors.fullDescription}
            label="Full description"
            placeholder="Describe the stay in an editorial style for luxury travelers."
            register={register('fullDescription', {
              required: 'Full description is required',
              minLength: { value: 40, message: 'Minimum 40 characters' },
            })}
            rows={8}
          />

          <div className="grid gap-5 lg:grid-cols-2">
            <TextInput
              error={errors.address}
              label="Address"
              placeholder="Tangalle, Southern Province"
              register={register('address', {
                required: 'Address is required',
                minLength: { value: 5, message: 'Minimum 5 characters' },
              })}
            />
            <TextInput
              error={errors.priceRange}
              label="Price range"
              placeholder="$650 - $1200 per night"
              register={register('priceRange', {
                required: 'Price range is required',
              })}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <TextInput
              label="Contact number"
              placeholder="+94 77 000 0000"
              register={register('contactNumber')}
            />
            <TextInput
              label="WhatsApp number"
              placeholder="+94770000000"
              register={register('whatsappNumber')}
            />
            <TextInput
              label="Website"
              placeholder="https://example.com"
              register={register('website')}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <TextInput
              label="Check-in time"
              placeholder="2:00 PM"
              register={register('checkInTime')}
            />
            <TextInput
              label="Check-out time"
              placeholder="11:00 AM"
              register={register('checkOutTime')}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <TextArea
              label="Amenities"
              placeholder="Private pool&#10;Spa&#10;Ocean-view restaurant"
              register={register('amenities')}
              rows={6}
            />
            <TextArea
              label="Highlights"
              placeholder="Cliff-edge sunset dining&#10;Butler-supported villas"
              register={register('highlights')}
              rows={6}
            />
          </div>

          <TextArea
            label="Policies"
            placeholder="Children welcome with supervision&#10;Cancellation terms vary by season"
            register={register('policies')}
            rows={5}
          />

          <div className="grid gap-5 lg:grid-cols-2">
            <TextArea
              error={errors.roomTypes}
              label="Room types JSON"
              placeholder={roomTypesExample}
              register={register('roomTypes')}
              rows={10}
            />
            <TextArea
              error={errors.featuredReviews}
              label="Featured reviews JSON"
              placeholder={reviewsExample}
              register={register('featuredReviews')}
              rows={10}
            />
          </div>
        </div>

        <div className="grid gap-5 content-start">
          <ImageInput
            error={errors.heroImage}
            isRequired={!isEdit}
            label="Hero image"
            preview={heroPreview}
            register={register('heroImage', {
              validate: (files) =>
                isEdit || files?.length > 0 || 'Hero image is required',
            })}
          />

          <GalleryUpload
            existingImages={galleryPreviews}
            files={galleryFiles}
            maxCount={20}
            onExistingImagesChange={setGalleryPreviews}
            onFilesChange={setGalleryFiles}
          />

          <div>
            <input type="hidden" {...register('nearbyAttractions')} />
            <LocationSelectWithCreate
              label="Nearby attractions"
              multiple
              onChange={(locationIds) =>
                setValue('nearbyAttractions', locationIds, {
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
              placeholder="Select nearby attractions"
              value={selectedNearbyAttractions}
            />
          </div>
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
          {isEdit ? 'Save changes' : 'Create accommodation'}
        </button>
      </div>
    </motion.form>
  );
}

function ImageInput({ error, isRequired, label, preview, register }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-black/48">
        {label} {isRequired ? '' : '(optional)'}
      </span>
      <span className="mt-2 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-black/18 bg-pearl px-4 text-sm font-black uppercase tracking-[0.14em] text-black/54 transition hover:border-cinnamon hover:text-cinnamon">
        <ImagePlus size={18} />
        Upload image
      </span>
      <input type="file" accept="image/*" {...register} className="sr-only" />
      {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}
      <div className="mt-4 overflow-hidden rounded-lg border border-black/10 bg-black/[0.03]">
        {preview ? (
          <img
            src={preview}
            alt={`${label} preview`}
            className="h-80 w-full object-cover"
          />
        ) : (
          <div className="grid h-80 place-items-center px-8 text-center">
            <div>
              <Star className="mx-auto text-black/24" size={38} />
              <p className="mt-4 text-sm font-bold text-black/46">
                Preview appears after image selection.
              </p>
            </div>
          </div>
        )}
      </div>
    </label>
  );
}
