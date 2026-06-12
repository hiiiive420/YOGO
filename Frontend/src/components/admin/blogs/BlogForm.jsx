import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ImagePlus, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import GalleryUpload from '../form/GalleryUpload';
import TextArea from '../form/TextArea';
import TextInput from '../form/TextInput';
import RichTextEditor from '../discover/RichTextEditor';
import LocationSelectWithCreate from '../locations/LocationSelectWithCreate';

const emptyValues = {
  content: '',
  featuredImage: '',
  gallery: [],
  relatedLocations: [],
  seoDescription: '',
  seoTitle: '',
  slug: '',
  title: '',
};

function getId(value) {
  return typeof value === 'string' ? value : value?._id || '';
}

function getLocationIds(items) {
  return (items || []).map((item) => getId(item)).filter(Boolean);
}

function getDefaultValues(initialValues) {
  return {
    content: initialValues?.content || '',
    featuredImage: null,
    gallery: null,
    relatedLocations: getLocationIds(initialValues?.relatedLocations),
    seoDescription: initialValues?.seoDescription || '',
    seoTitle: initialValues?.seoTitle || '',
    slug: initialValues?.slug || '',
    title: initialValues?.title || '',
  };
}

export default function BlogForm({
  initialValues = emptyValues,
  mode = 'create',
  onSubmit,
}) {
  const isEdit = mode === 'edit';
  const [featuredPreview, setFeaturedPreview] = useState(
    initialValues?.featuredImage || '',
  );
  const [galleryPreviews, setGalleryPreviews] = useState(
    initialValues?.gallery || [],
  );
  const [galleryFiles, setGalleryFiles] = useState([]);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm({
    defaultValues: getDefaultValues(initialValues),
  });
  const selectedFeatured = watch('featuredImage')?.[0];

  useEffect(() => {
    reset(getDefaultValues(initialValues));
    setFeaturedPreview(initialValues?.featuredImage || '');
    setGalleryPreviews(initialValues?.gallery || []);
    setGalleryFiles([]);
  }, [initialValues, reset]);

  useEffect(() => {
    if (!selectedFeatured) {
      setFeaturedPreview(initialValues?.featuredImage || '');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFeatured);
    setFeaturedPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [initialValues?.featuredImage, selectedFeatured]);

  async function handleFormSubmit(values) {
    const formData = new FormData();

    formData.append('title', values.title);
    formData.append('content', values.content);

    if (values.slug.trim()) formData.append('slug', values.slug);
    if (values.seoTitle.trim()) formData.append('seoTitle', values.seoTitle);
    if (values.seoDescription.trim()) {
      formData.append('seoDescription', values.seoDescription);
    }
    formData.append(
      'relatedLocations',
      JSON.stringify(getLocationIds(values.relatedLocations)),
    );
    if (values.featuredImage?.[0]) {
      formData.append('featuredImage', values.featuredImage[0]);
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
              placeholder="A slow guide to Sri Lanka's southern coast"
              register={register('title', {
                required: 'Title is required',
                minLength: { value: 3, message: 'Minimum 3 characters' },
              })}
            />
            <TextInput
              error={errors.slug}
              label="Slug"
              placeholder="slow-guide-southern-coast"
              register={register('slug', {
                pattern: {
                  value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                  message: 'Use lowercase words separated by hyphens',
                },
              })}
            />
          </div>

          <Controller
            control={control}
            name="content"
            rules={{
              required: 'Content is required',
              minLength: { value: 50, message: 'Minimum 50 characters' },
            }}
            render={({ field }) => (
              <RichTextEditor
                error={errors.content}
                label="Content"
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />

          <div className="grid gap-5 lg:grid-cols-2">
            <TextInput
              error={errors.seoTitle}
              label="SEO title"
              placeholder="Luxury Sri Lanka Southern Coast Guide"
              register={register('seoTitle', {
                maxLength: { value: 180, message: 'Maximum 180 characters' },
              })}
            />
            <TextArea
              error={errors.seoDescription}
              label="SEO description"
              placeholder="A premium travel article about Sri Lanka's southern coast."
              register={register('seoDescription', {
                maxLength: { value: 320, message: 'Maximum 320 characters' },
              })}
              rows={4}
            />
          </div>
        </div>

        <div className="grid gap-5 content-start">
          <ImageInput
            error={errors.featuredImage}
            isRequired={!isEdit}
            label="Featured image"
            preview={featuredPreview}
            register={register('featuredImage', {
              validate: (files) =>
                isEdit || files?.length > 0 || 'Featured image is required',
            })}
          />

          <GalleryUpload
            existingImages={galleryPreviews}
            files={galleryFiles}
            maxCount={12}
            onExistingImagesChange={setGalleryPreviews}
            onFilesChange={setGalleryFiles}
          />

          <div>
            <Controller
              control={control}
              name="relatedLocations"
              render={({ field }) => (
                <LocationSelectWithCreate
                  label="Related locations"
                  multiple
                  onChange={(locationIds) => field.onChange(locationIds)}
                  placeholder="Select or create related blog locations"
                  selectedLocationObjects={initialValues?.relatedLocations || []}
                  value={field.value || []}
                />
              )}
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
          {isEdit ? 'Save changes' : 'Create blog'}
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
