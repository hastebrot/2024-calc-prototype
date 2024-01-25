import { clsx } from "clsx";
import { derive } from "derive-valtio";
import { icons } from "lucide-react";
import { nanoid } from "nanoid";
import { Fragment, Profiler, memo, useCallback } from "react";
import { proxy, useSnapshot } from "valtio";
import { deepClone } from "valtio/utils";
import { Zod, z } from "./helper/zod";

const ItemSchema = Zod.object("Item", {
  id: z.string(),
  name: z.string(),
  subtotal: z.number(),
});

const SubsectionSchema = Zod.object("Subsection", {
  id: z.string(),
  name: z.string(),
  items: z.array(ItemSchema).default([]),
  subtotal: z.number().optional(),
  isCollapsed: z.boolean().optional(),
});

const SectionSchema = Zod.object("Section", {
  id: z.string(),
  name: z.string(),
  subsections: z.array(SubsectionSchema).default([]),
  subtotal: z.number().optional(),
  isCollapsed: z.boolean().optional(),
});

const BoardSchema = Zod.object("Board", {
  title: z.string(),
  sections: z.array(SectionSchema).default([]),
  subtotal: z.number().optional(),
});

type Board = z.infer<typeof BoardSchema>;

const boardFixture = Zod.parse(BoardSchema, {
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

const deriveBoard = (board: z.infer<typeof BoardSchema>) => {
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

const deriveSection = (section: z.infer<typeof SectionSchema>) => {
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

const deriveSubsection = (subsection: z.infer<typeof SubsectionSchema>) => {
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

const numOfSections = 100;
boardFixture.sections = Array.from({ length: numOfSections }).flatMap(() => {
  return deepClone(boardFixture.sections.map((section) => ({ ...section, id: nanoid(20) })));
});

const board = deriveBoard(proxy(boardFixture));
board.sections = board.sections.map(deriveSection);
for (const section of board.sections) {
  section.subsections = section.subsections.map(deriveSubsection);
}

const moneyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
});

export const App = () => {
  useSnapshot(board.sections);

  return (
    <ProfilerWrapper noLogging>
      <div className="relative font-sans min-h-dvh bg-[#F5F3EF] font-[400]">
        <div className="sticky top-0 p-4 px-8 bg-[#FFFFFF] text-[#0F203C] font-[600]">
          <AppBoardHeader board={board} />
        </div>

        <div className="p-4 text-[#0F203C]">
          {board.sections.map((section) => {
            return <AppBoardSection key={section.id} section={section} sections={board.sections} />;
          })}
        </div>
      </div>
    </ProfilerWrapper>
  );
};

type AppBoardHeaderProps = {
  board: z.infer<typeof BoardSchema>;
};

const AppBoardHeader = (props: AppBoardHeaderProps) => {
  const title = useSnapshot(props.board).title;
  const subtotal = useSnapshot(props.board).subtotal ?? 0;

  return (
    <div className="flex items-center justify-between">
      <span>{title}</span>
      <div>
        <span>&Sigma; Total =</span> <span>{moneyFormat.format(subtotal)}</span>
      </div>
    </div>
  );
};

type AppBoardSectionProps = {
  section: z.infer<typeof SectionSchema>;
  sections: z.infer<typeof SectionSchema>[];
};

const AppBoardSection = memo((props: AppBoardSectionProps) => {
  useSnapshot(props.section.subsections);
  const isCollapsed = useSnapshot(props.section).isCollapsed;

  return (
    <Board key={props.section.id}>
      <Section section={props.section} sections={props.sections} />
      {!isCollapsed && (
        <div className="border-t border-[#B8AE9C]">
          {props.section.subsections.map((subsection) => {
            return (
              <AppBoardSubsection
                key={subsection.id}
                subsection={subsection}
                subsections={props.section.subsections}
              />
            );
          })}
        </div>
      )}
    </Board>
  );
});

type AppBoardSubsectionProps = {
  subsection: z.infer<typeof SubsectionSchema>;
  subsections: z.infer<typeof SubsectionSchema>[];
};

const AppBoardSubsection = memo((props: AppBoardSubsectionProps) => {
  useSnapshot(props.subsections);
  const isCollapsed = useSnapshot(props.subsection).isCollapsed;
  const onClickAddItem = () => {
    const item = Zod.parse(ItemSchema, {
      id: nanoid(10),
      name: "New item",
      subtotal: 0,
    });
    props.subsection.items.push(item);
  };

  return (
    <Fragment>
      <Subsection subsection={props.subsection} subsections={props.subsections}></Subsection>
      {!isCollapsed && (
        <Group>
          {props.subsection.items.map((item) => {
            return <Item key={item.id} item={item} items={props.subsection.items} />;
          })}

          <div className="flex items-center justify-between py-2 px-2">
            <button className="inline-flex items-center gap-2" onClick={onClickAddItem}>
              <icons.Plus className="flex-shrink-0 text-[#918D85]" size={18} />
              <div>Add item</div>
            </button>
          </div>
        </Group>
      )}
    </Fragment>
  );
});

type BoardProps = {
  children?: React.ReactNode;
};

const Board = ({ children }: BoardProps) => {
  return (
    <div className="mb-4 mx-auto max-w-[800px] bg-[#ECE7DE] px-4 pb-4 box-content rounded-lg">
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
  sections: z.infer<typeof SectionSchema>[];
};

const Section = (props: SectionProps) => {
  const name = useSnapshot(props.section).name;
  const subtotal = useSnapshot(props.section).subtotal ?? 0;
  const isCollapsed = useSnapshot(props.section).isCollapsed;
  const onClickRemoveSection = useCallback(() => {
    const sectionIndex = props.sections.indexOf(props.section) ?? null;
    if (sectionIndex !== null) {
      props.sections.splice(sectionIndex, 1);
    }
  }, [props.section, props.sections]);
  const onClickToggleCollapse = () => {
    props.section.isCollapsed = !props.section.isCollapsed;
  };

  return (
    <div className="flex items-center justify-between py-4 px-2">
      <button
        className="font-[600] flex items-center gap-2 cursor-pointer"
        onClick={onClickToggleCollapse}
      >
        <icons.ChevronDown size={18} className={clsx(isCollapsed ? "-rotate-90" : "rotate-0")} />
        <span>{name}</span>
      </button>

      <div className="flex items-center gap-4 -my-2">
        <Subtotal value={subtotal} />
        <button
          className="p-2 rounded-full cursor-pointer hover:bg-black/15 active:bg-black/30"
          onClick={onClickRemoveSection}
        >
          <icons.Trash2 className="flex-shrink-0" size={18} />
        </button>
      </div>
    </div>
  );
};

type SubsectionProps = {
  subsection: z.infer<typeof SubsectionSchema>;
  subsections: z.infer<typeof SubsectionSchema>[];
};

const Subsection = (props: SubsectionProps) => {
  const name = useSnapshot(props.subsection).name;
  const subtotal = useSnapshot(props.subsection).subtotal ?? 0;
  const isCollapsed = useSnapshot(props.subsection).isCollapsed;
  const onClickRemoveSubsection = useCallback(() => {
    const subsectionIndex = props.subsections.indexOf(props.subsection) ?? null;
    if (subsectionIndex !== null) {
      props.subsections.splice(subsectionIndex, 1);
    }
  }, [props.subsection, props.subsections]);
  const onClickToggleCollapse = () => {
    props.subsection.isCollapsed = !props.subsection.isCollapsed;
  };

  return (
    <div className="flex items-center justify-between py-4 px-2">
      <button className="flex items-center gap-2 cursor-pointer" onClick={onClickToggleCollapse}>
        <icons.ChevronDown size={18} className={clsx(isCollapsed ? "-rotate-90" : "rotate-0")} />
        <span>{name}</span>
      </button>

      <div className="flex items-center gap-4 -my-2">
        <Subtotal value={subtotal} />
        <button
          className="p-2 rounded-full cursor-pointer hover:bg-black/15 active:bg-black/30"
          onClick={onClickRemoveSubsection}
        >
          <icons.Trash2 className="flex-shrink-0" size={18} />
        </button>
      </div>
    </div>
  );
};

type ItemProps = {
  item: z.infer<typeof ItemSchema>;
  items: z.infer<typeof ItemSchema>[];
};

const Item = (props: ItemProps) => {
  const name = useSnapshot(props.item).name;
  const subtotal = useSnapshot(props.item, { sync: true }).subtotal ?? 0;
  const onChangeSubtotal = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(event.currentTarget.value);
      const number = isNaN(value) ? 0 : Math.min(1e9, Math.abs(value));
      props.item.subtotal = number;
    },
    [props.item, props.items]
  );
  const onClickRemoveItem = useCallback(() => {
    const itemIndex = props.items.indexOf(props.item) ?? null;
    if (itemIndex !== null) {
      props.items.splice(itemIndex, 1);
    }
  }, [props.item, props.items]);

  return (
    <div className="flex items-center justify-between py-2 px-2">
      <div className="flex items-center gap-2">
        <icons.GripVertical className="flex-shrink-0 text-[#918D85]" size={18} />
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

      <div className="flex items-center gap-4 -my-2">
        <Subtotal value={subtotal} />
        <button
          className="p-2 rounded-full cursor-pointer hover:bg-black/15 active:bg-black/30"
          onClick={onClickRemoveItem}
        >
          <icons.X className="flex-shrink-0" size={18} />
        </button>
      </div>
    </div>
  );
};

type SubtotalProps = {
  value: number;
};

const Subtotal = (props: SubtotalProps) => {
  return (
    <div className="font-[600] text-sm tabular-nums whitespace-nowrap">
      {moneyFormat.format(props.value)}
    </div>
  );
};

type ProfilerOnRenderCallback = (
  id: string,
  phase: "mount" | "update" | "nested-update",
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => void;

type ProfilerWrapperProps = {
  children?: React.ReactNode;
  noLogging?: boolean;
};

const ProfilerWrapper = ({ children, ...props }: ProfilerWrapperProps) => {
  const onRender: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime
  ) => {
    if (!props.noLogging) {
      console.debug({
        startTime: Math.round(startTime),
        id,
        phase,
        actualDuration: `${Math.round(actualDuration)} ms`,
        baseDuration: `${Math.round(baseDuration)} ms`,
      });
    }
  };

  return (
    <Profiler id="App" onRender={onRender}>
      {children}
    </Profiler>
  );
};
