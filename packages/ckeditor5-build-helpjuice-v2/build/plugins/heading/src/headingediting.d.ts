/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module heading/headingediting
 */
import { Plugin, type Editor } from 'ckeditor5/src/core';
import { Paragraph } from 'ckeditor5/src/paragraph';
/**
 * The headings engine feature. It handles switching between block formats &ndash; headings and paragraph.
 * This class represents the engine part of the heading feature. See also {@link module:heading/heading~Heading}.
 * It introduces `heading1`-`headingN` commands which allow to convert paragraphs into headings.
 */
export default class HeadingEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): 'HeadingEditing';
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof Paragraph];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    afterInit(): void;
    /**
     * Adds default conversion for `h1` -> `heading1` with a low priority.
     *
     * @param editor Editor instance on which to add the `h1` conversion.
     */
    private _addDefaultH1Conversion;
}
