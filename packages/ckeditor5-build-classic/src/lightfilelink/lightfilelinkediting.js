import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { DowncastWriter } from '@ckeditor/ckeditor5-engine';
import { FileRepository } from 'ckeditor5/src/upload';
import { Notification } from 'ckeditor5/src/ui';

import {
    toWidget,
    viewToModelPositionOutsideModelElement
} from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import LightFileLinkCommand from './lightfilelinkcommand';
import './theme/lightfilelink.css';

export default class LightFileLinkEditing extends Plugin {

    constructor(editor) {
        super(editor);

        // Mappa gli elementi da caricare.
        this._uploadImageElements = new Map();
    }

    init() {
        console.log('LightFileLinkEditing#init() got called');

        const editor = this.editor;
        const doc = editor.model.document;

        this._defineSchema();
        this._defineConverters();

        editor.commands.add('lightfilelink', new LightFileLinkCommand(editor));

        editor.editing.mapper.on(
            'viewToModelPosition',
            viewToModelPositionOutsideModelElement(editor.model, viewElement => viewElement.hasClass('lightfilelink'))
        );

        this.on('uploadComplete', (evt, { imageElement, data }) => {
            const urls = data.urls ? data.urls : data;

            editor.model.change(writer => {
                writer.setAttribute('href', urls.default, imageElement);
            });
        }, { priority: 'low' });


        doc.on('change', () => {
            // Note: Reversing changes to start with insertions and only then handle removals. If it was the other way around,
            // loaders for **all** images that land in the $graveyard would abort while in fact only those that were **not** replaced
            // by other images should be aborted.
            const changes = doc.differ.getChanges({ includeChangesInGraveyard: true }).reverse();
            const fileRepository = editor.plugins.get(FileRepository);
            const insertedImagesIds = new Set();

            for (const entry of changes) {
                if (entry.type == 'insert' && entry.name != '$text') {
                    const item = entry.position.nodeAfter;
                    const isInsertedInGraveyard = entry.position.root.rootName == '$graveyard';

                    const arrayFiles = Array.from(editor.model.createRangeOn(item)).map(value => value.item);

                    for (const imageElement of arrayFiles) {
                        // Check if the image element still has upload id.
                        const uploadId = imageElement.getAttribute('uploadId');

                        if (!uploadId) {
                            continue;
                        }

                        // Check if the image is loaded on this client.
                        const loader = fileRepository.loaders.get(uploadId);

                        if (!loader) {
                            continue;
                        }

                        if (isInsertedInGraveyard) {
                            // If the image was inserted to the graveyard for good (**not** replaced by another image),
                            // only then abort the loading process.
                            if (!insertedImagesIds.has(uploadId)) {
                                loader.abort();
                            }
                        } else {
                            // Remember the upload id of the inserted image. If it acted as a replacement for another
                            // image (which landed in the $graveyard), the related loader will not be aborted because
                            // this is still the same image upload.
                            insertedImagesIds.add(uploadId);

                            // Keep the mapping between the upload ID and the image model element so the upload
                            // can later resolve in the context of the correct model element. The model element could
                            // change for the same upload if one image was replaced by another (e.g. image type was changed),
                            // so this may also replace an existing mapping.
                            this._uploadImageElements.set(uploadId, imageElement);

                            if (loader.status == 'idle') {
                                // If the image was inserted into content and has not been loaded yet, start loading it.
                                this._uploadFile(loader);
                            }
                        }
                    }
                }
            }
        });
    }

