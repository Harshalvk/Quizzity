"use client";
import React from "react";
import { Game, Question } from "@prisma/client";
import { ChevronRight, Loader2, Timer } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import MCQCounter from "./MCQCounter";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { checkAnswerSchema } from "@/schemas/form/quiz";
import axios from "axios";
import { toast } from "sonner";

type Props = {
  game: Game & { questions: Pick<Question, "id" | "options" | "question">[] };
};

const MCQ = ({ game }: Props) => {
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [selectedChoice, setSelectedChocie] = React.useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = React.useState<number>(0);
  const [wrongAnswers, setWrongAnswers] = React.useState<number>(0);

  const currentQuestion = React.useMemo(() => {
    return game.questions[questionIndex];
  }, [questionIndex, game.questions]);

  const options = React.useMemo(() => {
    if (!currentQuestion) return [];
    if (!currentQuestion.options) return [];
    return JSON.parse(currentQuestion.options as string);
  }, [currentQuestion]);

  const { mutate: checkAnswer, isPending: isChecking } = useMutation({
    mutationFn: async () => {
      const payload: z.infer<typeof checkAnswerSchema> = {
        questionId: currentQuestion.id,
        userAnswer: options[selectedChoice],
      };

      const response = await axios.post(`/api/checkAnswer`, payload);
      return response.data;
    },
  });

  const handleNext = React.useCallback(() => {
    checkAnswer(undefined, {
      onSuccess: ({ isCorrect }) => {
        if (isCorrect) {
          toast.success("Correct!", {
            description: "Correct Answer",
          });
          setCorrectAnswers((prev) => prev + 1);
        } else {
          toast.error("Incorrect!", {
            description: "Incorrect Answer",
          });
          setWrongAnswers((prev) => prev + 1);
        }
        setQuestionIndex((questionIndex) => questionIndex + 1)
      },
    });
  }, [checkAnswer, isChecking]);

  //key press events function
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "1") {
        setSelectedChocie(0);
      } else if (event.key === "2") {
        setSelectedChocie(1);
      } else if (event.key === "3") {
        setSelectedChocie(2);
      } else if (event.key === "4") {
        setSelectedChocie(3);
      } else if (event.key === "Enter") {
        handleNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext]);

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
            <span>00:00</span>
          </div>
        </div>
        <MCQCounter
          correctAnswers={correctAnswers}
          wrongAnswers={wrongAnswers}
        />
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
        {options.map((option: any, index: any) => (
          <Button
            variant={selectedChoice === index ? "default" : "secondary"}
            onClick={() => {
              setSelectedChocie(index);
            }}
            key={index}
            className="justify-start w-full py-8 mb-4"
          >
            <div className="flex items-center justify-start">
              <div className="p-2 px-3 mr-5 border rounded-md">{index + 1}</div>
              <div className="text-start">{option}</div>
            </div>
          </Button>
        ))}
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

export default MCQ;
