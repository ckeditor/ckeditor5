/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/converters/tablecell-post-fixer
 */

import Range from '@ckeditor/ckeditor5-engine/src/view/range';

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
	editing.view.document.registerPostFixer( writer => tableCellPostFixer( writer, model, editing.mapper, editing ) );
}

// The table cell post-fixer.
//
// @param {module:engine/view/writer~Writer} writer
// @param {module:engine/model/model~Model} model
// @param {module:engine/conversion/mapper~Mapper} mapper
function tableCellPostFixer( writer, model, mapper, editing ) {
	const changes = model.document.differ.getChanges();
	let wasFixed = false;

	// While this is view post fixer only nodes that changed are worth investigating.
	for ( const entry of changes ) {
		// Attribute change - check if it is single paragraph inside table cell that has attributes changed.
		if ( entry.type == 'attribute' && entry.range.start.parent.name == 'tableCell' ) {
			const tableCell = entry.range.start.parent;

			if ( tableCell.childCount === 1 ) {
				const singleChild = tableCell.getChild( 0 );
				const renameTo = Array.from( singleChild.getAttributes() ).length ? 'p' : 'span';

				wasFixed = renameParagraphIfDifferent( singleChild, renameTo, writer, mapper, editing, model ) || wasFixed;
			}
		} else {
			// Check all nodes inside table cell on insert/remove operations (also other blocks).
			const parent = entry.position && entry.position.parent;

			if ( parent && parent.is( 'tableCell' ) ) {
				const renameTo = parent.childCount > 1 ? 'p' : 'span';

				for ( const child of parent.getChildren() ) {
					wasFixed = renameParagraphIfDifferent( child, renameTo, writer, mapper, editing, model ) || wasFixed;
				}
			}
		}
	}

	return wasFixed;
}

// Renames associated view element to a desired one. It will only rename if:
// - model element is a paragraph
// - view element is converted (mapped)
// - view element has different name then requested.
//
// @param modelElement
// @param desiredElementName
// @param {module:engine/view/writer~Writer} writer
// @param {module:engine/conversion/mapper~Mapper} mapper
function renameParagraphIfDifferent( modelElement, desiredElementName, writer, mapper, editing, model ) {
	// Only rename paragraph elements.
	if ( !modelElement.is( 'paragraph' ) ) {
		return false;
	}

	const viewElement = mapper.toViewElement( modelElement );

	// Only rename converted elements which aren't desired ones.
	if ( !viewElement || viewElement.name === desiredElementName ) {
		return false;
	}

	const rangesToFix = checkRangesToFix( model, modelElement, editing, mapper );

	mapper.unbindViewElement( viewElement );

	const renamedViewElement = writer.rename( viewElement, desiredElementName );

	// Bind table cell to renamed view element.
	mapper.bindElements( modelElement, renamedViewElement );

	if ( rangesToFix.length ) {
		fixViewSelection( rangesToFix, mapper, writer );
	}

	return true;
}

function checkRangesToFix( model, modelElement, editing, mapper ) {
	const needsFix = !![ ...model.document.selection.getSelectedBlocks() ].find( el => el === modelElement );

	if ( !needsFix ) {
		return [];
	}

	const rangesToFix = [];

	const selection = editing.view.document.selection;

	const ranges = selection.getRanges();

	for ( const range of ranges ) {
		rangesToFix.push( {
			start: mapper.toModelPosition( range.start ),
			end: mapper.toModelPosition( range.end )
		} );
	}

	return rangesToFix;
}

function fixViewSelection( rangesToFix, mapper, writer ) {
	const fixedRanges = rangesToFix.map( range => new Range( mapper.toViewPosition( range.start ), mapper.toViewPosition( range.end ) ) );

	writer.setSelection( fixedRanges );
}
