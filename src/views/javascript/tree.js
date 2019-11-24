//Hiddes the return from focus button upon startup
$("#return-focus").hide();
$("#shareFooter").hide();
$('#card-preview').hide();

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
            input = document.createElement("textArea");
            input.style.resize = "none";
            input.style.position = "relative";
            input.style.width = "90%";
            input.style.height = "500px";
            input.style.left = "5%";
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
            "_id": Math.random() + "",
            "isComplete": false,
            "sharedUsers": []
        }]
        treeData.push(data[0])
        displayTree(data[0])
        document.getElementById("mySidenav").innerHTML += "<br><button id = " + '"' + data[0]._id + '"' + "onClick = findTree()>" + data[0].title + "</button>";
        closePopup();

        $.ajax({
            method: "POST",
            url: "/trees",
            async: false,
            data: {
                "tree" : data[0]
            },
            success: function(data){
                console.log(data);
            },
            error: function(xhr, err){
                alert(xhr.responseText);
            }
      });
    }
}

//Used to find the tree to render based on tree ID (Used for array of buttons to determine action)
var foundTreeForRender;
//the current node users interact with
var currentNode;
var doubleClicked = 'false';
var currentTree;
var sharedUsernameArr = [];
var BFSQueue = [];
var sharedUsersToDisplay = [];
var sharedUsersToDisplayNodes = [];
var isFocus = false;
var oldTree;
var oldRoot;
//fake tree data
//This is where ajax query for data will be using username given on login
var treeData = [{
    "title" : "Initial",
    "description": "init desc",
    "_id" : "12345",
    "isComplete" : false
}];
//[
//     {
//         "sharedUsers": [
//             "janedoe@gmail.com",
//         ],
//         "children": [
//             {
//                 "title": "Child1",
//                 "description": "child 1 description",
//                 "dueDate": "",
//                 "owner": "johndoe@gmail.com",
//                 "sharedUsers": [
//                     "janedoe@gmail.com",
//                     "benbaierl@case.edu"
//                 ],
//                 "isComplete": false,
//                 "isOverdue": false,
//                 "children": []
//             }
//         ],
//         "_id": "5daf8c0d73afd05a10c15331",
//         "dueDate": null,
//         "title": "Test title 1",
//         "description": "test description",
//         "owner": "johndoe@gmail.com",
//         "isComplete": false,
//         "isOverdue": false,
//         "__v": 0
//     },
//     {
//         "sharedUsers": [
//             "janedoe@gmail.com",
//             "benbaierl@case.edu"
//         ],
//         "children": [
//             {
//                 "title": "Child1",
//                 "description": "child 2 description",
//                 "dueDate": "",
//                 "owner": "johndoe@gmail.com",
//                 "sharedUsers": [
//                     "janedoe@gmail.com",
//                     "benbaierl@case.edu",
//                     "johnny@aol.com"
//                 ],
//                 "isComplete": false,
//                 "isOverdue": false,
//                 "children": [{
//                     "sharedUsers": [
//                         "janedoe@gmail.com",
//                         "benbaierl@case.edu"
//                     ],
//                     "children": [
//                         {
//                             "title": "Child1",
//                             "description": "child 2 description",
//                             "dueDate": "",
//                             "owner": "johndoe@gmail.com",
//                             "sharedUsers": [
//                                 "janedoe@gmail.com",
//                                 "benbaierl@case.edu"
//                             ],
//                             "isComplete": false,
//                             "isOverdue": false,
//                             "children": []
//                         },
//                         {
//                             "sharedUsers": [
//                                 "janedoe@gmail.com",
//                                 "benbaierl@case.edu"
//                             ],
//                             "children": [
//                                 {
//                                     "title": "Child1",
//                                     "description": "child 2 description",
//                                     "dueDate": "",
//                                     "owner": "johndoe@gmail.com",
//                                     "sharedUsers": [
//                                         "janedoe@gmail.com",
//                                         "benbaierl@case.edu"
//                                     ],
//                                     "isComplete": false,
//                                     "isOverdue": false,
//                                     "children": []
//                                 }
//                             ],
//                             "_id": "5daf8c0d73afd051sd",
//                             "dueDate": null,
//                             "title": "Test title 2",
//                             "description": "test description",
//                             "owner": "johndoe@gmail.com",
//                             "isComplete": false,
//                             "isOverdue": false,
//                             "__v": 0
//                         }
//                     ],
//                     "_id": "5daf8c0d73afd051dd",
//                     "dueDate": null,
//                     "title": "Test title 2",
//                     "description": "test description",
//                     "owner": "johndoe@gmail.com",
//                     "isComplete": false,
//                     "isOverdue": false,
//                     "__v": 0
//                 }]
//             }
//         ],
//         "_id": "5daf8c0d73afd051ddhg",
//         "dueDate": null,
//         "title": "Test title 2",
//         "description": "test description",
//         "owner": "johndoe@gmail.com",
//         "isComplete": false,
//         "isOverdue": false,
//         "__v": 0
//     },
//     {
//         "sharedUsers": [
//             "janedoe@gmail.com",
//             "benbaierl@case.edu"
//         ],
//         "children": [
//             {
//                 "title": "Child1",
//                 "description": "child 1 description",
//                 "dueDate": "",
//                 "owner": "johndoe@gmail.com",
//                 "sharedUsers": [
//                     "janedoe@gmail.com",
//                     "benbaierl@case.edu"
//                 ],
//                 "isComplete": false,
//                 "isOverdue": false,
//                 "children": [{
//                     "title": "Child1",
//                     "description": "child 1 description",
//                     "dueDate": "",
//                     "owner": "johndoe@gmail.com",
//                     "sharedUsers": [
//                         "janedoe@gmail.com",
//                         "benbaierl@case.edu"
//                     ],
//                     "isComplete": false,
//                     "isOverdue": false,
//                     "children": []
//                 }]
//             }
//         ],
//         "_id": "5daf8c0d73afd05a10c15331asdfsadf",
//         "dueDate": null,
//         "title": "Test title 3",
//         "description": "test description",
//         "owner": "johndoe@gmail.com",
//         "isComplete": false,
//         "isOverdue": false,
//         "__v": 0
//     }
// ];


