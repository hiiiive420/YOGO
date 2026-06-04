import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

export default function GalleryUpload({
  existingImages = [],
  files = [],
  label = 'Gallery',
  maxCount = 12,
  onExistingImagesChange,
  onFilesChange,
}) {
  const [filePreviews, setFilePreviews] = useState([]);
  const totalCount = existingImages.length + files.length;

  useEffect(() => {
    const previews = files.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setFilePreviews(previews);
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [files]);

  const remainingSlots = useMemo(
    () => Math.max(maxCount - totalCount, 0),
    [maxCount, totalCount],
  );

  function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;
    if (remainingSlots === 0) {
      event.target.value = '';
      return;
    }

    const acceptedFiles = selectedFiles.slice(0, remainingSlots);
    onFilesChange([...files, ...acceptedFiles].slice(0, maxCount));
    event.target.value = '';
  }

  function removeExisting(indexToRemove) {
    onExistingImagesChange(
      existingImages.filter((_, index) => index !== indexToRemove),
    );
  }

  function removeFile(indexToRemove) {
    onFilesChange(files.filter((_, index) => index !== indexToRemove));
  }

  return (
    <div className="grid gap-3">
      <label className="block">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-black/70">
          {label}
        </span>
        <span className="mt-2 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-black/20 bg-pearl px-4 text-sm font-black uppercase tracking-[0.14em] text-black/70 transition hover:border-cinnamon hover:text-cinnamon">
          <ImagePlus size={18} />
          Upload gallery
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="sr-only"
        />
      </label>

      <div className="rounded-lg border border-black/10 bg-pearl px-3 py-2 text-xs font-bold text-black/70">
        {totalCount > 0
          ? `${totalCount} image${totalCount === 1 ? '' : 's'} selected`
          : 'Select multiple images or add them in batches.'}
      </div>

      {totalCount > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {existingImages.map((image, index) => (
            <GalleryTile
              key={`${image}-${index}`}
              image={image}
              label={`Existing gallery image ${index + 1}`}
              onRemove={() => removeExisting(index)}
            />
          ))}
          {filePreviews.map((preview, index) => (
            <GalleryTile
              key={preview.id}
              image={preview.url}
              label={preview.name}
              onRemove={() => removeFile(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryTile({ image, label, onRemove }) {
  return (
    <div className="group relative overflow-hidden rounded-md border border-black/10">
      <img
        src={image}
        alt={label}
        className="aspect-square w-full object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/72 text-white opacity-0 transition group-hover:opacity-100"
        aria-label={`Remove ${label}`}
      >
        <X size={15} />
      </button>
    </div>
  );
}
