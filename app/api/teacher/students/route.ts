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

    const teacherId = session.user.id;

    // Get all students enrolled in teacher's classrooms
    const students = await db.user.findMany({
      where: {
        role: "STUDENT",
        enrollments: {
          some: {
            classroom: {
              teacherId,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        enrollments: {
          select: {
            id: true,
            createdAt: true,
            classroom: {
              select: {
                name: true,
              },
            },
          },
          where: {
            classroom: {
              teacherId,
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return new NextResponse(
      JSON.stringify(students),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching students:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}