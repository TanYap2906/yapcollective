export type Course = {
  id: string;
  number: number;
  title: string;
  totalUnits: number;
};

export const courses: Course[] = [
  { id: 'substantives', number: 1, title: 'Substantives', totalUnits: 10 },
  { id: 'rebuttals', number: 2, title: 'Rebuttals', totalUnits: 5 },
  { id: 'problem-setup', number: 3, title: 'Problem Setup', totalUnits: 4 },
  { id: 'principled-arguments', number: 4, title: 'Principled Arguments', totalUnits: 3 },
  { id: 'policy', number: 5, title: 'Policy', totalUnits: 6 },
  { id: 'mechanisation', number: 6, title: 'Mechanisation', totalUnits: 7 },
  { id: 'weighing', number: 7, title: 'Weighing', totalUnits: 5 },
  { id: 'points-of-information', number: 8, title: 'Points of Information', totalUnits: 4 },
];

export function getCourseById(courseId?: string | string[]) {
  const id = Array.isArray(courseId) ? courseId[0] : courseId;
  return courses.find((course) => course.id === id) ?? courses[1];
}

export function getCompletedUnits(progress: number, totalUnits: number) {
  return Math.round((progress / 100) * totalUnits);
}
