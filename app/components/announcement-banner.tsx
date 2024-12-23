import { X } from "lucide-react";
import { useState } from "react";

export const AnnouncementBanner = ({ message }: { message: string }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      className={
        "fixed top-0 left-0 w-full bg-primary text-background py-2 px-4 flex justify-between items-center z-50"
      }
    >
      <p className="text-sm mx-auto">{message}</p>
      <button
        onClick={() => setIsVisible(false)}
        className="text"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
};
