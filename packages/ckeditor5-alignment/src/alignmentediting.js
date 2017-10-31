/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module alignment/alignmentediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import AlignmentCommand from './alignmentcommand';

import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';

const alignmentTypes = [ 'left', 'right', 'center', 'justify' ];

/**
 * @extends module:core/plugin~Plugin
 */
export default class AlignmentEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const doc = editor.document;
		const schema = doc.schema;
		const data = editor.data;
		const editing = editor.editing;

		// Allow alignment attribute on all blocks.
		schema.allow( { name: '$block', attributes: 'alignment' } );

		buildModelConverter()
			.for( data.modelToView, editing.modelToView )
			.fromAttribute( 'alignment' )
			.toAttribute( value => ( { key: 'style', value: `text-align:${ value }` } ) );

		buildViewConverter()
			.for( data.viewToModel )
			.fromAttribute( 'style', /text-align/ )
			.toAttribute( viewElement => {
				const textAlign = viewElement.getStyle( 'text-align' );

				// Do not convert empty, default or unknown alignment values.
				if ( !textAlign || isDefault( textAlign ) || !alignmentTypes.includes( textAlign ) ) {
					return;
				}

				return { key: 'alignment', value: textAlign };
			} );

		// Register commands for text alignment.
		editor.commands.add( 'alignLeft', new AlignmentCommand( editor, 'left' ) );
		editor.commands.add( 'alignRight', new AlignmentCommand( editor, 'right' ) );
		editor.commands.add( 'alignCenter', new AlignmentCommand( editor, 'center' ) );
		editor.commands.add( 'alignJustify', new AlignmentCommand( editor, 'justify' ) );
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const schema = this.editor.document.schema;

		// Disallow alignment on fiqcaption
		if ( schema.hasItem( 'caption' ) ) {
			schema.disallow( { name: 'caption', attributes: 'alignment' } );
		}
	}
}

// Check whether alignment is default one.
// @private
function isDefault( textAlign ) {
	return textAlign === 'left';
}
