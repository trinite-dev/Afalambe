'use client';

import { useEffect, useState, type ReactElement } from 'react';
import {
    Dialog,
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogPopup,
    DialogTitle,
} from '@afalambe/ui/components/dialog';
import { Button } from '@afalambe/ui/components/button';
import { Input } from '@afalambe/ui/components/input';

export type ChatRenameDialogProps = {
    open: boolean;
    initialTitle: string;
    titleLabel: string;
    cancelLabel: string;
    saveLabel: string;
    onOpenChange: (open: boolean) => void;
    onSave: (title: string) => void;
    saving?: boolean;
};

export function ChatRenameDialog({
    open,
    initialTitle,
    titleLabel,
    cancelLabel,
    saveLabel,
    onOpenChange,
    onSave,
    saving = false,
}: ChatRenameDialogProps): ReactElement {
    const [title, setTitle] = useState(initialTitle);

    useEffect(() => {
        if (open) {
            setTitle(initialTitle);
        }
    }, [initialTitle, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPopup className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{titleLabel}</DialogTitle>
                </DialogHeader>
                <div className="px-4 pb-2">
                    <Input
                        value={title}
                        maxLength={120}
                        onChange={(event) => setTitle(event.target.value)}
                        aria-label={titleLabel}
                        autoFocus
                    />
                </div>
                <DialogFooter>
                    <DialogClose render={<Button type="button" variant="outline" />}>
                        {cancelLabel}
                    </DialogClose>
                    <Button
                        type="button"
                        disabled={!title.trim() || saving}
                        loading={saving}
                        onClick={() => onSave(title.trim())}
                    >
                        {saveLabel}
                    </Button>
                </DialogFooter>
            </DialogPopup>
        </Dialog>
    );
}

export type ChatDeleteDialogProps = {
    open: boolean;
    title: string;
    description: string;
    cancelLabel: string;
    confirmLabel: string;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    deleting?: boolean;
};

export function ChatDeleteDialog({
    open,
    title,
    description,
    cancelLabel,
    confirmLabel,
    onOpenChange,
    onConfirm,
    deleting = false,
}: ChatDeleteDialogProps): ReactElement {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPopup className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose render={<Button type="button" variant="outline" />}>
                        {cancelLabel}
                    </DialogClose>
                    <Button
                        type="button"
                        variant="destructive"
                        loading={deleting}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogPopup>
        </Dialog>
    );
}
