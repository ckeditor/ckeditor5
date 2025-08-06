/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Attaches a tour balloon with a description to any DOM node element.
 *
 * **Tip**: Use the global `findToolbarItem()` method to easily pick toolbar items.
 *
 * Examples:
 *
 *		// Using a comparison callback to search for an item.
 *		attachTourBalloon( {
 *			target: findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Insert HTML' ),
 *			text: 'Tour text to help users discover the feature.',
 *			editor
 *		} );
 *
 *		// Using a toolbar item index.
 *		attachTourBalloon( {
 *			target: findToolbarItem( editor.ui.view.toolbar, 5 ),
 *			text: 'Tour text to help users discover the feature.',
 *			editor
 *		} );
 *
 * @param {Object} options Balloon options.
 * @param {HTMLElement} options.target A DOM node the balloon will point to.
 * @param {String} options.text The description to be shown in the tooltip.
 * @param {module:core/editor/editor~Editor} options.editor The editor instance.
 */
export function attachTourBalloon( { target, text, editor, tippyOptions } ) {
	if ( !target ) {
		console.warn( '[attachTourBalloon] The target DOM node for the feature tour balloon does not exist.', { text } );

		return;
	}

	if ( !target.offsetParent ) {
		console.warn( '[attachTourBalloon] The target DOM node is invisible and the balloon could not be attached.', { target, text } );

		return;
	}

	const tooltip = window.umberto.Tooltip.create( {
		text,
		trigger: target,
		mode: 'click',
		variant: 'dark',
		icon: 'bulb',
		disableOnMobile: false,
		showCloseButton: true,
		showAfterMount: true,
		hideOnOutsideClick: false,
		destroyOnHide: true,
		...tippyOptions?.placement && {
			position: tippyOptions.placement
		}
	} );

	for ( const root of editor.editing.view.document.roots ) {
		root.once( 'change:isFocused', ( evt, name, isFocused ) => {
			if ( isFocused ) {
				tooltip.destroy();
			}
		} );
	}

	return tooltip;
}

/**
 * Searches for a toolbar item and returns the first one matching the criteria.
 *
 * You can search for toolbar items using a comparison callback:
 *
 *		findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label.startsWith( 'Insert HTML' ) );
 *
 * Or you pick toolbar items by their index:
 *
 *		findToolbarItem( editor.ui.view.toolbar, 3 );
 *
 * @param {module:ui/toolbar/toolbarview~ToolbarView} toolbarView Toolbar instance.
 * @param {Number|Function} indexOrCallback Index of a toolbar item or a callback passed to `ViewCollection#find`.
 * @returns {HTMLElement|undefined} HTML element or undefined
 */
export function findToolbarItem( toolbarView, indexOrCallback ) {
	const items = toolbarView.items;
	let item;

	if ( typeof indexOrCallback === 'function' ) {
		item = items.find( indexOrCallback );
	} else {
		item = items.get( indexOrCallback );
	}

	return item ? item.element : undefined;
}

/**
 * Returns the `config.ui.viewportOffset.top` config value for editors using floating toolbars that
 * stick to the top of the viewport to remain visible to the user.
 *
 * The value is determined in styles by the `--ck-snippet-viewport-top-offset` custom property
 * and may differ e.g. according to the used media queries.
 *
 * @returns {Number} The value of the offset.
 */
export function getViewportTopOffsetConfig() {
	const documentElement = document.documentElement;

	return parseInt( window.getComputedStyle( documentElement ).getPropertyValue( '--ck-snippet-viewport-top-offset' ) );
}

/**
 * Function that sets the `editor.ui.viewportOffset.top` dynamically based on the media query.
 * The media query breakpoint is set to `960px` and the value is taken from the `--ck-snippet-viewport-top-offset` CSS variable.
 *
 * @private
 * @param {module:core/editor/editor~Editor} editor
 */
export function setViewportTopOffsetDynamically( editor ) {
	const mediaQueryList = window.matchMedia( '(max-width: 960px)' );
	const documentElement = document.documentElement;

	mediaQueryList.onchange = () => {
		const value = parseInt( window.getComputedStyle( documentElement ).getPropertyValue( '--ck-snippet-viewport-top-offset' ) );

		editor.ui.viewportOffset.top = value;
	};
}

/**
 * Activates tabs in the given container.
 *
 * **Note**: The tabs container requires a proper markup to work correctly.
 *
 * @param {HTMLElement} tabsContainer
 * @param {Function} onTabChange A callback executed when the tab is changed. It receives the index of the selected tab.
 * It also gets called after the tabs are created.
 */
export function createTabs( tabsContainer, onTabChange ) {
	const tabTextElements = Array.from( tabsContainer.querySelectorAll( '.tabs__list__tab-text' ) );
	const tabPanels = Array.from( tabsContainer.querySelectorAll( '.tabs__panel' ) );

	tabTextElements.forEach( tabTextElement => {
		tabTextElement.addEventListener( 'click', evt => {
			const clickedIndex = tabTextElements.indexOf( tabTextElement );

			tabTextElements.forEach( element => {
				element.parentElement.classList.toggle( 'tabs__list__tab_selected', tabTextElement === element );
				element.setAttribute( 'aria-selected', tabTextElement === element );
			} );

			tabPanels.forEach( panel => {
				panel.classList.toggle( 'tabs__panel_selected', tabPanels.indexOf( panel ) === clickedIndex );
			} );

			if ( onTabChange ) {
				onTabChange( clickedIndex );
			}

			evt.preventDefault();
		} );
	} );

	// Trigger the callback after the tabs are created.
	if ( onTabChange ) {
		const selectedTabTextElement = tabsContainer.querySelector( '.tabs__list__tab_selected .tabs__list__tab-text' ) ||
			tabsContainer.querySelector( '.tabs__list li:first-of-type .tabs__list__tab-text' );

		onTabChange( tabTextElements.indexOf( selectedTabTextElement ) );
	}
}

/**
 * Returns the URL of the `snippet.css` file used in the snippets.
 * It may be used to load the styles for export PDF or other purposes.
 *
 * @param {String} snippetName The name of the snippet, e.g. `balloon-block`.
 * @returns {String} The URL of the `snippet.css` file.
 */
export function querySnippetCSSUrl( snippetName ) {
	return document.querySelector( `link[href*="${ snippetName }/snippet.css"][data-cke]` )?.href || '';
}
