export interface Question {
  id: number;
  text: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  weight: number;
}

export const questions: Question[] = [
  {
    id: 1,
    text: "After a long week, I'd rather hit up a party with friends than chill alone at home.",
    dimension: 'EI',
    weight: 1,
  },
  {
    id: 2,
    text: "I trust my gut feelings more than cold, hard facts when making decisions.",
    dimension: 'SN',
    weight: 1,
  },
  {
    id: 3,
    text: "When a friend is upset, I focus on solving their problem rather than just listening.",
    dimension: 'TF',
    weight: 1,
  },
  {
    id: 4,
    text: "I like to have my day planned out rather than going with the flow.",
    dimension: 'JP',
    weight: 1,
  },
  {
    id: 5,
    text: "I get energized by being around lots of people and social situations.",
    dimension: 'EI',
    weight: 1,
  },
  {
    id: 6,
    text: "I'm more interested in future possibilities than what's happening right now.",
    dimension: 'SN',
    weight: 1,
  },
  {
    id: 7,
    text: "I'd rather be respected for my logic than loved for my empathy.",
    dimension: 'TF',
    weight: 1,
  },
  {
    id: 8,
    text: "Deadlines stress me out—I work better when I can be spontaneous.",
    dimension: 'JP',
    weight: -1,
  },
  {
    id: 9,
    text: "I tend to think out loud and process ideas by talking them through.",
    dimension: 'EI',
    weight: 1,
  },
  {
    id: 10,
    text: "I notice small details—like if someone changed their hair or moved furniture.",
    dimension: 'SN',
    weight: -1,
  },
  {
    id: 11,
    text: "In an argument, I prioritize being fair over being kind.",
    dimension: 'TF',
    weight: 1,
  },
  {
    id: 12,
    text: "I love making to-do lists and checking things off as I finish them.",
    dimension: 'JP',
    weight: 1,
  },
  {
    id: 13,
    text: "I need alone time to recharge, even if I had fun socializing.",
    dimension: 'EI',
    weight: -1,
  },
  {
    id: 14,
    text: "I daydream a lot about abstract concepts and big-picture ideas.",
    dimension: 'SN',
    weight: 1,
  },
  {
    id: 15,
    text: "I can set aside my feelings to make the most logical choice.",
    dimension: 'TF',
    weight: 1,
  },
  {
    id: 16,
    text: "I prefer to keep my options open rather than commit to a strict plan.",
    dimension: 'JP',
    weight: -1,
  },
  {
    id: 17,
    text: "I'm comfortable striking up conversations with strangers.",
    dimension: 'EI',
    weight: 1,
  },
  {
    id: 18,
    text: "I'm practical and prefer tried-and-true methods over experimental ones.",
    dimension: 'SN',
    weight: -1,
  },
  {
    id: 19,
    text: "People describe me as warm and considerate rather than analytical.",
    dimension: 'TF',
    weight: -1,
  },
  {
    id: 20,
    text: "I feel uncomfortable when things are messy or unorganized.",
    dimension: 'JP',
    weight: 1,
  },
];
