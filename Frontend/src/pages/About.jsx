import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  Compass,
  MapPinned,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchLocations, fetchTopLocations } from '../api/locations';

const stats = [
  {
    label: 'Curated Sri Lankan journeys',
    value: '50+',
  },
  {
    label: 'Island regions connected',
    value: '10+',
  },
  {
    label: 'Private planning support',
    value: '24/7',
  },
  {
    label: 'Tailored travel design',
    value: '100%',
  },
];

const values = [
  {
    description:
      'Every route is shaped around real places, local rhythm, and the kind of details that make Sri Lanka feel personal.',
    icon: Compass,
    title: 'Local-Led Direction',
  },
  {
    description:
      'From day tours to full tour plans, each journey is built to feel calm, polished, and easy to understand.',
    icon: Route,
    title: 'Thoughtful Itineraries',
  },
  {
    description:
      'We keep the planning human: clear communication, flexible choices, and support before the journey begins.',
    icon: ShieldCheck,
    title: 'Confident Travel',
  },
];

function imageFromLocation(location) {
  return location?.image || location?.heroImage || location?.gallery?.[0] || '';
}

function AboutImage({ alt, className = '', image, label }) {
  if (!image) {
    return (
      <div
        className={`grid place-items-center bg-[#283A2C] text-[#F1EFEC] ${className}`}
      >
        <MapPinned size={28} />
        {label && (
          <span className="mt-2 text-[0.62rem] font-black uppercase tracking-[0.22em] text-[#DADDC5]">
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={alt}
      className={`object-cover ${className}`}
    />
  );
}

export default function About() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    let isMounted = true;

    fetchTopLocations()
      .then((data) => {
        if (!isMounted) return;
        setLocations(data || []);
      })
      .catch(() => {
        fetchLocations()
          .then((data) => {
            if (!isMounted) return;
            setLocations(data || []);
          })
          .catch(() => {
            if (isMounted) setLocations([]);
          });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const heroLocation = useMemo(
    () => locations.find((location) => imageFromLocation(location)) || null,
    [locations],
  );
  const supportingLocations = useMemo(
    () =>
      locations
        .filter((location) => location?._id !== heroLocation?._id)
        .filter((location) => imageFromLocation(location))
        .slice(0, 3),
    [heroLocation?._id, locations],
  );
  const heroImage = imageFromLocation(heroLocation);

  function scrollToStory() {
    document
      .getElementById('about-story')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section className="min-h-screen overflow-hidden bg-[#F1EFEC] px-4 pb-20 pt-24 text-[#283A2C] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[92rem]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative isolate h-[16rem] overflow-hidden rounded-[2rem] bg-[#283A2C] shadow-[0_24px_68px_rgba(40,58,44,0.14)] sm:h-[19rem] lg:h-[22.5rem] xl:h-[27.8rem]"
        >
          <AboutImage
            alt={heroLocation?.name || 'Sri Lanka journey'}
            image={heroImage}
            label="YOGO Tours"
            className="absolute inset-0 -z-20 h-full w-full"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/46 via-black/14 to-black/10" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/22 via-transparent to-black/12" />
          <div className="absolute right-[-1px] top-[-1px] hidden h-16 w-52 rounded-bl-[4.5rem] border-b border-l border-[#283A2C]/35 bg-[#F1EFEC] sm:block lg:h-20 lg:w-72 lg:rounded-bl-[5.5rem]" />

          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="mb-5 text-xs font-black uppercase tracking-[0.32em] text-[#DADDC5] sm:text-sm">
              YOGO Tours
            </p>
            <h1 className="max-w-5xl text-[2.15rem] font-extrabold uppercase leading-[0.92] tracking-[-0.03em] text-[#FFFFFF] sm:text-[3.35rem] lg:text-[4.15rem] xl:text-[4.75rem]">
              About Us
            </h1>
          </div>

          <div className="absolute bottom-[-1px] left-[-1px] w-[min(56rem,84%)] max-w-[calc(100%-4.25rem)] rounded-tr-[4.5rem] border-r border-t border-[#283A2C]/30 bg-[#F1EFEC] px-5 py-3.5 pr-12 text-left sm:px-7 sm:py-4 sm:pr-16 lg:rounded-tr-[5.5rem]">
            <p className="text-xs font-bold leading-5 text-[#283A2C] sm:text-[0.82rem] sm:leading-6">
              Your Sri Lankan travel companion for luxury routes, day tours,
              and locally grounded island experiences.
            </p>
          </div>

          <button
            type="button"
            onClick={scrollToStory}
            aria-label="Scroll to about story"
            className="absolute bottom-5 right-5 grid h-11 w-11 place-items-center rounded-full border border-[#FFFFFF]/68 bg-black/16 text-[#FFFFFF] shadow-[0_16px_34px_rgba(0,0,0,0.22)] backdrop-blur-md transition hover:bg-[#FFFFFF] hover:text-[#283A2C] sm:bottom-7 sm:right-7 sm:h-12 sm:w-12"
          >
            <ArrowDown size={21} />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.55 }}
          className="mt-4 lg:mt-5"
        >
          <h2 className="max-w-[52rem] font-display text-[clamp(2rem,3.7vw,3.55rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-[#283A2C]">
            Discover the Soul of Sri Lanka with YOGO Tours
          </h2>
        </motion.div>

        <div
          id="about-story"
          className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-14"
        >
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55 }}
          >
            <p className="inline-flex items-center gap-2 text-[0.72rem] font-black uppercase tracking-[0.28em] text-[#283A2C]/62">
              <span className="h-2 w-2 rounded-full bg-[#283A2C]" />
              About Us
            </p>
            <h3 className="mt-4 font-display text-3xl font-semibold leading-tight text-[#283A2C] sm:text-4xl">
              Get to Know About Us
            </h3>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.45 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="rounded-2xl border border-[#283A2C]/8 bg-[#FFFFFF] p-5 shadow-[0_18px_42px_rgba(40,58,44,0.07)]"
                >
                  <p className="font-display text-3xl font-semibold leading-none text-[#283A2C] sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-xs font-bold leading-5 text-[#283A2C]/58 sm:text-sm">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55 }}
            className="grid gap-8"
          >
            <div>
              <h3 className="max-w-2xl text-pretty font-display text-3xl font-semibold leading-[1.08] text-[#283A2C]/84 sm:text-4xl lg:text-5xl">
                Elevate every journey, embrace every coastline, kingdom, and
                mountain road.
              </h3>
              <p className="mt-7 max-w-3xl text-base leading-8 text-[#283A2C]/66">
                At YOGO Tours, we create Sri Lankan travel experiences that feel
                personal, polished, and easy to explore. Our routes connect
                ancient citadels, tea country, wildlife, beaches, boutique stays,
                and local stories into journeys designed for real travellers,
                not generic checklists.
              </p>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[#283A2C]/66">
                Whether you are choosing a full tour plan, a focused day tour, or
                a custom inquiry, our goal is simple: make the island feel clear,
                beautiful, and ready to experience.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {values.map(({ description, icon: Icon, title }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-[#283A2C]/8 bg-[#FFFFFF] p-5 shadow-[0_18px_42px_rgba(40,58,44,0.07)]"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[#283A2C] text-[#F1EFEC]">
                    <Icon size={20} />
                  </span>
                  <h4 className="mt-5 font-display text-2xl font-semibold leading-tight text-[#283A2C]">
                    {title}
                  </h4>
                  <p className="mt-3 text-sm leading-6 text-[#283A2C]/60">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-20 grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55 }}
            className="relative min-h-[22rem] overflow-hidden rounded-[2rem] bg-[#283A2C] text-[#FFFFFF] shadow-[0_24px_70px_rgba(40,58,44,0.16)]"
          >
            <AboutImage
              alt={supportingLocations[0]?.name || 'Sri Lanka travel detail'}
              image={imageFromLocation(supportingLocations[0])}
              label="Island Detail"
              className="absolute inset-0 h-full w-full opacity-82"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#283A2C]/90 via-[#283A2C]/52 to-transparent" />
            <div className="relative flex min-h-[22rem] max-w-xl flex-col justify-end p-7 sm:p-9">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.32em] text-[#DADDC5]">
                Designed Around Sri Lanka
              </p>
              <h3 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
                Routes with a sense of place.
              </h3>
              <p className="mt-5 text-sm leading-7 text-[#F1EFEC]/78 sm:text-base">
                Our public experiences are connected to the same admin-created
                locations, images, day stops, and travel stories used across the
                site, so every journey stays consistent and easy to explore.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.08, duration: 0.55 }}
            className="rounded-[2rem] border border-[#283A2C]/10 bg-[#FFFFFF] p-7 shadow-[0_18px_52px_rgba(40,58,44,0.08)] sm:p-9"
          >
            <Sparkles className="text-[#283A2C]" size={28} />
            <h3 className="mt-6 font-display text-4xl font-semibold leading-tight text-[#283A2C]">
              Planning that feels calm from the first click.
            </h3>
            <p className="mt-5 text-base leading-8 text-[#283A2C]/62">
              Browse themes, follow day-by-day route maps, compare day tours,
              and open an inquiry with the relevant tour details already filled.
            </p>
            <Link
              to="/#interactive-travel-themes"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#283A2C] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#F1EFEC] transition hover:bg-black"
            >
              Explore Tour Plans
              <ArrowRight size={17} />
            </Link>
          </motion.div>
        </div>

        <div className="mt-16 flex flex-col gap-4 rounded-[2rem] border-[1.5px] border-[#283A2C] bg-[#DADDC5] p-6 text-[#283A2C] sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#283A2C] text-[#F1EFEC]">
              <Users size={22} />
            </span>
            <div>
              <p className="text-[0.68rem] font-black uppercase tracking-[0.24em] text-[#283A2C]/60">
                Ready When You Are
              </p>
              <h3 className="font-display text-2xl font-semibold sm:text-3xl">
                Let us help shape your Sri Lankan journey.
              </h3>
            </div>
          </div>
          <Link
            to="/contact"
            className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#FFFFFF] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#283A2C] transition hover:bg-[#283A2C] hover:text-[#F1EFEC] sm:w-auto"
          >
            Contact YOGO
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
