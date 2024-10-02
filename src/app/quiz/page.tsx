import QuizCreation from "@/components/QuizCreation";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import React from "react";

export const metadata = {
  title: "Quiz | Quizzity",
};

type Props = {
  searchParams: {
    topic?: string;
  };
};

const QuizPage = async ({ searchParams }: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/");
  }
  return (
    <>
      <QuizCreation topicParam={searchParams.topic ?? ""} />
    </>
  );
};

export default QuizPage;
