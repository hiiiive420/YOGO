import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  CalendarDays,
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
import { getApiError } from '../../../api/client';
import { fetchItineraryCategories } from '../../../api/itineraryCategories';
import { useToast } from '../../../context/ToastContext';
import TextArea from '../form/TextArea';
import TextInput from '../form/TextInput';
import LocationSelectWithCreate from '../locations/LocationSelectWithCreate';

const emptyValues = {
  categoryId: '',
  contactCtaText: '',
  days: [],
  faqs: [],
  fullDescription: '',
  heroImage: '',
  isTopActivityPackage: false,
  shortDescription: '',
  slug: '',
  title: '',
  totalDays: '',
};

function getId(value) {
  if (typeof value === 'string') return value;
  if (!value) return '';
  return value._id || value.id || value.value || '';
}

function getCategoryId(category) {
  return getId(category);
}

function getCategorySource(initialValues = {}) {
  return (
    initialValues.categoryId ||
    initialValues.travelTheme ||
    initialValues.theme ||
    initialValues.travelThemeId ||
    initialValues.category ||
    initialValues.itineraryCategory
  );
}

function getCategoryTitle(category) {
  if (typeof category === 'string') return 'Saved Travel Theme';
  return category?.title || category?.name || category?.label || 'Saved Travel Theme';
}

function getCategoryOption(category) {
  const categoryId = getCategoryId(category);

  if (!categoryId) return null;

  if (typeof category !== 'object') {
    return {
      _id: categoryId,
      title: 'Saved Travel Theme',
    };
  }

  return {
    ...category,
    _id: categoryId,
    title: getCategoryTitle(category),
  };
}

function mergeCategoryOption(categories, category) {
  if (!category?._id) return categories;

  const hasCategory = categories.some((item) => getCategoryId(item) === category._id);
  if (hasCategory) return categories;

  return [category, ...categories];
}

function joinLines(items) {
  return Array.isArray(items) ? items.join('\n') : items || '';
}

