"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GridIcon, Loader2, RowsIcon } from "lucide-react";
import { DataTable } from "./file-table";
import { columns } from "./columns";
import EmptyPlaceholder from "./empty-placeholder";
import { FileCard } from "./file-card";
import { FileTypeSelector } from "./file-type-selector";
import { FileBrowserHeader } from "./file-browser-header";
import { useFileData } from "@/hooks/use-file-data";
import { getFileTypes } from "@/lib/utils";

export function FileBrowser({
  title,
  favoritesOnly,
  deletedOnly,
}: {
  title: string;
  favoritesOnly?: boolean;
  deletedOnly?: boolean;
}) {
  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string>("all");

  const orgId =
    organization.isLoaded && user.isLoaded
      ? organization.organization?.id ?? user.user?.id
      : undefined;

  const { files, isLoading } = useFileData(
    orgId ?? "",
    query,
    type,
    favoritesOnly,
    deletedOnly
  );
  const fileTypes = getFileTypes(files);

  return (
    <div>
      <FileBrowserHeader title={title} query={query} setQuery={setQuery} />

      <Tabs defaultValue="grid">
        <div className="flex justify-between items-center">
          <TabsList className="mb-2">
            <TabsTrigger value="grid" className="flex gap-2 items-center">
              <GridIcon />
              Grid
            </TabsTrigger>
            <TabsTrigger value="table" className="flex gap-2 items-center">
              <RowsIcon /> Table
            </TabsTrigger>
          </TabsList>

          <FileTypeSelector
            type={type}
            setType={setType}
            fileTypes={fileTypes}
          />
        </div>

        {isLoading && (
          <div className="flex flex-col gap-8 w-full items-center mt-24">
            <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
            <div className="text-2xl">Loading your files...</div>
          </div>
        )}

        <TabsContent value="grid">
          <div className="grid grid-cols-3 gap-4">
            {files.map((file) => (
              <FileCard key={file._id} file={file} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="table">
          <DataTable columns={columns} data={files} />
        </TabsContent>
      </Tabs>

      {files.length === 0 && <EmptyPlaceholder />}
    </div>
  );
}
