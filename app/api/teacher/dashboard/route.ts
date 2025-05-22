import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    if (session.user.role !== "TEACHER") {
      return new NextResponse(
        JSON.stringify({ message: "Access denied" }),
        { status: 403 }
      );
    }

    const userId = session.user.id;

    // Get classroom count
    const classroomCount = await db.classroom.count({
      where: {
        teacherId: userId,
      },
    });

    // Get total student count across all classrooms
    const studentCount = await db.enrollment.count({
      where: {
        classroom: {
          teacherId: userId,
        },
      },
    });

    // Get total assignment count
    const assignmentCount = await db.assignment.count({
      where: {
        classroom: {
          teacherId: userId,
        },
      },
    });

    // Get count of submissions pending grading
    const pendingGradingCount = await db.submission.count({
      where: {
        assignment: {
          classroom: {
            teacherId: userId,
          },
        },
        grade: null,
      },
    });

    // Get recent classrooms
    const recentClassrooms = await db.classroom.findMany({
      where: {
        teacherId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        enrollments: true,
      },
    });

    // Get pending submissions
    const pendingSubmissions = await db.submission.findMany({
      where: {
        assignment: {
          classroom: {
            teacherId: userId,
          },
        },
        grade: null,
      },
      orderBy: {
        submittedAt: "desc",
      },
      take: 5,
      include: {
        student: {
          select: {
            name: true,
          },
        },
        assignment: {
          select: {
            title: true,
            classroom: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return new NextResponse(
      JSON.stringify({
        classroomCount,
        studentCount,
        assignmentCount,
        pendingGradingCount,
        recentClassrooms: recentClassrooms.map(c => ({
          id: c.id,
          name: c.name,
          studentCount: c.enrollments.length,
        })),
        pendingSubmissions: pendingSubmissions.map(s => ({
          id: s.id,
          assignmentTitle: s.assignment.title,
          studentName: s.student.name,
          submittedAt: s.submittedAt.toISOString(),
          classroomName: s.assignment.classroom.name,
        })),
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error("Error fetching teacher dashboard data:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}