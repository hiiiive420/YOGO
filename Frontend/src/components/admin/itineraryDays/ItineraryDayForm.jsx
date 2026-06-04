import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  CalendarDays,
  ImagePlus,
  Loader2,
  Save,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getApiError } from '../../../api/client';
import {
  createItineraryDay,
  fetchItineraryDays,
  updateItineraryDay,
} from '../../../api/itineraryDays';
import { fetchItineraryPlans } from '../../../api/itineraryPlans';
import { useToast } from '../../../context/ToastContext';
import TextArea from '../form/TextArea';
import TextInput from '../form/TextInput';
import LocationSelectWithCreate from '../locations/LocationSelectWithCreate';

const emptyDay = {
  activities: '',
  description: '',
  heroImage: '',
  heroImageFile: null,
  heroPreview: '',
  id: '',
  instructions: '',
  selectedLocations: [],
  title: '',
  travelTime: '',
};

function getId(value) {
  return typeof value === 'string' ? value : value?._id || '';
}

function getLocationIds(locations) {
  return (locations || []).map((location) => getId(location)).filter(Boolean);
}

function joinLines(items) {
  return Array.isArray(items) ? items.join('\n') : items || '';
}

function dayToState(day = {}) {
  return {
    activities: joinLines(day.activities),
    description: day.description || '',
    heroImage: day.heroImage || '',
    heroImageFile: null,
    heroPreview: day.heroImage || '',
    id: day._id || day.id || '',
    instructions: joinLines(day.instructions),
    selectedLocations: getLocationIds(day.selectedLocations),
    title: day.title || '',
    travelTime: day.travelTime || '',
  };
}

function formStateFor(dayState = emptyDay) {
  return {
    activities: dayState.activities || '',
    description: dayState.description || '',
    heroImage: null,
    instructions: dayState.instructions || '',
    selectedLocations: dayState.selectedLocations || [],
    title: dayState.title || '',
    travelTime: dayState.travelTime || '',
  };
}

function getDayStatus(dayState = emptyDay) {
  if (dayState.id) return 'Saved';
  if (
    dayState.title ||
    dayState.description ||
    dayState.activities ||
    dayState.instructions ||
    dayState.travelTime ||
    dayState.heroImageFile ||
    dayState.selectedLocations?.length
  ) {
    return 'Draft';
  }
  return '';
}

