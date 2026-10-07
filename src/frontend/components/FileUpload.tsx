/**
 * FileUpload.tsx
 * Reads a local text file as a string. PDF extract is not in this layer.
 * The caption prop is not named label, for the same React 19 reason as TextInput.
 */

export interface FileUploadProps {
  onFile: (name: string, content: string) => void;
  caption?: string;
}

export function FileUpload({ onFile, caption = "File" }: FileUploadProps) {
  return (
    <div className="field">
      <span className="field-label">{caption}</span>
      <input
        type="file"
        accept=".txt,.md,.csv,.pdf,text/plain,application/pdf"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          if (file.name.toLowerCase().endsWith(".pdf")) {
            onFile(file.name, "");
            return;
          }
          const reader = new FileReader();
          reader.onload = () => onFile(file.name, String(reader.result ?? ""));
          reader.readAsText(file);
        }}
      />
    </div>
  );
}