    _uploadFile(loader) {
        const editor = this.editor;
        const t = editor.locale.t;
        const model = editor.model;
        const imageUploadElements = this._uploadImageElements;
        const notification = editor.plugins.get( Notification );
        const fileRepository = editor.plugins.get(FileRepository);

        // Do not throw when upload adapter is not set. FileRepository will log an error anyway.
        if (!loader) {
            return;
        }

        loader.upload().then((data) => {
            console.log("UPLOAD THEN : ", data);
            if (data.default) {
                const imageElement = imageUploadElements.get(loader.id);
                this.fire('uploadComplete', { data, imageElement });
            }

            clean();
        }, (error) => {
            if (error === 'aborted') {
                console.log('ABORT UPLOAD LIGHT FILE : ', error);
            } else {
                console.log('ERROR UPLOAD LIGHT FILE : ', error);
            }

            if ( loader.status !== 'error' && loader.status !== 'aborted' ) {
                throw error;
            }

            // Might be 'aborted'.
            if ( loader.status == 'error' && error ) {
                notification.showWarning( error, {
                    title: t( 'Upload failed' ),
                    namespace: 'upload'
                } );
            }

            // Permanently remove image from insertion batch.
            model.enqueueChange( 'transparent', writer => {
                writer.remove( imageUploadElements.get( loader.id ) );
            } );

            clean();

        });

        function clean() {
			model.enqueueChange( 'transparent', writer => {
				const imageElement = imageUploadElements.get( loader.id );

				writer.removeAttribute( 'uploadId', imageElement );
				writer.removeAttribute( 'uploadStatus', imageElement );

				imageUploadElements.delete( loader.id );
			} );

			fileRepository.destroyLoader( loader );
		}
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register('lightfilelink', {
            // Allow wherever text is allowed:
            allowWhere: '$text',

            isInline: true,

            // The inline widget is self-contained so it cannot be split by the caret and can be selected:
            isObject: true,

            // The inline widget can have the same attributes as text (for example linkHref, bold).
            allowAttributesOf: '$text',

            allowAttributes: ['link', 'description', 'uploadId']
        });
    }

    _defineConverters() {
        const conversion = this.editor.conversion;

        conversion.for('upcast').elementToElement({
            view: {
                name: 'a',
                classes: ['lightfilelink']
            },
            model: (viewElement, { writer: modelWriter }) => {

                const link = viewElement.getAttribute('href');
                const description = viewElement.getChild(0).data;

                return modelWriter.createElement('lightfilelink', { link, description });
            }
        }).attributeToAttribute({
            view: {
                name: 'a',
                key: 'uploadId'
            },
            model: 'uploadId'
        });

        conversion.for('editingDowncast').elementToElement({
            model: 'lightfilelink',
            view: (modelItem, { writer: viewWriter }) => {
                const widgetElement = createLightFileLinkView(modelItem, viewWriter);

                return toWidget(widgetElement, viewWriter);
            }
        });

        conversion.for('dataDowncast').elementToElement({
            model: 'lightfilelink',
            view: (modelItem, { writer: viewWriter }) => createLightFileLinkView(modelItem, viewWriter)
        });

        conversion.for('downcast').add( dispatcher => dispatcher.on( 'attribute:href:lightfilelink', ( evt, data, conversionApi ) => {
            const element = data.item;
    
            // Mark element as consumed by conversion.
            conversionApi.consumable.consume( data.item, evt.name );
    
            // Get mapped view element to update.
            const viewElement = conversionApi.mapper.toViewElement( element );
        
            // Set current content
            conversionApi.writer.setAttribute(data.attributeKey, data.attributeNewValue, viewElement)
        } ) );
        
        /* .attributeToAttribute({
            model: 'lightfilelink',
            view: 'link',
            converterPriority: 'high'
        }); */


        function createLightFileLinkView(modelItem, viewWriter) {
            const link = modelItem.getAttribute('link');
            const description = modelItem.getAttribute('description') || link;

            const lightFileLinkView = viewWriter.createContainerElement('a', {
                class: 'lightfilelink'
            }, {
                isAllowedInsideAttributeElement: true
            });

            const innerText = viewWriter.createText(description);
            viewWriter.setAttribute('href', link, lightFileLinkView);
            viewWriter.setAttribute('target', '_blank', lightFileLinkView);
            viewWriter.insert(viewWriter.createPositionAt(lightFileLinkView, 0), innerText);

            return lightFileLinkView;
        }
    }

}