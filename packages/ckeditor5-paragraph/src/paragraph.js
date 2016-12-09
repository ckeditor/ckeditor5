/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module paragraph/paragraph
 */

import Plugin from '../core/plugin.js';

import ModelElement from '../engine/model/element.js';

import buildModelConverter from '../engine/conversion/buildmodelconverter.js';
import buildViewConverter from '../engine/conversion/buildviewconverter.js';

import isArray from '../utils/lib/lodash/isArray.js';

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
	}
}

/**
 * List of element names which should be treated by the autoparagraphing algorithms as
 * paragraph-like. This means that e.g. the following content:
 *
 *		<h1>Foo</h1>
 *		<table>
 *			<tr><td>X</td><td>Y</td></tr>
 *			<tr><td>X</td><td>Y</td></tr>
 *		</table>
 *
 * Contains three paragraph-like elements – `<h1>` and two `<tr>`. Hence, if none of the features is going to convert
 * those elements the above content will automatically be handled by the paragraph feature and converted to:
 *
 *		<p>Foo</p>
 *		<p>XY</p>
 *		<p>XY</p>
 *
 * Note that subsequent cells were merged, but `<tr>` elements were maintaned.
 *
 * @member {Set.<String>} module:paragraph/paragraph~Paragraph.paragraphLikeElements
 */
Paragraph.paragraphLikeElements = new Set( [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'tr', 'li' ] );

// A map of paragraphs to merge (model elements) to their block contexts in the view.
// The context is used in order to check whether two paragraps should really be merged.
// E.g.
// <h1>foo</h1><h1>bar</h1> => <p>foo</p><p>bar</p> (contexts: two different h1 elements – no merge)
// <div>foo<img>bar</div> => <p>foo</p><p><img></p><p>bar</p> (contexts: 3x the same div element – merge)
const paragraphsToMerge = new WeakMap();

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

	paragraphsToMerge.set( paragraph, getBlockContext( data.input ) );

	const newContext = data.context.concat( paragraph );
	const text = conversionApi.convertItem( data.input, consumable, { context: newContext } );

	if ( text ) {
		data.output = paragraph;
		paragraph.appendChildren( text );
	}
}

// Merges subsequent paragraphs if they should be merged (see shouldMerge).
function mergeSubsequentParagraphs( evt, data ) {
	if ( !data.output ) {
		return;
	}

	let node;

	if ( isArray( data.output ) ) {
		node = data.output[ 0 ];
	} else {
		node = data.output.getChild( 0 );
	}

	while ( node && node.nextSibling ) {
		const nextSibling = node.nextSibling;

		if ( shouldMerge( node, nextSibling ) ) {
			node.appendChildren( nextSibling.getChildren() );
			nextSibling.remove();
		} else {
			node = node.nextSibling;
		}
	}
}

// Checks whether two paragraphs should be merged. This
// may happen only if they were created by autoparagraphText() and were
// created from two nodes in the same block context.
function shouldMerge( paragraphA, paragraphB ) {
	return paragraphsToMerge.has( paragraphA ) && paragraphsToMerge.has( paragraphB ) &&
		( paragraphsToMerge.get( paragraphA ) == paragraphsToMerge.get( paragraphB ) );
}

// Returns first ancestor which name exists in paragraphLikeElements or the root.
function getBlockContext( node ) {
	const blockLikeAncestor = node.getAncestors( { parentFirst: true } ).find( ( ancestor ) => {
		return Paragraph.paragraphLikeElements.has( ancestor.name );
	} );

	return blockLikeAncestor ? blockLikeAncestor : node.root;
}
