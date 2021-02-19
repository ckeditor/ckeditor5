/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import fullWidthIcon from '@ckeditor/ckeditor5-core/theme/icons/object-full-width.svg';
import leftIcon from '@ckeditor/ckeditor5-core/theme/icons/object-left.svg';
import centerIcon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
import rightIcon from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import utils from '../../src/imagestyle/utils';

const { normalizeStyles, getDefaultStylesConfiguration, DEFAULT_ARRANGEMENTS, DEFAULT_GROUPS, DEFAULT_ICONS } = utils;

describe.only( 'ImageStyle utils', () => {
	testUtils.createSinonSandbox();

	describe( 'getDefaultStylesConfiguration()', () => {
		it( 'should return the proper config if both image editing plugins are loaded', async () => {
			const config = getDefaultStylesConfiguration( true, true );

			expect( config ).to.deep.equal( {
				arrangements: [
					'inline', 'alignLeft', 'alignRight',
					'alignCenter', 'alignBlockLeft', 'alignBlockRight'
				],
				groups: [ 'wrapText', 'breakText' ]
			} );
		} );

		it( 'should return the proper config if only the inline image editing plugin is loaded', () => {
			const config = getDefaultStylesConfiguration( false, true );

			expect( config ).to.deep.equal( {
				arrangements: [ 'inline', 'alignLeft', 'alignRight' ]
			} );
		} );

		it( 'should return the proper config if only the block image editing plugin is loaded', () => {
			const config = getDefaultStylesConfiguration( true, false );

			expect( config ).to.deep.equal( {
				arrangements: [ 'full', 'side' ]
			} );
		} );

		it( 'should return an empty object if neither image editing plugins are loaed', () => {
			const config = getDefaultStylesConfiguration( false, false );

			expect( config ).to.deep.equal( {} );
		} );
	} );

	describe( 'normalizeImageStyles()', () => {
		const allArrangements = Object.values( DEFAULT_ARRANGEMENTS );

		function normalize(
			arrangements = allArrangements,
			groups = [],
			isBlockPluginLoaded = true,
			isInlinePluginLoaded = true
		) {
			return normalizeStyles( {
				configuredStyles: { arrangements, groups },
				isBlockPluginLoaded,
				isInlinePluginLoaded
			} );
		}

		beforeEach( () => {
			testUtils.sinon.stub( console, 'warn' );
		} );

		describe( 'arrangement', () => {
			describe( 'set as a string in the editor config', () => {
				it( 'should return the proper default arrangement if #name matches', () => {
					for ( const arrangement in DEFAULT_ARRANGEMENTS ) {
						const normalizedStyles = normalize( [ arrangement ] );

						expect( normalizedStyles.arrangements[ 0 ] ).to.not.equal( DEFAULT_ARRANGEMENTS[ arrangement ] );
						expect( normalizedStyles ).to.deep.equal(
							{ arrangements: [ DEFAULT_ARRANGEMENTS[ arrangement ] ], groups: [] }
						);
					}

					testUtils.sinon.assert.notCalled( console.warn );
				} );

				it( 'should warn and ommit the arrangement if the #name not found in default arrangements', () => {
					expect( normalize(
						[ 'foo' ]
					) ).to.deep.equal(
						{ arrangements: [], groups: [] }
					);

					testUtils.sinon.assert.calledOnce( console.warn );
					testUtils.sinon.assert.calledWithExactly( console.warn,
						sinon.match( /^image-style-invalid/ ),
						{ arrangement: { name: 'foo' } },
						sinon.match.string // Link to the documentation
					);
				} );
			} );

			describe( 'set as an object in the editor config', () => {
				it( 'should pass through if #name not found in the default arrangements', () => {
					const arrangement = { name: 'foo', modelElements: [ 'image' ] };

					expect( normalize(
						[ arrangement ]
					) ).to.deep.equal(
						{ arrangements: [ arrangement ], groups: [] }
					);

					testUtils.sinon.assert.notCalled( console.warn );
				} );

				it( 'should use one of default icons if #icon matches', () => {
					for ( const icon in DEFAULT_ICONS ) {
						const arrangement = { name: 'custom', modelElements: [ 'image' ], icon };

						expect( normalize(
							[ arrangement ]
						) ).to.deep.equal(
							{ arrangements: [ { ...arrangement, icon: DEFAULT_ICONS[ icon ] } ], groups: [] }
						);
					}

					testUtils.sinon.assert.notCalled( console.warn );
				} );

				it( 'should pass the icon if is not a string', () => {
					const arrangement = { name: 'custom', modelElements: [ 'image' ], icon: {} };

					expect( normalize(
						[ arrangement ]
					) ).to.deep.equal(
						{ arrangements: [ arrangement ], groups: [] }
					);

					testUtils.sinon.assert.notCalled( console.warn );
				} );

				it( 'should warn and filter out the arrangement which has no modelElements defined', () => {
					const arrangement = { name: 'foo' };

					expect( normalize(
						[ arrangement ]
					) ).to.deep.equal(
						{ arrangements: [], groups: [] }
					);

					testUtils.sinon.assert.calledOnce( console.warn );
					testUtils.sinon.assert.calledWithExactly( console.warn,
						testUtils.sinon.match( /^image-style-invalid/ ),
						{ arrangement },
						testUtils.sinon.match.string // Link to the documentation
					);
				} );

				it( 'should warn and filter out the arrangement which has modelElements defined as an empty array', () => {
					const arrangement = { name: 'foo', modelElements: [] };

					expect( normalize(
						[ arrangement ]
					) ).to.deep.equal(
						{ arrangements: [], groups: [] }
					);

					testUtils.sinon.assert.calledOnce( console.warn );
					testUtils.sinon.assert.calledWithExactly( console.warn,
						sinon.match( /^image-style-invalid/ ),
						{ arrangement },
						testUtils.sinon.match.string // Link to the documentation
					);
				} );

				it( 'should warn and filter out the arrangement which is not supported by any of the loaded editing plugins', () => {
					const arrangement = { name: 'foo', modelElements: [ 'imageInline' ] };

					expect( normalize(
						[ arrangement ], [], true, false // ImageInlineEditing plugin is not loaded
					) ).to.deep.equal(
						{ arrangements: [], groups: [] }
					);

					sinon.assert.calledOnce( console.warn );
					sinon.assert.calledWithExactly( console.warn,
						testUtils.sinon.match( /^image-style-unsupported/ ),
						{ arrangement: arrangement.name, missingPlugins: [ 'ImageInlineEditing' ] },
						testUtils.sinon.match.string // Link to the documentation
					);
				} );

				it( 'should extend one of default styles if #name found in the default arrangements', () => {
					const arrangement = {
						name: 'alignLeft',
						title: 'customTitle',
						modelElements: [ 'image' ],
						icon: 'inLine',
						isDefault: true,
						className: 'custom-class',
						customProp: 'customProp'
					};

					const normalizedStyles = normalize( [ arrangement ] );

					expect( normalizedStyles.arrangements[ 0 ] ).to.not.equal( DEFAULT_ARRANGEMENTS.alignLeft );
					expect( normalizedStyles ).to.deep.equal(
						{ arrangements: [ { ...arrangement, icon: DEFAULT_ICONS.inLine } ], groups: [] }
					);

					testUtils.sinon.assert.notCalled( console.warn );
				} );
			} );
		} );

		describe( 'group', () => {
			describe( 'set as a string in the editor config', () => {
				it( 'should return the proper default group if #name matches', () => {
					for ( const group in DEFAULT_GROUPS ) {
						const currentGroup = DEFAULT_GROUPS[ group ];
						const normalizedStyles = normalize( allArrangements, [ group ] );

						expect( normalizedStyles.groups[ 0 ] ).to.not.equal( currentGroup );
						expect( normalizedStyles ).to.deep.equal(
							{ arrangements: allArrangements, groups: [ currentGroup ] } );
					}

					testUtils.sinon.assert.notCalled( console.warn );
				} );

				it( 'should warn and ommit the group if a #name not found in default groups', () => {
					expect( normalize(
						allArrangements, [ 'foo' ]
					) ).to.deep.equal(
						{ groups: [], arrangements: allArrangements }
					);

					testUtils.sinon.assert.calledOnce( console.warn );
					testUtils.sinon.assert.calledWithExactly( console.warn,
						testUtils.sinon.match( /^image-style-invalid/ ),
						{ group: { name: 'foo' } },
						testUtils.sinon.match.string // Link to the documentation
					);
				} );
			} );

			describe( 'set as an object in the editor config', () => {
				describe( '#name found in the default groups', () => {
					it( 'should pass through and extend if definition is valid', () => {
						const group = { name: 'wrapText', items: [ 'alignLeft' ], defaultItem: 'alignLeft', customProp: 'customProp' };
						const normalizedStyles = normalize( allArrangements, [ group ] );

						expect( normalizedStyles.groups[ 0 ] ).to.not.equal( DEFAULT_GROUPS.wrapText );
						expect( normalizedStyles ).to.deep.equal(
							{ arrangements: allArrangements, groups: [ { ...DEFAULT_GROUPS.wrapText, ...group } ] }
						);

						testUtils.sinon.assert.notCalled( console.warn );
					} );

					it( 'should warn and ommit if no valid #items are present', () => {
						const group = { name: 'breakText', items: [ 'foo' ] };

						expect( normalize(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledTwice( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group: { ...DEFAULT_GROUPS.breakText, ...group } },
							testUtils.sinon.match.string // Link to the documentation
						);
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ groupItem: 'foo' },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and ommit if no #items are present', () => {
						const group = { name: 'breakText', items: null };

						expect( normalize(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledOnce( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group: { ...DEFAULT_GROUPS.breakText, ...group } },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and ommit if #items are empty', () => {
						const group = { name: 'breakText', items: [] };

						expect( normalize(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledOnce( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group: { ...DEFAULT_GROUPS.breakText, ...group } },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and ommit if #defaultItem is not a string', () => {
						const group = { name: 'breakText', items: [ 'alignLeft' ], defaultItem: { name: 'alignLeft' } };

						expect( normalize(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledOnce( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group: { ...DEFAULT_GROUPS.breakText, ...group } },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and ommit if #defaultItem is not present in items', () => {
						const group = { name: 'breakText', items: [ 'alignLeft' ], defaultItem: 'alignRight' };

						expect( normalize(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledOnce( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group: { ...DEFAULT_GROUPS.breakText, ...group } },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and filter out the items that are not defined as the arrangements', () => {
						expect( normalize(
							allArrangements, [ { name: 'breakText', items: [ 'alignLeft', 'foo', 'bar' ], defaultItem: 'alignLeft' } ]
						) ).to.deep.equal( {
							arrangements: allArrangements,
							groups: [ { ...DEFAULT_GROUPS.breakText, items: [ 'alignLeft' ], defaultItem: 'alignLeft' } ]
						} );

						testUtils.sinon.assert.calledTwice( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ groupItem: 'foo' },
							testUtils.sinon.match.string // Link to the documentation
						);
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ groupItem: 'bar' },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and filter out the items which are not supported by any of the loaded editing plugins', () => {
						expect( normalize(
							[ { name: 'foo', modelElements: [ 'imageInline' ] }, 'alignLeft' ],
							[ { name: 'wrapText', items: [ 'foo', 'alignLeft' ] } ],
							true,
							false // ImageInlineEditing plugin is not loaded
						) ).to.deep.equal( {
							arrangements: [ DEFAULT_ARRANGEMENTS.alignLeft ],
							groups: [ { name: 'wrapText', defaultItem: 'alignLeft', title: 'Wrap text', items: [ 'alignLeft' ] } ]
						} );

						testUtils.sinon.assert.calledTwice( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-unsupported/ ),
							{ arrangement: 'foo', missingPlugins: [ 'ImageInlineEditing' ] },
							testUtils.sinon.match.string // Link to the documentation
						);
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ groupItem: 'foo' },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );
				} );

				describe( '#name not found in the default groups', () => {
					it( 'should pass through if definition is valid', () => {
						const groups = [ { name: 'inline', items: [ 'alignLeft' ], defaultItem: 'alignLeft' } ];

						expect( normalize(
							allArrangements, groups
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups }
						);

						testUtils.sinon.assert.notCalled( console.warn );
					} );

					it( 'should warn and ommit if no valid #items are present', () => {
						const invalidGroup = { name: 'foo', items: [ 'foo' ], defaultItem: 'foo' };

						expect( normalize(
							allArrangements, [ invalidGroup, 'wrapText' ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [ DEFAULT_GROUPS.wrapText ] }
						);

						testUtils.sinon.assert.calledTwice( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group: invalidGroup },
							testUtils.sinon.match.string // Link to the documentation
						);
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ groupItem: 'foo' },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and ommit if no #items are present', () => {
						const group = { name: 'foo' };

						expect( normalize(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledOnce( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and ommit if #items are empty', () => {
						const group = { name: 'foo', items: [] };

						expect( normalize(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledOnce( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and ommit if #defaultItem is not a string', () => {
						const group = { name: 'foo', items: [ 'alignLeft' ], defaultItem: { name: 'alignLeft' } };

						expect( normalize(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledOnce( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and ommit if defaultItem is not defined', () => {
						const group = { name: 'foo', items: [ 'alignLeft' ] };

						expect( normalize(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledOnce( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and ommit if defaultItem is not present in items', () => {
						const group = { name: 'foo', items: [ 'alignLeft' ], defaultItem: [ 'alignRight' ] };

						expect( normalize(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledOnce( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and filter out the items that are not defined as the arrangements', () => {
						expect( normalize(
							allArrangements, [ { name: 'foo', items: [ 'alignLeft', 'foo', 'bar' ], defaultItem: 'alignLeft' } ]
						) ).to.deep.equal( {
							arrangements: allArrangements,
							groups: [ { name: 'foo', items: [ 'alignLeft' ], defaultItem: 'alignLeft' } ]
						} );

						testUtils.sinon.assert.calledTwice( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ groupItem: 'foo' },
							testUtils.sinon.match.string // Link to the documentation
						);
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ groupItem: 'bar' },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and filter out the items which are not supported by any of the loaded editing plugins', () => {
						expect( normalize(
							[ { name: 'foo', modelElements: [ 'imageInline' ] }, 'alignLeft' ],
							[ { name: 'bar', defaultItem: 'alignLeft', items: [ 'foo', 'alignLeft' ] } ],
							true,
							false // ImageInlineEditing plugin is not loaded
						) ).to.deep.equal( {
							arrangements: [ DEFAULT_ARRANGEMENTS.alignLeft ],
							groups: [ { name: 'bar', defaultItem: 'alignLeft', items: [ 'alignLeft' ] } ]
						} );

						testUtils.sinon.assert.calledTwice( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-unsupported/ ),
							{ arrangement: 'foo', missingPlugins: [ 'ImageInlineEditing' ] },
							testUtils.sinon.match.string // Link to the documentation
						);
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ groupItem: 'foo' },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );
				} );

				// it( 'should warn and filter out the items that are not supported by any of the loaded plugins', () => {

				// } );

				// it( 'should use the custom defined icon if it is not a string', () => {
				// 	//expect( imageStyles[ 1 ].icon ).to.equal( rightIcon );
				// } );
			} );
		} );
	} );

	// describe( 'normalizeImageStyles()', () => {
	// 	// Since this function is all about normalizing the config object, make sure it doesn't throw
	// 	// if the config is empty (which may happen e.g. if only ImageStyleUI was loaded).
	//  // It should not happen now.
	// 	it( 'does not throw when given undefined', () => {
	// 		expect( normalizeImageStyles() ).to.deep.equal( [] );
	// 	} );

	// 	describe( 'object format', () => {
	// 		beforeEach( () => {
	// 			imageStyles = normalizeImageStyles( [
	// 				{ name: 'foo', title: 'foo', icon: 'custom', isDefault: true, className: 'foo-class' },
	// 				{ name: 'bar', title: 'bar', icon: 'right', className: 'bar-class' },
	// 				{ name: 'baz', title: 'Side image', icon: 'custom', className: 'baz-class' },

	// 				// Customized default styles.
	// 				{ name: 'full', icon: 'left', title: 'Custom title' }
	// 			] );
	// 		} );

	// 		it( 'should pass through if #name not found in default styles', () => {
	// 			expect( imageStyles[ 0 ] ).to.deep.equal( {
	// 				name: 'foo',
	// 				title: 'foo',
	// 				icon: 'custom',
	// 				isDefault: true,
	// 				className: 'foo-class'
	// 			} );
	// 		} );

	// 		it( 'should use one of default icons if #icon matches', () => {
	// 			expect( imageStyles[ 1 ].icon ).to.equal( rightIcon );
	// 		} );

	// 		it( 'should extend one of default styles if #name matches', () => {
	// 			expect( imageStyles[ 3 ] ).to.deep.equal( {
	// 				name: 'full',
	// 				title: 'Custom title',
	// 				icon: leftIcon,
	// 				isDefault: true
	// 			} );
	// 		} );
	// 	} );

	// } );
} );
