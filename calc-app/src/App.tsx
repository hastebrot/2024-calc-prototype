import { clsx } from "clsx";
import { icons } from "lucide-react";
import { nanoid } from "nanoid";
import { Fragment, Profiler, memo, useCallback } from "react";
import { proxy, snapshot, useSnapshot } from "valtio";
import { Zod, z } from "./helper/zod";
import {
  BoardSchema,
  ItemSchema,
  SectionSchema,
  SubsectionSchema,
  deriveSubsection,
  store,
} from "./store";

const moneyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
});

export const App = () => {
  return (
    <ProfilerWrapper noLogging>
      <AppBoard board={store.board} />
      <div className="z-20 fixed top-0 right-0 bottom-0 w-[400px] grid">
        <Debug board={store.board} />
      </div>
    </ProfilerWrapper>
  );
};

type AppBoardProps = {
  board: z.infer<typeof BoardSchema>;
};

// const traverseProxy = (value: object) => {
//   console.log(JSON.stringify(value));
//   console.log(snapshot(value));
// };

type DebugProps = {
  board: z.infer<typeof BoardSchema>;
};

const Debug = (props: DebugProps) => {
  const board = useSnapshot(props.board);

  return (
    <div className="grid w-full h-full shadow-lg">
      <div className="relative bg-white">
        <div className="absolute inset-0 overflow-y-scroll overflow-x-hidden">
          <div className="p-4">
            {board.sections.map((section) => {
              return (
                <div className="px-0">
                  <div className="font-[600]">{section.name}</div>
                  <div>
                    {section.subsections.map((subsection) => {
                      return (
                        <div className="px-4">
                          <div>{subsection.name}</div>
                          <div>
                            {subsection.items.map((item) => {
                              return <div className="px-4 text-black/50">{item.name}</div>;
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 break-all text-sm">{JSON.stringify(board)}d</div>
        </div>
      </div>
    </div>
  );
};

const AppBoard = (props: AppBoardProps) => {
  useSnapshot(props.board.sections);

  return (
    <div className="relative font-sans min-h-dvh bg-[#F5F3EF] font-[400]">
      <div className="z-10 sticky top-0 p-4 px-8 bg-[#FFFFFF] text-[#0F203C] font-[600]">
        <AppBoardHeader board={props.board} />
      </div>

      <div className="p-4 text-[#0F203C]">
        {props.board.sections.map((section) => {
          return (
            <AppBoardSection key={section.id} section={section} sections={props.board.sections} />
          );
        })}
      </div>
    </div>
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
  const onClickAddSubsection = () => {
    const subsection = Zod.parse(SubsectionSchema, {
      id: nanoid(10),
      name: "New subsection",
    });
    props.section.subsections.push(deriveSubsection(proxy(subsection)));
  };

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
          <button
            className="inline-flex items-center gap-2 mt-4 ml-8 text-[#1C4E88]"
            onClick={onClickAddSubsection}
          >
            <icons.PlusCircle className="flex-shrink-0" size={18} />
            <div>Add subsection</div>
          </button>
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
            <button
              className="inline-flex items-center gap-2 ml-6 text-[#1C4E88]"
              onClick={onClickAddItem}
            >
              <icons.PlusCircle className="flex-shrink-0" size={18} />
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
  const onClickRemoveSection = () => {
    const sectionIndex = props.sections.indexOf(props.section) ?? null;
    if (sectionIndex !== null) {
      props.sections.splice(sectionIndex, 1);
    }
  };
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
        <div className="p-1.5 -m-1.5 bg-black/15 rounded-md">
          <Subtotal value={subtotal} />
        </div>
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
  const onClickRemoveSubsection = () => {
    const subsectionIndex = props.subsections.indexOf(props.subsection) ?? null;
    if (subsectionIndex !== null) {
      props.subsections.splice(subsectionIndex, 1);
    }
  };
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
    [props.item]
  );
  const onClickRemoveItem = () => {
    const itemIndex = props.items.indexOf(props.item) ?? null;
    if (itemIndex !== null) {
      props.items.splice(itemIndex, 1);
    }
  };

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
