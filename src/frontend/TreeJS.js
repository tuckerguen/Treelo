
//Hiddes the return from focus button upon startup
$("#return-focus").hide();

//Code for turning the title and description text into textareas upon click
window.onload = function () {
    document.getElementById('modal-title').onclick = function (event) {
        var span, input, text;
        event = event || window.event;
        span = event.target || event.srcElement;
        if (span && span.tagName.toUpperCase() === "SPAN") {
            span.style.display = "none";
            text = span.innerHTML;
            input = document.createElement("input");
            input.type = "text";
            input.value = text;
            input.size = Math.max(text.length / 4 * 3, 4);
            span.parentNode.insertBefore(input, span);
            input.focus();
            input.onblur = function () {
                span.parentNode.removeChild(input);
                span.innerHTML = input.value == "" ? "&nbsp;" : input.value;
                span.style.display = "";
            };
        }
    };
    document.getElementById('modal-description').onclick = function (event) {
        var span, input, text;
        event = event || window.event;
        span = event.target || event.srcElement;
        if (span && span.tagName.toUpperCase() === "SPAN") {
            span.style.display = "none";
            text = span.innerHTML;
            input = document.createElement("input");
            input.type = "text";
            input.value = text;
            input.size = Math.max(text.length / 4 * 3, 4);
            span.parentNode.insertBefore(input, span);
            input.focus();
            input.onblur = function () {
                span.parentNode.removeChild(input);
                span.innerHTML = input.value == "" ? "&nbsp;" : input.value;
                span.style.display = "";
            };
        }
    };
};

//Making a new tree from the form in HTML taking input and due date
function makeNewData() {
    var Title =
        document.getElementById("titleText").value;
    var Description =
        document.getElementById("description").value;
    if (Title != "" && Description != "") {
        var data = [{
            "title": Title,
            "parent": null,
            "description": Description,
            "children": [],
            "_id": Math.random() + ""
        }]
        treeData.push(data[0])
        displayTree(data[0])
        document.getElementById("mySidenav").innerHTML += "<br><button id = " + '"' + data[0]._id + '"' + "onClick = findTree()>" + data[0].title + "</button>";

    }
}

//Originally set the nodeView type to collapse upon single click
var nodeView = 'Collapse';
//Used to find the tree to render based on tree ID (Used for array of buttons to determine action)
var foundTreeForRender;
//the current node users interact with
var currentNode;

