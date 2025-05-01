import { z } from "zod";

export const CourseInfoSchema = z.object({
  courseId: z.number(),
  courseCode: z.string(),
  courseName: z.string(),
  courseType: z.string().optional(),
  credits: z.number().optional(),
  creditType: z.string().optional(),
  preRequisite: z.string().optional(),
  coRequisite: z.string().optional(),
  description: z.string().optional(),
});

export const RegistrationInfoSchema = z.object({
  regId: z.string(),
  semesterId: z.number(),
  yearId: z.number(),
  seatsLeft: z.number(),
  startDate: z.string(), // eg. "2023-09-01"
  endDate: z.string(), // eg. "2023-12-31"
  status: z.string().optional(),
  start: z.coerce.date(),
  end: z.coerce.date(),
});

export const TeacherInfoSchema = z.object({
  teacherId: z.string(),
  name: z.string(),
});

export const RegularSessionSchema = z.object({
  dayOfWeek: z.number(),
  startTime: z.string(), // e.g. "08:00"
  endTime: z.string(), // e.g. "08:45",
  room: z.string(),
  location: z.string(),
  excludedWeeks: z.array(z.number()),
});

export const MakeupSessionInfoSchema = z.object({
  date: z.string(), // // e.g. "2023-09-01"
  startTime: z.string(), // // e.g. "8:00"
  endTime: z.string(), //  // e.g. "8:45",
  start: z.coerce.date(),
  end: z.coerce.date(),
  room: z.string(),
  location: z.string(),
});

export const ClassroomSchema = z.object({
  className: z.string(),
  teacher: TeacherInfoSchema.optional(),
  registration: RegistrationInfoSchema,
  schedule: z.object({
    firstDateOfAcademic: z.coerce.date(),
    weeks: z.object({ from: z.number(), to: z.number() }),
    regularSessions: RegularSessionSchema.array(),
    makeupSessions: MakeupSessionInfoSchema.array(),
  }),
});

export const CourseDetailSchema = z.object({
  courseInfo: CourseInfoSchema,
  classrooms: z.array(ClassroomSchema).optional(),
});

export type CourseInfo = z.infer<typeof CourseInfoSchema>;
export type RegistrationInfo = z.infer<typeof RegistrationInfoSchema>;
export type TeacherInfo = z.infer<typeof TeacherInfoSchema>;
export type RegularSession = z.infer<typeof RegularSessionSchema>;
export type MakeupSessionInfo = z.infer<typeof MakeupSessionInfoSchema>;
export type Classroom = z.infer<typeof ClassroomSchema>;
export type CourseDetail = z.infer<typeof CourseDetailSchema>;

// ===== Client Types =====
export type SelectedClassroom = Classroom & { course: CourseInfo };
export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  classroomId: string;
  courseId: number;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps: {
    room: string;
    location: string;
    isMakeup: boolean;
    courseCode: string;
    courseName: string;
    className: string;
    teacherName?: string;
    conflicted?: boolean;
  };
};

export type CourseSelection = {
  course: CourseDetail;
  classroom: Classroom;
};

export interface ConflictResult {
  type: "regular-regular" | "makeup-regular" | "makeup-makeup";
  regId1: string;
  regId2: string;
  dayOfWeek?: number;
  date?: string;
  time1: string;
  time2: string;
  room1: string;
  room2: string;
  overlappingWeeks?: number[];
  makeupWeek?: number;
}
