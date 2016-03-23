/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import isPlainObject from '../../utils/lib/lodash/isPlainObject.js';
import isArray from '../../utils/lib/lodash/isArray.js';
import ViewElement from '../treeview/element.js';
import CKEditorError from '../../utils/ckeditorerror.js';

class ViewElementConsumables {
	constructor()  {
		this._canConsumeElement = null;

		this._consumables = {
			attribute: new Map(),
			style: new Map(),
			class: new Map()
		};
	}

	add( consumables, elementOnly ) {
		if ( elementOnly ) {
			this._canConsumeElement = true;
		} else {
			for ( let type in consumables ) {
				if ( type in this._consumables ) {
					this._add( type, consumables[ type ] );
				}
			}
		}
	}

	test( consumables, elementOnly ) {
		if ( elementOnly ) {
			return this._canConsumeElement;
		}

		for ( let type in consumables ) {
			if ( type in this._consumables ) {
				const value =  this._test( type, consumables[ type ] );

				if ( value !== true ) {
					return value;
				}
			}
		}

		return true;
	}

	consume( consumables, elementOnly ) {
		if ( elementOnly ) {
			this._canConsumeElement = false;

			return;
		}

		for ( let type in consumables ) {
			if ( type in this._consumables ) {
				this._consume( type, consumables[ type ] );
			}
		}
	}

	revert( consumables, elementOnly ) {
		if ( elementOnly ) {
			if ( this._canConsumeElement === false ) {
				this._canConsumeElement = true;
			}

			return;
		}

		for ( let type in consumables ) {
			if ( type in this._consumables ) {
				this._revert( type, consumables[ type ] );
			}
		}
	}

	_add( type, item ) {
		const items = isArray( item ) ? item : [ item ];
		const consumables = this._consumables[ type ];

		for ( let name of items ) {
			if ( type === 'attribute' && ( name === 'class' || name === 'style' ) ) {
				// TODO: comment error
				throw new CKEditorError( 'viewconsumable-invalid-attribute: Classes and styles should be handled separately.' );
			}

			consumables.set( name, true );
		}
	}

	_test( type, item ) {
		const items = isArray( item ) ? item : [ item ];
		const consumables = this._consumables[ type ];

		for ( let name of items ) {
			if ( type === 'attribute' && ( name === 'class' || name === 'style' ) ) {
				// TODO: comment error
				throw new CKEditorError( 'viewconsumable-invalid-attribute: Classes and styles should be handled separately.' );
			}

			const value = consumables.get( name );

			// Return null if attribute is not found.
			if ( value === undefined ) {
				return null;
			}

			if ( !value ) {
				return false;
			}
		}

		return true;
	}

	_consume( type, item ) {
		const items = isArray( item ) ? item : [ item ];
		const consumables = this._consumables[ type ];

		for ( let name of items ) {
			consumables.set( name, false );
		}
	}

	_revert( type, item ) {
		const items = isArray( item ) ? item : [ item ];
		const consumables = this._consumables[ type ];

		for ( let name of items ) {
			if ( type === 'attribute' && ( name === 'class' || name === 'style' ) ) {
				// TODO: comment error
				throw new CKEditorError( 'viewconsumable-invalid-attribute: Classes and styles should be handled separately.' );
			}
			const value = consumables.get( name );

			if ( value === false ) {
				consumables.set( name, true );
			}
		}
	}
}

export default class ViewConsumable {
	constructor() {
		/**
		* Map of consumable elements.
		*
		* @protecteds
		* @member {Map} core.treeController.ViewConsumable#_consumable
		*/
		this._consumables = new Map();
	}

	add( ...description ) {
		for ( let item of description ) {
			const { element, includeElement } = getElement( item );
			let elementConsumables;

			// Create entry in consumables map for provided element if one is not already present.
			if ( !this._consumables.has( element ) ) {
				elementConsumables = new ViewElementConsumables();
				this._consumables.set( element, elementConsumables );
			} else {
				elementConsumables = this._consumables.get( element );
			}

			elementConsumables.add( item, includeElement );
		}
	}

	test( ...description ) {
		for ( let item of description ) {
			let result;
			const { element, includeElement } = getElement( item );

			// Return null if there is no information about provided element.
			if ( !this._consumables.has( element ) ) {
				result = null;
			} else {
				const elementConsumables = this._consumables.get( element );
				result =  elementConsumables.test( item, includeElement );
			}

			if ( !result ) {
				return result;
			}
		}

		return true;
	}

	consume( ...description ) {
		// Consume only if all provided descriptions can be consumed.
		if ( !this.test( ...description ) ) {
			return false;
		}

		for ( let item of description ) {
			const { element, includeElement } = getElement( item );
			const elementConsumables = this._consumables.get( element );

			elementConsumables.consume( item, includeElement );
		}

		return true;
	}

	revert( ...description ) {
		for ( let item of description ) {
			const { element, includeElement } = getElement( item );

			// Return null if there is no information about provided element.
			if ( this._consumables.has( element ) ) {
				const elementConsumables = this._consumables.get( element );
				elementConsumables.revert( item, includeElement );
			}
		}
	}
}

function getElement( description ) {
	// Element can be provided as a stand alone parameter or inside consumables object.
	if ( description instanceof ViewElement ) {
		return { element: description, includeElement: true };
	}

	if ( isPlainObject( description ) && description.element instanceof ViewElement ) {
		return { element: description.element, includeElement: Object.keys( description ).length === 1 };
	}

	/**
	 * Tree view Element must be provided.
	 *
	 * @error viewconsumable-element-missing
	 */
	throw new CKEditorError( 'viewconsumable-element-missing: Tree view Element is not provided.' );
}
