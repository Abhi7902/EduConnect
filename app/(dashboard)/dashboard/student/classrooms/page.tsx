"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookOpen, Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  teacher: {
    name: string;
  };
}

export default function StudentClassrooms() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const response = await fetch("/api/classrooms");
      if (!response.ok) throw new Error("Failed to fetch classrooms");
      const data = await response.json();
      setClassrooms(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load classrooms");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClassroom = async () => {
    if (!code.trim()) return;

    setJoining(true);
    try {
      const response = await fetch("/api/classrooms/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to join classroom");
      }

      const data = await response.json();
      toast.success("Successfully joined classroom");
      router.push(`/classroom/${data.classroomId}`);
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to join classroom");
      }
    } finally {
      setJoining(false);
      setCode("");
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Classrooms</h1>
          <p className="text-muted-foreground">
            View and manage your enrolled classrooms
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Join Classroom
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join a Classroom</DialogTitle>
              <DialogDescription>
                Enter the classroom code provided by your teacher
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Enter classroom code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
              <Button
                className="w-full"
                onClick={handleJoinClassroom}
                disabled={joining || !code.trim()}
              >
                {joining ? "Joining..." : "Join Classroom"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {classrooms.length === 0 ? (
        <div className="text-center py-12 bg-muted/40 rounded-lg">
          <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">No classrooms yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-1">
            Join your first classroom by clicking the "Join Classroom" button and entering a classroom code.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((classroom) => (
            <Card key={classroom.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{classroom.name}</CardTitle>
                <CardDescription>
                  Teacher: {classroom.teacher.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {classroom.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {classroom.description}
                  </p>
                )}
                <Button asChild className="w-full">
                  <Link href={`/classroom/${classroom.id}`}>View Classroom</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}