import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  HelpCircle,
  ImagePlus,
  Loader2,
  MapPinned,
  Plus,
  Save,
  Send,
  Trash2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import TextArea from '../form/TextArea';
import TextInput from '../form/TextInput';
import LocationSelectWithCreate from '../locations/LocationSelectWithCreate';

const emptyValues = {
  faqs: [],
  fullDescription: '',
  heroImage: '',
  isFeatured: false,
  isTopDayTour: false,
  mainLocation: '',
  places: [],
  shortDescription: '',
  slug: '',
  title: '',
};

function getId(value) {
  if (typeof value === 'string') return value;
  if (!value) return '';
  return value._id || value.id || value.value || '';
}

function getLocationObject(value) {
  const id = getId(value);

  if (!id || typeof value !== 'object') return null;

  return {
    ...value,
    _id: id,
  };
}

function createEmptyPlace(index = 0) {
  return {
    description: '',
    image: '',
    imagePreview: '',
    latitude: '',
    longitude: '',
    name: '',
    sortOrder: index + 1,
    sourceLocationId: '',
  };
}

function placeToState(place = {}, index = 0) {
  const sourceLocation =
    getLocationObject(place.sourceLocationId) ||
    place.location ||
    place.sourceLocation ||
    {};

  return {
    _id: place._id,
    description: place.description || sourceLocation.description || '',
    image: place.image || sourceLocation.image || '',
    imagePreview: place.image || sourceLocation.image || '',
    latitude: place.latitude ?? sourceLocation.latitude ?? '',
    longitude: place.longitude ?? sourceLocation.longitude ?? '',
    name: place.name || place.placeName || sourceLocation.name || '',
    sortOrder: place.sortOrder || index + 1,
    sourceLocationId: getId(place.sourceLocationId || sourceLocation),
  };
}

function getDefaultValues(initialValues = {}) {
  return {
    fullDescription: initialValues.fullDescription || '',
    heroImage: null,
    isFeatured: Boolean(initialValues.isFeatured),
    isTopDayTour: Boolean(initialValues.isTopDayTour),
    mainLocation: getId(initialValues.mainLocation || initialValues.location),
    shortDescription: initialValues.shortDescription || initialValues.description || '',
    slug: initialValues.slug || '',
    title: initialValues.title || initialValues.name || '',
  };
}

function normalizeFaqs(faqs = []) {
  return faqs.length ? faqs : [{ question: '', answer: '' }];
}

function getPlacePreviewLocation(place) {
  if (!place?.name) return null;

  return {
    _id: place.sourceLocationId || place._id || place.name,
    description: place.description,
    image: place.imagePreview || place.image,
    name: place.name,
  };
}

