/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console, window, document */

import isRelativeUrl from 'is-relative-url';

import './tour-balloon.css';

/**
 * Attaches a tour balloon with a description to any DOM node element.
 *
 * **Tip**: Use the global `findToolbarItem()` method to easily pick toolbar items.
 *
 * Examples:
 *
 *		// Using a comparison callback to search for an item.
 *		window.attachTourBalloon( {
 *			target: window.findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Insert HTML' ),
 *			text: 'Tour text to help users discover the feature.',
 *			editor
 *		} );
 *
 *		// Using a toolbar item index.
 *		window.attachTourBalloon( {
 *			target: window.findToolbarItem( editor.ui.view.toolbar, 5 ),
 *			text: 'Tour text to help users discover the feature.',
 *			editor
 *		} );
 *
 *		// Specifying options of tippy.js, e.g. to customize the placement of the balloon.
 *		// See https://atomiks.github.io/tippyjs/v6/all-props/ for all options.
 *		window.attachTourBalloon( {
 *			target: window.findToolbarItem( editor.ui.view.toolbar, 5 ),
 *			text: 'Tour text to help users discover the feature.',
 *			editor,
 *			tippyOptions: {
 *				placement: 'bottom-start'
 *			}
 *		} );
 *
 * @param {Object} options Balloon options.
 * @param {HTMLElement} options.target A DOM node the balloon will point to.
 * @param {String} options.text The description to be shown in the tooltip.
 * @param {module:core/editor/editor~Editor} options.editor The editor instance.
 * @param {Object} [options.tippyOptions] Additional [configuration of tippy.js](https://atomiks.github.io/tippyjs/v6/all-props/).
 */
window.attachTourBalloon = function( { target, text, editor, tippyOptions } ) {
	if ( !target ) {
		console.warn( '[attachTourBalloon] The target DOM node for the feature tour balloon does not exist.', { text } );

		return;
	}

	if ( !target.offsetParent ) {
		console.warn( '[attachTourBalloon] The target DOM node is invisible and the balloon could not be attached.', { target, text } );

		return;
	}

	const content = `
		<div class="tippy-content__message">${ text }</div>
		<button class="ck ck-button tippy-content__close-button ck-off" title="Close"></button>
	`;

	const options = Object.assign( {}, tippyOptions, {
		placement: 'bottom',
		trigger: 'manual',
		hideOnClick: false,
		allowHTML: true,
		maxWidth: 280,
		showOnCreate: true,
		interactive: true,
		theme: 'light-border',
		zIndex: 1,
		appendTo: () => document.body
	} );

	const tooltip = window.umberto.createTooltip( target, content, options );

	for ( const root of editor.editing.view.document.roots ) {
		root.once( 'change:isFocused', ( evt, name, isFocused ) => {
			if ( isFocused ) {
				tooltip.hide();
			}
		} );
	}
};

/**
 * Searches for a toolbar item and returns the first one matching the criteria.
 *
 * You can search for toolbar items using a comparison callback:
 *
 *		window.findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label.startsWith( 'Insert HTML' ) );
 *
 * Or you pick toolbar items by their index:
 *
 *		window.findToolbarItem( editor.ui.view.toolbar, 3 );
 *
 * @param {module:ui/toolbar/toolbarview~ToolbarView} toolbarView Toolbar instance.
 * @param {Number|Function} indexOrCallback Index of a toolbar item or a callback passed to `ViewCollection#find`.
 * @returns {HTMLElement|undefined} HTML element or undefined
 */
window.findToolbarItem = function( toolbarView, indexOrCallback ) {
	const items = toolbarView.items;
	let item;

	if ( typeof indexOrCallback === 'function' ) {
		item = items.find( indexOrCallback );
	} else {
		item = items.get( indexOrCallback );
	}

	return item ? item.element : undefined;
};

// Replaces all relative paths inside the content container with absolute URLs
// to avoid a broken user experience when copying images between editors.
// It parses all `<img>` elements and `<source>` elements if they belong to the `<picture>` node.
( () => {
	[ ...document.querySelectorAll( '.main__content-inner img' ) ]
		.filter( img => isRelativeUrl( img.getAttribute( 'src' ) ) )
		.forEach( img => {
			// Update `<img src="...">`.
			img.setAttribute( 'src', img.src );

			// Update `<img srcset="...">`.
			if ( img.srcset ) {
				updateSrcSetAttribute( img, img.baseURI );
			}

			// Update `<source>` elements if grouped in the `<picture>` element.
			if ( img.parentElement instanceof window.HTMLPictureElement ) {
				[ ...img.parentElement.querySelectorAll( 'source' ) ]
					.forEach( source => {
						updateSrcSetAttribute( source, img.baseURI );
					} );
			}
		} );

	function updateSrcSetAttribute( element, baseURI ) {
		const srcset = element.srcset.split( ',' )
			.map( item => {
				const [ relativeUrl, ratio ] = item.trim().split( ' ' );

				if ( !isRelativeUrl( relativeUrl ) ) {
					return item;
				}

				const absoluteUrl = new window.URL( relativeUrl, baseURI ).toString();

				return [ absoluteUrl, ratio ].filter( i => i ).join( ' ' );
			} )
			.join( ', ' );

		element.setAttribute( 'srcset', srcset );
	}
} )();
