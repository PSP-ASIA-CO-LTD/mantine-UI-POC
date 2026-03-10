import type { HTMLAttributes, ElementType } from 'react';

export const tokenPreviewClassName = (token: string) => `ds-token-preview--${token.replace(/^--/, '')}`;

type TokenPreviewProps = HTMLAttributes<HTMLElement> & {
    as?: ElementType;
    token: string;
};

export function TokenPreview({
    as: Component = 'span',
    token,
    className,
    ...props
}: TokenPreviewProps) {
    const classes = ['ds-token-preview', tokenPreviewClassName(token), className].filter(Boolean).join(' ');

    return <Component {...props} className={classes} aria-hidden="true" />;
}
