// import { derive } from "derive-valtio";
import * as Lucide from "lucide-react";
import { nanoid } from "nanoid";
import { Fragment, useCallback } from "react";
import { proxy, useSnapshot } from "valtio";
import { Zod, z } from "./helper/zod";

const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  subtotal: z.number().optional(),
});

const SubsectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.array(ItemSchema).optional(),
  subtotal: z.number().optional(),
});

const SectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  subsections: z.array(SubsectionSchema).optional(),
  subtotal: z.number().optional(),
});

const BoardSchema = z.object({
  title: z.string(),
  sections: z.array(SectionSchema).optional(),
  subtotal: z.number().optional(),
});

type Board = z.infer<typeof BoardSchema>;

const exampleBoard = Zod.parse(BoardSchema, {
  title: "Beispielkalkulation",
  sections: [
    {
      id: nanoid(10),
      name: "Gagen",
      subtotal: 7300,
      subsections: [
        {
          id: nanoid(10),
          name: "Produktionsstab",
          subtotal: 2700,
          items: [
            { id: nanoid(10), name: "Produzent", subtotal: 1000 },
            { id: nanoid(10), name: "Produktionsleitung", subtotal: 900 },
            { id: nanoid(10), name: "1. Aufnahmeleitung", subtotal: 800 },
          ],
        },
        {
          id: nanoid(10),
          name: "Regiestab",
          subtotal: 2700,
          items: [
            { id: nanoid(10), name: "Regie", subtotal: 1000 },
            { id: nanoid(10), name: "1. Regieassistenz", subtotal: 900 },
            { id: nanoid(10), name: "Script / Continuity", subtotal: 800 },
          ],
        },
        {
          id: nanoid(10),
          name: "Kamerastab",
          subtotal: 1900,
          items: [
            { id: nanoid(10), name: "Kamera", subtotal: 1000 },
            { id: nanoid(10), name: "1. Kameraassistenz", subtotal: 900 },
          ],
        },
      ],
    },
  ],
});

const appState = proxy(exampleBoard);

const moneyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
});

export const App = () => {
  const title = useSnapshot(appState).title;
  const sections = appState.sections;

  return (
    <div className="relative font-sans min-h-dvh bg-[#F5F3EF] font-[400]">
      <div className="p-4 bg-[#FFFFFF] text-[#0F203C] font-[600]">
        <span>{title}</span>
      </div>

      <div className="p-4 text-[#0F203C]">
        <Board>
          {sections?.map((section) => {
            return (
              <Fragment key={section.id}>
                <Section section={section} />
                {section.subsections?.map((subsection) => {
                  return (
                    <Fragment key={subsection.id}>
                      <Subsection subsection={subsection}></Subsection>
                      <Group>
                        {subsection.items?.map((item) => {
                          return <Item key={item.id} item={item} />;
                        })}
                      </Group>
                    </Fragment>
                  );
                })}
              </Fragment>
            );
          })}
        </Board>
      </div>
    </div>
  );
};

type BoardProps = {
  children?: React.ReactNode;
};

const Board = ({ children }: BoardProps) => {
  return (
    <div className="mx-auto max-w-[800px] bg-[#ECE7DE] px-4 pb-4 box-content rounded-lg">
      {children}
    </div>
  );
};

type GroupProps = {
  children?: React.ReactNode;
};

const Group = ({ children }: GroupProps) => {
  return <div className="bg-[#FFFFFF] rounded-lg">{children}</div>;
};

type SectionProps = {
  section: z.infer<typeof SectionSchema>;
};

const Section = (props: SectionProps) => {
  const name = useSnapshot(props.section).name;
  const subtotal = useSnapshot(props.section).subtotal ?? 0;

  return (
    <div className="flex items-center justify-between border-b border-[#B8AE9C] py-4 px-2 pr-3">
      <div className="font-[600] flex items-center gap-2">
        <Lucide.ChevronDown size={18} />
        <span>{name}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="font-[600] text-sm tabular-nums">{moneyFormat.format(subtotal)}</div>
        <Lucide.Trash2 size={18} />
      </div>
    </div>
  );
};

type SubsectionProps = {
  subsection: z.infer<typeof SubsectionSchema>;
};

const Subsection = (props: SubsectionProps) => {
  const name = useSnapshot(props.subsection).name;
  const subtotal = useSnapshot(props.subsection).subtotal ?? 0;

  return (
    <div className="flex items-center justify-between py-4 px-2 pr-3">
      <div className="flex items-center gap-2">
        <Lucide.ChevronDown size={18} />
        <span>{name}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="font-[600] text-sm tabular-nums">{moneyFormat.format(subtotal)}</div>
        <Lucide.Trash2 size={18} />
      </div>
    </div>
  );
};
type ItemProps = {
  item: z.infer<typeof ItemSchema>;
};

const Item = (props: ItemProps) => {
  const name = useSnapshot(props.item).name;
  const subtotal = useSnapshot(props.item).subtotal ?? 0;
  const onChangeSubtotal = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(event.currentTarget.value);
      const number = isNaN(value) ? 0 : value;
      props.item.subtotal = number;
    },
    [props.item]
  );

  return (
    <div className="flex items-center justify-between py-2 px-2 pr-3">
      <div className="flex items-center gap-2">
        <Lucide.GripVertical className="text-[#918D85]" size={18} />
        <div className="grid grid-flow-col auto-cols-max">
          <label>
            <div className="text-xs text-[#1C4E88] font-[600]">Description</div>
            <input
              className="pr-2 mr-4 max-w-[220px] border-r border-[#888A90]"
              defaultValue={name}
            />
          </label>

          <label>
            <div className="text-xs text-[#1C4E88] font-[600]">Amount</div>
            <input className="pr-2 mr-4 max-w-[80px] border-r border-[#888A90]" defaultValue="1" />
          </label>

          <label>
            <div className="text-xs text-[#1C4E88] font-[600]">Days</div>
            <input className="pr-2 mr-4 max-w-[80px] border-r border-[#888A90]" defaultValue="1" />
          </label>

          <label>
            <div className="text-xs text-[#1C4E88] font-[600]">Price/Unit</div>
            <input
              className="pr-2 mr-4 max-w-[120px] border-r-0 border-[#888A90]"
              value={subtotal}
              onChange={onChangeSubtotal}
            />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="font-[600] text-sm tabular-nums">{moneyFormat.format(subtotal)}</div>
        <Lucide.X size={18} />
      </div>
    </div>
  );
};
