interface Step {
  label: string;
  color?: string;
}

interface Props {
  steps: Step[];
  activeIndex?: number;
}

const defaultColors = ["#0D1B2A", "#BE0303", "#BE0303", "#BE0303", "#BE0303", "#BE0303"];

export default function StepFlow({ steps, activeIndex = steps.length - 1 }: Props) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-stretch min-w-max gap-0">
        {steps.map((step, i) => {
          const bg = step.color ?? defaultColors[i % defaultColors.length];
          const isActive = i === activeIndex;
          return (
            <div
              key={i}
              className="relative flex items-center"
              style={{ minWidth: 120 }}
            >
              {/* Arrow shape */}
              <div
                className="h-10 flex items-center px-4 pr-6 text-white text-xs font-semibold relative"
                style={{
                  background: bg,
                  clipPath: i === steps.length - 1
                    ? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 10px 50%)"
                    : "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 10px 50%)",
                  opacity: i > activeIndex ? 0.45 : 1,
                  marginLeft: i === 0 ? 0 : -12,
                  zIndex: steps.length - i,
                }}
              >
                <span className="text-center leading-tight">{step.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
