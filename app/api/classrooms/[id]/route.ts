import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userRole = session.user.role;
    const classroomId = params.id;

    // Check if the user has access to this classroom
    let classroom;

    if (userRole === "TEACHER") {
      // Teachers should be the owner of the classroom
      classroom = await db.classroom.findFirst({
        where: {
          id: classroomId,
          teacherId: userId,
        },
        include: {
          enrollments: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      });
    } else {
      // Students should be enrolled in the classroom
      classroom = await db.classroom.findFirst({
        where: {
          id: classroomId,
          enrollments: {
            some: {
              studentId: userId,
            },
          },
        },
        include: {
          teacher: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    }

    if (!classroom) {
      return new NextResponse(
        JSON.stringify({ message: "Classroom not found or access denied" }),
        { status: 404 }
      );
    }

    return new NextResponse(
      JSON.stringify(classroom),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching classroom:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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
        JSON.stringify({ message: "Only teachers can update classrooms" }),
        { status: 403 }
      );
    }

    const userId = session.user.id;
    const classroomId = params.id;
    const body = await req.json();

    // Validate that the teacher owns this classroom
    const existingClassroom = await db.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId: userId,
      },
    });

    if (!existingClassroom) {
      return new NextResponse(
        JSON.stringify({ message: "Classroom not found or you do not have permission to update it" }),
        { status: 404 }
      );
    }

    // Update the classroom
    const updatedClassroom = await db.classroom.update({
      where: {
        id: classroomId,
      },
      data: {
        name: body.name,
        description: body.description,
      },
    });

    return new NextResponse(
      JSON.stringify(updatedClassroom),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating classroom:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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
        JSON.stringify({ message: "Only teachers can delete classrooms" }),
        { status: 403 }
      );
    }

    const userId = session.user.id;
    const classroomId = params.id;

    // Validate that the teacher owns this classroom
    const existingClassroom = await db.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId: userId,
      },
    });

    if (!existingClassroom) {
      return new NextResponse(
        JSON.stringify({ message: "Classroom not found or you do not have permission to delete it" }),
        { status: 404 }
      );
    }

    // Delete the classroom (and cascade delete enrollments, assignments, etc.)
    await db.classroom.delete({
      where: {
        id: classroomId,
      },
    });

    return new NextResponse(
      JSON.stringify({ message: "Classroom deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting classroom:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}