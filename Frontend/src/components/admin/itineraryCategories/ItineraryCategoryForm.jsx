import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ImagePlus, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import TextArea from '../form/TextArea';
import TextInput from '../form/TextInput';

const emptyValues = {
  description: '',
  slug: '',
  thumbnailImage: '',
  title: '',
};

function getDefaultValues(initialValues) {
  return {
    description: initialValues?.description || '',
    slug: initialValues?.slug || '',
    thumbnailImage: null,
    title: initialValues?.title || '',
  };
}

export default function ItineraryCategoryForm({
  initialValues = emptyValues,
  mode = 'create',
  onSubmit,
}) {
  const isEdit = mode === 'edit';
  const [previewUrl, setPreviewUrl] = useState(
    initialValues?.thumbnailImage || '',
  );
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm({
    defaultValues: getDefaultValues(initialValues),
  });
  const selectedFile = watch('thumbnailImage')?.[0];

  useEffect(() => {
    reset(getDefaultValues(initialValues));
    setPreviewUrl(initialValues?.thumbnailImage || '');
  }, [initialValues, reset]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(initialValues?.thumbnailImage || '');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [initialValues?.thumbnailImage, selectedFile]);

  async function handleFormSubmit(values) {
    const formData = new FormData();

    formData.append('title', values.title);
    formData.append('description', values.description);

    if (values.slug.trim()) {
      formData.append('slug', values.slug);
    }

    if (values.thumbnailImage?.[0]) {
      formData.append('thumbnailImage', values.thumbnailImage[0]);
    }

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
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="grid gap-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <TextInput
              error={errors.title}
              label="Title"
              placeholder="Travel theme title"
              register={register('title', {
                required: 'Title is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
              })}
            />
            <TextInput
              error={errors.slug}
              label="Slug"
              placeholder="theme-slug"
              register={register('slug', {
                pattern: {
                  value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                  message: 'Use lowercase words separated by hyphens',
                },
              })}
            />
          </div>

          <TextArea
            error={errors.description}
            label="Description"
            placeholder="Describe the travel mood, audience, and premium Sri Lankan journey style for this theme."
            register={register('description', {
              required: 'Description is required',
              minLength: { value: 10, message: 'Minimum 10 characters' },
            })}
            rows={9}
          />
        </div>

        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-black/48">
            Thumbnail image {isEdit ? '(optional)' : ''}
          </span>
          <span className="mt-2 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-black/18 bg-pearl px-4 text-sm font-black uppercase tracking-[0.14em] text-black/54 transition hover:border-cinnamon hover:text-cinnamon">
            <ImagePlus size={18} />
            Upload thumbnail
          </span>
          <input
            type="file"
            accept="image/*"
            {...register('thumbnailImage', {
              validate: (files) =>
                isEdit || files?.length > 0 || 'Thumbnail image is required',
            })}
            className="sr-only"
          />
          {errors.thumbnailImage && (
            <p className="mt-2 text-sm text-red-600">
              {errors.thumbnailImage.message}
            </p>
          )}

          <div className="mt-4 overflow-hidden rounded-lg border border-black/10 bg-black/[0.03]">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Category thumbnail preview"
                className="h-80 w-full object-cover xl:h-96"
              />
            ) : (
              <div className="grid h-80 place-items-center px-8 text-center xl:h-96">
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
          {isEdit ? 'Save changes' : 'Create category'}
        </button>
      </div>
    </motion.form>
  );
}
