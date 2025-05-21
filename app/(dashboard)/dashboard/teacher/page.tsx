"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { BookOpen, Plus, Users, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  classroomCount: number;
  studentCount: number;
  assignmentCount: number;
  pendingGradingCount: number;
  recentClassrooms: {
    id: string;
    name: string;
    studentCount: number;
  }[];
  pendingSubmissions: {
    id: string;
    assignmentTitle: string;
    studentName: string;
    submittedAt: string;
    classroomName: string;
  }[];
}

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/teacher/dashboard")
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
    studentCount: 45,
    assignmentCount: 12,
    pendingGradingCount: 8,
    recentClassrooms: [
      {
        id: "1",
        name: "Introduction to Computer Science",
        studentCount: 28,
      },
      {
        id: "2",
        name: "Advanced Physics",
        studentCount: 17,
      },
    ],
    pendingSubmissions: [
      {
        id: "1",
        assignmentTitle: "Algorithm Design Exercise",
        studentName: "John Doe",
        submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        classroomName: "Introduction to Computer Science",
      },
      {
        id: "2",
        assignmentTitle: "Physics Lab Report",
        studentName: "Jane Smith",
        submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        classroomName: "Advanced Physics",
      },
    ],
  };

  const data = dashboardData || placeholderData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || "Teacher"}
          </p>
        </div>
        <Button asChild>
          <Link href="/classroom/create">
            <Plus className="mr-2 h-4 w-4" /> Create Classroom
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classrooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-500" />
              <div className="text-2xl font-bold">{data.classroomCount}</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/teacher/classrooms">View all</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-indigo-500" />
              <div className="text-2xl font-bold">{data.studentCount}</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/teacher/students">View all</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-amber-500" />
              <div className="text-2xl font-bold">{data.assignmentCount}</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/teacher/assignments">View all</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-red-500" />
              <div className="text-2xl font-bold">{data.pendingGradingCount}</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/teacher/assignments?filter=pending">Grade now</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Classrooms</CardTitle>
            <CardDescription>Your most recent classrooms</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : data.recentClassrooms.length > 0 ? (
              <div className="space-y-4">
                {data.recentClassrooms.map((classroom) => (
                  <div key={classroom.id} className="flex items-start space-x-4 border rounded-lg p-3">
                    <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900">
                      <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-200" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{classroom.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {classroom.studentCount} students enrolled
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/classroom/${classroom.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No classrooms yet
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/classroom/create">
                <Plus className="mr-2 h-4 w-4" /> Create New Classroom
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Submissions</CardTitle>
            <CardDescription>Recent submissions awaiting grading</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : data.pendingSubmissions.length > 0 ? (
              <div className="space-y-4">
                {data.pendingSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-start space-x-4 border rounded-lg p-3">
                    <div className="rounded-full p-2 bg-red-100 dark:bg-red-900">
                      <FileText className="h-4 w-4 text-red-600 dark:text-red-200" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{submission.assignmentTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {submission.studentName} · {submission.classroomName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/submission/${submission.id}`}>Grade</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No pending submissions
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}