//fake tree data
//This is where ajax query for data will be using username given on login
var treeData = [
    {
        "sharedUsers": [
            "janedoe@gmail.com",
            "benbaierl@case.edu"
        ],
        "children": [
            {
                "title": "Child1",
                "description": "child 1 description",
                "dueDate": "",
                "owner": "johndoe@gmail.com",
                "sharedUsers": [
                    "janedoe@gmail.com",
                    "benbaierl@case.edu"
                ],
                "isComplete": false,
                "isOverdue": false,
                "children": []
            }
        ],
        "_id": "5daf8c0d73afd05a10c15331",
        "dueDate": null,
        "title": "Test title 1",
        "description": "test description",
        "owner": "johndoe@gmail.com",
        "isComplete": false,
        "isOverdue": false,
        "__v": 0
    },
    {
        "sharedUsers": [
            "janedoe@gmail.com",
            "benbaierl@case.edu"
        ],
        "children": [
            {
                "title": "Child1",
                "description": "child 2 description",
                "dueDate": "",
                "owner": "johndoe@gmail.com",
                "sharedUsers": [
                    "janedoe@gmail.com",
                    "benbaierl@case.edu"
                ],
                "isComplete": false,
                "isOverdue": false,
                "children": [{
                    "sharedUsers": [
                        "janedoe@gmail.com",
                        "benbaierl@case.edu"
                    ],
                    "children": [
                        {
                            "title": "Child1",
                            "description": "child 2 description",
                            "dueDate": "",
                            "owner": "johndoe@gmail.com",
                            "sharedUsers": [
                                "janedoe@gmail.com",
                                "benbaierl@case.edu"
                            ],
                            "isComplete": false,
                            "isOverdue": false,
                            "children": []
                        },
                        {
                            "sharedUsers": [
                                "janedoe@gmail.com",
                                "benbaierl@case.edu"
                            ],
                            "children": [
                                {
                                    "title": "Child1",
                                    "description": "child 2 description",
                                    "dueDate": "",
                                    "owner": "johndoe@gmail.com",
                                    "sharedUsers": [
                                        "janedoe@gmail.com",
                                        "benbaierl@case.edu"
                                    ],
                                    "isComplete": false,
                                    "isOverdue": false,
                                    "children": []
                                }
                            ],
                            "_id": "5daf8c0d73afd051",
                            "dueDate": null,
                            "title": "Test title 2",
                            "description": "test description",
                            "owner": "johndoe@gmail.com",
                            "isComplete": false,
                            "isOverdue": false,
                            "__v": 0
                        }
                    ],
                    "_id": "5daf8c0d73afd051",
                    "dueDate": null,
                    "title": "Test title 2",
                    "description": "test description",
                    "owner": "johndoe@gmail.com",
                    "isComplete": false,
                    "isOverdue": false,
                    "__v": 0
                }]
            }
        ],
        "_id": "5daf8c0d73afd051",
        "dueDate": null,
        "title": "Test title 2",
        "description": "test description",
        "owner": "johndoe@gmail.com",
        "isComplete": false,
        "isOverdue": false,
        "__v": 0
    },
    {
        "sharedUsers": [
            "janedoe@gmail.com",
            "benbaierl@case.edu"
        ],
        "children": [
            {
                "title": "Child1",
                "description": "child 1 description",
                "dueDate": "",
                "owner": "johndoe@gmail.com",
                "sharedUsers": [
                    "janedoe@gmail.com",
                    "benbaierl@case.edu"
                ],
                "isComplete": false,
                "isOverdue": false,
                "children": [{
                    "title": "Child1",
                    "description": "child 1 description",
                    "dueDate": "",
                    "owner": "johndoe@gmail.com",
                    "sharedUsers": [
                        "janedoe@gmail.com",
                        "benbaierl@case.edu"
                    ],
                    "isComplete": false,
                    "isOverdue": false,
                    "children": []
                }]
            }
        ],
        "_id": "5daf8c0d73afd05a10c15331asdfsadf",
        "dueDate": null,
        "title": "Test title 3",
        "description": "test description",
        "owner": "johndoe@gmail.com",
        "isComplete": false,
        "isOverdue": false,
        "__v": 0
    }
];

//finds tree based on ID
function findTree(d) {
    treeData.forEach(findMatchingID)
    displayTree(foundTreeForRender);
}
function findMatchingID(item, index) {
    if (item._id == event.target.id) {
        foundTreeForRender = item;
    }
}

//for each tree in treeData
treeData.forEach(myFunction);

function myFunction(item, index) {
    document.getElementById("mySidenav").innerHTML += "<br><button id = " + '"' + item._id + '"' + "onClick = findTree()>" + item.title + "</button>";
}

// ************** Generate the tree diagram  *****************
var margin = { top: 50, right: 120, bottom: 20, left: 600 },
    width = 1000 - margin.right - margin.left,
    height = 750 - margin.top - margin.bottom;

var i = 0;

var duration = 750;

var tree = d3.layout.tree()
    .size([height, width]);

var diagonal = d3.svg.diagonal()
    .projection(function (d) { return [d.x, d.y]; });

var svg = d3.select("#tree-div").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .attr("overflow", "visible")
    // .attr("viewBox", "0 0 500 500")
    // .attr("preserveAspectRatio", xMinYMid)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

root = treeData[0];
root.x0 = height / 2;
root.y0 = 0;

update(root);

d3.select(self.frameElement).style("height", "500px");

function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) { d.y = d.depth * 100; });

    // Declare the nodesâ€¦
    var node = svg.selectAll("g.node")
        .data(nodes, function (d) { return d.id || (d.id = ++i); });

    // Enter the nodes.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + d.y + "," + d.x + ")";
        })
        .on("click", dblclick)
        .on("dblclick", click)
        .on("mouseover", function (d) {
            var g = d3.select(this); // The node
            // The class is used to remove the additional text later
          //  alert(d.title)
            var info = g.append('text')
                .classed('info', true)
                .attr('x', 20)
                .attr('y', 10)
                .text(d.title);
        })
        .on("mouseout", function () {
            // Remove the info text on mouse out.
            d3.select(this).select('text.info').remove()
        });

    nodeEnter.append("circle")
        .attr("r", 10)
        .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });
    nodeEnter.append("text")
        .attr("y", function (d) {
            return d.children || d._children ? -18 : 18;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function (d) { return d.title; })
        .style("fill-opacity", 1);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

    nodeUpdate.select("circle")
        .attr("r", 10)
        .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) { return "translate(" + source.x + "," + source.y + ")"; })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);


    // Declare the linksâ€¦
    var link = svg.selectAll("path.link")
        .data(links, function (d) { return d.target.id; });

    // Enter the links.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function (d) {
            var o = { x: source.x0, y: source.y0 };
            return diagonal({ source: o, target: o });
        })

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function (d) {
            var o = { x: source.x, y: source.y };
            return diagonal({ source: o, target: o });
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });

    // d3.select(svg)
    //     .attr("height", height + 50)
    //     .attr("width", width + 50);

}

