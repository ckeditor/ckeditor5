/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/converters/tablecell-post-fixer
 */

/**
 * Injects a table cell post-fixer into the editing controller.
 *
 * The role of the table cell post-fixer is to ensure that the table cell contents in the editing view are properly converted.
 *
 * This post-fixer will ensure that after model changes in the editing view:
 * * single paragraphs are rendered as `<span>
 * * single paragraphs with one or more attributes are rendered as `<p>`
 * * single paragraphs in table cell with other block elements are rendered as `<p>`
 * * paragraphs in table cells with other block elements (including other paragraphs) are rendered as `<p>`.
 *
 * In the model each table cell has always at least one block element inside. If no other block was defined (empty table cell) the table
 * feature will insert empty `<paragraph>`. Similarly text nodes will be wrapped in paragraphs. Rendering in the data pipeline differs
 * from rendering in the editing pipeline - text nodes in single `<paragraph>` are rendered in the data pipeline as direct children
 * of the `<td>` or `<th>` elements. In other cases `<paragraph>` elements are rendered as `<p>` blocks.
 *
 * To ensure proper mappings between model and view elements and positions in the editing pipeline the table feature will always render
 * an element in the view: `<span>` for single or empty `<paragraph>` and `<p>` otherwise.
 *
 * Example:
 *
 *		<table>
 *			<tableRow>
 *				<tableCell><paragraph></paragraph></tableCell>
 *				<tableCell><paragraph>foo</paragraph></tableCell>
 *				<tableCell><paragraph baz="bar">foo</paragraph></tableCell>
 *				<tableCell><heading2>bar</heading2><paragraph>baz</paragraph></tableCell>
 *			</tableRow>
 *		</table>
 *
 * The editor will render in the data pipeline:
 *
 *		<figure>
 *			<table>
 *				<tbody>
 *					<tr>
 *						<td></td>
 *						<td>foo</td>
 *						<td><p baz="bar">foo</p></td>
 *						<td><h3>bar</h3><p>baz</p></td>
 *					</tr>
 *				</tbody>
 *			</table>
 *		</figure>
 *
 * and in the editing view (without widget markup):
 *
 *		<figure>
 *			<table>
 *				<tbody>
 *					<tr>
 *						<td><span></span></td>
 *						<td><span>foo</span></td>
 *						<td><p baz="bar">foo</p></td>
 *						<td><h3>bar</h3><p>baz</p></td>
 *					</tr>
 *				</tbody>
 *			</table>
 *		</figure>
 *
 * @param {module:engine/model/model~Model} model
 * @param {module:engine/controller/editingcontroller~EditingController} editing
 */
export default function injectTableCellPostFixer( model, editing ) {
	editing.view.document.registerPostFixer( writer => tableCellPostFixer( writer, model, editing.mapper, editing.view ) );
}

// The table cell post-fixer.
//
// @param {module:engine/view/writer~Writer} writer
// @param {module:engine/model/model~Model} model
// @param {module:engine/conversion/mapper~Mapper} mapper
function tableCellPostFixer( writer, model, mapper, view ) {
	let wasFixed = false;

	const elementsToCheck = getElementsToCheck( view );

	for ( const element of elementsToCheck ) {
		wasFixed = ensureProperElementName( element, mapper, writer ) || wasFixed;
	}

	// Selection in the view might not be updated to renamed elements. Happens mostly when other feature inserts paragraph to the table cell
	// (ie. when deleting table cell contents) and sets selection to it while table-post fixer changes view <p> to <span> element.
	// The view.selection would have outdated nodes.
	if ( wasFixed ) {
		updateRangesInViewSelection( model.document.selection, mapper, writer );
	}

	return wasFixed;
}

// Returns view elements changed in current view.change() block.
//
// **Note**: Currently it uses private property of the view: _renderer to get changed view elements to check.
//
// @param {module:engine/view/view~View} view
function getElementsToCheck( view ) {
	const elementsWithChangedAttributes = Array.from( view._renderer.markedAttributes )
		.filter( el => !!el.parent )
		.filter( isSpanOrP )
		.filter( el => isTdOrTh( el.parent ) );

	const changedChildren = Array.from( view._renderer.markedChildren )
		.filter( el => !!el.parent )
		.filter( isTdOrTh )
		.reduce( ( prev, element ) => {
			const childrenToCheck = Array.from( element.getChildren() ).filter( isSpanOrP );

			return [ ...prev, ...childrenToCheck ];
		}, [] );

	return [ ...elementsWithChangedAttributes, ...changedChildren ];
}

// This method checks if view element for model's <paragraph> was properly converter.
// Paragraph should be either
// - span: for single paragraph with no attributes.
// - p   : in other cases.
function ensureProperElementName( currentViewElement, mapper, writer ) {
	const modelParagraph = mapper.toModelElement( currentViewElement );
	const expectedViewElementName = getExpectedElementName( modelParagraph.parent, modelParagraph );

	if ( currentViewElement.name !== expectedViewElementName ) {
		// Unbind current view element as it should be cleared from mapper.
		mapper.unbindViewElement( currentViewElement );

		const renamedViewElement = writer.rename( expectedViewElementName, currentViewElement );

		// Bind paragraph inside table cell to the renamed view element.
		mapper.bindElements( modelParagraph, renamedViewElement );

		return true;
	}

	return false;
}

// Expected view element name depends on model elements:
// - <paragraph> with any attribute set should be rendered as <p>
// - all <paragraphs> in <tableCell> that has more then one children should be rendered as <p>
// - an only <paragraph> child with no attributes should be rendered as <span>
//
// @param {module:engine/model/element~Element} tableCell
// @param {module:engine/model/element~Element} paragraph
// @returns {String}
function getExpectedElementName( tableCell, paragraph ) {
	const isOnlyChild = tableCell.childCount > 1;
	const hasAttributes = !![ ...paragraph.getAttributes() ].length;

	return ( isOnlyChild || hasAttributes ) ? 'p' : 'span';
}

// Method to filter out <span> and <p> elements.
//
// @param {module:engine/view/element~Element} element
function isSpanOrP( element ) {
	return element.is( 'p' ) || element.is( 'span' );
}

// Method to filter out <td> and <th> elements.
//
// @param {module:engine/view/element~Element} element
function isTdOrTh( element ) {
	return element.is( 'td' ) || element.is( 'th' );
}

// Resets view selections based on model selection.
function updateRangesInViewSelection( selection, mapper, writer ) {
	const fixedRanges = Array.from( selection.getRanges() )
		.map( range => mapper.toViewRange( range ) );

	writer.setSelection( fixedRanges, { backward: selection.isBackward } );
}
