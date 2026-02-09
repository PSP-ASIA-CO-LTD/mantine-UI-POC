import {
    TextInput as MantineTextInput,
    Textarea as MantineTextarea,
    Select as MantineSelect,
    MultiSelect as MantineMultiSelect,
    NumberInput as MantineNumberInput,
    PasswordInput as MantinePasswordInput,
    FileInput as MantineFileInput,
    type TextInputProps,
    type TextareaProps,
    type SelectProps,
    type MultiSelectProps,
    type NumberInputProps,
    type PasswordInputProps,
    type FileInputProps,
} from '@mantine/core';
import { DateInput as MantineDateInput, type DateInputProps } from '@mantine/dates';
import './InlineEditableField.css';

type ClassNames = Record<string, string | undefined>;

const baseClassNames: ClassNames = {
    root: 'editable-field editable-field--form',
    label: 'editable-field__label',
    input: 'editable-field__input',
};

const mergeClassNames = (base: ClassNames, incoming?: ClassNames) => {
    if (!incoming) return { ...base };
    const merged: ClassNames = { ...base };
    Object.entries(incoming).forEach(([key, value]) => {
        if (!value) return;
        merged[key] = [base[key], value].filter(Boolean).join(' ');
    });
    return merged;
};

export function TextInput(props: TextInputProps) {
    return (
        <MantineTextInput
            {...props}
            variant={props.variant ?? 'unstyled'}
            classNames={mergeClassNames(baseClassNames, props.classNames as ClassNames)}
        />
    );
}

export function Textarea(props: TextareaProps) {
    return (
        <MantineTextarea
            {...props}
            variant={props.variant ?? 'unstyled'}
            classNames={mergeClassNames(baseClassNames, props.classNames as ClassNames)}
        />
    );
}

export function Select(props: SelectProps) {
    return (
        <MantineSelect
            {...props}
            variant={props.variant ?? 'unstyled'}
            classNames={mergeClassNames(baseClassNames, props.classNames as ClassNames)}
        />
    );
}

export function MultiSelect(props: MultiSelectProps) {
    return (
        <MantineMultiSelect
            {...props}
            variant={props.variant ?? 'unstyled'}
            classNames={mergeClassNames(baseClassNames, props.classNames as ClassNames)}
        />
    );
}

export function NumberInput(props: NumberInputProps) {
    return (
        <MantineNumberInput
            {...props}
            variant={props.variant ?? 'unstyled'}
            classNames={mergeClassNames(baseClassNames, props.classNames as ClassNames)}
        />
    );
}

export function PasswordInput(props: PasswordInputProps) {
    return (
        <MantinePasswordInput
            {...props}
            variant={props.variant ?? 'unstyled'}
            classNames={mergeClassNames(baseClassNames, props.classNames as ClassNames)}
        />
    );
}

export function FileInput(props: FileInputProps) {
    return (
        <MantineFileInput
            {...props}
            variant={props.variant ?? 'unstyled'}
            classNames={mergeClassNames(baseClassNames, props.classNames as ClassNames)}
        />
    );
}

export function DateInput(props: DateInputProps) {
    return (
        <MantineDateInput
            {...props}
            variant={props.variant ?? 'unstyled'}
            classNames={mergeClassNames(baseClassNames, props.classNames as ClassNames)}
        />
    );
}
