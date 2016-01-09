/**
 * Created by sujeet on 7/1/16.
 */
angular.module("toDoLS")
    .factory("localStorageApi",function(){
        return {
            getKey:function(key){
                if(typeof(Storage) !== "undefined") {
                    var data = localStorage.getItem(key);
                    return data || "ERR_NO_DATA";
                } else {
                    console.log("Sorry, your browser does not support web storage...");
                    return "ERR_NO_SUPPORT";
                }
            },
            setKey:function(key,value){
                if(typeof(Storage) !== "undefined") {
                    localStorage.setItem(key, value);
                    return "SUCCESS"
                } else {
                    console.log("Sorry, your browser does not support web storage...");
                    return "ERR_NO_SUPPORT";
                }
            },
            deleteKey:function(key){
                if(typeof(Storage) !== "undefined") {
                    localStorage.removeItem(key);
                    return "SUCCESS";
                }else{
                    return "ERR_NO_SUPPORT";
                }

            },
            clearAll:function(){
                if(typeof(Storage) !== "undefined") {
                    localStorage.clear();
                    return "SUCCESS";
                }else{
                    return "ERR_NO_SUPPORT";
                }
            }
        };
    })
    .factory("dataServics",function(localStorageApi){
        return {
            getAllData : function(){
              var tempKey,key1,key2,key3,data1,data2,data3;
              var boardKeys = [];

              var db = [];//Completelty organized data
              var tasks = [];//task array for search

              function getJSONResult(key){
                  var rawData = localStorageApi.getKey(key);
                  if(rawData != "ERR_NO_SUPPORT" && rawData != "ERR_NO_DATA"){
                      return JSON.parse(rawData);
                  }
                  return false;
              }
              //Read the dbBoardKeyList
              boardKeys = getJSONResult("boardKeys") || [];
              boardKeys = boardKeys.keys || boardKeys;
              /*Iterate through Array
                - get data and add to Object
                - add the boards obj to boards Array
                - get the taskList array and append it to taskListKeys
              * */
              for(key1 in boardKeys){
                  tempKey = boardKeys[key1];
                  data1 = getJSONResult(tempKey);
                  if(data1){
                      data1.boardKey = tempKey
                      data1.taskList = [];//Add empty taskLis, initilizes in next loop
                      data1.taskListKeys = data1.taskListKeys || [];
                      db.push(data1);
                  }
              }
              /* For every board in db - iterate over the taskListKeys to:
              *     -get the object from localstorage
              *     -add boardName to the object
              *     -add empty tasks
              *     -add to db's boards taskList
              * */
              for(key1 in db){
                  data1 = db[key1];//unit board
                  for(key2 in data1.taskListKeys){
                      tempKey = data1.taskListKeys[key2];
                      data2 = getJSONResult(tempKey);
                      if(data2){
                          data2.taskKeys = data2.taskKeys || [];
                          data2.tlKey = tempKey;
                          data2.boardName = data1.boardName;
                          data2.tasks = [];//Adding empty tasks to every taskList - will be initialized in next loop
                          data1.taskList.push(data2);//Adding taskList Object to board's taskList Array
                      }
                  }
              }
              /*
              * For every taskKeys under board -> taskList get the object
              *     add boardName and ListName to all tasks
              *     add to db's board->taskList->tasks
              *     add to task's array
              * */
              for(key1 in db){
                  data1 = db[key1]
                  for(key2 in db[key1].taskList){
                      data2 = data1.taskList[key2];//taskList object
                      for(key3 in data2.taskKeys){
                          tempKey = data2.taskKeys[key3];
                          data3 = getJSONResult(tempKey);
                          if(data3){
                              data3.taskKey = tempKey;
                              data3.boardName = data1.boardName;
                              data3.taskListName = data2.taskListName;
                              data2.tasks.push(data3);
                              tasks.push(data3);
                          }else{
                              //Invalid data
                              var a =0 ;
                          }

                      }
                  }
              }
              return {
                  "db":db,
                  "tasks":tasks
              };
          },
            updateField:function(dbKey,dbValue,fieldKey){
                //get the obj => update => write
                var rawData = localStorageApi.getKey(dbKey);
                if(rawData != "ERR_NO_SUPPORT" && rawData != "ERR_NO_DATA"){
                    rawData =  JSON.parse(rawData);
                    rawData[fieldKey] = dbValue;
                    rawData = localStorageApi.setKey(dbKey,JSON.stringify(rawData));
                    if(rawData == "SUCCESS"){
                        return true;
                    }else{
                        return String(rawData);
                    }
                }
            },
            deleteEntry:function(parentKey,childkey,fieldKey){
                var parent = localStorageApi.getKey(parentKey);
                if(parent != "ERR_NO_SUPPORT" && parent != "ERR_NO_DATA"){
                    parent = JSON.parse(parent);
                    //Removing key from the array
                    var i = parent[fieldKey].indexOf(childkey);
                    if(~i){
                        parent[fieldKey].splice(i, 1);
                    }
                    parent = JSON.stringify(parent);
                    var lsApi1 = localStorageApi.setKey(parentKey,parent);
                    var lsApi2 = localStorageApi.deleteKey(childkey);
                    if(lsApi1=="SUCCESS" && lsApi2=="SUCCESS"){
                        return true;
                    }else{
                        return false;
                    }
                }
                return false;
            },
            addNewBoard:function(name){
                var key = new Date().getTime();
                var newBoard = {
                    boardName:name,
                    config:{bgClass:'configBG1'},
                    taskListKeys:[]
                };
                var boardKeys = localStorageApi.getKey("boardKeys");
                if(boardKeys != "ERR_NO_SUPPORT" && boardKeys != "ERR_NO_DATA"){
                    boardKeys = JSON.parse(boardKeys);
                    boardKeys.keys.push(String(key));
                    boardKeys = JSON.stringify(boardKeys);
                    var lsApi1 = localStorageApi.setKey("boardKeys",boardKeys);
                    var lsApi2 = localStorageApi.setKey(key,JSON.stringify(newBoard));
                    if(lsApi1=="SUCCESS" && lsApi2=="SUCCESS"){
                        newBoard.taskList = [];
                        newBoard.boardKey = key;
                        return newBoard;
                    }else{
                        return false;
                    }
                }
                return false;
            },
            deleteBoard:function(key){
                var boardKeys = localStorageApi.getKey("boardKeys");
                if(boardKeys != "ERR_NO_SUPPORT" && boardKeys != "ERR_NO_DATA"){
                    boardKeys = JSON.parse(boardKeys);
                    //Removing key from the array
                    var i = boardKeys.keys.indexOf(key);
                    if(~i){
                        boardKeys.keys.splice(i, 1);
                    }
                    boardKeys = JSON.stringify(boardKeys);
                    var lsApi1 = localStorageApi.setKey("boardKeys",boardKeys);
                    var lsApi2 = localStorageApi.deleteKey(key);
                    if(lsApi1=="SUCCESS" && lsApi2=="SUCCESS"){
                        return true;
                    }else{
                        return false;
                    }
                }
                return false;
            },
            addTaskList:function(parentKey,name){
                var boardName = "";
                var key = new Date().getTime();
                var newTL = {
                    taskListName:name,
                    config:{bgClass:'configBG1'},
                    dueOn:'',
                    taskKeys:[]
                };
                var board = localStorageApi.getKey(parentKey);
                if(board != "ERR_NO_SUPPORT" && board != "ERR_NO_DATA"){
                    board = JSON.parse(board);
                    boardName = board.boardName;
                    board.taskListKeys.push(String(key));
                    board = JSON.stringify(board);
                    var lsApi1 = localStorageApi.setKey(parentKey,board);
                    var lsApi2 = localStorageApi.setKey(key,JSON.stringify(newTL));
                    if(lsApi1=="SUCCESS" && lsApi2=="SUCCESS"){
                        newTL.tasks = [];
                        newTL.tlKey = key;
                        newTL.boardName = boardName;
                        return newTL;
                    }else{
                        return false;
                    }
                }
                return false;
            },
            addTask:function(parentKey,name){
                var tlName = "";
                var key = new Date().getTime();
                var newTask = {
                    taskName:name,
                    isDone:false,
                    createdOn:key,
                    dueOn:'',
                    config:{bgClass:''}
                };
                var tl = localStorageApi.getKey(parentKey);
                if(tl != "ERR_NO_SUPPORT" && tl != "ERR_NO_DATA"){
                    tl = JSON.parse(tl);
                    tlName = tl.taskListName;
                    tl.taskKeys.push(String(key));
                    tl = JSON.stringify(tl);
                    var lsApi1 = localStorageApi.setKey(parentKey,tl);
                    var lsApi2 = localStorageApi.setKey(key,JSON.stringify(newTask));
                    if(lsApi1=="SUCCESS" && lsApi2=="SUCCESS"){
                        newTask.taskKey = key;
                        newTask.taskListName = tlName;
                        return newTask;
                    }else{
                        return false;
                    }
                }
                return false;
            }

        };
    })
    .factory("resetApp",function(localStorageApi){
        return {
            resetApp:function(force){
                var test = localStorageApi.getKey("boardKeys");
                if(test !== "ERR_NO_SUPPORT" && (force || test=="ERR_NO_DATA")){
                    /*
                    //Add board key list
                    localStorageApi.setKey("boardKeys",JSON.stringify({keys:["boardKey1","boardKey2"]}));
                    //Add boards
                    localStorageApi.setKey("boardKey1",JSON.stringify({boardName:'DemoBoard',config:{bgClass:'configBG1'},taskListKeys:["taskListKey1","taskListKey2"]}));
                    localStorageApi.setKey("boardKey2",JSON.stringify({boardName:'DemoBoard2',config:{bgClass:'configBG2'},taskListKeys:["taskListKey3"]}));
                    //Add taskLists
                    localStorageApi.setKey("taskListKey1",JSON.stringify({taskListName:"task list one",createdOn:'',dueOn:'',taskKeys:["task1"],config:{bgClass:'configBG1'}}));
                    localStorageApi.setKey("taskListKey2",JSON.stringify({taskListName:"task list two",createdOn:'',dueOn:'',taskKeys:["task2"],config:{bgClass:'configBG2'}}));
                    localStorageApi.setKey("taskListKey3",JSON.stringify({taskListName:"task list 333",createdOn:'',dueOn:'',taskKeys:["task3","task4"],config:{bgClass:'configBG1'}}));
                    //Add tasks
                    localStorageApi.setKey("task1",JSON.stringify({taskName:'task one',isDone:false,createdOn:'',dueOn:'',config:{bgClass:''}}));
                    localStorageApi.setKey("task2",JSON.stringify({taskName:'task two',isDone:true,createdOn:'',dueOn:'',config:{bgClass:''}}));
                    localStorageApi.setKey("task3",JSON.stringify({taskName:'task 333',isDone:true,createdOn:'',dueOn:'',config:{bgClass:''}}));
                    localStorageApi.setKey("task4",JSON.stringify({taskName:'task four',isDone:false,createdOn:'',dueOn:'',config:{bgClass:''}}));

                    */
                    var dummyData = [
                        {
                            key:"boardKeys",
                            object:{keys:["boardKey1","boardKey2"]}
                        },{
                            key:"boardKey1",
                            object:{boardName:'Demo Home Board',config:{bgClass:'configBG3'},taskListKeys:["taskListKey1","taskListKey2"]}

                        },{
                            key:"boardKey2",
                            object:{boardName:'Office Board',config:{bgClass:'configBG5'},taskListKeys:["taskListKey3","taskListKey4","taskListKey5"]}
                        },{
                            key:"taskListKey1",
                            object:{taskListName:"Grocerry",createdOn:'',dueOn:'',taskKeys:["task1","task2"],config:{bgClass:'configBG2'}}
                        },{
                            key:"taskListKey2",
                            object:{taskListName:"Weekend Party",createdOn:'',dueOn:'',taskKeys:["task3","task4","task5"],config:{bgClass:'configBG5'}}
                        },{
                            key:"taskListKey3",
                            object:{taskListName:"Development",createdOn:'',dueOn:'',taskKeys:["task6","task7","task8"],config:{bgClass:'configBG2'}}
                        },{
                            key:"taskListKey4",
                            object:{taskListName:"Mail Check",createdOn:'',dueOn:'',taskKeys:["task9"],config:{bgClass:'configBG1'}}
                        },{
                            key:"taskListKey5",
                            object:{taskListName:"Meetings",createdOn:'',dueOn:'',taskKeys:["task10","task11"],config:{bgClass:'configBG3'}}
                        },{
                            key:"task1",
                            object:{taskName:'get stationary items',isDone:false,createdOn:'',dueOn:'',config:{bgClass:''}}
                        },{
                            key:"task2",
                            object:{taskName:'Rice and Wheat floor',isDone:false,createdOn:'',dueOn:'',config:{bgClass:''}}
                        },{
                            key:"task3",
                            object:{taskName:'Send invitations',isDone:true,createdOn:'',dueOn:'',config:{bgClass:''}}
                        },{
                            key:"task4",
                            object:{taskName:'Order speakers',isDone:true,createdOn:'',dueOn:'',config:{bgClass:''}}
                        },{
                            key:"task5",
                            object:{taskName:'Get Bear',isDone:false,createdOn:'',dueOn:'',config:{bgClass:''}}
                        },{
                            key:"task6",
                            object:{taskName:'Designing',isDone:true,createdOn:'',dueOn:'',config:{bgClass:''}}
                        },{
                            key:"task7",
                            object:{taskName:'get the approvals',isDone:true,createdOn:'',dueOn:'',config:{bgClass:''}}
                        },{
                            key:"task8",
                            object:{taskName:'resolve integration issue',isDone:false,createdOn:'',dueOn:'',config:{bgClass:''}}
                        },{
                            key:"task9",
                            object:{taskName:'send status report to DM',isDone:false,createdOn:'',dueOn:'',config:{bgClass:''}}
                        },{
                            key:"task10",
                            object:{taskName:'Test module 1',isDone:false,createdOn:'',dueOn:'',config:{bgClass:''}}
                        },{
                            key:"task11",
                            object:{taskName:'Help colleague in module 4',isDone:false,createdOn:'',dueOn:'',config:{bgClass:''}}
                        }
                    ];
                    for(var i= 0,len=dummyData.length;i<len;i++){
                        localStorageApi.setKey(dummyData[i].key,JSON.stringify(dummyData[i].object));
                    }
                    return "SUCCESS";
                }else{
                    return "NO_RESET";
                }
                return "ERR_NO_SUPPORT";
            }
        };
    });