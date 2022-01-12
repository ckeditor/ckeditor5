/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecaption/utils
 */

/**
 * Checks if the provided model element is a `table`.
 *
 * @param {module:engine/model/element~Element} modelElement Element to check if it is a table.
 * @returns {Boolean}
 */
export function isTable( modelElement ) {
	return !!modelElement && modelElement.is( 'element', 'table' );
}

/**
 * Returns the caption model element from a given table element. Returns `null` if no caption is found.
 *
 * @param {module:engine/model/element~Element} tableModelElement Table element in which we will try to find a caption element.
 * @returns {module:engine/model/element~Element|null}
 */
export function getCaptionFromTableModelElement( tableModelElement ) {
	for ( const node of tableModelElement.getChildren() ) {
		if ( node.is( 'element', 'caption' ) ) {
			return node;
		}
	}

	return null;
}

/**
 * Returns the caption model element for a model selection. Returns `null` if the selection has no caption element ancestor.
 *
 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
 * The selection checked for caption presence.
 * @returns {module:engine/model/element~Element|null}
 */
export function getCaptionFromModelSelection( selection ) {
	const tableElement = getSelectionAffectedTable( selection );

	if ( !tableElement ) {
		return null;
	}

	return getCaptionFromTableModelElement( tableElement );
}

/**
 * {@link module:engine/view/matcher~Matcher} pattern. Checks if a given element is a caption.
 *
 * There are two possible forms of the valid caption:
 *  - A `<figcaption>` element inside a `<figure class="table">` element.
 *  - A `<caption>` inside a <table>.
 *
 * @param {module:engine/view/element~Element} element
 * @returns {Object|null} Returns the object accepted by {@link module:engine/view/matcher~Matcher} or `null` if the element
 * cannot be matched.
 */
export function matchTableCaptionViewElement( element ) {
	const parent = element.parent;

	if ( element.name == 'figcaption' && parent && parent.name == 'figure' && parent.hasClass( 'table' ) ) {
		return { name: true };
	}

	if ( element.name == 'caption' && parent && parent.name == 'table' ) {
		return { name: true };
	}

	return null;
}

/**
 * Depending on the position of the selection we either return the table under cursor or look for the table higher in the hierarchy.
 *
 * @param {module:engine/model/position~Position} position
 * @returns {module:engine/model/element~Element}
 */
export function getSelectionAffectedTable( selection ) {
	const selectedElement = selection.getSelectedElement();

	// Is the command triggered from the `tableToolbar`?
	if ( selectedElement && selectedElement.is( 'element', 'table' ) ) {
		return selectedElement;
	}

	return selection.getFirstPosition().findAncestor( 'table' );
}
