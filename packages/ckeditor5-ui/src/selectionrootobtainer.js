/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/selectionrootobtainer
 */

/**
 * Returns a function, which obtains the farthest DOM
 * {@link module:engine/view/rooteditableelement~RootEditableElement}
 * of the {@link module:engine/view/document~Document#selection}.
 *
 * @param {module:core/editor/editor~Editor} editor Editor instance.
 * @returns {Function}
 */
export default function selectionRootObtainer( editor ) {
	return () => {
		const view = editor.editing.view;

		return view.domConverter.mapViewToDom( view.selection.editableElement.root );
	};
}
