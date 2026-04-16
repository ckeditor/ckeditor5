/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module show-whitespace/showwhitespacecommand
 */

import { Command, type Editor } from '@ckeditor/ckeditor5-core';
import type { ModelElement } from '@ckeditor/ckeditor5-engine';
import { global } from '@ckeditor/ckeditor5-utils';

import type { ShowWhitespaceConfig } from './showwhitespaceconfig.js';

const CLASS_NAME = 'ck-show-whitespace';
const NO_PARAGRAPH_MARKS_CLASS = 'ck-show-whitespace--no-paragraph-marks';

/**
 * Number of elements to reconvert per background batch.
 */
const BATCH_SIZE = 50;

/**
 * Extra pixels above and below the viewport to pre-reconvert
 * elements that are about to scroll into view.
 */
const VIEWPORT_MARGIN = 200;

/**
 * Minimum interval (ms) between scroll handler invocations.
 */
const SCROLL_THROTTLE = 100;

/**
 * The show whitespace command.
 *
 * Toggles the visibility of whitespace characters in the editing view.
 * Uses viewport-first reconversion: visible elements update instantly,
 * off-screen elements are reconverted in non-blocking background batches.
 */
export class ShowWhitespaceCommand extends Command {
	/**
	 * Flag indicating whether the command is active, i.e. whitespace characters are displayed.
	 */
	declare public value: boolean;

	/**
	 * Handle for the pending background chunk timeout.
	 */
	private _pendingChunkTimeout: ReturnType<typeof setTimeout> | null = null;

	/**
	 * Reference to the scroll handler so it can be removed on cleanup.
	 */
	private _scrollHandler: ( () => void ) | null = null;

	/**
	 * The DOM element that the scroll listener is attached to.
	 */
	private _scrollTarget: EventTarget | null = null;

	/**
	 * Elements still waiting for background reconversion.
	 * Used by the scroll handler to fast-track elements entering the viewport.
	 */
	private _pendingElements: Set<ModelElement> = new Set();

