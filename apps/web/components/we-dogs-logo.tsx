"use client";

import React from "react";

interface WeDogsLogoProps {
  className?: string;
}

export function WeDogsLogo({ className }: WeDogsLogoProps) {
  const [svgContent, setSvgContent] = React.useState<string>("");

  React.useEffect(() => {
    fetch("/we-dogs-logo.svg")
      .then((res) => res.text())
      .then((text) => setSvgContent(text))
      .catch((err) => console.error("Failed to load SVG:", err));
  }, []);

  if (!svgContent) {
    return <div className={className} aria-label="WE DOGS" />;
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      aria-label="WE DOGS"
    />
  );
}
