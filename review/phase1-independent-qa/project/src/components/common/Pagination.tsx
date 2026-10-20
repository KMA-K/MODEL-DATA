import { ChevronLeft, ChevronRight } from 'lucide-react';
export const PAGE_SIZE = 20;
export function Pagination({ page, total, onPage }: { page: number; total: number; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return <div className="table-pagination"><span>{total ? `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, total)} / ${total} kết quả` : 'Không có kết quả'}</span><div className="flex items-center gap-3"><button type="button" className="btn btn-outline btn-sm" aria-label="Trang trước" disabled={!page} onClick={() => onPage(page - 1)}><ChevronLeft size={15} /></button><span>{page + 1} / {pages}</span><button type="button" className="btn btn-outline btn-sm" aria-label="Trang sau" disabled={page + 1 >= pages} onClick={() => onPage(page + 1)}><ChevronRight size={15} /></button></div></div>;
}
