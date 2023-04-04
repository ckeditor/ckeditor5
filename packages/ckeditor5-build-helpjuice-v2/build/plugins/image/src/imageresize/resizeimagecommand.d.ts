/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imageresize/resizeimagecommand
 */
import { Command } from 'ckeditor5/src/core';
/**
 * The resize image command. Currently, it only supports the width attribute.
 */
export default class ResizeImageCommand extends Command {
    /**
     * Desired image width and height.
     */
    value: null | {
        width: string | null;
        height: string | null;
    };
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * ```ts
     * // Sets the width to 50%:
     * editor.execute( 'resizeImage', { width: '50%' } );
     *
     * // Removes the width attribute:
     * editor.execute( 'resizeImage', { width: null } );
     * ```
     *
     * @param options
     * @param options.width The new width of the image.
     * @fires execute
     */
    execute(options: {
        width: string | null;
    }): void;
}
