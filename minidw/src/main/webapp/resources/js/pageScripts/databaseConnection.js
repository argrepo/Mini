var headers = {};
var databaseConnection = {
        initialPage : function() {
        	$("#existingConnectionsTable").DataTable({"language": {
	                "url": selectedLocalePath
	            }});
             setTimeout(function(){
				$("#database_username").val("").attr("disabled",false);
				$("#database_password").val("").attr("disabled",false);
             }, 25)
            var token = $("meta[name='_csrf']").attr("content");
 			var header = $("meta[name='_csrf_header']").attr("content");
 			headers[header] = token;
 			// $(".timesZone,.dateFormat").select2({allowClear: true,  theme: "classic" });
        },
        showSuccessMessage:function(text, hidetick, time) {
            $(".messageText,.successMessageText").empty();
            $(".successMessageText").html(text +(hidetick ? '' : '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>'));
            $(".successMessage").show();
            setTimeout(function() { $(".successMessage").hide(); }, time && time>0 ? time : 10000);
        },
        resetNewConnectionForm : function(){
        	$(".connectionTitle").text(globalMessage['anvizent.package.button.createNewConnection']);
        	common.clearValidations(['#database_connectionName', '#database_serverName', '#database_username', '#database_password',"#dateFormat","#timesZone","dataSourceName","#dataSourceOtherName"]);
        	$("#editConnection,#updateConnection, .msAccessDBFile").hide();
        	$("#testConnection,#saveNewConnection_dataBaseType").show();
        	$("#database_connectionName,#database_serverName,#database_username,#database_password").val("").removeAttr("disabled");
        	 var urlformat = $("#database_databaseType option:selected").data("urlformat");
		 	 $('.serverIpWithPort').empty().text("Format : "+urlformat); 	
        	$("#database_databaseType").val($("#database_databaseType option:first").val()).removeAttr("disabled");
    		$("#database_connectionType").val($("#database_connectionType option:first").val()).removeAttr("disabled");
    		$("#database_databaseType").val(1);
    		$("#dateFormat").val('').removeAttr("disabled");;
    		$("#timesZone").val(common.getTimezoneName()).removeAttr("disabled");
    		$("#dataSourceName").val(0).removeAttr("disabled");
    		$("#dataSourceOtherName").val("").removeAttr("disabled");
    		
    		
        },
        updateConnectionPanel : function(result){
		       var  connectionname = result["connectionName"],
		       		databaseId = result["database"].id,
		       		connectionType = result["connectionType"], 
		       		server = result["server"],
		       		username = result["username"],
		       		password = result["password"],
		            dateFormat = result["dateFormat"],
		            timesZone = result["timeZone"],
		            dataSource = result["dataSourceName"]
		        	 
		       $("#database_connectionName").val(connectionname).attr("disabled","disabled");
		       $("#database_databaseType").val(databaseId).attr("disabled","disabled");
		       $("#database_connectionType").val(connectionType).attr("disabled","disabled");
			   $("#database_serverName").val(server).attr("disabled","disabled");
			   $("#database_username").val(username).attr("disabled","disabled");
			   $("#database_password").val(password).attr("disabled","disabled");
			   $("#dateFormat").val(dateFormat).attr("disabled","disabled");
			   $("#timesZone").val(timesZone).attr("disabled","disabled");
			   if (dataSource){
				   $("#dataSourceName").val(dataSource).attr("disabled","disabled");;
			   }
			   $("#dataSourceName").trigger("change");
			   $("#createNewConnectionPopUp").modal("show");
        },
       
    	getILDatabaseConnections: function(from) {
     		var userID = $("#userID").val();
     		var url_getConnections = "/app/user/"+userID+"/package/getUserILConnections";
     		var myAjax = common.loadAjaxCall(url_getConnections,'GET','',headers);
     	    myAjax.done(function(result) {
     	    		databaseConnection.updateExistingDatabaseConnections([],from);
     		    	if(result != null && result.hasMessages ){
     		    		if(result.messages[0].code == "SUCCESS"){
     		    			databaseConnection.updateExistingDatabaseConnections(result.object,from) ; 
     			    	} else {
     				    	common.displayMessages(result.messages);
     			    	}
     		    	} else {
     		    		var messages = [ {
     		    			code : globalMessage['anvizent.message.error.code'],
 							text : globalMessage['anvizent.package.label.unableToProcessYourRequest']
     					} ];
     		    		common.displayMessages(messages);
     		    	}
     		    	
     	    });
     	},
    	 
    	editConnection : function() {
    			$(".connectionTitle").text(globalMessage['anvizent.package.button.editConnection']);
				$("#saveNewConnection_dataBaseType,#editConnection, .msAccessDBFile").hide();
				$("#updateConnection,#testConnection").show();
				$("#database_connectionName,#database_serverName,#database_username,#database_password,#database_connectionType,#dateFormat,#timesZone,#dataSourceName,#dataSourceOtherName").removeAttr("disabled");
				var connectorId=$("#database_databaseType option:selected").attr("data-connectorId");
			    var urlformat = $("#database_databaseType option:selected").data("urlformat");
		        $('.serverIpWithPort').empty().text("Format : "+urlformat);
    	},
    	validateDateForamtAndTimeZone : function(){
 	        var timeZone = $("#timesZone").val();
    		      var validate = true;
    		   	 if(timesZone == ''){
    		   		 common.showcustommsg("#timesZone", "please select time zone","#timesZone");
    		   		 validate = false;
    		   	 }
    		   	return validate;
    	},
	showCustomMessage: function(selector, msg) {
		$(selector).empty();
		var message = '<div class="alert '+(msg.code === 'SUCCESS' ? 'alert-success' : 'alert-danger')+'">' +msg.text+ '</div>';
		$(selector).append(message).show();
		setTimeout(function() { $(selector).hide().empty(); }, 5000);
	},
    testAndSaveDbConnection : function(elementId,headers,selectData){
    	   var userID = $("#userID").val();
    	   showAjaxLoader(true);
  		   var url_connectionTest = "/app/user/"+userID+"/package/connectionTest";
  		   var myAjax = common.postAjaxCall(url_connectionTest,'POST', selectData,headers);
  		    myAjax.done(function(result) {
  		    	showAjaxLoader(false);
  		    	  if(result != null && result.hasMessages){
  		    		  if(result.object.code == "SUCCESS"){
  		    				  if(elementId == "testConnection"){
  		    					  common.showSuccessAlert(result.object.text);
  		    					  return false; 
  		    				  }
  		    				  if(elementId == "saveNewConnection_dataBaseType"){
  		    					  var url_createILConnection = "/app/user/"+userID+"/package/createsILConnection";
  		    					   var myAjax1 = common.postAjaxCall(url_createILConnection,'POST', selectData,headers);
  		    					    myAjax1.done(function(result) {
  		    					    		  if(result != null && result.hasMessages){
  		    					    			  if(result.messages[0].code == "SUCCESS"){
  		    					    				if (selectData.dataSourceName == "-1"){
  	                                            	  common.addToSelectBox(dataSourceOther,"option.otherOption")
  		    					    				}
  		    					    				  if(result.messages[0].code == 'DUPL_CONN_NAME'){
  			    					    				  common.showcustommsg("#IL_database_connectionName", result.messages[0].text);
  			    					    				  return false;
  			    					    			  } 
  		    					    				  databaseConnection.resetConnection();
  			    					    			  $("#databaseConnectionPanel").hide();
  			    					    			  var message = result.messages[0].text;
  			    					    		      databaseConnection.showSuccessMessage(message+" "+globalMessage['anvizent.package.label.pleaseSelectTheConnectionToCompleteTheProcess'], true, 5000);
  			    					    		      databaseConnection.getILDatabaseConnections('fromSpOrCp');
  		    					    			  }else {
  		    								    		common.displayMessages(result.messages);
  		    								    	}
  		    					    		  }else {
  	    								    		var messages = [ {
  	    								    			code : globalMessage['anvizent.message.error.code'],
  	    												text : globalMessage['anvizent.package.label.unableToProcessYourRequest'] 
  	    											} ];
  	    								    		common.displayMessages(messages);
  	    								    	}
  		    					    	  
  		    					    });
  		    				  }
  		    				 
  		    			 
  		    		  }else{
  		    			databaseConnection.showCustomMessage("#databasemessage", {code: result.object.code, text: result.object.text });
  		    		  }
  		    	  }else {
  			    		var messages = [ {
  			    			code : globalMessage['anvizent.message.error.code'],
  							text : globalMessage['anvizent.package.label.unableToProcessYourRequest']
  						} ];
  			    		common.displayMessages(messages);
  			    	}
  		    });
    	},
    	updateExistingDatabaseConnections : function(result,from){
    		if(from === 'fromSpOrCp'){ 
    		$("#existingConnections").empty();
    		$("#existingConnections").append("<option value=''>"+globalMessage['anvizent.package.label.selectConnection']+"</option>");
    		if(result.length > 0){
    			if(result.length == 1){ 
    			var existingConnectins='';
    			$.each(result, function(key, obj) { 
    				var disabled = obj["webApp"] && !obj["availableInCloud"] ? 'disabled':'';
    				 existingConnectins+= "<option value='" + obj["connectionId"] + "'" +disabled+" selected>" + obj["connectionName"]+(obj["webApp"] && !obj["availableInCloud"] ? ' ( Local DB)':'') + "</option>";
    			 });
    			$("#existingConnections").append(existingConnectins);
    			$("#existingConnections").trigger("change");
    		} else {
    			var existingConnectins='';
    			$.each(result, function(key, obj) {
    				var disabled = obj["webApp"] && !obj["availableInCloud"] ? 'disabled':'';
     				 existingConnectins+= "<option value='" + obj["connectionId"] + "'" + disabled+">" + obj["connectionName"]+(obj["webApp"] && !obj["availableInCloud"] ? ' ( Local DB)':'') + "</option>";
    			 
    			 });
    			$("#existingConnections").append(existingConnectins);
    		}
    	  }
    		}else{

        		var existingConnectionsTable = $("#existingConnectionsTable").DataTable();
        		existingConnectionsTable.clear();
        			$.each(result, function(key, obj) {
        				var disabled = obj["webApp"] && !obj["availableInCloud"] ? 'disabled':'';
        				var editButton = "<button class='btn btn-primary btn-sm tablebuttons editConnection'  data-connectionId='"+obj["connectionId"]+"' "+disabled+" >"+
        								 "<i class='fa fa-pencil'aria-hidden='true' title='"+globalMessage['anvizent.package.label.edit']+"'></i></button>";
        				
        				var deleteButton = "<button class='btn btn-primary btn-sm tablebuttons deleteConnection' data-connectionId='"+obj["connectionId"]+"'>"+
    					 				   "<span class='glyphicon glyphicon-trash' title='"+globalMessage['anvizent.package.label.delete']+"' aria-hidden='true'></span></button>";
        				
        				var row = [];
        				row.push(key+1);
        				row.push(obj["connectionId"]);
        				row.push(obj["connectionName"].encodeHtml()+(obj["webApp"] && !obj["availableInCloud"] ? '( Local DB)':''));
        				row.push(editButton);
        				row.push(deleteButton);
        				existingConnectionsTable.row.add(row);    				
        			});
        			$("#createNewConnectionPopUp").modal("hide");
        			existingConnectionsTable.draw();
        	
    		}
    	},
    	resetConnection : function() {
    		$("#IL_database_connectionName").val("").removeAttr("disabled");
    		$("#IL_database_serverName").val("").removeAttr("disabled");
    		$("#IL_database_username").val("").removeAttr("disabled");
    		$("#IL_database_password").val("").removeAttr("disabled");
    		$("#IL_database_databaseType").val($("#IL_database_databaseType option:first").val()).removeAttr("disabled");
    	    $("#IL_database_connectionType").val($("#IL_database_connectionType option:first").val()).removeAttr("disabled");
    	    $("#existingConnections").val("");
    	    $(".duplicateConnectionNameLabel").empty();
    	    $("#dateFormat").val("").removeAttr("disabled");
    	    $("#timesZone").val(common.getTimezoneName()).removeAttr("disabled");
    	    $("#dataSourceName").val("0").removeAttr("disabled");
    	    $("#dataSourceOtherName").val("");
    	},
};

