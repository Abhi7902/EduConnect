import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
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
    const user = session.user;

    const classroomId = params.id;

    // Verify classroom exists and user has access
    const classroom = await prisma.classroom.findUnique({
      where: {
        id: classroomId,
      },
      include: {
        enrollments: { include: { student: true } },
        teacher: true,
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      );
    }

    // Check if user is teacher or student in this classroom
    const isTeacher = classroom.teacherId === user.id;
    const isStudent = classroom.enrollments.some(
      (enrollment) => enrollment.studentId === user.id
    );

    if (!isTeacher && !isStudent) {
      return NextResponse.json(
        { error: "You don't have access to this classroom" },
        { status: 403 }
      );
    }

    // Get assignments for the classroom
    const assignments = await prisma.assignment.findMany({
      where: {
        classroomId,
      },
      include: {
        submissions: {
          where: isStudent ? { studentId: user.id } : undefined,
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user;

    const classroomId = params.id;
    const data = await request.json();

    // Verify classroom exists and user is the teacher
    const classroom = await prisma.classroom.findUnique({
      where: {
        id: classroomId,
        teacherId: user.id,
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found or you're not the teacher" },
        { status: 403 }
      );
    }

    // Create new assignment (type is required)
    const assignment = await prisma.assignment.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        totalPoints: data.totalPoints,
        type: data.type, // <-- type is required!
        classroom: {
          connect: {
            id: classroomId,
          },
        },
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}