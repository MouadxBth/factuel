"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Doc } from "../../convex/_generated/dataModel";
import { formatRelative } from "date-fns";
import { FileCardActions } from "./file-actions";
import UserCell from "./user-cell";
import { getReadableFileType } from "@/lib/utils";

export const columns: ColumnDef<
  Doc<"files"> & { url: string | null; isFavorited: boolean }
>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <div>{getReadableFileType(row.original.type)}</div>,
  },
  {
    accessorKey: "userId",
    header: "User",
    cell: ({ row }) => <UserCell userId={row.original.userId} />,
  },
  {
    accessorKey: "_creationTime",
    header: "Uploaded On",
    cell: ({ row }) => (
      <div>
        {formatRelative(new Date(row.original._creationTime), new Date())}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <FileCardActions
        file={row.original}
        isFavorited={row.original.isFavorited}
      />
    ),
  },
];
