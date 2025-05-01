import { getCourseClass } from '@/services/dtutool/get-course-class';
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
    return new Response(JSON.stringify(courseDetail), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => e.message).join(', ');
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error(error);
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
