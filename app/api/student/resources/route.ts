<<<<<<< HEAD
=======
"use client";

>>>>>>> cb97eeba0418cf71bf3935ebdedc8689c1a94084
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
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
        JSON.stringify({ message: "Access denied" }),
        { status: 403 }
      );
    }

<<<<<<< HEAD
    const userId = session.user.id;

    // Get all resources from enrolled classrooms
=======
    const studentId = session.user.id;

    // Get all resources from classrooms where the student is enrolled
>>>>>>> cb97eeba0418cf71bf3935ebdedc8689c1a94084
    const resources = await db.resource.findMany({
      where: {
        classroom: {
          enrollments: {
            some: {
<<<<<<< HEAD
              studentId: userId,
=======
              studentId,
>>>>>>> cb97eeba0418cf71bf3935ebdedc8689c1a94084
            },
          },
        },
      },
      include: {
        classroom: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new NextResponse(
      JSON.stringify(resources),
<<<<<<< HEAD
      { status: 200 }
=======
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
>>>>>>> cb97eeba0418cf71bf3935ebdedc8689c1a94084
    );
  } catch (error) {
    console.error("Error fetching resources:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}