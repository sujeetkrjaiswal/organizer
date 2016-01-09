/**
 * Created by sujeet on 6/1/16.
 */
angular.module("toDoLS")
    .controller('utilityController', function ($scope,dataServics,resetApp,$location,$mdToast) {
        $scope.initApp = function(isForced){
            var test = resetApp.resetApp(!!isForced);
            var completeData = dataServics.getAllData();
            $scope.config = {};
            $scope.config.acceptedToast = false;
            $scope.db = completeData.db
            $scope.tasks = completeData.tasks;
        }
        $scope.initApp(false);//No forceful reset - only reset if its for the first use


        $scope.colorConfig = [
            {bg:'configBG1',c:'configBG1C'},
            {bg:'configBG2',c:'configBG2C'},
            {bg:'configBG3',c:'configBG3C'},
            {bg:'configBG4',c:'configBG4C'},
            {bg:'configBG5',c:'configBG5C'},
            {bg:'configBG6',c:'configBG6C'}
        ];
        $scope.toastMsg = function(msg){
            $mdToast.show(
                $mdToast.simple()
                    .content(msg)
                    .position("top right")
                    .hideDelay(1500)
            );
        }
    })
    .controller('homeController', function ($scope,$location,$mdToast) {
        $scope.letsPlan = function(){
            $mdToast.hide();
            $location.path("/boards")
        }
        var showBetaToast = function(){
            if(!$scope.config.acceptedToast){
                $mdToast.show(
                    $mdToast.simple()
                        .content('Organizer is in Beta.')
                        .action('OK')
                        .highlightAction(false)
                        .position("bottom right")
                        .hideDelay(10000)
                ).then(function(response) {
                        if ( response == 'ok' ) {
                            $scope.config.acceptedToast = true;
                        }
                    });
            }
        };
        showBetaToast();

    })
    .controller('boardListController', function ($scope,$location,dataServics,$mdDialog) {
        //take to board Page
        $scope.welcomPage = function(){
            $location.path("/");
        };
        $scope.loadBoard = function(index){
            $location.path("/board/"+index);
        };
        $scope.takeToSearch = function(){
            $location.path("/search")
        };
        //Menu
        $scope.openMenu = function($mdOpenMenu, ev) {
           // originatorEv = ev;
            $mdOpenMenu(ev);
        };
        //Add Board Functions
        $scope.askUser = {show:true,input:''};//Show + btn
        $scope.askInputForAdd = function(){
            if($scope.askUser.show ){
                $scope.askUser = {show:false,input:''};
            }
        };
        $scope.addNewBoard = function(name){
            name = String(name).trim();
            if(name.length > 0){
                var newBoard = dataServics.addNewBoard(name);
                if(newBoard){
                    $scope.db.push(newBoard);
                    $scope.toastMsg("New board added successfully");

                }else{
                    $scope.toastMsg("Failed to add board. Try again after some time.");
                }
                $scope.askUser = {show:true,input:''};
            }else{
                $scope.toastMsg("Please enter some name");
            }
        };
        $scope.cancelAdd = function(){
            $scope.askUser = {show:true,input:''};
        };

        //Edit Board Name
        $scope.edit = function(board){
            board.isEditing = 'edit';
            board.tempName = board.boardName;
        };
        $scope.saveEditedBoard = function(board){
            var ds = dataServics.updateField(board.boardKey,angular.copy(board.tempName),"boardName");
            if(ds){
                board.boardName = board.tempName;
                $scope.toastMsg("Changes Saved Successfully.");
            }else{
                $scope.toastMsg("Changes Failed to save.");
            }
            board.isEditing = undefined;

        };
        $scope.closeEdit = function(board){
            board.tempName = "";
            board.isEditing = undefined;
            $scope.toastMsg("Editing Cancelled.")
        };
        //Edit config
        $scope.changeBoardColor = function(board,colorObj){
            var tempConfig = {bgClass:colorObj.bg};
            var ds = dataServics.updateField(board.boardKey,tempConfig,"config");
            if(ds === true){
                board.config.bgClass = colorObj.bg;
                $scope.toastMsg("Changes saved successfully");
            }else{
                $scope.toastMsg("Failed to save changes");
            }
        };
        //Delete board
        $scope.deleteBoard = function(board){
            // Appending dialog to document.body to cover sidenav in docs app
            board.isEditing = 'del';
        };
        $scope.deleteConfirmed = function(bIndex){
            var ds = dataServics.deleteBoard($scope.db[bIndex].boardKey);
            if(ds){
                $scope.db.splice(bIndex,1);
                $scope.toastMsg("Board Deleted Successfully");
            }else{
                $scope.toastMsg("Board Deletion Failed");
            }
        };
        $scope.closeDel = function(board){
            board.isEditing = undefined;
        };
        //Ask For Reset
        $scope.resetApp = function(ev) {
            var confirm = $mdDialog.confirm()
                .title('Reset to factory ?')
                .content('All the content will reset to default and you will loose all your data. This can not be undone.')
                .ariaLabel('Reset')
                .targetEvent(ev)
                .ok('Keep Everything')
                .cancel('I want a FRESH START');
            $mdDialog.show(confirm).then(function() {
                $scope.toastMsg("Reset Cancelled");
            }, function() {
                $scope.initApp(true);//Forced Reset
                $scope.toastMsg("Reset DONE");
            });
        };
    })
    .controller('boardController', function ($scope,$routeParams,$location,dataServics) {
        var bIndex = $routeParams.boardIndex;
        if(bIndex >= $scope.db.length){
            $location.path("/boards");
        }
        //Redirect Funcctions
        $scope.goBack = function(){
            $location.path("/boards");
        };
        $scope.takeToSearch = function(){
            $location.path("/search");
        }
        $scope.board = $scope.db[bIndex];

        //Function Related to Task-Lists Only
        //Adding New TaskList
        $scope.newTaskList = {showPlusBtn:true,taskListName:""};
        $scope.addTL = function(){
            $scope.newTaskList.showPlusBtn = false;
            $scope.newTaskList.taskListName = "";
        };
        $scope.CancellTlAdd = function(){
            $scope.newTaskList.showPlusBtn = true;
            $scope.newTaskList.taskListName = "";
            $scope.toastMsg("Task List Addition cancelled.");
        };
        $scope.saveNewTL = function(tlName){
            tlName = String(tlName).trim();
            if(tlName.length > 0){
                var newTL = dataServics.addTaskList($scope.board.boardKey,tlName);
                if(newTL){
                    $scope.board.taskList.push(newTL);
                    $scope.board.taskListKeys.push(newTL.tlKey);
                    $scope.toastMsg("New Task List added successfully");
                }else{
                    $scope.toastMsg("Failed to add Task List. Try again after some time.");
                }
                $scope.newTaskList.showPlusBtn = true;
                $scope.newTaskList.taskListName = "";
            }else{
                $scope.toastMsg("Please Enter TaskList Name to continue.");
            }

        };
        //Change bg-color of list
        $scope.changeListColor = function(ulist,colorObj){
            var tempConfig = {bgClass:colorObj.bg};
            var ds = dataServics.updateField(ulist.tlKey,tempConfig,"config");
            if(ds === true){
                ulist.config.bgClass = colorObj.bg;
                $scope.toastMsg("Changes saved Successfully.")
            }else{
                $toastMsg("Failed to save changes");
            }
        };
        //Editing TaskList - Name
        $scope.enableEdit = function(tl){
            tl.isEditing = true;
            tl.editedName = tl.taskListName;
        };
        $scope.CancellTlEdit = function(tl){
            tl.isEditing = false;
            tl.editedName = "";
            $scope.toastMsg("Editing Cancelled.")
        };
        $scope.saveEdited = function(tl){
            var edited = tl.editedName;
            edited = String(edited).trim();
            if(edited.length > 0){
                var ds = dataServics.updateField(tl.tlKey,edited,"taskListName");
                if(ds === true){
                    tl.taskListName = edited;
                    $scope.toastMsg("Changes saved Successfully.")
                }else{
                    $toastMsg("Failed to save changes");
                }
            }else{
                $scope.toastMsg("Name Field can not be blank.");
            }
            tl.isEditing = false;
            tl.editedName = "";
        };
        //Deleting Task List
        $scope.askDeleteTL = function(tl){
            tl.askDel = true;
        };
        $scope.cancelDeleteTL = function(tl){
            tl.askDel = false;
            $scope.toastMsg("Delete Cancelled : "+tl.taskListName);
        };
        $scope.delTLConfirmed = function(tl){
            var ds = dataServics.deleteEntry($scope.board.boardKey,tl.tlKey,"taskListKeys");
            if(ds){
                var index = $scope.board.taskListKeys.indexOf(tl.tlKey)
                $scope.board.taskListKeys.splice(index,1);
                $scope.board.taskList.splice(index,1);
                $scope.toastMsg("Task List "+ tl.taskListName +" Deleted Successfully");
            }else{
                $scope.toastMsg("Deletion Failed : "+tl.taskListName);
            }
        };
        //Task Related Functions
        $scope.saveDoneStatus = function(task){
            var status = task.isDone;
            if(status == "false" || !status){
                status  = false
            }else{
                status = true;
            }
            task.isDone = status;
            var ds = dataServics.updateField(task.taskKey,status,"isDone");
            if(ds === true){
                ulist.config.bgClass = colorObj.bg;
                $scope.toastMsg("Changes saved Successfully.")
            }else{
                $toastMsg("Failed to save changes");
            }
        };

        $scope.askDelTask = function(task){
            task.askDel = true;
        };
        $scope.cancelDelTask = function(task){
            task.askDel = false;
            $scope.toastMsg("Delete Cancelled : " + task.taskName);
        };
        $scope.deleteTask = function(tl,task){
            var ds = dataServics.deleteEntry(tl.tlKey,task.taskKey,"taskKeys");
            if(ds){
                var index = tl.taskKeys.indexOf(task.taskKey);
                tl.taskKeys.splice(index,1);
                tl.tasks.splice(index,1);
                $scope.toastMsg("Task "+ task.taskName +" Deleted Successfully");
            }else{
                $scope.toastMsg("Deletion Failed : "+task.taskName);
            }
        };

        //Add Task
        $scope.askAddTask = function(tl){
            tl.addTask = true;
            tl.tempTaskName = "";
        };
        $scope.cancelTaskAdd = function(tl){
            tl.addTask = false;
            tl.tempTaskName = "";
            $scope.toastMsg("Task Add Cancelled.")
        };
        $scope.cnfedTaskAdd = function(tl){
            var name = tl.tempTaskName;
            name = String(name).trim();
            if(name.length>0){
                var newTask = dataServics.addTask(tl.tlKey,name);
                if(newTask){
                    newTask.boardName = $scope.board.boardName;
                    tl.tasks.push(newTask);
                    tl.taskKeys.push(newTask.taskKey);
                    $scope.toastMsg("New Task added successfully");
                }else{
                    $scope.toastMsg("Failed to add Task. Try again after some time.");
                }
                tl.addTask = false;
                tl.tempTaskName = "";
            }else{
                $scope.toastMsg("Please add task title to continue.")
            }
        }
    })
    .controller('searchController', function ($scope, $timeout, $location, $log) {
        $scope.goBack =function(){
          $location.path("/boards");
        };
        $scope.loadBoard = function(key){
            for(var i= 0,len=$scope.db.length;i<len;i++){
                if(key == $scope.db[i].boardKey){
                    $location.path("/board/"+i);
                    break;
                }
            }
        };
        var searchObject = $location.search();
        $scope.searchInput = searchObject.query||"";
        $scope.getSearchResult = function (query) {
            var db = $scope.db;
            query = query.toLowerCase();
            var boardArr, ListArr, TaskArr;
            var boardIndex, listIndex, taskIndex;
            var tempBoard, tempList, tempTask;
            //Level -1 : Board Level
            boardArr = [];
            for (boardIndex in db) {
                tempBoard = angular.copy(db[boardIndex]);
                if (~tempBoard.boardName.toLowerCase().indexOf(query)) {
                    //Board Name has the query - add all the data of board and continue
                    boardArr.push(tempBoard);
                    continue;
                } else {
                    //------------------LEVEL 2------------------
                    //Iterate over TrackList and push the result in temp Array
                    ListArr = []
                    for (listIndex in tempBoard.taskList) {
                        tempList = angular.copy(tempBoard.taskList[listIndex]);
                        if (~tempList.taskListName.toLowerCase().indexOf(query)) {
                            //TaskList Name has the query - push the complete task
                            ListArr.push(tempList);
                            continue;
                        } else {
                            //Iterate over the tasks and push to temp Array
                            TaskArr = [];
                            for (taskIndex in tempList.tasks) {
                                tempTask = angular.copy(tempList.tasks[taskIndex]);
                                if (~tempTask.taskName.toLowerCase().indexOf(query)) {
                                    TaskArr.push(tempTask);
                                }
                            }
                            if (TaskArr.length > 0) {
                                //tempBoard is valid - add it to boardsArr
                                tempList.tasks = TaskArr;
                                ListArr.push(tempList);
                            }
                        }
                    }
                    if (ListArr.length > 0) {
                        //tempBoard is valid - add it to boardsArr by replacing the taskList Array
                        tempBoard.taskList = ListArr;
                        boardArr.push(tempBoard);
                    }
                }
            }
            return boardArr;
        };
        $scope.search = function (query) {
            $scope.result = $scope.getSearchResult(query);
        }
        $scope.result = $scope.getSearchResult($scope.searchInput);
        var a = 0;
    })
