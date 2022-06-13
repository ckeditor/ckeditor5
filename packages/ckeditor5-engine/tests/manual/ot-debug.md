# OperationTransform Debug

Operations and transformations are logged in the console.

Format of the log:
```
<paragraph>a</paragraph><paragraph>b</paragraph>
    delete
        apply merge
            source 1,0
            howMany 1
            target 0,1
            gy pos 0 gy
<paragraph>ab</paragraph>  <- Model
    delete                 <- Command
        apply remove       <- Operation  
            source 0,0
            howMany 2
            gy pos 0 gy
<paragraph></paragraph>
    undo
        apply reinsert
            target 0,0
            howMany 2
            gy pos 0 gy
<paragraph>ab</paragraph>
    undo
        transform split
            split pos 0,1
            howMany 1
            ins pos 1
            gy pos 0 gy
        by remove
            source 0,0
            howMany 2
            gy pos 0 gy
        transform split
            split pos 1 gy
            howMany 1
            ins pos 1
            gy pos 2 gy
        by reinsert
            target 0,0
            howMany 2
            gy pos 0 gy
        apply split
            split pos 0,1
            howMany 1
            ins pos 1
            gy pos 0 gy
```
