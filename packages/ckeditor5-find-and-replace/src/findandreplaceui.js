import { Plugin } from 'ckeditor5/src/core';
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
	}
}
