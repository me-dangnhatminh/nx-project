import { getDetailFromRegIds } from '@/services/dtutool';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(req: Request) {
  const rawURL = new URL(req.url);
  const query = new URLSearchParams(rawURL.search);

  let textList: string[] = ['DTU Course Registration System'];

  try {
    const cr = query.get('cr');
    const semester = query.get('s');
    const academic = query.get('a');
    if (cr && semester && academic) {
      const regIds = cr.split('|');
      const detail = await getDetailFromRegIds({
        regIds,
        semester: parseInt(semester),
        academic,
      });

      const course = detail
        .map((item) => item?.courseInfo.courseName)
        .filter((v) => v !== undefined);

      textList = [
        `DTU Course Registration System`,
        `Academic Year: ${academic}`,
        `Semester: ${semester}`,
        ...course,
      ];
    }
  } catch (error) {
    console.error('Error fetching course details:', error);
  }

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 32,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        {textList.map((text, index) => (
          <span key={index}>{text}</span>
        ))}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
