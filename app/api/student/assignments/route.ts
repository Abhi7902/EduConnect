import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"; // import from next-auth/next for server session
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all classrooms where the user is enrolled as a student via enrollments relation
    const classrooms = await prisma.classroom.findMany({
      where: {
        enrollments: {  // <-- use enrollments relation, not students directly
          some: {
            studentId: userId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    const classroomIds = classrooms.map((classroom) => classroom.id);

    // Get all assignments from those classrooms
    const assignments = await prisma.assignment.findMany({
      where: {
        classroomId: {
          in: classroomIds,
        },
      },
      include: {
        classroom: {
          select: {
            name: true,
            teacher: {
              select: {
                name: true,
              },
            },
          },
        },
        submissions: {
          where: {
            studentId: userId,
          },
        },
      },
      orderBy: [
        {
          dueDate: "asc",
        },
      ],
    });

    // Format the response to include submission status and remove submissions array
    const formattedAssignments = assignments.map((assignment) => {
      const hasSubmitted = assignment.submissions.length > 0;
      const submission = hasSubmitted ? assignment.submissions[0] : null;

      return {
        ...assignment,
        hasSubmitted,
        submission,
        submissions: undefined,
      };
    });

    return NextResponse.json(formattedAssignments);
  } catch (error) {
    console.error("Error fetching student assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
