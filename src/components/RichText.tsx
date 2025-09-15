"use client";

// Renders Payload Lexical rich text JSON on the frontend
// Requires the project to have `@payloadcms/richtext-lexical` installed
import * as React from "react";
import { RichText } from "@payloadcms/richtext-lexical/react";

type Props = {
  content: unknown; // Payload rich text JSON
  className?: string;
};

export default function RichTextRenderer({ content, className }: Props) {
  return (
    <div className={className}>
      <RichText data={content as any} />
    </div>
  );
}

