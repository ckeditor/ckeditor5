/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * The browser script of the theme token reference page. It filters the token rows, copies token names, and scrolls
 * the targets of links below the sticky filter.
 * The page builder inlines it after the rows, minified to one line.
 */

( function() {
	const root = document.querySelector( '.ck-token-ref' );

	if ( !root ) {
		return;
	}

	const filter = root.querySelector( '.ck-token-ref__filter' );

	const input = root.querySelector( '.ck-token-ref__filter-input' );
	const count = root.querySelector( '.ck-token-ref__count' );
	const empty = root.querySelector( '.ck-token-ref__empty' );
	const status = root.querySelector( '.ck-token-ref__status' );
	const rows = Array.from( root.querySelectorAll( '.ck-token-ref__token' ) );
	const topics = Array.from( new Set( rows.map( row => row.dataset.topic ) ) );
	const layers = Array.from( new Set( rows.map( row => row.dataset.layer ) ) );
	const textNodes = new WeakMap();
	// The state that the filter last gave to the details it toggled, until their `toggle` event comes.
	const filterStates = new WeakMap();
	const IGNORED_PARTS = [
		'.ck-token-ref__preview', '.ck-token-ref__pair-sample', '.ck-token-ref__copy', '.ck-token-ref__anchor', '.ck-token-ref__label',
		'.ck-token-ref__sep', 'summary'
	].join( ', ' );
	let announceTimeout = null;
	let copiedButton = null;
	let copiedTimeout = null;

	// The space that the docs theme keeps between its header and the target of a link.
	const TARGET_MARGIN = 32;
	// The input of the reader that can scroll the page before it loads.
	const READER_INPUT_EVENTS = [ 'wheel', 'keydown', 'touchstart', 'pointerdown' ];
	const header = document.querySelector( '.js-header' );
	let markedTarget = null;

	filter.hidden = false;
	root.classList.add( 'ck-token-ref_enhanced' );
	updateCount( rows.length );

	// The docs theme keeps `--header-height` at the height of its desktop header, also where the header is lower, such as
	// on narrow screens, and the header changes its height. The sticky filter follows the measured header, and the style
	// of the page uses `--header-height` only without a header. The observer also calls back once it starts.
	if ( header ) {
		new window.ResizeObserver( () => {
			filter.style.top = `${ header.offsetHeight }px`;
		} ).observe( header );
	}

	input.addEventListener( 'input', () => applyFilter( input.value ) );

	// The filter is a form, so Enter in the field would submit it and reload the page.
	filter.addEventListener( 'submit', event => event.preventDefault() );

	input.addEventListener( 'keydown', event => {
		if ( event.key === 'Escape' && input.value ) {
			clearFilter();
		}
	} );

	// The details that the reader opens or closes stay as the reader leaves them, so the filter no longer toggles them.
	// The event does not bubble, so it is caught on its way down. The browser joins quick toggles into one event, so
	// a toggle of the filter is told by the state it gave, not by the toggle itself.
	root.addEventListener( 'toggle', event => {
		const details = event.target;

		if ( !details.classList.contains( 'ck-token-ref__details' ) ) {
			return;
		}

		const isToggledByFilter = filterStates.get( details ) === details.open;

		filterStates.delete( details );

		if ( isToggledByFilter ) {
			return;
		}

		details.dataset.toggledByReader = '';
		delete details.dataset.openedByFilter;
	}, true );

	root.addEventListener( 'click', event => {
		const button = event.target.closest( '.ck-token-ref__copy' );

		if ( button ) {
			copyName( button );
		}
	} );

	// The docs theme scrolls to the target of a link with its own script, which keeps the target below the header but not
	// below the sticky filter. This listener is added before the one of the theme, which skips handled clicks. The table of
	// contents is outside of the generated content, so the listener is on the document.
	document.addEventListener( 'click', event => {
		const link = event.target.closest( 'a[href^="#"]' );
		const target = link && !event.defaultPrevented && getTarget( link.hash );

		if ( target ) {
			// A click on the link of the current target again does not add another entry to the history.
			const method = link.hash === window.location.hash ? 'replaceState' : 'pushState';

			event.preventDefault();
			window.history[ method ]( true, '', link.getAttribute( 'href' ) );
			showTarget( target );
		}
	} );

	// For a changed hash and for a hash in the address of the page, the theme starts scrolling first, and the scrolling
	// started here takes its place.
	window.addEventListener( 'hashchange', () => showTargetAfterTheme( window.location.hash ) );

	// The `_enhanced` class turns off the `:target` highlight, so the target in the address is marked at once. The page
	// scrolls to it after the load only if the reader has not scrolled yet in any way.
	if ( window.location.hash ) {
		const target = getTarget( window.location.hash );
		let isScrolledByReader = false;

		if ( target ) {
			markTarget( target );
		}

		for ( const type of READER_INPUT_EVENTS ) {
			window.addEventListener( type, () => {
				isScrolledByReader = true;
			}, { once: true, passive: true } );
		}

		window.addEventListener( 'load', () => {
			if ( !isScrolledByReader ) {
				showTargetAfterTheme( window.location.hash );
			}
		}, { once: true } );
	}

	// The navigation and the table of contents follow the generated content in the page, so they are not parsed yet.
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', keepNavigationScrollInside );
	} else {
		keepNavigationScrollInside();
	}

	/**
	 * Shows the rows that contain every word of the query in their name, description, or values, and hides the topics
	 * and layers with no visible rows, together with their entries in the table of contents.
	 */
	function applyFilter( query ) {
		const words = query.toLowerCase().split( /\s+/ ).filter( Boolean );
		let visible = 0;

		for ( const row of rows ) {
			const matches = words.every( word => row.dataset.visible.includes( word ) || row.dataset.details.includes( word ) );

			row.hidden = !matches;
			visible += matches ? 1 : 0;
		}

		highlightMatches( words );
		openMatchingDetails( words );

		for ( const topic of topics ) {
			toggleGroup( 'topic', topic, rows.some( row => row.dataset.topic === topic && !row.hidden ) );
		}

		for ( const layer of layers ) {
			toggleGroup( 'layer', layer, rows.some( row => row.dataset.layer === layer && !row.hidden ) );
		}

		empty.hidden = visible > 0;
		updateCount( visible );
		announceCount( visible );
	}

	/**
	 * Opens the details of the visible tokens that match the query only there, such as a paired token or a default value,
	 * and closes them again when the query no longer needs them. The details that the reader opened or closed stay as
	 * they are.
	 */
	function openMatchingDetails( words ) {
		for ( const row of rows ) {
			const details = row.querySelector( '.ck-token-ref__details' );

			if ( 'toggledByReader' in details.dataset ) {
				continue;
			}

			const needsDetails = !row.hidden && words.some( word =>
				row.dataset.details.includes( word ) && !row.dataset.visible.includes( word ) );

			if ( needsDetails && !details.open ) {
				filterStates.set( details, true );
				details.open = true;
				details.dataset.openedByFilter = '';
			} else if ( !needsDetails && 'openedByFilter' in details.dataset ) {
				filterStates.set( details, false );
				details.open = false;
				delete details.dataset.openedByFilter;
			}
		}
	}

	function clearFilter() {
		input.value = '';
		applyFilter( '' );
	}

	function showTargetAfterTheme( hash ) {
		const target = getTarget( hash );

		if ( target ) {
			window.setTimeout( () => showTarget( target ) );
		} else {
			// A fragment with no target on the page, such as the address without a fragment after going back, leaves
			// no row marked.
			markTarget( null );
		}
	}

	/**
	 * Highlights the row that a link points to. The address changes with the history API, which does not update `:target`.
	 */
	function markTarget( target ) {
		markedTarget?.classList.remove( 'ck-token-ref__token_target' );
		markedTarget = rows.includes( target ) ? target : null;
		markedTarget?.classList.add( 'ck-token-ref__token_target' );
	}

	/**
	 * Scrolls to a row or a heading of the page, below the header and the sticky filter. A row that the filter hides, such
	 * as the target of a contrast pair, clears the filter first.
	 */
	function showTarget( target ) {
		if ( target.hidden ) {
			clearFilter();
		}

		markTarget( target );

		// The same measure as the top of the sticky filter, so that the target is right below the filter.
		const offset = ( header ? header.offsetHeight : 0 ) + filter.offsetHeight + TARGET_MARGIN;
		const isMotionReduced = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

		window.scrollTo( {
			top: target.getBoundingClientRect().top + window.scrollY - offset,
			behavior: isMotionReduced ? 'instant' : 'smooth'
		} );
	}

	/**
	 * The docs theme calls `scrollIntoView()` on the active entries of its navigation and table of contents, when the
	 * header resizes and when the active heading changes on scroll. That also scrolls the page, which stops the scrolling
	 * to a target, and on narrow screens, where both are off-canvas, moves the page by hundreds of pixels. On this page,
	 * these entries scroll only their own list.
	 */
	function keepNavigationScrollInside() {
		for ( const link of document.querySelectorAll( '#page-toc a, .js-sidebar a' ) ) {
			link.scrollIntoView = ( { behavior } = {} ) => {
				const list = getScrollParent( link );

				if ( !list ) {
					return;
				}

				const linkRect = link.getBoundingClientRect();
				const listRect = list.getBoundingClientRect();
				const offset = linkRect.top < listRect.top ? linkRect.top - listRect.top :
					Math.max( 0, linkRect.bottom - listRect.bottom );

				list.scrollBy( { top: offset, behavior } );
			};
		}
	}

	function getScrollParent( element ) {
		for ( let parent = element.parentElement; parent && parent !== document.body; parent = parent.parentElement ) {
			if ( /auto|scroll/.test( window.getComputedStyle( parent ).overflowY ) && parent.scrollHeight > parent.clientHeight ) {
				return parent;
			}
		}

		return null;
	}

	/**
	 * Returns the row or the heading of the page that the hash points to.
	 */
	function getTarget( hash ) {
		let id;

		// A malformed escape, such as in `#100%`, cannot be decoded and points to nothing.
		try {
			id = decodeURIComponent( hash.slice( 1 ) );
		} catch {
			return null;
		}

		const target = id ? document.getElementById( id ) : null;

		return target && root.contains( target ) ? target : null;
	}

	function toggleGroup( type, id, isVisible ) {
		for ( const element of root.querySelectorAll( `[data-${ type }-part="${ id }"]` ) ) {
			element.hidden = !isVisible;

			// The documentation theme wraps each heading together with its anchor link.
			const headingWrapper = element.parentElement.closest( '.b-heading' );

			if ( headingWrapper ) {
				headingWrapper.hidden = !isVisible;
			}
		}

		// The table of contents of the documentation theme.
		for ( const link of document.querySelectorAll( '#page-toc a' ) ) {
			if ( link.hash === `#${ id }` ) {
				link.closest( 'li' ).hidden = !isVisible;
			}
		}
	}

	/**
	 * Highlights the query words in the text of the visible rows with the CSS Custom Highlight API, so the markup of
	 * the rows, such as links and code, stays untouched. Browsers without the API show the filtered rows only.
	 */
	function highlightMatches( words ) {
		if ( !window.CSS?.highlights ) {
			return;
		}

		const ranges = [];

		for ( const row of rows ) {
			if ( row.hidden ) {
				continue;
			}

			for ( const node of getTextNodes( row ) ) {
				const text = node.data.toLowerCase();

				for ( const word of words ) {
					for ( let index = text.indexOf( word ); index !== -1; index = text.indexOf( word, index + word.length ) ) {
						const range = new Range();

						range.setStart( node, index );
						range.setEnd( node, index + word.length );
						ranges.push( range );
					}
				}
			}
		}

		window.CSS.highlights.set( 'ck-token-ref-match', new window.Highlight( ...ranges ) );
	}

	/**
	 * Returns the text nodes of a row that the filter matches, without the previews, the contrast samples, and the badges.
	 */
	function getTextNodes( row ) {
		if ( !textNodes.has( row ) ) {
			const walker = document.createTreeWalker( row, window.NodeFilter.SHOW_TEXT, {
				acceptNode: node => node.parentElement.closest( IGNORED_PARTS ) ?
					window.NodeFilter.FILTER_REJECT :
					window.NodeFilter.FILTER_ACCEPT
			} );
			const nodes = [];

			while ( walker.nextNode() ) {
				nodes.push( walker.currentNode );
			}

			textNodes.set( row, nodes );
		}

		return textNodes.get( row );
	}

	function updateCount( visible ) {
		count.textContent = getCountText( visible );
	}

	/**
	 * Announces the number of matching tokens once the typing pauses, so screen readers do not read it after every key.
	 */
	function announceCount( visible ) {
		window.clearTimeout( announceTimeout );

		announceTimeout = window.setTimeout( () => {
			status.textContent = visible ? getCountText( visible ) : 'No tokens match the filter.';
		}, 300 );
	}

	function getCountText( visible ) {
		return visible === rows.length ?
			`${ rows.length } tokens` :
			`${ visible } of ${ rows.length } tokens`;
	}

	function copyName( button ) {
		const name = button.dataset.name;

		// Without the Clipboard API, such as on a page served over HTTP from another host than `localhost`,
		// `navigator.clipboard` is undefined. The error then rejects the promise and shows the message of a refused copy.
		Promise.resolve().then( () => navigator.clipboard.writeText( name ) ).then( () => {
			// Only the last copied name shows the badge, so the timeout of an earlier copy must not hide it.
			window.clearTimeout( copiedTimeout );
			copiedButton?.classList.remove( 'ck-token-ref__copy_done' );
			copiedButton = button;

			button.classList.add( 'ck-token-ref__copy_done' );
			status.textContent = `Copied ${ name }`;

			copiedTimeout = window.setTimeout( () => {
				button.classList.remove( 'ck-token-ref__copy_done' );
				copiedButton = null;
			}, 1500 );
		}, () => {
			status.textContent = 'Copying is not available in this browser.';
		} );
	}
}() );