export default function ItineraryDayForm({
  initialActiveDay = 1,
  initialPlanId = '',
}) {
  const { showToast } = useToast();
  const [activeDay, setActiveDay] = useState(Number(initialActiveDay) || 1);
  const [daysByNumber, setDaysByNumber] = useState({});
  const [isLoadingDays, setIsLoadingDays] = useState(false);
  const [isLoadingLists, setIsLoadingLists] = useState(true);
  const [plans, setPlans] = useState([]);
  const [savingDay, setSavingDay] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId);
  const latestFormRef = useRef(emptyDay);
  const latestFileRef = useRef(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: formStateFor(emptyDay),
  });

  const selectedLocations = watch('selectedLocations') || [];
  const selectedFile = watch('heroImage')?.[0];
  const selectedPlan = useMemo(
    () => plans.find((plan) => plan._id === selectedPlanId),
    [plans, selectedPlanId],
  );
  const dayNumbers = useMemo(() => {
    const totalDays = Number(selectedPlan?.totalDays || 0);
    return Array.from({ length: totalDays }, (_, index) => index + 1);
  }, [selectedPlan?.totalDays]);
  const activeDayState = daysByNumber[activeDay] || emptyDay;
  const previewUrl =
    selectedFile && activeDayState.heroPreview?.startsWith('blob:')
      ? activeDayState.heroPreview
      : activeDayState.heroPreview || activeDayState.heroImage;

  const captureActiveDay = useCallback(
    (overrides = {}) => {
      const values = latestFormRef.current;
      const currentFile = latestFileRef.current;

      setDaysByNumber((current) => ({
        ...current,
        [activeDay]: {
          ...(current[activeDay] || emptyDay),
          activities: values.activities || '',
          description: values.description || '',
          heroImageFile:
            overrides.heroImageFile !== undefined
              ? overrides.heroImageFile
              : currentFile || current[activeDay]?.heroImageFile || null,
          heroPreview:
            overrides.heroPreview !== undefined
              ? overrides.heroPreview
              : current[activeDay]?.heroPreview || current[activeDay]?.heroImage || '',
          instructions: values.instructions || '',
          selectedLocations: values.selectedLocations || [],
          title: values.title || '',
          travelTime: values.travelTime || '',
        },
      }));
    },
    [activeDay],
  );

  useEffect(() => {
    const subscription = watch((values) => {
      latestFormRef.current = values;
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    let isMounted = true;

    fetchItineraryPlans()
      .then((plansData) => {
        if (!isMounted) return;
        setPlans(plansData);
      })
      .catch((error) => {
        if (!isMounted) return;
        showToast({
          type: 'error',
          title: 'Could not load day plan lists',
          message: getApiError(error),
        });
      })
      .finally(() => {
        if (isMounted) setIsLoadingLists(false);
      });

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  useEffect(() => {
    if (!selectedPlanId || isLoadingLists) return;
    const planStillExists = plans.some((plan) => plan._id === selectedPlanId);
    if (!planStillExists) setSelectedPlanId('');
  }, [isLoadingLists, plans, selectedPlanId]);

  useEffect(() => {
    let isMounted = true;

    if (!selectedPlanId) {
      setDaysByNumber({});
      setActiveDay(1);
      reset(formStateFor(emptyDay));
      return undefined;
    }

    setIsLoadingDays(true);
    fetchItineraryDays({ itineraryPlanId: selectedPlanId })
      .then((days) => {
        if (!isMounted) return;

        const nextDays = {};
        days.forEach((day) => {
          nextDays[day.dayNumber] = dayToState(day);
        });

        setDaysByNumber(nextDays);
        const safeActiveDay =
          Number(initialActiveDay) > 0 &&
          Number(initialActiveDay) <= Number(selectedPlan?.totalDays || 0)
            ? Number(initialActiveDay)
            : 1;
        setActiveDay(safeActiveDay);
        reset(formStateFor(nextDays[safeActiveDay] || emptyDay));
      })
      .catch((error) => {
        if (!isMounted) return;
        showToast({
          type: 'error',
          title: 'Could not load itinerary days',
          message: getApiError(error),
        });
      })
      .finally(() => {
        if (isMounted) setIsLoadingDays(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialActiveDay, reset, selectedPlan?.totalDays, selectedPlanId, showToast]);

  useEffect(() => {
    if (!selectedFile) {
      latestFileRef.current = activeDayState.heroImageFile || null;
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    latestFileRef.current = selectedFile;
    captureActiveDay({ heroImageFile: selectedFile, heroPreview: objectUrl });

    return () => URL.revokeObjectURL(objectUrl);
  }, [activeDayState.heroImageFile, captureActiveDay, selectedFile]);

  function handlePlanChange(event) {
    setSelectedPlanId(event.target.value);
  }

  function handleDayChange(dayNumber) {
    if (dayNumber === activeDay) return;

    captureActiveDay();
    const nextState = daysByNumber[dayNumber] || emptyDay;
    latestFileRef.current = nextState.heroImageFile || null;
    setActiveDay(dayNumber);
    reset(formStateFor(nextState));
  }

  async function saveDay(values) {
    if (!selectedPlanId || !activeDay) return;

    const dayState = {
      ...(daysByNumber[activeDay] || emptyDay),
      ...values,
      heroImageFile:
        latestFileRef.current || daysByNumber[activeDay]?.heroImageFile || null,
    };
    const formData = new FormData();

    formData.append('itineraryPlanId', selectedPlanId);
    formData.append('dayNumber', activeDay);
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('activities', values.activities);
    formData.append('instructions', values.instructions);
    formData.append('travelTime', values.travelTime);
    formData.append('selectedLocations', JSON.stringify(values.selectedLocations || []));

    if (dayState.heroImageFile) {
      formData.append('heroImage', dayState.heroImageFile);
    }

    setSavingDay(activeDay);
    try {
      const savedDay = dayState.id
        ? await updateItineraryDay(dayState.id, formData)
        : await createItineraryDay(formData);
      const savedState = dayToState(savedDay);

      latestFileRef.current = null;
      setDaysByNumber((current) => ({
        ...current,
        [activeDay]: savedState,
      }));
      reset(formStateFor(savedState));
      showToast({
        type: 'success',
        title: `Day ${activeDay} saved`,
        message: `${selectedPlan?.title || 'Itinerary'} now has an independent Day ${activeDay} record.`,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: `Day ${activeDay} save failed`,
        message: getApiError(error),
      });
    } finally {
      setSavingDay(null);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onSubmit={handleSubmit(saveDay)}
      className="grid gap-6 rounded-lg border border-black/10 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-7"
    >
      <div className="grid gap-5">
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-black/48">
            Itinerary plan
          </span>
          <select
            value={selectedPlanId}
            onChange={handlePlanChange}
            disabled={isLoadingLists || isLoadingDays}
            className="mt-2 min-h-12 w-full rounded-lg border border-black/10 bg-white px-4 text-sm font-semibold text-obsidian outline-none transition focus:border-obsidian disabled:opacity-60"
          >
            <option value="">
              {isLoadingLists ? 'Loading plans...' : 'Select itinerary plan'}
            </option>
            {plans.map((plan) => (
              <option key={plan._id} value={plan._id}>
                {plan.categoryId?.title || 'Category'} / {plan.title}
              </option>
            ))}
          </select>
        </label>

        {selectedPlan && (
          <div className="rounded-lg border border-black/10 bg-pearl p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-black/46">
                <CalendarDays size={15} />
                Generated days
              </div>
              {isLoadingDays && (
                <span className="inline-flex items-center gap-2 text-xs font-bold text-black/46">
                  <Loader2 className="animate-spin" size={14} />
                  Loading saved days
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {dayNumbers.map((dayNumber) => {
                const isActive = activeDay === dayNumber;
                const status = getDayStatus(daysByNumber[dayNumber]);

                return (
                  <button
                    key={dayNumber}
                    type="button"
                    onClick={() => handleDayChange(dayNumber)}
                    className={`inline-flex min-h-10 items-center rounded-lg border px-3 text-xs font-black uppercase tracking-[0.12em] transition ${
                      isActive
                        ? 'border-obsidian bg-obsidian text-pearl'
                        : 'border-black/10 bg-white text-black/58 hover:border-cinnamon hover:text-cinnamon'
                    }`}
                  >
                    Day {dayNumber}
                    {status && (
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-[0.6rem] ${
                          isActive
                            ? 'bg-white/14 text-white'
                            : status === 'Saved'
                              ? 'bg-emerald-100 text-emerald-700'
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
          </div>
        )}
      </div>

      {!selectedPlan && (
        <div className="rounded-lg border border-dashed border-black/16 bg-pearl p-8 text-center">
          <CalendarDays className="mx-auto text-cinnamon" size={34} />
          <p className="mt-4 font-display text-3xl font-semibold">
            Select a plan to generate day tabs.
          </p>
          <p className="mt-2 text-sm leading-7 text-black/52">
            Each tab keeps its own draft values and saves as a separate itinerary
            day record.
          </p>
        </div>
      )}

      {selectedPlan && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedPlanId}-${activeDay}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid gap-6 xl:grid-cols-[1fr_22rem]"
          >
            <div className="grid gap-5">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-black/10 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cinnamon">
                    Day {activeDay} of {selectedPlan.totalDays}
                  </p>
                  <h3 className="mt-1 font-display text-3xl font-semibold">
                    {activeDayState.id ? 'Edit journey day' : 'Create journey day'}
                  </h3>
                </div>
                <p className="text-sm font-semibold text-black/50">
                  {selectedPlan.categoryId?.title || 'Itinerary'} / {selectedPlan.title}
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <TextInput
                  error={errors.title}
                  label="Title"
                  placeholder="Arrival and coastal welcome"
                  register={register('title', {
                    required: 'Title is required',
                    minLength: { value: 2, message: 'Minimum 2 characters' },
                  })}
                />
                <TextInput
                  error={errors.travelTime}
                  label="Travel time"
                  placeholder="2.5 hours private transfer"
                  register={register('travelTime', {
                    required: 'Travel time is required',
                    minLength: { value: 2, message: 'Minimum 2 characters' },
                  })}
                />
              </div>

              <TextArea
                error={errors.description}
                label="Description"
                placeholder="Describe the day-by-day journey flow, pace, and guest experience."
                register={register('description', {
                  required: 'Description is required',
                  minLength: { value: 10, message: 'Minimum 10 characters' },
                })}
                rows={6}
              />

              <div className="grid gap-5 lg:grid-cols-2">
                <TextArea
                  error={errors.activities}
                  label="Activities"
                  placeholder="Airport meet and greet&#10;Sunset beach walk&#10;Private seafood dinner"
                  register={register('activities', {
                    required: 'Add at least one activity',
                  })}
                  rows={7}
                />
                <TextArea
                  error={errors.instructions}
                  label="Instructions"
                  placeholder="Keep passports ready for hotel check-in&#10;Pack light layers for evening breeze"
                  register={register('instructions', {
                    required: 'Add at least one instruction',
                  })}
                  rows={7}
                />
              </div>
            </div>

            <div className="grid gap-5">
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-black/48">
                  Hero image {activeDayState.heroImage ? '(optional)' : ''}
                </span>
                <span className="mt-2 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-black/18 bg-pearl px-4 text-sm font-black uppercase tracking-[0.14em] text-black/54 transition hover:border-cinnamon hover:text-cinnamon">
                  <ImagePlus size={18} />
                  Upload hero
                </span>
                <input
                  type="file"
                  accept="image/*"
                  {...register('heroImage', {
                    validate: () =>
                      Boolean(
                        activeDayState.heroImage ||
                          activeDayState.heroImageFile ||
                          latestFileRef.current,
                      ) || 'Hero image is required',
                  })}
                  className="sr-only"
                />
                {errors.heroImage && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.heroImage.message}
                  </p>
                )}
              </label>

              <div className="overflow-hidden rounded-lg border border-black/10 bg-black/[0.03]">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={`Day ${activeDay} hero preview`}
                    className="h-72 w-full object-cover"
                  />
                ) : (
                  <div className="grid h-72 place-items-center px-8 text-center">
                    <div>
                      <ImagePlus className="mx-auto text-black/24" size={38} />
                      <p className="mt-4 text-sm font-bold text-black/46">
                        Preview appears after image selection.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <SearchableLocationSelect
                error={errors.selectedLocations}
                onChange={(locationIds) => {
                  setValue('selectedLocations', locationIds, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  latestFormRef.current = {
                    ...latestFormRef.current,
                    selectedLocations: locationIds,
                  };
                }}
                register={register}
                selectedIds={selectedLocations}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {selectedPlan && (
        <div className="flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-black/50">
            Day {activeDay} saves independently. Switch tabs freely to keep drafts
            for other days.
          </p>
          <button
            type="submit"
            disabled={savingDay === activeDay || isLoadingDays}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-obsidian px-5 text-sm font-black uppercase tracking-[0.16em] text-pearl transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingDay === activeDay ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Save Day {activeDay}
          </button>
        </div>
      )}
    </motion.form>
  );
}

function SearchableLocationSelect({
  error,
  onChange,
  register,
  selectedIds,
}) {
  return (
    <div>
      <input
        type="hidden"
        {...register('selectedLocations', {
          validate: (value) =>
            value?.length > 0 || 'Select at least one location',
        })}
      />
      <LocationSelectWithCreate
        createButtonLabel="Add Location"
        createOnly
        error={error}
        label="Selected locations"
        multiple
        onChange={onChange}
        placeholder="No locations attached yet. Click Add Location to create and attach a new location record."
        value={selectedIds}
      />
    </div>
  );
}
