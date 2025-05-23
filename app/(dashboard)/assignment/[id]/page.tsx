"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Loader2,
  FileText,
  Upload,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Define types for assignment and submission objects
interface Submission {
  fileName: string;
  submittedAt: string;
  grade: number | null;
  feedback?: string;
}

interface Assignment {
  title: string;
  dueDate: string;
  totalPoints: number;
  description: string;
  submissions?: Submission[];
}

export default function AssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const fetchAssignment = async () => {
      try {
        console.log(params.id);
        const response = await fetch(`/api/assignments/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch assignment");

        const data: Assignment = await response.json();
        setAssignment(data);

        if (data.submissions && data.submissions.length > 0) {
          setSubmission(data.submissions[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching assignment:", error);
        setError("Failed to load assignment details");
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [params.id, router, status]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file to submit");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assignmentId", params.id as string);

      const response = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to submit assignment");

      const data: Submission = await response.json();
      setSubmission(data);
      setFile(null);

      const refreshed = await fetch(`/api/assignments/${params.id}`);
      const updatedAssignment: Assignment = await refreshed.json();
      setAssignment(updatedAssignment);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      setError("Failed to submit assignment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading assignment...</span>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-red-500">{error}</h1>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold">Assignment not found</h1>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isOverdue = new Date(assignment.dueDate) < new Date();
  const canSubmit =
    session?.user?.role === "STUDENT" && (!isOverdue || submission);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{assignment.title}</h1>
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">Due:</span>{" "}
              {formatDate(assignment.dueDate)}
              {isOverdue && !submission && (
                <span className="ml-2 text-red-500 font-semibold">Overdue</span>
              )}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Points:</span>{" "}
              {assignment.totalPoints}
            </p>
          </div>
          <div className="flex items-center">
            {submission && (
              <div className="flex items-center text-green-500">
                <CheckCircle className="w-5 h-5 mr-1" />
                <span>Submitted</span>
              </div>
            )}
          </div>
        </div>

        <div className="prose max-w-none mb-8">
          <h2 className="text-xl font-semibold mb-2">Instructions</h2>
          <div className="whitespace-pre-wrap">{assignment.description}</div>
        </div>

        {session?.user?.role === "STUDENT" && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Your Submission</h2>
            {submission ? (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <FileText className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="font-medium">{submission.fileName}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Submitted on {formatDate(submission.submittedAt)}
                </p>
                {submission.grade !== null ? (
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <p className="font-semibold">
                      Grade: {submission.grade} / {assignment.totalPoints}
                    </p>
                    {submission.feedback && (
                      <div className="mt-2">
                        <p className="font-semibold">Feedback:</p>
                        <p className="whitespace-pre-wrap">
                          {submission.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Not graded yet</p>
                )}

                {!isOverdue && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-700 mb-2">
                      You can resubmit your work before the due date.
                    </p>
                    <form onSubmit={handleSubmit}>
                      <div className="flex items-center">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                        />
                        <button
                          type="submit"
                          disabled={!file || submitting}
                          className={`ml-4 px-4 py-2 rounded text-white flex items-center ${
                            !file || submitting
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600"
                          }`}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Resubmit
                            </>
                          )}
                        </button>
                      </div>
                      {error && (
                        <p className="mt-2 text-red-500 text-sm">{error}</p>
                      )}
                    </form>
                  </div>
                )}
              </div>
            ) : canSubmit ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload your work
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>
                {error && (
                  <p className="mt-2 text-red-500 text-sm">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={!file || submitting}
                  className={`px-4 py-2 rounded text-white flex items-center ${
                    !file || submitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Submit Assignment
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="bg-red-50 p-4 rounded-md text-red-700">
                <p className="font-medium flex items-center">
                  <XCircle className="w-5 h-5 mr-2" />
                  The deadline for this assignment has passed.
                </p>
              </div>
            )}
          </div>
        )}

        {session?.user?.role === "TEACHER" && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Submissions</h2>
            <button
              onClick={() => router.push(`/assignment/${params.id}/grades`)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              View and Grade Submissions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
