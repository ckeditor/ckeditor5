/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
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
		const schema = editor.document.schema;

		editor.commands.add( 'blockQuote', new BlockQuoteCommand( editor ) );

		schema.registerItem( 'blockQuote' );
		schema.allow( { name: 'blockQuote', inside: '$root' } );
		schema.allow( { name: '$block', inside: 'blockQuote' } );

		buildViewConverter().for( editor.data.viewToModel )
			.fromElement( 'blockquote' )
			.toElement( 'blockQuote' );

		buildModelConverter().for( editor.data.modelToView, editor.editing.modelToView )
			.fromElement( 'blockQuote' )
			.toElement( 'blockquote' );
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const schema = this.editor.document.schema;

		// TODO
		// Workaround for https://github.com/ckeditor/ckeditor5-engine/issues/532#issuecomment-280924650.
		if ( schema.hasItem( 'listItem' ) ) {
			schema.allow( {
				name: 'listItem',
				inside: 'blockQuote',
				attributes: [ 'type', 'indent' ]
			} );
		}
	}
}
