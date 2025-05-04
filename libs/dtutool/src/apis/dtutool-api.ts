import {
  CourseDetail,
  CourseDetailSchema,
  CourseInfo,
  CourseInfoSchema,
} from '@shared/types/dtutool';
import axios from 'axios';
import qs from 'qs';

const fetchCourses = async (params: {
  academic: string;
  semester: string;
  search?: string;
}): Promise<CourseInfo[]> => {
  try {
    const res = await axios.get('/api/dtutool/courses', {
      params,
      paramsSerializer: (p) => qs.stringify(p, { arrayFormat: 'repeat' }),
    });
    return CourseInfoSchema.array().parse(res.data);
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

const fetchClassrooms = async (params: {
  academic: string;
  semester: string;
  courseId: number;
}): Promise<CourseDetail> => {
  try {
    const res = await axios.get('/api/dtutool/classrooms', { params });
    return CourseDetailSchema.parse(res.data);
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    throw error;
  }
};

const fetchClassroomsByRegIds = async (params: {
  academic: string;
  semester: string;
  regIds: string[];
}): Promise<(CourseDetail | null)[]> => {
  try {
    const res = await axios.get('/api/dtutool/classrooms-ids', {
      params,
      paramsSerializer: (p) => qs.stringify(p, { arrayFormat: 'repeat' }),
    });
    return CourseDetailSchema.nullable().array().parse(res.data);
  } catch (error) {
    console.error('Error fetching classrooms by regIds:', error);
    throw error;
  }
};

export const dtutoolApi = {
  getCourses: fetchCourses,
  getClassrooms: fetchClassrooms,
  getClassroomsByRegIds: fetchClassroomsByRegIds,
};
