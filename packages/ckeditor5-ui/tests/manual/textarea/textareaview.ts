/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ButtonView, TextareaView } from '../../../src/index.js';

function createPlainTextarea() {
	const textareaView = new TextareaView();

	addToPlayground( 'Default textarea', textareaView );
}

function createPlainTextareaWithMoreRows() {
	const textareaView = new TextareaView();

	textareaView.minRows = 5;
	textareaView.maxRows = 10;

	addToPlayground( 'min 5 rows, max 10 rows', textareaView );
}

function createPlainTextareaWithFixedRows() {
	const textareaView = new TextareaView();

	textareaView.minRows = 3;
	textareaView.maxRows = 3;

	addToPlayground( '3 rows, fixed', textareaView );
}

function createPlainTextareaWithSingleRow() {
	const textareaView = new TextareaView();

	textareaView.minRows = 1;
	textareaView.maxRows = 1;

	addToPlayground( '1 row, fixed', textareaView );
}

function createPlainTextareaWithVerticalResizeOnly() {
	const textareaView = new TextareaView();

	textareaView.resize = 'vertical';

	addToPlayground( 'Default rows, manual v-resize only', textareaView );
}

function createPlainTextareaWithFixedSizeAndResizeBoth() {
	const textareaView = new TextareaView();

	textareaView.minRows = textareaView.maxRows = 3;
	textareaView.resize = 'both';

	addToPlayground( '3 fixed rows, resize: both', textareaView );
}

function addToPlayground( name, view ) {
	view.render();

	const setLargeTextButton = new ButtonView();
	const clearButton = new ButtonView();

	view.value = 'Hello world!';
	setLargeTextButton.label = 'Set large text';
	setLargeTextButton.withText = true;
	setLargeTextButton.render();
	setLargeTextButton.class = 'ck-button-save';

	clearButton.label = 'Clear';
	clearButton.withText = true;
	clearButton.render();
	clearButton.class = 'ck-button-cancel';

	setLargeTextButton.on( 'execute', () => {
		view.value = '';
		view.value = 'Life doesn\'t allow us to execute every single plan perfectly. This especially seems to be the case when you ' +
			'travel. You plan it down to every minute with a big checklist. But when it comes to executing it, something always comes' +
			' up and you’re left with your improvising skills. You learn to adapt as you go.' +
			'Life doesn\'t allow us to execute every single plan perfectly. This especially seems to be the case when you ' +
			'travel. You plan it down to every minute with a big checklist. But when it comes to executing it, something always comes' +
			' up and you’re left with your improvising skills. You learn to adapt as you go.';
	} );

	clearButton.on( 'execute', () => {
		view.reset();
	} );

	const container = document.createElement( 'div' );
	const heading = document.createElement( 'h2' );
	heading.textContent = name;

	container.appendChild( heading );
	container.appendChild( view.element! );
	container.appendChild( setLargeTextButton.element! );
	container.appendChild( clearButton.element! );
	document.querySelector( '.playground' )!.appendChild( container );
}

createPlainTextarea();
createPlainTextareaWithMoreRows();
createPlainTextareaWithFixedRows();
createPlainTextareaWithSingleRow();
createPlainTextareaWithVerticalResizeOnly();
createPlainTextareaWithFixedSizeAndResizeBoth();
