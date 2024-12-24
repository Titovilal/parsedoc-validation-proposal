export default function FieldBadges({ fields, hideTitle = false }) {
  return (
    <div className="space-y-4">
      {!hideTitle && (
        <h2 className="text-2xl font-semibold text-gray-800">Campos del Proceso</h2>
      )}
      <div className="flex flex-wrap gap-2">
        {fields.map((field) => (
          <div
            key={field.id}
            className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded-md border border-gray-100 hover:shadow-sm transition-all duration-200"
          >
            <div className="w-4 h-4 bg-white rounded flex items-center justify-center shadow-sm border border-gray-200">
              <span className="text-xs">
                {field.type === 'text' ? '📝' : '📅'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{field.label}</span>
              <span className="text-[10px] text-gray-500">{field.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 