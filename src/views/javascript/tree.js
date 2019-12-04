// ************************************__________________Initialization__________________************************************

// Hides the return from focus button upon startup
$("#return-focus").hide();
// Hides the return from focus button within the Sharing sidebar upon startup
$("#shareFooter").hide();
// Hides the card preview on startup
$('#card-preview').hide();

//Code for turning the title and description text into textareas upon click to be editable
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

// Initializing Global Variables
// Used to find the tree to render based on tree ID (Used for array of buttons to determine action)
var foundTreeForRender;
// The current node users interact with
var currentNode;
// The current root node of the tree a user is viewing
var currentTree;
// A Queue used for all BFS searches
var BFSQueue = [];
// An array containing the shared users emails
var sharedUsersToDisplay = [];
// An array containing the start nodes that each shared users can see
var sharedUsersToDisplayNodes = [];
//Current logged in userl
var currentUser;

// The backend ajax call to get all the trees that a user can view
$.ajax({
    method: "GET",
    url: "/trees/data",
    async: true,
    success: function(body){
        if(body.data.length != 0) {
            treeData = body.data;
            // For each tree in treeData find and show the available trees to view
            treeData.forEach(makeTreeButtons);
                        
            currentNode = treeData[0];
            root = treeData[0];
            currentTree = treeData[0];
            root.x0 = 0;
            root.y0 = width / 2;

            // Finding the shared users on the initial tree
            BFS(currentTree, findSharedTrees);
            showSharedButtons();
            update(root);
        }
    },
    error: function(xhr, err){
        console.log(xhr.responseText);
    }
});

// The backend ajax call to get all the trees that a user can view
$.ajax({
    method: "GET",
    url: "/trees/user",
    async: true,
    success: function(body){
        currentUser = body.userProfile.emails[0];
    },
    error: function(xhr, err){
        console.log(xhr.responseText);
    }
});

// Generate the original tree diagram 
var margin = { top: 100, right: 60, bottom: 20, left: 60 },
    width = $(window).height()/1.5 - margin.right - margin.left,
    height = $(window).width() - margin.top - margin.bottom;

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
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

// Prevents the default context menus from being available
document.addEventListener('contextmenu', event => event.preventDefault());
// Setting a listener on the submit changes button
document.querySelector('#submit-changes').addEventListener('click', updateNodeInfo);
// Variable used for opening and closing the context menu
var contextMenu = document.getElementById('context-menu');
// Variable used for opening and closing the new tree form popup
var newTreePopup = document.getElementById('newtreeform');
// Variable used for opening and closing the share tree form popup
var shareMenu = document.getElementById('sharetreeform');
// Closes the menus on click of the window
window.onclick = closeContextMenus;

// ************************************__________________Tree Functions__________________************************************

// **************************_____________Finding/Displaying Current User Tree Functions_____________**************************
// Finds trees based on ID
function findTree(d) {
    $("#return-focus").hide();
    treeData.forEach(findMatchingID)
    displayTree(foundTreeForRender, false);
    BFS(currentTree, findSharedTrees);
    showSharedButtons();
}

// Finds a tree from matching IDs
function findMatchingID(item) {
    if (item._id == event.target.id) {
        foundTreeForRender = item;
    }
}

// Makes and Displays the Buttons corresponding to each tree a user can view
function makeTreeButtons(item, index) {
    document.getElementById("sideNavButtons").innerHTML += "<br><button id = " + '"' + item._id + '"' + "onClick = findTree()>" + item.title + "</button>";
}

// Displays a tree from a certain point.
// Param data: the node from which to display the tree
// Param isShareView: tells the function whether or not to 
// reset and reproduce the shared tree buttons
function displayTree(data, isShareView) {
    currentTree = data;
    root = data;
    root.x0 = 0;
    root.y0 = width / 2;
    // If we switched trees update the shared users accordingly
    if(!isShareView){
        sharedUsersToDisplay = [];
        sharedUsersToDisplayNodes = [];
    }
    // Show available shared trees
    BFS(currentTree, findSharedTrees);
    showSharedButtons();
    update(root);
}

