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
  submissions?: {
    id: string;
    grade: number | null;
    submittedAt: string;
  }[];
}

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/student/assignments");
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

  const pendingAssignments = assignments.filter(
    (a) => !a.submissions?.length && new Date(a.dueDate) > new Date()
  );
  const submittedAssignments = assignments.filter((a) => a.submissions?.length);
  const overdueAssignments = assignments.filter(
    (a) => !a.submissions?.length && new Date(a.dueDate) <= new Date()
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-muted-foreground">
          View and manage your assignments
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted ({submittedAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({overdueAssignments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingAssignments.length === 0 ? (
            <div className="text-center py-12 bg-muted/40 rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No pending assignments</h3>
              <p className="text-muted-foreground mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            pendingAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))
          )}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4 mt-6">
          {submittedAssignments.length === 0 ? (
            <div className="text-center py-12 bg-muted/40 rounded-lg">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No submitted assignments</h3>
              <p className="text-muted-foreground mt-1">
                Start working on your pending assignments
              </p>
            </div>
          ) : (
            submittedAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4 mt-6">
          {overdueAssignments.length === 0 ? (
            <div className="text-center py-12 bg-muted/40 rounded-lg">
              <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No overdue assignments</h3>
              <p className="text-muted-foreground mt-1">
                Keep up the good work!
              </p>
            </div>
          ) : (
            overdueAssignments.map((assignment) => (
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
  const submission = assignment.submissions?.[0];

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
            {submission ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                  </span>
                  {submission.grade !== null && (
                    <>
                      <span className="font-medium">{submission.grade}%</span>
                      <Progress value={submission.grade} className="w-20 h-2" />
                    </>
                  )}
                </div>
                <Button asChild>
                  <Link href={`/assignment/${assignment.id}`}>View Submission</Link>
                </Button>
              </>
            ) : (
              <>
                {isOverdue && (
                  <Badge variant="destructive">
                    Overdue by {Math.ceil((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </Badge>
                )}
                <Button asChild>
                  <Link href={`/assignment/${assignment.id}`}>Start Assignment</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}