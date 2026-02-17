import type { ButtonHTMLAttributes, ComponentPropsWithoutRef } from 'react';
import { forwardRef, useEffect, useRef } from 'react';
import './Button.css';

export type AlternateButtonVariant = 'solid' | 'border';

export type AlternateButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'type'> & {
    variant?: AlternateButtonVariant;
    visible?: boolean;
    animate?: boolean;
    animationIntervalMs?: number;
    type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
};

function randomPercent() {
    return Math.floor(Math.random() * 200 - 100);
}

export const AlternateButton = forwardRef<HTMLButtonElement, AlternateButtonProps>(
    function AlternateButton(
        {
            variant = 'border',
            visible = true,
            animate = true,
            animationIntervalMs = 2000,
            className,
            disabled,
            type = 'button',
            children,
            ...props
        },
        ref,
    ) {
        const localRef = useRef<HTMLButtonElement | null>(null);

        const setRef = (node: HTMLButtonElement | null) => {
            localRef.current = node;
            if (!ref) return;
            if (typeof ref === 'function') ref(node);
            else ref.current = node;
        };

        useEffect(() => {
            if (!animate || disabled) return;
            if (typeof window === 'undefined') return;
            const root = localRef.current;
            if (!root) return;

            const randomize = () => {
                const blobs = root.querySelectorAll<HTMLElement>('[data-button-blob]');
                blobs.forEach((blob) => {
                    blob.style.transform = `translate(${randomPercent()}%, ${randomPercent()}%)`;
                });
            };

            randomize();
            if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

            const intervalId = window.setInterval(randomize, animationIntervalMs);
            return () => window.clearInterval(intervalId);
        }, [animate, animationIntervalMs, disabled]);

        const mergedClassName = [
            'button',
            disabled ? 'disabled' : 'alternate',
            className ? className : null,
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <button
                {...props}
                ref={setRef}
                type={type}
                className={mergedClassName}
                disabled={disabled}
                data-variant={variant}
                data-visible={visible ? 'true' : 'false'}
            >
                <span className="button__content">{children}</span>
                <span className="button__inner" aria-hidden="true" />
                <span className="button__highlight" aria-hidden="true" />
                <span className="button__glow" aria-hidden="true">
                    <span
                        className="button__blob button__blob--1"
                        data-button-blob="true"
                    />
                    <span
                        className="button__blob button__blob--2"
                        data-button-blob="true"
                    />
                    <span
                        className="button__blob button__blob--3"
                        data-button-blob="true"
                    />
                    <span
                        className="button__blob button__blob--4"
                        data-button-blob="true"
                    />
                    <span
                        className="button__blob button__blob--5"
                        data-button-blob="true"
                    />
                    <span
                        className="button__blob button__blob--6"
                        data-button-blob="true"
                    />
                </span>
            </button>
        );
    },
);
