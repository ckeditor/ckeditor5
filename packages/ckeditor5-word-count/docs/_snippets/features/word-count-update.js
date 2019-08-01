/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window, document, console, ClassicEditor */

ClassicEditor
	.create( document.querySelector( '#demo-editor-update' ), {
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
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		},
		wordCount: {
			onUpdate: ( () => {
				const progressBar = document.querySelector( '.customized-count progress' );
				const colorBox = document.querySelector( '.customized-count__color-box' );

				return data => {
					const charactersHue = calculateHue( {
						characters: data.characters,
						greenUntil: 70,
						maxCharacters: 120
					} );

					progressBar.value = data.words;
					colorBox.style.setProperty( '--hue', charactersHue );
				};

				// Calculates the hue based on the number of characters.
				//
				// For the character counter:
				//
				// * below greenUntil - Returns green.
				// * between greenUntil and maxCharacters - Returns a hue between green and red.
				// * above maxCharacters - Returns red.
				function calculateHue( { characters, greenUntil, maxCharacters } ) {
					const greenHue = 70;
					const redHue = 0;
					const progress = Math.max( 0, Math.min( 1, ( characters - greenUntil ) / ( maxCharacters - greenUntil ) ) ); // 0-1
					const discreetProgress = Math.floor( progress * 10 ) / 10; // 0, 0.1, 0.2, ..., 1

					return ( redHue - greenHue ) * discreetProgress + greenHue;
				}
			} )()
		}
	} )
	.catch( err => {
		console.error( err.stack );
	} );

