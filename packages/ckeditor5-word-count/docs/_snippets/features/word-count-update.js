/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window, document, console, BalloonEditor */

BalloonEditor
	.create( document.querySelector( '#demo-update__editor' ), {
		toolbar: {
			items: [
				'heading',
				'|',
				'bold',
				'italic',
				'bulletedList',
				'numberedList',
				'blockQuote',
				'link',
				'|',
				'mediaEmbed',
				'insertTable',
				'|',
				'undo',
				'redo'
			],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		placeholder: 'Text of the post',
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		}
	} )
	.then( editor => {
		const maxCharacters = 120;
		const wordCountPlugin = editor.plugins.get( 'WordCount' );
		const container = document.querySelector( '.demo-update' );
		const progressCircle = document.querySelector( '.demo-update__chart__circle' );
		const charactersBox = document.querySelector( '.demo-update__chart__characters' );
		const wordsBox = document.querySelector( '.demo-update__words' );
		const sendButton = document.querySelector( '.demo-update__send' );
		const circleCircumference = Math.floor( 2 * Math.PI * progressCircle.getAttribute( 'r' ) );

		// Update the UI on editor load.
		updateWordCountStatsUI( wordCountPlugin.characters, wordCountPlugin.words );

		// Update the UI as the content of the editor changes.
		wordCountPlugin.on( 'update', ( evt, data ) => {
			updateWordCountStatsUI( data.characters, data.words );
		} );

		function updateWordCountStatsUI( currentCharacters, currentWords ) {
			const charactersProgress = currentCharacters / maxCharacters * circleCircumference;
			const isLimitExceeded = currentCharacters > maxCharacters;
			const isCloseToLimit = !isLimitExceeded && currentCharacters > maxCharacters * .8;
			const circleDashArray = Math.min( charactersProgress, circleCircumference );

			// Set the stroke of the circle to show the how many characters were typed.
			progressCircle.setAttribute( 'stroke-dasharray', `${ circleDashArray },${ circleCircumference }` );

			// Display the number of characters in the progress chart. When exceeded the limit,
			// display how many characters should be removed.
			if ( isLimitExceeded ) {
				charactersBox.textContent = `-${ currentCharacters - maxCharacters }`;
			} else {
				charactersBox.textContent = currentCharacters;
			}

			wordsBox.textContent = `Words in the post: ${ currentWords }`;

			// If the content length is close to the characters limit, add a CSS class to warns the user.
			container.classList.toggle( 'demo-update__limit-close', isCloseToLimit );

			// If exceeded the characters limit, add a CSS class that makes the content's background red.
			container.classList.toggle( 'demo-update__limit-exceeded', isLimitExceeded );

			// If exceeded the characters limit, disable the send button.
			sendButton.toggleAttribute( 'disabled', isLimitExceeded );
		}

		sendButton.addEventListener( 'click', () => {
			window.alert( 'Post sent!' ); // eslint-disable-line no-alert
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

