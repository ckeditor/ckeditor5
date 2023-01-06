/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagecaptionutils/utils
 */

import type { DocumentSelection, Element, Selection, ViewElement } from 'ckeditor5/src/engine';
import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';

import ImageUtils from '../imageutils';

/**
 * The image caption utilities plugin.
 */
export default class ImageCaptionUtils extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'ImageCaptionUtils' {
		return 'ImageCaptionUtils';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ ImageUtils ];
	}

	/**
	 * Returns the caption model element from a given image element. Returns `null` if no caption is found.
	 *
	 * @param {module:engine/model/element~Element} imageModelElement
	 * @returns {module:engine/model/element~Element|null}
	 */
	public getCaptionFromImageModelElement( imageModelElement: Element ): Element | null {
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
	public getCaptionFromModelSelection( selection: Selection | DocumentSelection ): Element | null {
		const imageUtils = this.editor.plugins.get( 'ImageUtils' );
		const captionElement = selection.getFirstPosition()!.findAncestor( 'caption' );

		if ( !captionElement ) {
			return null;
		}

		if ( imageUtils.isBlockImage( captionElement.parent as Element ) ) {
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
	public matchImageCaptionViewElement( element: ViewElement ): object | null {
		const imageUtils = this.editor.plugins.get( 'ImageUtils' );

		// Convert only captions for images.
		if ( element.name == 'figcaption' && imageUtils.isBlockImageView( element.parent as ViewElement ) ) {
			return { name: true };
		}

		return null;
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ ImageCaptionUtils.pluginName ]: ImageCaptionUtils;
	}
}