// Finds the shared views associated with a tree
// Param thisTree: the root node of the tree in which you are trying
// to find its shared views
function findSharedTrees(thisTree){
    if (thisTree.sharedUsers != null && thisTree.sharedUsers != []) {
        for (var i = 0; i < thisTree.sharedUsers.length; i++) {
            if (!sharedUsersToDisplay.includes(thisTree.sharedUsers[i]) && currentUser != thisTree.sharedUsers[i]) {
                sharedUsersToDisplayNodes.push(thisTree);
                sharedUsersToDisplay.push(thisTree.sharedUsers[i]);
            }
        }
    }
}

// Breadth First search of a tree
// Param thisTree: The tree in which you are trying to search
// Param operation: the function which BFS performs as it traverse the tree
function BFS(thisTree, operation) {
    if (thisTree.children != [] && thisTree.children != null) {
        for (var i = 0; i < thisTree.children.length; i++) {
            BFSQueue.push(thisTree.children[i]);
        }
    }
    operation(thisTree);
    var nexttocheck = BFSQueue.shift();
    if (nexttocheck != null) {
        BFS(nexttocheck, operation);
    }
}

// Displays the buttons corresponding to each shared tree view within the shared tree navigation bar
function showSharedButtons() {
    document.getElementById("currentTreeShared").innerHTML = "";
    for (var i = 0; i < sharedUsersToDisplay.length; i++) {
        document.getElementById("currentTreeShared").innerHTML += "<br><button id = " + '"' + sharedUsersToDisplay[i] + '" onClick = "displaySharedPortion(this)">' + sharedUsersToDisplay[i] + "'s View </button>";
    }
}

// Dispays the tree in the form that an individual which is shared can only see 
function displaySharedPortion(d) {
    $("#return-focus").hide();
    var index = sharedUsersToDisplay.indexOf(d.id);
    currentNode = sharedUsersToDisplayNodes[index]
    displayTree(sharedUsersToDisplayNodes[index], true)
    $("#return-focus").show();
    $("#shareFooter").show();
}

// Updates a tree from a current node and redraws the entire tree
function update(source) {
    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);
    // Declare the nodes
    var node = svg.selectAll("g.node")
        .data(nodes, function (d) { return d.id || (d.id = ++i); });
    // Enter the nodes.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + source.x0 + "," + source.y0 + ")";
        })
        .on("click", click)
        .on("dblclick", dblclick)
        .on("mouseover", cardPreview)
        .on("mouseout", closePreview)
        .on("contextmenu", function (d) {
            displayMenu(event, d);
        });
    // Append the circles 
    nodeEnter.append("circle")
        .attr("r", 10)
        .style("fill", function (d) { if (d.isComplete === false || d.isComplete == "false") { return d._children ? "lightsteelblue" : "#fff"; } else { return "lightgreen" } });
    // Append title text to the nodes
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
    // Styling for complete nodes
    nodeUpdate.select("circle")
        .attr("r", 10)
        .style("fill", function (d) { if (d.isComplete === false || d.isComplete == "false") { return d._children ? "lightsteelblue" : "#fff"; } else { return d._children ? "green" : "lightgreen"; } });
    // Fade-in Animations for the text
    nodeUpdate.select("text")
        .style("fill-opacity", 1);
    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) { return "translate(" + source.x + "," + source.y + ")"; })
        .remove();
    // Exit animation for the nodes
    nodeExit.select("circle")
        .attr("r", 1e-6)
    // Exit animation for the text
    nodeExit.select("text")
        .style("fill-opacity", 1e-6);
    // Declare the links
    var link = svg.selectAll("path.link")
        .data(links, function (d) { return d.target.id; });
    // Enter the links
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
}

function logout(){
    window.location.href = "http://localhost:8080/logout";
}

// **************************_____________Manipulating Tree Functions_____________**************************
// Deletes a tree
function deleteTree(d) {
    // Remove the tree from the given JSON data
    for (var i = 0; i < treeData.length; i++) {
        if (currentNode._id == treeData[i]._id) {
            $.ajax({
                method: "DELETE",
                url: "/trees/" + treeData[i]._id,
                async: true,
                success: function(body){
                    console.log(body);
                },
                error: function(xhr, err){
                    console.log(xhr.responseText);
                }
            });
            delete treeData[i];
        }
    }
    // Remove the null reference in the JSON data array where the tree used to be
    var removingNulls = treeData.filter(function (a) {
        return a != null;
    });
    treeData = removingNulls;
    // Create fake tree data to prompt user to create a new tree
    var defaultData = [
        {
            "isComplete": false,
            "title": "Make a new Treelo Tree using the buttons below or open an existing tree with the Navigation Bar!"
        }];
    root = defaultData[0];
    displayTree(root, false);
}

