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
		editor.editing.downcastDispatcher.on( 'insert:codeBlock', modelViewCodeBlockInsertion( editor.model ) );

		editor.data.downcastDispatcher.on( 'insert:codeBlock', modelViewCodeBlockInsertion( editor.model ) );
		editor.data.downcastDispatcher.on( 'insert:softBreak', modelViewSoftBreakInsertion( editor.model ), { priority: 'high' } );

		editor.data.upcastDispatcher.on( 'element:pre', dataViewModelCodeBlockInsertion( editor.data ) );
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

// A model-to-view converter for the codeBlock element.
//
// @param {module:engine/model/model~Model} model
// @returns {Function} Returns a conversion callback.
function modelViewCodeBlockInsertion( model ) {
	return ( evt, data, conversionApi ) => {
		const { writer, mapper, consumable } = conversionApi;

		if ( !consumable.consume( data.item, 'insert' ) ) {
			return;
		}

		const targetViewPosition = mapper.toViewPosition( model.createPositionBefore( data.item ) );
		const pre = writer.createContainerElement( 'pre' );
		const code = writer.createContainerElement( 'code' );

		writer.insert( writer.createPositionAt( pre, 0 ), code );
		writer.insert( targetViewPosition, pre );
		mapper.bindElements( data.item, code );
	};
}

// A model-to-view converter for the new line separator.
//
// @param {module:engine/model/model~Model} model
// @returns {Function} Returns a conversion callback.
function modelViewSoftBreakInsertion( model ) {
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

// A view-to-model converter for pre > code html.
//
// @param {module:engine/controller/datacontroller~DataController} dataController
// @returns {Function} Returns a conversion callback.
function dataViewModelCodeBlockInsertion( dataController ) {
	return ( evt, data, conversionApi ) => {
		const viewItem = data.viewItem;
		const viewChild = viewItem.getChild( 0 );

		if ( !viewChild || !viewChild.is( 'code' ) ) {
			return;
		}

		const { consumable, writer } = conversionApi;

		if ( !consumable.test( viewItem, { name: true } ) || !consumable.test( viewChild, { name: true } ) ) {
			return;
		}

		consumable.consume( viewItem, { name: true } );
		consumable.consume( viewChild, { name: true } );

		const modelItem = writer.createElement( 'codeBlock' );

		const stringifiedElement = dataController.processor.toData( viewChild );
		const textData = extractDataFromCodeElement( stringifiedElement );
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
		data.modelRange = writer.createRangeOn( modelItem );
	};
}

// Returns content of `<pre></pre>` with unescaped html inside.
//
// @param {String} stringifiedElement
function extractDataFromCodeElement( stringifiedElement ) {
	const data = new RegExp( /^<code>(.*)<\/code>$/, 's' ).exec( stringifiedElement )[ 1 ];

	return data
		.replace( /&lt;/g, '<' )
		.replace( /&gt;/g, '>' );
}
