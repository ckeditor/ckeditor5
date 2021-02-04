/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module content-compatibility/dataschema
 */

import { capitalize, escapeRegExp } from 'lodash-es';
import Matcher from '@ckeditor/ckeditor5-engine/src/view/matcher';

const DATA_SCHEMA_PREFIX = 'ghs';
const DATA_SCHEMA_ATTRIBUTE_KEY = 'ghsAttributes';

// "h1", "h2", "h3", "h4", "h5", "h6", "legend", "pre", "rp", "rt", "summary", "p"
// legend, rp, rt, summary

// Phrasing elements.
const P = encodeView( [ 'a', 'em', 'strong', 'small', 'abbr', 'dfn', 'i', 'b', 's', 'u', 'code',
	'var', 'samp', 'kbd', 'sup', 'sub', 'q', 'cite', 'span', 'bdo', 'bdi', 'br',
	'wbr', 'ins', 'del', 'img', 'embed', 'object', 'iframe', 'map', 'area', 'script',
	'noscript', 'ruby', 'video', 'audio', 'input', 'textarea', 'select', 'button',
	'label', 'output', 'keygen', 'progress', 'command', 'canvas', 'time', 'meter', 'detalist' ] );

// Flow elements.
const F = encodeView( [ 'a', 'p', 'hr', 'pre', 'ul', 'ol', 'dl', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
	'hgroup', 'address', 'blockquote', 'ins', 'del', 'object', 'map', 'noscript', 'section',
	'nav', 'article', 'aside', 'header', 'footer', 'video', 'audio', 'figure', 'table',
	'form', 'fieldset', 'menu', 'canvas', 'details' ] );

const dtd = {
	section: { inheritAllFrom: '$block', allowContentOf: P, allowIn: F, allowAttributes: [ DATA_SCHEMA_ATTRIBUTE_KEY ] },
	article: { inheritAllFrom: '$block', allowContentOf: P, allowIn: F, allowAttributes: [ DATA_SCHEMA_ATTRIBUTE_KEY ] }
};

function remove( source, toRemove ) {
	return source.filter( item => !toRemove.includes( item ) );
}

export default class DataSchema {
	constructor( editor ) {
		this.editor = editor;

		this.allowedContent = {};
	}

	allow( config ) {
		if ( !config.name ) {
			return;
		}

		const matchElement = getElementNameMatchingRegExp( config.name );

		for ( const elementName in dtd ) {
			if ( !matchElement.test( elementName ) ) {
				continue;
			}

			this._defineSchema( elementName );
			this._defineConverters( elementName );
			this._getOrCreateMatcher( elementName ).add( config );
		}
	}

	_getOrCreateMatcher( elementName ) {
		if ( !this.allowedContent[ elementName ] ) {
			this.allowedContent[ elementName ] = new Matcher();
		}

		return this.allowedContent[ elementName ];
	}

	_defineSchema( viewName ) {
		const schema = this.editor.model.schema;
		const modelName = encodeView( viewName );

		schema.register( modelName, dtd[ viewName ] );
	}

	_defineConverters( viewName ) {
		const conversion = this.editor.conversion;
		const modelName = encodeView( viewName );

		conversion.for( 'upcast' ).elementToElement( {
			view: viewName,
			model: ( viewElement, conversionApi ) => {
				const match = this._getOrCreateMatcher( viewName ).match( viewElement );
				const attributeMatch = match.match.attributes || [];

				const originalAttributes = attributeMatch.map( attributeName => {
					return [ attributeName, viewElement.getAttribute( attributeName ) ];
				} );

				let attributesToAdd;
				if ( originalAttributes.length ) {
					attributesToAdd = [ [ DATA_SCHEMA_ATTRIBUTE_KEY, originalAttributes ] ];
				}

				return conversionApi.writer.createElement( modelName, attributesToAdd );
			}
		} );

		conversion.for( 'downcast' ).elementToElement( {
			model: modelName,
			view: viewName
		} );

		conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( `attribute:${ DATA_SCHEMA_ATTRIBUTE_KEY }`, ( evt, data, conversionApi ) => {
				if ( data.item.name != modelName ) {
					return;
				}

				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const viewElement = conversionApi.mapper.toViewElement( data.item );

				if ( data.attributeNewValue !== null ) {
					data.attributeNewValue.forEach( ( [ key, value ] ) => {
						viewWriter.setAttribute( key, value, viewElement );
					} );
				}

				viewWriter.removeAttribute( DATA_SCHEMA_ATTRIBUTE_KEY, viewElement );
			} );
		} );
	}
}

function encodeView( name ) {
	if ( Array.isArray( name ) ) {
		return name.map( encodeView );
	}

	return DATA_SCHEMA_PREFIX + capitalize( name );
}

function getElementNameMatchingRegExp( value ) {
	if ( value instanceof RegExp ) {
		return value;
	}

	return new RegExp( escapeRegExp( value ) );
}
