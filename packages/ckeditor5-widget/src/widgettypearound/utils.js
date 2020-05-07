/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgettypearound/utils
 */

import { isWidget } from '../utils';

export function getClosestTypeAroundDomButton( domElement ) {
	return domElement.closest( '.ck-widget__type-around__button' );
}

export function getTypeAroundButtonDirection( domElement ) {
	return domElement.classList.contains( 'ck-widget__type-around__button_before' ) ? 'before' : 'after';
}

export function getClosestWidgetViewElement( domElement, domConverter ) {
	const widgetDomElement = domElement.closest( '.ck-widget' );

	if ( !widgetDomElement ) {
		return null;
	}

	return domConverter.mapDomToView( widgetDomElement );
}

export function directionToWidgetCssClass( direction ) {
	return `ck-widget_can-type-around_${ direction }`;
}

export function getWidgetTypeAroundDirections( widgetViewElement ) {
	const directions = [];

	if ( isFirstChild( widgetViewElement ) || hasPreviousWidgetSibling( widgetViewElement ) ) {
		directions.push( 'before' );
	}

	if ( isLastChild( widgetViewElement ) || hasNextWidgetSibling( widgetViewElement ) ) {
		directions.push( 'after' );
	}

	return directions;
}

function isFirstChild( widget ) {
	return !widget.previousSibling;
}

function isLastChild( widget ) {
	return !widget.nextSibling;
}

function hasPreviousWidgetSibling( widget ) {
	return widget.previousSibling && isWidget( widget.previousSibling );
}

function hasNextWidgetSibling( widget ) {
	return widget.nextSibling && isWidget( widget.nextSibling );
}
