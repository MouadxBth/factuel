"use client";

import { Button } from "@/components/ui/button";
import { useOrganization, useUser } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { formSchema } from "@/lib/upload-form-schema";
import UploadForm from "./upload-form";
import { uploadFileToServer } from "@/lib/utils";
import { Id } from "../../convex/_generated/dataModel";

export function UploadButton() {
  const { toast } = useToast();
  const organization = useOrganization();
  const user = useUser();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createFile = useMutation(api.files.createFile);

  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const orgId =
      organization.isLoaded && user.isLoaded
        ? organization.organization?.id ?? user.user?.id
        : undefined;

    if (!orgId) return;

    const postUrl = await generateUploadUrl();
    const { storageId } = await uploadFileToServer(postUrl, values.file[0]);

    try {
      await createFile({
        name: values.title,
        fileId: storageId as Id<"_storage">,
        orgId,
        type: values.file[0].type,
      });

      toast({
        title: "File Uploaded",
        description: "Your file was uploaded successfully!",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Your file could not be uploaded, try again later",
      });
    }

    setIsFileDialogOpen(false);
  };

  return (
    <Dialog
      open={isFileDialogOpen}
      onOpenChange={(isOpen) => {
        setIsFileDialogOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button>Upload File</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-8">Upload your File Here</DialogTitle>
          <DialogDescription>
            This file will be accessible by anyone in your organization
          </DialogDescription>
        </DialogHeader>
        <UploadForm onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
