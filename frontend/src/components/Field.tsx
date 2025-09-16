export function Field({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="border rounded-md px-3 py-2 bg-white">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-gray-900">{value ?? 'Not Applicable'}</div>
    </div>
  );
}
