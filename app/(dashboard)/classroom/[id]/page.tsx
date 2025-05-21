"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { 
  BookOpen, 
  FileText, 
  Upload, 
  Users, 
  Plus, 
  Share2, 
  ClipboardCopy,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  code: string;
  createdAt: string;
  updatedAt: string;
  teacherId: string;
  teacher?: {
    name: string;
    email: string;
  };
  enrollments?: {
    id: string;
    student: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
  }[];
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  type: string;
  createdAt: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  submissions?: {
    id: string;
    studentId: string;
    submittedAt: string;
    grade: number | null;
  }[];
}

export default function ClassroomDetail() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteCode, setShowInviteCode] = useState(false);

  const isTeacher = session?.user?.role === "TEACHER";

  useEffect(() => {
    if (status === "authenticated" && id) {
      fetchClassroomData();
    }
  }, [id, status]);

  const fetchClassroomData = async () => {
    try {
      // Fetch classroom details
      const classroomRes = await fetch(`/api/classrooms/${id}`);
      if (!classroomRes.ok) throw new Error("Failed to fetch classroom");
      const classroomData = await classroomRes.json();
      setClassroom(classroomData);

      // Fetch classroom resources
      const resourcesRes = await fetch(`/api/classrooms/${id}/resources`);
      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json();
        setResources(resourcesData);
      }

      // Fetch classroom assignments
      const assignmentsRes = await fetch(`/api/classrooms/${id}/assignments`);
      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json();
        setAssignments(assignmentsData);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load classroom data");
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (classroom?.code) {
      navigator.clipboard.writeText(classroom.code)
        .then(() => {
          toast.success("Invite code copied to clipboard");
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to copy invite code");
        });
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-40 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <h2 className="text-2xl font-bold mb-2">Classroom not found</h2>
        <p className="text-muted-foreground mb-6">
          The classroom you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
      </div>
    );
  }

  // Format the creation date
  const createdDate = new Date(classroom.createdAt).toLocaleDateString();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{classroom.name}</h1>
          <p className="text-muted-foreground">
            {isTeacher ? "Created on" : "Joined on"} {createdDate}
          </p>
        </div>
        {isTeacher && (
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setShowInviteCode(true)}
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Students</DialogTitle>
                  <DialogDescription>
                    Share this code with your students so they can join your classroom.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-between p-4 mt-4 bg-muted rounded-md">
                  <p className="text-lg font-mono">{classroom.code}</p>
                  <Button size="sm" variant="ghost" onClick={copyInviteCode}>
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Students can enter this code on their dashboard to join your classroom.
                </p>
              </DialogContent>
            </Dialog>
            <Button onClick={() => router.push(`/classroom/${id}/edit`)} variant="outline">
              Edit
            </Button>
          </div>
        )}
      </div>

      {classroom.description && (
        <Card>
          <CardContent className="pt-6">
            <p>{classroom.description}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="resources" className="mt-8">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Resources</h2>
            {isTeacher && (
              <Button asChild>
                <a href={`/classroom/${id}/resources/create`}>
                  <Plus className="mr-2 h-4 w-4" /> Add Resource
                </a>
              </Button>
            )}
          </div>

          {resources.length === 0 ? (
            <div className="text-center py-12 bg-muted/40 rounded-lg">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No resources yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mt-1">
                {isTeacher 
                  ? "Add learning materials for your students by clicking the 'Add Resource' button." 
                  : "Your teacher hasn't added any resources yet."}
              </p>
              {isTeacher && (
                <Button asChild className="mt-4">
                  <a href={`/classroom/${id}/resources/create`}>
                    <Plus className="mr-2 h-4 w-4" /> Add First Resource
                  </a>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <Card key={resource.id} className="overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 h-20 flex items-center justify-center">
                    {getResourceIcon(resource.type)}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <CardDescription>
                          Added {new Date(resource.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{formatResourceType(resource.type)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {resource.description && (
                      <p className="text-sm mb-4 line-clamp-2">{resource.description}</p>
                    )}
                    <Button asChild size="sm" className="w-full">
                      <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                        Open Resource
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Assignments</h2>
            {isTeacher && (
              <Button asChild>
                <a href={`/classroom/${id}/assignments/create`}>
                  <Plus className="mr-2 h-4 w-4" /> Create Assignment
                </a>
              </Button>
            )}
          </div>

          {assignments.length === 0 ? (
            <div className="text-center py-12 bg-muted/40 rounded-lg">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No assignments yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mt-1">
                {isTeacher 
                  ? "Create your first assignment for students by clicking the 'Create Assignment' button." 
                  : "Your teacher hasn't assigned any work yet."}
              </p>
              {isTeacher && (
                <Button asChild className="mt-4">
                  <a href={`/classroom/${id}/assignments/create`}>
                    <Plus className="mr-2 h-4 w-4" /> Create First Assignment
                  </a>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const dueDate = new Date(assignment.dueDate);
                const isOverdue = dueDate < new Date();
                const isPending = !isTeacher && !assignment.submissions?.some(
                  (s) => s.studentId === session?.user?.id
                );
                
                return (
                  <Card key={assignment.id} className={`overflow-hidden ${isOverdue && isPending ? 'border-red-300 dark:border-red-800' : ''}`}>
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-3/4 p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">{assignment.title}</h3>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant={assignment.type === "TEST" ? "default" : "outline"}>
                                {assignment.type === "TEST" ? "Online Test" : "Document Submission"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Due {dueDate.toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {isPending && (
                            <Badge variant={isOverdue ? "destructive" : "outline"} className="ml-auto">
                              {isOverdue ? "Overdue" : "Pending"}
                            </Badge>
                          )}

                          {isTeacher && assignment.submissions && (
                            <Badge variant="outline" className="ml-auto">
                              {assignment.submissions.length} submission{assignment.submissions.length !== 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                        <p className="line-clamp-2 text-sm mb-4">{assignment.description}</p>
                      </div>
                      <div className="bg-muted sm:w-1/4 p-5 flex flex-row sm:flex-col items-center justify-center gap-3 border-t sm:border-t-0 sm:border-l">
                        <Button asChild size="sm" className="w-full">
                          <a href={`/assignment/${assignment.id}`}>
                            {isTeacher ? "View Details" : (isPending ? "Start Assignment" : "View Submission")}
                          </a>
                        </Button>
                        {isTeacher && (
                          <Button asChild size="sm" variant="outline" className="w-full">
                            <a href={`/assignment/${assignment.id}/grades`}>
                              View Grades
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              Students 
              {classroom.enrollments && (
                <span className="text-muted-foreground font-normal text-base ml-2">
                  ({classroom.enrollments.length})
                </span>
              )}
            </h2>
            {isTeacher && (
              <Button variant="outline" onClick={() => setShowInviteCode(true)}>
                <Share2 className="mr-2 h-4 w-4" /> Share Invite Code
              </Button>
            )}
          </div>

          {!classroom.enrollments || classroom.enrollments.length === 0 ? (
            <div className="text-center py-12 bg-muted/40 rounded-lg">
              <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No students enrolled yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mt-1">
                {isTeacher 
                  ? "Share your classroom code with students so they can join." 
                  : "You're the first student to join this classroom."}
              </p>
              {isTeacher && (
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 mt-4"
                  onClick={() => setShowInviteCode(true)}
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share Invite Code</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classroom.enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="flex items-center p-4 gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={enrollment.student.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {enrollment.student.name?.charAt(0).toUpperCase() || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{enrollment.student.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{enrollment.student.email}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getResourceIcon(type: string) {
  switch (type) {
    case "PDF":
      return <FileText className="h-8 w-8 text-red-500" />;
    case "DOCUMENT":
      return <FileText className="h-8 w-8 text-blue-500" />;
    case "PRESENTATION":
      return <Upload className="h-8 w-8 text-orange-500" />;
    case "VIDEO":
      return <Upload className="h-8 w-8 text-purple-500" />;
    case "LINK":
      return <Upload className="h-8 w-8 text-green-500" />;
    default:
      return <Upload className="h-8 w-8 text-gray-500" />;
  }
}

function formatResourceType(type: string) {
  return type.charAt(0) + type.slice(1).toLowerCase();
}