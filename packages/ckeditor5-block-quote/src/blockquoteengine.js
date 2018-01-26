/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module block-quote/blockquoteengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import BlockQuoteCommand from './blockquotecommand';

import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';

/**
 * The block quote engine.
 *
 * Introduces the `'blockQuote'` command and the `'blockQuote'` model element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class BlockQuoteEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;

		editor.commands.add( 'blockQuote', new BlockQuoteCommand( editor ) );

		schema.register( 'blockQuote', {
			allowWhere: '$block',
			allowContentOf: '$root'
		} );

		// Disallow blockQuote in blockQuote.
		schema.addChildCheck( ( ctx, childDef ) => {
			if ( ctx.endsWith( 'blockQuote' ) && childDef.name == 'blockQuote' ) {
				return false;
			}
		} );

		buildViewConverter().for( editor.data.viewToModel )
			.fromElement( 'blockquote' )
			.toElement( 'blockQuote' );

		buildModelConverter().for( editor.data.modelToView, editor.editing.modelToView )
			.fromElement( 'blockQuote' )
			.toElement( 'blockquote' );
	}
}
