/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module paragraph/paragraph
 */

import ParagraphCommand from './paragraphcommand';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import ViewRange from '@ckeditor/ckeditor5-engine/src/view/range';

import modelWriter from '@ckeditor/ckeditor5-engine/src/model/writer';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';

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
	static get pluginName() {
		return 'paragraph/paragraph';
	}

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

		editor.commands.set( 'paragraph', new ParagraphCommand( editor ) );

		// Post-fixer that takes care of adding empty paragraph elements to empty roots.
		// Besides fixing content on #changesDone we also need to handle #dataReady because
		// if initial data is empty or setData() wasn't even called there will be no #change fired.
		doc.on( 'change', ( evt, type, changes, batch ) => findEmptyRoots( doc, batch ) );
		doc.on( 'changesDone', autoparagraphEmptyRoots, { priority: 'lowest' } );
		editor.on( 'dataReady', () => {
			findEmptyRoots( doc, doc.batch( 'transparent' ) );
			autoparagraphEmptyRoots();
		}, { priority: 'lowest' } );
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
	if ( !data.output ) {
		return;
	}

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

// Looks through all roots created in document and marks every empty root, saving which batch made it empty.
const rootsToFix = new Map();

function findEmptyRoots( doc, batch ) {
	for ( let rootName of doc.getRootNames() ) {
		const root = doc.getRoot( rootName );

		if ( root.isEmpty ) {
			if ( !rootsToFix.has( root ) ) {
				rootsToFix.set( root, batch );
			}
		} else {
			rootsToFix.delete( root );
		}
	}
}

// Fixes all empty roots.
function autoparagraphEmptyRoots() {
	for ( let [ root, batch ] of rootsToFix ) {
		// Only empty roots are in `rootsToFix`. Even if root got content during `changesDone` event (because of, for example
		// other feature), this will fire `findEmptyRoots` and remove that root from `rootsToFix`. So we are guaranteed
		// to have only empty roots here.
		const query = { name: 'paragraph', inside: [ root ] };
		const doc = batch.document;
		const schema = doc.schema;

		// If paragraph element is allowed in the root, create paragraph element.
		if ( schema.check( query ) ) {
			doc.enqueueChanges( () => {
				batch.insert( ModelPosition.createAt( root ), new ModelElement( 'paragraph' ) );
			} );
		}
	}

	rootsToFix.clear();
}
