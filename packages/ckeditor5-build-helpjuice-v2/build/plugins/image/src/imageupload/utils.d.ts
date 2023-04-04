/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imageupload/utils
 */
import type { ViewElement } from 'ckeditor5/src/engine';
import type ImageUtils from '../imageutils';
/**
 * Creates a regular expression used to test for image files.
 *
 * ```ts
 * const imageType = createImageTypeRegExp( [ 'png', 'jpeg', 'svg+xml', 'vnd.microsoft.icon' ] );
 *
 * console.log( 'is supported image', imageType.test( file.type ) );
 * ```
 */
export declare function createImageTypeRegExp(types: Array<string>): RegExp;
/**
 * Creates a promise that fetches the image local source (Base64 or blob) and resolves with a `File` object.
 *
 * @param image Image whose source to fetch.
 * @returns A promise which resolves when an image source is fetched and converted to a `File` instance.
 * It resolves with a `File` object. If there were any errors during file processing, the promise will be rejected.
 */
export declare function fetchLocalImage(image: ViewElement): Promise<File>;
/**
 * Checks whether a given node is an image element with a local source (Base64 or blob).
 *
 * @param node The node to check.
 */
export declare function isLocalImage(imageUtils: ImageUtils, node: ViewElement): boolean;
