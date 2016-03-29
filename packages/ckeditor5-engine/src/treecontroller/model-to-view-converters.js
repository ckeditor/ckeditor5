/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ViewText from '../treeview/text.js';
import ModelTreeWalker from './treemodel/treewalker.js';

export function insert( nodeCreator ) {
	return ( evt, data, context ) => {
		data.consumable.consume( data.item, 'insert' );

		const viewPosition = context.mapper.toViewPosition( data.range.start );

		// TODO: copy element
		const viewNode = ( nodeCreator instanceof viewNode ) ? nodeCreator : nodeCreator( data, context );

		context.mapper.bind( data.item, viewNode );

		context.writer.insert( viewPosition, viewNode );

		evt.stop();
	};
}

export function insertText() {
	return ( evt, data, context ) => {
		data.consumable.consume( data.item, 'insert' );

		const viewPosition = context.mapper.toViewPosition( data.position );
		const viewNode = new ViewText( data.item.data );

		context.writer.insert( viewPosition, viewNode );

		evt.stop();
	};
}

export function setAttribute( attributesCreator ) {
	return ( evt, data, context ) => {
		let attributes;

		if ( !attributesCreator ) {
			attributes = data.item.getAttribute( data.attributeKey );
		} else {
			attributes = attributesCreator( data );
		}

		if ( attributes ) {
			data.consumable.consume( data.item, eventNameToConsumableType( evt.name ) );

			const viewElement = context.mapper.toViewElement( data.item );

			if ( typeof attributes === 'string' || typeof attributes === 'number' ) {
				viewElement.setAttribute( data.attributeKey, attributes );
			} else {
				for ( let attributeKey in attributes ) {
					viewElement.setAttribute( attributeKey, attributes[ attributeKey ] );
				}
			}

			evt.stop();
		}
	};
}

export function removeAttribute( attributesCreator ) {
	return ( evt, data, context ) => {
		let attributeKeys;

		if ( !attributesCreator ) {
			attributeKeys = data.attributeKey;
		} else {
			attributeKeys = attributesCreator( data );
		}

		if ( attributeKeys ) {
			data.consumable.consume( data.item, eventNameToConsumableType( evt.name ) );

			const viewElement = context.mapper.toViewElement( data.item );

			if ( typeof attributeKeys === 'string' ) {
				viewElement.removeAttribute( attributeKeys );
			} else {
				for ( let attributeKey of attributeKeys ) {
					viewElement.removeAttribute( attributeKey );
				}
			}

			evt.stop();
		}
	};
}

export function wrap( nodeCreator ) { // TODO: priority
	return ( evt, data, context ) => {
		data.consumable.consume( data.item, eventNameToConsumableType( evt.name ) );

		const viewRange = context.mapper.toViewRange( data.range );

		const viewNode = ( nodeCreator instanceof viewNode ) ? nodeCreator : nodeCreator( data );

		context.writer.wrap( viewRange, viewNode );

		evt.stop();
	};
}

export function unwrap( nodeCreator ) {
	return ( evt, data, context ) => {
		data.consumable.consume( data.item, eventNameToConsumableType( evt.name ) );

		const viewRange = context.mapper.toViewRange( data.range );

		const viewNode = ( nodeCreator instanceof viewNode ) ? nodeCreator : nodeCreator( data );

		context.writer.unwrap( viewRange, viewNode );

		evt.stop();
	};
}

export function move() {
	return ( evt, data, context ) => {
		const walker = new ModelTreeWalker( { boundaries: data.range, shallow: true } );

		let length = 0;

		for ( let value of walker ) {
			length += value.length;
		}

		const sourceModelRange = Range.createFromPositionAndShift( data.sourcePosition, length );

		const sourceViewRange = context.mapper.toViewRange( sourceModelRange );
		const targetViewPosition = context.mapper.toViewRange( data.range.start );

		context.writer.move( sourceViewRange, targetViewPosition );
	};
}

export function remove() {
	return ( evt, data, context ) => {
		const walker = new ModelTreeWalker( { boundaries: data.range, shallow: true } );

		let length = 0;

		for ( let value of walker ) {
			length += value.length;
		}

		const sourceModelRange = Range.createFromPositionAndShift( data.sourcePosition, length );
		const sourceViewRange = context.mapper.toViewRange( sourceModelRange );

		context.writer.remove( sourceViewRange );
	};
}

function eventNameToConsumableType( evtName ) {
	const parts = evtName.split( ':' );

	return parts[ 0 ] + ':' + parts[ 1 ];
}