import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    permalink: z.string(), // The URL slug for this post
    date: z.string().transform((str) => new Date(str)),
    episode: z.number().optional(),
    youtubeId: z.string().optional(),
    slides: z.array(z.object({
      name: z.string(),
      url: z.string(),
    })).optional(),
  }),
});

export const collections = { blog };
