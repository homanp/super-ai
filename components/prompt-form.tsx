"use client";

import * as React from "react";
import { ArrowUpIcon } from "@radix-ui/react-icons";
import Textarea from "react-textarea-autosize";

import { useEnterSubmit } from "@/lib/hooks/use-enter-submit";
import { Button } from "@/components/ui/button";

export interface PromptProps {
  onSubmit: (value: string) => Promise<void>;
}

export default function PromptFrom({ onSubmit }: PromptProps) {
  const [input, setInput] = React.useState<string>();
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!input?.trim()) {
          return;
        }
        setInput("");
        await onSubmit(input);
      }}
      ref={formRef}
    >
      <div className="flex items-center justify-between h-10 border-gray-700 rounded-2xl border px-2 py-7 space-x-2 mx-12 mb-5">
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message"
          spellCheck={false}
          className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] text-white focus-within:outline-none"
        />
        <Button type="submit" className="rounded-xl bg-slate-500" size="sm">
          <ArrowUpIcon className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
