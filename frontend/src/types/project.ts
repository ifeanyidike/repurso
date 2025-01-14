export type ProjectType = Partial<{
  id?: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  dueDate: Date;
}>;
