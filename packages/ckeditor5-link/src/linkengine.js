/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module link/linkengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { downcastAttributeToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToAttribute } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import LinkCommand from './linkcommand';
import UnlinkCommand from './unlinkcommand';
import { createLinkElement } from './utils';

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

		// Allow link attribute on all inline nodes.
		editor.model.schema.extend( '$text', { allowAttributes: 'linkHref' } );

		editor.conversion.for( 'downcast' )
			.add( downcastAttributeToElement( 'linkHref', { view: linkHref => createLinkElement( linkHref ) } ) );

		editor.conversion.for( 'upcast' )
			.add( upcastElementToAttribute( {
				view: {
					name: 'a',
					attribute: {
						href: true
					}
				},
				model: {
					key: 'linkHref',
					value: viewElement => viewElement.getAttribute( 'href' )
				}
			} ) );

		// Create linking commands.
		editor.commands.add( 'link', new LinkCommand( editor ) );
		editor.commands.add( 'unlink', new UnlinkCommand( editor ) );
	}
}
