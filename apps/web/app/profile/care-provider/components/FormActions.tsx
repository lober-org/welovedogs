"use client";

import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface FormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  cancelLabel?: string;
}

export function FormActions({
  onSave,
  onCancel,
  saveLabel = "Save Changes",
  cancelLabel = "Cancel",
}: FormActionsProps) {
  return (
    <div className="flex gap-2 justify-end">
      <Button onClick={onCancel} variant="outline">
        <X className="mr-2 h-4 w-4" />
        {cancelLabel}
      </Button>
      <Button onClick={onSave} className="bg-purple-600 hover:bg-purple-700">
        <Save className="mr-2 h-4 w-4" />
        {saveLabel}
      </Button>
    </div>
  );
}
