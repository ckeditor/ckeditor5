/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module media-embed/converters
 */

import ViewRange from '@ckeditor/ckeditor5-engine/src/view/range';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';

/**
 * Returns a function that converts the model "url" attribute to the view representation.
 *
 * Depending on the configuration the view representation can be "sementaic" (for data pipeline):
 *
 *		<figure class="media">
 *			<oembed url="foo"></div>
 *		</figure>
 *
 * or "non-semantic" (for editing view pipeline):
 *
 *		<figure class="media">
 *			<div data-oembed-url="foo">[ non-semantic media preview for "foo" ]</div>
 *		</figure>
 *
 * **Note:** Changing the model "url" attribute replaces the entire content of the
 * `<figure>` in the view.
 *
 * @param {module:media-embed/mediaregistry~MediaRegistry} registry The registry providing
 * the media and their content.
 * @param {Object} options
 * @param {String} [options.semanticDataOutput] When `true`, the converter will create view in the semantic form.
 * @param {String} [options.renderForEditingView] When `true`, the converter will create a view specific for the
 * editing pipeline (e.g. including CSS classes, content placeholders).
 * @returns {Function}
 */
export function modelToViewUrlAttributeConverter( registry, options ) {
	const mediaViewElementOptions = {
		useSemanticWrapper: options.semanticDataOutput,
		renderContent: !options.semanticDataOutput,
		renderForEditingView: options.renderForEditingView
	};

	return dispatcher => {
		dispatcher.on( 'attribute:url:media', converter );
	};

	function converter( evt, data, conversionApi ) {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const url = data.attributeNewValue;
		const viewWriter = conversionApi.writer;
		const figure = conversionApi.mapper.toViewElement( data.item );

		// TODO: removing it and creating it from scratch is a hack. We can do better than that.
		viewWriter.remove( ViewRange.createIn( figure ) );

		const mediaViewElement = registry.getMediaViewElement( viewWriter, url, mediaViewElementOptions );

		viewWriter.insert( ViewPosition.createAt( figure ), mediaViewElement );
	}
}
