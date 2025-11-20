"use client";

import React from "react";

interface CaretakersBannerProps {
  className?: string;
}

export function CaretakersBanner({ className }: CaretakersBannerProps) {
  const [svgContent, setSvgContent] = React.useState<string>("");

  React.useEffect(() => {
    fetch("/images/design-mode/caretakers-20banner.svg")
      .then((res) => res.text())
      .then((text) => setSvgContent(text))
      .catch((err) => console.error("Failed to load SVG:", err));
  }, []);

  if (!svgContent) {
    return (
      <div
        className={className}
        aria-label="Care providers illustration with vet, rescuer, and heroes with dogs"
      />
    );
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      aria-label="Care providers illustration with vet, rescuer, and heroes with dogs"
    />
  );
}
