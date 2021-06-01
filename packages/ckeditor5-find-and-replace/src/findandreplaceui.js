import { Plugin } from 'ckeditor5/src/core';
import { createDropdown, SplitButtonView } from 'ckeditor5/src/ui';

// import React from 'react';
// import ReactDOM from 'react-dom';
// import FindAndReplaceForm from './findandreplaceform';

/**
 * Example Find & Replace UI that uses FindAndReplace plugin API.
 *
 * It demonstrates how to use that API form outside the editor (except UI buttons).
 */
export default class FindAndReplaceUI extends Plugin {
	constructor( editor ) {
		super( editor );

		// const container = document.getElementById( 'search-results' );

		// ReactDOM.render(<FindAndReplaceForm editor={editor} />, container);

		this.activeSearch = null;

		this.addToolbarDropdown();
	}
	addToolbarDropdown() {
		const editor = this.editor;
		const t = editor.t;
		const componentFactory = editor.ui.componentFactory;

		componentFactory.add( 'findAndReplace', locale => {
			const dropdown = createDropdown( locale, SplitButtonView );

			// Configure dropdown's button properties:
			dropdown.buttonView.set( {
				withText: true,
				label: t( 'Find and replace' ),
				tooltip: true
			} );

			dropdown.buttonView.on( 'execute', () => {
				// console.log( 'find and replace button clicked' );
			} );

			dropdown.render();

			return dropdown;
		} );
	}
}
