import { User as PrismaUser, UserRole } from "@prisma/client";

// Extended NextAuth types
export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
}

export interface Session {
  user: SessionUser;
  expires: string;
}

// Classroom types
export interface ClassroomFormValues {
  name: string;
  description?: string;
}

// Assignment types
export interface AssignmentFormValues {
  title: string;
  description: string;
  dueDate: Date;
  type: "TEST" | "DOCUMENT";
  questions?: QuestionFormValues[];
}

export interface QuestionFormValues {
  questionText: string;
  type: "MULTIPLE_CHOICE" | "SHORT_ANSWER";
  options?: string[];
  correctAnswer: string;
  points: number;
}

// Resource types
export interface ResourceFormValues {
  title: string;
  description?: string;
  fileUrl: string;
  type: "PDF" | "DOCUMENT" | "PRESENTATION" | "VIDEO" | "LINK" | "OTHER";
}

// Submission types
export interface SubmissionFormValues {
  fileUrl?: string;
  answers?: Record<string, string>;
}