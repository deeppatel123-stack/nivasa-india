import { Skeleton } from '@/components/ui/Skeleton';
export function DetailPageSkeleton() {
    return (<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]" role="status" aria-label="Loading property details">
      <div className="space-y-6">
        <div className="card overflow-hidden">
          <Skeleton className="h-64 w-full rounded-none sm:h-96"/>
          <div className="flex gap-2 p-3">
            <Skeleton className="h-16 w-24"/>
            <Skeleton className="h-16 w-24"/>
            <Skeleton className="h-16 w-24"/>
          </div>
        </div>
        {[0, 1, 2].map((section) => (<div key={section} className="card space-y-3 p-5">
            <Skeleton className="h-5 w-1/3"/>
            <Skeleton className="h-4 w-2/3"/>
            <Skeleton className="h-4 w-1/2"/>
          </div>))}
      </div>
      <div className="space-y-4">
        <div className="card space-y-4 p-5">
          <Skeleton className="h-6 w-1/2"/>
          {[0, 1, 2, 3, 4].map((row) => (<Skeleton key={row} className="h-4 w-full"/>))}
        </div>
        <div className="card space-y-3 p-5">
          <Skeleton className="h-5 w-2/3"/>
          <Skeleton className="h-16 w-full"/>
          <Skeleton className="h-10 w-full"/>
        </div>
      </div>
      <span className="sr-only">Loading illustrative property details…</span>
    </div>);
}
