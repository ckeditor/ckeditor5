/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Consumable from './modelconsumable.js';

export default class ModelConversionDispatcher {
	constructor( context ) {
		this.context = context;
	}

	convertChange( type, changeInfo ) {
		if ( type == 'insert' || type == 'reinsert' ) {
			this.convertInsert( changeInfo.range );
		} else if ( type == 'move' ) {
			this.convertMove( changeInfo.range, changeInfo.sourcePosition );
		} else if ( type == 'remove' ) {
			this.convertRemove( changeInfo.range, changeInfo.sourcePosition );
		} else if ( type == 'addAttribute' || type == 'removeAttribute' || type == 'changeAttribute' ) {
			this.convertAttribute( type, changeInfo.range, changeInfo.key, changeInfo.oldValue, changeInfo.newValue );
		}
	}

	convertInsert( range ) {
		const consumable = new Consumable();
		const values = [];

		for ( let value of range ) {
			values.push( value );

			const item = value.item;

			consumable.add( item, 'insert' );

			for ( let key of item.getAttributes() ) {
				consumable.add( item, 'addAttribute:' + key );
			}
		}

		for ( let value of values ) {
			const item = value.item;
			const range = Range.createFromPositionAndShift( value.previousPosition, value.length );
			const model = {
				item,
				range,
				consumable
			};

			this._testAndFire( 'insert', model, context );

			for ( let key of item.getAttributes() ) {
				model.attributeKey = key;

				this._testAndFire( 'addAttribute:' + key, model, this.context );
			}
		}
	}

	convertMove( range, sourcePosition ) {
		const model = {
			range: range,
			sourcePosition: sourcePosition,
		};

		this.fire( 'move', model, this.context );
	}

	convertRemove( range, sourcePosition ) {
		const model = {
			range: range,
			sourcePosition: sourcePosition,
		};

		this.fire( 'remove', model, this.context );
	}

	convertAttribute( type, range, key, oldValue, newValue ) {
		const consumable = new Consumable();
		const values = [];

		for ( let value of range ) {
			values.push( value );

			const item = value.item;

			for ( let key of item.getAttributes() ) {
				consumable.add( item, type + ':' + key );
			}
		}

		const writer = this.writer;
		const mapper = this.mapper;

		for ( let value of values ) {
			const item = value.item;
			const range = Range.createFromPositionAndShift( value.previousPosition, value.length );
			const model = {
				item: item,
				range: range,
				attributeKey: key,
				consumable: consumable
			};

			this._testAndFire( type + ':' + key, model, this.context );
		}
	}

	_testAndFire( type, model, context ) {
		if ( !model.consumable.test( model.item, type ) ) {
			// Do not fire event if the item was consumed.
			return;
		}

		if ( type === 'insert' ) {
			if ( model.item instanceof TextFragment ) {
				// e.g. insert:text
				this.fire( type + ':text', model, context );
			} else {
				// e.g. insert:element:p
				this.fire( type + ':element:' + model.item.name, model, context );
			}
		} else {
			// e.g. addAttribute:alt:img
			this.fire( type + ':' + model.item.name, model, context );
		}
	}
}