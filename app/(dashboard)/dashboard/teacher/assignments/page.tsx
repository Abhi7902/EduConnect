"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Loader2,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Plus,
} from "lucide-react";

// Types
type Classroom = {
  id: string;
  name: string;
};

type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  submissionCount: number;
  classroom: Classroom;
};

export default function TeacherAssignmentsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const assignmentsResponse = await fetch("/api/teacher/assignments");
        if (!assignmentsResponse.ok) {
          throw new Error("Failed to fetch assignments");
        }
        const assignmentsData: Assignment[] = await assignmentsResponse.json();
        setAssignments(assignmentsData);

        const classroomsResponse = await fetch("/api/teacher/classrooms");
        if (!classroomsResponse.ok) {
          throw new Error("Failed to fetch classrooms");
        }
        const classroomsData: Classroom[] = await classroomsResponse.json();
        setClassrooms(classroomsData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, [router, status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading assignments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-red-500">{error}</h1>
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isOverdue = (dueDate: string): boolean => {
    return new Date(dueDate) < new Date();
  };

  const assignmentsByClassroom: Record<string, Assignment[]> = assignments.reduce(
    (acc: Record<string, Assignment[]>, assignment: Assignment) => {
      const classroomName = assignment.classroom.name;
      if (!acc[classroomName]) {
        acc[classroomName] = [];
      }
      acc[classroomName].push(assignment);
      return acc;
    },
    {}
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <div className="flex space-x-2">
          {classrooms.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  router.push(`/classroom/${e.target.value}/assignments/create`);
                }
              }}
              className="bg-blue-500 text-white rounded-md px-4 py-2 cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>
                Create Assignment
              </option>
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Assignments Created</h2>
          <p className="text-gray-600 mb-4">
            You haven't created any assignments yet. Create your first assignment to get started.
          </p>
          {classrooms.length > 0 ? (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  router.push(`/classroom/${e.target.value}/assignments/create`);
                }
              }}
              className="bg-blue-500 text-white rounded-md px-4 py-2 cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>
                Select a classroom
              </option>
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => router.push("/classroom/create")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create a Classroom First
            </button>
          )}
        </div>
      ) : (
        Object.entries(assignmentsByClassroom).map(
          ([classroomName, classroomAssignments]) => (
            <div key={classroomName} className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{classroomName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classroomAssignments.map((assignment: Assignment) => {
                  const overdue = isOverdue(assignment.dueDate);
                  return (
                    <div
                      key={assignment.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => router.push(`/assignment/${assignment.id}`)}
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-lg">{assignment.title}</h3>
                          {overdue ? (
                            <div className="flex items-center text-orange-500">
                              <Clock className="w-5 h-5 mr-1" />
                              <span className="text-sm">Past Due</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-green-500">
                              <CheckCircle className="w-5 h-5 mr-1" />
                              <span className="text-sm">Active</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {assignment.description}
                        </p>
                        <div className="flex items-center text-gray-500 text-sm mb-2">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Due: {formatDate(assignment.dueDate)}</span>
                        </div>
                        <div className="flex items-center text-gray-500 text-sm">
                          <FileText className="w-4 h-4 mr-1" />
                          <span>Submissions: {assignment.submissionCount}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )
      )}
    </div>
  );
}
