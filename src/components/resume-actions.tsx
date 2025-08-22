'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Loader2, Save, FolderOpen } from 'lucide-react';

interface ResumeActionsProps {
  onSave: () => void;
  onLoad: () => void;
  isSaving: boolean;
  isLoading: boolean;
}

export function ResumeActions({ onSave, onLoad, isSaving, isLoading }: ResumeActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Resume Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          <span>Save Resume</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onLoad} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FolderOpen className="mr-2 h-4 w-4" />
          )}
          <span>Load Resume</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
