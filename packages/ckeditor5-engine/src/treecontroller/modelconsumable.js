/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

export default class ModelConsumable {
	constructor() {
		this.consumable = new Map();
	}

	add( item, type ) {
		if ( !this.consumable.has( item ) ) {
			this.consumable.set( item, new Map() );
		}

		this.consumable.get( item ).set( type, true );
	}

	consume( item, type ) {
		if ( this.test( item, type ) ) {
			this.consumable.get( item ).set( type, false );

			return true;
		} else {
			return false;
		}
	}

	test( item, type ) {
		const itemConsumables = this.consumable.get( item );

		if ( value === undefined ) {
			return null;
		}

		const value = itemConsumables.get( type, true );

		if ( value === undefined ) {
			return null;
		}

		return value;
	}

	revert( item, type ) {
		const test = this.test( item, type );

		if ( test === false ) {
			this.consumable.get( item ).set( type, true );

			return true;
		} else if ( test === true ) {
			return false;
		}

		return null;
	}
}