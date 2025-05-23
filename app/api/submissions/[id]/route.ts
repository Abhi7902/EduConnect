import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
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

    const submissionId = params.id;
    const userId = session.user.id;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            description: true,
            dueDate: true,
            classroomId: true,
            classroom: {
              select: {
                id: true,
                name: true,
                description: true,
                code: true,
                createdAt: true,
                updatedAt: true,
                teacherId: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const isTeacher = submission.assignment.classroom.teacherId === userId;
    const isStudent = submission.student.id === userId;

    if (!isTeacher && !isStudent) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission" },
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

    const submissionId = params.id;
    const userId = session.user.id;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          select: {
            classroom: {
              select: {
                teacherId: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const isTeacher = submission.assignment.classroom.teacherId === userId;

    if (!isTeacher) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();

    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: data.grade,
        feedback: data.feedback,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
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

    const submissionId = params.id;
    const userId = session.user.id;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          select: {
            classroom: {
              select: {
                teacherId: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const isTeacher = submission.assignment.classroom.teacherId === userId;

    if (!isTeacher) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.submission.delete({ where: { id: submissionId } });

    return NextResponse.json({ message: "Submission deleted successfully" });
  } catch (error) {
    console.error("Error deleting submission:", error);
    return NextResponse.json(
      { error: "Failed to delete submission" },
      { status: 500 }
    );
  }
}
