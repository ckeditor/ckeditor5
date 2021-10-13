/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import DataSchema from '../src/dataschema';

describe( 'DataSchema', () => {
	let editor, dataSchema;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ DataSchema ]
			} )
			.then( newEditor => {
				editor = newEditor;

				dataSchema = editor.plugins.get( DataSchema );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'registerInlineElement()', () => {
		it( 'should register proper definition', () => {
			dataSchema.registerInlineElement( { model: 'htmlDef', view: 'def' } );

			const result = dataSchema.getDefinitionsForView( 'def' );

			expect( Array.from( result ) ).to.deep.equal( [ {
				model: 'htmlDef',
				view: 'def',
				isInline: true
			} ] );
		} );

		it( 'should include attribute properties', () => {
			dataSchema.registerInlineElement( {
				model: 'htmlDef',
				view: 'def',
				attributeProperties: {
					copyOnEnter: true
				}
			} );

			const result = dataSchema.getDefinitionsForView( 'def' );

			expect( Array.from( result ) ).to.deep.equal( [ {
				model: 'htmlDef',
				view: 'def',
				attributeProperties: {
					copyOnEnter: true
				},
				isInline: true
			} ] );
		} );

		it( 'should preserve custom priority', () => {
			dataSchema.registerInlineElement( { model: 'htmlDef', view: 'def', priority: 7 } );

			const result = dataSchema.getDefinitionsForView( 'def' );

			expect( Array.from( result ) ).to.deep.equal( [ {
				model: 'htmlDef',
				view: 'def',
				priority: 7,
				isInline: true
			} ] );
		} );
	} );

	describe( 'registerBlockElement()', () => {
		const fakeDefinitions = [
			{
				view: 'def1',
				model: 'htmlDef1',
				allowChildren: [ 'htmlDef2', 'htmlDef3' ],
				modelSchema: {
					inheritAllFrom: '$block'
				}
			},
			{
				view: 'def2',
				model: 'htmlDef2',
				modelSchema: {
					inheritAllFrom: 'htmlDef1'
				}
			},
			{
				view: 'def3',
				model: 'htmlDef3',
				modelSchema: {
					inheritTypesFrom: 'htmlDef2'
				}
			},
			{
				view: 'def4',
				model: 'htmlDef4',
				modelSchema: {
					allowWhere: 'htmlDef3'
				}
			},
			{
				view: 'def5',
				model: 'htmlDef5',
				modelSchema: {
					allowContentOf: 'htmlDef4'
				}
			},
			{
				view: 'def6',
				model: 'htmlDef6',
				modelSchema: {
					allowAttributesOf: 'htmlDef5'
				}
			}
		];

		it( 'should allow registering schema with proper definition', () => {
			dataSchema.registerBlockElement( getFakeDefinitions( 'def1' )[ 0 ] );

			const result = dataSchema.getDefinitionsForView( 'def1' );

			expect( Array.from( result ) ).to.deep.equal( getExpectedFakeDefinitions( 'def1' ) );
		} );

		it( 'should allow resolving definitions by view name (string)', () => {
			registerMany( dataSchema, fakeDefinitions );

			const result = dataSchema.getDefinitionsForView( 'def2' );

			expect( Array.from( result ) ).to.deep.equal( getExpectedFakeDefinitions( 'def2' ) );
		} );

		it( 'should allow resolving definitions by view name (RegExp)', () => {
			registerMany( dataSchema, fakeDefinitions );

			const result = dataSchema.getDefinitionsForView( /^(def1|def2)$/ );

			expect( Array.from( result ) ).to.deep.equal( getExpectedFakeDefinitions( 'def1', 'def2' ) );
		} );

		it( 'should allow resolving definitions by view name including references (inheritAllFrom)', () => {
			registerMany( dataSchema, fakeDefinitions );

			const result = dataSchema.getDefinitionsForView( 'def2', true );

			expect( Array.from( result ) ).to.deep.equal( getExpectedFakeDefinitions( 'def1', 'def2' ) );
		} );

		it( 'should allow resolving definitions by view name including references (inheritTypes)', () => {
			registerMany( dataSchema, fakeDefinitions );

			const result = dataSchema.getDefinitionsForView( 'def3', true );

			expect( Array.from( result ) ).to.deep.equal( getExpectedFakeDefinitions( 'def1', 'def2', 'def3' ) );
		} );

		it( 'should allow resolving definitions by view name including references (allowWhere)', () => {
			registerMany( dataSchema, fakeDefinitions );

			const result = dataSchema.getDefinitionsForView( 'def4', true );

			expect( Array.from( result ) ).to.deep.equal( getExpectedFakeDefinitions( 'def1', 'def2', 'def3', 'def4' ) );
		} );

		it( 'should allow resolving definitions by view name including references (allowContentOf)', () => {
			registerMany( dataSchema, fakeDefinitions );

			const result = dataSchema.getDefinitionsForView( 'def5', true );

			expect( Array.from( result ) ).to.deep.equal( getExpectedFakeDefinitions( 'def1', 'def2', 'def3', 'def4', 'def5' ) );
		} );

		it( 'should allow resolving definitions by view name including references (allowAttributesOf)', () => {
			registerMany( dataSchema, fakeDefinitions );

			const result = dataSchema.getDefinitionsForView( 'def6', true );

			expect( Array.from( result ) ).to.deep.equal( getExpectedFakeDefinitions( 'def1', 'def2', 'def3', 'def4', 'def5', 'def6' ) );
		} );

		it( 'should return nothing for invalid view name', () => {
			registerMany( dataSchema, fakeDefinitions );

			const result = dataSchema.getDefinitionsForView( null );

			expect( result.size ).to.equal( 0 );
		} );

		function registerMany( dataSchema, definitions ) {
			definitions.forEach( def => dataSchema.registerBlockElement( def ) );
		}

		function getFakeDefinitions( ...viewNames ) {
			return fakeDefinitions.filter( def => viewNames.includes( def.view ) );
		}

		function getExpectedFakeDefinitions( ...viewNames ) {
			// It's expected that definition will include `isBlock` property.
			return getFakeDefinitions( ...viewNames ).map( def => ( { ...def, isBlock: true } ) );
		}
	} );

	describe( 'extendBlockElement()', () => {
		it( 'should extend schema with new properties', () => {
			dataSchema.registerBlockElement( {
				view: 'viewName',
				model: 'modelName'
			} );

			dataSchema.extendBlockElement( {
				model: 'modelName',
				paragraphLikeModel: 'htmlDivParagraph',
				modelSchema: {
					isSelectable: true
				}
			} );

			expect( Array.from( dataSchema.getDefinitionsForView( 'viewName' ) ) ).to.deep.equal( [ {
				model: 'modelName',
				view: 'viewName',
				paragraphLikeModel: 'htmlDivParagraph',
				modelSchema: {
					isSelectable: true
				},
				isBlock: true
			} ] );
		} );

		it( 'should append items to array', () => {
			dataSchema.registerBlockElement( {
				view: 'viewName',
				model: 'modelName',
				modelSchema: {
					allowChildren: [ 'paragraph' ]
				}
			} );

			dataSchema.extendBlockElement( {
				model: 'modelName',
				modelSchema: {
					allowChildren: [ 'htmlA' ],
					allowIn: [ 'htmlDiv' ]
				}
			} );

			expect( Array.from( dataSchema.getDefinitionsForView( 'viewName' ) ) ).to.deep.equal( [ {
				model: 'modelName',
				view: 'viewName',
				modelSchema: {
					allowChildren: [ 'paragraph', 'htmlA' ],
					allowIn: [ 'htmlDiv' ]
				},
				isBlock: true
			} ] );
		} );

		it( 'should register new schema if not registered already', () => {
			dataSchema.extendBlockElement( {
				model: 'modelName',
				view: 'viewName',
				paragraphLikeModel: 'htmlDivParagraph',
				modelSchema: {
					isSelectable: true
				}
			} );

			expect( Array.from( dataSchema.getDefinitionsForView( 'viewName' ) ) ).to.deep.equal( [ {
				model: 'modelName',
				view: 'viewName',
				paragraphLikeModel: 'htmlDivParagraph',
				modelSchema: {
					isSelectable: true
				},
				isBlock: true
			} ] );
		} );

		it( 'should not modify existing schema in-place', () => {
			dataSchema.registerBlockElement( {
				view: 'viewName',
				model: 'modelName'
			} );

			const originalSchema = Array.from( dataSchema.getDefinitionsForView( 'viewName' ) )[ 0 ];

			dataSchema.extendBlockElement( {
				model: 'modelName',
				paragraphLikeModel: 'htmlDivParagraph',
				modelSchema: {
					isSelectable: true
				}
			} );

			expect( originalSchema ).to.deep.equal( {
				model: 'modelName',
				view: 'viewName',
				isBlock: true
			} );
		} );
	} );

	describe( 'extendInlineElement()', () => {
		it( 'should extend schema with new properties', () => {
			dataSchema.registerInlineElement( {
				view: 'viewName',
				model: 'modelName'
			} );

			dataSchema.extendInlineElement( {
				model: 'modelName',
				priority: 1,
				modelSchema: {
					isSelectable: true
				}
			} );

			expect( Array.from( dataSchema.getDefinitionsForView( 'viewName' ) ) ).to.deep.equal( [ {
				model: 'modelName',
				view: 'viewName',
				priority: 1,
				modelSchema: {
					isSelectable: true
				},
				isInline: true
			} ] );
		} );

		it( 'should append items to array', () => {
			dataSchema.registerInlineElement( {
				view: 'viewName',
				model: 'modelName',
				modelSchema: {
					allowChildren: [ 'htmlSpan' ]
				}
			} );

			dataSchema.extendInlineElement( {
				model: 'modelName',
				modelSchema: {
					allowChildren: [ 'htmlA' ],
					allowIn: [ 'htmlDiv' ]
				}
			} );

			expect( Array.from( dataSchema.getDefinitionsForView( 'viewName' ) ) ).to.deep.equal( [ {
				model: 'modelName',
				view: 'viewName',
				modelSchema: {
					allowChildren: [ 'htmlSpan', 'htmlA' ],
					allowIn: [ 'htmlDiv' ]
				},
				isInline: true
			} ] );
		} );

		it( 'should register new schema if not registered already', () => {
			dataSchema.extendInlineElement( {
				model: 'modelName',
				view: 'viewName',
				priority: 1,
				modelSchema: {
					isSelectable: true
				}
			} );

			expect( Array.from( dataSchema.getDefinitionsForView( 'viewName' ) ) ).to.deep.equal( [ {
				model: 'modelName',
				view: 'viewName',
				priority: 1,
				modelSchema: {
					isSelectable: true
				},
				isInline: true
			} ] );
		} );

		it( 'should not modify existing schema in-place', () => {
			dataSchema.registerInlineElement( {
				view: 'viewName',
				model: 'modelName'
			} );

			const originalSchema = Array.from( dataSchema.getDefinitionsForView( 'viewName' ) )[ 0 ];

			dataSchema.extendInlineElement( {
				model: 'modelName',
				priority: 1,
				modelSchema: {
					isSelectable: true
				}
			} );

			expect( originalSchema ).to.deep.equal( {
				model: 'modelName',
				view: 'viewName',
				isInline: true
			} );
		} );
	} );
} );