function click(d) {
    //alert(d.name);
    //var item = findDescription(treeData, d.name);
    document.getElementById("description-span").innerHTML = "  Description:<br/>   " + d.description;
    document.getElementById("title-span").innerHTML = d.title;
    currentNode = d;
    $('#myModal').modal("toggle");
}

// Toggle children on click.
function dblclick(d) {

    if (nodeView === 'Collapse') {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }
    else if (nodeView === 'Add') {
        var newChild = {
            "title": "New Node",
            "description": "Enter Description Here",
            "parent": d.title,
            "children": [],
            "_id": Math.random() + ""
        }
        if (d.children == null) {
            newchildren = [];
            d.children = newchildren;
        }
        d.children.push(newChild)
        // nodeView = 'Collapse';
        update(d);
    }
    else if (nodeView === 'Delete') {
        currentNode = d;
        removeNode();
        nodeView = 'Collapse';
    }
    else if (nodeView === 'Focus') {
        currentNode = d;
        displayTree(d)
        $("#return-focus").show();
        nodeView = 'Collapse';
    }
}

function removeNode(d) {
    if (currentNode.parent == null) {
        alert('here we are')
        deleteTree()
        alert(currentNode._id);
        $("#" + currentNode._id).hide();
        //update info for removing Tree
    }
    // alert('Deleted ' + currentNode.title)
    //alert("made it here")
    //this is the links target node which you want to remove
    var target = currentNode;
    //make new set of children
    var children = [];
    //iterate through the children 
    target.parent.children.forEach(function (child) {
        if (child.id != target.id) {
            //add to teh child list if target id is not same 
            //so that the node target is removed.
            children.push(child);
        }
    });
    //set the target parent with new set of children sans the one which is removed
    target.parent.children = children;
    //redraw the parent since one of its children is removed
    update(target.parent)
}

//NAVIGATION BAR
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.body.style.backgroundColor = "white";
}


function deleteTree(d) {
    var defaultData = [
        {
            "title": "Make a new Treelo Tree using the buttons below or open an existing tree with the Navigation Bar!"
        }];
    root = defaultData[0];
    update(root);
}

function displayTree(data) {
    root = data;
    root.x0 = height / 2;
    root.y0 = 0;

    update(root);

    d3.select(self.frameElement).style("height", "500px");
}

function updateNodeInfo(d) {
    var Title = document.getElementById("title-span").innerText;
    var Description = document.getElementById("description-span").innerText;
    currentNode.title = Title
    currentNode.description = Description
    $('#myModal').modal("toggle");
    update(currentNode);
    // while (currentNode.parent != null) {
    //     currentNode = currentNode.parent
    // }
    // alert(treeData[0].title)
    // alert(currentNode.title)
    // treeData.forEach(findMatchingID2)
    // var emptyData = [{}];
    //     update(currentNode)
    //     displayTree(emptyData[0])
    // displayTree(foundTreeForRender);
}

// function findMatchingID2(item, index) {
//     if (item._id == currentNode._id) {
//         foundTreeForRender = item;
//         alert('found')
//     }
// }

function returnFromFocus() {
    while (currentNode.parent != null) {
        currentNode = currentNode.parent;
    }
    displayTree(currentNode);
    $("#return-focus").hide();

}

function setDeleteMode() {
    nodeView = 'Delete';
    alert("You have netered delete node mode. Click a node to delete it and its children\n**Warning Deletion is perminant**")
}

function setAddMode(d) {
    nodeView = 'Add';
    alert("You have entered add node mode. Click a node to add a child")
}

function setFocusMode() {
    nodeView = 'Focus';
    alert("Click on a node to shorten tree to its children for better viewing")
}

function markDone() {
    d3.selectAll()
    alert(currentNode.title)
}

document.querySelector('#submit-changes').addEventListener('click', updateNodeInfo);
