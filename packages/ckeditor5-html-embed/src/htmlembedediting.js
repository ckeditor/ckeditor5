/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-embed/htmlembedediting
 */

import sanitizeHtml from 'sanitize-html';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import HTMLEmbedCommand from './htmlembedcommand';

import '../theme/htmlembed.css';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import { stringify as viewStringify } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

/**
 * The HTML embed editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HTMLEmbedEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'HTMLEmbedEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const schema = editor.model.schema;
		const conversion = editor.conversion;

		schema.register( 'rawHtml', {
			isObject: true,
			allowWhere: '$block',
			allowAttributes: [ 'value' ]
		} );

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'div',
				classes: 'raw-html-embed'
			},
			model: ( viewElement, { writer } ) => {
				// Replace all view elements with their string presentations.
				const innerHTML = [ ...viewElement.getChildren() ]
					.map( child => viewStringify( child ) )
					.join( '' );

				return writer.createElement( 'rawHtml', {
					value: innerHTML
				} );
			}
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'rawHtml',
			view: ( modelElement, { writer } ) => {
				return writer.createRawElement( 'div', { class: 'raw-html-embed' }, function( domElement ) {
					domElement.innerHTML = modelElement.getAttribute( 'value' );
				} );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'rawHtml',
			view: ( modelElement, { writer } ) => {
				const label = t( 'HTML snippet' );
				const viewWrapper = writer.createContainerElement( 'div' );

				// TODO: `viewWrapper` should not be here but `toWidget` can be used only with the container element.
				const rawElement = writer.createRawElement( 'div', { class: 'raw-html-embed' }, function( domElement ) {
					domElement.innerHTML = sanitizeHtml( modelElement.getAttribute( 'value' ) );
				} );

				writer.insert( writer.createPositionAt( viewWrapper, 0 ), rawElement );

				return toRawHtmlWidget( viewWrapper, writer, label );
			}
		} );

		editor.commands.add( 'htmlEmbed', new HTMLEmbedCommand( editor ) );
	}
}

// Converts a given {@link module:engine/view/element~Element} to a html widget:
// * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to
//   recognize the html widget element.
// * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
//
//  @param {module:engine/view/element~Element} viewElement
//  @param {module:engine/view/downcastwriter~DowncastWriter} writer An instance of the view writer.
//  @param {String} label The element's label.
//  @returns {module:engine/view/element~Element}
function toRawHtmlWidget( viewElement, writer, label ) {
	writer.setCustomProperty( 'rawHTML', true, viewElement );

	return toWidget( viewElement, writer, { label } );
}
