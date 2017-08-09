/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/selectionrootobtainer
 */

export default function selectionRootObtainer( editor ) {
	return () => {
		const viewDocument = editor.editing.view;

		return viewDocument.domConverter.mapViewToDom( viewDocument.selection.editableElement.root );
	};
}
