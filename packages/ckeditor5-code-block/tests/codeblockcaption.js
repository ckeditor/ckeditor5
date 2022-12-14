import CodeblockCaption from '../src/codeblockcaption';
import CodeblockCaptionUI from '../src/codeblockcaption/codeblockcaptionui';
import CodeblockCaptionEditing from '../src/codeblockcaption/codeblockcaptionediting';


describe( 'CodeblockCaption', () => {
    it( 'should require CodeblockCaptionUI and CodeblockCaptionEditing plugins', () => {
        expect( CodeblockCaption.requires ).to.have.members( [ CodeblockCaptionUI, CodeblockCaptionEditing ] );
    } );
    
    it( 'should define pluginName', () => {
        expect( CodeblockCaption.pluginName ).to.equal( 'CodeblockCaption' );
    } );
} );