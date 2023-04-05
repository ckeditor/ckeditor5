/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/converters
 */

import type { GetCallback } from 'ckeditor5/src/utils';
import type { DowncastAttributeEvent, DowncastDispatcher, Element, ViewElement } from 'ckeditor5/src/engine';
import type MediaRegistry from './mediaregistry';
import type { MediaOptions } from './utils';

/**
 * Returns a function that converts the model "url" attribute to the view representation.
 *
 * Depending on the configuration, the view representation can be "semantic" (for the data pipeline):
 *
 * ```html
 * <figure class="media">
 * 	<oembed url="foo"></oembed>
 * </figure>
 * ```
 *
 * or "non-semantic" (for the editing view pipeline):
 *
 * ```html
 * <figure class="media">
 * 	<div data-oembed-url="foo">[ non-semantic media preview for "foo" ]</div>
 * </figure>
 * ```
 *
 * **Note:** Changing the model "url" attribute replaces the entire content of the
 * `<figure>` in the view.
 *
 * @param registry The registry providing
 * the media and their content.
 * @param options options object with following properties:
 * - elementName When set, overrides the default element name for semantic media embeds.
 * - renderMediaPreview When `true`, the converter will create the view in the non-semantic form.
 * - renderForEditingView When `true`, the converter will create a view specific for the
 * editing pipeline (e.g. including CSS classes, content placeholders).
 */
export function modelToViewUrlAttributeConverter(
	registry: MediaRegistry,
	options: MediaOptions
): ( dispatcher: DowncastDispatcher ) => void {
	const converter: GetCallback<DowncastAttributeEvent> = ( evt, data, conversionApi ) => {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const url = data.attributeNewValue as string;
		const viewWriter = conversionApi.writer;
		const figure = conversionApi.mapper.toViewElement( data.item as Element )!;
		const mediaContentElement = [ ...figure.getChildren() ]
			.find( child => ( child as ViewElement ).getCustomProperty( 'media-content' ) )!;

		// TODO: removing the wrapper and creating it from scratch is a hack. We can do better than that.
		viewWriter.remove( mediaContentElement );

		const mediaViewElement = registry.getMediaViewElement( viewWriter, url, options );

		viewWriter.insert( viewWriter.createPositionAt( figure, 0 ), mediaViewElement );
	};

	return dispatcher => {
		dispatcher.on<DowncastAttributeEvent>( 'attribute:url:media', converter );
	};
}
