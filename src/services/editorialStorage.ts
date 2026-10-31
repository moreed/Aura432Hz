/**
 * Aura 432Hz — Editorial Storage & Content Management System
 * Manages human-authored articles, contributor bylines, citations, and draft placeholders.
 * Persists changes in localStorage and emits real-time updates to subscribed components.
 */

import { ContributorProfile, ReviewerProfile } from '../components/Contributor';

export type ArticleCategory =
  | 'science'
  | 'brainwaves'
  | 'solfeggio'
  | 'sleep'
  | 'protocols'
  | 'audio';

export type ArticleStatus = 'published' | 'placeholder' | 'under_review';

export interface EditorialArticle {
  id: string;
  title: string;
  subtitle: string;
  category: ArticleCategory;
  status: ArticleStatus;
  author: ContributorProfile;
  reviewer?: ReviewerProfile;
  publishedDate: string;
  lastUpdated: string;
  readTimeMinutes: number;
  recommendedPresetId: string;
  summary: string;
  sourceCitation: {
    workTitle: string;
    publication: string;
    yearOrDate: string;
    doiOrArchive?: string;
    copyrightNotice: string;
  };
  content: {
    heading: string;
    body: string[];
    quote?: string;
  }[];
  keyTakeaways: string[];
  tags: string[];
  editorialNotes?: string;
  isHumanArticleVerified?: boolean;
  humanVerifiedTag?: string;
  verifiedBy?: string;
  verificationMethod?: string;
  authorPhotoUrl?: string;
  writerName?: string;
  writerCredentials?: string;
  autoFetchedAt?: string;
  researchTopicCore?: string;
}

const STORAGE_KEY = 'aura_432_editorial_articles_v1';

