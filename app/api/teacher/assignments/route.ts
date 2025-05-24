import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all classrooms where the user is a teacher
    const classrooms = await prisma.classroom.findMany({
      where: {
        teacherId: userId,
      },
      select: {
        id: true,
        name: true,
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
          },
        },
        submissions: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        {
          dueDate: "asc",
        },
      ],
    });

    // Format the response to include submission counts
    const formattedAssignments = assignments.map((assignment) => {
      return {
        ...assignment,
        submissionCount: assignment.submissions.length,
        submissions: undefined, // Clean up response
      };
    });

    // Ensure the payload is always an array (never null)
    return NextResponse.json(Array.isArray(formattedAssignments) ? formattedAssignments : []);
  } catch (error) {
    console.log(error)
    // console.log("Error fetching teacher assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
