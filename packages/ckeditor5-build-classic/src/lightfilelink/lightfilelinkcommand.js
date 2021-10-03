import Command from '@ckeditor/ckeditor5-core/src/command';
import { FileRepository } from 'ckeditor5/src/upload';

export default class LightFileLinkCommand extends Command {

    execute({ file }) {
        const editor = this.editor;
        const selection = editor.model.document.selection;

        const fileRepository = editor.plugins.get(FileRepository);
        const loader = fileRepository.createLoader(file);

        // Do not throw when upload adapter is not set. FileRepository will log an error anyway.
        if (!loader) {
            return;
        }

        let description = file.name;

        const range = selection.getFirstRange();

        if (range) {
            for (const item of range.getItems()) {
                console.log(item.data) //return the selected text
                description = item.data;
            }
        }

        editor.model.change(writer => {
            this.lightFileLinkElement = writer.createElement('lightfilelink', {
                ...Object.fromEntries(selection.getAttributes()),
                link: "link",
                description,
                uploadId: loader.id
            });

            editor.model.insertContent(this.lightFileLinkElement);

            // Put the selection on the inserted element.
            writer.setSelection(this.lightFileLinkElement, 'on');
        });
        
        /* loader.upload().then((data) => {
            console.log("UPLOAD THEN : ", data);
            if (data.default) {
                editor.model.change(writer => {
                    console.log('SONO NEL WRITER');
                    writer.setAttribute('href', data.default, this.lightFileLinkElement);

                });
            }
        }, (error) => {
            if (error === 'aborted') {
                console.log('ABORT UPLOAD LIGHT FILE : ', error);
            } else {
                console.log('ERROR UPLOAD LIGHT FILE : ', error);
            }

        }); */
    }

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;

        const isAllowed = model.schema.checkChild(selection.focus.parent, 'lightfilelink');

        this.isEnabled = isAllowed;
    }
}