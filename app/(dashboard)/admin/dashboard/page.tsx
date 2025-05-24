"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { Users, GraduationCap, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardData {
  teacherCount: number;
  studentCount: number;
  teachers: {
    id: string;
    name: string;
    email: string;
    classroomCount: number;
  }[];
  students: {
    id: string;
    name: string;
    email: string;
    enrolledClassrooms: number;
  }[];
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/admin/dashboard");
        if (!response.ok) throw new Error("Failed to fetch dashboard data");
        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const downloadReport = async (type: 'teachers' | 'students') => {
    try {
      const response = await fetch(`/api/admin/reports/${type}`);
      if (!response.ok) throw new Error(`Failed to generate ${type} report`);
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to download ${type} report`);
    }
  };
 const onLogout = () => {
    signOut({ callbackUrl: "/" });
  };
  if (loading || !data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and monitor system users
          </p>
        </div>
        <Button variant="outline" onClick={onLogout}>
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Teachers
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.teacherCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.studentCount}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="teachers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Teachers List</CardTitle>
                <Button onClick={() => downloadReport('teachers')} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
              <CardDescription>
                A list of all registered teachers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {data.teachers.map((teacher) => (
                  <div key={teacher.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {teacher.email}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {teacher.classroomCount} classrooms
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Students List</CardTitle>
                <Button onClick={() => downloadReport('students')} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
              <CardDescription>
                A list of all registered students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {data.students.map((student) => (
                  <div key={student.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {student.enrolledClassrooms} enrollments
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}