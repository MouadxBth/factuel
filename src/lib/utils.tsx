import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { ReactNode } from "react";
import {
  FileTextIcon,
  GanttChartIcon,
  ImageIcon,
  FileIcon,
  MusicIcon,
  VideoIcon,
  ArchiveIcon,
  FileType,
  FileBarChart,
  FileLineChart,
} from "lucide-react";
import { Doc } from "../../convex/_generated/dataModel";
import Image from "next/image";
import { FileCardProps } from "@/components/file-card";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const uploadFileToServer = async (
  url: string,
  file: File
): Promise<{ storageId: string }> => {
  const result = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });
  return await result.json();
};

const typeIcons: Record<string, ReactNode> = {
  "image/png": <ImageIcon />,
  "image/jpeg": <ImageIcon />,
  "image/gif": <ImageIcon />,
  "image/bmp": <ImageIcon />,
  "image/webp": <ImageIcon />,
  "application/pdf": <FileTextIcon />,
  "application/msword": <FileType />,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (
    <FileType />
  ),
  "application/vnd.ms-excel": <FileBarChart />,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": (
    <FileBarChart />
  ),
  "application/vnd.ms-powerpoint": <FileLineChart />,
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": (
    <FileLineChart />
  ),
  "application/x-zip-compressed": <ArchiveIcon />,
  "application/json": <FileTextIcon />,
  "text/plain": <FileTextIcon />,
  "text/html": <FileTextIcon />,
  "text/css": <FileTextIcon />,
  "text/csv": <GanttChartIcon />,
  "audio/mpeg": <MusicIcon />,
  "audio/wav": <MusicIcon />,
  "audio/ogg": <MusicIcon />,
  "video/mp4": <VideoIcon />,
  "video/x-msvideo": <VideoIcon />,
  "video/quicktime": <VideoIcon />,
  default: <FileIcon />,
};

export const renderIcon = ({ file }: FileCardProps, icon: boolean) => {
  if (file.type.startsWith("image") && file.url && !icon) {
    return <Image alt={file.name} width="200" height="100" src={file.url} />;
  }
  return typeIcons[file.type] || typeIcons.default;
};

export const getFileTypes = (files: Doc<"files">[]) => {
  const types = new Set<string>();
  files.forEach((file) => {
    types.add(file.type);
  });
  return Array.from(types);
};

const mimeToReadableName: Record<string, string> = {
  "image/png": "PNG Image",
  "image/jpeg": "JPEG Image",
  "image/gif": "GIF Image",
  "image/bmp": "BMP Image",
  "image/webp": "WEBP Image",
  "application/pdf": "PDF Document",
  "application/msword": "Word Document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word Document",
  "application/vnd.ms-excel": "Excel Spreadsheet",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    "Excel Spreadsheet",
  "application/vnd.ms-powerpoint": "PowerPoint Presentation",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "PowerPoint Presentation",
  "application/x-zip-compressed": "ZIP Archive",
  "application/json": "JSON File",
  "text/plain": "Text File",
  "text/html": "HTML File",
  "text/css": "CSS File",
  "text/csv": "CSV File",
  "audio/mpeg": "MP3 Audio",
  "audio/wav": "WAV Audio",
  "audio/ogg": "OGG Audio",
  "video/mp4": "MP4 Video",
  "video/x-msvideo": "AVI Video",
  "video/quicktime": "QuickTime Video",
};

export const getReadableFileType = (mimeType: string): string => {
  return mimeToReadableName[mimeType] || "Unknown File Type";
};
