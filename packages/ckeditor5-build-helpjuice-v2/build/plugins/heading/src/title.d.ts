/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module heading/title
 */
import { Plugin } from 'ckeditor5/src/core';
/**
 * The Title plugin.
 *
 * It splits the document into `Title` and `Body` sections.
 */
export default class Title extends Plugin {
    /**
     * A reference to an empty paragraph in the body
     * created when there is no element in the body for the placeholder purposes.
     */
    private _bodyPlaceholder?;
    /**
     * @inheritDoc
     */
    static get pluginName(): 'Title';
    /**
     * @inheritDoc
     */
    static get requires(): readonly ["Paragraph"];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Returns the title of the document. Note that because this plugin does not allow any formatting inside
     * the title element, the output of this method will be a plain text, with no HTML tags.
     *
     * It is not recommended to use this method together with features that insert markers to the
     * data output, like comments or track changes features. If such markers start in the title and end in the
     * body, the result of this method might be incorrect.
     *
     * @param options Additional configuration passed to the conversion process.
     * See {@link module:engine/controller/datacontroller~DataController#get `DataController#get`}.
     * @returns The title of the document.
     */
    getTitle(options?: Record<string, unknown>): string;
    /**
     * Returns the body of the document.
     *
     * Note that it is not recommended to use this method together with features that insert markers to the
     * data output, like comments or track changes features. If such markers start in the title and end in the
     * body, the result of this method might be incorrect.
     *
     * @param options Additional configuration passed to the conversion process.
     * See {@link module:engine/controller/datacontroller~DataController#get `DataController#get`}.
     * @returns The body of the document.
     */
    getBody(options?: Record<string, unknown>): string;
    /**
     * Returns the `title` element when it is in the document. Returns `undefined` otherwise.
     */
    private _getTitleElement;
    /**
     * Model post-fixer callback that ensures that `title` has only one `title-content` child.
     * All additional children should be moved after the `title` element and renamed to a paragraph.
     */
    private _fixTitleContent;
    /**
     * Model post-fixer callback that creates a title element when it is missing,
     * takes care of the correct position of it and removes additional title elements.
     */
    private _fixTitleElement;
    /**
     * Model post-fixer callback that adds an empty paragraph at the end of the document
     * when it is needed for the placeholder purposes.
     */
    private _fixBodyElement;
    /**
     * Model post-fixer callback that removes a paragraph from the end of the document
     * if it was created for the placeholder purposes and is not needed anymore.
     */
    private _fixExtraParagraph;
    /**
     * Attaches the `Title` and `Body` placeholders to the title and/or content.
     */
    private _attachPlaceholders;
    /**
     * Creates navigation between the title and body sections using <kbd>Tab</kbd> and <kbd>Shift</kbd>+<kbd>Tab</kbd> keys.
     */
    private _attachTabPressHandling;
}
/**
 * The configuration of the {@link module:heading/title~Title title feature}.
 *
 * ```ts
 * ClassicEditor
 *   .create( document.querySelector( '#editor' ), {
 *     plugins: [ Title, ... ],
 *     title: {
 *       placeholder: 'My custom placeholder for the title'
 *     },
 *     placeholder: 'My custom placeholder for the body'
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor configuration options}.
 */
export interface TitleConfig {
    /**
     * Defines a custom value of the placeholder for the title field.
     *
     * Read more in {@link module:heading/title~TitleConfig}.
     */
    placeholder?: string;
}
