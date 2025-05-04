import { getCourseClass } from '@dtutool/services/registration';
import { z } from 'zod';

const AcademicSchema = z.string().regex(/^\d{4}-\d{4}$/);
const GetClassroomsParams = z.object({
  academic: AcademicSchema,
  semester: z.coerce.number(),
  courseId: z.number(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  try {
    const params = GetClassroomsParams.parse({
      academic: searchParams.get('academic') || '',
      semester: Number(searchParams.get('semester')),
      courseId: Number(searchParams.get('courseId')),
    });

    const courseDetail = await getCourseClass(params);
    return Response.json(courseDetail, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => e.message).join(', ');
      return Response.json({ error: errorMessage }, { status: 400 });
    }

    console.error(error);
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
