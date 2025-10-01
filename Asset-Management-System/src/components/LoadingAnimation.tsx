import React from "react";
import { cn } from "@/lib/utils";

interface LoadingAnimationProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  size = "md",
  text = "Loading...",
  className,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-4",
        className
      )}
    >
      {/* BUA Logo with rotating animation */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border-4 border-transparent border-t-bua-red border-r-bua-red/30 animate-spin",
            sizeClasses[size]
          )}
          style={{ animationDuration: "2s" }}
        />

        {/* Inner pulsing ring */}
        <div
          className={cn(
            "absolute inset-2 rounded-full border-2 border-transparent border-b-bua-red border-l-bua-red/50 animate-pulse",
            sizeClasses[size]
          )}
          style={{ animationDuration: "1.5s" }}
        />

        {/* Center logo container */}
        <div
          className={cn(
            "relative flex items-center justify-center rounded-full bg-gradient-to-br from-bua-red/10 to-bua-red/5 backdrop-blur-sm",
            sizeClasses[size]
          )}
        >
          {/* BUA Text */}
          <div className="text-center">
            <div
              className={cn(
                "font-bold text-bua-red animate-pulse",
                size === "sm"
                  ? "text-xs"
                  : size === "md"
                  ? "text-sm"
                  : "text-base"
              )}
              style={{ animationDuration: "2s" }}
            >
              BUA
            </div>
            <div
              className={cn(
                "text-bua-red/70 font-medium",
                size === "sm"
                  ? "text-[8px]"
                  : size === "md"
                  ? "text-[10px]"
                  : "text-xs"
              )}
            >
              GROUP
            </div>
          </div>
        </div>

        {/* Floating dots around the logo */}
        <div className="absolute inset-0 animate-ping">
          <div className="absolute top-0 left-1/2 w-1 h-1 bg-bua-red rounded-full transform -translate-x-1/2 -translate-y-1" />
          <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-bua-red rounded-full transform -translate-x-1/2 translate-y-1" />
          <div className="absolute left-0 top-1/2 w-1 h-1 bg-bua-red rounded-full transform -translate-y-1/2 -translate-x-1" />
          <div className="absolute right-0 top-1/2 w-1 h-1 bg-bua-red rounded-full transform -translate-y-1/2 translate-x-1" />
        </div>
      </div>

      {/* Loading text with typewriter effect */}
      <div className="text-center">
        <div
          className={cn(
            "font-medium text-gray-600 animate-pulse",
            textSizeClasses[size]
          )}
          style={{ animationDuration: "1.8s" }}
        >
          {text}
        </div>

        {/* Animated dots */}
        <div className="flex justify-center space-x-1 mt-2">
          <div
            className="w-1 h-1 bg-bua-red rounded-full animate-bounce"
            style={{ animationDelay: "0ms", animationDuration: "1.4s" }}
          />
          <div
            className="w-1 h-1 bg-bua-red rounded-full animate-bounce"
            style={{ animationDelay: "200ms", animationDuration: "1.4s" }}
          />
          <div
            className="w-1 h-1 bg-bua-red rounded-full animate-bounce"
            style={{ animationDelay: "400ms", animationDuration: "1.4s" }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
