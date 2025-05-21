import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Function to generate a random 6-character code
function generateClassroomCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar-looking characters
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Schema for classroom creation
const createClassroomSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
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

    // Verify user is a teacher
    if (session.user.role !== "TEACHER") {
      return new NextResponse(
        JSON.stringify({ message: "Only teachers can create classrooms" }),
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, description } = createClassroomSchema.parse(body);

    // Generate a unique classroom code
    let code: string;
    let isUnique = false;

    // Keep generating codes until we find a unique one
    while (!isUnique) {
      code = generateClassroomCode();
      const existingClass = await db.classroom.findUnique({
        where: { code },
      });
      if (!existingClass) {
        isUnique = true;
      }
    }

    // Create the classroom
    const classroom = await db.classroom.create({
      data: {
        name,
        description,
        code: code!,
        teacherId: session.user.id,
      },
    });

    return new NextResponse(
      JSON.stringify({
        id: classroom.id,
        message: "Classroom created successfully",
      }),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid data", errors: error.errors }),
        { status: 400 }
      );
    }

    console.error("Error creating classroom:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = session.user.id;
    const role = session.user.role;
    
    let classrooms;

    if (role === "TEACHER") {
      // Teachers see the classrooms they created
      classrooms = await db.classroom.findMany({
        where: {
          teacherId: userId,
        },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          enrollments: {
            select: {
              id: true,
            },
          },
        },
      });
    } else {
      // Students see the classrooms they're enrolled in
      classrooms = await db.classroom.findMany({
        where: {
          enrollments: {
            some: {
              studentId: userId,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          teacher: {
            select: {
              name: true,
            },
          },
        },
      });
    }

    return new NextResponse(
      JSON.stringify(classrooms),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}