$.ajax({
    method: "GET",
    url: "/trees/data",
    async: false,
    success: function(body){
        if(body.data.length != 0) {
            treeData = body.data;
        }
    },
    error: function(xhr, err){
        alert(xhr.responseText);
    }
  });

//finds tree based on ID
function findTree(d) {
    $("#return-focus").hide();
    treeData.forEach(findMatchingID)
    displayTree(foundTreeForRender);
    BFS(currentTree, findSharedTrees);
    // findSharedTrees(currentTree);
    showSharedButtons();
}

function findMatchingID(item) {
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
var margin = { top: 100, right: 60, bottom: 20, left: 100 },
    width = 750 - margin.right - margin.left,
    height = 1800 - margin.top - margin.bottom;

var i = 0;

var duration = 1000;

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

currentNode = treeData[0];
root = treeData[0];
currentTree = treeData[0];
root.x0 = 0;
root.y0 = width / 2;

// findSharedTrees(currentTree);
BFS(currentTree, findSharedTrees);
// for(var i = 0; i < sharedUsersToDisplay.length; i++){
//     alert(sharedUsersToDisplay[i]);
//     alert(sharedUsersToDisplayNodes[i])
// }
showSharedButtons();
update(root);

//d3.select(self.frameElement).style("height", "500px");

function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    //nodes.forEach(function (d) { d.y = d.depth * 50; });

    // Declare the nodes
    var node = svg.selectAll("g.node")
        .data(nodes, function (d) { return d.id || (d.id = ++i); });

    // Enter the nodes.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + source.x0 + "," + source.y0 + ")";
        })
        // .on("click", setTimeout(dblclick, 1000))
        .on("click", dblclick)
        .on("dblclick", click)
        .on("mouseover", cardPreview)
        // .on("mouseover", function (d) {
        //     var g = d3.select(this); // The node
        //     // The class is used to remove the additional text later
        //     //  alert(d.title)
        //     var info = g.append('text')
        //         .classed('info', true)
        //         .attr('x', 20)
        //         .attr('y', 10)
        //         .text(d.title);
        // })
        .on("mouseout", closePreview)
        // // .on("mouseout", function () {
        // //     // Remove the info text on mouse out.
        // //     d3.select(this).select('text.info').remove()
        // });
        .on("contextmenu", function (d) {
            displayMenu(event, d);
        });

    nodeEnter.append("circle")
        .attr("r", 10)
        .style("fill", function (d) { if (d.isComplete === false || d.isComplete == "false") { return d._children ? "lightsteelblue" : "#fff"; } else { return "black" } });

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
        .style("fill", function (d) { if (d.isComplete === false || d.isComplete == "false") { return d._children ? "lightsteelblue" : "#fff"; } else { return d._children ? "green" : "orange"; } });
    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) { return "translate(" + source.x + "," + source.y + ")"; })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6)

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

function cardPreview(d) {
    document.getElementById("card-preview").innerHTML = d.title + "<br>" + "  Description:<br/>   " + d.description;
    $('#card-preview').show();
}

function closePreview(d) {
    $('#card-preview').hide();
}

