import { NextApiRequest, NextApiResponse } from 'next';
import { getDetailFromRegIds } from '@/services/dtutool';
import { CourseDetailSchema } from '@/lib/types';
import { z } from 'zod';

const AcademicSchema = z.string().regex(/^\d{4}-\d{4}$/);
const GetClassroomsParams = z.object({
  academic: AcademicSchema,
  semester: z.coerce.number(),
  regIds: z.string().array(),
});

// =============================

const CourseDetailNullAble = CourseDetailSchema.nullable().array();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  try {
    const params = GetClassroomsParams.parse({
      academic: searchParams.get('academic') || '',
      semester: Number(searchParams.get('semester')),
      regIds: [searchParams.getAll('regIds')].flat(),
    });

    const courseDetail = await getDetailFromRegIds(params);

    return Response.json(CourseDetailNullAble.parse(courseDetail));
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => e.message).join(', ');
      return Response.json({ error: errorMessage }, { status: 400 });
    }

    console.error(error);
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
