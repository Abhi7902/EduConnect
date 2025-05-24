import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    // Get teachers count and details
    const teachers = await db.user.findMany({
      where: {
        role: "TEACHER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        classrooms: {
          select: {
            id: true,
          },
        },
      },
    });

    // Get students count and details
    const students = await db.user.findMany({
      where: {
        role: "STUDENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        enrollments: {
          select: {
            id: true,
          },
        },
      },
    });

    const formattedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      classroomCount: teacher.classrooms.length,
    }));

    const formattedStudents = students.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      enrolledClassrooms: student.enrollments.length,
    }));

    return new NextResponse(
      JSON.stringify({
        teacherCount: teachers.length,
        studentCount: students.length,
        teachers: formattedTeachers,
        students: formattedStudents,
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}