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

    if (session.user.role !== "STUDENT") {
      return new NextResponse(
        JSON.stringify({ message: "Access denied" }),
        { status: 403 }
      );
    }

    const userId = session.user.id;

    // Get enrolled classrooms count
    const classroomCount = await db.enrollment.count({
      where: {
        studentId: userId,
      },
    });

    // Get upcoming assignments
    const now = new Date();
    const upcomingAssignments = await db.assignment.findMany({
      where: {
        classroom: {
          enrollments: {
            some: {
              studentId: userId,
            },
          },
        },
        dueDate: {
          gt: now,
        },
        submissions: {
          none: {
            studentId: userId,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 5,
      include: {
        classroom: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get recent submissions
    const recentSubmissions = await db.submission.findMany({
      where: {
        studentId: userId,
      },
      orderBy: {
        submittedAt: "desc",
      },
      take: 5,
      include: {
        assignment: {
          select: {
            title: true,
          },
        },
      },
    });

    return new NextResponse(
      JSON.stringify({
        classroomCount,
        upcomingAssignments: upcomingAssignments.map(a => ({
          id: a.id,
          title: a.title,
          dueDate: a.dueDate,
          classroomName: a.classroom.name,
        })),
        recentSubmissions: recentSubmissions.map(s => ({
          id: s.id,
          assignmentTitle: s.assignment.title,
          submittedAt: s.submittedAt,
          grade: s.grade,
        })),
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching student dashboard data:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}