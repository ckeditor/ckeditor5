/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module font/fontcommand
 */
import { Command, type Editor } from 'ckeditor5/src/core';
import { type Batch } from 'ckeditor5/src/engine';
/**
 * The base font command.
 */
export default abstract class FontCommand extends Command {
    /**
     * When set, it reflects the {@link #attributeKey} value of the selection.
     *
     * @observable
     * @readonly
     */
    value: string;
    /**
     * A model attribute on which this command operates.
     */
    readonly attributeKey: string;
    /**
     * Creates an instance of the command.
     *
     * @param editor Editor instance.
     * @param attributeKey The name of a model attribute on which this command operates.
     */
    constructor(editor: Editor, attributeKey: string);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command. Applies the `value` of the {@link #attributeKey} to the selection.
     * If no `value` is passed, it removes the attribute from the selection.
     *
     * @param options Options for the executed command.
     * @param options.value The value to apply.
     * @fires execute
     */
    execute(options?: {
        value?: string;
        batch?: Batch;
    }): void;
}
