/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagecaptionutils/utils
 */

import { Plugin } from 'ckeditor5/src/core';

import ImageUtils from '../imageutils';

/**
 * The image caption utilities plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageCaptionUtils extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageCaptionUtils';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageUtils ];
	}

	/**
	 * Returns the caption model element from a given image element. Returns `null` if no caption is found.
	 *
	 * @param {module:engine/model/element~Element} imageModelElement
	 * @returns {module:engine/model/element~Element|null}
	 */
	getCaptionFromImageModelElement( imageModelElement ) {
		for ( const node of imageModelElement.getChildren() ) {
			if ( !!node && node.is( 'element', 'caption' ) ) {
				return node;
			}
		}

		return null;
	}

	/**
	 * Returns the caption model element for a model selection. Returns `null` if the selection has no caption element ancestor.
	 *
	 * @param {module:engine/model/selection~Selection} selection
	 * @returns {module:engine/model/element~Element|null}
	 */
	getCaptionFromModelSelection( selection ) {
		const imageUtils = this.editor.plugins.get( 'ImageUtils' );
		const captionElement = selection.getFirstPosition().findAncestor( 'caption' );

		if ( !captionElement ) {
			return null;
		}

		if ( imageUtils.isBlockImage( captionElement.parent ) ) {
			return captionElement;
		}

		return null;
	}

	/**
	 * {@link module:engine/view/matcher~Matcher} pattern. Checks if a given element is a `<figcaption>` element that is placed
	 * inside the image `<figure>` element.
	 *
	 * @param {module:engine/view/element~Element} element
	 * @returns {Object|null} Returns the object accepted by {@link module:engine/view/matcher~Matcher} or `null` if the element
	 * cannot be matched.
	 */
	matchImageCaptionViewElement( element ) {
		const imageUtils = this.editor.plugins.get( 'ImageUtils' );

		// Convert only captions for images.
		if ( element.name == 'figcaption' && imageUtils.isBlockImageView( element.parent ) ) {
			return { name: true };
		}

		return null;
	}
}
