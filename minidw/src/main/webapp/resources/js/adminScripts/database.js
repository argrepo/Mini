var  database = {
		initialPage : function() {
			$("#databaseConnectorTable").dataTable();
			setTimeout(function() { $("#pageErrors").hide().empty(); }, 5000);	 
		},
		dbUpdationFormValidation : function(){
			  common.clearValidations(["#databaseName, .activeStatus,#databaseName,#driverName,#protocal,#urlFormat,.connectorJars,.conJars,.uploadedJobFileNames"]);
			
	  	       	var databaseName=$("#databaseName").val();
	  	       	var driverName=$("#driverName").val();
	  	        var protocal=$("#protocal").val();
	  	        var urlFormat=$("#urlFormat").val();
	  	        
	  	      var jobFiles = [];
				$(".jobFilesDiv .fileContainer").find(".connectorJars").each(function(){	   	
					var filePath = $(this).val();
					if(filePath != "")
	    		    jobFiles.push(filePath.substring(filePath.lastIndexOf('\\')+1 , filePath.length));
				});
				
				$(".jobFilesDiv .fileContainer").find(".conJars").each(function(){
					if($(this).parents(".fileContainer").find(".useOldConnectorJarFile").is(":checked")){
						var fileName = $(this).val();
						if(fileName != ''){
							jobFiles.push(fileName);
						}
					}
				});
	  	        
	  	       	var selectors = [];
		   	    selectors.push("#databaseName");
		   	    var regex = /^[0-9a-zA-Z/ /_/,/./-]+$/;
		   	 
	  	        var validStatus=true;
	      	    if(databaseName == '' ){
		  	    	common.showcustommsg("#databaseName", globalMessage['anvizent.package.label.pleaseEnterDatabaseName'],"#databaseName");
		  	    	validStatus=false;
	      	    }else if(!regex.test(databaseName)){
	      	    	common.showcustommsg("#databaseName", globalMessage['anvizent.package.label.specialcharactersnotallowedexceptunderscoredigitsandalphabets'],"#databaseName");
		      	      validStatus=false;
	      	    }else{
	      	    	validStatus = common.validate(selectors);
	      	    	
	      	    }
	      	    if(!$("input[name='isActive']").is(":checked")){
	      	    	common.showcustommsg(".activeStatus", globalMessage['anvizent.package.label.PleaseChooseActiveStatus'],".activeStatus");
		  	    	validStatus=false;
	      	    }
	      	  if(driverName == '' ){
		  	    	common.showcustommsg("#driverName", globalMessage['anvizent.package.label.pleaseEnterDatabaseDriverName'],"#driverName");
		  	    	validStatus=false;
	      	    } 
	      	 if(protocal == '' ){
		  	    	common.showcustommsg("#protocal", globalMessage['anvizent.package.label.pleaseEnterDatabaseProtocal'],"#protocal");
		  	    	validStatus=false;
	      	    }
	      	 if(urlFormat == '' ){
		  	    	common.showcustommsg("#urlFormat", globalMessage['anvizent.package.label.pleaseEnterDatabaseUrlFormat'],"#urlFormat");
		  	    	validStatus=false;
	      	    }
	      	 
	      	 
	      	 $(".jobFilesDiv").find(".connectorJars").each(function(){	   	       
		   	    	if($(this).val() != ''){
		   				  var fileExtension = $(this).val().replace(/^.*\./, '');
		     		      if(!(fileExtension == 'jar')) {
		     		    	common.showcustommsg($(this), globalMessage['anvizent.package.label.pleaseChooseJarFile'],$(this));
		     		    	validStatus=false;
		     		     } 
		   			}
		   		});	
		   	    
		   	    if(jobFiles != ""){
		   	    	for(var i = 0; i <= jobFiles.length; i++) {
			   	         for(var j = i; j <= jobFiles.length; j++) {
			   	             if(i != j && jobFiles[i] == jobFiles[j]) {
			   	            	common.showcustommsg(".uploadedJobFileNames",globalMessage['anvizent.package.label.duplicateJobFiles'],".uploadedJobFileNames");
			   	            	validStatus = false;
			   	                 break;
			   	             }
			   	         }
			   	     }
		   	    }
		   	    
	      	    return validStatus;
		 }
}
if($('.database-page').length){
	database.initialPage();
	
	 $(document).on('click',"#updateDBMaster", function() {
		 
			var status= database.dbUpdationFormValidation();
			console.log("status",status)
			if(!status){ 
			return false;
			}
			else{ 
				$("#databaseForm").prop("action",$("#updateUrl").val()); 
				this.form.submit();
				showAjaxLoader(true);
			}
	 });
	 $("#addDB").on('click', function() {
		 
			var status= database.dbUpdationFormValidation();
			if(!status){
				return false;
			}
			else{
				$("#databaseForm").prop("action",$("#addUrl").val()); 
				this.form.submit();
			    showAjaxLoader(true);
			}
	 });
	 
		$(document).on("click",".addConnectorJar",function(){
			var container = $(".jobFilesDiv");
			var jobFileContainer = $("#fileContainer").clone().removeAttr("id").addClass("fileContainer").show();
			container.append($(jobFileContainer));
		});
		
		$(document).on("click",".deleteConnectorJar",function(){
			$(this).parents(".fileContainer").remove();
		});
	
}