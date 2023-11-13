"use client";
import React from "react";
import { motion } from "framer-motion";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CodeBlock } from "@/components/code-block";
import { MemoizedReactMarkdown } from "@/components/markdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MessageProps {
  type: string;
  message: string;
}

function PulsatingCursor() {
  return (
    <motion.div
      initial="start"
      animate={{
        scale: [1, 1, 1],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 0.5,
        repeat: Infinity,
      }}
      className="text-white"
    >
      ▍
    </motion.div>
  );
}

export default function Message({ type, message }: MessageProps) {
  return (
    <div className="flex space-x-3 mx-10">
      <Avatar className="w-5 h-5">
        <AvatarFallback
          className={type === "human" ? "bg-white" : "bg-yellow-500"}
        ></AvatarFallback>
      </Avatar>
      {message?.length === 0 && <PulsatingCursor />}
      <MemoizedReactMarkdown
        className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 break-words text-sm"
        remarkPlugins={[remarkGfm, remarkMath]}
        components={{
          table({ children }) {
            return (
              <div className="my-4 rounded-md border">
                <Table>{children}</Table>
              </div>
            );
          },
          thead({ children }) {
            return <TableHeader>{children}</TableHeader>;
          },
          tbody({ children }) {
            return <TableBody>{children}</TableBody>;
          },
          tr({ children }) {
            return <TableRow className="text-white">{children}</TableRow>;
          },
          th({ children }) {
            return (
              <TableHead className="py-2 text-white">{children}</TableHead>
            );
          },
          td({ children }) {
            return (
              <TableCell className="py-2 text-white">{children}</TableCell>
            );
          },
          p({ children }) {
            return <p className="text-white text-[16px]">{children}</p>;
          },
          a({ children, href }) {
            return (
              <a
                href={href}
                className="text-primary underline"
                rel="noreferrer"
                target="_blank"
              >
                {children}
              </a>
            );
          },
          ol({ children }) {
            return <ol className="my-5 list-decimal pl-[30px]">{children}</ol>;
          },
          ul({ children }) {
            return <ul className="my-5 list-disc pl-[30px]">{children}</ul>;
          },
          li({ children }) {
            return <li className="pb-1 text-white">{children}</li>;
          },
          // @ts-ignore
          code({ node, inline, className, children, ...props }) {
            children = React.Children.map(children, (child) =>
              typeof child === "string" ? child.replace("`▍`", "▍") : child
            );

            const match = /language-(\w+)/.exec(className || "");

            if (inline) {
              return (
                <code
                  className="light:bg-slate-200 px-1 my-5 text-md dark:bg-slate-800"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                key={Math.random()}
                language={(match && match[1]) || ""}
                value={String(children).replace(/\n$/, "")}
                {...props}
              />
            );
          },
        }}
      >
        {message}
      </MemoizedReactMarkdown>
    </div>
  );
}
