"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { BookOpen, CheckCircle, Clock, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface DashboardData {
  classroomCount: number;
  upcomingAssignments: {
    id: string;
    title: string;
    dueDate: string;
    classroomName: string;
  }[];
  recentSubmissions: {
    id: string;
    assignmentTitle: string;
    submittedAt: string;
    grade: number | null;
  }[];
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/student/dashboard")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch dashboard data");
          return res.json();
        })
        .then((data) => {
          setDashboardData(data);
        })
        .catch((error) => {
          console.error(error);
          toast.error("Failed to load dashboard data");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [status]);

  // Placeholder data for initial render
  const placeholderData: DashboardData = {
    classroomCount: 3,
    upcomingAssignments: [
      {
        id: "1",
        title: "Introduction to Physics",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        classroomName: "Physics 101",
      },
      {
        id: "2",
        title: "Math Problem Set",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        classroomName: "Advanced Mathematics",
      },
    ],
    recentSubmissions: [
      {
        id: "1",
        assignmentTitle: "Chemistry Lab Report",
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        grade: 85,
      },
      {
        id: "2",
        assignmentTitle: "Literature Essay",
        submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        grade: 92,
      },
    ],
  };

  const data = dashboardData || placeholderData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || "Student"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Classrooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-500" />
              <div className="text-2xl font-bold">{data.classroomCount}</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/student/classrooms">View classrooms</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-amber-500" />
              <div className="text-2xl font-bold">{data.upcomingAssignments.length}</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/student/assignments">View assignments</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div className="text-2xl font-bold">{data.recentSubmissions.length}</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/student/assignments?filter=submitted">View submissions</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
            <CardDescription>Assignments due in the next week</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : data.upcomingAssignments.length > 0 ? (
              <div className="space-y-4">
                {data.upcomingAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-start space-x-4 border rounded-lg p-3">
                    <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900">
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-200" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{assignment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.classroomName} · Due {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/assignment/${assignment.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No upcoming assignments
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Your recently graded assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : data.recentSubmissions.length > 0 ? (
              <div className="space-y-4">
                {data.recentSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-start space-x-4 border rounded-lg p-3">
                    <div className="rounded-full p-2 bg-green-100 dark:bg-green-900">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-200" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{submission.assignmentTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {submission.grade !== null ? (
                        <>
                          <p className="font-bold">{submission.grade}%</p>
                          <Progress value={submission.grade} className="h-2 w-16" />
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Pending</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No recent submissions
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}