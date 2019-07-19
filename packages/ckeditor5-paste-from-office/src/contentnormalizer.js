/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/contentnormalizer
 */

export default class ContentNormalizer {
	constructor( { activationTrigger } ) {
		this.data = null;

		this.activationTrigger = activationTrigger;

		this._active = false;
		this._filters = new Set();
		this._fullContentFilters = new Set();
	}

	get isActive() {
		return this._active;
	}

	addData( data ) {
		const html = data.dataTransfer.getData( 'text/html' );

		if ( html && this.activationTrigger( html ) ) {
			this.data = data;
			this._active = true;

			if ( this.data.isTransformedWithPasteFromOffice === undefined ) {
				this.data.isTransformedWithPasteFromOffice = false;
			}
		} else {
			this.data = undefined;
			this._active = false;
		}

		return this;
	}

	addFilter( filterDefinition ) {
		if ( filterDefinition.fullContent ) {
			this._fullContentFilters.add( filterDefinition );
		} else {
			this._filters.add( filterDefinition );
		}
	}

	filter() {
		if ( this.data && !this.data.isTransformedWithPasteFromOffice ) {
			this._applyFullContentFilters();

			this.data.isTransformedWithPasteFromOffice = true;
		}

		return this;
	}

	_applyFullContentFilters() {
		if ( !this._fullContentFilters.size ) {
			return;
		}

		for ( const filter of this._fullContentFilters ) {
			filter.exec( this.data );
		}
	}
}
