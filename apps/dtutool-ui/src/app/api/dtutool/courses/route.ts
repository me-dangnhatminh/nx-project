import { getCourses } from '@/services/dtutool';
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
    return Response.json(courseList);
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
