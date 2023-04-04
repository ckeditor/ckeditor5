/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imageinsert/imageinsertui
 */
import { Plugin } from 'ckeditor5/src/core';
import { type DropdownView } from 'ckeditor5/src/ui';
/**
 * The image insert dropdown plugin.
 *
 * For a detailed overview, check the {@glink features/images/image-upload/image-upload Image upload feature}
 * and {@glink features/images/images-inserting Insert images via source URL} documentation.
 *
 * Adds the `'insertImage'` dropdown to the {@link module:ui/componentfactory~ComponentFactory UI component factory}
 * and also the `imageInsert` dropdown as an alias for backward compatibility.
 */
export default class ImageInsertUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): 'ImageInsertUI';
    /**
     * The dropdown view responsible for displaying the image insert UI.
     */
    dropdownView?: DropdownView;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Creates the dropdown view.
     *
     * @param locale The localization services instance.
     */
    private _createDropdownView;
    /**
     * Sets up the dropdown view.
     *
     * @param command An uploadImage or insertImage command.
     */
    private _setUpDropdown;
}
