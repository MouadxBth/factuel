import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getReadableFileType } from "@/lib/utils";

interface FileTypeSelectorProps {
  type: string;
  setType: (type: string) => void;
  fileTypes: string[];
}

export function FileTypeSelector({
  type,
  setType,
  fileTypes,
}: FileTypeSelectorProps) {
  return (
    <div className="flex gap-2 items-center">
      <Label htmlFor="type-select">Type Filter</Label>
      <Select value={type} onValueChange={(newType) => setType(newType)}>
        <SelectTrigger id="type-select" className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {fileTypes.map((fileType) => (
            <SelectItem key={fileType} value={fileType}>
              {getReadableFileType(fileType)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
