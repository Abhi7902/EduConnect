import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Only students can submit assignments" },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    // Using unknown + type assertion for File safety
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Invalid or no file uploaded" }, { status: 400 });
    }

    const assignmentIdRaw = formData.get("assignmentId");
    if (typeof assignmentIdRaw !== "string") {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }
    const assignmentId = assignmentIdRaw;

    // Fetch assignment with classroom and students
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        classroom: {
          include: {
            students: { select: { id: true } },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Check if user is a student in classroom
    const isStudentInClassroom = assignment.classroom.students.some(
      (student) => student.id === session.user!.id
    );

    if (!isStudentInClassroom) {
      return NextResponse.json(
        { error: "You don't have access to this assignment" },
        { status: 403 }
      );
    }

    // Check due date
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isPastDue = now > dueDate;

    // Check if submission exists
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId,
        studentId: session.user.id,
      },
    });

    if (isPastDue && !existingSubmission) {
      return NextResponse.json(
        { error: "Assignment is past due date" },
        { status: 400 }
      );
    }

    // Save file to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadDir = join(process.cwd(), "uploads", assignmentId);
    await mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const originalFilename = file.name;
    const filename = `${timestamp}-${originalFilename}`;
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, buffer);

    // Store relative URL for file
    const fileUrl = `/uploads/${assignmentId}/${filename}`;

    // Create or update submission in DB
    let submission;
    if (existingSubmission) {
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          fileUrl: fileUrl,
          submittedAt: now,
          grade: null,
          feedback: null,
        },
      });
    } else {
      submission = await prisma.submission.create({
        data: {
          fileUrl: fileUrl,
          submittedAt: now,
          assignment: { connect: { id: assignmentId } },
          student: { connect: { id: session.user.id } },
        },
      });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json(
      { error: "Failed to submit assignment" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const assignmentId = url.searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }

    if (session.user.role === "TEACHER") {
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { classroom: true },
      });

      if (!assignment) {
        return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
      }

      if (assignment.classroom.teacherId !== session.user.id) {
        return NextResponse.json(
          { error: "You don't have access to this assignment" },
          { status: 403 }
        );
      }

      const submissions = await prisma.submission.findMany({
        where: { assignmentId },
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { submittedAt: "desc" },
      });

      return NextResponse.json(submissions);
    }

    if (session.user.role === "STUDENT") {
      const submission = await prisma.submission.findFirst({
        where: {
          assignmentId,
          studentId: session.user.id,
        },
      });

      return NextResponse.json(submission || null);
    }

    return NextResponse.json({ error: "Invalid user role" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}