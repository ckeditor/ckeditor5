/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import buildModelConverter from '../engine/conversion/buildmodelconverter.js';
import buildViewConverter from '../engine/conversion/buildviewconverter.js';
import LinkElement from './linkelement.js';
import LinkCommand from './linkcommand.js';
import UnlinkCommand from './unlinkcommand.js';

/**
 * The link engine feature.
 *
 * It introduces the `linkHref="url"` attribute in the model which renders to the view as a `<a href="url">` element.
 *
 * @memberOf link
 * @extends core.Feature
 */
export default class LinkEngine extends Feature {
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
