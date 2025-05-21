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

    // Fetch resources for the classroom
    const resources = await db.resource.findMany({
      where: {
        classroomId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new NextResponse(
      JSON.stringify(resources),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching resources:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}

export async function POST(
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
        JSON.stringify({ message: "Only teachers can add resources" }),
        { status: 403 }
      );
    }

    const userId = session.user.id;
    const classroomId = params.id;
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

    // Create the resource
    const resource = await db.resource.create({
      data: {
        title: body.title,
        description: body.description,
        fileUrl: body.fileUrl,
        type: body.type,
        classroomId,
      },
    });

    return new NextResponse(
      JSON.stringify(resource),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding resource:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}