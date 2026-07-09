export default function StageNotice({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-forest-300 bg-forest-50 p-8 text-center">
      <h2 className="text-lg font-semibold text-forest-800">{title}</h2>
      <p className="mt-2 text-sm text-forest-600">{description}</p>
    </div>
  )
}
