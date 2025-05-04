import { getCourses } from '@dtutool/services/registration';
import { z } from 'zod';

const GetCoursesParams = z.object({
  academic: z.string().regex(/^\d{4}-\d{4}$/),
  semester: z.coerce.number(),
  search: z.string().default(''),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  try {
    const params = GetCoursesParams.parse({
      academic: searchParams.get('academic') || '',
      semester: Number(searchParams.get('semester')),
      search: searchParams.get('search') || '',
    });

    const courseList = await getCourses(params);
    return Response.json(courseList, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => e.message).join(', ');
      return Response.json({ error: errorMessage }, { status: 400 });
    }

    console.error(error);
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
