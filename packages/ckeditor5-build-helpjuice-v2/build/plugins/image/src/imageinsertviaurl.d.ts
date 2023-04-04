/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imageinsertviaurl
 */
import { Plugin } from 'ckeditor5/src/core';
import ImageInsertUI from './imageinsert/imageinsertui';
/**
 * The image insert via URL plugin.
 *
 * For a detailed overview, check the {@glink features/images/images-inserting
 * Insert images via source URL} documentation.
 *
 * This plugin does not do anything directly, but it loads a set of specific plugins
 * to enable image inserting via implemented integrations:
 *
 * * {@link module:image/imageinsert/imageinsertui~ImageInsertUI},
 */
export default class ImageInsertViaUrl extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): 'ImageInsertViaUrl';
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageInsertUI];
}
