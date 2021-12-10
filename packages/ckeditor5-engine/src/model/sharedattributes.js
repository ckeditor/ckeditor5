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
		this._model = model;
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

		const referenceAttributesProperties = this._model.schema.getAttributesPropertiesWithProperty( 'sharedReferenceAttribute' );
		const referenceAttributes = new Set(
			Array.from( referenceAttributesProperties.values() )
				.map( ( { sharedReferenceAttribute } ) => sharedReferenceAttribute )
		);

		let checkSharedAttributes = true;

		while ( checkSharedAttributes ) {
			checkSharedAttributes = false;

			for ( const sharedReferenceAttribute of referenceAttributes ) {
				if ( attributes.has( sharedReferenceAttribute ) ) {
					referenceAttributes.delete( sharedReferenceAttribute );

					const prefix = `$shared:${ attributes.get( sharedReferenceAttribute ) }:`;

					for ( const [ key, value ] of node.root.getAttributes( { ignoreShared: true } ) ) {
						if ( key.startsWith( prefix ) ) {
							const sharedKey = key.substring( prefix.length );

							attributes.set( sharedKey, value );

							if ( referenceAttributes.has( sharedKey ) ) {
								checkSharedAttributes = true;
							}
						}
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

		const attributeProperties = this._model.schema.getAttributeProperties( key );

		if ( !attributeProperties.sharedReferenceAttribute ) {
			return operations;
		}

		if ( itemOrRange.is( 'range' ) ) {
			for ( const item of itemOrRange.getItems( { shallow: true } ) ) {
				addSharedAttributeOperation( item, key, attributeProperties.sharedReferenceAttribute, newValue );
			}
		} else {
			addSharedAttributeOperation( itemOrRange, key, attributeProperties.sharedReferenceAttribute, newValue );
		}

		return operations;

		function addSharedAttributeOperation( item, key, sharedReferenceAttribute, newValue ) {
			const refValue = getSharedReferenceAttribute( item, sharedReferenceAttribute );
			const previousValue = item.root.getAttribute( `$shared:${ refValue }:${ key }`, { ignoreShared: true } );

			if ( previousValue != newValue ) {
				operations.push( {
					item: item.root,
					key: `$shared:${ refValue }:${ key }`,
					previousValue,
					newValue
				} );
			}
		}

		// TODO
		function getSharedReferenceAttribute( item, sharedReferenceAttribute ) {
			let refValue = item.getAttribute( sharedReferenceAttribute );

			// Note that undefined == null.
			if ( refValue != null ) {
				return refValue;
			}

			refValue = uid();

			operations.push( {
				item,
				key: sharedReferenceAttribute,
				previousValue: null,
				newValue: refValue
			} );

			return refValue;
		}
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
