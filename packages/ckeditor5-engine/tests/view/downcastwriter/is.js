import DowncastWriter from '../../../src/view/downcastwriter';
import Document from '../../../src/view/document';

describe( 'is()', () => {
	let writer;

	before( () => {
		writer = new DowncastWriter( new Document() );
	} );

	it( 'should return true for "downcastWriter"', () => {
		expect( writer.is( 'downcastWriter' ) ).to.be.true;
		expect( writer.is( 'view:downcastWriter' ) ).to.be.true;
	} );

	it( 'should return false for incorrect values', () => {
		expect( writer.is( 'view' ) ).to.be.false;
		expect( writer.is( 'model:downcastWriter' ) ).to.be.false;
		expect( writer.is( 'node' ) ).to.be.false;
		expect( writer.is( 'view:node' ) ).to.be.false;
		expect( writer.is( 'element', 'text' ) ).to.be.false;
	} );
} );
