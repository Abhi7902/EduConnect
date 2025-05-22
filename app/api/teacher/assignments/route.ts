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

    // Get all assignments from teacher's classrooms
    const assignments = await db.assignment.findMany({
      where: {
        classroom: {
          teacherId: userId,
        },
      },
      include: {
        classroom: {
          select: {
            name: true,
          },
        },
        submissions: {
          select: {
            id: true,
            studentId: true,
            submittedAt: true,
            grade: true,
          },
        },
      },
      orderBy: {
        dueDate: "desc",
      },
    });

    return new NextResponse(
      JSON.stringify(assignments),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching teacher assignments:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}