function splitLines(value) {
  return String(value || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getLocationIds(day) {
  return (day?.locations || day?.selectedLocations || [])
    .map((location) => getId(location))
    .filter(Boolean);
}

function getLocationObjects(day) {
  const rawLocations = [
    ...(day?.locationObjects || []),
    ...(day?.locations || []),
    ...(day?.selectedLocations || []),
  ];
  const byId = new Map();

  rawLocations.forEach((location) => {
    const id = getId(location);
    if (id && typeof location === 'object' && !byId.has(id)) {
      byId.set(id, { ...location, _id: id });
    }
  });

  return Array.from(byId.values());
}

function mergeSelectedLocationObjects(currentObjects = [], nextIds = [], changedLocation) {
  const locationMap = new Map();

  currentObjects.forEach((location) => {
    const id = getId(location);
    if (id) locationMap.set(id, { ...location, _id: id });
  });

  const changedId = getId(changedLocation);
  if (changedId && typeof changedLocation === 'object') {
    locationMap.set(changedId, { ...changedLocation, _id: changedId });
  }

  return nextIds
    .map((id) => locationMap.get(id))
    .filter(Boolean);
}

function createEmptyDay(dayNumber) {
  return {
    activities: '',
    dayNumber,
    description: '',
    heroImage: '',
    heroImageFile: null,
    heroPreview: '',
    instructions: '',
    locations: [],
    locationObjects: [],
    title: '',
    travelTime: '',
  };
}

function dayToState(day = {}, dayNumber) {
  return {
    activities: joinLines(day.activities),
    dayNumber: Number(day.dayNumber || dayNumber),
    description: day.description || day.summary || '',
    heroImage: day.heroImage || '',
    heroImageFile: day.heroImageFile || null,
    heroPreview: day.heroPreview || day.heroImage || '',
    instructions: joinLines(day.instructions),
    locations: getLocationIds(day),
    locationObjects: getLocationObjects(day),
    title: day.title || day.dayTitle || '',
    travelTime: day.travelTime || '',
  };
}

function buildDays(totalDays, sourceDays = []) {
  const byNumber = new Map(
    sourceDays.map((day) => [Number(day.dayNumber), day]).filter(([day]) => day),
  );

  return Array.from({ length: totalDays }, (_, index) => {
    const dayNumber = index + 1;
    const existingDay = byNumber.get(dayNumber);

    return existingDay ? dayToState(existingDay, dayNumber) : createEmptyDay(dayNumber);
  });
}

function getDefaultValues(initialValues = {}) {
  const category = getCategorySource(initialValues);

  return {
    categoryId: getCategoryId(category),
    contactCtaText: initialValues.contactCtaText || 'Contact',
    fullDescription: initialValues.fullDescription || '',
    heroImage: null,
    isTopActivityPackage: Boolean(initialValues.isTopActivityPackage),
    shortDescription: initialValues.shortDescription || initialValues.description || '',
    slug: initialValues.slug || '',
    title: initialValues.title || initialValues.name || '',
    totalDays: initialValues.totalDays || initialValues.days?.length || '',
  };
}

function getInitialDays(initialValues = {}) {
  return (
    initialValues.days ||
    initialValues.dayPlans ||
    initialValues.itineraryDays ||
    initialValues.selectedDays ||
    []
  );
}

function hasDayDraft(day) {
  return Boolean(
    day.title ||
      day.description ||
      day.heroImage ||
      day.heroImageFile ||
      day.travelTime ||
      day.activities ||
      day.instructions ||
      day.locations.length,
  );
}

function normalizeFaqs(faqs = []) {
  return faqs.length ? faqs : [{ question: '', answer: '' }];
}

export default function ItineraryPlanForm({
  initialValues = emptyValues,
  mode = 'create',
  onSubmit,
}) {
  const isEdit = mode === 'edit';
  const { showToast } = useToast();
  const previewUrlsRef = useRef(new Set());
  const [activeDay, setActiveDay] = useState(1);
  const [categories, setCategories] = useState([]);
  const [days, setDays] = useState([]);
  const [faqs, setFaqs] = useState(normalizeFaqs(initialValues?.faqs || []));
  const [heroPreview, setHeroPreview] = useState(initialValues?.heroImage || '');
  const [isLoadingLists, setIsLoadingLists] = useState(true);
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
  const totalDaysValue = watch('totalDays');
  const totalDays = Math.max(
    0,
    Math.min(365, Number.parseInt(totalDaysValue, 10) || 0),
  );
  const activeDayState =
    days.find((day) => day.dayNumber === activeDay) || createEmptyDay(activeDay);

  useEffect(() => {
    let isMounted = true;

    fetchItineraryCategories()
      .then((categoryData) => {
        if (!isMounted) return;
        setCategories(
          mergeCategoryOption(
            categoryData,
            getCategoryOption(getCategorySource(initialValues)),
          ),
        );
      })
      .catch((error) => {
        if (!isMounted) return;
        showToast({
          type: 'error',
          title: 'Could not load form lists',
          message: getApiError(error),
        });
      })
      .finally(() => {
        if (isMounted) setIsLoadingLists(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialValues, showToast]);

  useEffect(() => {
    const initialTotal = Number(initialValues?.totalDays || 0);
    const nextDays = buildDays(initialTotal, getInitialDays(initialValues));

    const nextDefaultValues = getDefaultValues(initialValues);

    reset(nextDefaultValues);
    if (nextDefaultValues.categoryId) {
      setValue('categoryId', nextDefaultValues.categoryId, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
    setCategories((currentCategories) =>
      mergeCategoryOption(
        currentCategories,
        getCategoryOption(getCategorySource(initialValues)),
      ),
    );
    setDays(nextDays);
    setFaqs(normalizeFaqs(initialValues?.faqs || []));
    setHeroPreview(initialValues?.heroImage || '');
    setActiveDay(nextDays[0]?.dayNumber || 1);
  }, [initialValues, reset, setValue]);

  useEffect(() => {
    setDays((currentDays) => {
      if (currentDays.length === totalDays) return currentDays;
      return buildDays(totalDays, currentDays);
    });

    if (totalDays > 0 && activeDay > totalDays) {
      setActiveDay(totalDays);
    }
  }, [activeDay, totalDays]);

  useEffect(() => {
    if (!selectedHero) {
      setHeroPreview(initialValues?.heroImage || '');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedHero);
    setHeroPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [initialValues?.heroImage, selectedHero]);

  useEffect(
    () => () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
    },
    [],
  );

  function updateDay(dayNumber, updates) {
    setDays((currentDays) =>
      currentDays.map((day) =>
        day.dayNumber === dayNumber ? { ...day, ...updates } : day,
      ),
    );
  }

  function handleDayImage(dayNumber, files) {
    const file = files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    previewUrlsRef.current.add(objectUrl);
    updateDay(dayNumber, {
      heroImageFile: file,
      heroPreview: objectUrl,
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
    const packagePayload = {
      categoryId: values.categoryId,
      contactCtaText: values.contactCtaText,
      days: days.map((day) => ({
        activities: splitLines(day.activities),
        dayNumber: day.dayNumber,
        description: day.description,
        heroImage: day.heroImage,
        instructions: splitLines(day.instructions),
        locations: day.locations,
        title: day.title,
        travelTime: day.travelTime,
      })),
      faqs: faqs
        .map((faq) => ({
          answer: faq.answer.trim(),
          question: faq.question.trim(),
        }))
        .filter((faq) => faq.question || faq.answer),
      fullDescription: values.fullDescription,
      isTopActivityPackage: Boolean(values.isTopActivityPackage),
      shortDescription: values.shortDescription,
      slug: values.slug,
      status,
      title: values.title,
      totalDays: values.totalDays,
    };

    formData.append('package', JSON.stringify(packagePayload));

    if (values.heroImage?.[0]) {
      formData.append('heroImage', values.heroImage[0]);
    }

    days.forEach((day) => {
      if (day.heroImageFile) {
        formData.append(`dayHeroImage-${day.dayNumber}`, day.heroImageFile);
      }
    });

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
        <SectionHeader
          icon={CalendarDays}
          kicker="Basic Activity Details"
          title="Activity / Itinerary Package"
        />

        <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          <div className="grid gap-5">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-black/48">
                Travel Theme
              </span>
              <select
                {...register('categoryId', {
                  required: 'Travel Theme is required',
                })}
                disabled={isLoadingLists}
                className="mt-2 min-h-12 w-full rounded-lg border border-black/10 bg-white px-4 text-sm font-semibold text-obsidian outline-none transition focus:border-obsidian disabled:opacity-60"
              >
                <option value="">
                  {isLoadingLists ? 'Loading themes...' : 'Select Travel Theme'}
                </option>
                {categories.map((category) => (
                  <option key={getId(category)} value={getId(category)}>
                    {getCategoryTitle(category)}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.categoryId.message}
                </p>
              )}
            </label>

            <div className="grid gap-5 lg:grid-cols-2">
              <TextInput
                error={errors.title}
                label="Activity Title"
                placeholder="Off Road Adventure"
                register={register('title', {
                  required: 'Activity Title is required',
                  minLength: { value: 2, message: 'Minimum 2 characters' },
                })}
              />
              <TextInput
                error={errors.slug}
                label="Slug"
                placeholder="off-road-adventure"
                register={register('slug', {
                  pattern: {
                    value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    message: 'Use lowercase words separated by hyphens',
                  },
                })}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <TextInput
                error={errors.totalDays}
                label="Total Days"
                min="1"
                max="365"
                placeholder="4"
                register={register('totalDays', {
                  required: 'Total Days is required',
                  min: { value: 1, message: 'Minimum 1 day' },
                  max: { value: 365, message: 'Maximum 365 days' },
                })}
                type="number"
              />
              <TextInput
                label="Contact CTA text"
                placeholder="Plan this journey"
                register={register('contactCtaText')}
              />
            </div>

            <label className="inline-flex w-fit items-center gap-3 rounded-lg border border-black/10 bg-pearl px-4 py-3 text-sm font-bold text-black/62">
              <input
                type="checkbox"
                {...register('isTopActivityPackage')}
                className="h-4 w-4 accent-obsidian"
              />
              Show on Home as Top Activity Package
            </label>

            <TextArea
              error={errors.shortDescription}
              label="Short Description"
              placeholder="A concise public summary for Travel Themes cards."
              register={register('shortDescription', {
                required: 'Short Description is required',
                minLength: { value: 10, message: 'Minimum 10 characters' },
              })}
              rows={5}
            />

            <TextArea
              label="Full Description"
              placeholder="Tell the full story of this Activity / Itinerary Package."
              register={register('fullDescription')}
              rows={9}
            />
          </div>

          <ImageInput
            error={errors.heroImage}
            isRequired={!isEdit}
            label="Hero Image"
            preview={heroPreview}
            register={register('heroImage', {
              validate: (files) =>
                isEdit || files?.length > 0 || 'Hero Image is required',
            })}
          />
        </div>
      </section>

      <section className="grid gap-5 border-t border-black/10 pt-6">
        <SectionHeader
          icon={MapPinned}
          kicker="Day Plans"
          title="Build the route by day"
        />

        {totalDays === 0 && (
          <div className="rounded-lg border border-dashed border-black/16 bg-pearl p-8 text-center">
            <CalendarDays className="mx-auto text-cinnamon" size={34} />
            <p className="mt-4 font-display text-3xl font-semibold">
              Enter Total Days to generate day tabs.
            </p>
            <p className="mt-2 text-sm leading-7 text-black/52">
              Each day is optional at first. Empty days can be completed later.
            </p>
          </div>
        )}

        {totalDays > 0 && (
          <>
            <div className="flex flex-wrap gap-2 rounded-lg border border-black/10 bg-pearl p-3">
              {days.map((day) => {
                const isActive = activeDay === day.dayNumber;
                const status = hasDayDraft(day) ? 'Draft' : '';

                return (
                  <button
                    key={day.dayNumber}
                    type="button"
                    onClick={() => setActiveDay(day.dayNumber)}
                    className={`inline-flex min-h-10 items-center rounded-lg border px-3 text-xs font-black uppercase tracking-[0.12em] transition ${
                      isActive
                        ? 'border-obsidian bg-obsidian text-pearl'
                        : 'border-black/10 bg-white text-black/58 hover:border-cinnamon hover:text-cinnamon'
                    }`}
                  >
                    Day {day.dayNumber}
                    {status && (
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-[0.6rem] ${
                          isActive
                            ? 'bg-white/14 text-white'
                            : 'bg-cinnamon/12 text-cinnamon'
                        }`}
                      >
                        {status}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="grid gap-6 xl:grid-cols-[1fr_22rem]"
              >
                <div className="grid gap-5">
                  <div className="flex flex-wrap items-end justify-between gap-3 border-b border-black/10 pb-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-cinnamon">
                        Day {activeDay} of {totalDays}
                      </p>
                      <h3 className="mt-1 font-display text-3xl font-semibold">
                        Optional day details
                      </h3>
                    </div>
                    <p className="text-sm font-semibold text-black/50">
                      Save now or complete this day later.
                    </p>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    <PlainInput
                      label="Day title"
                      onChange={(value) => updateDay(activeDay, { title: value })}
                      placeholder="Arrival and coastal welcome"
                      value={activeDayState.title}
                    />
                    <PlainInput
                      label="Travel time"
                      onChange={(value) =>
                        updateDay(activeDay, { travelTime: value })
                      }
                      placeholder="2.5 hours private transfer"
                      value={activeDayState.travelTime}
                    />
                  </div>

                  <PlainTextarea
                    label="Description"
                    onChange={(value) =>
                      updateDay(activeDay, { description: value })
                    }
                    placeholder="Describe this day of the journey."
                    rows={6}
                    value={activeDayState.description}
                  />

                  <div className="grid gap-5 lg:grid-cols-2">
                    <PlainTextarea
                      label="Activities"
                      onChange={(value) =>
                        updateDay(activeDay, { activities: value })
                      }
                      placeholder="Airport meet and greet&#10;Sunset beach walk"
                      rows={7}
                      value={activeDayState.activities}
                    />
                    <PlainTextarea
                      label="Instructions"
                      onChange={(value) =>
                        updateDay(activeDay, { instructions: value })
                      }
                      placeholder="Keep passports ready&#10;Pack light layers"
                      rows={7}
                      value={activeDayState.instructions}
                    />
                  </div>
                </div>

                <div className="grid content-start gap-5">
                  <DayImageInput
                    dayNumber={activeDay}
                    onChange={handleDayImage}
                    preview={activeDayState.heroPreview || activeDayState.heroImage}
                  />

                  <LocationSelectWithCreate
                    createButtonLabel="Add Location"
                    createOnly
                    label="Selected locations"
                    multiple
                    onChange={(locationIds, location) =>
                      updateDay(activeDay, {
                        locations: locationIds,
                        locationObjects: mergeSelectedLocationObjects(
                          activeDayState.locationObjects,
                          locationIds,
                          location,
                        ),
                      })
                    }
                    placeholder="No locations attached yet. Click Add Location to create and attach a new location record."
                    selectedLocationObjects={activeDayState.locationObjects}
                    value={activeDayState.locations}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </section>

      <section className="grid gap-5 border-t border-black/10 pt-6">
        <SectionHeader icon={HelpCircle} kicker="FAQ" title="Package questions" />
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
                placeholder="Is this tour suitable for families?"
                value={faq.question}
              />
              <PlainTextarea
                label="Answer"
                onChange={(value) => updateFaq(index, 'answer', value)}
                placeholder="Yes, this package can be customized for families."
                rows={4}
                value={faq.answer}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setFaqs((currentFaqs) => [...currentFaqs, { question: '', answer: '' }])}
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
          onClick={handleSubmit((values) =>
            handleFormSubmit(values, 'published'),
          )}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-obsidian px-5 text-sm font-black uppercase tracking-[0.16em] text-pearl transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          Publish Activity Package
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

function DayImageInput({ dayNumber, onChange, preview }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-black/48">
        Day hero image (optional)
      </span>
      <span className="mt-2 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-black/18 bg-pearl px-4 text-sm font-black uppercase tracking-[0.14em] text-black/54 transition hover:border-cinnamon hover:text-cinnamon">
        <ImagePlus size={18} />
        Upload day image
      </span>
      <input
        type="file"
        accept="image/*"
        onChange={(event) => onChange(dayNumber, event.target.files)}
        className="sr-only"
      />
      <ImagePreview alt={`Day ${dayNumber} preview`} preview={preview} compact />
    </label>
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

function PlainInput({ label, onChange, placeholder, value }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-black/48">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
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
