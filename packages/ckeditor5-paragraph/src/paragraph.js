/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paragraph/paragraph
 */

import ParagraphCommand from './paragraphcommand';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * The paragraph feature for the editor.
 *
 * It introduces the `<paragraph>` element in the model which renders as a `<p>` element in the DOM and data.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Paragraph extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Paragraph';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const model = editor.model;
		const data = editor.data;

		editor.commands.add( 'paragraph', new ParagraphCommand( editor ) );

		// Schema.
		model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

		editor.conversion.elementToElement( { model: 'paragraph', view: 'p' } );

		// Content autoparagraphing. --------------------------------------------------

		// Handles element which has not been converted by any plugin and checks if it would be converted if
		// we wrap it in a paragraph or change it to a paragraph.
		editor.conversion.for( 'upcast' ).elementToElement( {
			model: ( viewElement, modelWriter ) => {
				if ( !Paragraph.paragraphLikeElements.has( viewElement.name ) ) {
					return null;
				}

				// Do not auto-paragraph empty elements.
				if ( viewElement.isEmpty ) {
					return null;
				}

				return modelWriter.createElement( 'paragraph' );
			},
			converterPriority: 'low'
		} );

		data.upcastDispatcher.on( 'element', ( evt, data, conversionApi ) => {
			// Do not try auto-paragraphing if the element was already converted.
			if ( !conversionApi.consumable.test( data.viewItem, { name: data.viewItem.name } ) ) {
				return;
			}

			// If the element is not paragraph-like try wrapping it in a paragraph.
			if ( isParagraphable( data.viewItem, data.modelCursor, conversionApi.schema ) ) {
				Object.assign( data, wrapInParagraph( data.viewItem, data.modelCursor, conversionApi ) );
			}
		}, { priority: 'low' } );

		// Handles not converted text nodes and checks if would be converted if we wraps then by a paragraph.
		data.upcastDispatcher.on( 'text', ( evt, data, conversionApi ) => {
			// When node is already converted then do nothing.
			if ( data.modelRange ) {
				return;
			}

			if ( isParagraphable( data.viewItem, data.modelCursor, conversionApi.schema ) ) {
				Object.assign( data, wrapInParagraph( data.viewItem, data.modelCursor, conversionApi ) );
			}
		}, { priority: 'lowest' } );

		// Empty roots autoparagraphing. -----------------------------------------------

		// Post-fixer which takes care of adding empty paragraph elements to empty roots.
		// Besides fixing content on #changesDone we also need to handle editor.data#ready event because
		// if initial data is empty or setData() wasn't even called there will be no #change fired.
		model.document.registerPostFixer( writer => this._autoparagraphEmptyRoots( writer ) );

		editor.data.on( 'ready', () => {
			model.enqueueChange( 'transparent', writer => this._autoparagraphEmptyRoots( writer ) );
		}, { priority: 'lowest' } );
	}

	/**
	 * Fixes all empty roots.
	 *
	 * @private
	 * @returns {Boolean} `true` if any change has been applied, `false` otherwise.
	 */
	_autoparagraphEmptyRoots( writer ) {
		const model = this.editor.model;

		for ( const rootName of model.document.getRootNames() ) {
			const root = model.document.getRoot( rootName );

			if ( root.isEmpty && root.rootName != '$graveyard' ) {
				// If paragraph element is allowed in the root, create paragraph element.
				if ( model.schema.checkChild( root, 'paragraph' ) ) {
					writer.insertElement( 'paragraph', root );

					return true;
				}
			}
		}
	}
}

/**
 * A list of element names which should be treated by the autoparagraphing algorithms as
 * paragraph-like. This means that e.g. the following content:
 *
 *		<h1>Foo</h1>
 *		<table>
 *			<tr>
 *				<td>X</td>
 *				<td>
 *					<ul>
 *						<li>Y</li>
 *						<li>Z</li>
 *					</ul>
 *				</td>
 *			</tr>
 *		</table>
 *
 * contains five paragraph-like elements: `<h1>`, two `<td>`s and two `<li>`s.
 * Hence, if none of the features is going to convert those elements the above content will be automatically handled
 * by the paragraph feature and converted to:
 *
 *		<p>Foo</p>
 *		<p>X</p>
 *		<p>Y</p>
 *		<p>Z</p>
 *
 * Note: The `<td>` containing two `<li>` elements was ignored as the innermost paragraph-like elements
 * have a priority upon conversion.
 *
 * @member {Set.<String>} module:paragraph/paragraph~Paragraph.paragraphLikeElements
 */
Paragraph.paragraphLikeElements = new Set( [
	'blockquote',
	'dd',
	'div',
	'dt',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'li',
	'p',
	'td'
] );

function wrapInParagraph( input, position, conversionApi ) {
	const paragraph = conversionApi.writer.createElement( 'paragraph' );

	conversionApi.writer.insert( paragraph, position );
	return conversionApi.convertItem( input, conversionApi.writer.createPositionAt( paragraph, 0 ) );
}

function isParagraphable( node, position, schema ) {
	const context = schema.createContext( position );

	// When paragraph is allowed in this context...
	if ( !schema.checkChild( context, 'paragraph' ) ) {
		return false;
	}

	// And a node would be allowed in this paragraph...
	if ( !schema.checkChild( context.push( 'paragraph' ), node ) ) {
		return false;
	}

	return true;
}
