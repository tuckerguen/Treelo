var assert = require('chai').assert;
var add = require('../FunctionsToTest').setAddMode;
var remove = require('../FunctionsToTest').removeNode;
var delete1 = require('../FunctionsToTest').deleteTree;
var update = require('../FunctionsToTest').updateNodeInfo;



describe('TestTreeFunctions', function(){
    it('Testing Add Node', function(){
        var before = [
            {
                "sharedUsers": [
                    "janedoe@gmail.com",
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
            }];
            var after = [
                {
                    "sharedUsers": [
                        "janedoe@gmail.com",
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
                        },
                        {
                            "title": "New Node",
                            "description": "Enter Description Here",
                            "sharedUsers": [],
                            "parent": "Test title 1",
                            "children": [],
                            "isComplete": false,
                            "_id": "1"
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
                }];

            var testing = before[0];
            add(testing);
        assert.deepEqual(after, before);
    });

    it('Testing Remove Node', function(){
        var before = [
            {
                "sharedUsers": [
                    "janedoe@gmail.com",
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
                        "children": [
                            {
                            "title": "Child2",
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
                    ]
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
            }];
            var after = [
                {
                    "sharedUsers": [
                        "janedoe@gmail.com",
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
                }];

            var testing = before[0].children[0].children[0];
            var parent = before[0].children[0]
            remove(testing, parent, before);
        assert.deepEqual(before, after);
    });

    it('Testing Delete Tree', function(){
        var before = [
            {
                "sharedUsers": [
                    "janedoe@gmail.com",
                ],
                "children": [
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
                ],
                "children": [
                ],
                "_id": "5daf8c0d73afd05a10c153313",
                "dueDate": null,
                "title": "Test title 2",
                "description": "test description",
                "owner": "johndoe@gmail.com",
                "isComplete": false,
                "isOverdue": false,
                "__v": 0
            }
        ];
            var after = [
                {
                    "sharedUsers": [
                        "janedoe@gmail.com",
                    ],
                    "children": [
                    ],
                    "_id": "5daf8c0d73afd05a10c153313",
                    "dueDate": null,
                    "title": "Test title 2",
                    "description": "test description",
                    "owner": "johndoe@gmail.com",
                    "isComplete": false,
                    "isOverdue": false,
                    "__v": 0
                }
            ];
            variable = 1;
            var testing = before[0];
            assert.deepEqual(delete1(before, testing, variable), after);
    });


    it('Testing Update Tree Information', function(){
        var before = [
            {
                "sharedUsers": [
                    "janedoe@gmail.com",
                ],
                "children": [
                ],
                "_id": "5daf8c0d73afd05a10c15331",
                "dueDate": null,
                "title": "Test title 1",
                "description": "test description",
                "owner": "johndoe@gmail.com",
                "isComplete": false,
                "isOverdue": false,
                "__v": 0
            }
        ];
            var after = [
                {
                    "sharedUsers": [
                        "janedoe@gmail.com",
                    ],
                    "children": [
                    ],
                    "_id": "5daf8c0d73afd05a10c15331",
                    "dueDate": null,
                    "title": "New Title",
                    "description": "New Description",
                    "owner": "johndoe@gmail.com",
                    "isComplete": false,
                    "isOverdue": false,
                    "__v": 0
                }
            ];
            assert.deepEqual(update(before[0], "New Title", "New Description"), after[0]);
    });
});