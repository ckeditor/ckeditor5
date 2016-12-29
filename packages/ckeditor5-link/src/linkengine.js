/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module link/linkengine
 */

import Plugin from 'ckeditor5-core/src/plugin';
import buildModelConverter from 'ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from 'ckeditor5-engine/src/conversion/buildviewconverter';
import LinkElement from './linkelement';
import LinkCommand from './linkcommand';
import UnlinkCommand from './unlinkcommand';

/**
 * The link engine feature.
 *
 * It introduces the `linkHref="url"` attribute in the model which renders to the view as a `<a href="url">` element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class LinkEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const data = editor.data;
		const editing = editor.editing;

		// Allow link attribute on all inline nodes.
		editor.document.schema.allow( { name: '$inline', attributes: 'linkHref' } );

		// Build converter from model to view for data and editing pipelines.
		buildModelConverter().for( data.modelToView, editing.modelToView )
			.fromAttribute( 'linkHref' )
			.toElement( ( linkHref ) => new LinkElement( 'a', { href: linkHref } ) );

		// Build converter from view to model for data pipeline.
		buildViewConverter().for( data.viewToModel )
			.fromElement( 'a' )
			.toAttribute( ( viewElement ) => ( {
				key: 'linkHref',
				value: viewElement.getAttribute( 'href' )
			} ) );

		// Create linking commands.
		editor.commands.set( 'link', new LinkCommand( editor ) );
		editor.commands.set( 'unlink', new UnlinkCommand( editor ) );
	}
}
