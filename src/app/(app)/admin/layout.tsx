import SimpleLayout from '@/components/layout/simple-layout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <SimpleLayout>{children}</SimpleLayout>;
}
