/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global chai */

/**
 * Asserts that the target has an attribute with the given key name.
 * See {@link module:engine/model/documentselection~DocumentSelection#hasAttribute hasAttribute}.
 *
 *		expect( selection ).to.have.attribute( 'linkHref' );
 *
 * When `value` is provided, .attribute also asserts that the attribute's value is equal to the given `value`.
 * See {@link module:engine/model/documentselection~DocumentSelection#getAttribute getAttribute}.
 *
 *		expect( selection ).to.have.attribute( 'linkHref', 'example.com' );
 *
 * Negations works as well.
 *
 * @param {String} key Key of attribute to assert.
 * @param {String} [value] Attribute value to assert.
 * @param {String} [message] Additional message.
 */
chai.Assertion.addMethod( 'attribute', function attributeAssertion( key, value, message ) {
	if ( message ) {
		chai.util.flag( this, 'message', message );
	}

	const obj = this._obj;

	if ( arguments.length === 1 ) {
		// Check if it has the method at all.
		new chai.Assertion( obj ).to.respondTo( 'hasAttribute' );

		// Check if it has the attribute.
		const hasAttribute = obj.hasAttribute( key );
		this.assert(
			hasAttribute === true,
			`expected #{this} to have attribute '${ key }'`,
			`expected #{this} to not have attribute '${ key }'`,
			!chai.util.flag( this, 'negate' ),
			hasAttribute
		);
	}

	// If a value was given.
	if ( arguments.length >= 2 ) {
		// Check if it has the method at all.
		new chai.Assertion( obj ).to.respondTo( 'getAttribute', message );

		const attributeValue = obj.getAttribute( key );
		this.assert(
			attributeValue === value,
			`expected #{this} to have attribute '${ key }' of #{exp}, but got #{act}`,
			`expected #{this} to not have attribute '${ key }' of #{exp}`,
			value,
			attributeValue
		);
	}
} );
