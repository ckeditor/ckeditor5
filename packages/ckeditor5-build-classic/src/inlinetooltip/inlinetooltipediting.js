import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { DowncastWriter } from '@ckeditor/ckeditor5-engine';

import {
    toWidget,
    viewToModelPositionOutsideModelElement
} from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import InlineTooltipCommand from './inlinetooltipcommand';
import './theme/inlinetooltip.css';

export default class InlineTooltipEditing extends Plugin {
    init() {
        console.log('InlineTooltipEditing#init() got called');

        this._defineSchema();
        this._defineConverters();

        this.editor.commands.add( 'inlinetooltip', new InlineTooltipCommand( this.editor ) );

        this.editor.editing.mapper.on(
            'viewToModelPosition',
            viewToModelPositionOutsideModelElement( this.editor.model, viewElement => viewElement.hasClass( 'inlinetooltip' ) )
        );
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register('inlinetooltip', {
            // Allow wherever text is allowed:
            allowWhere: '$text',

            // The placeholder will act as an inline node:
            isInline: true,

            // The inline widget is self-contained so it cannot be split by the caret and can be selected:
            isObject: true,

            // The inline widget can have the same attributes as text (for example linkHref, bold).
            allowAttributesOf: '$text',

            // The placeholder can have many types, like date, name, surname, etc:
            allowAttributes: ['tooltip', 'text']
        });
    }

    _defineConverters() {
        const conversion = this.editor.conversion;

        conversion.for('upcast').elementToElement({
            view: {
                name: 'a',
                classes: ['inlinetooltip']
            },
            model: (viewElement, { writer: modelWriter }) => {

                const tooltip = viewElement.getChild(0).data.slice(1, -1);
                const text = viewElement.getChild(0).data;

                return modelWriter.createElement('inlinetooltip', { tooltip, text });
            }
        });

        conversion.for('editingDowncast').elementToElement({
            model: 'inlinetooltip',
            view: (modelItem, { writer: viewWriter }) => {
                const widgetElement = createInlineTooltipView(modelItem, viewWriter);

                return toWidget(widgetElement, viewWriter);
            }
        });

        conversion.for('dataDowncast').elementToElement({
            model: 'inlinetooltip',
            view: (modelItem, { writer: viewWriter }) => createInlineTooltipView(modelItem, viewWriter)
        });


        function createInlineTooltipView(modelItem, viewWriter) {
            const tooltip = modelItem.getAttribute('tooltip');
            const text = modelItem.getAttribute('text');

            const inlineTooltipView = viewWriter.createContainerElement('a', {
                class: 'inlinetooltip'
            }, {
                isAllowedInsideAttributeElement: true
            });

            const innerText = viewWriter.createText(text);
            // Creare il tooltip
            viewWriter.insert(viewWriter.createPositionAt(inlineTooltipView, 0), innerText);

            return inlineTooltipView;
        }
    }

}