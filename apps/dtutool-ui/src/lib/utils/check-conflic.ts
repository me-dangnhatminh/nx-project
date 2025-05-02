import {
  Classroom,
  RegularSession,
  MakeupSessionInfo,
  SelectedClassroom,
  ConflictResult,
} from '@/lib/types';

// Hàm chuyển đổi thời gian từ chuỗi "HH:MM" sang số phút
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Kiểm tra xung đột giữa hai khoảng thời gian
function isTimeOverlap(start1: number, end1: number, start2: number, end2: number): boolean {
  return start1 < end2 && start2 < end1;
}

// Kiểm tra xung đột giữa hai buổi học thông thường
function checkRegularSessionConflict(
  session1: RegularSession,
  session2: RegularSession,
  classroom1: Classroom,
  classroom2: Classroom,
): ConflictResult | null {
  // Nếu khác thứ trong tuần thì không xung đột
  if (session1.dayOfWeek !== session2.dayOfWeek) {
    return null;
  }

  // Chuyển đổi thời gian sang phút để dễ so sánh
  const start1 = timeToMinutes(session1.startTime);
  const end1 = timeToMinutes(session1.endTime);
  const start2 = timeToMinutes(session2.startTime);
  const end2 = timeToMinutes(session2.endTime);

  // Kiểm tra xem thời gian có chồng lấp không
  if (!isTimeOverlap(start1, end1, start2, end2)) {
    return null;
  }

  // Kiểm tra tuần học có trùng nhau không
  const weeks1 = getWeekRange(classroom1.schedule.weeks, session1.excludedWeeks);
  const weeks2 = getWeekRange(classroom2.schedule.weeks, session2.excludedWeeks);

  // Tìm các tuần trùng nhau
  const overlappingWeeks = findOverlappingWeeks(weeks1, weeks2);

  if (overlappingWeeks.length === 0) {
    return null;
  }

  return {
    type: 'regular-regular',
    regId1: classroom1.registration.regId,
    regId2: classroom2.registration.regId,
    dayOfWeek: session1.dayOfWeek,
    time1: `${session1.startTime} - ${session1.endTime}`,
    time2: `${session2.startTime} - ${session2.endTime}`,
    room1: session1.room,
    room2: session2.room,
    overlappingWeeks,
  };
}

// Lấy danh sách tuần học thực tế (loại bỏ các tuần nghỉ)
function getWeekRange(weeks: { from: number; to: number }, excludedWeeks: number[]): number[] {
  const result: number[] = [];
  for (let week = weeks.from; week <= weeks.to; week++) {
    if (!excludedWeeks.includes(week)) {
      result.push(week);
    }
  }
  return result;
}

// Tìm các tuần trùng nhau
function findOverlappingWeeks(weeks1: number[], weeks2: number[]): number[] {
  return weeks1.filter((week) => weeks2.includes(week));
}

// Kiểm tra xung đột giữa buổi bù và buổi học thông thường
function checkMakeupRegularConflict(
  makeup: MakeupSessionInfo,
  regular: RegularSession,
  makeupClassroom: Classroom,
  regularClassroom: Classroom,
): ConflictResult | null {
  // Xác định thứ trong tuần của buổi học bù
  const makeupDate = new Date(makeup.date);
  const makeupDayOfWeek = makeupDate.getDay() || 7; // Chuyển đổi 0 (Chủ nhật) thành 7

  if (makeupDayOfWeek !== regular.dayOfWeek) {
    return null;
  }

  // Xác định tuần của buổi học bù
  const makeupWeek = getWeekNumber(makeupDate, regularClassroom.registration.startDate);

  // Kiểm tra xem tuần này có phải là tuần học của lớp thông thường không
  const regularWeeks = getWeekRange(regularClassroom.schedule.weeks, regular.excludedWeeks);
  if (!regularWeeks.includes(makeupWeek)) {
    return null;
  }

  // Kiểm tra xung đột thời gian
  const makeupStart = timeToMinutes(makeup.startTime);
  const makeupEnd = timeToMinutes(makeup.endTime);
  const regularStart = timeToMinutes(regular.startTime);
  const regularEnd = timeToMinutes(regular.endTime);

  if (!isTimeOverlap(makeupStart, makeupEnd, regularStart, regularEnd)) {
    return null;
  }

  return {
    type: 'makeup-regular',
    regId1: makeupClassroom.registration.regId,
    regId2: regularClassroom.registration.regId,
    date: makeup.date,
    time1: `${makeup.startTime} - ${makeup.endTime}`,
    time2: `${regular.startTime} - ${regular.endTime}`,
    room1: makeup.room,
    room2: regular.room,
    makeupWeek: makeupWeek,
  };
}

