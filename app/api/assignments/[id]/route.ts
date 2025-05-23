import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"; // updated import
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignmentId = params.id;
    const userId = session.user.id;
    const userRole = session.user.role;

    // Fetch the assignment with related data
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        classroom: {
          include: {
            teacher: {
              select: { id: true, name: true },
            },
            enrollments: {
              select: {
                student: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
        submissions:
          userRole === "STUDENT"
            ? {
                where: { studentId: userId },
              }
            : {
                include: {
                  student: {
                    select: { id: true, name: true, email: true },
                  },
                },
              },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    const classroom = assignment.classroom;

    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom data not found" },
        { status: 404 }
      );
    }

    // Check if user has access (teacher or enrolled student)
    const isTeacher = classroom.teacherId === userId;
    const isStudent = classroom.enrollments?.some(
      (enrollment) => enrollment.student.id === userId
    );

    if (!isTeacher && !isStudent) {
      return NextResponse.json(
        { error: "You don't have access to this assignment" },
        { status: 403 }
      );
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Only teachers can update assignments" },
        { status: 403 }
      );
    }

    const assignmentId = params.id;
    const data = await request.json();

    // Verify teacher owns the assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { classroom: true },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    if (assignment.classroom?.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this assignment" },
        { status: 403 }
      );
    }

    // Prepare update data, only include defined fields
    const updateData: Partial<{
      title: string;
      description: string;
      dueDate: Date;
      totalPoints: number;
    }> = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.dueDate !== undefined) {
      updateData.dueDate = new Date(data.dueDate);
    }
    if (data.totalPoints !== undefined) {
      updateData.totalPoints = data.totalPoints;
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: updateData,
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Only teachers can delete assignments" },
        { status: 403 }
      );
    }

    const assignmentId = params.id;

    // Verify teacher owns the assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { classroom: true },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    if (assignment.classroom?.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this assignment" },
        { status: 403 }
      );
    }

    // Delete submissions, then assignment
    await prisma.submission.deleteMany({
      where: { assignmentId },
    });

    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}
