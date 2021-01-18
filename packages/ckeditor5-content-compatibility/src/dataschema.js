/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module content-compatibility/dataschema
 */

import { capitalize, escapeRegExp } from 'lodash-es';

const DATA_SCHEMA_PREFIX = 'ghs';

const dtd = {
	'div': {
		inheritAllFrom: '$block'
	}
};

export default class DataSchema {
	constructor( editor ) {
		this.editor = editor;
		this.attributeFilter = new AttributeFilter();
	}

	allowElement( { name: viewName, attributes = [] } ) {
		this._defineSchema( viewName );
		this._defineConverters( viewName );

		if ( !Array.isArray( attributes ) ) {
			attributes = [ attributes ];
		}

		for ( const attribute of attributes ) {
			this.allowAttribute( {
				name: attribute,
				elements: [ viewName ]
			} );
		}
	}

	allowAttribute( { name: attributeName, elements = [] } ) {
		if ( !Array.isArray( elements ) ) {
			elements = [ elements ];
		}

		elements.forEach( element => this.attributeFilter.allow( element, attributeName ) );
	}

	disallowAttribute( { name: attributeName, elements = [] } ) {
		if ( !Array.isArray( elements ) ) {
			elements = [ elements ];
		}

		elements.forEach( element => this.attributeFilter.disallow( element, attributeName ) );
	}

	* _filterAttributes( elementName, attributes ) {
		for ( const attribute of attributes ) {
			const attributeName = attribute[ 0 ];

			if ( this.attributeFilter.isAllowed( elementName, attributeName ) ) {
				yield attribute;
			}
		}
	}

	_defineSchema( viewName ) {
		const schema = this.editor.model.schema;

		schema.register( encodeView( viewName ), dtd[ viewName ] );
	}

	_defineConverters( viewName ) {
		const conversion = this.editor.conversion;
		const filterAttributes = this._filterAttributes.bind( this );
		const modelName = encodeView( viewName );

		conversion.for( 'upcast' ).elementToElement( {
			view: viewName,
			model: ( viewElement, { writer: modelWriter } ) => {
				const attributes = filterAttributes( viewName, viewElement.getAttributes() );

				const encodedAttributes = [];
				for ( const attribute of attributes ) {
					encodedAttributes.push( [
						encodeAttributeKey( attribute[ 0 ] ),
						attribute[ 1 ]
					] );
				}

				return modelWriter.createElement( modelName, encodedAttributes );
			}
		} );

		conversion.for( 'downcast' ).elementToElement( {
			model: modelName,
			view: viewName
		} );

		conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( 'attribute', ( evt, data, conversionApi ) => {
				if ( data.item.name != modelName ) {
					return;
				}

				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const viewElement = conversionApi.mapper.toViewElement( data.item );
				const attributeKey = decodeAttributeKey( data.attributeKey );

				if ( data.attributeNewValue !== null ) {
					viewWriter.setAttribute( attributeKey, data.attributeNewValue, viewElement );
				} else {
					viewWriter.removeAttribute( attributeKey, viewElement );
				}
			} );
		} );
	}
}

class AttributeFilter {
	constructor() {
		this._allowedRules = {};
		this._disallowedRules = {};
	}

	allow( elementRule, attributeRule ) {
		this._register( this._allowedRules, elementRule, attributeRule );
	}

	disallow( elementRule, attributeRule ) {
		this._register( this._disallowedRules, elementRule, attributeRule );
	}

	isAllowed( elementName, attributeName ) {
		const isDisallowed = this._match( this._disallowedRules, elementName, attributeName );

		if ( isDisallowed ) {
			return false;
		}

		return this._match( this._allowedRules, elementName, attributeName );
	}

	_register( rules, elementRule, attributeRule ) {
		if ( !rules[ elementRule ] ) {
			rules[ elementRule ] = [];
		}

		if ( typeof attributeRule === 'string' ) {
			attributeRule = createWildcardMatcher( attributeRule );
		}

		rules[ elementRule ].push( attributeRule );
	}

	_match( rules, elementName, attributeName ) {
		for ( const rule of this._getMatchingRules( rules, elementName ) ) {
			if ( rule( attributeName ) ) {
				return true;
			}
		}

		return false;
	}

	* _getMatchingRules( rules, elementName ) {
		for ( const ruleName in rules ) {
			const matcher = createWildcardMatcher( ruleName );

			if ( matcher( elementName ) ) {
				yield* rules[ ruleName ];
			}
		}
	}
}

function createWildcardMatcher( rule ) {
	const matcher = new RegExp( '^' + rule.split( '*' ).map( escapeRegExp ).join( '.*' ) + '$' );
	return value => matcher.test( value );
}

function encodeView( name ) {
	return DATA_SCHEMA_PREFIX + capitalize( name );
}

function encodeAttributeKey( name ) {
	return DATA_SCHEMA_PREFIX + '-' + name;
}

function decodeAttributeKey( name ) {
	return name.replace( DATA_SCHEMA_PREFIX + '-', '' );
}
