module.exports = {
    setAddMode: function(currentNode) {
    var newId =  "1";
    var newChild = {
        "title": "New Node",
        "description": "Enter Description Here",
        "sharedUsers": [],
        "parent": currentNode.title,
        "children": [],
        "isComplete": false,
        "_id": newId
    }
    if (currentNode.children == null) {
        newchildren = [];
        currentNode.children = newchildren;
    }
    currentNode.children.push(newChild)
},

removeNode: function(d, parent, data) {
    if (parent == null) {
        deleteTree(data, d)
        }
    else {
        var children = [];
    parent.children.forEach(function (child) {
            if (child.id != d.id) {
                children.push(child);
            }
        });
        parent.children = children;
    }
},

deleteTree: function(data, cn) {
    for (var i = 0; i < data.length; i++) {
        if (cn._id == data[i]._id) {
            delete data[i];
        }
    }

    var removingNulls = data.filter(function (a) {
        return a != null;
    });
    data = removingNulls;
    return data;
},

updateNodeInfo: function(cn, Title, Description) {
    cn.title = Title;
    cn.description = Description;
    return cn;
}
}