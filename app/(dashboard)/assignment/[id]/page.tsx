"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { FileText, Upload, Clock, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadThing } from "@/components/uploadthing";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Question {
  id: string;
  questionText: string;
  type: "MULTIPLE_CHOICE" | "SHORT_ANSWER";
  options?: string[];
  points: number;
  correctAnswer?: string;
}

interface Submission {
  id: string;
  fileUrl?: string;
  answers?: Record<string, string>;
  grade?: number;
  submittedAt: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  type: "TEST" | "DOCUMENT";
  classroomId: string;
  questions?: Question[];
  submissions?: Submission[];
}

export default function AssignmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const isTeacher = session?.user?.role === "TEACHER";
  const isStudent = session?.user?.role === "STUDENT";
  const hasSubmitted = assignment?.submissions?.length ?? 0 > 0;
  const isOverdue = new Date(assignment?.dueDate ?? "") < new Date();

  useEffect(() => {
    if (id) {
      fetchAssignment();
    }
  }, [id]);

const fetchAssignment = async () => {
  try {
    // First fetch the assignment by ID to get classroomId and basic data
    const assignmentResponse = await fetch(`/api/assignments/${id}`);
    if (!assignmentResponse.ok) throw new Error("Failed to fetch assignment metadata");
    const assignmentData = await assignmentResponse.json();

    const classroomId = assignmentData.classroomId;
    if (!classroomId) throw new Error("Classroom ID not found in assignment data");

    // Now fetch the full assignment details using classroomId
    const response = await fetch(`/api/classrooms/${classroomId}/assignments/${id}`);
    if (!response.ok) throw new Error("Failed to fetch assignment details");

    const data = await response.json();
    setAssignment(data);

    if (data.type === "TEST" && data.questions) {
      const initialAnswers: Record<string, string> = {};
      data.questions.forEach((q: Question) => {
        initialAnswers[q.id] = "";
      });
      setAnswers(initialAnswers);
    }
  } catch (error) {
    console.error(error);
    toast.error("Failed to load assignment");
  } finally {
    setLoading(false);
  }
};


  const handleSubmit = async () => {
    if (!assignment) return;
    setSubmitting(true);
    try {
      const submission = {
        fileUrl: assignment.type === "DOCUMENT" ? fileUrl : undefined,
        answers: assignment.type === "TEST" ? answers : undefined,
      };

      const response = await fetch(`/api/classrooms/${assignment.classroomId}/assignments/${assignment.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) throw new Error("Failed to submit assignment");

      toast.success("Assignment submitted successfully");
      router.refresh();
      fetchAssignment(); // refresh data
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <h2 className="text-2xl font-bold mb-2">Assignment not found</h2>
        <p className="text-muted-foreground mb-6">
          The assignment you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
      </div>
    );
  }

  const dueDate = new Date(assignment.dueDate);
  const submission = assignment.submissions?.[0];

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">{assignment.title}</h1>
            <Badge variant={assignment.type === "TEST" ? "default" : "outline"}>
              {assignment.type === "TEST" ? "Online Test" : "Document Submission"}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">
            Due {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString()}
          </p>
        </div>
        {isTeacher && (
          <Button onClick={() => router.push(`/assignment/${id}/grades`)}>
            View Submissions
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{assignment.description}</p>
          </CardContent>
        </Card>

        {isStudent && (
          <Card>
            <CardHeader>
              <CardTitle>
                {hasSubmitted ? "Your Submission" : "Submit Assignment"}
              </CardTitle>
              <CardDescription>
                {hasSubmitted
                  ? `Submitted on ${new Date(submission!.submittedAt).toLocaleString()}`
                  : isOverdue
                  ? "This assignment is overdue"
                  : "Complete and submit your work"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasSubmitted ? (
                <div className="space-y-4">
                  {submission?.grade !== null ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Grade: {submission?.grade}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-amber-500" />
                      <span className="text-muted-foreground">Awaiting grade</span>
                    </div>
                  )}

                  {assignment.type === "DOCUMENT" && submission?.fileUrl && (
                    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <FileText className="h-6 w-6 text-blue-500" />
                      <div className="flex-1">
                        <p className="font-medium">Submitted Document</p>
                        <a
                          href={submission.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline"
                        >
                          View submission
                        </a>
                      </div>
                    </div>
                  )}

                  {assignment.type === "TEST" && submission?.answers && (
                    <div className="space-y-6">
                      {assignment.questions?.map((question, index) => (
                        <div key={question.id} className="space-y-2">
                          <div className="flex justify-between">
                            <p className="font-medium">Question {index + 1}</p>
                            <Badge variant="outline">{question.points} points</Badge>
                          </div>
                          <p className="text-sm">{question.questionText}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm">
                              Student's answer: {submission.answers?.[question.id] ?? "N/A"}
                            </p>
                            {question.correctAnswer &&
                              submission.answers?.[question.id] === question.correctAnswer && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                          </div>
                          {question.correctAnswer && (
                            <p className="text-sm text-muted-foreground">
                              Correct answer: {question.correctAnswer}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {assignment.type === "DOCUMENT" ? (
                    <UploadThing
                      endpoint="assignmentUploader"
                      value={fileUrl}
                      onChange={(url?: string) => setFileUrl(url ?? "")}
                    />
                  ) : (
                    <div className="space-y-8">
                      {assignment.questions?.map((question, index) => (
                        <div key={question.id} className="space-y-4">
                          <div className="flex justify-between">
                            <p className="font-medium">
                              Question {index + 1}: {question.questionText}
                            </p>
                            <Badge variant="outline">{question.points} points</Badge>
                          </div>

                          {question.type === "MULTIPLE_CHOICE" ? (
                            <RadioGroup
                              value={answers[question.id]}
                              onValueChange={(value) =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [question.id]: value,
                                }))
                              }
                            >
                              {question.options?.map((option, i) => (
                                <div key={i} className="flex items-center space-x-2">
                                  <RadioGroupItem value={String(i + 1)} id={`q${index}-o${i}`} />
                                  <Label htmlFor={`q${index}-o${i}`}>{option}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          ) : (
                            <Input
                              placeholder="Enter your answer"
                              value={answers[question.id]}
                              onChange={(e) =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [question.id]: e.target.value,
                                }))
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={
                      submitting ||
                      (assignment.type === "DOCUMENT" && !fileUrl) ||
                      (assignment.type === "TEST" &&
                        Object.values(answers).some((a) => !a))
                    }
                    className="w-full"
                  >
                    {submitting ? "Submitting..." : "Submit Assignment"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