// Making a new tree from the form in HTML taking input and due date
function makeNewData() {
    var Title =
        document.getElementById("titleText").value;
    var Description =
        document.getElementById("description").value;
    if (Title != "" && Description != "") {
        var newTree = {
            "title": Title,
            "parent": null,
            "description": Description,
            "children": [],
            "isComplete": false,
            "sharedUsers": []
        };

        // Backend call to create a new tree within the backend 
        $.ajax({
            method: "POST",
            url: "/trees/newTree",
            async: true,
            data: {
                "tree" : newTree
            },
            success: function(body){
                treeData.push([body.data]);
                displayTree(body.data, false);
                document.getElementById("mySidenav").innerHTML += "<br><button id = " + '"' + body.data._id + '"' + "onClick = findTree()>" + body.data.title + "</button>";
                closeNewTreePopup();
            },
            error: function(xhr, err){
                console.log(xhr.responseText);
            }
        });  
    }
}

// Removes a node from the current viewed tree
function removeNode(d) {
    if (currentNode.parent == null) {
        $("#" + currentNode._id).hide();
        deleteTree()
    }
    else {
        // Make new set of children
        var children = [];
        // Update the parents children array
        currentNode.parent.children.forEach(function (child) {
            if (child.id != currentNode.id) {
                children.push(child);
            }
        });
        currentNode.parent.children = children;
        // Update the parent
        if(root == currentNode){
            returnFromFocus()
        }
        update(currentNode.parent)
        $.ajax({
            method: "DELETE",
            url: "/trees/" + currentNode._id,
            async: true,
            error: function(xhr, err){
                console.log(xhr.responseText);
            }
        });
    }
}

// Updates the information within a node
function updateNodeInfo(d) {
    var Title = document.getElementById("title-span").innerText;
    var Description = document.getElementById("description-span").innerText;
    var newDueDate = document.getElementById("duedateinput").value;

    currentNode.dueDate = newDueDate
    currentNode.title = Title
    currentNode.description = Description
    $('#myModal').modal("toggle");
    update(currentNode);
    svg.selectAll("text")
        .text(function (d) { return d.title; });

    
    var currentNodeData = {
        title: currentNode.title,
        description: currentNode.description,
        dueDate: currentNode.dueDate,
        sharedUsers: currentNode.sharedUsers
    };

    $.ajax({
        method: "PUT",
        url: "/trees/details/" + currentNode._id,
        async: true,
        data: {
            "node" : currentNodeData
        },
        success: function(body){
            currentNode = body.data;
        },
        error: function(xhr, err){
            console.log(xhr.responseText);
        }
    });
}

// Returns from the focus view to the entire tree view for the current tree
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
    displayTree(currentNode, false);
    $("#return-focus").hide();
    $("#shareFooter").hide();
}

// Shares a tree from the current node with a specified user
function shareTree() {
    var userName = document.getElementById("shared-with").value;
  
    if(currentNode.sharedUsers == null){
        currentNode.sharedUsers = [userName];
    }
    if (!currentNode.sharedUsers.includes(userName) && userName != null && userName != "") {
        currentNode.sharedUsers.push(userName);
    }

    var currentNodeData = {
        sharedUsers : currentNode.sharedUsers
    };

    $.ajax({
        method: "PUT",
        url: "/trees/details/" + currentNode._id,
        async: true,
        data: {
            "node" : currentNodeData
        },
        success: function(body){
            currentNode = body.data;
        },
        error: function(xhr, err){
            console.log(xhr.responseText);
        }
    });
    closeShareMenu();
    BFS(currentTree, findSharedTrees);
    showSharedButtons();
    svg.selectAll("circle")
        .filter(function (d) { return d._id === currentNode._id; })
        .style("animation-delay", "1s")
        .style("animation-name", "shareblink")
        .style("animation-iteration-count", "1")
        .style("animation-duration", "2s")
        .style("animation-timing-function", "ease-in")
}