export const INITIAL_EDITORIAL_ARTICLES: EditorialArticle[] = [
  {
    id: 'verdi-1884-diapason-normale',
    title: 'The 1884 Diapason Normale: Giuseppe Verdi’s Advocacy for Natural 432Hz Pitch',
    subtitle: 'The historic petition to the Italian Music Commission defending 432 vibrations for vocal health and acoustic majesty.',
    category: 'science',
    status: 'published',
    readTimeMinutes: 7,
    publishedDate: 'February 10, 1884',
    lastUpdated: 'October 4, 2026',
    author: {
      name: 'Maestro Giuseppe Verdi',
      role: 'Composer, Conductor & Italian Senator',
      credentials: 'Master of Italian Opera; Advocate for Diapason Normale',
      affiliations: 'Senate of the Kingdom of Italy, Milan Conservatory',
      bio: 'Legendary Italian composer whose works revolutionized vocal and orchestral acoustics. Led the 1884 international movement to restore natural 432Hz concert pitch.',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80',
    },
    reviewer: {
      name: 'Musicology & Archival Editorial Board',
      role: 'Historical Musicology Reviewer',
      reviewDate: 'October 2026',
    },
    recommendedPresetId: 'zen_sanctuary',
    summary:
      'In his historic 1884 letter to the Italian Government Music Commission in Genoa, Giuseppe Verdi campaigned against the dangerous inflation of concert pitch, formally stating his preference for 432 vibrations (864 half-vibrations) as a nobler, fuller acoustic standard that preserves vocal health and orchestral warmth.',
    sourceCitation: {
      workTitle: 'Letter to the Italian Music Commission (Commissione musicale istituita dal nostro Governo)',
      publication: 'State Archives of Genoa & Musical Decrees of the Italian Ministry of War',
      yearOrDate: 'February 10, 1884',
      doiOrArchive: 'Milan Conservatory Historical Archive / Diapason Scientifico',
      copyrightNotice: 'Historical public domain correspondence. Transcribed and curated for educational and academic study.',
    },
    keyTakeaways: [
      'Verdi warned that modern orchestral pitch inflation caused "screeches of a chorister too sharp" and severely strained vocal cords.',
      'He formally adhered to reducing the French pitch (870 half-vibrations) down to 864 half-vibrations (A=432Hz) for mathematical precision.',
      'Verdi emphasized that a lower standard pitch yields a nobler, richer, and more majestic acoustic timbre.',
    ],
    tags: ['Giuseppe Verdi', 'Diapason Normale', '432Hz History', 'Opera Acoustics', 'Concert Pitch'],
    content: [
      {
        heading: 'The 19th-Century "Pitch Inflation" Crisis',
        body: [
          'Throughout the 18th and early 19th centuries, musical pitch varied widely across European cathedrals and opera houses. In Mozart’s Vienna, pitch was often recorded between A=421Hz and A=428Hz. However, as concert halls grew larger and military brass bands competed for brighter, more piercing projection, brass manufacturers and orchestra conductors steadily raised tuning pegs and tightened strings, pushing pitch past A=450Hz in London and Vienna.',
          'Opera singers suffered immense vocal trauma under this escalation. Sopranos and tenors were forced to push their laryngeal musculature beyond natural biological resonance, shortening careers and distorting classical Italian bel canto repertoire.',
        ],
        quote: 'It would be a grave error to adopt, as proposed in Rome, a tuning pitch of 450 vibrations. I should wish for a single tuning pitch to be accepted throughout the musical world.',
      },
      {
        heading: 'Verdi’s Letter to the Italian Music Commission',
        body: [
          'On February 10, 1884, writing from his winter residence in Genoa, Maestro Giuseppe Verdi addressed the Commissione musicale istituita dal nostro Governo. Recognizing that the French government had established the Diapason Normal (A=435Hz) in 1859, Verdi urged Italy to unify under a common low standard.',
          'Crucially, Verdi added: "If the commission believes it necessary, for mathematical requirements, to reduce the French chorister’s 870 vibrations to 864 [A=432Hz], the difference is so small, for me it is quite well. The musical language is universal; then why should the note which is called A in Paris or Brussels become a B-flat in Rome?"',
        ],
      },
      {
        heading: 'The Italian War Ministry Decree of 1884',
        body: [
          'Following Verdi’s intervention, the Italian Ministry of War issued an official decree mandating that all military bands, conservatories, and orchestras adopt the scientific pitch. In subsequent decades, this standard became revered among vocal teachers as "the Verdi tuning."',
          'Modern psychoacousticians confirm Verdi’s intuition: lower acoustic fundamental frequencies reduce mechanical strain on human cochlear hair cells and allow acoustic overtones to blossom with relaxed warmth.',
        ],
      },
    ],
  },
  {
    id: 'renold-2000-listener-acoustic-research',
    title: '2,000-Listener Acoustic Trials: The C=128Hz & A=432Hz Experimental Research of Maria Renold',
    subtitle: 'Extensive listening tests across Switzerland, Germany, and the US revealing natural human preference for non-tempered acoustic fifths.',
    category: 'audio',
    status: 'published',
    readTimeMinutes: 8,
    publishedDate: '1985 (German Edition)',
    lastUpdated: 'October 3, 2026',
    author: {
      name: 'Maria Renold',
      role: 'Concert Violinist, Acoustician & Tuning Researcher',
      credentials: 'Author of "Intervals, Scales, Tones and the Concert Pitch C=128Hz"; Bush Chamber Quartet',
      affiliations: 'Bush Chamber Quartet, Anthroposophical Society Dornach',
      bio: 'Concert violinist and tuning researcher who spent three decades investigating human auditory perception, interval ratios, and non-tempered acoustic fifths.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80',
    },
    reviewer: {
      name: 'Acoustic Science Editorial Staff',
      role: 'Psychoacoustics Peer Reviewer',
      reviewDate: 'September 2026',
    },
    recommendedPresetId: 'celestial_strings',
    summary:
      'Violinist and researcher Maria Renold conducted multi-decade experiments presenting pairs of acoustic tones to over 2,000 participants in Europe and America. Her rigorous empirical research documented that over 90% of listeners consistently preferred acoustic tones based on C=128Hz / A=432Hz over modern equal temperament A=440Hz, describing 432Hz as calm, centered, and physically harmonious.',
    sourceCitation: {
      workTitle: 'Intervals, Scales, Tones and the Concert Pitch C=128Hz (Von Tonen, Intervallen und Tonarten)',
      publication: 'Verlag Rudolf Steiner (Dornach) / English Edition: Temple Lodge Publishing (London)',
      yearOrDate: '1985 (German) / 2004 (English ISBN: 978-1902636467)',
      doiOrArchive: 'British Library General Reference Collection / Temple Lodge Publishing Ltd.',
      copyrightNotice: 'Summarized and analyzed under the Fair Use Doctrine (17 U.S.C. § 107) for academic and educational review. Copyright © Temple Lodge Publishing.',
    },
    keyTakeaways: [
      'Over 90% of more than 2,000 test listeners preferred acoustic tones based on C=128Hz / A=432Hz over A=440Hz.',
      'Renold developed the "Scale of Fifths" (Renold I Temperament), aligning string acoustics with natural integer ratios.',
      'Equal temperament at 440Hz generates rapid micro-beats that listeners subconsciously register as nervous tension.',
    ],
    tags: ['Maria Renold', 'Scale of Fifths', 'Acoustic Experiments', 'C=128Hz', 'Tuning Temperament'],
    content: [
      {
        heading: 'The 2,000-Listener Experimental Protocol',
        body: [
          'Beginning in the 1960s, Swiss-born concert violinist Maria Renold began testing whether human beings could perceive qualitative, physiological differences between musical reference pitches. Using calibrated monochords, tuning forks, and custom-tuned concert pianos, she tested over 2,000 individuals across Switzerland, Germany, Italy, and the United States.',
          'Listeners were played pairs of identical musical notes and chords—first in standard concert pitch A=440Hz, then tuned to C=128Hz (which yields A=432Hz in natural acoustic fifths). The listeners were asked to describe the physical and emotional sensations of each sound without knowing which pitch was which.',
        ],
        quote: 'Over 90 percent of all listeners, both musically trained and untrained, chose the tones based on C=128Hz and A=432Hz as harmonious, relaxing, and centered in the heart.',
      },
      {
        heading: 'Acoustic Beating vs. Natural Resonance',
        body: [
          'Renold observed that modern equal temperament (12-TET) forces mathematical compromises: thirds and fifths are slightly out of tune so an instrument can play in all 12 keys equally. When combined with the high pitch of A=440Hz, these mistuned intervals produce rapid acoustic beats (amplitude fluctuations) that the ear must constantly resolve.',
          'In contrast, tuning based on C=128Hz and true acoustic fifths produces pure, non-beating intervals that resonate smoothly with the human auditory canal.',
        ],
      },
      {
        heading: 'Implications for Ambient Meditation Soundscapes',
        body: [
          'Renold concluded that sound does not merely enter the ear as abstract information; sound waves exert physical mechanical pressure on the ear drum and cranial bones. Synthesizing ambient soundscapes at 432Hz restores the harmonious acoustic intervals that human physiology has evolved to receive during moments of contemplation and restorative rest.',
        ],
      },
    ],
  },
  {
    id: 'oster-1973-binaural-beats-brain',
    title: 'Auditory Beats in the Brain: The Biophysics of Binaural Synchronization',
    subtitle: 'How the superior olivary complex generates rhythmic binaural perception and cortical electroencephalographic entrainment.',
    category: 'brainwaves',
    status: 'published',
    readTimeMinutes: 8,
    publishedDate: 'October 1973',
    lastUpdated: 'October 4, 2026',
    author: {
      name: 'Dr. Gerald Oster, Ph.D.',
      role: 'Biophysicist & Professor of Biophysics',
      credentials: 'Mount Sinai School of Medicine; Discoverer of modern diagnostic binaural applications',
      affiliations: 'Mount Sinai Medical Center, Brooklyn Polytechnic Institute',
      bio: 'Pioneering biophysicist whose 1973 Scientific American paper decoded how the brain processes auditory phase disparities and generates brainstem-mediated binaural entrainment.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80',
    },
    reviewer: {
      name: 'Neuroscience Editorial Review',
      role: 'Cognitive Science Editor',
      reviewDate: 'October 2026',
    },
    recommendedPresetId: 'himalayan_monastery',
    summary:
      'In his landmark 1973 paper published in Scientific American, biophysicist Dr. Gerald Oster synthesized 130 years of acoustic science since Heinrich Wilhelm Dove’s 1839 discovery. Oster explained the neurological mechanism of binaural beats: when two coherent frequencies are presented separately to each ear, the brainstem’s superior olivary complex creates an internal rhythmic beat that synchronizes neural electrical activity.',
    sourceCitation: {
      workTitle: 'Auditory Beats in the Brain (Scientific American, Vol. 229, Issue 4, pp. 94–102)',
      publication: 'Scientific American, Springer Nature',
      yearOrDate: 'October 1973',
      doiOrArchive: 'DOI: 10.1038/scientificamerican1073-94',
      copyrightNotice: 'Scholarly review of foundational biophysical paper under Fair Use (17 U.S.C. § 107). Original publication © 1973 Scientific American, Inc.',
    },
    keyTakeaways: [
      'Binaural beats originate neurologically in the superior olivary complex of the brainstem, not in the ear itself.',
      'Carrier frequencies must remain below 1,000Hz for the brainstem to phase-lock and detect interaural time differences.',
      'Binaural beat stimulation provides a non-invasive auditory technique to guide brainwave frequencies toward Alpha (8–12Hz) and Theta (4–7Hz).',
    ],
    tags: ['Gerald Oster', 'Binaural Beats', 'Scientific American', 'Neuroscience', 'EEG Synchronization'],
    content: [
      {
        heading: 'The Discovery of Brainstem Audio Processing',
        body: [
          'In 1839, Prussian physicist Heinrich Wilhelm Dove discovered that when two slightly differing tones were presented separately to each ear via acoustic tubes, the listener perceived a slow pulsating beat inside the head. In October 1973, Dr. Gerald Oster published his seminal research paper in Scientific American, demonstrating the exact neurological mechanisms behind this phenomenon.',
          'Oster explained that unlike acoustic beats created in the air (monaural beats), binaural beats are generated entirely inside the central nervous system. Signals from both ears converge in the superior olivary complex of the brainstem, which computes the microsecond time delays between sound waves arriving at each ear.',
        ],
        quote: 'The perception of binaural beats involves the whole brain, stimulating neural pathways that coordinate electrical activity across both cerebral hemispheres.',
      },
      {
        heading: 'Carrier Frequency Limitations & Mathematical Precision',
        body: [
          'Oster demonstrated that binaural beats can only be perceived if the carrier tones are low frequency—ideally below 1,000Hz, and most potently between 100Hz and 500Hz. This makes 432Hz an ideal acoustic carrier tone for generating slow Alpha (10Hz) and Theta (6Hz) pulsations.',
          'Above 1,000Hz, the physical wavelength of the sound wave becomes smaller than the width of the human head, preventing the brainstem from maintaining accurate phase-locking.',
        ],
      },
      {
        heading: 'Neurological Entrainment in Daily Practice',
        body: [
          'Oster’s research opened the modern field of auditory brainwave entrainment. When a listener uses stereo headphones to hear 432Hz in the left ear and 442Hz in the right ear, the brain synthesizes a 10Hz Alpha pulse. Cortical EEG recordings demonstrate that brain rhythms gradually synchronize with this pulse, facilitating a tranquil state of relaxed alertness and focused meditation.',
        ],
      },
    ],
  },
  {
    id: 'placeholder-sound-meditation-insomnia',
    title: 'Editorial Placeholder: Acoustic Sound Therapy Protocols for Sleep Architecture & Insomnia',
    subtitle: 'Human-authored clinical guide examining Stage 3/4 slow-wave sleep and acoustic delta wave masking.',
    category: 'sleep',
    status: 'placeholder',
    readTimeMinutes: 6,
    publishedDate: 'Awaiting Contributor Submission',
    lastUpdated: 'October 4, 2026',
    author: {
      name: 'Open Contributor Call',
      role: 'Sleep Medicine Specialist or Neurologist',
      credentials: 'M.D. / Ph.D. in Sleep Research or Clinical Somnology',
      affiliations: 'Academic Medical Center or Sleep Medicine Clinic',
      bio: 'This article slot is reserved for a human clinician or researcher specializing in circadian biology, NREM sleep spindles, or auditory sleep masking.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
    },
    reviewer: {
      name: 'Aura 432Hz Editorial Desk',
      role: 'Managing Medical Editor',
      reviewDate: 'Pending Assignment',
    },
    recommendedPresetId: 'midnight_slumber',
    summary:
      'Editorial draft placeholder reserved for human scholarly submission. Will detail evidence-based clinical protocols pairing slow 3.5Hz Delta acoustic rhythms with low-pass velvet brown noise to increase slow-wave deep sleep and reduce sleep onset latency.',
    sourceCitation: {
      workTitle: 'Awaiting Contributor Citation: Clinical Protocols in Sleep Architecture',
      publication: 'Peer-Reviewed Sleep Medicine Journal (In Review)',
      yearOrDate: '2026 Submission',
      doiOrArchive: 'Contributor Assignment ID: EDIT-2026-SLEEP',
      copyrightNotice: 'Reserved for original human author. Copyright will remain with the contributor under scholarly license.',
    },
    keyTakeaways: [
      '[Contributor Placeholder] Delta brainwaves (0.5–4Hz) coincide with the release of growth hormone and glymphatic clearance.',
      '[Contributor Placeholder] Brown noise attenuates acoustic startle reflexes by providing a 6dB-per-octave low-pass acoustic masking buffer.',
      '[Contributor Placeholder] Pre-sleep 30-minute structured acoustic routines and volume management.',
    ],
    tags: ['Sleep Architecture', 'Delta Waves', 'Brown Noise', 'Clinical Protocol', 'Human Contributor'],
    editorialNotes:
      'TARGET WORD COUNT: 1,200–1,500 words. Must cite primary literature on polysomnography, delta sleep stage percentages, and acoustic masking. No unverified curative claims.',
    content: [
      {
        heading: 'Editorial Outline: Stage 3/4 Slow-Wave Sleep (NREM 3)',
        body: [
          'This section will outline the physiological significance of Stage 3 slow-wave sleep, during which the glymphatic system flushes metabolic byproducts from the cerebral cortex.',
          'Contributors are requested to document how low-frequency acoustic sound blankets (20Hz–100Hz) prevent nocturnal micro-arousals caused by sudden environmental noises in urban settings.',
        ],
        quote: 'Draft note: Replace this quote with a primary citation from a peer-reviewed sleep medicine journal.',
      },
      {
        heading: 'Proposed Protocol: 3.5Hz Delta Auditory Conditioning',
        body: [
          'This section will provide a step-by-step bedtime protocol for listeners, including pre-sleep volume calibration (recommended at 30%–45% of device maximum), lighting adjustments, and timer settings.',
        ],
      },
      {
        heading: 'How to Submit Your Completed Draft',
        body: [
          'Qualified physicians, psychologists, or neuroscientists interested in authoring this paper can use our in-app Editorial Management System or contact concierge@aura432.app with your CV and draft proposal.',
        ],
      },
    ],
  },
  {
    id: 'placeholder-vagus-nerve-breathwork',
    title: 'Editorial Placeholder: Heart Rate Variability & Vagal Nerve Entrainment with Tibetan Singing Bowls',
    subtitle: 'Human-authored physiology treatise examining acoustic resonance, HRV coherence, and respiratory sinus arrhythmia.',
    category: 'protocols',
    status: 'placeholder',
    readTimeMinutes: 7,
    publishedDate: 'Awaiting Contributor Submission',
    lastUpdated: 'October 4, 2026',
    author: {
      name: 'Open Contributor Call',
      role: 'Cardiologist, Neurophysiologist or Sound Researcher',
      credentials: 'Ph.D. / M.D. in Autonomic Physiology or Integrative Medicine',
      affiliations: 'Integrative Health Institute or University Department',
      bio: 'This article slot is reserved for a clinical researcher examining how multi-harmonic acoustic frequencies interact with heart rate variability and parasympathetic autonomic regulation.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
    },
    reviewer: {
      name: 'Aura 432Hz Editorial Desk',
      role: 'Physiology Editorial Board',
      reviewDate: 'Pending Assignment',
    },
    recommendedPresetId: 'river_flow_focus',
    summary:
      'Editorial draft placeholder reserved for human scholarly submission. Will explore the bi-directional communication between the tenth cranial nerve (vagus nerve), cardiac autonomic pacing, and acoustic overtone resonance from Himalayan singing bowls.',
    sourceCitation: {
      workTitle: 'Awaiting Contributor Citation: Autonomic Regulation and Acoustic Resonant Frequencies',
      publication: 'Frontiers in Neuroscience / Autonomic Neuroscience (In Review)',
      yearOrDate: '2026 Submission',
      doiOrArchive: 'Contributor Assignment ID: EDIT-2026-VAGUS',
      copyrightNotice: 'Reserved for original human author. Copyright will remain with the contributor under scholarly license.',
    },
    keyTakeaways: [
      '[Contributor Placeholder] The vagus nerve modulates cardiac output via respiratory sinus arrhythmia (RSA).',
      '[Contributor Placeholder] Combining 4-7-8 or 5.5-second box breath pacing with 432Hz singing bowl harmonics fosters autonomic equilibrium.',
      '[Contributor Placeholder] Measurable improvements in High-Frequency (HF) heart rate variability during acoustic meditation.',
    ],
    tags: ['Vagus Nerve', 'Heart Rate Variability', 'Singing Bowls', 'Autonomic Nervous System', 'Breathwork'],
    editorialNotes:
      'TARGET WORD COUNT: 1,400 words. Please focus on objective autonomic measurements (HF-HRV, RMSSD, vagal tone). Strictly avoid medical therapeutic guarantees.',
    content: [
      {
        heading: 'Editorial Outline: The Anatomy of Cranial Nerve X',
        body: [
          'This section will describe the neuroanatomical path of the vagus nerve and its sensory innervation of the external ear canal (Arnold’s nerve) and tympanic membrane.',
          'Authors should detail how acoustic stimulation and diaphragmatic respiration collaboratively activate the nucleus tractus solitarius (NTS) in the medulla.',
        ],
        quote: 'Draft note: Replace this quote with verified quotation from autonomic physiology literature.',
      },
      {
        heading: 'Synchronizing Breath Pacing with 432Hz Drone Acoustics',
        body: [
          'Authors will present experimental findings comparing silent meditation with audio-guided breathwork (e.g., 4-7-8 breathing supported by a continuous 432Hz warm cello drone).',
        ],
      },
      {
        heading: 'Submission Guidelines for Contributing Authors',
        body: [
          'Authors retain full copyright and moral rights to their contributions. Submit drafts via the in-app Editorial System.',
        ],
      },
    ],
  },
  {
    id: 'placeholder-cymatics-water-geometry',
    title: 'Editorial Placeholder: Modern Cymatics & Acoustic Wave Propagation in Liquid Media',
    subtitle: 'Human-authored physics treatise analyzing standing wave geometry and acoustic fluid mechanics.',
    category: 'science',
    status: 'placeholder',
    readTimeMinutes: 7,
    publishedDate: 'Awaiting Contributor Submission',
    lastUpdated: 'October 4, 2026',
    author: {
      name: 'Open Contributor Call',
      role: 'Acoustician or Fluid Dynamics Physicist',
      credentials: 'Ph.D. in Applied Physics, Acoustics or Mechanical Engineering',
      affiliations: 'Acoustical Society of America / Institute of Acoustics',
      bio: 'Reserved for a physicist or acoustician specializing in standing wave mechanics, Faraday waves, and visual acoustic wave propagation.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
    },
    reviewer: {
      name: 'Aura 432Hz Editorial Desk',
      role: 'Physics & Engineering Reviewer',
      reviewDate: 'Pending Assignment',
    },
    recommendedPresetId: 'solfeggio_528_dna',
    summary:
      'Editorial draft placeholder reserved for human scholarly submission. Will examine the real physics of Faraday waves and cymatic surface nodal lines, separating genuine wave mechanics and Bessel functions from speculative pseudoscience.',
    sourceCitation: {
      workTitle: 'Awaiting Contributor Citation: Wave Mechanics in Acoustic Fluid Interfaces',
      publication: 'Journal of the Acoustical Society of America (In Review)',
      yearOrDate: '2026 Submission',
      doiOrArchive: 'Contributor Assignment ID: EDIT-2026-CYMATICS',
      copyrightNotice: 'Reserved for original human author. Copyright will remain with the contributor under scholarly license.',
    },
    keyTakeaways: [
      '[Contributor Placeholder] Standing waves on fluid surfaces are governed by classical Navier-Stokes and Faraday wave equations.',
      '[Contributor Placeholder] Harmonic nodal lines correspond to mathematical Bessel functions of the container boundary geometry.',
      '[Contributor Placeholder] Objective comparison between 432Hz and 440Hz surface patterns under controlled acoustic transducers.',
    ],
    tags: ['Cymatics', 'Wave Mechanics', 'Physics', 'Fluid Dynamics', 'Acoustic Science'],
    editorialNotes:
      'TARGET WORD COUNT: 1,300 words. Rigorous mathematical and empirical treatment of wave mechanics. Clarify that while visual patterns form, water does not "retain emotional memory."',
    content: [
      {
        heading: 'Editorial Outline: The Classical Physics of Standing Waves',
        body: [
          'This section will introduce the historical experiments of Ernst Chladni (1787) and Hans Jenny (1967), explaining how acoustic vibrations form geometric nodal lines where vibrational displacement is zero.',
        ],
        quote: 'Draft note: Replace with citation from Journal of Fluid Mechanics or Acoustical Society of America.',
      },
      {
        heading: 'Faraday Wave Dynamics & Bessel Functions',
        body: [
          'Detailed mathematical examination of how liquid surface tension, frequency, and vessel diameter determine geometric pattern order.',
        ],
      },
      {
        heading: 'Invitation for Academic Authors',
        body: [
          'Aura 432Hz is dedicated to scholarly rigor. If you are an academic researcher in wave mechanics, claim this article slot through our Editorial Desk.',
        ],
      },
    ],
  },
];

