"use client";
import React from "react";
import { v4 as uuidv4 } from "uuid";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Doughnut } from "react-chartjs-2";

import PromptForm from "@/components/prompt-form";
import ChatMessage from "@/components/chat-message";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

// Change this to your own hosted Superagent instance
const API_URL = "https://api.beta.superagent.sh/api/v1";

// Change this to your Superagent Agent ID
const CHAT_AGENT_ID = "e9409d15-a371-4fa7-913b-5ca114aae0e2";
const STRUCTERED_PREDICTION_AGENT_ID = "c39f0a9c-6e99-47a1-a5d3-0f5604fbf720";

const HEADERS = {
  "Content-Type": "application/json",
  authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPERAGENT_API_KEY}`,
};

const chartOptions = {
  plugins: {
    legend: {
      labels: {
        color: "white", // Legend labels
      },
    },
  },
};

const chartData = {
  labels: [],
  datasets: [
    {
      label: "",
      data: [],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

export default function Home() {
  const [messages, setMessages] = React.useState<
    { type: string; message: string }[]
  >([{ type: "ai", message: "Hello there, how can I help you?" }]);
  const [data, setData] = React.useState<any>(chartData);
  const [chartResponse, setChartResponseData] = React.useState<any>(null);

  async function onSubmit(value: string) {
    let message = "";

    setMessages((previousMessages: any) => [
      ...previousMessages,
      { type: "human", message: value },
    ]);

    setMessages((previousMessages) => [
      ...previousMessages,
      { type: "ai", message },
    ]);

    await fetchEventSource(`${API_URL}/agents/${CHAT_AGENT_ID}/invoke`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        input: value,
        enableStreaming: true,
        //sessionId: uuidv4(),
      }),
      openWhenHidden: true,
      async onclose() {
        const chartResponse = await fetch(
          `${API_URL}/agents/${STRUCTERED_PREDICTION_AGENT_ID}/invoke`,
          {
            method: "POST",
            headers: HEADERS,
            body: JSON.stringify({
              input: message,
              enableStreaming: false,
              outputSchema:
                "{labels: List[str], values: List[str or int], cart_label: str}",
              //sessionId: uuidv4(),
            }),
          }
        );
        const { data: chartResponseData } = await chartResponse.json();

        setChartResponseData(chartResponseData);
        setData({
          ...data,
          labels: chartResponseData?.labels || [],
          datasets: [
            {
              ...data.datasets[0],
              data: chartResponseData?.values || [],
            },
          ],
        });
      },
      async onmessage(event) {
        if (event.data !== "[END]") {
          message += event.data === "" ? `${event.data} \n` : event.data;
          setMessages((previousMessages) => {
            let updatedMessages = [...previousMessages];

            for (let i = updatedMessages.length - 1; i >= 0; i--) {
              if (updatedMessages[i].type === "ai") {
                updatedMessages[i].message = message;
                break;
              }
            }

            return updatedMessages;
          });
        }
      },
    });
  }

  return (
    <main className="flex bg-gray-800 min-h-screen">
      <section className="flex flex-col w-1/2 bg-gray-700">
        {chartResponse?.values?.length > 0 && (
          <>
            <p className="text-md text-slate-200 text-center mt-10">
              {chartResponse?.chart_label}
            </p>
            <div className="flex flex-1 px-20 py-20 items-center">
              <Doughnut data={data} options={chartOptions} />
            </div>
          </>
        )}
      </section>
      <section className="flex flex-col flex-1 border-l border-gray-600 relative pt-10">
        <div className="chat-container flex-col flex-1 px-6 py-4 flex space-y-8 max-h-full mb-40">
          {messages.map(({ type, message }, index) => (
            <ChatMessage
              key={`${type}-${index}`}
              type={type}
              message={message}
            />
          ))}
        </div>
        <footer className="fixed bottom-0 right-0 left-[51%] bg-gray-800">
          <PromptForm
            onSubmit={async (value) => {
              onSubmit(value);
            }}
          />
        </footer>
      </section>
    </main>
  );
}
