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

    // Get all assignments from enrolled classrooms
    const assignments = await db.assignment.findMany({
      where: {
        classroom: {
          enrollments: {
            some: {
              studentId: userId,
            },
          },
        },
      },
      include: {
        classroom: {
          select: {
            name: true,
          },
        },
        submissions: {
          where: {
            studentId: userId,
          },
          select: {
            id: true,
            grade: true,
            submittedAt: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    return new NextResponse(
      JSON.stringify(assignments),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching student assignments:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}