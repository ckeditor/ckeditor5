/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/viewcycler
 */

import {
	isVisible,
	EmitterMixin
} from '@ckeditor/ckeditor5-utils';

import type View from './view';
import type ViewCollection from './viewcollection';

/**
 * TODO
 */
export default class ViewCycler extends EmitterMixin() {
	/**
	 * A {@link module:ui/view~View view} collection that the cycler operates on.
	 */
	public readonly views: ViewCollection;

	/**
	 * TODO
	 */
	public readonly viewsFilter: ( view: View ) => boolean;

	/**
	 * TODO
	 */
	public readonly currentViewFilter: ( view: View ) => boolean;

	/**
	 * Creates an instance of the focus cycler utility.
	 *
	 * @param options Configuration options.
	 */
	constructor( options: {
		views: ViewCollection;
		viewsFilter?: ( view: View ) => boolean;
		currentViewFilter: ( view: View ) => boolean;
	} ) {
		super();

		this.views = options.views;
		this.viewsFilter = options.viewsFilter || ( ( view: View ) => isVisible( view.element ) );
		this.currentViewFilter = options.currentViewFilter;
	}

	/**
	 * TODO
	 */
	public get first(): View | null {
		return ( this.views.find( this.viewsFilter ) || null ) as View | null;
	}

	/**
	 * TODO
	 */
	public get last(): View | null {
		return ( this.views.filter( this.viewsFilter ).slice( -1 )[ 0 ] || null ) as View | null;
	}

	/**
	 * TODO
	 */
	public get next(): View | null {
		return this._getView( 1 );
	}

	/**
	 * TODO
	 */
	public get previous(): View | null {
		return this._getView( -1 );
	}

	/**
	 * TODO
	 */
	public get current(): View | null {
		for ( const view of this.views ) {
			if ( this.currentViewFilter( view ) ) {
				return view;
			}
		}

		return null;
	}

	/**
	 * TODO
	 *
	 * @param step Either `1` for checking forward from {@link #current} or `-1` for checking backwards.
	 */
	private _getView( step: 1 | -1 ): View | null {
		// Cache for speed.
		const current = this.current;
		const collectionLength = this.views.length;

		if ( !collectionLength ) {
			return null;
		}

		// Start from the beginning if no view is focused.
		// https://github.com/ckeditor/ckeditor5-ui/issues/206
		if ( current === null ) {
			return this[ step === 1 ? 'first' : 'last' ];
		}

		// Cycle in both directions.
		let index = ( this.views.getIndex( current ) + collectionLength + step ) % collectionLength;

		do {
			const view = this.views.get( index )!;

			if ( this.viewsFilter( view ) ) {
				return view;
			}

			// Cycle in both directions.
			index = ( index + collectionLength + step ) % collectionLength;
		} while ( index !== this.views.getIndex( current ) );

		return null;
	}
}
