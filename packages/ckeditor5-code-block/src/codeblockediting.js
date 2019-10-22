/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/codeblockediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import CodeBlockCommand from './codeblockcommand';

/**
 * The editing part of the code block feature.
 *
 * Introduces the `'codeBlock'` command and the `'codeBlock'` model element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CodeBlockEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;

		// Command.
		editor.commands.add( 'codeBlock', new CodeBlockCommand( editor ) );

		// Schema.
		schema.register( 'codeBlock', { inheritAllFrom: '$block' } );

		// Disallow codeBlock in codeBlock.
		schema.addChildCheck( ( context, childDef ) => {
			if ( context.endsWith( 'codeBlock' ) && childDef.name == 'codeBlock' ) {
				return false;
			}
		} );

		// Disallow all attributes in `codeBlock`.
		schema.addAttributeCheck( context => {
			if ( context.endsWith( 'codeBlock' ) || context.endsWith( 'codeBlock $text' ) ) {
				return false;
			}
		} );

		// Conversion.
		editor.conversion.elementToElement( { model: 'codeBlock', view: 'pre' } );
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const viewDoc = editor.editing.view.document;

		this.listenTo( viewDoc, 'enter', ( evt, data ) => {
			const doc = editor.model.document;
			const positionParent = doc.selection.getLastPosition().parent;

			if ( positionParent.is( 'codeBlock' ) ) {
				editor.execute( 'shiftEnter' );
				data.preventDefault();
				evt.stop();
			}
		} );
	}
}
