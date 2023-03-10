/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window, document, console, BalloonEditor */

const maxCharacters = 120;
const container = document.querySelector( '.demo-update' );
const progressCircle = document.querySelector( '.demo-update__chart__circle' );
const charactersBox = document.querySelector( '.demo-update__chart__characters' );
const wordsBox = document.querySelector( '.demo-update__words' );
const circleCircumference = Math.floor( 2 * Math.PI * progressCircle.getAttribute( 'r' ) );
const sendButton = document.querySelector( '.demo-update__send' );

sendButton.addEventListener( 'click', () => {
	window.alert( 'Post sent!' ); // eslint-disable-line no-alert
} );

BalloonEditor
	.create( document.querySelector( '#demo-update__editor' ), {
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'uploadImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		placeholder: 'Text of the post',
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		},
		wordCount: {
			onUpdate: stats => {
				const charactersProgress = stats.characters / maxCharacters * circleCircumference;
				const isLimitExceeded = stats.characters > maxCharacters;
				const isCloseToLimit = !isLimitExceeded && stats.characters > maxCharacters * .8;
				const circleDashArray = Math.min( charactersProgress, circleCircumference );

				// Set the stroke of the circle to show how many characters were typed.
				progressCircle.setAttribute( 'stroke-dasharray', `${ circleDashArray },${ circleCircumference }` );

				// Display the number of characters in the progress chart. When the limit is exceeded,
				// display how many characters should be removed.
				if ( isLimitExceeded ) {
					charactersBox.textContent = `-${ stats.characters - maxCharacters }`;
				} else {
					charactersBox.textContent = stats.characters;
				}

				wordsBox.textContent = `Words in the post: ${ stats.words }`;

				// If the content length is close to the characters limit, add a CSS class to warn the user.
				container.classList.toggle( 'demo-update__limit-close', isCloseToLimit );

				// If the character limit is exceeded, add a CSS class that makes the content's background red.
				container.classList.toggle( 'demo-update__limit-exceeded', isLimitExceeded );

				// If the character limit is exceeded, disable the send button.
				sendButton.toggleAttribute( 'disabled', isLimitExceeded );
			}
		}
	} )
	.catch( err => {
		console.error( err.stack );
	} );

