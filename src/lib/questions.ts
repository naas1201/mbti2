export interface Question {
  id: number;
  text: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  weight: number;
}

export const questions: Question[] = [
  // Extraversion (E) vs Introversion (I) - 15 questions
  {
    id: 1,
    text: "After a long week, I'd rather hit up a party with friends than chill alone at home.",
    dimension: 'EI',
    weight: 1.2,
  },
  {
    id: 2,
    text: "I get energized by being around lots of people and social situations.",
    dimension: 'EI',
    weight: 1.0,
  },
  {
    id: 3,
    text: "I tend to think out loud and process ideas by talking them through.",
    dimension: 'EI',
    weight: 0.8,
  },
  {
    id: 4,
    text: "I need alone time to recharge, even if I had fun socializing.",
    dimension: 'EI',
    weight: -1.0,
  },
  {
    id: 5,
    text: "I'm comfortable striking up conversations with strangers.",
    dimension: 'EI',
    weight: 1.1,
  },
  {
    id: 6,
    text: "I prefer one-on-one conversations over group discussions.",
    dimension: 'EI',
    weight: -0.9,
  },
  {
    id: 7,
    text: "Social events drain my energy rather than energize me.",
    dimension: 'EI',
    weight: -1.2,
  },
  {
    id: 8,
    text: "I enjoy being the center of attention in social settings.",
    dimension: 'EI',
    weight: 1.3,
  },
  {
    id: 9,
    text: "I process my thoughts internally before sharing them with others.",
    dimension: 'EI',
    weight: -0.8,
  },
  {
    id: 10,
    text: "I have a wide circle of acquaintances and enjoy meeting new people.",
    dimension: 'EI',
    weight: 1.0,
  },
  {
    id: 11,
    text: "I prefer deep conversations with a few close friends over small talk with many.",
    dimension: 'EI',
    weight: -1.1,
  },
  {
    id: 12,
    text: "I often take initiative in social situations and group activities.",
    dimension: 'EI',
    weight: 1.2,
  },
  {
    id: 13,
    text: "I need time to think before responding in conversations.",
    dimension: 'EI',
    weight: -0.7,
  },
  {
    id: 14,
    text: "I enjoy networking events and meeting new professional contacts.",
    dimension: 'EI',
    weight: 1.1,
  },
  {
    id: 15,
    text: "I feel most comfortable and authentic when I'm by myself.",
    dimension: 'EI',
    weight: -1.3,
  },

  // Sensing (S) vs Intuition (N) - 15 questions
  {
    id: 16,
    text: "I trust my gut feelings more than cold, hard facts when making decisions.",
    dimension: 'SN',
    weight: 1.2,
  },
  {
    id: 17,
    text: "I'm more interested in future possibilities than what's happening right now.",
    dimension: 'SN',
    weight: 1.0,
  },
  {
    id: 18,
    text: "I notice small details—like if someone changed their hair or moved furniture.",
    dimension: 'SN',
    weight: -1.1,
  },
  {
    id: 19,
    text: "I daydream a lot about abstract concepts and big-picture ideas.",
    dimension: 'SN',
    weight: 1.3,
  },
  {
    id: 20,
    text: "I'm practical and prefer tried-and-true methods over experimental ones.",
    dimension: 'SN',
    weight: -0.9,
  },
  {
    id: 21,
    text: "I enjoy brainstorming and coming up with creative, unconventional ideas.",
    dimension: 'SN',
    weight: 1.2,
  },
  {
    id: 22,
    text: "I prefer concrete facts over abstract theories.",
    dimension: 'SN',
    weight: -1.0,
  },
  {
    id: 23,
    text: "I often see patterns and connections that others miss.",
    dimension: 'SN',
    weight: 1.1,
  },
  {
    id: 24,
    text: "I focus on what is rather than what could be.",
    dimension: 'SN',
    weight: -0.8,
  },
  {
    id: 25,
    text: "I enjoy thinking about philosophical questions and existential concepts.",
    dimension: 'SN',
    weight: 1.3,
  },
  {
    id: 26,
    text: "I prefer step-by-step instructions over figuring things out on my own.",
    dimension: 'SN',
    weight: -1.1,
  },
  {
    id: 27,
    text: "I'm good at reading between the lines and understanding hidden meanings.",
    dimension: 'SN',
    weight: 1.0,
  },
  {
    id: 28,
    text: "I trust my five senses more than my intuition.",
    dimension: 'SN',
    weight: -1.2,
  },
  {
    id: 29,
    text: "I enjoy exploring new theories and concepts just for the sake of learning.",
    dimension: 'SN',
    weight: 1.1,
  },
  {
    id: 30,
    text: "I prefer dealing with reality as it is rather than imagining alternatives.",
    dimension: 'SN',
    weight: -0.9,
  },

  // Thinking (T) vs Feeling (F) - 15 questions
  {
    id: 31,
    text: "When a friend is upset, I focus on solving their problem rather than just listening.",
    dimension: 'TF',
    weight: 1.0,
  },
  {
    id: 32,
    text: "I'd rather be respected for my logic than loved for my empathy.",
    dimension: 'TF',
    weight: 1.2,
  },
  {
    id: 33,
    text: "In an argument, I prioritize being fair over being kind.",
    dimension: 'TF',
    weight: 1.1,
  },
  {
    id: 34,
    text: "I can set aside my feelings to make the most logical choice.",
    dimension: 'TF',
    weight: 1.3,
  },
  {
    id: 35,
    text: "People describe me as warm and considerate rather than analytical.",
    dimension: 'TF',
    weight: -1.0,
  },
  {
    id: 36,
    text: "I make decisions based on objective criteria rather than personal values.",
    dimension: 'TF',
    weight: 1.2,
  },
  {
    id: 37,
    text: "I'm sensitive to other people's feelings and emotional states.",
    dimension: 'TF',
    weight: -1.1,
  },
  {
    id: 38,
    text: "I believe truth is more important than tact in most situations.",
    dimension: 'TF',
    weight: 1.0,
  },
  {
    id: 39,
    text: "I often consider how my decisions will affect others emotionally.",
    dimension: 'TF',
    weight: -1.3,
  },
  {
    id: 40,
    text: "I value justice and fairness over harmony and peace.",
    dimension: 'TF',
    weight: 1.1,
  },
  {
    id: 41,
    text: "I'm good at comforting people and providing emotional support.",
    dimension: 'TF',
    weight: -0.9,
  },
  {
    id: 42,
    text: "I prefer analyzing problems objectively rather than considering personal factors.",
    dimension: 'TF',
    weight: 1.2,
  },
  {
    id: 43,
    text: "I often put others' needs before my own.",
    dimension: 'TF',
    weight: -1.0,
  },
  {
    id: 44,
    text: "I believe constructive criticism is more valuable than unconditional support.",
    dimension: 'TF',
    weight: 1.1,
  },
  {
    id: 45,
    text: "I'm motivated by creating positive emotional experiences for others.",
    dimension: 'TF',
    weight: -1.2,
  },

  // Judging (J) vs Perceiving (P) - 15 questions
  {
    id: 46,
    text: "I like to have my day planned out rather than going with the flow.",
    dimension: 'JP',
    weight: 1.2,
  },
  {
    id: 47,
    text: "Deadlines stress me out—I work better when I can be spontaneous.",
    dimension: 'JP',
    weight: -1.1,
  },
  {
    id: 48,
    text: "I love making to-do lists and checking things off as I finish them.",
    dimension: 'JP',
    weight: 1.3,
  },
  {
    id: 49,
    text: "I prefer to keep my options open rather than commit to a strict plan.",
    dimension: 'JP',
    weight: -1.0,
  },
  {
    id: 50,
    text: "I feel uncomfortable when things are messy or unorganized.",
    dimension: 'JP',
    weight: 1.1,
  },
  {
    id: 51,
    text: "I enjoy the freedom of last-minute changes and improvisation.",
    dimension: 'JP',
    weight: -1.2,
  },
  {
    id: 52,
    text: "I prefer clear deadlines and structured schedules.",
    dimension: 'JP',
    weight: 1.0,
  },
  {
    id: 53,
    text: "I work best under pressure and tight deadlines.",
    dimension: 'JP',
    weight: -0.9,
  },
  {
    id: 54,
    text: "I like to have a clear plan before starting any project.",
    dimension: 'JP',
    weight: 1.2,
  },
  {
    id: 55,
    text: "I enjoy exploring new opportunities as they arise rather than sticking to a plan.",
    dimension: 'JP',
    weight: -1.1,
  },
  {
    id: 56,
    text: "I'm good at following through on commitments and finishing what I start.",
    dimension: 'JP',
    weight: 1.3,
  },
  {
    id: 57,
    text: "I prefer flexible schedules that allow for spontaneity.",
    dimension: 'JP',
    weight: -1.0,
  },
  {
    id: 58,
    text: "I feel stressed when things are uncertain or ambiguous.",
    dimension: 'JP',
    weight: 1.1,
  },
  {
    id: 59,
    text: "I enjoy adapting to new information and changing my approach.",
    dimension: 'JP',
    weight: -1.2,
  },
  {
    id: 60,
    text: "I believe structure and organization lead to better outcomes.",
    dimension: 'JP',
    weight: 1.0,
  },
];
