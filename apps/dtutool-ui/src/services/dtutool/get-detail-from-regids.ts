import { CourseDetail, CourseInfo } from '@shared/types/dtutool';

import { getCourseClass } from './get-course-class';
import { getAcademicProgramName } from './academic-program';
import { getCourses } from './get-courses';

export const parseRegistrationCode = (code: string) => {
  const regex = /^([A-Z]+)([0-9]+)([0-9]{4})([0-9]{2})([0-9]{3})$/;
  const match = code.match(regex);
  if (!match) throw new Error('Invalid course code format');
  const programPrefix = match[1];
  const courseNumber = parseInt(match[2]);
  const year = parseInt(match[3]);
  const semester = parseInt(match[4]);
  const sectionNumber = match[5];

  const programCode = getAcademicProgramName(programPrefix);
  if (!programCode) throw new Error(`Invalid program prefix: ${programPrefix}`);

  return {
    regId: code,
    courseNumber,
    programPrefix,
    programCode,
    year,
    semester,
    sectionNumber,
  };
};

export const getDetailFromRegIds = async (params: {
  academic: string;
  semester: number;
  regIds: string[];
}): Promise<(CourseDetail | null)[]> => {
  const { academic, semester, regIds } = params;
  if (!regIds || regIds.length === 0) return [];

  const parsedRegIds = regIds
    .map((v) => v.trim().toUpperCase())
    .map((regId) => {
      try {
        return parseRegistrationCode(regId);
      } catch (error) {
        console.error(error);
        return null;
      }
    });

  const getCoursesTemp = async () => {
    const courses = await getCourses(params);
    const map = new Map<string, CourseInfo>();
    courses.forEach((c) => map.set(c.courseCode, c));
    return parsedRegIds.map((reg) => {
      if (!reg) return null;
      const courseCode = `${reg.programCode} ${reg.courseNumber}`;
      const courseInfo = map.get(courseCode);
      if (!courseInfo) return null;
      return courseInfo;
    });
  };

  const courses = await getCoursesTemp();
  if (!courses || courses.length === 0) return [];

  const classrooms = await Promise.all(
    courses.map(async (course, idx) => {
      if (!course) return null;
      const reg = parsedRegIds[idx];
      if (!reg) return null;
      const courseClass = await getCourseClass({
        academic,
        semester,
        courseId: course.courseId,
      }).catch((error) => {
        console.error(error);
        return null;
      });
      if (!courseClass) return null;
      if (!courseClass.classrooms) return null;
      const find = courseClass.classrooms.find((room) => {
        return room.registration.regId === reg.regId;
      });
      if (!find) return null;
      courseClass.classrooms = [find];
      return courseClass;
    }),
  );

  return classrooms;
};
