import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const joinClassroomSchema = z.object({
  code: z.string().length(6, { message: "Invalid classroom code" }),
});

export async function POST(req: Request) {
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
        JSON.stringify({ message: "Only students can join classrooms" }),
        { status: 403 }
      );
    }

    const body = await req.json();
    const { code } = joinClassroomSchema.parse(body);

    // Find the classroom by code
    const classroom = await db.classroom.findUnique({
      where: {
        code,
      },
    });

    if (!classroom) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid classroom code" }),
        { status: 404 }
      );
    }

    // Check if student is already enrolled
    const existingEnrollment = await db.enrollment.findFirst({
      where: {
        studentId: session.user.id,
        classroomId: classroom.id,
      },
    });

    if (existingEnrollment) {
      return new NextResponse(
        JSON.stringify({ message: "You are already enrolled in this classroom" }),
        { status: 409 }
      );
    }

    // Create enrollment
    const enrollment = await db.enrollment.create({
      data: {
        studentId: session.user.id,
        classroomId: classroom.id,
      },
    });

    return new NextResponse(
      JSON.stringify({
        message: "Successfully joined classroom",
        classroomId: classroom.id,
        enrollment,
      }),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid code format", errors: error.errors }),
        { status: 400 }
      );
    }

    console.error("Error joining classroom:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}