export default function DayTourForm({
  initialValues = emptyValues,
  onSubmit,
}) {
  const [activePlaceIndex, setActivePlaceIndex] = useState(0);
  const [faqs, setFaqs] = useState(normalizeFaqs(initialValues?.faqs || []));
  const [heroPreview, setHeroPreview] = useState(initialValues?.heroImage || '');
  const [mainLocationPreview, setMainLocationPreview] = useState(
    getLocationObject(initialValues?.mainLocation || initialValues?.location),
  );
  const [places, setPlaces] = useState(
    initialValues?.places?.length
      ? initialValues.places.map(placeToState)
      : [createEmptyPlace()],
  );
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
  const selectedHero = watch('heroImage')?.[0];
  const mainLocationValue = watch('mainLocation');
  const activePlace = places[activePlaceIndex] || createEmptyPlace(activePlaceIndex);

  useEffect(() => {
    reset(getDefaultValues(initialValues));
    setHeroPreview(initialValues?.heroImage || '');
    setMainLocationPreview(
      getLocationObject(initialValues?.mainLocation || initialValues?.location),
    );
    setPlaces(
      initialValues?.places?.length
        ? initialValues.places.map(placeToState)
        : [createEmptyPlace()],
    );
    setFaqs(normalizeFaqs(initialValues?.faqs || []));
    setActivePlaceIndex(0);
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

  const updatePlace = useCallback((index, updates) => {
    setPlaces((currentPlaces) =>
      currentPlaces.map((place, placeIndex) =>
        placeIndex === index ? { ...place, ...updates } : place,
      ),
    );
  }, []);

  function addPlace() {
    setPlaces((currentPlaces) => {
      const nextPlaces = [...currentPlaces, createEmptyPlace(currentPlaces.length)];
      setActivePlaceIndex(nextPlaces.length - 1);
      return nextPlaces;
    });
  }

  function removePlace(index) {
    setPlaces((currentPlaces) => {
      const nextPlaces =
        currentPlaces.length === 1
          ? [createEmptyPlace()]
          : currentPlaces.filter((_, placeIndex) => placeIndex !== index);

      setActivePlaceIndex(Math.max(0, Math.min(index, nextPlaces.length - 1)));
      return nextPlaces;
    });
  }

  function applyLocationToActivePlace(location) {
    if (!location) return;

    updatePlace(activePlaceIndex, {
      description: location.description || activePlace.description,
      image: location.image || activePlace.image,
      imagePreview: location.image || activePlace.imagePreview,
      latitude: location.latitude ?? activePlace.latitude,
      longitude: location.longitude ?? activePlace.longitude,
      name: location.name || activePlace.name,
      sourceLocation: location,
      sourceLocationId: location._id || activePlace.sourceLocationId,
    });
  }

  function updateFaq(index, field, value) {
    setFaqs((currentFaqs) =>
      currentFaqs.map((faq, faqIndex) =>
        faqIndex === index ? { ...faq, [field]: value } : faq,
      ),
    );
  }

  function removeFaq(index) {
    setFaqs((currentFaqs) =>
      currentFaqs.length === 1
        ? [{ question: '', answer: '' }]
        : currentFaqs.filter((_, faqIndex) => faqIndex !== index),
    );
  }

  async function handleFormSubmit(values, status) {
    const formData = new FormData();
    const payload = {
      faqs: faqs
        .map((faq) => ({
          answer: faq.answer.trim(),
          question: faq.question.trim(),
        }))
        .filter((faq) => faq.question || faq.answer),
      fullDescription: values.fullDescription,
      isFeatured: values.isFeatured,
      isTopDayTour: Boolean(values.isTopDayTour),
      mainLocation: values.mainLocation,
      places: places
        .map((place, index) => ({
          _id: place._id,
          description: place.description,
          image: place.image,
          latitude: place.latitude,
          longitude: place.longitude,
          name: place.name,
          sortOrder: place.sortOrder || index + 1,
          sourceLocationId: place.sourceLocationId || undefined,
        }))
        .filter(
          (place) =>
            place.name ||
            place.description ||
            place.image ||
            place.latitude ||
            place.longitude,
        ),
      shortDescription: values.shortDescription,
      slug: values.slug,
      status,
      title: values.title,
    };

    formData.append('dayTour', JSON.stringify(payload));

    if (values.heroImage?.[0]) {
      formData.append('heroImage', values.heroImage[0]);
    }

    await onSubmit(formData, status);
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="grid gap-6 rounded-lg border border-black/10 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-7"
    >
      <section className="grid gap-6">
        <SectionHeader icon={MapPinned} kicker="Day Tours" title="Tour details" />

        <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          <div className="grid gap-5">
            <div>
              <input
                type="hidden"
                {...register('mainLocation', {
                  required: 'Main location is required',
                })}
              />
              <LocationSelectWithCreate
                createButtonLabel="Add Main Location"
                createOnly
                error={errors.mainLocation}
                label="Main Location"
                onChange={(locationId, location) => {
                  if (location) setMainLocationPreview(location);
                  setValue('mainLocation', locationId, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                }}
                placeholder="No main location attached yet. Click Add Main Location to create it in Location Management."
                selectedLocationObjects={
                  mainLocationPreview ? [mainLocationPreview] : []
                }
                value={mainLocationValue}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <TextInput
                error={errors.title}
                label="Day Tour Title"
                placeholder="Galle Heritage Day Tour"
                register={register('title', {
                  required: 'Title is required',
                  minLength: { value: 2, message: 'Minimum 2 characters' },
                })}
              />
              <TextInput
                error={errors.slug}
                label="Slug"
                placeholder="galle-heritage-day-tour"
                register={register('slug', {
                  pattern: {
                    value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    message: 'Use lowercase words separated by hyphens',
                  },
                })}
              />
            </div>

            <label className="inline-flex w-fit items-center gap-3 rounded-lg border border-black/10 bg-pearl px-4 py-3 text-sm font-bold text-black/62">
              <input
                type="checkbox"
                {...register('isFeatured')}
                className="h-4 w-4 accent-obsidian"
              />
              Featured Day Tour
            </label>

            <label className="inline-flex w-fit items-center gap-3 rounded-lg border border-black/10 bg-pearl px-4 py-3 text-sm font-bold text-black/62">
              <input
                type="checkbox"
                {...register('isTopDayTour')}
                className="h-4 w-4 accent-obsidian"
              />
              Show on Home as Top Day Tour
            </label>

            <TextArea
              error={errors.shortDescription}
              label="Short Description"
              placeholder="A compact summary for the Day Tours page."
              register={register('shortDescription', {
                required: 'Short description is required',
                minLength: { value: 10, message: 'Minimum 10 characters' },
              })}
              rows={5}
            />
            <TextArea
              label="Full Description"
              placeholder="Describe the rhythm, story, and guest experience of this day tour."
              register={register('fullDescription')}
              rows={8}
            />
          </div>

          <ImageInput
            error={errors.heroImage}
            isRequired={false}
            label="Hero Image"
            preview={heroPreview}
            register={register('heroImage')}
          />
        </div>
      </section>

      <section className="grid gap-5 border-t border-black/10 pt-6">
        <SectionHeader icon={MapPinned} kicker="Places" title="Places inside this location" />

        <div className="flex flex-wrap gap-2 rounded-lg border border-black/10 bg-pearl p-3">
          {places.map((place, index) => (
            <button
              key={`${place._id || 'place'}-${index}`}
              type="button"
              onClick={() => setActivePlaceIndex(index)}
              className={`inline-flex min-h-10 items-center rounded-lg border px-3 text-xs font-black uppercase tracking-[0.12em] transition ${
                activePlaceIndex === index
                  ? 'border-obsidian bg-obsidian text-pearl'
                  : 'border-black/10 bg-white text-black/58 hover:border-cinnamon hover:text-cinnamon'
              }`}
            >
              {place.name || `Place ${index + 1}`}
            </button>
          ))}
          <button
            type="button"
            onClick={addPlace}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-xs font-black uppercase tracking-[0.12em] text-cinnamon"
          >
            <Plus size={15} />
            Add Place
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activePlaceIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="grid gap-6"
          >
            <div className="grid gap-5">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-black/10 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cinnamon">
                    Place {activePlaceIndex + 1}
                  </p>
                  <h3 className="mt-1 font-display text-3xl font-semibold">
                    {activePlace.name || 'New Day Tour Place'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => removePlace(activePlaceIndex)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black uppercase tracking-[0.14em] text-red-600"
                >
                  <Trash2 size={15} />
                  Remove
                </button>
              </div>

              <LocationSelectWithCreate
                createButtonLabel="Add Place Location"
                createOnly
                excludeIds={mainLocationValue ? [mainLocationValue] : []}
                label="Place Location"
                onChange={(_, location) => {
                  if (location) {
                    applyLocationToActivePlace(location);
                  }
                }}
                placeholder="No place location attached yet. Click Add Place Location to create it in Location Management."
                selectedLocationObjects={
                  getPlacePreviewLocation(activePlace)
                    ? [getPlacePreviewLocation(activePlace)]
                    : []
                }
                value={activePlace.sourceLocationId}
              />

              <PlainInput
                label="Sort Order"
                onChange={(value) =>
                  updatePlace(activePlaceIndex, { sortOrder: value })
                }
                placeholder="1"
                value={activePlace.sortOrder}
                type="number"
              />

              <SelectedPlaceSummary place={activePlace} />
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      <section className="grid gap-5 border-t border-black/10 pt-6">
        <SectionHeader icon={HelpCircle} kicker="FAQ" title="Day Tour questions" />
        <div className="grid gap-4">
          {faqs.map((faq, index) => (
            <div
              key={`faq-${index}`}
              className="grid gap-3 rounded-lg border border-black/10 bg-pearl p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-black/48">
                  FAQ {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeFaq(index)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 bg-white text-red-600 transition hover:border-red-300 hover:bg-red-50"
                  aria-label={`Remove FAQ ${index + 1}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <PlainInput
                label="Question"
                onChange={(value) => updateFaq(index, 'question', value)}
                placeholder="Can this day tour be private?"
                value={faq.question}
              />
              <PlainTextarea
                label="Answer"
                onChange={(value) => updateFaq(index, 'answer', value)}
                placeholder="Yes, this day tour can be arranged privately."
                rows={4}
                value={faq.answer}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setFaqs((currentFaqs) => [...currentFaqs, { question: '', answer: '' }])
          }
          className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-black uppercase tracking-[0.16em] text-obsidian transition hover:border-cinnamon hover:text-cinnamon"
        >
          <Plus size={17} />
          Add FAQ
        </button>
      </section>

      <div className="flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit((values) => handleFormSubmit(values, 'draft'))}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-5 text-sm font-black uppercase tracking-[0.16em] text-obsidian transition hover:border-cinnamon hover:text-cinnamon disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Save Draft
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit((values) => handleFormSubmit(values, 'published'))}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-obsidian px-5 text-sm font-black uppercase tracking-[0.16em] text-pearl transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          Publish Day Tour
        </button>
      </div>
    </motion.form>
  );
}

function SectionHeader({ icon: Icon, kicker, title }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-obsidian text-champagne">
        <Icon size={20} />
      </span>
      <span>
        <span className="block text-xs font-black uppercase tracking-[0.18em] text-cinnamon">
          {kicker}
        </span>
        <span className="mt-1 block font-display text-3xl font-semibold">
          {title}
        </span>
      </span>
    </div>
  );
}

function ImagePreview({ alt, compact = false, preview }) {
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-black/10 bg-black/[0.03]">
      {preview ? (
        <img
          src={preview}
          alt={alt}
          className={`${compact ? 'h-64' : 'h-80 xl:h-96'} w-full object-cover`}
        />
      ) : (
        <div className={`grid ${compact ? 'h-64' : 'h-80 xl:h-96'} place-items-center px-8 text-center`}>
          <div>
            <ImagePlus className="mx-auto text-black/24" size={38} />
            <p className="mt-4 text-sm font-bold text-black/46">
              Preview appears after image selection.
            </p>
          </div>
        </div>
      )}
    </div>
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
      <ImagePreview alt={`${label} preview`} preview={preview} />
    </label>
  );
}

function SelectedPlaceSummary({ place }) {
  if (!place?.name) {
    return (
      <div className="rounded-lg border border-dashed border-black/14 bg-pearl p-5 text-sm font-bold leading-6 text-black/50">
        Create a place location from the button above. The location name,
        description, image, and map coordinates will be saved in Location
        Management, then copied into this Day Tour place.
      </div>
    );
  }

  return (
    <div className="grid gap-4 rounded-lg border border-black/10 bg-white p-4 sm:grid-cols-[10rem_1fr]">
      {place.imagePreview || place.image ? (
        <img
          src={place.imagePreview || place.image}
          alt={place.name}
          className="h-40 w-full rounded-md object-cover sm:h-full"
        />
      ) : (
        <div className="grid h-40 place-items-center rounded-md bg-pearl text-black/28">
          <ImagePlus size={28} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cinnamon">
          Attached Location
        </p>
        <h4 className="mt-2 font-display text-3xl font-semibold text-obsidian">
          {place.name}
        </h4>
        {place.description && (
          <p className="mt-3 text-sm font-semibold leading-7 text-black/56">
            {place.description}
          </p>
        )}
      </div>
    </div>
  );
}

function PlainInput({ label, onChange, placeholder, type = 'text', value }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-black/48">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        step={type === 'number' ? 'any' : undefined}
        type={type}
        className="mt-2 min-h-12 w-full rounded-lg border border-black/10 bg-white px-4 text-sm font-semibold text-obsidian outline-none transition placeholder:text-black/34 focus:border-obsidian"
      />
    </label>
  );
}

function PlainTextarea({ label, onChange, placeholder, rows = 5, value }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-black/48">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="mt-2 w-full resize-y rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-semibold leading-7 text-obsidian outline-none transition placeholder:text-black/34 focus:border-obsidian"
      />
    </label>
  );
}