// Adds a node from the current node
function addNode() {
    var newId = Math.random() + "";
    var newChild = {
        "title": "New Node",
        "description": "Enter Description Here",
        "sharedUsers": [],
        "children": [],
        "isComplete": false,
    }

    // Backend ajax call to add a node to the current tree within the backend data
    $.ajax({
        method: "POST",
        url: "/trees/addNode/" + currentNode._id,
        async: true,
        data: {
            "tree" : newChild
        },
        success: function(body){
            if (currentNode.children == null) {
                newchildren = [body.data];
                currentNode.children = newchildren;
            }
            else {
                currentNode.children.push(body.data)
            }
            update(currentNode);
            svg.selectAll("circle")
                .filter(function (d) { return d._id === newId; })
                .style("animation-delay", "1s")
                .style("animation-name", "addblink")
                .style("animation-iteration-count", "1")
                .style("animation-duration", "2s")
                .style("animation-timing-function", "ease-in");
        },
        error: function(xhr, err){
            console.log(xhr.responseText);
        }
    });
}

// Sets the current node to the root of the tree in a 'focused' view
function setFocusNode() {
    if(root._id != currentNode._id){
        svg.selectAll("circle")
            .filter(function (d) { return d._id === currentNode._id; })
            .style("animation-delay", "1s")
            .style("animation-name", "focusblink")
            .style("animation-iteration-count", "1")
            .style("animation-duration", "2s")
            .style("animation-timing-function", "ease-in")
        displayTree(currentNode, false)
        $("#return-focus").show();
    }
    else{
        alert("That Node is Already the Focus")
    }
}

// Marks a card as complete or incomplete updating its status and color
function toggleDone() {
    if(currentNode.isComplete === false){
        svg.selectAll("circle")
            .filter(function (d) { if (d._id === currentNode._id) { d.isComplete = true; } return d._id === currentNode._id; })
            .style("animation-name", "doneblink")
            .style("animation-iteration-count", "1")
            .style("animation-duration", "2s")
            .style("animation-timing-function", "ease-in")
        svg.selectAll("circle")
            .filter(function (d) { if (d._id === currentNode._id) { d.isComplete = true; } return d._id === currentNode._id; })
            .style("fill", "lightgreen");
        $('#myModal').modal("toggle");
        $('#mark-done').text('Mark Incomplete');
    }
    else{
        svg.selectAll("circle")
            .filter(function (d) { if (d._id === currentNode._id) { d.isComplete = false; } return d._id === currentNode._id; })
            .style("animation-name", "none")
            .style("animation-iteration-count", "none")
            .style("animation-duration", "none")
            .style("animation-timing-function", "none")
        svg.selectAll("circle")
            .filter(function (d) { if (d._id === currentNode._id) { d.isComplete = false; } return d._id === currentNode._id; })
            .style("fill", "white");
        $('#myModal').modal("toggle");
        $('#mark-done').text('Mark Complete');
    }

    var currentNodeData = {
        isComplete: currentNode.isComplete,
        sharedUsers: currentNode.sharedUsers
    };

    $.ajax({
        method: "PUT",
        url: "/trees/details/" + currentNode._id,
        async: true,
        data: {
            "node" : currentNodeData
        },
        success: function(body){
            currentNode = body.data;
        },
        error: function(xhr, err){
            console.log(xhr.responseText);
        }
    });
}

// Unshares a tree with another users
function unShare(index, userEmail){
    if(currentNode.sharedUsers[index] === userEmail){
        delete currentNode.sharedUsers[index]
        var removingNulls = currentNode.sharedUsers.filter(function (a) {
            return a != null;
        });
        currentNode.sharedUsers = removingNulls;
        $('#myModal').modal("toggle");

        var currentNodeData = {
            sharedUsers: currentNode.sharedUsers,
            title: currentNode.title
        };

        $.ajax({
            method: "PUT",
            url: "/trees/details/" + currentNode._id,
            async: true,
            data: {
                "node" : currentNodeData
            },
            success: function(body){
                currentNode = body.data;
            },
            error: function(xhr, err){
                console.log(xhr.responseText);
            }
        });
    }
    else{
        alert('Could not find user to delete')
    }
}

