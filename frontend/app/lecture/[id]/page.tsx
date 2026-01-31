import Link from 'next/link';
import { notFound } from 'next/navigation';
import { lectures } from '@/data/mockData';

interface LectureDetailPageProps {
  params: {
    id: string;
  };
}

export default function LectureDetailPage({ params }: LectureDetailPageProps) {
  const lectureId = Number(params.id);
  const lecture = lectures.find((item) => item.id === lectureId);

  if (!lecture) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-yeoul-navy text-white">
      <div className="container-app py-12 space-y-8">
        <div className="space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
          >
            ← 홈으로
          </Link>
          <h1 className="text-3xl font-bold">{lecture.title}</h1>
          <p className="text-gray-400">{lecture.instructor} 강사 · {lecture.duration}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="glass-card p-6 space-y-4">
            <img
              src={lecture.thumbnail}
              alt={lecture.title}
              className="w-full rounded-xl object-cover"
            />
            <p className="text-gray-300 leading-relaxed">{lecture.description}</p>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">커리큘럼</h2>
            <ul className="space-y-3 text-sm text-gray-300">
              {lecture.curriculum.map((item) => (
                <li key={item.id} className="flex items-center justify-between">
                  <span>{item.title}</span>
                  <span className="text-gray-500">{item.duration}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
