// components/BookTextInput.tsx
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  // useMemo, // No longer needed
} from "react";
import type { NextFont } from "next/dist/compiled/@next/font";

// --- Configuration ---
const SAVE_DEBOUNCE_MS = 1500;
const textSizeMap = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};
type TextSize = keyof typeof textSizeMap;

// --- Props Interface ---
interface BookTextInputProps {
  initialText?: string;
  saveText: (text: string) => void | Promise<void>;
  font: NextFont;
  textSize?: TextSize;
  placeholder?: string;
}

// --- Helper Functions ---
const plainTextToHtml = (text: string): string => {
  if (!text) return "<p><br></p>";
  return text
    .split("\n")
    .map((line) => `<p>${line || "<br>"}</p>`)
    .join("");
};

const htmlToPlainText = (html: string): string => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const lines: string[] = [];
  tempDiv.childNodes.forEach((node) => {
    if (node.nodeName === "P") {
      const pElement = node as HTMLParagraphElement;
      if (
        pElement.childNodes.length === 1 &&
        pElement.childNodes[0].nodeName === "BR"
      ) {
        lines.push("");
      } else {
        lines.push(pElement.textContent || "");
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      lines.push(node.textContent || "");
    }
  });

  let plainText = lines.join("\n");
  if (
    html.endsWith("<p><br></p>") &&
    plainText.endsWith("\n") &&
    lines.length > 1
  ) {
    // Trim heuristic, see previous explanation
  } else if (!html && plainText === "\n") {
    plainText = "";
  }

  plainText = plainText.replace(/\n{3,}/g, "\n\n");

  if (html.trim() === "") return "";

  return plainText;
};

// --- Component ---
export const BookTextInput: React.FC<BookTextInputProps> = ({
  initialText = "",
  saveText,
  font,
  textSize = "base",
  placeholder = "Start writing...",
}) => {
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef(true);
  const savedSaveText = useRef(saveText);

  useEffect(() => {
    savedSaveText.current = saveText;
  }, [saveText]);

  // State to track the *current* plain text, primarily for debouncer and placeholder logic
  const [currentPlainText, setCurrentPlainText] = useState(initialText);

  const textSizeClass = textSizeMap[textSize] || textSizeMap.base;

  // Effect to initialize content and handle external changes to initialText
  useEffect(() => {
    if (contentEditableRef.current) {
      const currentHtml = contentEditableRef.current.innerHTML;
      // Convert current DOM state back to plain text to compare
      const currentDomAsPlainText = htmlToPlainText(currentHtml);

      // Only update DOM if initialText prop is truly different from current content
      if (initialText !== currentDomAsPlainText) {
        // console.log("Setting initial HTML via useEffect");
        isInitializingRef.current = true;
        const newHtml = plainTextToHtml(initialText);
        contentEditableRef.current.innerHTML = newHtml;
        setCurrentPlainText(initialText); // Sync internal plain text state

        // Short delay before allowing input processing
        setTimeout(() => {
          isInitializingRef.current = false;
        }, 50);
      }
    }
  }, [initialText]); // Rerun only when initialText prop changes

  // Debounced save function
  const debouncedSave = useCallback((text: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      savedSaveText.current(text);
    }, SAVE_DEBOUNCE_MS);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Handle input events on the contentEditable div
  const handleInput = useCallback(
    (event: React.FormEvent<HTMLDivElement>) => {
      if (isInitializingRef.current) return;

      const target = event.currentTarget;
      const currentHtml = target.innerHTML;
      const newPlainText = htmlToPlainText(currentHtml);

      setCurrentPlainText(newPlainText); // Update state for debouncer/placeholder
      debouncedSave(newPlainText); // Trigger debounced save

      // Scroll to cursor
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const cursorElement = range.startContainer.parentElement;
        cursorElement?.scrollIntoView({
          block: "nearest",
          inline: "nearest",
          behavior: "smooth",
        });
      }
    },
    [debouncedSave]
  );

  const showPlaceholder = !currentPlainText && !!placeholder;

  // REMOVED unused placeCursorAtEnd function

  return (
    <div
      ref={contentEditableRef}
      contentEditable={true}
      suppressContentEditableWarning={true}
      onInput={handleInput}
      // Initial content is set via useEffect
      className={`
          book-text-input max-w-[65ch] h-full overflow-y-auto outline-none
          p-4 md:p-6 lg:p-8
          bg-white dark:bg-gray-900
          text-gray-900 dark:text-gray-100
          ${font.className}
          ${textSizeClass}
          leading-loose
          whitespace-pre-wrap
          break-words
          [&>p]:indent-8
          relative
          transition-colors duration-200
          ${
            showPlaceholder
              ? "before:content-[attr(data-placeholder)] before:absolute before:left-8 md:before:left-12 lg:before:left-16 before:top-4 md:before:top-6 lg:before:top-8 before:text-gray-400 dark:before:text-gray-500 before:pointer-events-none before:opacity-70"
              : ""
          }
        `}
      data-placeholder={showPlaceholder ? placeholder : ""}
      aria-label={placeholder || "Text input area"}
      spellCheck="true"
    />
  );
};

// --- Helper Type for NextFont ---
/*
  declare module 'next/dist/compiled/@next/font' {
    interface NextFont {
      className: string;
      style: {
        fontFamily: string;
        fontWeight?: number | string;
        fontStyle?: string;
      };
    }
  }
    */
