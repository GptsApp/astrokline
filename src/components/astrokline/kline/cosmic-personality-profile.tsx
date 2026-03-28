'use client';

import { Heading } from "@/components/astrokline/ui/heading";

import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { motion } from 'framer-motion';
import {
  Brain,
  Briefcase,
  Compass,
  Heart,
  Shield,
  Sparkles,
} from 'lucide-react';

interface DimensionData {
  icon: typeof Brain;
  label: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

/**
 * Generate 5 personality dimensions from the Big 3 (Sun, Moon, Rising).
 * In production, this could call the AI endpoint; for now we use deterministic mapping
 * from zodiac signs to provide instant, personalized-feeling content.
 */
function generateDimensions(profile: UserProfile): DimensionData[] {
  const sunSign = profile.sun.sign;
  const moonSign = profile.moon.sign;
  const risingSign = profile.rising.sign;

  // Sign-based personality traits mapping
  const signTraits: Record<
    string,
    {
      core: string;
      emotional: string;
      drive: string;
      social: string;
      growth: string;
    }
  > = {
    Aries: {
      core: 'You carry the archetype of the Pioneer — a soul built to initiate, compete, and carve new paths where none existed before.',
      emotional:
        'Your emotional world is fast and fiery. You process feelings through action, not reflection. When hurt, you charge forward rather than sit with pain.',
      drive:
        "An independent builder who thrives in high-stakes, fast-paced environments. You're drawn to leadership roles where you can act on instinct.",
      social:
        'Others see a confident, sometimes intimidating presence. Your directness is refreshing but can overwhelm more sensitive souls.',
      growth:
        'Your lesson is patience. Learning to pause before acting will unlock deeper strategic thinking and more lasting success.',
    },
    Taurus: {
      core: 'You embody the Builder archetype — someone who creates lasting value through patience, persistence, and an eye for beauty.',
      emotional:
        "Your emotional landscape is rich but slow-moving. You need time to process feelings, and once you commit emotionally, you're deeply loyal.",
      drive:
        'A natural wealth creator who understands the power of compound effort. You excel in roles that reward consistency over brilliance.',
      social:
        'Others experience you as grounding and reliable. Your calm presence creates safe spaces, though stubbornness can create friction.',
      growth:
        'Your edge lies in learning flexibility. Embracing change rather than resisting it will accelerate your path to abundance.',
    },
    Gemini: {
      core: "You are the Communicator archetype — a mind that connects dots others can't see, weaving ideas into stories that move people.",
      emotional:
        'Your emotional life is intellectualized. You understand feelings through language and analysis, sometimes at the expense of deeper embodiment.',
      drive:
        'A natural networker and idea generator. You thrive in environments that demand adaptability, variety, and quick thinking.',
      social:
        'Others find you endlessly interesting but sometimes hard to pin down. Your versatility is your superpower and your Achilles heel.',
      growth:
        'Your breakthrough comes from depth. Committing to one path long enough to master it will transform scattered brilliance into lasting impact.',
    },
    Cancer: {
      core: 'You carry the Nurturer archetype — a soul with profound emotional intelligence that creates sanctuary wherever you go.',
      emotional:
        "Your emotional depth is vast. You feel the room before you read it, absorbing others' energy like a psychic sponge.",
      drive:
        'A natural caretaker who builds through emotional bonds. You excel in roles where empathy and intuition matter more than raw ambition.',
      social:
        'Others feel safe around you instantly. Your protective shell hides a tender heart that, once opened, creates unbreakable bonds.',
      growth:
        'Your evolution demands boundaries. Learning to protect your energy without withdrawing will unlock your full leadership potential.',
    },
    Leo: {
      core: 'You embody the Creator archetype — born to express, inspire, and remind others of their own dormant magnificence.',
      emotional:
        'You experience emotions dramatically and generously. Your heart operates on a grand scale — love deeply or not at all.',
      drive:
        'A natural performer and leader who magnetizes resources through charisma. You thrive wherever self-expression meets strategic vision.',
      social:
        'Others are drawn to your warmth and confidence. Your generosity inspires loyalty, though your need for recognition can create blind spots.',
      growth:
        'Your deepening comes from humility. Learning to shine light on others will paradoxically amplify your own radiance tenfold.',
    },
    Virgo: {
      core: 'You are the Analyst archetype — a mind designed to optimize, heal, and perfect the systems that sustain life.',
      emotional:
        'Your emotional world is precise and self-critical. You process feelings through service and problem-solving, sometimes neglecting your own needs.',
      drive:
        'A natural healer and optimizer who builds through meticulous attention to detail. You excel where precision creates measurable impact.',
      social:
        'Others value your reliability and sharp insights. Your helpfulness builds deep trust, though self-criticism can make you seem distant.',
      growth:
        'Your liberation lies in self-compassion. Accepting imperfection in yourself will paradoxically make your work more powerful.',
    },
    Libra: {
      core: 'You carry the Diplomat archetype — a soul calibrated for harmony, beauty, and the art of bringing opposing forces into balance.',
      emotional:
        "Your emotional life seeks equilibrium. You navigate feelings through relationships and aesthetics, sometimes losing yourself in others' needs.",
      drive:
        'A natural mediator and aesthetic creator. You thrive in collaborative environments where taste, fairness, and social intelligence matter.',
      social:
        'Others experience you as graceful and easy to be around. Your charm opens doors, though indecision can stall your momentum.',
      growth:
        'Your power activates through decisive action. Learning to choose — even imperfectly — will break you free from the paralysis of balance.',
    },
    Scorpio: {
      core: 'You embody the Transformer archetype — a soul built for depth, truth, and the regeneration that follows necessary destruction.',
      emotional:
        'Your emotional intensity is volcanic. You feel everything at maximum capacity, and your instinct is to probe beneath every surface.',
      drive:
        'A natural investigator and power-builder who thrives in high-stakes environments. You excel where depth of insight creates strategic advantage.',
      social:
        'Others sense your power before you speak. Your penetrating gaze creates both attraction and wariness — few are neutral about you.',
      growth:
        'Your transcendence comes from vulnerability. Letting others see your softness will create the trust your power alone cannot build.',
    },
    Sagittarius: {
      core: 'You are the Explorer archetype — a spirit designed to expand horizons, question dogma, and find meaning in the vastness of experience.',
      emotional:
        'Your emotional life is adventurous and philosophical. You process feelings through movement, humor, and the search for bigger meaning.',
      drive:
        'A natural visionary and teacher who builds through inspiration. You thrive in roles that combine freedom, travel, and intellectual exploration.',
      social:
        'Others find your enthusiasm contagious. Your honesty and humor make you magnetic, though restlessness can make commitment feel like a cage.',
      growth:
        "Your mastery lies in follow-through. Learning to build on what you've started will transform great ideas into great achievements.",
    },
    Capricorn: {
      core: 'You carry the Architect archetype — a soul engineered for long-term construction, legacy-building, and the patient accumulation of power.',
      emotional:
        'Your emotional world is disciplined and guarded. You feel deeply but express sparingly, trusting time to validate your inner experience.',
      drive:
        'A natural strategist and institution-builder. You excel in environments that reward long-term thinking, discipline, and structural integrity.',
      social:
        'Others respect your competence and quiet authority. Your reliability builds empires, though emotional distance can create loneliness at the top.',
      growth:
        'Your softening comes from play. Learning to be impractical, spontaneous, and joyful will make your structures truly worth building.',
    },
    Aquarius: {
      core: "You embody the Visionary archetype — a mind wired for tomorrow's problems, existing slightly ahead of your contemporaries.",
      emotional:
        'Your emotional life is cerebral and universal. You care deeply about humanity but sometimes struggle with one-on-one intimacy.',
      drive:
        'A natural innovator and systems thinker who builds through ideas that challenge convention. You thrive wherever the future is being designed.',
      social:
        'Others see you as brilliantly eccentric. Your originality inspires movements, though emotional detachment can make close relationships feel clinical.',
      growth:
        'Your humanization comes from intimacy. Learning to be fully present with one person will give your universal vision personal power.',
    },
    Pisces: {
      core: 'You are the Mystic archetype — a soul existing at the boundary between worlds, channeling the invisible into the tangible through art and empathy.',
      emotional:
        "Your emotional life is oceanic and boundless. You absorb the collective mood, making it hard to distinguish your own feelings from others'.",
      drive:
        'A natural healer and artist who builds through compassion and creative vision. You excel wherever imagination transforms suffering into beauty.',
      social:
        'Others feel understood in your presence without knowing why. Your gentleness creates deep connections, though escapism can blur your direction.',
      growth:
        'Your grounding comes from structure. Learning to channel your vast imagination through disciplined practice will make the invisible manifest.',
    },
  };

  const sunData = signTraits[sunSign] || signTraits.Aries;
  const moonData = signTraits[moonSign] || signTraits.Cancer;
  const risingData = signTraits[risingSign] || signTraits.Libra;

  return [
    {
      icon: Brain,
      label: 'Core Identity',
      title: `The ${sunSign} Soul`,
      description: sunData.core,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: Heart,
      label: 'Emotional Compass',
      title: `${moonSign} Moon`,
      description: moonData.emotional,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      icon: Compass,
      label: 'The Mask You Wear',
      title: `${risingSign} Rising`,
      description: risingData.social,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
    {
      icon: Briefcase,
      label: 'Career & Drive',
      title: 'Your Natural Earning Style',
      description: sunData.drive,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
    },
    {
      icon: Shield,
      label: 'Growth Edge',
      title: 'Your Cosmic Lesson',
      description: sunData.growth,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];
}

export function CosmicPersonalityProfile({
  profile,
}: {
  profile: UserProfile;
}) {
  const dimensions = generateDimensions(profile);

  return (
    <div className="w-full space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Sparkles className="text-primary h-5 w-5" />
        <Heading level={2} className="font-serif text-2xl tracking-tight text-white/90">
          Your Cosmic Profile
        </Heading>
        <div className="ml-4 h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>

      <p className="max-w-2xl text-sm text-white/50">
        Based on your Sun ({profile.sun.sign}), Moon ({profile.moon.sign}), and
        Rising ({profile.rising.sign}) — the three pillars of your astrological
        identity.
      </p>

      {/* Dimension Cards */}
      <div className="space-y-3">
        {dimensions.map((dim, idx) => {
          const Icon = dim.icon;
          return (
            <motion.div
              key={dim.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="group relative overflow-hidden  border border-white/5 bg-[#111015] p-5 transition-all hover:border-white/10"
            >
              {/* Subtle glow */}
              <div
                className={`absolute top-0 right-0 h-24 w-24 ${dim.bgColor} pointer-events-none opacity-50 blur-[40px] transition-opacity group-hover:opacity-100`}
              />

              <div className="relative z-10">
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className={`h-9 w-9 ${dim.bgColor} flex shrink-0 items-center justify-center border border-white/10`}
                  >
                    <Icon className={`h-4 w-4 ${dim.color}`} />
                  </div>
                  <div>
                    <span
                      className={`text-[9px] font-bold tracking-widest uppercase ${dim.color}`}
                    >
                      {dim.label}
                    </span>
                    <Heading level={4} className="font-serif text-base text-white/90">
                      {dim.title}
                    </Heading>
                  </div>
                </div>
                <p className="pl-12 text-sm leading-relaxed text-white/70">
                  {dim.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
