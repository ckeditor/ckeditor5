/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgettypearound/utils
 */

import { isWidget } from '../utils';

/**
 * Checks if an element is a widget that qualifies to get the type around UI.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @param {module:engine/model/element~Element} modelElement
 * @param {module:engine/model/schema~Schema} schema
 * @returns {Boolean}
 */
export function isTypeAroundWidget( viewElement, modelElement, schema ) {
	return viewElement && isWidget( viewElement ) && !schema.isInline( modelElement );
}

/**
 * For the passed HTML element, this helper finds the closest type around button ancestor.
 *
 * @param {HTMLElement} domElement
 * @returns {HTMLElement|null}
 */
export function getClosestTypeAroundDomButton( domElement ) {
	return domElement.closest( '.ck-widget__type-around__button' );
}

/**
 * For the passed type around button element, this helper determines at which position
 * the paragraph would be inserted into the content if, for instance, the button was
 * clicked by the user.
 *
 * @param {HTMLElement} domElement
 * @returns {String} Either `'before'` or `'after'`.
 */
export function getTypeAroundButtonPosition( domElement ) {
	return domElement.classList.contains( 'ck-widget__type-around__button_before' ) ? 'before' : 'after';
}

/**
 * For the passed HTML element, this helper returns the closest view widget ancestor.
 *
 * @param {HTMLElement} domElement
 * @param {module:engine/view/domconverter~DomConverter} domConverter
 * @returns {module:engine/view/element~Element|null}
 */
export function getClosestWidgetViewElement( domElement, domConverter ) {
	const widgetDomElement = domElement.closest( '.ck-widget' );

	if ( !widgetDomElement ) {
		return null;
	}

	return domConverter.mapDomToView( widgetDomElement );
}

/**
 * For the passed widget view element, this helper returns an array of positions which
 * correspond to the "tight spots" around the widget which cannot be accessed due to
 * limitations of selection rendering in web browsers.
 *
 * @param {module:engine/view/element~Element} widgetViewElement
 * @returns {Array.<String>}
 */
export function getWidgetTypeAroundPositions( widgetViewElement ) {
	const positions = [];

	if ( isFirstChild( widgetViewElement ) || hasPreviousWidgetSibling( widgetViewElement ) ) {
		positions.push( 'before' );
	}

	if ( isLastChild( widgetViewElement ) || hasNextWidgetSibling( widgetViewElement ) ) {
		positions.push( 'after' );
	}

	return positions;
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
