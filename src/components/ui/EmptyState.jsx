export function EmptyState({ icon: Icon, title, description, action, secondary, }) {
    return (<div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-200 bg-white px-6 py-14 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-ink-50 text-ink-500">
        <Icon className="h-6 w-6" aria-hidden/>
      </div>
      <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">{description}</p>
      {(action || secondary) && (<div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondary}
        </div>)}
    </div>);
}