	/**
	 * Whether paragraph marks (¶) should be shown. Read from config.
	 */
	private _showParagraphMarks: boolean;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor, config: ShowWhitespaceConfig ) {
		super( editor );

		// It does not affect data so should be enabled in read-only mode.
		this.affectsData = false;

		this.value = false;

		this._showParagraphMarks = config.paragraphMarks !== false;
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		this._abortPendingReconversion();
		super.destroy();
	}

	/**
	 * Toggles the visibility of whitespace characters.
	 */
	public override execute(): void {
		const editor = this.editor;
		const editingView = editor.editing.view;

		// Cancel any in-progress background reconversion from a previous toggle.
		this._abortPendingReconversion();

		// Toggle the CSS class on all editing roots.
		editingView.change( writer => {
			for ( const root of editingView.document.roots ) {
				if ( !root.hasClass( CLASS_NAME ) ) {
					writer.addClass( CLASS_NAME, root );

					if ( !this._showParagraphMarks ) {
						writer.addClass( NO_PARAGRAPH_MARKS_CLASS, root );
					}

					this.value = true;
				} else {
					writer.removeClass( CLASS_NAME, root );
					writer.removeClass( NO_PARAGRAPH_MARKS_CLASS, root );

					this.value = false;
				}
			}
		} );

		// Reconvert content with viewport-first priority.
		this._reconvertContent();
	}

	/**
	 * Reconverts block elements containing text, prioritizing elements visible
	 * in the viewport for instant feedback. Off-screen elements are reconverted
	 * in non-blocking background batches.
	 */
	private _reconvertContent(): void {
		const editor = this.editor;
		const model = editor.model;
		const editing = editor.editing;

		// Phase 0: Collect all unique parent elements of text and softBreak nodes.
		const allElements = new Set<ModelElement>();

		for ( const root of model.document.getRoots() ) {
			const range = model.createRangeIn( root );

			for ( const item of range.getItems() ) {
				if ( item.is( '$text' ) || item.is( '$textProxy' ) || item.is( 'element', 'softBreak' ) ) {
					const parent = item.parent;

					if ( parent && parent.is( 'element' ) ) {
						allElements.add( parent );
					}
				}
			}
		}

		// Phase 1: Partition into visible and off-screen.
		const visibleElements: Array<ModelElement> = [];
		const offScreenElements: Array<ModelElement> = [];

		for ( const element of allElements ) {
			const viewElement = editing.mapper.toViewElement( element );

			if ( !viewElement ) {
				offScreenElements.push( element );
				continue;
			}

			const domElement = editing.view.domConverter.mapViewToDom( viewElement );

			if ( !domElement ) {
				offScreenElements.push( element );
				continue;
			}

			const rect = ( domElement as HTMLElement ).getBoundingClientRect();

			// getBoundingClientRect returns viewport-relative coordinates,
			// so compare directly against window dimensions.
			if ( rect.bottom > -VIEWPORT_MARGIN && rect.top < ( global.window?.innerHeight ?? 0 ) + VIEWPORT_MARGIN ) {
				visibleElements.push( element );
			} else {
				offScreenElements.push( element );
			}
		}

		// Phase 2: Reconvert visible elements immediately in a single render pass.
		if ( visibleElements.length ) {
			model.change( () => {
				for ( const element of visibleElements ) {
					editing.reconvertItem( element );
				}
			} );
		}

		// Phase 3: Schedule background reconversion of off-screen elements.
		if ( offScreenElements.length ) {
			this._scheduleBackgroundReconversion( offScreenElements );
		}
	}

	/**
	 * Reconverts off-screen elements in non-blocking batches via `setTimeout`,
	 * yielding to user input between batches. A scroll listener fast-tracks
	 * elements that scroll into view.
	 */
	private _scheduleBackgroundReconversion( elements: Array<ModelElement> ): void {
		const editor = this.editor;
		const model = editor.model;
		const editing = editor.editing;

		this._pendingElements = new Set( elements );

		let chunkIndex = 0;

		const processNextChunk = (): void => {
			if ( chunkIndex >= elements.length ) {
				this._abortPendingReconversion();
				return;
			}

			const batch = elements.slice( chunkIndex, chunkIndex + BATCH_SIZE );
			const toReconvert = batch.filter( el =>
				this._pendingElements.has( el ) && el.root.rootName !== '$graveyard'
			);

			if ( toReconvert.length ) {
				model.change( () => {
					for ( const element of toReconvert ) {
						editing.reconvertItem( element );
						this._pendingElements.delete( element );
					}
				} );
			}

			chunkIndex += BATCH_SIZE;

			this._pendingChunkTimeout = setTimeout( processNextChunk, 0 );
		};

		// Kick off background processing.
		this._pendingChunkTimeout = setTimeout( processNextChunk, 0 );

		// Attach throttled scroll listener to fast-track elements entering the viewport.
		this._setupScrollHandler();
	}

	/**
	 * Attaches a throttled scroll listener that reconverts pending elements
	 * as they scroll into the viewport.
	 */
	private _setupScrollHandler(): void {
		const editor = this.editor;
		const model = editor.model;
		const editing = editor.editing;

		let lastScrollTime = 0;

		const handler = (): void => {
			const now = Date.now();

			if ( now - lastScrollTime < SCROLL_THROTTLE ) {
				return;
			}

			lastScrollTime = now;

			if ( !this._pendingElements.size ) {
				return;
			}

			const windowHeight = global.window?.innerHeight ?? 0;
			const urgentElements: Array<ModelElement> = [];

			for ( const element of this._pendingElements ) {
				if ( element.root.rootName === '$graveyard' ) {
					this._pendingElements.delete( element );
					continue;
				}

				const viewElement = editing.mapper.toViewElement( element );

				if ( !viewElement ) {
					continue;
				}

				const domElement = editing.view.domConverter.mapViewToDom( viewElement );

				if ( !domElement ) {
					continue;
				}

				const rect = ( domElement as HTMLElement ).getBoundingClientRect();

				if ( rect.bottom > -VIEWPORT_MARGIN && rect.top < windowHeight + VIEWPORT_MARGIN ) {
					urgentElements.push( element );
				}
			}

			if ( urgentElements.length ) {
				model.change( () => {
					for ( const element of urgentElements ) {
						editing.reconvertItem( element );
						this._pendingElements.delete( element );
					}
				} );
			}
		};

		this._scrollHandler = handler;

		// Find the scrollable ancestor of the editor.
		const domRoot = editing.view.getDomRoot();
		const scrollTarget = domRoot ? findScrollableAncestor( domRoot ) : global.window;

		this._scrollTarget = scrollTarget;

		if ( scrollTarget ) {
			scrollTarget.addEventListener( 'scroll', handler, { passive: true } );
		}
	}

	/**
	 * Cancels any pending background reconversion and removes the scroll listener.
	 */
	private _abortPendingReconversion(): void {
		if ( this._pendingChunkTimeout !== null ) {
			clearTimeout( this._pendingChunkTimeout );
			this._pendingChunkTimeout = null;
		}

		if ( this._scrollHandler && this._scrollTarget ) {
			this._scrollTarget.removeEventListener( 'scroll', this._scrollHandler );
			this._scrollHandler = null;
			this._scrollTarget = null;
		}

		this._pendingElements.clear();
	}
}

/**
 * Walks up the DOM tree from the given element and returns the first
 * ancestor that has scrollable overflow. Falls back to the window.
 */
function findScrollableAncestor( element: HTMLElement ): EventTarget {
	let current = element.parentElement;

	while ( current ) {
		const overflow = global.window?.getComputedStyle( current ).overflowY ?? '';

		if ( overflow === 'auto' || overflow === 'scroll' ) {
			return current;
		}

		current = current.parentElement;
	}

	return global.window!;
}
