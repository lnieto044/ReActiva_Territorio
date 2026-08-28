import { useRef } from 'react';
import { Button } from '../../components/ui';

export function PhotoUploader({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => {
          const selected = Array.from(e.target.files ?? []);
          onChange([...files, ...selected]);
          e.target.value = '';
        }}
      />
      <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
        Agregar foto
      </Button>
      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-20 w-20 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(files.filter((_, i) => i !== index))}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-stone-800 text-xs text-white"
                aria-label="Quitar foto"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-stone-400">
        Las fotos se guardan en el dispositivo y se suben automáticamente cuando haya conexión.
      </p>
    </div>
  );
}
