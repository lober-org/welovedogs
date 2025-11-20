"use client";

import React from "react";

interface LoberFinalProps {
  className?: string;
}

export function LoberFinal({ className }: LoberFinalProps) {
  const [svgContent, setSvgContent] = React.useState<string>("");

  React.useEffect(() => {
    fetch("/images/design-mode/lober-20final.svg")
      .then((res) => res.text())
      .then((text) => setSvgContent(text))
      .catch((err) => console.error("Failed to load SVG:", err));
  }, []);

  if (!svgContent) {
    return (
      <div className={className} aria-label="Brandon and Sergio with dogs and Costa Rica flag" />
    );
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      aria-label="Brandon and Sergio with dogs and Costa Rica flag"
    />
  );
}