// **************************_____________User Action Functions_____________**************************
// The functionaility when a node is double-clicked (opens the card info modal)
function dblclick(d) {
    document.getElementById("description-span").innerHTML = d.description;
    document.getElementById("title-span").innerHTML = d.title;
    document.getElementById("duedateinput").value = d.dueDate;
    currentNode = d;
    var people = "";
    if(currentNode.sharedUsers != null){
        for (var i = 0; i < currentNode.sharedUsers.length; i++) {
            people += (currentNode.sharedUsers[i]);
            people += "<span style=" + '"' + "font-size:20px;cursor:pointer" + '"' + "onclick=" + '"' + "unShare("+ i + ",'" + currentNode.sharedUsers[i] + "')" + '"' + ">&times;</span>"
            if (currentNode.sharedUsers[i + 1] != null) {
                people += "<br>"
            }
        }
    }
    else{
        currentNode.sharedUsers = [];
    }
    document.getElementById("members").innerHTML = people;
    if(currentNode.isComplete){
        $('#myModal').css("background", "rgba(0,255,0,.1)");
        $('#mark-done').text('Mark Incomplete');
    }
    else{
        $('#myModal').css("background", "rgba(255,0,0,.1)");
        $('#mark-done').text('Mark Complete');
    }
    $('#myModal').modal("toggle");
}

// Handles a click action (toggles children)
function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    update(d);
}

// **************************_____________Hiding/Displaying Menus Functions_____________**************************
// Opens the card preview for each node when a user is hovered over
function cardPreview(d) {
    document.getElementById("card-preview").innerHTML = d.title + "<br><br>" + "  Description:<br/>   " + d.description;
    $('#card-preview').css({
        'top': event.pageY + -30 + 'px',
        'left': event.pageX + 50 + 'px',
        'display': 'block',
        'opacity': "0",
        'animation-delay': ".5s",
        'animation-name': "fadein",
        'animation-iteration-count': "1",
        'animation-timing-fcuntion' : "ease-in",
        'animation-duration': "1s",
        'animation-fill-mode': "forwards"
    });
}

// Closes the card preview display
function closePreview(d) {
    $('#card-preview').hide()
        .style("animation-delay", "none")
        .style("animation-name", "none")
        .style("animation-iteration-count", "none")
        .style("animation-duration", "none")
        .style("animation-timing-function", "none");
}

// Opens the tree navigation bar
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

// Closes the tree navigation bar
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

// Opens the shared trees window
function openShare() {
    document.getElementById("mySideShare").style.width = "250px";
}

// Closes the shared trees window
function closeShare() {
    document.getElementById("mySideShare").style.width = "0";
}

// Displays the right click context menu
function displayMenu(event, d) {
    currentNode = d;
    $('#context-menu').css({
        'top': event.pageY + 'px',
        'left': event.pageX + 'px',
        'display': 'block'
    });
}

// Closes the context menu
function closeContextMenus() {
    contextMenu.style.display = 'none';
}

// Closes the new tree form popup
function closeNewTreePopup() {
    newTreePopup.style.display = 'none';
}

function showQuickstart(){
    window.location.href = "QuickStart.html";
}

// Displays the new tree form popup
function showNewTreePopup(event) {
    $('#newtreeform').css({
        'display': 'block',
        'bottom': '5px',
        'right': '5%',
        'opacity': "0",
        'animation-delay': "0s",
        'animation-name': "fadein",
        'animation-iteration-count': "1",
        'animation-timing-fcuntion' : "ease-in",
        'animation-duration': "1s",
        'animation-fill-mode': "forwards",
    });
    closeNav();
}

// Opens the share tree menu
function openShareMenu(event) {
    $('#sharetreeform').css({
        'display': 'block',
        'top': event.pageY + -100 + 'px',
        'left': event.pageX + 'px',
        'opacity': "0",
        'animation-delay': "0s",
        'animation-name': "fadein",
        'animation-iteration-count': "1",
        'animation-timing-fcuntion' : "ease-in",
        'animation-duration': "1s",
        'animation-fill-mode': "forwards"
    });
}

// Closes the share tree menu
function closeShareMenu() {
    shareMenu.style.display = 'none';
}
