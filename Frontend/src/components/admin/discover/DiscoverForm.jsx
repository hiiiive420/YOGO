import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ImagePlus, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import GalleryUpload from '../form/GalleryUpload';
import TextArea from '../form/TextArea';
import TextInput from '../form/TextInput';
import LocationSelectWithCreate from '../locations/LocationSelectWithCreate';
import RichTextEditor from './RichTextEditor';

const emptyValues = {
  description: '',
  gallery: [],
  heroImage: '',
  highlights: [],
  location: '',
  slug: '',
  title: '',
  travelTips: [],
};

function joinLines(items) {
  return (items || []).join('\n');
}

function getLocationId(location) {
  return typeof location === 'string' ? location : location?._id || '';
}

function getDefaultValues(initialValues) {
  return {
    description: initialValues?.description || '',
    gallery: null,
    heroImage: null,
    highlights: joinLines(initialValues?.highlights),
    location: getLocationId(initialValues?.location),
    slug: initialValues?.slug || '',
    title: initialValues?.title || '',
    travelTips: joinLines(initialValues?.travelTips),
  };
}

export default function DiscoverForm({
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
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: getDefaultValues(initialValues),
  });
  const selectedHero = watch('heroImage')?.[0];
  const selectedLocationId = watch('location');

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

    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('location', values.location);
    formData.append('highlights', values.highlights);
    formData.append('travelTips', values.travelTips);
    formData.append('isPublished', 'true');

    if (values.slug.trim()) {
      formData.append('slug', values.slug);
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
              placeholder="Ancient Kingdoms of Sigiriya"
              register={register('title', {
                required: 'Title is required',
                minLength: { value: 3, message: 'Minimum 3 characters' },
              })}
            />
            <TextInput
              error={errors.slug}
              label="Slug"
              placeholder="ancient-kingdoms-of-sigiriya"
              register={register('slug', {
                pattern: {
                  value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                  message: 'Use lowercase words separated by hyphens',
                },
              })}
            />
          </div>

          <div>
            <input
              type="hidden"
              {...register('location', {
                required: 'Related location is required',
              })}
            />
            <LocationSelectWithCreate
              error={errors.location}
              label="Related location"
              onChange={(locationId) =>
                setValue('location', locationId, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                })
              }
              placeholder="Select related location"
              value={selectedLocationId}
            />
          </div>

          <Controller
            control={control}
            name="description"
            rules={{
              required: 'Description is required',
              minLength: { value: 40, message: 'Minimum 40 characters' },
            }}
            render={({ field }) => (
              <RichTextEditor
                error={errors.description}
                label="Description"
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />

          <div className="grid gap-5 lg:grid-cols-2">
            <TextArea
              error={errors.highlights}
              label="Highlights"
              placeholder="Sunrise climb&#10;Private guide experience&#10;Cultural photography moments"
              register={register('highlights', {
                required: 'Add at least one highlight',
              })}
              rows={7}
            />
            <TextArea
              error={errors.travelTips}
              label="Travel tips"
              placeholder="Best visited early morning&#10;Wear comfortable walking shoes&#10;Carry water and sun protection"
              register={register('travelTips', {
                required: 'Add at least one travel tip',
              })}
              rows={7}
            />
          </div>
        </div>

        <div className="grid gap-5">
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
          {isEdit ? 'Save changes' : 'Create discover place'}
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
              <ImagePlus className="mx-auto text-black/24" size={38} />
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
