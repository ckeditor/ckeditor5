/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ViewText from '../treeview/text.js';
import ModelTreeWalker from './treemodel/treewalker.js';

export function insert( nodeCreator ) {
	return ( evt, model, context ) => {
		model.consumable.consume( model.item, 'insert' );

		const viewPosition = context.mapper.toViewPosition( model.range.start );

		// TODO: copy element
		const viewNode = ( nodeCreator instanceof viewNode ) ? nodeCreator : nodeCreator( model, context );

		context.mapper.bind( model.item, viewNode );

		context.writer.insert( viewPosition, viewNode );

		evt.stop();
	};
}

export function insertText() {
	return ( evt, model, context ) => {
		model.consumable.consume( model.item, 'insert' );

		const viewPosition = context.mapper.toViewPosition( model.position );
		const viewNode = new ViewText( model.item.data );

		context.writer.insert( viewPosition, viewNode );

		evt.stop();
	};
}

export function setAttribute( attributesCreator ) {
	return ( evt, model, context ) => {
		let attributes;

		if ( !attributesCreator ) {
			attributes = model.item.getAttribute( model.attributeKey );
		} else {
			attributes = attributesCreator( model );
		}

		if ( attributes ) {
			model.consumable.consume( model.item, eventNameToConsumableType( evt.name ) );

			const viewElement = context.mapper.toViewElement( model.item );

			if ( typeof attributes === 'string' || typeof attributes === 'number' ) {
				viewElement.setAttribute( model.attributeKey, attributes );
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
	return ( evt, model, context ) => {
		let attributeKeys;

		if ( !attributesCreator ) {
			attributeKeys = model.attributeKey;
		} else {
			attributeKeys = attributesCreator( model );
		}

		if ( attributeKeys ) {
			model.consumable.consume( model.item, eventNameToConsumableType( evt.name ) );

			const viewElement = context.mapper.toViewElement( model.item );

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
	return ( evt, model, context ) => {
		model.consumable.consume( model.item, eventNameToConsumableType( evt.name ) );

		const viewRange = context.mapper.toViewRange( model.range );

		const viewNode = ( nodeCreator instanceof viewNode ) ? nodeCreator : nodeCreator( model );

		context.writer.wrap( viewRange, viewNode );

		evt.stop();
	};
}

export function unwrap( nodeCreator ) {
	return ( evt, model, context ) => {
		model.consumable.consume( model.item, eventNameToConsumableType( evt.name ) );

		const viewRange = context.mapper.toViewRange( model.range );

		const viewNode = ( nodeCreator instanceof viewNode ) ? nodeCreator : nodeCreator( model );

		context.writer.unwrap( viewRange, viewNode );

		evt.stop();
	};
}

export function move() {
	return ( evt, model, context ) => {
		const walker = new ModelTreeWalker( { boundaries: model.range, shallow: true } );

		let length = 0;

		for ( let value of walker ) {
			length += value.length;
		}

		const sourceModelRange = Range.createFromPositionAndShift( model.sourcePosition, length );

		const sourceViewRange = context.mapper.toViewRange( sourceModelRange );
		const targetViewPosition = context.mapper.toViewRange( model.range.start );

		context.writer.move( sourceViewRange, targetViewPosition );
	};
}

export function remove() {
	return ( evt, model, context ) => {
		const walker = new ModelTreeWalker( { boundaries: model.range, shallow: true } );

		let length = 0;

		for ( let value of walker ) {
			length += value.length;
		}

		const sourceModelRange = Range.createFromPositionAndShift( model.sourcePosition, length );
		const sourceViewRange = context.mapper.toViewRange( sourceModelRange );

		context.writer.remove( sourceViewRange );
	};
}

function eventNameToConsumableType( evtName ) {
	const parts = evtName.split( ':' );

	return parts[ 0 ] + ':' + parts[ 1 ];
}