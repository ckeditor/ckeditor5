/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/converters/tablecell-post-fixer
 */

/**
 * Injects a table cell post-fixer into the editing controller.
 *
 * @param {module:engine/model/model~Model} model
 * @param {module:engine/controller/editingcontroller~EditingController} editing
 */
export default function injectTableCellPostFixer( model, editing ) {
	editing.view.document.registerPostFixer( writer => tableCellPostFixer( writer, model, editing.mapper ) );
}

// The table cell post-fixer.
//
// @param {module:engine/view/writer~Writer} writer
// @param {module:engine/model/model~Model} model
// @param {module:engine/conversion/mapper~Mapper} mapper
function tableCellPostFixer( writer, model, mapper ) {
	const changes = model.document.differ.getChanges();

	for ( const entry of changes ) {
		const tableCell = entry.position && entry.position.parent;

		if ( !tableCell && entry.type == 'attribute' && entry.range.start.parent.name == 'tableCell' ) {
			const tableCell = entry.range.start.parent;

			if ( tableCell.childCount === 1 ) {
				const singleChild = tableCell.getChild( 0 );

				if ( !singleChild || !singleChild.is( 'paragraph' ) ) {
					return;
				}

				const viewElement = mapper.toViewElement( singleChild );

				let renameTo = 'p';

				if ( viewElement.name === 'p' ) {
					if ( [ ...singleChild.getAttributes() ].length ) {
						return;
					} else {
						renameTo = 'span';
					}
				}

				const renamedViewElement = writer.rename( viewElement, renameTo );

				// Re-bind table cell to renamed view element.
				mapper.bindElements( singleChild, renamedViewElement );
			}
		}

		if ( !tableCell ) {
			continue;
		}

		if ( tableCell.is( 'tableCell' ) ) {
			if ( tableCell.childCount > 1 ) {
				for ( const child of tableCell.getChildren() ) {
					if ( child.name != 'paragraph' ) {
						continue;
					}

					const viewElement = mapper.toViewElement( child );

					if ( viewElement && viewElement.name === 'span' ) {
						// Unbind table cell as <span> will be renamed to <p>.
						// mapper.unbindModelElement( tableCell );

						const renamedViewElement = writer.rename( viewElement, 'p' );

						// Re-bind table cell to renamed view element.
						mapper.bindElements( child, renamedViewElement );
					}
				}
			} else {
				const singleChild = tableCell.getChild( 0 );
				if ( !singleChild || !singleChild.is( 'paragraph' ) ) {
					return;
				}

				const viewElement = mapper.toViewElement( singleChild );

				// Unbind table cell as <span> will be renamed to <p>.
				// mapper.unbindModelElement( tableCell );

				const renamedViewElement = writer.rename( viewElement, 'span' );

				// Re-bind table cell to renamed view element.
				mapper.bindElements( singleChild, renamedViewElement );
			}
		}
	}
}
