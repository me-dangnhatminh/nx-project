import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  Classroom,
  CourseDetail,
  CourseDetailSchema,
  CourseInfo,
  MakeupSessionInfo,
  RegistrationInfo,
} from '@shared/types/dtutool';
import { toDate } from 'date-fns-tz';
import { endOfDay, parse, startOfDay } from 'date-fns';
import { AnyNode } from 'domhandler';
import { dtuParamsMapper } from './mapper';
import { getFirstDateOfVNAcademic } from '@shared/utils/dtutool';

const vnTimeZone = 'Asia/Ho_Chi_Minh';

type GetCourseClassParams = {
  courseId: number;
  semester: number;
  academic: string;
  search?: string;
};

const getCourseInfo = ($: cheerio.CheerioAPI, { courseId }: GetCourseClassParams): CourseInfo => {
  const courseName = $('.ico-namnganhhoc span').text().trim();
  if (!courseName) throw new Error('Course not found');
  const courseInfo: CourseInfo = {
    courseId,
    courseName,
    courseCode: '',
    courseType: '',
    credits: 0,
    creditType: '',
    preRequisite: '',
    coRequisite: '',
    description: '',
  };

  const courseInfoEl = $('table.tb_coursedetail');
  const infoRows = courseInfoEl.find('tr td table tr');
  infoRows.each((_index, element) => {
    const row = $(element);
    const td = row.children('td');
    const title = $(td.first()).text().trim();
    const value = $(td.last()).text().trim();
    if (title.includes('Mã môn:')) courseInfo.courseCode = value || '';
    else if (title.includes('Số ĐVHT:')) courseInfo.credits = parseInt(value);
    else if (title.includes('Loại hình:')) courseInfo.courseType = value || '';
    else if (title.includes('Loại ĐVHT:')) courseInfo.creditType = value || '';
    else if (title.includes('Môn học tiên quyết:')) {
      courseInfo.preRequisite = value;
    } else if (title.includes('Môn học song hành:')) {
      courseInfo.coRequisite = value;
    } else if (title.includes('Mô tả môn học:')) {
      courseInfo.description = value;
    }
  });

  return courseInfo;
};