if($(".databaseConnection-page").length){
    databaseConnection.initialPage();
    $("#timeZone").val(common.getTimezoneName()).trigger("change");
    //edit and update existing connections
    $(document).on('click','.editConnection', function(){
		var userID = $("#userID").val();
    	var connectionId = $(this).attr("data-connectionId");
    	$(".connectionTitle").text(globalMessage['anvizent.package.button.editConnection']);
    	$("#updateConnection").attr("data-connectionId",connectionId);
		$("#editConnection").show();
		$(".dataSourceOther").show();
		$("#saveNewConnection_dataBaseType,#testConnection,#updateConnection").hide();
		$("#database_databaseType").val($("#database_databaseType option:first").val());
		common.clearValidations(['#database_connectionName', '#database_serverName', '#database_username', '#database_password',"#dateFormat","timesZone","#dataSourceName","#dataSourceOtherName"]);
		$(".serverIpWithPort").empty();
		
		var url_getConnectionById = "/app/user/"+userID+"/package/getILsConnectionById/"+connectionId;
		if(connectionId != null){
			showAjaxLoader(true);
		    var myAjax = common.loadAjaxCall(url_getConnectionById,'GET','',headers);
		    myAjax.done(function(result) {
			   showAjaxLoader(false);
			   if(result != null && result.hasMessages) {
				   if(result.messages[0].code == "SUCCESS"){
	    		  	databaseConnection.updateConnectionPanel(result.object);
	    		  	console.log(result);
				   }else{
					   common.displayMessages(result.messages);
				   }
			   }else{
				   var messages = [ {
					   code : globalMessage['anvizent.message.error.code'],
					   text : globalMessage['anvizent.package.label.unableToProcessYourRequest']
					} ];
		    		common.displayMessages(messages);
			   }
		   });
		}
	});
    
    $(document).on("click","#editConnection",function(){
    	databaseConnection.editConnection();
    });
    
  //create new connection
    $(document).on("click","#createNewConnection_dataBaseType",function(){
    	$(".dataSourceOther").hide();
    	databaseConnection.resetNewConnectionForm();
    	$("#createNewConnectionPopUp").modal("show");
    });
    
    $(document).on('click', '#saveNewConnection_dataBaseType,#testConnection,#updateConnection', function(){
	       var elementId = this.id;
	       var database_connectionName = $("#database_connectionName").val().trim();
	       var database_databaseTypeId = $("#database_databaseType").val();
	       var database_databaseType = $("#database_databaseType option:selected").text();
	       var database_connectionType = $("#database_connectionType").val();
	       var database_serverName = $("#database_serverName").val();
	       var database_username = $("#database_username").val();
	       var database_password = $("#database_password").val();
	       var userID = $("#userID").val();
	       var connector_Id = $("#database_databaseType option:selected").attr("data-connectorId");
	       var connectionId = $(this).attr("data-connectionId");
	       var dateFormat = $("#dateFormat").val();
	       var timeZone = $("#timesZone").val();
	       var dataSourceName=  $("#dataSourceName").val();
	       var dataSourceOther = $("#dataSourceOtherName").val();
	      
	       common.clearValidations(["#dateFormat","#timesZone","#dataSourceName","#dataSourceOtherName"]);
	       var from ="fromMenu";
	       
	       var selectors = [];
	       selectors.push('#database_connectionName');
	       selectors.push('#database_serverName');
	       selectors.push('#dataSourceName');
	       
	       if(dataSourceName == "-1"){
	    	   if(dataSourceOther.trim().length == 0){
	    		   common.showcustommsg("#dataSourceOtherName", globalMessage['anvizent.package.label.enterDataSource'],"#dataSourceOtherName");
	    		   return false;
	    	   }
	       }
	       
	       var valid = common.validate(selectors);
	
	    /*   if(connector_Id != 6 && connector_Id != 7 &&  connector_Id != 3 && connector_Id != 2){
	           if(valid && database_serverName.indexOf(":") == -1) {
	               var message = globalMessage['anvizent.package.label.pleaseMentionPortNumberAfterServerIPAddressSeperatedby']+ '<b>:</b> Eg: 127.0.0.1:3306'
	                common.showcustommsg("#database_serverName", message);
	               return false;
	           }
	       }*/
	
	       if (!valid) {
	           return false;
	       }
	       if(elementId == "saveNewConnection_dataBaseType" || elementId == "updateConnection"){
           	var validate =  databaseConnection.validateDateForamtAndTimeZone();
           	  if (!validate) {
      	           return false;
      	        }
	       }
	       
	       var selectData={
	               clientId : userID,
	               database :{
	                   id: database_databaseTypeId,
	                   name : database_databaseType
	               },
	               connectionType : database_connectionType,
	               server : database_serverName,
	               username : database_username,
	               password : database_password,
	               connectionName : database_connectionName,
	               connectionId : connectionId,
	               dateFormat:dateFormat,
	           	   timeZone:timeZone,
	           	   dataSourceName:dataSourceName,
	           	   dataSourceNameOther:dataSourceOther
	               
	       };
	        var token = $("meta[name='_csrf']").attr("content");
   		    var header = $("meta[name='_csrf_header']").attr("content");
   			headers[header] = token;
	        showAjaxLoader(true);
	        var url_connectionTest = "/app/user/"+userID+"/package/connectionTest";
	        var myAjax = common.postAjaxCall(url_connectionTest,'POST', selectData,headers);
	        myAjax.done(function(result) {
	            showAjaxLoader(false);
	              if(result != null && result.hasMessages){
	                  if(result.object.code == "SUCCESS"){
	                      if(elementId == "testConnection"){
	                    	  common.showSuccessAlert(result.object.text);
	                          return false;
	                      }
	                      if(elementId == "saveNewConnection_dataBaseType"){
	                          var url_createILConnection = "/app/user/"+userID+"/package/createsILConnection";
	                          var myAjax1 = common.postAjaxCall(url_createILConnection,'POST', selectData,headers);
	                          myAjax1.done(function(result) {
	                                  
	                                      if(result != null && result.hasMessages){
                                    	  	if(result.messages[0].code == "SUCCESS"){
	                                        	  databaseConnection.getILDatabaseConnections(from);
	                                              var message = result.messages[0].text;
	                                              if ( dataSourceName == "-1")
	                                            	  common.addToSelectBox(dataSourceOther,"option.otherOption")
	                                              databaseConnection.showSuccessMessage(message, true, 15000);
                                    	  	} else if(result.messages[0].code == 'DUPL_CONN_NAME'){
	                                    		  common.showcustommsg("#database_connectionName", result.messages[0].text);
	                                              return false;
	                                        } else {
    								    		common.showErrorAlert(result.messages[0].text);
    								    	}
	                                      }else {
  								    		var messages = [ {
  								    			code : globalMessage['anvizent.message.error.code'],
  												text : globalMessage['anvizent.package.label.unableToProcessYourRequest'] 
											} ];
								    		common.displayMessages(messages);
								    		$("#createNewConnectionPopUp").modal("hide");
								    	}
	                                  
	                            });
	                      }
	                      if(elementId == "updateConnection"){
	               	           	var url_updateConnection = "/app/user/"+userID+"/package/updateDatabaseConnection";
		                        var myAjax1 = common.postAjaxCall(url_updateConnection,'POST', selectData,headers);
		                        myAjax1.done(function(result) {
		                                  if(result != null && result.hasMessages){
		                                    	  if(result.messages[0].code == 'DUPL_CONN_NAME'){
		                                    		  common.showcustommsg("#database_connectionName", result.messages[0].text);
		                                              return false;
		                                          }else if(result.messages[0].code == "SUCCESS"){
		                                        	  databaseConnection.getILDatabaseConnections(from);
		                                              var message = result.messages[0].text;
		                                              if ( dataSourceName == "-1")
		                                            	  common.addToSelectBox(dataSourceOther,"option.otherOption")
		                                              databaseConnection.showSuccessMessage(message, true, 15000);
		                                          }else{
		                                        	  common.showErrorAlert(result.messages[0].text); 
		                                          }
		                                  }else{
		          							var messages = [ {
		          								code : globalMessage['anvizent.message.error.code'],
		        								text : globalMessage['anvizent.package.label.unableToProcessYourRequest']
		        							} ];
		        				    		common.displayMessages(messages);
		        				    		$("#createNewConnectionPopUp").modal("hide");
		        						}
		                        });
	                      }
	                  }else{
	                      common.showErrorAlert(result.object.text);
	                  }
	           }else {
		    		var messages = [ {
		    			code : globalMessage['anvizent.message.error.code'],
						text : globalMessage['anvizent.package.label.unableToProcessYourRequest']
					} ];
		    		common.displayMessages(messages);
		    	}
	     });
    });
     
    //delete existing connections
    $(document).on("click",".deleteConnection",function(){
    	$("#deleteConnectionAlert").modal("show");
    	var connectionId = $(this).attr("data-connectionId");
    	$("#confirmDeleteConnection").attr("data-connectionId",connectionId);
    });
    
    $(document).on("click","#confirmDeleteConnection",function(){
    	var userID = $("#userID").val();
		var connectionId = $(this).attr("data-connectionId");
		var token = $("meta[name='_csrf']").attr("content");
		var header = $("meta[name='_csrf_header']").attr("content");
		headers[header] = token;
		var url_deleteConnection = "/app/user/"+userID+"/package/deleteILConnection/"+connectionId;
		showAjaxLoader(true);
		var myAjax = common.postAjaxCall(url_deleteConnection,'POST','',headers);
 	    myAjax.done(function(result) {
 	    	showAjaxLoader(false);
 	    	  if(result != null && result.hasMessages){ 
	    			  $("#deleteConnectionAlert").modal("hide");
	    			  if(result.messages[0].code == "ERROR") {	    				 
	    				  $('.messageText').empty().append(result.messages[0].text).show();
		    			  setTimeout(function() { $(".message").hide().empty(); }, 10000);
	    			  }
	    			  else if(result.messages[0].code == "SUCCESS") {
	    				  databaseConnection.showSuccessMessage(result.messages[0].text, true, 5000);
	    				  databaseConnection.getILDatabaseConnections('fromMenu');
	    			  }
	    		  
	    	  }else{
		    		var messages = [ {
		    			code : globalMessage['anvizent.message.error.code'],
		    			text : globalMessage['anvizent.package.label.unableToProcessYourRequest']
		    		} ];
		    		common.displayMessages(messages);
		    	}
 	    });
    });

    $(document).on('change', '#database_databaseType', function(){
    	var connectionId=$(this).find('option:selected').attr("data-connectorId");
	    var urlformat = $(this).find('option:selected').data("urlformat");
        $('.serverIpWithPort').empty().text("Format : "+urlformat);
    });
    $(document).on("change","#dataSourceName",function(){
    	var dataSourceName=  $("#dataSourceName option:selected").val().trim();
    	if(dataSourceName == "-1"){
    		$("#dataSourceOtherName").val("");
	    	   $(".dataSourceOther").show();
	       }else{
	    	   $(".dataSourceOther").hide();
	       }
    });
    
    
    
} 