// Lấy số tuần dựa trên ngày
function getWeekNumber(date: Date, semesterStartDate: string): number {
  const start = new Date(semesterStartDate);
  const diffTime = Math.abs(date.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

// Kiểm tra xung đột giữa hai buổi bù
function checkMakeupConflict(
  makeup1: MakeupSessionInfo,
  makeup2: MakeupSessionInfo,
  classroom1: Classroom,
  classroom2: Classroom,
): ConflictResult | null {
  // Nếu không cùng ngày thì không xung đột
  if (makeup1.date !== makeup2.date) {
    return null;
  }

  // Kiểm tra xung đột thời gian
  const start1 = timeToMinutes(makeup1.startTime);
  const end1 = timeToMinutes(makeup1.endTime);
  const start2 = timeToMinutes(makeup2.startTime);
  const end2 = timeToMinutes(makeup2.endTime);

  if (!isTimeOverlap(start1, end1, start2, end2)) {
    return null;
  }

  return {
    type: 'makeup-makeup',
    regId1: classroom1.registration.regId,
    regId2: classroom2.registration.regId,
    date: makeup1.date,
    time1: `${makeup1.startTime} - ${makeup1.endTime}`,
    time2: `${makeup2.startTime} - ${makeup2.endTime}`,
    room1: makeup1.room,
    room2: makeup2.room,
  };
}

// Hàm chính để kiểm tra xung đột giữa các khóa học
export function checkScheduleConflicts(classrooms: SelectedClassroom[]): ConflictResult[] {
  const conflicts: ConflictResult[] = [];

  // So sánh từng cặp lớp học
  for (let i = 0; i < classrooms.length; i++) {
    for (let j = i + 1; j < classrooms.length; j++) {
      const classroom1 = classrooms[i];
      const classroom2 = classrooms[j];

      // Kiểm tra xung đột giữa các buổi học thông thường
      for (const session1 of classroom1.schedule.regularSessions) {
        for (const session2 of classroom2.schedule.regularSessions) {
          const conflict = checkRegularSessionConflict(session1, session2, classroom1, classroom2);
          if (conflict) {
            conflicts.push(conflict);
          }
        }
      }

      // Kiểm tra xung đột giữa buổi bù và buổi học thông thường
      for (const makeup of classroom1.schedule.makeupSessions) {
        for (const regular of classroom2.schedule.regularSessions) {
          const conflict = checkMakeupRegularConflict(makeup, regular, classroom1, classroom2);
          if (conflict) {
            conflicts.push(conflict);
          }
        }
      }

      // Kiểm tra xung đột giữa buổi học thông thường và buổi bù (ngược lại)
      for (const regular of classroom1.schedule.regularSessions) {
        for (const makeup of classroom2.schedule.makeupSessions) {
          const conflict = checkMakeupRegularConflict(makeup, regular, classroom2, classroom1);
          if (conflict) {
            conflicts.push(conflict);
          }
        }
      }

      // Kiểm tra xung đột giữa các buổi bù
      for (const makeup1 of classroom1.schedule.makeupSessions) {
        for (const makeup2 of classroom2.schedule.makeupSessions) {
          const conflict = checkMakeupConflict(makeup1, makeup2, classroom1, classroom2);
          if (conflict) {
            conflicts.push(conflict);
          }
        }
      }
    }
  }

  return conflicts;
}
