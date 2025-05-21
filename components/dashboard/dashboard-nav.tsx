"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Upload, 
  LogOut, 
  User, 
  Menu,
  ChevronRight,
  Home
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  forRoles: string[];
}

export default function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const isTeacher = session?.user?.role === "TEACHER";
  const isStudent = session?.user?.role === "STUDENT";

  const navItems: NavItem[] = [
    {
      title: "Home",
      href: isTeacher ? "/dashboard/teacher" : "/dashboard/student",
      icon: <Home className="h-5 w-5" />,
      forRoles: ["TEACHER", "STUDENT"],
    },
    {
      title: "My Classrooms",
      href: isTeacher ? "/dashboard/teacher/classrooms" : "/dashboard/student/classrooms",
      icon: <BookOpen className="h-5 w-5" />,
      forRoles: ["TEACHER", "STUDENT"],
    },
    {
      title: "Assignments",
      href: isTeacher ? "/dashboard/teacher/assignments" : "/dashboard/student/assignments",
      icon: <FileText className="h-5 w-5" />,
      forRoles: ["TEACHER", "STUDENT"],
    },
    {
      title: "Resources",
      href: isTeacher ? "/dashboard/teacher/resources" : "/dashboard/student/resources",
      icon: <Upload className="h-5 w-5" />,
      forRoles: ["TEACHER", "STUDENT"],
    },
    {
      title: "Create Classroom",
      href: "/classroom/create",
      icon: <BookOpen className="h-5 w-5" />,
      forRoles: ["TEACHER"],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.forRoles.includes(session?.user?.role || "")
  );

  const onLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <>
      {/* Mobile Nav */}
      <div className="md:hidden p-4 flex items-center justify-between bg-white dark:bg-gray-800 border-b">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold">EduConnect</span>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="p-6 border-b flex flex-col items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-medium">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {session?.user?.role === "TEACHER" ? "Teacher" : "Student"}
                </p>
              </div>
            </div>
            <div className="py-4 space-y-1">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  <span
                    className={cn(
                      "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:text-primary hover:bg-primary/10 dark:text-gray-400"
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </span>
                </Link>
              ))}
              <button
                onClick={onLogout}
                className="flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors text-gray-500 hover:text-primary hover:bg-primary/10 dark:text-gray-400 w-full"
              >
                <LogOut className="h-5 w-5" />
                Log out
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 overflow-y-auto">
          <div className="flex items-center gap-2 px-6 pb-5 mb-5 border-b">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold">EduConnect</span>
          </div>

          <div className="flex flex-col flex-1 px-3 space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:text-primary hover:bg-primary/10 dark:text-gray-200"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </div>

          <div className="p-4 border-t mt-auto">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {session?.user?.role === "TEACHER" ? "Teacher" : "Student"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Offset for fixed sidebar */}
      <div className="hidden md:block md:pl-64" />
    </>
  );
}