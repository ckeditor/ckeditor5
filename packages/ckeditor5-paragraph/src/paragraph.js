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

import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';

/**
 * The paragraph feature for the editor.
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
		const doc = editor.document;
		const data = editor.data;
		const editing = editor.editing;

		editor.commands.add( 'paragraph', new ParagraphCommand( editor ) );

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

		// Content autoparagraphing. --------------------------------------------------

		// Step 1.
		// "Second chance" converters for elements and texts which were not allowed in their original locations.
		// They check if this element/text could be converted if it was in a paragraph.
		// Forcefully converted items will be temporarily in an invalid context. It's going to be fixed in step 2.

		// Executed after converter added by a feature, but before "default" to-model-fragment converter.
		data.viewToModel.on( 'element', convertAutoparagraphableItem, { priority: 'low' } );
		// Executed after default text converter.
		data.viewToModel.on( 'text', convertAutoparagraphableItem, { priority: 'lowest' } );

		// Step 2.
		// After an item is "forced" to be converted by `convertAutoparagraphableItem`, we need to actually take
		// care of adding the paragraph (assumed in `convertAutoparagraphableItem`) and wrap that item in it.

		// Executed after all converters (even default ones).
		data.viewToModel.on( 'element', autoparagraphItems, { priority: 'lowest' } );
		data.viewToModel.on( 'documentFragment', autoparagraphItems, { priority: 'lowest' } );

		// Empty roots autoparagraphing. -----------------------------------------------

		// Post-fixer which takes care of adding empty paragraph elements to empty roots.
		// Besides fixing content on #changesDone we also need to handle #dataReady because
		// if initial data is empty or setData() wasn't even called there will be no #change fired.
		doc.on( 'change', ( evt, type, changes, batch ) => {
			if ( batch.type == 'transparent' ) {
				return;
			}

			findEmptyRoots( doc, batch );
		} );
		doc.on( 'changesDone', autoparagraphEmptyRoots, { priority: 'lowest' } );
		editor.on( 'dataReady', () => {
			findEmptyRoots( doc, doc.batch( 'transparent' ) );
			autoparagraphEmptyRoots();
		}, { priority: 'lowest' } );
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

// This converter forces a conversion of a non-consumed view item, if that item would be allowed by schema and converted it if was
// inside a paragraph element. The converter checks whether conversion would be possible if there was a paragraph element
// between `data.input` item and its parent. If the conversion would be allowed, the converter adds `"paragraph"` to the
// context and fires conversion for `data.input` again.
function convertAutoparagraphableItem( evt, data, consumable, conversionApi ) {
	// If the item wasn't consumed by some of the dedicated converters...
	if ( !consumable.test( data.input, { name: data.input.name } ) ) {
		return;
	}

	// But would be allowed if it was in a paragraph...
	if ( !isParagraphable( data.input, data.context, conversionApi.schema, false ) ) {
		return;
	}

	// Convert that item in a paragraph context.
	data.context.push( 'paragraph' );
	const item = conversionApi.convertItem( data.input, consumable, data );
	data.context.pop();

	data.output = item;
}

// This converter checks all children of an element or document fragment that has been converted and wraps
// children in a paragraph element if it is allowed by schema.
//
// Basically, after an item is "forced" to be converted by `convertAutoparagraphableItem`, we need to actually take
// care of adding the paragraph (assumed in `convertAutoparagraphableItem`) and wrap that item in it.
function autoparagraphItems( evt, data, consumable, conversionApi ) {
	// Autoparagraph only if the element has been converted.
	if ( !data.output ) {
		return;
	}

	const isParagraphLike = Paragraph.paragraphLikeElements.has( data.input.name ) && !data.output.is( 'element' );

	// Keep in mind that this converter is added to all elements and document fragments.
	// This means that we have to make a smart decision in which elements (at what level) auto-paragraph should be inserted.
	// There are three situations when it is correct to add paragraph:
	//   -	we are converting a view document fragment: this means that we are at the top level of conversion and we should
	//		add paragraph elements for "bare" texts (unless converting in $clipboardHolder, but this is covered by schema),
	//   -	we are converting an element that was converted to model element: this means that it will be represented in model
	//		and has added its context when converting children - we should add paragraph for those items that passed
	//		in `convertAutoparagraphableItem`, because it is correct for them to be autoparagraphed,
	//	 -	we are converting "paragraph-like" element, which children should always be autoparagraphed (if it is allowed by schema,
	//		so we won't end up with, i.e., paragraph inside paragraph, if paragraph was in paragraph-like element).
	const shouldAutoparagraph =
		( data.input.is( 'documentFragment' ) ) ||
		( data.input.is( 'element' ) && data.output.is( 'element' ) ) ||
		isParagraphLike;

	if ( !shouldAutoparagraph ) {
		return;
	}

	// Take care of proper context. This is important for `isParagraphable` checks.
	const needsNewContext = data.output.is( 'element' );

	if ( needsNewContext ) {
		data.context.push( data.output );
	}

	// `paragraph` element that will wrap auto-paragraphable children.
	let autoParagraph = null;

	// Check children and wrap them in a `paragraph` element if they need to be wrapped.
	// Be smart when wrapping children and put all auto-paragraphable siblings in one `paragraph` parent:
	// foo<$text bold="true">bar</$text><paragraph>xxx</paragraph>baz      --->
	// <paragraph>foo<$text bold="true">bar</$text></paragraph><paragraph>xxx</paragraph><paragraph>baz</paragraph>
	for ( let i = 0; i < data.output.childCount; i++ ) {
		const child = data.output.getChild( i );

		if ( isParagraphable( child, data.context, conversionApi.schema, isParagraphLike ) ) {
			// If there is no wrapping `paragraph` element, create it.
			if ( !autoParagraph ) {
				autoParagraph = new ModelElement( 'paragraph' );
				data.output.insertChildren( child.index, autoParagraph );
			}
			// Otherwise, use existing `paragraph` and just fix iterator.
			// Thanks to reusing `paragraph` element, multiple siblings ends up in same container.
			else {
				i--;
			}

			child.remove();
			autoParagraph.appendChildren( child );
		} else {
			// That was not a paragraphable children, reset `paragraph` wrapper - following auto-paragraphable children
			// need to be placed in a new `paragraph` element.
			autoParagraph = null;
		}
	}

	if ( needsNewContext ) {
		data.context.pop();
	}
}

function isParagraphable( node, context, schema, insideParagraphLikeElement ) {
	const name = node.name || '$text';

	// Node is paragraphable if it is inside paragraph like element, or...
	// It is not allowed at this context...
	if ( !insideParagraphLikeElement && schema.check( { name, inside: context } ) ) {
		return false;
	}

	// And paragraph is allowed in this context...
	if ( !schema.check( { name: 'paragraph', inside: context } ) ) {
		return false;
	}

	// And a node would be allowed in this paragraph...
	if ( !schema.check( { name, inside: context.concat( 'paragraph' ) } ) ) {
		return false;
	}

	return true;
}

// Looks through all roots created in document and marks every empty root, saving which batch made it empty.
const rootsToFix = new Map();

function findEmptyRoots( doc, batch ) {
	for ( const rootName of doc.getRootNames() ) {
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
	for ( const [ root, batch ] of rootsToFix ) {
		// Only empty roots are in `rootsToFix`. Even if root got content during `changesDone` event (because of, for example
		// other feature), this will fire `findEmptyRoots` and remove that root from `rootsToFix`. So we are guaranteed
		// to have only empty roots here.
		const query = { name: 'paragraph', inside: [ root ] };
		const doc = batch.document;
		const schema = doc.schema;

		// If paragraph element is allowed in the root, create paragraph element.
		if ( schema.check( query ) ) {
			doc.enqueueChanges( () => {
				// Remove root from `rootsToFix` here, before executing batch, to prevent infinite loops.
				rootsToFix.delete( root );

				// Fix empty root.
				batch.insert( ModelPosition.createAt( root ), new ModelElement( 'paragraph' ) );
			} );
		}
	}
}
