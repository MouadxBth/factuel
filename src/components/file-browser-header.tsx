import { Dispatch, SetStateAction } from "react";
import { SearchBar } from "./search-bar";
import { UploadButton } from "./upload-button";

interface FileBrowserHeaderProps {
  title: string;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
}

export function FileBrowserHeader({
  title,
  query,
  setQuery,
}: FileBrowserHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-4xl font-bold">{title}</h1>
      <SearchBar query={query} setQuery={setQuery} />
      <UploadButton />
    </div>
  );
}