function click(d) {
    // doubleClicked = 'true'
    //alert(d.name);
    //var item = findDescription(treeData, d.name);
    //alert(d.isComplete)
    //alert(d.isComplete)
    document.getElementById("description-span").innerHTML = d.description;
    document.getElementById("title-span").innerHTML = d.title;
    currentNode = d;
    var people = "";

    if(currentNode.sharedUsers != null){
        for (var i = 0; i < currentNode.sharedUsers.length; i++) {
            people += (currentNode.sharedUsers[i]);
            if (currentNode.sharedUsers[i + 1] != null) {
                people += "<br>"
            }
        }
    }
    else{
        currentNode.sharedUsers = [];
    }

    //alert('here')
    document.getElementById("members").innerHTML = people;
    $('#myModal').modal("toggle");
    // doubleClicked = 'false'
}

// Toggle children on click.
function dblclick(d) {

    // if (doubleClicked === 'false') {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    update(d);
}

function removeNode(d) {
    if (currentNode.parent == null) {
        //alert('here we are')
        deleteTree()
        //alert(treeData.toString())
        //alert(currentNode._id);
        $("#" + currentNode._id).hide();
        // getElementById("#" + currentNode._id).style.display =
        //update info for removing Tree in treeData
    }
    // alert('Deleted ' + currentNode.title)
    //alert("made it here")
    //this is the links target node which you want to remove
    else {
        //make new set of children
        //alert(treeData[0].children)
        var children = [];
        //iterate through the children 
        currentNode.parent.children.forEach(function (child) {
            if (child.id != currentNode.id) {
                children.push(child);
            }
        });
        //set the target parent with new set of children sans the one which is removed
        currentNode.parent.children = children;
        //redraw the parent since one of its children is removed
        update(currentNode.parent)
    }
}

//NAVIGATION BAR
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

