/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module paragraph/paragraph
 */

import Plugin from '../core/plugin.js';

import ModelElement from '../engine/model/element.js';
import ModelPosition from '../engine/model/position.js';
import ModelRange from '../engine/model/range.js';
import ViewElement from '../engine/view/element.js';
import ViewRange from '../engine/view/range.js';

import modelWriter from '../engine/model/writer.js';
import buildModelConverter from '../engine/conversion/buildmodelconverter.js';
import buildViewConverter from '../engine/conversion/buildviewconverter.js';

/**
 * The paragraph feature for the editor.
 * Introduces the `<paragraph>` element in the model which renders as a `<p>` element in the DOM and data.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Paragraph extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const doc = editor.document;
		const data = editor.data;
		const editing = editor.editing;

		// Schema.
		doc.schema.registerItem( 'paragraph', '$block' );

		// Build converter from model to view for data and editing pipelines.
		buildModelConverter().for( data.modelToView, editing.modelToView )
			.fromElement( 'paragraph' )
			.toElement( 'p' );

		// Build converter from view to model for data pipeline.
		buildViewConverter().for( data.viewToModel )
			.fromElement( 'p' )
			.toElement( 'paragraph' );

		// Autoparagraph text.
		data.viewToModel.on( 'text', ( evt, data, consumable, conversionApi ) => {
			autoparagraphText( doc, evt, data, consumable, conversionApi );
		}, { priority: 'lowest' } );

		// Post-fix potential subsequent paragraphs created by autoparagraphText().
		data.viewToModel.on( 'element', mergeSubsequentParagraphs, { priority: 'lowest' } );
		data.viewToModel.on( 'documentFragment', mergeSubsequentParagraphs, { priority: 'lowest' } );

		// Convert paragraph-like elements to paragraphs if they weren't consumed.
		// It's a 'low' priority in order to hook in before the default 'element' converter
		// which would then convert children before handling this element.
		data.viewToModel.on( 'element', ( evt, data, consumable, conversionApi ) => {
			autoparagraphParagraphLikeElements( doc, evt, data, consumable, conversionApi );
		}, { priority: 'low' } );
	}
}

/**
 * List of element names which should be treated by the autoparagraphing algorithms as
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
 * Contains five paragraph-like elements – `<h1>` and two `<td>` and two `<li>`.
 * Hence, if none of the features is going to convert  those elements the above content will be automatically handled
 * by the paragraph feature and converted to:
 *
 *		<p>Foo</p>
 *		<p>X</p>
 *		<p>Y</p>
 *		<p>Z</p>
 *
 * Note: The `<td>` containing two `<li>` elements was ignored – the inner-most paragraph-like elements
 * have priority upon conversion.
 *
 * @member {Set.<String>} module:paragraph/paragraph~Paragraph.paragraphLikeElements
 */
Paragraph.paragraphLikeElements = new Set( [ 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'td', 'li', 'div' ] );

const paragraphsToMerge = new WeakSet();

function autoparagraphText( doc, evt, data, consumable, conversionApi ) {
	// If text wasn't consumed by the default converter...
	if ( !consumable.test( data.input ) ) {
		return;
	}

	// And paragraph is allowed in this context...
	if ( !doc.schema.check( { name: 'paragraph', inside: data.context } ) ) {
		return;
	}

	// Let's do autoparagraphing.

	const paragraph = new ModelElement( 'paragraph' );

	paragraphsToMerge.add( paragraph );

	data.context.push( paragraph );

	const text = conversionApi.convertItem( data.input, consumable, data );

	if ( text ) {
		data.output = paragraph;
		paragraph.appendChildren( text );
	}

	data.context.pop();
}

function autoparagraphParagraphLikeElements( doc, evt, data, consumable, conversionApi ) {
	// If this is a paragraph-like element...
	if ( !Paragraph.paragraphLikeElements.has( data.input.name ) ) {
		return;
	}

	// Which wasn't consumed by its own converter...
	if ( !consumable.test( data.input, { name: true } ) ) {
		return;
	}

	// And there are no other paragraph-like elements inside this tree...
	if ( hasParagraphLikeContent( data.input ) ) {
		return;
	}

	// And paragraph is allowed in this context...
	if ( !doc.schema.check( { name: 'paragraph', inside: data.context } ) ) {
		return;
	}

	// Let's convert this element to a paragraph and then all its children.

	consumable.consume( data.input, { name: true } );

	const paragraph = new ModelElement( 'paragraph' );

	data.context.push( paragraph );

	const convertedChildren = conversionApi.convertChildren( data.input, consumable, data );

	paragraph.appendChildren( modelWriter.normalizeNodes( convertedChildren ) );

	// Remove the created paragraph from the stack for other converters.
	// See https://github.com/ckeditor/ckeditor5-engine/issues/736
	data.context.pop();

	data.output = paragraph;
}

// Merges subsequent paragraphs if they should be merged (see shouldMerge).
function mergeSubsequentParagraphs( evt, data ) {
	let node = data.output.getChild( 0 );

	while ( node && node.nextSibling ) {
		const nextSibling = node.nextSibling;

		if ( paragraphsToMerge.has( node ) && paragraphsToMerge.has( nextSibling ) ) {
			modelWriter.insert( ModelPosition.createAt( node, 'end' ), Array.from( nextSibling.getChildren() ) );
			modelWriter.remove( ModelRange.createOn( nextSibling ) );
		} else {
			node = node.nextSibling;
		}
	}
}

// Checks whether an element has paragraph-like descendant.
function hasParagraphLikeContent( element ) {
	const range = ViewRange.createIn( element );

	for ( const value of range ) {
		if ( value.item instanceof ViewElement && Paragraph.paragraphLikeElements.has( value.item.name ) ) {
			return true;
		}
	}

	return false;
}
