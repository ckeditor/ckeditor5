/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/utils/ui/widget
 */

/**
 * Returns a table widget editing view element if one is selected.
 *
 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} selection
 * @param {module:widget/widget~Widget} widget
 * @returns {module:engine/view/element~Element|null}
 */
export function getSelectedTableWidget( selection, widget ) {
	const viewElement = selection.getSelectedElement();

	if ( viewElement && isTableWidget( viewElement, widget ) ) {
		return viewElement;
	}

	return null;
}

/**
 * Returns a table widget editing view element if one is among the selection's ancestors.
 *
 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} selection
 * @param {module:widget/widget~Widget} widget
 * @returns {module:engine/view/element~Element|null}
 */
export function getTableWidgetAncestor( selection, widget ) {
	const parentTable = findAncestor( 'table', selection.getFirstPosition() );

	if ( parentTable && isTableWidget( parentTable.parent, widget ) ) {
		return parentTable.parent;
	}

	return null;
}

// Checks if a given view element is a table widget.
//
// @param {module:engine/view/element~Element} viewElement
// @param {module:widget/widget~Widget} widget
// @returns {Boolean}
function isTableWidget( viewElement, widget ) {
	return !!viewElement.getCustomProperty( 'table' ) && widget.isWidget( viewElement );
}

function findAncestor( parentName, positionOrElement ) {
	let parent = positionOrElement.parent;

	while ( parent ) {
		if ( parent.name === parentName ) {
			return parent;
		}

		parent = parent.parent;
	}
}
