/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import log from '@ckeditor/ckeditor5-utils/src/log';

import fullWidthIcon from '@ckeditor/ckeditor5-core/theme/icons/object-full-width.svg';
import leftIcon from '@ckeditor/ckeditor5-core/theme/icons/object-left.svg';
import centerIcon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
import rightIcon from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { normalizeImageStyles } from '../../src/imagestyle/utils';

testUtils.createSinonSandbox();

describe( 'ImageStyle utils', () => {
	let imageStyles;

	describe( 'imageStyles()', () => {
		describe( 'object format', () => {
			beforeEach( () => {
				imageStyles = normalizeImageStyles( [
					{ name: 'foo', title: 'foo', icon: 'custom', isDefault: true, className: 'foo-class' },
					{ name: 'bar', title: 'bar', icon: 'right', className: 'bar-class' },
					{ name: 'baz', title: 'Side image', icon: 'custom', className: 'baz-class' },

					// Customized default styles.
					{ name: 'full', icon: 'left', title: 'Custom title' }
				] );
			} );

			it( 'should pass through if #name not found in default styles', () => {
				expect( imageStyles[ 0 ] ).to.deep.equal( {
					name: 'foo',
					title: 'foo',
					icon: 'custom',
					isDefault: true,
					className: 'foo-class'
				} );
			} );

			it( 'should use one of default icons if #icon matches', () => {
				expect( imageStyles[ 1 ].icon ).to.equal( rightIcon );
			} );

			it( 'should extend one of default styles if #name matches', () => {
				expect( imageStyles[ 3 ] ).to.deep.equal( {
					name: 'full',
					title: 'Custom title',
					icon: leftIcon,
					isDefault: true
				} );
			} );
		} );

		describe( 'string format', () => {
			it( 'should use one of default styles if #name matches', () => {
				expect( normalizeImageStyles( [ 'imageStyle:full' ] ) ).to.deep.equal( [ {
					name: 'full',
					title: 'Full size image',
					icon: fullWidthIcon,
					isDefault: true
				} ] );

				expect( normalizeImageStyles( [ 'imageStyle:side' ] ) ).to.deep.equal( [ {
					name: 'side',
					title: 'Side image',
					icon: rightIcon,
					className: 'image-style-side'
				} ] );

				expect( normalizeImageStyles( [ 'imageStyle:alignLeft' ] ) ).to.deep.equal( [ {
					name: 'alignLeft',
					title: 'Left aligned image',
					icon: leftIcon,
					className: 'image-style-align-left'
				} ] );

				expect( normalizeImageStyles( [ 'imageStyle:alignCenter' ] ) ).to.deep.equal( [ {
					name: 'alignCenter',
					title: 'Centered image',
					icon: centerIcon,
					className: 'image-style-align-center'
				} ] );

				expect( normalizeImageStyles( [ 'imageStyle:alignRight' ] ) ).to.deep.equal( [ {
					name: 'alignRight',
					title: 'Right aligned image',
					icon: rightIcon,
					className: 'image-style-align-right'
				} ] );
			} );

			it( 'should warn if a #name not found in default styles', () => {
				testUtils.sinon.stub( log, 'warn' );

				expect( normalizeImageStyles( [ 'foo' ] ) ).to.deep.equal( [ {
					name: 'foo'
				} ] );

				sinon.assert.calledOnce( log.warn );
				sinon.assert.calledWithExactly( log.warn,
					sinon.match( /^image-style-not-found/ ),
					{ name: 'foo' }
				);
			} );
		} );
	} );
} );
