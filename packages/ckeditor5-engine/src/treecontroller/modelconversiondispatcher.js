/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Consumable from './modelconsumable.js';
import TextFragment from '../treemodel/textfragment.js';

// TODO: Add docs that if listener is called it means that element is consumable, so every listener need to stop the event if
// it was consumed.
export default class ModelConversionDispatcher {
	constructor( controller ) {
		this.controller = controller;
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
		this.controller.consumable = this._createInsertConsumable();

		for ( let value of range ) {
			const item = value.item;
			const range = Range.createFromPositionAndShift( value.previousPosition, value.length );
			const model = { item, range };

			this._testAndFire( 'insert', model, this.controller );

			for ( let key of item.getAttributes() ) {
				model.attributeKey = key;

				this._testAndFire( 'addAttribute:' + key, model, this.controller );
			}
		}

		this.controller.consumable = undefined;
	}

	convertMove( range, sourcePosition ) {
		const model = {
			range: range,
			sourcePosition: sourcePosition,
		};

		this.fire( 'move', model, this.controller );
	}

	convertRemove( range, sourcePosition ) {
		const model = {
			range: range,
			sourcePosition: sourcePosition,
		};

		this.fire( 'remove', model, this.controller );
	}

	convertAttribute( type, range, key, oldValue, newValue ) {
		this.controller.consumable = this._createAttributeConsumable( type, range, key );

		for ( let value of range ) {
			const item = value.item;
			const range = Range.createFromPositionAndShift( value.previousPosition, value.length );
			const model = {
				item: item,
				range: range,
				attributeKey: key,
				attributeOldValue: oldValue,
				attributeNewValue: newValue
			};

			this._testAndFire( type + ':' + key, model, this.controller );
		}

		this.controller.consumable = undefined;
	}

	_createInsertConsumable( range ) {
		const consumable = new Consumable();

		for ( let value of range ) {
			const item = value.item;

			consumable.add( item, 'insert' );

			for ( let key of item.getAttributes() ) {
				consumable.add( item, 'addAttribute:' + key );
			}
		}

		return consumable;
	}

	_createAttributeConsumable( type, range, key ) {
		const consumable = new Consumable();

		for ( let value of range ) {
			const item = value.item;

			consumable.add( item, type + ':' + key );
		}

		return consumable;
	}

	_testAndFire( type, model, controller ) {
		if ( !model.consumable.test( model.item, type ) ) {
			// Do not fire event if the item was consumed.
			return;
		}

		if ( type === 'insert' ) {
			if ( model.item instanceof TextFragment ) {
				// e.g. insert:text
				this.fire( type + ':text', model, controller );
			} else {
				// e.g. insert:element:p
				this.fire( type + ':element:' + model.item.name, model, controller );
			}
		} else {
			// e.g. addAttribute:alt:img
			this.fire( type + ':' + model.item.name, model, controller );
		}
	}
}