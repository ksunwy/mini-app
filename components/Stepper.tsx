import { steps } from "@/lib/steps";
import { StepperProps } from "@/app/interfaces/interfaces";

export function Stepper({ currentStep }: StepperProps) {
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="surface p-5 sm:p-6">
      <div className="relative mb-6 h-2 rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
          aria-hidden
        />
      </div>

      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          return (
            <li
              key={step.id}
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white p-3"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  isActive || isCompleted
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {step.id}
              </span>
              <span
                className={`text-sm font-semibold ${
                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                }`}
              >
                {step.title}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
