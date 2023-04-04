/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/image/imagetypecommand
 */
import type { Element } from 'ckeditor5/src/engine';
import { Command, type Editor } from 'ckeditor5/src/core';
/**
 * The image type command. It changes the type of a selected image, depending on the configuration.
 */
export default class ImageTypeCommand extends Command {
    /**
     * Model element name the command converts to.
     */
    private readonly _modelElementName;
    /**
     * @inheritDoc
     *
     * @param modelElementName Model element name the command converts to.
     */
    constructor(editor: Editor, modelElementName: 'imageBlock' | 'imageInline');
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command and changes the type of a selected image.
     *
     * @fires execute
     * @returns An object containing references to old and new model image elements
     * (for before and after the change) so external integrations can hook into the decorated
     * `execute` event and handle this change. `null` if the type change failed.
     */
    execute(): {
        oldElement: Element;
        newElement: Element;
    } | null;
}
