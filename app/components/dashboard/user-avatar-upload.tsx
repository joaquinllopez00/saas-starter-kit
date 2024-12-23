import { Upload, X } from "lucide-react";
import type { ChangeEvent, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import type { UserAvatarProps } from "~/components/dashboard/user-avatar";
import { UserAvatar } from "~/components/dashboard/user-avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const AvatarUpload = ({
  profilePictureUrl,
  onFileSelect,
  onRemove,
  size = "lg",
}: UserAvatarProps & {
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRemoved, setIsRemoved] = useState(false);
  const fileInputRef: RefObject<HTMLInputElement> = useRef(null);

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      setIsRemoved(false);

      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedFile]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setIsRemoved(false);
      onFileSelect(file);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = isRemoved ? undefined : previewUrl || profilePictureUrl;

  return (
    <div className="flex flex-col items-center space-y-4">
      <Label htmlFor="avatar-upload">Profile Photo</Label>
      <div className="relative">
        {displayUrl ? (
          <UserAvatar size={"xl"} profilePictureUrl={displayUrl} />
        ) : (
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full p-0 w-16 h-16 flex items-center justify-center"
            onClick={handleClick}
            type="button"
          >
            <Upload className="h-4 w-4" />
          </Button>
        )}
        {displayUrl && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute -top-2 -right-2 rounded-full p-0 w-6 h-6 flex items-center justify-center"
            onClick={handleRemove}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Input
        type="file"
        id="avatar-upload"
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
        accept="image/*"
      />
    </div>
  );
};
