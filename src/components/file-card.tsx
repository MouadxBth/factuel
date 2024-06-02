import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative } from "date-fns";

import { Doc } from "../../convex/_generated/dataModel";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FileCardActions } from "./file-actions";
import { getReadableFileType, renderIcon } from "@/lib/utils";

export interface FileCardProps {
  file: Doc<"files"> & { isFavorited: boolean; url: string | null };
}

export function FileCard(props: FileCardProps) {
  const { file } = props;

  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  });

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2 text-base font-normal">
          <div className="flex justify-center">{renderIcon(props, true)}</div>
          {file.name}
        </CardTitle>

        <div className="absolute top-2 right-2">
          <FileCardActions isFavorited={file.isFavorited} file={file} />
        </div>
        <CardDescription>{getReadableFileType(file.type)}</CardDescription>
      </CardHeader>

      <CardContent className="h-[200px] flex justify-center items-center">
        {renderIcon(props, false)}
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex gap-2 text-xs text-gray-700 w-40 items-center">
          <Avatar className="w-6 h-6">
            <AvatarImage src={userProfile?.image} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {userProfile?.name}
        </div>
        <div className="text-xs text-gray-700">
          Uploaded on {formatRelative(new Date(file._creationTime), new Date())}
        </div>
      </CardFooter>
    </Card>
  );
}
