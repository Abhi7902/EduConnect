"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { FileText, Download, CheckCircle, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface Submission {
  id: string;
  fileUrl?: string;
  answers?: Record<string, string>;
  grade?: number;
  feedback?: string;
  submittedAt: string;
  student: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  type: "TEST" | "DOCUMENT";
  questions?: {
    id: string;
    questionText: string;
    type: "MULTIPLE_CHOICE" | "SHORT_ANSWER";
    options?: string[];
    correctAnswer: string;
    points: number;
  }[];
  submissions: Submission[];
}

export default function AssignmentGrades({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [grades, setGrades] = useState<Record<string, { grade: number; feedback: string }>>({});

  useEffect(() => {
    if (params.id) {
      fetchAssignment();
    }
  }, [params.id]);

  const fetchAssignment = async () => {
    try {
      const response = await fetch(`/api/assignments/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch assignment");
      const data = await response.json();
      setAssignment(data);

      // Initialize grades state
      const initialGrades: Record<string, { grade: number; feedback: string }> = {};
      data.submissions.forEach((submission: Submission) => {
        initialGrades[submission.id] = {
          grade: submission.grade || 0,
          feedback: submission.feedback || "",
        };
      });
      setGrades(initialGrades);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/assignments/${params.id}/submissions/${submissionId}/grade`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(grades[submissionId]),
      });

      if (!response.ok) throw new Error("Failed to grade submission");

      toast.success("Grade saved successfully");
      fetchAssignment(); // Refresh the data
    } catch (error) {
      console.error(error);
      toast.error("Failed to save grade");
    } finally {
      setSaving(false);
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
  const isOverdue = dueDate < new Date();
  const submissionCount = assignment.submissions.length;
  const gradedCount = assignment.submissions.filter(s => s.grade !== null).length;
  const averageGrade = assignment.submissions.reduce((acc, s) => acc + (s.grade || 0), 0) / submissionCount || 0;

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
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <div className="text-2xl font-bold">{submissionCount}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Graded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="text-2xl font-bold">{gradedCount}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{averageGrade.toFixed(1)}%</div>
              </div>
              <Progress value={averageGrade} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>
              {submissionCount} student{submissionCount !== 1 ? "s" : ""} submitted this assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {assignment.submissions.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar>
                            <AvatarImage src={submission.student.image || ""} />
                            <AvatarFallback>
                              {submission.student.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{submission.student.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Submitted {new Date(submission.submittedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {assignment.type === "DOCUMENT" && submission.fileUrl && (
                          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg mb-4">
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

                        {assignment.type === "TEST" && submission.answers && (
                          <div className="space-y-4">
                            {assignment.questions?.map((question, index) => (
                              <div key={question.id} className="space-y-2">
                                <div className="flex justify-between">
                                  <p className="font-medium">Question {index + 1}</p>
                                  <Badge variant="outline">{question.points} points</Badge>
                                </div>
                                <p className="text-sm">{question.questionText}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm">
                                    Student's answer: {submission.answers[question.id]}
                                  </p>
                                  {submission.answers[question.id] === question.correctAnswer && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Correct answer: {question.correctAnswer}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="w-full md:w-64 space-y-4">
                        <div>
                          <Label>Grade (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={grades[submission.id]?.grade || 0}
                            onChange={(e) =>
                              setGrades((prev) => ({
                                ...prev,
                                [submission.id]: {
                                  ...prev[submission.id],
                                  grade: Number(e.target.value),
                                },
                              }))
                            }
                          />
                        </div>

                        <div>
                          <Label>Feedback</Label>
                          <Textarea
                            value={grades[submission.id]?.feedback || ""}
                            onChange={(e) =>
                              setGrades((prev) => ({
                                ...prev,
                                [submission.id]: {
                                  ...prev[submission.id],
                                  feedback: e.target.value,
                                },
                              }))
                            }
                            rows={4}
                          />
                        </div>

                        <Button
                          onClick={() => handleGradeSubmission(submission.id)}
                          disabled={saving}
                          className="w-full"
                        >
                          {saving ? "Saving..." : "Save Grade"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {submissionCount === 0 && (
                <div className="text-center py-12">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No submissions yet</h3>
                  <p className="text-muted-foreground mt-1">
                    {isOverdue
                      ? "The deadline has passed and no students submitted this assignment."
                      : "Waiting for students to submit their work."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}