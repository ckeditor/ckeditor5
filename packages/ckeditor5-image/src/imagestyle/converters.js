/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle/converters
 */

/**
 * Returns converter for `imageStyle` attribute. It can be used for adding, changing and removing the attribute.
 *
 * @param {Object} styles Object containing available styles. See {@link module:image/imagestyle/imagestyleengine~ImageStyleFormat}
 * for more details.
 * @returns {Function} Model to view attribute converter.
 */
export function modelToViewSetStyle( styles ) {
	return ( evt, data, consumable, conversionApi ) => {
		const eventType = evt.name.split( ':' )[ 0 ];
		const consumableType = eventType + ':imageStyle';

		if ( !consumable.test( data.item, consumableType ) ) {
			return;
		}

		// Check if there is class name associated with given value.
		const newStyle = getStyleByValue( data.attributeNewValue, styles );
		const oldStyle = getStyleByValue( data.attributeOldValue, styles );
		const viewElement = conversionApi.mapper.toViewElement( data.item );

		if ( handleRemoval( eventType, oldStyle, viewElement ) &&
			handleAddition( eventType, newStyle, viewElement ) ) {
			consumable.consume( data.item, consumableType );
		}
	};
}

// Returns style with given `value` from array of styles.
//
// @param {String} value
// @param {Array.<module:image/imagestyle/imagestyleengine~ImageStyleFormat> } styles
// @return {module:image/imagestyle/imagestyleengine~ImageStyleFormat|undefined}
function getStyleByValue( value, styles ) {
	for ( let style of styles ) {
		if ( style.value === value ) {
			return style;
		}
	}
}

// Handles converting removal of the attribute.
// Returns `true` when handling was processed correctly and further conversion can be performed.
//
// @param {String} eventType Type of the event.
// @param {module:image/imagestyle/imagestyleengine~ImageStyleFormat} style
// @param {module:engine/view/element~Element} viewElement
// @returns {Boolean}
function handleRemoval( eventType, style, viewElement ) {
	if ( eventType == 'changeAttribute' || eventType == 'removeAttribute' ) {
		if ( !style ) {
			return false;
		}

		viewElement.removeClass( style.className );
	}

	return true;
}

// Handles converting addition of the attribute.
// Returns `true` when handling was processed correctly and further conversion can be performed.
//
// @param {String} eventType Type of the event.
// @param {module:image/imagestyle/imagestyleengine~ImageStyleFormat} style
// @param {module:engine/view/element~Element} viewElement
// @returns {Boolean}
function handleAddition( evenType, style, viewElement ) {
	if ( evenType == 'addAttribute' || evenType == 'changeAttribute' ) {
		if ( !style ) {
			return false;
		}

		viewElement.addClass( style.className );
	}

	return true;
}
