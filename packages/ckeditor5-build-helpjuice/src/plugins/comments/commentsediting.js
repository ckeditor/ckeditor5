import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import InsertCommentCommand from './insertcommentcommand';
import RemoveCommentCommand from './removecommentcommand';

export default class CommentsEditing extends Plugin {
    init() {
        this._defineSchema();
        this._defineConverters();

        this.editor.commands.add('insertComment', new InsertCommentCommand(this.editor))
        this.editor.commands.add('removeComment', new RemoveCommentCommand(this.editor))
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.extend('$text', { allowAttributes: 'comment' })
    }

    _defineConverters() {
        const conversion = this.editor.conversion

        conversion.for('upcast').elementToAttribute({
            view: {
                name: 'i',
                classes: ['helpjuice-thread'],
                attributes: ['data-id']
            },
            model: {
                key: 'comment',
                value: viewElement => viewElement.getAttribute('data-id')
            }
        })


        conversion.for('downcast').attributeToElement({
            model: 'comment',
            view: (value, { writer }) => {
                return writer.createAttributeElement('i', {
                    class: ['helpjuice-thread'],
                    'data-id': value
                })
            }
        })
    }
}
