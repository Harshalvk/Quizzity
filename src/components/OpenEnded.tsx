"use client";
import React from "react";
import { cn, formateTimeDelta } from "@/lib/utils";
import { Game, Question } from "@prisma/client";
import { BarChart, ChevronRight, Loader2, Timer } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button, buttonVariants } from "./ui/button";
import { differenceInSeconds } from "date-fns";
import { z } from "zod";
import { checkAnswerSchema } from "@/schemas/form/quiz";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import BlankAnswerInput from "./BlankAnswerInput";
import Link from "next/link";

type Props = {
  game: Game & { questions: Pick<Question, "id" | "question" | "answer">[] };
};

const OpenEnded = ({ game }: Props) => {
  const [questionIndex, setQuestionIndex] = React.useState<number>(0);
  const [blankAnswer, setBlankAnswer] = React.useState<string>("");
  const [hasEnded, setHasEnded] = React.useState<boolean>(false);
  const [now, setNow] = React.useState<Date>(new Date());

  const currentQuestion = React.useMemo(() => {
    return game.questions[questionIndex];
  }, [questionIndex, game.questions]);

  const { mutate: checkAnswer, isPending: isChecking } = useMutation({
    mutationFn: async () => {
      let filledAnswer = blankAnswer;
      document.querySelectorAll("user-blank-input").forEach((input) => {
        //@ts-expect-error value will have error
        filledAnswer = filledAnswer.replace("_____", input.value);
        //@ts-expect-error value will have error
        input.value = "";
      });
      const payload: z.infer<typeof checkAnswerSchema> = {
        questionId: currentQuestion.id,
        userAnswer: filledAnswer,
      };

      const response = await axios.post(`/api/checkAnswer`, payload);
      return response.data;
    },
  });

  const handleNext = React.useCallback(() => {
    if (isChecking) return;

    checkAnswer(undefined, {
      onSuccess: ({ percentageSimilar }) => {
        toast.success(
          `Your answer is ${percentageSimilar}% similar to the correct answer`,
          {
            description: "answers are matched based on similarity comparisons",
          }
        );
        if (questionIndex === game.questions.length - 1) {
          setHasEnded(true);
          return;
        }
        setQuestionIndex((questionIndex) => questionIndex + 1);
      },
    });
  }, [checkAnswer, isChecking, questionIndex, game.questions.length]);

  //key press events function
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext]);

  //To get current time
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!hasEnded) {
        setNow(new Date());
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [hasEnded]);

  if (hasEnded) {
    return (
      <div className="absolute flex flex-col justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="px-4 mt-2 font-semibold text-white bg-green-500 rounded-md whitespace-nowrap">
          You completed in {"3min 4s"}
        </div>
        <Link
          href={`/statistics/${game.id}`}
          className={cn(buttonVariants(), "mt-2")}
        >
          View Statistics
          <BarChart className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:w-[80vw] max-w-4xl w-[90vw]">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          <p>
            <span className="dark:text-slate-400 mr-2">Topic</span>
            <span className="px-2 py-1 text-white rounded-lg bg-slate-500">
              {game.topic}
            </span>
          </p>
          <div className="flex self-start mt-3 dark:text-slate-400">
            <Timer className="mr-2" />
            <span>
              {formateTimeDelta(differenceInSeconds(now, game.timeStarted))}
            </span>
          </div>
        </div>
      </div>
      <Card className="w-full mt-4">
        <CardHeader className="flex flex-row items-center">
          <CardTitle className="mr-5 text-center divide-y divide-zinc-800/50">
            <div>{questionIndex + 1}</div>
            <div className="text-base text-slate-400">
              {game.questions.length}
            </div>
          </CardTitle>
          <CardDescription className="flex-grow text-lg text-black dark:text-slate-400">
            {currentQuestion.question}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex flex-col items-center justify-center w-full mt-4">
        <BlankAnswerInput
          answer={currentQuestion.answer}
          setBlankAnswer={setBlankAnswer}
        />
        <Button
          className="mt-2 group"
          variant={"outline"}
          disabled={isChecking}
          onClick={() => {
            handleNext();
          }}
        >
          {isChecking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Next{" "}
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-all" />
        </Button>
      </div>
    </div>
  );
};

export default OpenEnded;
