/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/converters
 */

/**
 * Returns a function that converts the model "url" attribute to the view representation.
 *
 * Depending on the configuration, the view representation can be "semantic" (for the data pipeline):
 *
 *		<figure class="media">
 *			<oembed url="foo"></oembed>
 *		</figure>
 *
 * or "non-semantic" (for the editing view pipeline):
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
 * @param {String} [options.elementName] When set, overrides the default element name for semantic media embeds.
 * @param {String} [options.renderMediaPreview] When `true`, the converter will create the view in the non-semantic form.
 * @param {String} [options.renderForEditingView] When `true`, the converter will create a view specific for the
 * editing pipeline (e.g. including CSS classes, content placeholders).
 * @returns {Function}
 */
export function modelToViewUrlAttributeConverter( registry, options ) {
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
		const mediaContentElement = [ ...figure.getChildren() ]
			.find( child => child.getCustomProperty( 'media-content' ) );

		// TODO: removing the wrapper and creating it from scratch is a hack. We can do better than that.
		viewWriter.remove( mediaContentElement );

		const mediaViewElement = registry.getMediaViewElement( viewWriter, url, options );

		viewWriter.insert( viewWriter.createPositionAt( figure, 0 ), mediaViewElement );
	}
}
