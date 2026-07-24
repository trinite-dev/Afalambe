'use client';

import {
    useCallback,
    useState,
    type MouseEvent,
    type ReactElement,
} from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@afalambe/ui/components/button';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@afalambe/ui/components/input-group';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { AUTH_MESSAGES } from '@/lib/ui-locale';

export type PasswordInputWithToggleProps = {
    id: string;
    name?: string;
    autoComplete?: string;
    required?: boolean;
    'aria-invalid'?: boolean | 'false' | 'true';
    showPasswordAria?: string;
    hidePasswordAria?: string;
};

/**
 * Password field with a trailing control to show or hide the value.
 */
export function PasswordInputWithToggle({
    id,
    name = 'password',
    autoComplete,
    required,
    'aria-invalid': ariaInvalid,
    showPasswordAria,
    hidePasswordAria,
}: PasswordInputWithToggleProps): ReactElement {
    const { locale } = useUiLocale();
    const messages = AUTH_MESSAGES[locale];
    const [visible, setVisible] = useState(false);

    const handleToggleMouseDown = useCallback((e: MouseEvent) => {
        e.preventDefault();
    }, []);

    return (
        <InputGroup>
            <InputGroupInput
                id={id}
                name={name}
                type={visible ? 'text' : 'password'}
                autoComplete={autoComplete}
                required={required}
                aria-invalid={ariaInvalid}
            />
            <InputGroupAddon align="inline-end">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label={
                        visible
                            ? (hidePasswordAria ?? messages.hidePasswordAria)
                            : (showPasswordAria ?? messages.showPasswordAria)
                    }
                    aria-pressed={visible}
                    onMouseDown={handleToggleMouseDown}
                    onClick={() => setVisible((v) => !v)}
                >
                    {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
            </InputGroupAddon>
        </InputGroup>
    );
}
