/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/sharedattributes
 */

import uid from '@ckeditor/ckeditor5-utils/src/uid';
import Range from './range';

/**
 * TODO
 */
export default class SharedAttributes {
	/**
	 * TODO
	 */
	constructor( model ) {
		/**
		 * TODO
		 * @private
		 */
		this._model = model;

		/**
		 * TODO
		 * @private
		 */
		this._referenceCounters = new Map();

		/**
		 * TODO
		 * @private
		 */
		this._referenceAttributes = null;
	}

	/**
	 * TODO
	 */
	getSharedAttribute( node, key, value ) {
		if ( !node.root.document ) {
			return value;
		}

		if ( node === node.root ) {
			// This would require changes in operations validation.
			// if ( key.startsWith( '$shared:' ) ) {
			// 	return;
			// }

			return value;
		}

		const attributeProperties = this._model.schema.getAttributeProperties( key );

		if ( !attributeProperties.sharedReferenceAttribute ) {
			return value;
		}

		const refValue = node.getAttribute( attributeProperties.sharedReferenceAttribute );

		// Note that undefined == null.
		if ( refValue == null ) {
			return value;
		}

		return node.root.getAttribute( `$shared:${ refValue }:${ key }`, { ignoreShared: true } );
	}

	/**
	 * TODO
	 */
	getSharedAttributes( node, attributes ) {
		if ( !node.root.document ) {
			return attributes;
		}

		attributes = new Map( attributes );

		if ( node === node.root ) {
			for ( const key of Array.from( attributes.keys() ) ) {
				if ( key.startsWith( '$shared:' ) ) {
					attributes.delete( key );
				}
			}

			return attributes;
		}

		const referenceAttributes = new Set( this._getReferenceAttributesDefinitions().values() );
		let checkSharedAttributes = true;

		while ( checkSharedAttributes ) {
			checkSharedAttributes = false;

			for ( const sharedReferenceAttribute of referenceAttributes ) {
				if ( !attributes.has( sharedReferenceAttribute ) ) {
					continue;
				}

				referenceAttributes.delete( sharedReferenceAttribute );

				const prefix = `$shared:${ attributes.get( sharedReferenceAttribute ) }:`;

				for ( const [ key, value ] of node.root.getAttributes( { ignoreShared: true } ) ) {
					if ( !key.startsWith( prefix ) ) {
						continue;
					}

					const sharedKey = key.substring( prefix.length );

					attributes.set( sharedKey, value );

					if ( referenceAttributes.has( sharedKey ) ) {
						checkSharedAttributes = true;
					}
				}
			}
		}

		return attributes;
	}

	/**
	 * TODO
	 */
	prepareSetAttributeOperations( itemOrRange, key, previousValue, newValue ) {
		const operations = [];

		if ( !itemOrRange.root.document ) {
			return operations;
		}

		const referenceAttributes = new Set( this._getReferenceAttributesDefinitions().values() );

		const getSharedReferenceAttribute = ( item, sharedReferenceAttribute ) => {
			let refValue = item.getAttribute( sharedReferenceAttribute );

			// Note that undefined == null.
			if ( refValue != null ) {
				return refValue;
			}

			refValue = uid();

			operations.push( {
				item,
				key: sharedReferenceAttribute,
				value: refValue
			} );

			return refValue;
		};

		const addReferenceAttributeOperation = ( item, previousValue, newValue ) => {
			for ( const [ sharedKey, sharedValue ] of item.root.getAttributes( { ignoreShared: true } ) ) {
				const prefix = `$shared:${ previousValue }:`;

				if ( sharedKey.startsWith( prefix ) ) {
					if ( this._decreaseReferenceCount( previousValue ) == 0 ) {
						operations.push( {
							item: item.root,
							key: sharedKey,
							value: null
						} );
					}

					this._increaseReferenceCount( newValue );

					operations.push( {
						item: item.root,
						key: `$shared:${ newValue }:${ sharedKey.substring( prefix.length ) }`,
						value: sharedValue
					} );
				}
			}
		};

		const addSharedAttributeOperation = ( item, key, sharedReferenceAttribute, newValue ) => {
			const refValue = getSharedReferenceAttribute( item, sharedReferenceAttribute );

			this._increaseReferenceCount( refValue );

			operations.push( {
				item: item.root,
				key: `$shared:${ refValue }:${ key }`,
				value: newValue
			} );
		};

		const attributeProperties = this._model.schema.getAttributeProperties( key );

		if ( itemOrRange.is( 'range' ) ) {
			for ( const item of itemOrRange.getItems( { shallow: true } ) ) {
				if ( attributeProperties.sharedReferenceAttribute ) {
					addSharedAttributeOperation( item, key, attributeProperties.sharedReferenceAttribute, newValue );
				}

				if ( referenceAttributes.has( key ) ) {
					addReferenceAttributeOperation( item, previousValue, newValue );
				}
			}
		} else {
			if ( attributeProperties.sharedReferenceAttribute ) {
				addSharedAttributeOperation( itemOrRange, key, attributeProperties.sharedReferenceAttribute, newValue );
			}

			if ( referenceAttributes.has( key ) ) {
				addReferenceAttributeOperation( itemOrRange, previousValue, newValue );
			}
		}

		return operations;
	}

	/**
	 * TODO
	 */
	extractSharedAttributes( item ) {
		if ( item.root.document ) {
			throw new Error( 'wrong usage' );
		}

		const schema = this._model.schema;
		const sharedAttributes = new Map();

		if ( item.is( 'documentFragment' ) ) {
			for ( const subItem of Range._createIn( item ).getItems() ) {
				sharedAttributes.set( subItem, extractItemSharedAttributes( subItem, schema ) );
			}
		} else {
			sharedAttributes.set( item, extractItemSharedAttributes( item, schema ) );
		}

		return sharedAttributes;
	}

	/**
	 * TODO
	 * @private
	 */
	_getReferenceAttributesDefinitions() {
		if ( this._referenceAttributes ) {
			return this._referenceAttributes;
		}

		this._referenceAttributes = new Map();

		for ( const [ key, properties ] of this._model.schema.getAttributesPropertiesWithProperty( 'sharedReferenceAttribute' ) ) {
			this._referenceAttributes.set( key, properties.sharedReferenceAttribute );
		}

		return this._referenceAttributes;
	}

	/**
	 * TODO
	 * @private
	 */
	_increaseReferenceCount( id ) {
		const oldCount = this._referenceCounters.get( id ) || 0;

		this._referenceCounters.set( id, oldCount + 1 );
	}

	/**
	 * TODO
	 * @private
	 */
	_decreaseReferenceCount( id ) {
		const oldCount = this._referenceCounters.get( id ) || 0;

		if ( !oldCount ) {
			throw new Error( 'invalid ref count' );
		}

		const newCount = oldCount - 1;

		if ( newCount == 0 ) {
			this._referenceCounters.delete( id );
		} else {
			this._referenceCounters.set( id, newCount );
		}

		return newCount;
	}
}

// TODO
function extractItemSharedAttributes( item, schema ) {
	if ( item.root.document ) {
		throw new Error( 'wrong usage' );
	}

	const attributes = new Map();

	for ( const [ key, value ] of item.getAttributes() ) {
		const attributeProperties = schema.getAttributeProperties( key );

		if ( attributeProperties.sharedReferenceAttribute ) {
			attributes.set( key, value );

			if ( item.is( '$textProxy' ) ) {
				item.textNode._removeAttribute( key );
			} else {
				item._removeAttribute( key );
			}
		}
	}

	return attributes;
}
