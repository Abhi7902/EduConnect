"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  type: "TEST" | "DOCUMENT";
  classroom: {
    name: string;
  };
  submissions: {
    id: string;
    studentId: string;
    submittedAt: string;
    grade: number | null;
  }[];
}

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/teacher/assignments");
      if (!response.ok) throw new Error("Failed to fetch assignments");
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40 mt-2" />
        </div>
        <Skeleton className="h-10 w-[400px]" />
        <div className="space-y-4">
          <Skeleton className="h-[100px]" />
          <Skeleton className="h-[100px]" />
          <Skeleton className="h-[100px]" />
        </div>
      </div>
    );
  }

  const activeAssignments = assignments.filter(
    (a) => new Date(a.dueDate) > new Date()
  );
  const pastAssignments = assignments.filter(
    (a) => new Date(a.dueDate) <= new Date()
  );
  const pendingGrading = assignments.filter((a) =>
    a.submissions.some((s) => s.grade === null)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">
            Manage your classroom assignments
          </p>
        </div>
        <Button asChild>
          <Link href="/assignments/create">Create Assignment</Link>
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="grading">
            Needs Grading ({pendingGrading.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {activeAssignments.length === 0 ? (
            <div className="text-center py-12 bg-muted/40 rounded-lg">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No active assignments</h3>
              <p className="text-muted-foreground mt-1">
                Create your first assignment to get started
              </p>
              <Button asChild className="mt-4">
                <Link href="/assignments/create">Create Assignment</Link>
              </Button>
            </div>
          ) : (
            activeAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 mt-6">
          {pastAssignments.length === 0 ? (
            <div className="text-center py-12 bg-muted/40 rounded-lg">
              <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No past assignments</h3>
              <p className="text-muted-foreground mt-1">
                Your previous assignments will appear here
              </p>
            </div>
          ) : (
            pastAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))
          )}
        </TabsContent>

        <TabsContent value="grading" className="space-y-4 mt-6">
          {pendingGrading.length === 0 ? (
            <div className="text-center py-12 bg-muted/40 rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No assignments need grading</h3>
              <p className="text-muted-foreground mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            pendingGrading.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const dueDate = new Date(assignment.dueDate);
  const isOverdue = dueDate <= new Date();
  const submissionCount = assignment.submissions.length;
  const gradedCount = assignment.submissions.filter((s) => s.grade !== null).length;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">{assignment.title}</h3>
              <Badge variant={assignment.type === "TEST" ? "default" : "outline"}>
                {assignment.type === "TEST" ? "Online Test" : "Document Submission"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {assignment.classroom.name} · Due {dueDate.toLocaleDateString()}
            </p>
            <p className="text-sm line-clamp-2">{assignment.description}</p>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {submissionCount} submission{submissionCount !== 1 ? "s" : ""}
              </span>
              {submissionCount > 0 && (
                <>
                  <span className="font-medium">{Math.round((gradedCount / submissionCount) * 100)}% graded</span>
                  <Progress
                    value={(gradedCount / submissionCount) * 100}
                    className="w-20 h-2"
                  />
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={`/assignment/${assignment.id}`}>View Details</Link>
              </Button>
              <Button asChild>
                <Link href={`/assignment/${assignment.id}/grades`}>Grade Submissions</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}