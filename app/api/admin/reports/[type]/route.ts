import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { type: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { type } = params;

    if (type !== "teachers" && type !== "students") {
      return new NextResponse(
        JSON.stringify({ message: "Invalid report type" }),
        { status: 400 }
      );
    }

    let data;
    let csvContent;

    if (type === "teachers") {
      data = await db.user.findMany({
        where: {
          role: "TEACHER",
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          classrooms: {
            select: {
              id: true,
            },
          },
        },
      });

      csvContent = [
        ["ID", "Name", "Email", "Join Date", "Number of Classrooms"],
        ...data.map(teacher => [
          teacher.id,
          teacher.name,
          teacher.email,
          teacher.createdAt.toISOString().split('T')[0],
          teacher.classrooms.length.toString(),
        ]),
      ].map(row => row.join(",")).join("\n");
    } else {
      data = await db.user.findMany({
        where: {
          role: "STUDENT",
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          enrollments: {
            select: {
              id: true,
            },
          },
        },
      });

      csvContent = [
        ["ID", "Name", "Email", "Join Date", "Number of Enrollments"],
        ...data.map(student => [
          student.id,
          student.name,
          student.email,
          student.createdAt.toISOString().split('T')[0],
          student.enrollments.length.toString(),
        ]),
      ].map(row => row.join(",")).join("\n");
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=${type}-report.csv`,
      },
    });
  } catch (error) {
    console.error(`Error generating ${params.type} report:`, error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}