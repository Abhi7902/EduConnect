import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  BookOpen, 
  Upload, 
  FileCheck, 
  TestTube, 
  Bell, 
  Users 
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6" />
              <span className="font-bold">EduConnect</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Link href="/login" passHref>
                <Button variant="outline">Log in</Button>
              </Link>
              <Link href="/register" passHref>
                <Button>Sign up</Button>
              </Link>
              <Link href="/admin/login" passHref>
                <Button variant="secondary">Admin Login</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  The Virtual Classroom Platform
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Connect teachers and students in a seamless online learning environment with assignments, tests, and resources.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register" passHref>
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login" passHref>
                  <Button size="lg" variant="outline">
                    Log in
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mx-auto lg:mr-0 flex items-center">
              <div className="relative aspect-video overflow-hidden rounded-xl border bg-background p-2 shadow-xl">
                <div className="flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-950 dark:to-indigo-900 rounded-lg h-full">
                  <div className="grid grid-cols-2 gap-4 p-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col items-center justify-center text-center">
                      <BookOpen className="h-10 w-10 text-blue-500 mb-2" />
                      <h3 className="font-medium">Classes</h3>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col items-center justify-center text-center">
                      <FileCheck className="h-10 w-10 text-green-500 mb-2" />
                      <h3 className="font-medium">Assignments</h3>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col items-center justify-center text-center">
                      <TestTube className="h-10 w-10 text-amber-500 mb-2" />
                      <h3 className="font-medium">Tests</h3>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col items-center justify-center text-center">
                      <Upload className="h-10 w-10 text-purple-500 mb-2" />
                      <h3 className="font-medium">Resources</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Everything you need in one place
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Our platform provides all the tools needed for effective online education.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-200" />
              </div>
              <h3 className="text-xl font-bold">Virtual Classrooms</h3>
              <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                Create and join virtual classrooms with easy-to-share invite codes.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full p-3 bg-green-100 dark:bg-green-900">
                <FileCheck className="h-6 w-6 text-green-600 dark:text-green-200" />
              </div>
              <h3 className="text-xl font-bold">Assignments</h3>
              <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                Create, submit, and grade assignments with file uploads and feedback.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full p-3 bg-amber-100 dark:bg-amber-900">
                <TestTube className="h-6 w-6 text-amber-600 dark:text-amber-200" />
              </div>
              <h3 className="text-xl font-bold">Online Tests</h3>
              <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                Create and take online tests with auto-grading for multiple choice questions.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900">
                <Upload className="h-6 w-6 text-purple-600 dark:text-purple-200" />
              </div>
              <h3 className="text-xl font-bold">Resource Sharing</h3>
              <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                Upload and share learning materials including PDFs, documents, and videos.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full p-3 bg-red-100 dark:bg-red-900">
                <Bell className="h-6 w-6 text-red-600 dark:text-red-200" />
              </div>
              <h3 className="text-xl font-bold">Notifications</h3>
              <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                Get notified about new assignments, submissions, and grades.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full p-3 bg-indigo-100 dark:bg-indigo-900">
                <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-200" />
              </div>
              <h3 className="text-xl font-bold">Role-Based Access</h3>
              <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                Specific dashboards and features for teachers and students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-t from-white to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to transform your teaching?
              </h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                Join thousands of educators and students already using EduConnect.
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link href="/register" passHref>
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link href="/login" passHref>
                  <Button size="lg" variant="outline">
                    Log in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12">
          <div className="flex-1 space-y-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6" />
              <span className="font-bold">EduConnect</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              A virtual classroom platform connecting teachers and students.
            </p>
          </div>
          <div className="flex-1 space-y-4">
            <div className="text-sm font-medium">Links</div>
            <ul className="grid gap-2 text-sm">
              <li>
                <Link href="/login" className="text-gray-500 hover:text-primary dark:text-gray-400">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-500 hover:text-primary dark:text-gray-400">
                  Sign up
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t py-6">
          <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 EduConnect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}