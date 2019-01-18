## Documentation
```html
This package contains CKEditor 5 features allowing to group multiple toolbar items in a dropdown list using any custom ckeditor5 build

1. Add "toolbargroup" to the toolbar.items array as shown below
2. add a toolbarGroup object to the editor.config and set the required parameters.

The toolbarGroup accepts an option array with a model and title property respectively.

Values for the model is same as toolbar.items array, while the values for the title is optional. if you want a custom title, then you can set that option as desired

An example is shown below
```

```js 
import ToolbarGroup from '@ckeditor/ckeditor5-toolbar-group/toolbargroup'; 
    
	Editor.create( document.querySelector( '#editor' ),{
	        
		     toolbar: {
                items: [ 'bold', 'italic','underline','highlight','toolbargroup']
            },
            toolbarGroup: {
                options: [
                    { model: 'paragraph', title: 'Paragraph' },
                    { model: 'heading1',  title: 'Heading 1' },
                    { model: 'heading2', title: 'Heading 2' },
                    { model: 'link'},
                ]
            },
		} )
		.then(...)
		.catch(...);
```