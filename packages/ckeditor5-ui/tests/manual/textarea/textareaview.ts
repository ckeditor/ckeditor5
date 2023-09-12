/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { ButtonView, TextareaView } from '../../../src';

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

function addToPlayground( name, view ) {
	view.render();

	const setLargeTextButton = new ButtonView();

	setLargeTextButton.label = 'Set large text';
	setLargeTextButton.withText = true;
	setLargeTextButton.render();

	setLargeTextButton.on( 'execute', () => {
		view.value = '';
		view.value = 'Life doesn\'t allow us to execute every single plan perfectly. This especially seems to be the case when you ' +
			'travel. You plan it down to every minute with a big checklist. But when it comes to executing it, something always comes' +
			' up and you’re left with your improvising skills. You learn to adapt as you go.' +
			'Life doesn\'t allow us to execute every single plan perfectly. This especially seems to be the case when you ' +
			'travel. You plan it down to every minute with a big checklist. But when it comes to executing it, something always comes' +
			' up and you’re left with your improvising skills. You learn to adapt as you go.';
	} );

	const container = document.createElement( 'div' );
	const heading = document.createElement( 'h2' );
	heading.textContent = name;

	container.appendChild( heading );
	container.appendChild( view.element! );
	container.appendChild( setLargeTextButton.element! );
	document.querySelector( '.playground' )!.appendChild( container );
}

createPlainTextarea();
createPlainTextareaWithMoreRows();
createPlainTextareaWithFixedRows();