function openShare() {
    document.getElementById("mySideShare").style.width = "250px";
    document.getElementById("main2").style.marginRight = "250px";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

function closeShare() {
    document.getElementById("mySideShare").style.width = "0";
    document.getElementById("main2").style.marginRight = "0";
    document.body.style.backgroundColor = "white";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.body.style.backgroundColor = "white";
}


function deleteTree(d) {
    for (var i = 0; i < treeData.length; i++) {
        if (currentNode._id == treeData[i]._id) {
            //alert('found it')
            delete treeData[i];
            //alert(treeData.toString());
        }
    }

    var removingNulls = treeData.filter(function (a) {
        return a != null;
    });
    treeData = removingNulls;
    //alert(treeData.toString())
    var defaultData = [
        {
            "isComplete": false,
            "title": "Make a new Treelo Tree using the buttons below or open an existing tree with the Navigation Bar!"
        }];
    root = defaultData[0];
    update(root);
}

function displayTree(data) {
    currentTree = data;
    root = data;
    oldRoot = currentNode;
    root.x0 = 0;
    root.y0 = width / 2;
    if (oldRoot._id != root._id) {
        // alert('here');
        sharedUsersToDisplay = [];
        sharedUsersToDisplayNodes = [];
    }
    // findSharedTrees(root);
    BFS(currentTree, findSharedTrees);
    showSharedButtons();

    update(root);

    // d3.select(self.frameElement).style("height", "500px");
}

function updateNodeInfo(d) {
    var Title = document.getElementById("title-span").innerText;
    var Description = document.getElementById("description-span").innerText;
    currentNode.title = Title
    currentNode.description = Description
    $('#myModal').modal("toggle");
    update(currentNode);
    // alert(treeData[0].title)
    svg.selectAll("text")
        .text(function (d) { return d.title; })

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
    svg.selectAll("circle")
        .filter(function (d) { return d._id === currentNode._id; })
        .style("animation-delay", "none")
        .style("animation-name", "none")
        .style("animation-iteration-count", "none")
        .style("animation-duration", "none")
        .style("animation-timing-function", "none");
    while (currentNode.parent != null) {
        currentNode = currentNode.parent;
    }
    displayTree(currentNode);
    $("#return-focus").hide();
    $("#shareFooter").hide();
}

function setDeleteMode() {
    removeNode();
}

function removeParentReferences(tree){
    tree.parent = null;
}

function setAddMode() {
    var newId = Math.random() + "";
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
    update(currentNode);
    svg.selectAll("circle")
        .filter(function (d) { return d._id === newId; })
        .style("animation-delay", "1s")
        .style("animation-name", "addblink")
        .style("animation-iteration-count", "1")
        .style("animation-duration", "2s")
        .style("animation-timing-function", "ease-in");

    var currentTreeData = currentTree;
    BFS(currentTreeData, removeParentReferences);

    $.ajax({
        method: "PUT",
        url: "/trees/" + currentTree._id,
        async: false,
        data: {
            "tree" : currentTreeData
        },
        success: function(data){
            console.log(data);
        },
        error: function(xhr, err){
            alert(xhr.responseText);
        }
    });
}

function setFocusMode() {
    // isFocus = true;
    svg.selectAll("circle")
        .filter(function (d) { return d._id === currentNode._id; })
        .style("animation-delay", "1s")
        .style("animation-name", "focusblink")
        .style("animation-iteration-count", "1")
        .style("animation-duration", "2s")
        // .style("animation-fill-mode", "forwards")
        .style("animation-timing-function", "ease-in")
    displayTree(currentNode)
    $("#return-focus").show();
}

function markDone() {
    svg.selectAll("circle")
        .filter(function (d) { if (d._id === currentNode._id) { d.isComplete = true; } return d._id === currentNode._id; })
        .style("animation-name", "doneblink")
        .style("animation-iteration-count", "1")
        .style("animation-duration", "2s")
        .style("animation-timing-function", "ease-in")
    svg.selectAll("circle")
        .filter(function (d) { if (d._id === currentNode._id) { d.isComplete = true; } return d._id === currentNode._id; })
        .style("fill", "red");


    $('#myModal').modal("toggle");


    // svg.selectAll("circle")
    //     .filter(function (d) {
    //         for (var i1 = 0; i1 < d.children.length; i1++) {
    //             d.children[i1].isComplete = true;
    //         }
    //         return d.isComplete === true;
    //     })
    //     .style("fill", "lightgreen");
}

var contextMenu = document.getElementById('context-menu');
var popup = document.getElementById('newtreeform');
var shareMenu = document.getElementById('sharetreeform');
window.onclick = closeMenus;

function displayMenu(event, d) {
    currentNode = d;
    $('#context-menu').css({
        'top': event.pageY + 'px',
        'left': event.pageX + 'px',
        'display': 'block'
    });
}

function closeMenus() {
    contextMenu.style.display = 'none';
}

function closePopup() {
    popup.style.display = 'none';
}

function showPopup(event) {
    $('#newtreeform').css({
        'top': '10%',
        'left': '90%',
        'display': 'block'
    });
}

function openShareMenu() {
    $('#sharetreeform').css({
        'top': '10%',
        'left': '75%',
        'display': 'block'
    });
}

function closeShareMenu() {
    shareMenu.style.display = 'none';
}

function shareTree() {
    var userName =
        document.getElementById("shared-with").value;
    if (!currentNode.sharedUsers.includes(userName) && userName != null && userName != "") {
        currentNode.sharedUsers.push(userName);
    }
    closeShareMenu();
    returnFromFocus();
}

// function showUserTree() {

// }

// function displaySharedPortion(sharedUsername) {
//     //alert(sharedUsername)
//     for (var i = 0; i < currentTree.sharedUsers.length; i++) {
//         if (currentTree.sharedUsers[i] === sharedUsername){
//             displayTree(currentTree)
//         }
//     }
// }
function findSharedTrees(thisTree){
    if (thisTree.sharedUsers != null && thisTree.sharedUsers != []) {
        for (var i = 0; i < thisTree.sharedUsers.length; i++) {
            if (!sharedUsersToDisplay.includes(thisTree.sharedUsers[i])) {
                sharedUsersToDisplayNodes.push(thisTree);
                sharedUsersToDisplay.push(thisTree.sharedUsers[i]);
            }
        }
    }
}

function BFS(thisTree, operation) {
    // alert('here')
    // alert(thisTree.children.length)
    // BFSQueue.push(thisTree)
    if (thisTree.children != [] && thisTree.children != null) {
        // alert('her2')
        for (var i = 0; i < thisTree.children.length; i++) {
            BFSQueue.push(thisTree.children[i]);
        }
    }

    operation(thisTree);

    var nexttocheck = BFSQueue.shift();
    // BFSQueue.shift()
    if (nexttocheck != null) {
        BFS(nexttocheck, operation);
    }
}

function showSharedButtons() {
    document.getElementById("currentTreeShared").innerHTML = "";
    for (var i = 0; i < sharedUsersToDisplay.length; i++) {
        document.getElementById("currentTreeShared").innerHTML += "<br><button id = " + '"' + sharedUsersToDisplay[i] + '" onClick = "displaySharedPortion(this)">' + sharedUsersToDisplay[i] + "'s View </button>";
    }
}

function displaySharedPortion(d) {
    // returnFromFocus();
    // alert(d.id)
    $("#return-focus").hide();
    var index = sharedUsersToDisplay.indexOf(d.id);
    // alert(index)
    // alert(sharedUsersToDisplayNodes[index].title)
    currentNode = sharedUsersToDisplayNodes[index]
    displayTree(sharedUsersToDisplayNodes[index])
    $("#return-focus").show();
    $("#shareFooter").show();
}

document.addEventListener('contextmenu', event => event.preventDefault());

document.querySelector('#submit-changes').addEventListener('click', updateNodeInfo);
