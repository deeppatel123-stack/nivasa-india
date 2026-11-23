import { cn } from '@/lib/utils';
export function Skeleton({ className }) {
    return <div aria-hidden className={cn('skeleton', className)}/>;
}
export function PropertyCardSkeleton() {
    return (<div className="card overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none"/>
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-1/3"/>
        <Skeleton className="h-5 w-2/3"/>
        <Skeleton className="h-4 w-1/2"/>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16 rounded-full"/>
          <Skeleton className="h-6 w-20 rounded-full"/>
          <Skeleton className="h-6 w-14 rounded-full"/>
        </div>
      </div>
    </div>);
}
