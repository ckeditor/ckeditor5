/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/imageinline
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import ImageTextAlternative from './imagetextalternative';
import ImageInlineEditing from './image/imageinlineediting';

import '../theme/image.css';

/**
 * The image inline plugin.
 *
 * It registers:
 *
 * * `<imageInline>` as an inline element in the document schema, and allows `alt`, `src` and `srcset` attributes.
 * * converters for editing and data pipelines.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageInline extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageInlineEditing, Widget, ImageTextAlternative ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageInline';
	}
}

