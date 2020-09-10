/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/utils/injectbeforeinputhandling
 */

/**
 * Handles `beforeinput` DOM events caused by typing.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 */
export default function injectBeforeInputHandling( editor ) {
	const viewDocument = editor.editing.view.document;

	viewDocument.on( 'beforeinput', ( evt, evtData ) => {
		const { data, targetRanges, inputType } = evtData;
		let wasHandled;

		// There's no way a DOM range anchored in the fake selection container (and this is what beforeinput "knows")
		// was mapped correctly to an editing view range. Fake selection container is not a view element.
		// But, at the same time, if the selection is fake, it means that some object is selected and the input range
		// should simply surround it.
		const targetViewRange = viewDocument.selection.isFake ? viewDocument.selection.getFirstRange() : targetRanges[ 0 ];

		if ( inputType === 'insertText' ) {
			// This one is used by Chrome when typing accented letter (Mac).
			// This one is used by Safari when applying spell check (Mac).
			if ( !targetViewRange.collapsed ) {
				inputIntoTargetRange( editor, targetViewRange, data );

				wasHandled = true;
			}
			// This one is a regular typing.
			else {
				editor.execute( 'input', {
					text: data
				} );

				wasHandled = true;
			}
		}
		// This one is used by Safari when typing accented letter (Mac).
		// This one is used by Chrome when applying spell check suggestion (Mac).
		else if ( inputType === 'insertReplacementText' ) {
			inputIntoTargetRange( editor, targetViewRange, data );

			wasHandled = true;
		}

		if ( wasHandled ) {
			evt.stop();

			// Without it, typing accented characters on Chrome does not work – the second beforeInput event
			// comes with a collapsed targetViewRange (should be expanded instead).
			data.preventDefault();
		}
	} );
}

function inputIntoTargetRange( editor, targetViewRange, data ) {
	const editing = editor.editing;
	const modelRange = editing.mapper.toModelRange( targetViewRange );

	editor.execute( 'input', {
		text: data,
		range: modelRange
	} );
}