const getClassrooms = ($: cheerio.CheerioAPI, params: GetCourseClassParams): Array<Classroom> => {
  const classroomsRows = $('.tb-calendar tbody tr.lop');
  const dtuParams = dtuParamsMapper.toDTU(params);

  const firstDateOfAcademic = getFirstDateOfVNAcademic(params.academic);
  const getRegistrationInfo = (elm: AnyNode): RegistrationInfo => {
    const row = $(elm);
    const td = row.find('td');

    const regId = td.eq(1).text().trim();
    const seatsLeft = parseInt(td.eq(3).text().trim()) || 0;
    const startDate = $(td.eq(4).find('div').first()).text().trim(); // dd/MM/yyyy
    const endDate = $(td.eq(4).find('div').last()).text().trim(); // dd/MM/yyyy
    const status = td.eq(10).text().trim(); // eg: Còn Hạn Đăng Ký

    // =======
    const tz = { timeZone: vnTimeZone };
    const refD = new Date(); // TODO: fix
    const start = toDate(startOfDay(parse(startDate, 'dd/MM/yyyy', refD)), tz);
    const end = toDate(endOfDay(parse(endDate, 'dd/MM/yyyy', refD)), tz);

    return {
      regId,
      seatsLeft,
      start,
      end,
      status,
      semesterId: dtuParams.semesterId,
      yearId: dtuParams.yearId,
      startDate,
      endDate,
    };
  };

  const getWeeks = (elm: AnyNode) => {
    const row = $(elm);
    const td = row.find('td');

    const week = td.eq(5).text().trim();
    const [startWeek, endWeek] = week.split('--').map((w) => parseInt(w.trim()));
    const sortedWeeks = [startWeek, endWeek].sort((a, b) => a - b);
    return { from: sortedWeeks[0], to: sortedWeeks[1] };
  };

  const getRooms = (elm: AnyNode) => {
    const row = $(elm);
    const td = row.find('td');

    const rooms: Array<{ room: string; location: string }> = [];
    $(td.eq(7))
      .text()
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((room) => {
        rooms.push({ room, location: '' });
      });
    $(td.eq(8))
      .text()
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((location, i) => {
        if (i >= rooms.length) return;
        rooms[i].location = location;
      });
    return rooms;
  };

  const getExcludedWeeks = (elm: AnyNode) => {
    const row = $(elm);
    const td = row.find('td');

    const excludedWeeks: { [dayOfWeek: string]: Array<number> } = {};

    $(td.eq(6))
      .find('div')
      .each((_, element) => {
        const rawText = $(element).text();
        const matches = rawText.matchAll(/(T\d):\s*Hủy\s*([\d,\s]+)/g);
        for (const match of matches) {
          const day = match[1];
          const dayOfWeek = day === 'CN' ? 1 : parseInt(day.replace('T', ''));
          const week = match[2]
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => parseInt(s));
          excludedWeeks[dayOfWeek] = week;
        }
      });

    return excludedWeeks;
  };

  const getMakeupSessions = (elm: AnyNode) => {
    const row = $(elm);
    const td = row.find('td');

    const makeupSessions: Array<MakeupSessionInfo> = [];

    $(td.eq(6))
      .find('div span.content')
      .each((_, element) => {
        const rawText = $(element).html() || '';
        const lines = rawText
          .split('<br>')
          .map((s) => s.trim())
          .filter(Boolean);
        lines.forEach((line) => {
          const match = line.match(
            /(\d{2}\/\d{2}\/\d{4}):\s*(\d{2}:\d{2})-(\d{2}:\d{2}),\s*([^,]+),\s*(.+)/,
          );
          if (!match) return;
          const [, date, startTime, endTime, room, location] = match;
          const start = toDate(
            parse(`${date} ${startTime}`, 'dd/MM/yyyy HH:mm', new Date()), // TODO: fix new Date
            { timeZone: vnTimeZone },
          );
          const end = toDate(
            parse(`${date} ${endTime}`, 'dd/MM/yyyy HH:mm', new Date()), // TODO: fix new Date
            { timeZone: vnTimeZone },
          );

          makeupSessions.push({
            date,
            start,
            end,
            startTime,
            endTime,
            room,
            location,
          });
        });
      });
    return makeupSessions;
  };

  const getSchedule = (elm: AnyNode) => {
    const row = $(elm);
    const td = row.find('td');
    const schedule: Classroom['schedule'] = {
      firstDateOfAcademic: firstDateOfAcademic,
      weeks: getWeeks(elm),
      regularSessions: [],
      makeupSessions: [],
    };

    const rooms = getRooms(elm);
    const excludedWeeks = getExcludedWeeks(elm);
    schedule.makeupSessions = getMakeupSessions(elm);

    $(td.eq(6))
      .text()
      .trim()
      .match(/T\d:\s*\d{2}:\d{2}\s*-\d{2}:\d{2}/g)
      ?.forEach((item, i) => {
        const cleanedItem = item.replace(/\s+/g, '').trim();
        const match = cleanedItem.match(/(T\d):(\d{2}:\d{2})-(\d{2}:\d{2})/);
        if (!match) return;
        const [, day, startTime, endTime] = match;
        const dayOfWeek = day === 'CN' ? 1 : parseInt(day.replace('T', ''));
        const session = {
          dayOfWeek,
          startTime,
          endTime,
          room: rooms[i]?.room || '',
          location: rooms[i]?.location || '',
          excludedWeeks: excludedWeeks[dayOfWeek] || [],
        };
        schedule.regularSessions.push(session);
      });

    return schedule;
  };

  const getTeacher = (elm: AnyNode) => {
    const row = $(elm);
    const td = row.find('td');
    const teacherName = td.eq(9).text().trim();
    return { teacherId: '', name: teacherName };
  };

  const classrooms: Array<Classroom> = [];
  classroomsRows.each((_index, element) => {
    const row = $(element);
    const td = row.find('td');

    const className = td.first().text().trim();
    const registration = getRegistrationInfo(element);
    const schedule = getSchedule(element);
    const teacher = getTeacher(element);

    classrooms.push({ className, registration, schedule, teacher });
  });

  return classrooms;
};

export const getCourseClass = async (params: GetCourseClassParams) => {
  // =================== DTU FORMAT =========================
  const courseClassURL = `https://courses.duytan.edu.vn/Modules/academicprogram/CourseClassResult.aspx`;
  const dtuParams = dtuParamsMapper.toDTU(params);
  const response = await axios.get(courseClassURL, {
    params: {
      courseid: params.courseId,
      semesterid: dtuParams.semesterId,
      timespan: dtuParams.semesterId,
      t: new Date().getTime(),
    },
  });
  const data = response.data;

  if (!data || typeof data !== 'string') {
    throw new Error('Invalid data received');
  }

  // =================== CONVERT DTU TO MY FORMAT =========================
  const $ = cheerio.load(data);
  const courseInfo = getCourseInfo($, params);
  const classrooms = getClassrooms($, params);

  const courseDetail: CourseDetail = { courseInfo, classrooms };
  return CourseDetailSchema.parse(courseDetail);
};
