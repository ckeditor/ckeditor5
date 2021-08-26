import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';

export default class LocalImage extends Plugin {
    init() {
        const editor = this.editor;

        console.log('Editor plugin init..', this.editor.config.get('localImage'));

        editor.ui.componentFactory.add( 'localImage', locale => {
            const view = new ButtonView( locale );

            view.set( {
                label: 'Insert image',
                icon: imageIcon,
                tooltip: true
            } );

            // Callback executed once the image is clicked.
            view.on( 'execute', () => {
                const imageUrl = prompt( 'Enter image URL' );
                const localImage = editor.config.get('localImage');
                if (localImage) {
                    localImage.execute();
                }
                if( imageUrl.length > 0) {
                    editor.model.change( writer => {
                        const imageElement = writer.createElement( 'imageBlock', {
                            src: imageUrl
                        } );
    
                        // Insert the image in the current selection location.
                        editor.model.insertContent( imageElement, editor.model.document.selection );
                    } );
                }

            } );

            return view;
        } );
    }
}