/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import AttributeCommand from '../command/attributecommand.js';

/**
 * Bold feature.
 *
 * Bold features bring in possibility to mark some of the content (most commonly some text) as "important" ("bold").
 */
export default class BoldFeature extends Feature {
	init() {
		// Create instance of AttributeCommand which will handle bold attribute and add to commands registry.
		this.editor.commands.set( 'bold', new AttributeCommand( this.editor, 'bold' ) );

		// Something like this...........
		this.editor.treeController.registerAttributeConverter( 'bold', true, 'strong' );
		this.editor.treeController.registerViewToModelConverter(
			[
				[ 'tag', 'b' ],
				[ 'tag', 'strong' ],
				[ 'style', 'fontWeight', 'bold' ]
			],
			'bold',
			true
		);

		this.editor.document.schema.allow( { name: '$inline', attribute: 'bold', inside: '$block' } );
	}

	static get requires() {
		return [];
	}
}
