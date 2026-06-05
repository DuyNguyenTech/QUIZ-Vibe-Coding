"use client";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md">
      <div className="flex flex-col items-center gap-8 animate-fade-in max-w-md mx-auto px-6">
        {/* Animated spinner */}
        <div className="relative w-24 h-24">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-border" />
          {/* Spinning gradient ring */}
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent animate-spin-slow"
            style={{
              borderTopColor: "#6c63ff",
              borderRightColor: "#7c4dff",
            }}
          />
          {/* Inner pulsing dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse-glow" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-3">
          <h2 className="text-xl font-bold gradient-text">
            AI đang xử lý đề thi
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            AI đang phân tích và xử lý đề thi của bạn, vui lòng đợi trong giây
            lát...
          </p>
        </div>

        {/* Skeleton lines */}
        <div className="w-full space-y-3">
          <div className="h-3 rounded-full animate-shimmer w-full" />
          <div className="h-3 rounded-full animate-shimmer w-4/5" />
          <div className="h-3 rounded-full animate-shimmer w-3/5" />
        </div>
      </div>
    </div>
  );
}
