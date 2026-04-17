// app/institute/register/components/StepIndicator.jsx
const STEPS = [
  { number: 1, label: "Basic Info" },
  { number: 2, label: "Location" },
  { number: 3, label: "Account" },
  { number: 4, label: "Verify" },
];

export default function StepIndicator({ currentStep, isExistingUser }) {
  const visibleSteps = isExistingUser ? STEPS.slice(0, 2) : STEPS;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center gap-0">
        {visibleSteps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isLast = index === visibleSteps.length - 1;

          return (
            <div key={step.number} className="flex items-center">
              {/* Circle */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  isCompleted
                    ? "bg-blue-600 text-white"
                    : isActive
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-gray-100 text-gray-400"
                }`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : step.number}
                </div>
                <span className={`text-xs mt-1 font-medium whitespace-nowrap ${
                  isActive ? "text-blue-600" : isCompleted ? "text-blue-600" : "text-gray-400"
                }`}>
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className={`h-0.5 w-12 sm:w-20 mb-4 mx-1 transition-all ${
                  currentStep > step.number ? "bg-blue-600" : "bg-gray-200"
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}