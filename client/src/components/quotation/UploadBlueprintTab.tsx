import { useState, useRef } from "react";
import { Upload, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadedFile {
  name: string;
  size: string;
  previews: string[];
}

interface UploadBlueprintTabProps {
  onBeginSegmentation: () => void;
}

export function UploadBlueprintTab({ onBeginSegmentation }: UploadBlueprintTabProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      name: "d-577-study-sample.pdf",
      size: "67.67 MB",
      previews: [
        "/figmaAssets/blueprint-main-floor.png",
        "/figmaAssets/blueprint-lower-floor.png",
      ],
    },
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleBrowse = () => inputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const addFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((f) => ({
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
      previews: [],
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const hasFiles = uploadedFiles.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-gray-500">
        Uploading Blueprint File is part 1 of a 7 part step. Upload your architectural or construction blueprint to begin the automated segmentation process.
      </p>

      <div
        data-testid="upload-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex min-h-[220px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
          isDragging ? "border-[#E07B39] bg-orange-50" : "border-gray-400 bg-gray-50"
        } overflow-hidden`}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='none' stroke='%23E07B39' stroke-width='0.5' x='20' y='20' width='360' height='260'/%3E%3Cline stroke='%23E07B39' stroke-width='0.3' x1='20' y1='80' x2='380' y2='80'/%3E%3Cline stroke='%23E07B39' stroke-width='0.3' x1='20' y1='140' x2='380' y2='140'/%3E%3Cline stroke='%23E07B39' stroke-width='0.3' x1='20' y1='200' x2='380' y2='200'/%3E%3Cline stroke='%23E07B39' stroke-width='0.3' x1='100' y1='20' x2='100' y2='280'/%3E%3Cline stroke='%23E07B39' stroke-width='0.3' x1='200' y1='20' x2='200' y2='280'/%3E%3Cline stroke='%23E07B39' stroke-width='0.3' x1='300' y1='20' x2='300' y2='280'/%3E%3C/svg%3E\")",
          }}
        />
        <Upload className="mb-3 h-10 w-10 text-gray-500" />
        <p className="text-base text-gray-700">
          <span className="font-semibold">Drag &amp; Drop</span> Blueprint{" "}
          <span className="font-semibold">File Here</span>
        </p>
        <button
          data-testid="browse-files-btn"
          onClick={handleBrowse}
          className="mt-3 rounded border border-gray-700 bg-white px-8 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          Or Browse Files
        </button>
        <p className="mt-2 text-xs text-gray-500">Accepted formats: .PDF .DWG or .DXF</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.dwg,.dxf"
          multiple
          className="hidden"
          onChange={handleFileChange}
          data-testid="file-input"
        />
      </div>

      {hasFiles ? (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-base font-semibold text-gray-800">Detected Files and Blueprints</h3>
          <div className="flex flex-col gap-3">
            {uploadedFiles.map((file, index) => (
              <div key={index} data-testid={`uploaded-file-${index}`} className="rounded-lg border border-gray-200 p-3">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.size}</p>
                  </div>
                  <button
                    data-testid={`remove-file-${index}`}
                    onClick={() => removeFile(index)}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {file.previews.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {file.previews.map((src, pi) => (
                      <img
                        key={pi}
                        src={src}
                        alt={`Preview ${pi + 1}`}
                        className="h-24 w-40 flex-shrink-0 rounded object-cover border border-gray-200"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="h-20 w-32 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">Preview 1</div>
                    <div className="h-20 w-32 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">Preview 2</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-800">How to Upload Blueprint?</span>
          </div>
          <p className="mb-3 text-xs text-purple-700">
            Make sure your blueprint file is clear with visible labels and from a common CAD software for accurate segmentation.
          </p>
          <p className="mb-1 text-xs font-semibold text-purple-700">Upload Tips:</p>
          <ul className="list-disc pl-4 text-xs text-purple-700 space-y-1">
            <li>Use .PDF, .DWG, .DXF files from CAD software.</li>
            <li>Current segmentation is optimized for enclosed plan areas, floor-based spaces, labeled zones</li>
            <li>Upload the highest quality possible for best results</li>
            <li>Review detected segments after upload for accuracy</li>
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          data-testid="begin-segmentation-btn"
          onClick={onBeginSegmentation}
          disabled={!hasFiles}
          className={`flex items-center gap-2 rounded px-6 py-3 text-sm font-semibold text-white ${
            hasFiles
              ? "bg-[#E07B39] hover:bg-[#c96b2f]"
              : "cursor-not-allowed bg-gray-400"
          }`}
        >
          Begin Segmentation
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
