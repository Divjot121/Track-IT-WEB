import { Subject } from '@/lib/types';

export const SEED_SUBJECTS: Subject[] = [
  {
    id: 'maths-standard',
    name: 'Mathematics (Standard)',
    code: '041',
    iconName: 'Calculator',
    color: '#6366F1', // Indigo
    totalMarks: 80,
    units: [
      {
        id: 'maths-u1',
        title: 'Number Systems',
        marksWeightage: 6,
        chapters: [
          { id: 'maths-real-numbers', title: 'Real Numbers', defaultStatus: 'not-started' },
        ],
      },
      {
        id: 'maths-u2',
        title: 'Algebra',
        marksWeightage: 20,
        chapters: [
          { id: 'maths-polynomials', title: 'Polynomials', defaultStatus: 'not-started' },
          { id: 'maths-linear-equations', title: 'Pair of Linear Equations in Two Variables', defaultStatus: 'not-started' },
          { id: 'maths-quadratic-equations', title: 'Quadratic Equations', defaultStatus: 'not-started' },
          { id: 'maths-arithmetic-progressions', title: 'Arithmetic Progressions', defaultStatus: 'not-started' },
        ],
      },
      {
        id: 'maths-u3',
        title: 'Coordinate Geometry',
        marksWeightage: 6,
        chapters: [
          { id: 'maths-coordinate-geometry', title: 'Coordinate Geometry', defaultStatus: 'not-started' },
        ],
      },
      {
        id: 'maths-u4',
        title: 'Geometry',
        marksWeightage: 15,
        chapters: [
          { id: 'maths-triangles', title: 'Triangles', defaultStatus: 'not-started' },
          { id: 'maths-circles', title: 'Circles', defaultStatus: 'not-started' },
        ],
      },
      {
        id: 'maths-u5',
        title: 'Trigonometry',
        marksWeightage: 12,
        chapters: [
          { id: 'maths-intro-trigonometry', title: 'Introduction to Trigonometry', defaultStatus: 'not-started' },
          { id: 'maths-applications-trigonometry', title: 'Some Applications of Trigonometry', defaultStatus: 'not-started' },
        ],
      },
      {
        id: 'maths-u6',
        title: 'Mensuration',
        marksWeightage: 10,
        chapters: [
          { id: 'maths-areas-circles', title: 'Areas Related to Circles', defaultStatus: 'not-started' },
          { id: 'maths-surface-areas-volumes', title: 'Surface Areas and Volumes', defaultStatus: 'not-started' },
        ],
      },
      {
        id: 'maths-u7',
        title: 'Statistics & Probability',
        marksWeightage: 11,
        chapters: [
          { id: 'maths-statistics', title: 'Statistics', defaultStatus: 'not-started' },
          { id: 'maths-probability', title: 'Probability', defaultStatus: 'not-started' },
        ],
      },
    ],
  },
  {
    id: 'science',
    name: 'Science',
    code: '086',
    iconName: 'Atom',
    color: '#10B981', // Emerald
    totalMarks: 80,
    units: [
      {
        id: 'sci-u1',
        title: 'Chemical Substances — Nature and Behaviour',
        marksWeightage: 25,
        chapters: [
          { id: 'sci-chemical-reactions', title: 'Chemical Reactions and Equations', defaultStatus: 'not-started' },
          { id: 'sci-acids-bases-salts', title: 'Acids, Bases and Salts', defaultStatus: 'not-started' },
          { id: 'sci-metals-non-metals', title: 'Metals and Non-metals', defaultStatus: 'not-started' },
          { id: 'sci-carbon-compounds', title: 'Carbon and its Compounds', defaultStatus: 'not-started' },
        ],
      },
      {
        id: 'sci-u2',
        title: 'World of Living',
        marksWeightage: 25,
        chapters: [
          { id: 'sci-life-processes', title: 'Life Processes', defaultStatus: 'not-started' },
          { id: 'sci-control-coordination', title: 'Control and Coordination', defaultStatus: 'not-started' },
          { id: 'sci-how-organisms-reproduce', title: 'How do Organisms Reproduce?', defaultStatus: 'not-started' },
          { id: 'sci-heredity', title: 'Heredity', defaultStatus: 'not-started' },
        ],
      },
      {
        id: 'sci-u3',
        title: 'Natural Phenomena',
        marksWeightage: 12,
        chapters: [
          { id: 'sci-light-reflection-refraction', title: 'Light — Reflection and Refraction', defaultStatus: 'not-started' },
          { id: 'sci-human-eye-colourful-world', title: 'The Human Eye and the Colourful World', defaultStatus: 'not-started' },
        ],
      },
      {
        id: 'sci-u4',
        title: 'Effects of Current',
        marksWeightage: 13,
        chapters: [
          { id: 'sci-electricity', title: 'Electricity', defaultStatus: 'not-started' },
          { id: 'sci-magnetic-effects', title: 'Magnetic Effects of Electric Current', defaultStatus: 'not-started' },
        ],
      },
      {
        id: 'sci-u5',
        title: 'Natural Resources',
        marksWeightage: 5,
        chapters: [
          { id: 'sci-our-environment', title: 'Our Environment', defaultStatus: 'not-started' },
        ],
      },
    ],
  },
  {
    id: 'social-science',
    name: 'Social Science',
    code: '087',
    iconName: 'Globe',
    color: '#F59E0B', // Amber
    totalMarks: 80,
    units: [
      {
        id: 'sst-u1',
        title: 'History (India and the Contemporary World-II)',
        marksWeightage: 20,
        chapters: [
          { id: 'sst-hist-nationalism-europe', title: 'The Rise of Nationalism in Europe', defaultStatus: 'not-started' },
          { id: 'sst-hist-nationalism-india', title: 'Nationalism in India', defaultStatus: 'not-started' },
          { id: 'sst-hist-global-world', title: 'The Making of a Global World', defaultStatus: 'not-started' },
          { id: 'sst-hist-industrialisation', title: 'The Age of Industrialisation', defaultStatus: 'not-started' },
          { id: 'sst-hist-print-culture', title: 'Print Culture and the Modern World', defaultStatus: 'not-started' },
        ],
      },
      {
        id: 'sst-u2',
        title: 'Geography (Contemporary India-II)',
        marksWeightage: 20,
        chapters: [
          { id: 'sst-geo-resources-development', title: 'Resources and Development', defaultStatus: 'not-started' },
          { id: 'sst-geo-forest-wildlife', title: 'Forest and Wildlife Resources', defaultStatus: 'not-started' },
          { id: 'sst-geo-water-resources', title: 'Water Resources', defaultStatus: 'not-started' },
          { id: 'sst-geo-agriculture', title: 'Agriculture', defaultStatus: 'not-started' },
          { id: 'sst-geo-minerals-energy', title: 'Minerals and Energy Resources', defaultStatus: 'not-started' },
          { id: 'sst-geo-manufacturing', title: 'Manufacturing Industries', defaultStatus: 'not-started' },
          { id: 'sst-geo-lifelines', title: 'Lifelines of National Economy', defaultStatus: 'not-started' },
        ],
      },
      {
        id: 'sst-u3',
        title: 'Political Science (Democratic Politics-II)',
        marksWeightage: 20,
        chapters: [
          { id: 'sst-pol-power-sharing', title: 'Power-sharing', defaultStatus: 'not-started' },
          { id: 'sst-pol-federalism', title: 'Federalism', defaultStatus: 'not-started' },
          { id: 'sst-pol-democracy-diversity', title: 'Democracy and Diversity', defaultStatus: 'not-started' },
          { id: 'sst-pol-gender-religion-caste', title: 'Gender, Religion and Caste', defaultStatus: 'not-started' },
          { id: 'sst-pol-popular-struggles', title: 'Popular Struggles and Movements', defaultStatus: 'not-started' },
          { id: 'sst-pol-political-parties', title: 'Political Parties', defaultStatus: 'not-started' },
          { id: 'sst-pol-outcomes-democracy', title: 'Outcomes of Democracy', defaultStatus: 'not-started' },
          { id: 'sst-pol-challenges-democracy', title: 'Challenges to Democracy', defaultStatus: 'not-started' },
        ],
      },
      {
        id: 'sst-u4',
        title: 'Economics (Understanding Economic Development)',
        marksWeightage: 20,
        chapters: [
          { id: 'sst-eco-development', title: 'Development', defaultStatus: 'not-started' },
          { id: 'sst-eco-sectors', title: 'Sectors of the Indian Economy', defaultStatus: 'not-started' },
          { id: 'sst-eco-money-credit', title: 'Money and Credit', defaultStatus: 'not-started' },
          { id: 'sst-eco-globalisation', title: 'Globalisation and the Indian Economy', defaultStatus: 'not-started' },
          { id: 'sst-eco-consumer-rights', title: 'Consumer Rights', defaultStatus: 'not-started' },
        ],
      },
    ],
  },
  {
    id: 'english',
    name: 'English (Language and Literature)',
    code: '184',
    iconName: 'BookOpen',
    color: '#EC4899', // Pink
    totalMarks: 80,
    units: [
      {
        id: 'eng-u1',
        title: 'First Flight — Prose',
        marksWeightage: 25,
        chapters: [
          { id: 'eng-letter-to-god', title: 'A Letter to God', defaultStatus: 'not-started' },
          { id: 'eng-nelson-mandela', title: 'Nelson Mandela: Long Walk to Freedom', defaultStatus: 'not-started' },
          { id: 'eng-two-stories-flying', title: 'Two Stories about Flying', defaultStatus: 'not-started' },
          { id: 'eng-anne-frank', title: 'From the Diary of Anne Frank', defaultStatus: 'not-started' },
          { id: 'eng-glimpses-of-india', title: 'Glimpses of India', defaultStatus: 'not-started' },
          { id: 'eng-mijbil-otter', title: 'Mijbil the Otter', defaultStatus: 'not-started' },
          { id: 'eng-madam-rides-bus', title: 'Madam Rides the Bus', defaultStatus: 'not-started' },
          { id: 'eng-sermon-benares', title: 'The Sermon at Benares', defaultStatus: 'not-started' },
          { id: 'eng-the-proposal', title: 'The Proposal', defaultStatus: 'not-started' },
        ],
      },
      {
        id: 'eng-u2',
        title: 'First Flight — Poetry',
        marksWeightage: 15,
        chapters: [
          { id: 'eng-dust-of-snow', title: 'Dust of Snow', defaultStatus: 'not-started' },
          { id: 'eng-fire-and-ice', title: 'Fire and Ice', defaultStatus: 'not-started' },
          { id: 'eng-tiger-in-zoo', title: 'A Tiger in the Zoo', defaultStatus: 'not-started' },
          { id: 'eng-how-to-tell-animals', title: 'How to Tell Wild Animals', defaultStatus: 'not-started' },
          { id: 'eng-the-ball-poem', title: 'The Ball Poem', defaultStatus: 'not-started' },
          { id: 'eng-amanda', title: 'Amanda', defaultStatus: 'not-started' },
          { id: 'eng-the-trees', title: 'The Trees', defaultStatus: 'not-started' },
          { id: 'eng-fog', title: 'Fog', defaultStatus: 'not-started' },
          { id: 'eng-custard-the-dragon', title: 'The Tale of Custard the Dragon', defaultStatus: 'not-started' },
          { id: 'eng-for-anne-gregory', title: 'For Anne Gregory', defaultStatus: 'not-started' },
        ],
      },
      {
        id: 'eng-u3',
        title: 'Footprints Without Feet (Supplementary Reader)',
        marksWeightage: 40,
        chapters: [
          { id: 'eng-triumph-surgery', title: 'A Triumph of Surgery', defaultStatus: 'not-started' },
          { id: 'eng-thief-story', title: "The Thief's Story", defaultStatus: 'not-started' },
          { id: 'eng-midnight-visitor', title: 'The Midnight Visitor', defaultStatus: 'not-started' },
          { id: 'eng-question-of-trust', title: 'A Question of Trust', defaultStatus: 'not-started' },
          { id: 'eng-footprints-without-feet', title: 'Footprints without Feet', defaultStatus: 'not-started' },
          { id: 'eng-making-of-scientist', title: 'The Making of a Scientist', defaultStatus: 'not-started' },
          { id: 'eng-the-necklace', title: 'The Necklace', defaultStatus: 'not-started' },
          { id: 'eng-bholi', title: 'Bholi', defaultStatus: 'not-started' },
          { id: 'eng-book-saved-earth', title: 'The Book that Saved the Earth', defaultStatus: 'not-started' },
        ],
      },
    ],
  },
  {
    id: 'hindi',
    name: 'Hindi (Course A / B)',
    code: '002',
    iconName: 'Languages',
    color: '#8B5CF6', // Purple
    totalMarks: 80,
    units: [
      {
        id: 'hin-u1',
        title: 'Section A — Reading & Grammar (Placeholder)',
        marksWeightage: 30,
        chapters: [
          { id: 'hin-stub-1', title: 'Hindi Chapter 1 (Placeholder Stub)', defaultStatus: 'not-started', isStub: true },
          { id: 'hin-stub-2', title: 'Hindi Chapter 2 (Placeholder Stub)', defaultStatus: 'not-started', isStub: true },
          { id: 'hin-stub-3', title: 'Hindi Chapter 3 (Placeholder Stub)', defaultStatus: 'not-started', isStub: true },
        ],
      },
      {
        id: 'hin-u2',
        title: 'Section B — Literature & Writing (Placeholder)',
        marksWeightage: 50,
        chapters: [
          { id: 'hin-stub-4', title: 'Hindi Literature 1 (Placeholder Stub)', defaultStatus: 'not-started', isStub: true },
          { id: 'hin-stub-5', title: 'Hindi Literature 2 (Placeholder Stub)', defaultStatus: 'not-started', isStub: true },
        ],
      },
    ],
  },
  {
    id: 'computer-applications',
    name: 'Computer Applications',
    code: '165',
    iconName: 'Laptop',
    color: '#06B6D4', // Cyan
    totalMarks: 50,
    units: [
      {
        id: 'ca-u1',
        title: 'Unit 1 — Networking & Web (Placeholder)',
        marksWeightage: 25,
        chapters: [
          { id: 'ca-stub-1', title: 'Computer App Topic 1 (Placeholder Stub)', defaultStatus: 'not-started', isStub: true },
          { id: 'ca-stub-2', title: 'Computer App Topic 2 (Placeholder Stub)', defaultStatus: 'not-started', isStub: true },
        ],
      },
      {
        id: 'ca-u2',
        title: 'Unit 2 — HTML & Cyberethics (Placeholder)',
        marksWeightage: 25,
        chapters: [
          { id: 'ca-stub-3', title: 'Computer App Topic 3 (Placeholder Stub)', defaultStatus: 'not-started', isStub: true },
          { id: 'ca-stub-4', title: 'Computer App Topic 4 (Placeholder Stub)', defaultStatus: 'not-started', isStub: true },
        ],
      },
    ],
  },
];
