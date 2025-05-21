"use client";

import { useEffect, useState } from "react";
import { UploadDropzone } from "@uploadthing/react";
import { toast } from "sonner";
import { FileIcon, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface UploadThingProps {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "resourceUploader" | "assignmentUploader";
}

export function UploadThing({
  onChange,
  value,
  endpoint,
}: UploadThingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const fileType = value?.split('.').pop();
  
  if (value) {
    return (
      <div className="flex items-center p-2 mt-2 rounded-md bg-muted/50">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
            <FileIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 flex flex-col truncate">
            <a 
              href={value} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline truncate"
            >
              {value.split('/').pop()}
            </a>
            <span className="text-xs text-muted-foreground">
              {fileType?.toUpperCase() || 'FILE'}
            </span>
          </div>
        </div>
        <Button
          onClick={() => onChange("")}
          variant="ghost"
          type="button"
          size="sm"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <UploadDropzone
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
          onChange(res?.[0]?.url);
          toast.success("File uploaded successfully");
        }}
        onUploadError={(error: Error) => {
          toast.error(`Upload error: ${error?.message}`);
        }}
      />
    </div>
  );
}