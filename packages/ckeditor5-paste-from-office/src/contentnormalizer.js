/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/contentnormalizer
 */

export default class ContentNormalizer {
	constructor( { activationTrigger } ) {
		this.activationTrigger = activationTrigger;

		this._filters = new Set();
	}

	transform( data ) {
		const html = data.dataTransfer && data.dataTransfer.getData( 'text/html' );
		const dataReadFirstTime = data.isTransformedWithPasteFromOffice === undefined;
		const hasHtmlData = !!html;

		if ( hasHtmlData && dataReadFirstTime && this.activationTrigger( html ) ) {
			this._applyFilters( data );
			data.isTransformedWithPasteFromOffice = true;
		}

		return this;
	}

	addFilter( filterFn ) {
		this._filters.add( filterFn );
	}

	_applyFilters( data ) {
		for ( const filter of this._filters ) {
			filter( { data } );
		}
	}
}
