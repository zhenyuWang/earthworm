"use client";

import { useEffect, useState } from "react";
import Question from "@/components/Question";
import Answer from "@/components/Answer";
// import Statistics from "@/components/Statistics";
import { useCourse, useFailedCount } from "@/store";
import Header from "@/components/Header";
import { fetchCourses } from "@/api/course";

export default function Home() {
  const [currentMode, setCurrentMode] = useState<"question" | "answer">(
    "question"
  );
  const { count, increaseFailedCount, resetFailedCount } = useFailedCount();
  const {
    currentCourseId,
    statementIndex,
    toNextStatement,
    fetchCourse,
    getCurrentStatement,
    checkCorrect,
  } = useCourse();
  const [isShowAnswerNowBtn, setIsShowAnswerNowBtn] = useState(false);

  useEffect(() => {
    const courseIdValue = localStorage.getItem("courseId");
    const statementIndexValue = localStorage.getItem("statementIndex");

    const fetchCourseData = async () => {
      let cId = currentCourseId;
      if (!currentCourseId) {
        if (courseIdValue) {
          cId = courseIdValue;
        } else {
          const courses = await fetchCourses();
          cId = courses[0].id;
        }
      }

      if (cId) {
        useCourse.setState({ currentCourseId: cId });
        localStorage.setItem("courseId", cId);
        fetchCourse(cId);
      }
    };

    fetchCourseData();
    if (statementIndexValue) {
      useCourse.setState({ statementIndex: Number(statementIndexValue) });
    }
  }, [currentCourseId]);

  useEffect(() => {
    function handleKeyDown(event: any) {
      if (event.key === "Tab" && count >= 2) {
        showAnswerNow();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [count]);

  useEffect(() => {
    if (statementIndex) {
      localStorage.setItem("statementIndex", statementIndex + "");
    }
  }, [statementIndex]);

  const showAnswerNow = () => {
    setCurrentMode("answer");
    setIsShowAnswerNowBtn(false);
    resetFailedCount();
  };

  const handleToNextStatement = () => {
    toNextStatement();
    setCurrentMode("question");
  };

  const handleCheckAnswer = (userInput: string) => {
    if (checkCorrect(userInput)) {
      showAnswerNow();
    } else {
      increaseFailedCount(() => {
        setIsShowAnswerNowBtn(true);
      });
    }
  };

  const lineNum = getCurrentStatement()?.english.split(" ").length || 1;

  return (
    <>
      <Header />
      <div className="container mx-auto flex h-full flex-1 flex-col items-center justify-center pb-10 h-96 mt-40">
        <div className="container relative mx-auto flex h-full flex-col items-center">
          <div className="container flex flex-grow items-center justify-center">
            <div className="container flex h-full w-full flex-col items-center justify-center">
              <div className="container flex flex-grow flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center pb-1 pt-4">
                  {currentMode === "question" ? (
                    <>
                      <Question
                        word={getCurrentStatement()?.chinese || "加载中..."}
                        lineNum={lineNum}
                        onCheckAnswer={handleCheckAnswer}
                      ></Question>
                      {isShowAnswerNowBtn && (
                        <div className="flex gap-x-2 text-sm">
                          <button
                            className="rounded-sm px-2 bg-gray-600 text-white dark:text-gray-900"
                            onClick={showAnswerNow}
                          >
                            tap
                          </button>
                          <div className=" text-gray-600"> - show answer</div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Answer
                      word={getCurrentStatement()?.english || ""}
                      soundmark={getCurrentStatement()?.soundmark || ""}
                      onToNextStatement={handleToNextStatement}
                    ></Answer>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* <Statistics /> */}
        </div>
      </div>
    </>
  );
}
