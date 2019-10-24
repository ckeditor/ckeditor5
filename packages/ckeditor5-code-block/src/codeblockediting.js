/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/codeblockediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';
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
	static get pluginName() {
		return 'CodeBlockEditing';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ShiftEnter ];
	}

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
			if ( context.endsWith( 'codeBlock' ) && childDef.name === 'codeBlock' ) {
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
		editor.conversion.for( 'editingDowncast' ).elementToElement( { model: 'codeBlock', view: 'pre' } );

		editor.conversion.for( 'dataDowncast' ).elementToElement( { model: 'codeBlock', view: 'pre' } );
		editor.data.downcastDispatcher.on( 'insert:softBreak', dataModelViewSoftBreakInsertion( editor.model ), { priority: 'high' } );
		editor.data.upcastDispatcher.on( 'element:pre', dataViewModelPreInsertion( editor.data ) );
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

// A model-to-view converter for the new line separator.
//
// @param {module:engine/model/model~Model} model
// @returns {Function} Returns a conversion callback.
function dataModelViewSoftBreakInsertion( model ) {
	return ( evt, data, conversionApi ) => {
		if ( data.item.parent.name !== 'codeBlock' ) {
			return;
		}

		const { writer, mapper, consumable } = conversionApi;

		if ( !consumable.consume( data.item, 'insert' ) ) {
			return;
		}

		const position = mapper.toViewPosition( model.createPositionBefore( data.item ) );

		writer.insert( position, writer.createText( '\n' ) );
	};
}

// A view-to-model converter for `pre` tag.
//
// @param {module:engine/controller/datacontroller~DataController} dataController
// @returns {Function} Returns a conversion callback.
function dataViewModelPreInsertion( dataController ) {
	return ( evt, data, conversionApi ) => {
		const { consumable, writer } = conversionApi;

		if ( !consumable.consume( data.viewItem, { name: true } ) ) {
			return;
		}

		const modelItem = writer.createElement( 'codeBlock' );

		const stringifiedElement = dataController.processor.toData( data.viewItem );
		const textData = extractDataFromPreElement( stringifiedElement );
		const textLines = textData.split( '\n' ).map( data => writer.createText( data ) );
		const lastLine = textLines[ textLines.length - 1 ];

		for ( const node of textLines ) {
			writer.append( node, modelItem );

			if ( node !== lastLine ) {
				writer.appendElement( 'softBreak', modelItem );
			}
		}

		writer.insert( modelItem, data.modelCursor );

		data.modelCursor = writer.createPositionAfter( modelItem );
		data.modelRange = writer.createRange( data.modelCursor );
	};
}

// Returns content of `<pre></pre>` with unescaped html inside.
//
// @param {String} stringifiedElement
function extractDataFromPreElement( stringifiedElement ) {
	const data = new RegExp( /^<pre>(.*)<\/pre>$/, 's' ).exec( stringifiedElement )[ 1 ];

	return data
		.replace( /&lt;/g, '<' )
		.replace( /&gt;/g, '>' );
}
