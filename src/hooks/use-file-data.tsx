import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useFileData = (
  orgId: string,
  query: string,
  type: string,
  favoritesOnly?: boolean,
  deletedOnly?: boolean
) => {
  const favorites = useQuery(api.files.getAllFavorites, { orgId });

  const files = useQuery(api.files.getFiles, {
    orgId,
    type: type === "all" ? undefined : type,
    query,
    favorites: favoritesOnly,
    deletedOnly,
  });

  const modifiedFiles =
    files?.map((file) => ({
      ...file,
      isFavorited: (favorites ?? []).some(
        (favorite) => favorite.fileId === file._id
      ),
    })) ?? [];

  return { files: modifiedFiles, isLoading: files === undefined };
};
