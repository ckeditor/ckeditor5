/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imagecaption/imagecaptionutils
 */

import type { ModelDocumentSelection, ModelElement, ModelSelection, ViewElement, Match } from 'ckeditor5/src/engine.js';
import { Plugin } from 'ckeditor5/src/core.js';

import { ImageUtils } from '../imageutils.js';

/**
 * The image caption utilities plugin.
 */
export class ImageCaptionUtils extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImageCaptionUtils' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageUtils ] as const;
	}

	/**
	 * Returns the caption model element from a given image element. Returns `null` if no caption is found.
	 */
	public getCaptionFromImageModelElement( imageModelElement: ModelElement ): ModelElement | null {
		for ( const node of imageModelElement.getChildren() ) {
			if ( !!node && node.is( 'element', 'caption' ) ) {
				return node;
			}
		}

		return null;
	}

	/**
	 * Returns the caption model element for a model selection. Returns `null` if the selection has no caption element ancestor.
	 */
	public getCaptionFromModelSelection( selection: ModelSelection | ModelDocumentSelection ): ModelElement | null {
		const imageUtils: ImageUtils = this.editor.plugins.get( 'ImageUtils' );
		const captionElement = selection.getFirstPosition()!.findAncestor( 'caption' );

		if ( !captionElement ) {
			return null;
		}

		if ( imageUtils.isBlockImage( captionElement.parent as ModelElement ) ) {
			return captionElement;
		}

		return null;
	}

	/**
	 * {@link module:engine/view/matcher~Matcher} pattern. Checks if a given element is a `<figcaption>` element that is placed
	 * inside the image `<figure>` element.
	 * @returns Returns the object accepted by {@link module:engine/view/matcher~Matcher} or `null` if the element
	 * cannot be matched.
	 */
	public matchImageCaptionViewElement( element: ViewElement ): Match | null {
		const imageUtils: ImageUtils = this.editor.plugins.get( 'ImageUtils' );

		// Convert only captions for images.
		if ( element.name == 'figcaption' && imageUtils.isBlockImageView( element.parent as ViewElement ) ) {
			return { name: true };
		}

		return null;
	}
}
