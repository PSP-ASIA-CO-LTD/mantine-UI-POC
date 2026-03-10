import React from 'react';

/**
 * Escape HTML to prevent XSS
 */
export const escapeHtml = (text: string | null | undefined): string => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * Build a left section for the sidesheet
 */
export const buildLeftSection = (label: string, content: React.ReactNode): React.ReactNode => {
    return (
        <section className="ds-form-section ds-form-section--compact">
            <label className="ds-form-label">
                {label}
            </label>
            {content}
        </section>
    );
};

/**
 * Build a field wrapper for the right pane
 */
export const buildField = (label: string, content: React.ReactNode): React.ReactNode => {
    return (
        <div className="ds-form-section">
            <label className="ds-form-label">
                {label}
            </label>
            {content}
        </div>
    );
};

/**
 * Build a form wrapper
 */
export const buildForm = (formId: string, entityId: string, content: React.ReactNode): React.ReactNode => {
    return (
        <form id={formId}>
            <input type="hidden" name="id" value={entityId} form={formId} />
            {content}
        </form>
    );
};