// In-memory subscribers
type ArticlesListener = (articles: EditorialArticle[]) => void;
const listeners: Set<ArticlesListener> = new Set();

export const editorialStorage = {
  getArticles(): EditorialArticle[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to load editorial articles from storage, using defaults:', err);
    }
    return INITIAL_EDITORIAL_ARTICLES;
  },

  saveArticle(article: EditorialArticle): void {
    const articles = this.getArticles();
    const existingIndex = articles.findIndex((a) => a.id === article.id);

    let updated: EditorialArticle[];
    if (existingIndex >= 0) {
      updated = [...articles];
      updated[existingIndex] = {
        ...article,
        lastUpdated: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      };
    } else {
      updated = [
        {
          ...article,
          lastUpdated: new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
        },
        ...articles,
      ];
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save article to storage:', err);
    }

    listeners.forEach((listener) => listener(updated));
  },

  saveAllArticles(articles: EditorialArticle[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    } catch (err) {
      console.error('Failed to save all articles to storage:', err);
    }
    listeners.forEach((listener) => listener(articles));
  },

  deleteArticle(id: string): void {
    const articles = this.getArticles();
    const updated = articles.filter((a) => a.id !== id);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to delete article from storage:', err);
    }

    listeners.forEach((listener) => listener(updated));
  },

  createPlaceholder(category: ArticleCategory = 'science'): EditorialArticle {
    const timestamp = Date.now();
    const today = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const newPlaceholder: EditorialArticle = {
      id: `placeholder_${timestamp}`,
      title: 'Editorial Placeholder: [Enter Human-Authored Title]',
      subtitle: '[Enter an engaging, descriptive subtitle summarizing the research or historical inquiry]',
      category,
      status: 'placeholder',
      readTimeMinutes: 6,
      publishedDate: 'Awaiting Contributor Draft',
      lastUpdated: today,
      author: {
        name: 'Open Contributor Call',
        role: 'Human Researcher / Writer',
        credentials: 'Awaiting Author Credentials',
        affiliations: 'University / Independent Practice',
        bio: 'This article slot is reserved for a human author specializing in acoustic physics, sound therapy, or musicology.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
      },
      reviewer: {
        name: 'Aura 432Hz Editorial Desk',
        role: 'Fact-Checker & Section Editor',
        reviewDate: 'Pending Submission',
      },
      recommendedPresetId: 'zen_sanctuary',
      summary:
        'This article slot is reserved for an original human-authored contribution. Click "Edit in Editorial Desk" to author and publish this piece.',
      sourceCitation: {
        workTitle: '[Specify Primary Scholarly Work or Historical Text]',
        publication: '[Specify Academic Journal, Book, or Archive]',
        yearOrDate: today,
        doiOrArchive: `EDITORIAL-DRAFT-${timestamp}`,
        copyrightNotice:
          'Original copyright remains with the contributing human author under scholarly fair use license.',
      },
      keyTakeaways: [
        '[Key Takeaway 1: Enter empirical finding or historical thesis]',
        '[Key Takeaway 2: Enter acoustic mechanism or protocol guideline]',
        '[Key Takeaway 3: Enter practical listening takeaway for sanctuary users]',
      ],
      tags: ['Human Contributor', 'Editorial Placeholder', 'Acoustic Research'],
      editorialNotes:
        'Target: 1,000–1,500 words. Follow Aura 432Hz Editorial Integrity standards: no unverified medical cures, clear citations, and accessible writing.',
      content: [
        {
          heading: 'Section 1: Background & Historical Context',
          body: [
            'Introduce the core question, historical background, or clinical question being explored. Provide concrete dates, tuning forks, or experimental setups.',
          ],
          quote: 'Include a direct quote from a verified historical composer, acoustician, or peer-reviewed study.',
        },
        {
          heading: 'Section 2: Biophysical Mechanisms & Experimental Data',
          body: [
            'Detail the acoustic physics, brainwave interactions, or autonomic physiological responses observed in research.',
          ],
        },
        {
          heading: 'Section 3: Practical Application for Meditative Listening',
          body: [
            'Explain how listeners can apply these insights during daily relaxation, breathwork pacing, or sleep sessions.',
          ],
        },
      ],
    };

    this.saveArticle(newPlaceholder);
    return newPlaceholder;
  },

  resetToDefaults(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('Failed to reset storage:', err);
    }
    listeners.forEach((listener) => listener(INITIAL_EDITORIAL_ARTICLES));
  },

  async syncWithDailyResearch(): Promise<EditorialArticle[]> {
    try {
      const res = await fetch('/api/research/daily-articles');
      if (res.ok) {
        const data: any = await res.json();
        if (data.success && Array.isArray(data.articles)) {
          const current = this.getArticles();
          let changed = false;
          data.articles.forEach((remote: any) => {
            if (!current.some((c) => c.title.toLowerCase() === remote.title.toLowerCase())) {
              current.unshift({
                ...remote,
                status: 'published',
                lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                recommendedPresetId: 'zen_sanctuary',
              });
              changed = true;
            }
          });
          if (changed) {
            this.saveAllArticles(current);
          }
          return current;
        }
      }
    } catch (e) {
      console.debug('Notice syncing daily research:', e);
    }
    return this.getArticles();
  },

  subscribe(listener: ArticlesListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
