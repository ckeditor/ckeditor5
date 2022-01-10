## Description
Main purpose of this tool is to process editor's model to ASCII art that can be used in automatic tests so they are more readable.
It also allows to process ASCII art back to model data. You can provide your own editor's model/ASCII art to the input and parse it or you can create list in an editor and get model/ASCII from it.

### ASCII Tree

```
* A
  B
  # C{id:50}
    # D
* E
* F

* - bulleted list
# - numbered list
---
{id:fixedId} - force given id as listItemId
attribute in model.
---
Each indentation is two spaces before list
type.
```

## Input
Input should be valid editor's model or an ASCII art created in this tool. Processing function tries to be a little bit smart (naively) and cleans input so it can be copied and pasted from code - it will get rid of spaces, new lines and other characters not allowed in model.

## Editor
Editor allows to inspect how the processed data renders in the editor. You can also create your list in the editor and create model/ASCII from it with 'Process editor model' button.

## Output
### When input is model
It should create ASCII tree as a code ready to be pasted in tests.
### When input is ASCII
It should create correct editor's model.
