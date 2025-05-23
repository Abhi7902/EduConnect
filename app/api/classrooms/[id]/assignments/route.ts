import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classroomId } = await params; // Unwrapping params

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // Check if the user has access to this classroom
    let hasAccess;

    if (userRole === "TEACHER") {
      // Teachers should be the owner of the classroom
      hasAccess = await db.classroom.findFirst({
        where: {
          id: classroomId,
          teacherId: userId,
        },
      });
    } else {
      // Students should be enrolled in the classroom
      hasAccess = await db.classroom.findFirst({
        where: {
          id: classroomId,
          enrollments: {
            some: {
              studentId: userId,
            },
          },
        },
      });
    }

    if (!hasAccess) {
      return new NextResponse(
        JSON.stringify({ message: "Classroom not found or access denied" }),
        { status: 404 }
      );
    }

    // Fetch assignments for the classroom
    const assignments = await db.assignment.findMany({
      where: {
        classroomId,
      },
      orderBy: {
        dueDate: "asc",
      },
      include: {
        submissions: userRole === "STUDENT"
          ? {
              where: {
                studentId: userId,
              },
              select: {
                id: true,
                studentId: true,
                submittedAt: true,
                grade: true,
              },
            }
          : {
              select: {
                id: true,
                studentId: true,
                submittedAt: true,
                grade: true,
              },
            },
      },
    });

    return new NextResponse(
      JSON.stringify(assignments),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classroomId } = await params; // Unwrapping params

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    if (session.user.role !== "TEACHER") {
      return new NextResponse(
        JSON.stringify({ message: "Only teachers can create assignments" }),
        { status: 403 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();

    // Validate that the teacher owns this classroom
    const classroom = await db.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId: userId,
      },
    });

    if (!classroom) {
      return new NextResponse(
        JSON.stringify({ message: "Classroom not found or you do not have permission" }),
        { status: 404 }
      );
    }

    // Create the assignment
    const assignment = await db.assignment.create({
      data: {
        title: body.title,
        description: body.description,
        dueDate: new Date(body.dueDate),
        type: body.type,
        classroomId,
        // Create questions if this is a test assignment
        ...(body.type === "TEST" && body.questions
          ? {
              questions: {
                createMany: {
                  data: body.questions.map((q: any) => ({
                    questionText: q.questionText,
                    type: q.type,
                    options: q.options || [],
                    correctAnswer: q.correctAnswer,
                    points: q.points || 1,
                  })),
                },
              },
            }
          : {}),
      },
    });

    return new NextResponse(
      JSON.stringify(assignment),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating assignment:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}