import { derive } from "derive-valtio";
import { nanoid } from "nanoid";
import { proxy } from "valtio";
import { z } from "zod";
import { Zod } from "./helper/zod";

export const ItemSchema = Zod.object("Item", {
  id: z.string(),
  name: z.string(),
  subtotal: z.number(),
});

export const SubsectionSchema = Zod.object("Subsection", {
  id: z.string(),
  name: z.string(),
  items: z.array(ItemSchema).default([]),
  subtotal: z.number().optional(),
  isCollapsed: z.boolean().optional(),
});

export const SectionSchema = Zod.object("Section", {
  id: z.string(),
  name: z.string(),
  subsections: z.array(SubsectionSchema).default([]),
  subtotal: z.number().optional(),
  isCollapsed: z.boolean().optional(),
});

export const BoardSchema = Zod.object("Board", {
  title: z.string(),
  sections: z.array(SectionSchema).default([]),
  subtotal: z.number().optional(),
});

export type Board = z.infer<typeof BoardSchema>;

const boardFixture = Zod.parseStrict(BoardSchema, {
  title: "Beispielkalkulation",
  sections: [
    {
      id: nanoid(10),
      name: "Gagen",
      subsections: [
        {
          id: nanoid(10),
          name: "Produktionsstab",
          items: [
            { id: nanoid(10), name: "Produzent", subtotal: 1000 },
            { id: nanoid(10), name: "Produktionsleitung", subtotal: 900 },
            { id: nanoid(10), name: "1. Aufnahmeleitung", subtotal: 800 },
          ],
        },
        {
          id: nanoid(10),
          name: "Regiestab",
          items: [
            { id: nanoid(10), name: "Regie", subtotal: 1000 },
            { id: nanoid(10), name: "1. Regieassistenz", subtotal: 900 },
            { id: nanoid(10), name: "Script / Continuity", subtotal: 800 },
          ],
        },
        {
          id: nanoid(10),
          name: "Kamerastab",
          items: [
            { id: nanoid(10), name: "Kamera", subtotal: 1000 },
            { id: nanoid(10), name: "1. Kameraassistenz", subtotal: 900 },
          ],
        },
      ],
    },
  ],
});

export const deriveBoard = (board: z.infer<typeof BoardSchema>) => {
  console.log("deriveBoard", board);
  return derive(
    {
      subtotal(get) {
        let sum = 0;
        for (const section of get(board).sections) {
          sum += get(section).subtotal ?? 0;
        }
        return sum;
      },
    },
    { proxy: board }
  );
};

export const deriveSection = (section: z.infer<typeof SectionSchema>) => {
  console.log("deriveSection", section);
  return derive(
    {
      subtotal(get) {
        let sum = 0;
        for (const subsection of get(section).subsections) {
          sum += get(subsection).subtotal ?? 0;
        }
        return sum;
      },
    },
    { proxy: section }
  );
};

export const deriveSubsection = (subsection: z.infer<typeof SubsectionSchema>) => {
  console.log("deriveSubsection", subsection);
  return derive(
    {
      subtotal(get) {
        let sum = 0;
        for (const item of get(subsection).items) {
          sum += get(item).subtotal ?? 0;
        }
        return sum;
      },
    },
    { proxy: subsection }
  );
};

export const createStore = () => {
  console.log("createStore");
  const numOfSections = 2;
  boardFixture.sections = Array.from({ length: numOfSections }).flatMap(() => {
    return structuredClone(
      boardFixture.sections.map((section) => ({ ...section, id: nanoid(20) }))
    );
  });

  let board = proxy(boardFixture);
  board = deriveBoard(board);
  board.sections = board.sections.map(deriveSection);
  for (const section of board.sections) {
    section.subsections = section.subsections.map(deriveSubsection);
  }

  return { board };
};

export const store = createStore();
