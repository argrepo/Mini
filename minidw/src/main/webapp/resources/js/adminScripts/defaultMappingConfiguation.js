var headers = {};
var token = $("meta[name='_csrf']").attr("content");
var header = $("meta[name='_csrf_header']").attr("content");

var defaultMapping = {
		initialPage : function(){
			$(".dashCurrency,.accountingCurrency,.otherCurrency").select2()
				
			$('#existingVerticalsTable,#ConnectorTable,#tdlMasterTable,#webServicesTable').DataTable( {
		        "paging":   false,
		        "info":     false,
		        "language": {
	                "url": selectedLocalePath
	            }
		    } );
			
			$('#tableScriptsMappingTable').DataTable( {
				 "paging":   false,
			        "info":     false,
			        "language": {
		                "url": selectedLocalePath
		            },
				initComplete: function () {
		            this.api().columns([3]).every( function () {
		                var column = this;
		                var select = $('<select><option value="">All</option></select>')
		                    .appendTo( $(".versionSelectBoxDiv").empty() )
		                    .on( 'change', function () {
		                        var val = $.fn.dataTable.util.escapeRegex(
		                            $(this).val()
		                        );
		 
		                        column
		                            .search( val ? '^'+val+'$' : '', true, false )
		                            .draw();
		                    } );
		 
		                column.data().unique().sort().each( function ( d, j ) {
		                    select.append( '<option value="'+d+'">'+d+'</option>' )
		                } );
		            } );
		        }
			
		    } );
			
			
			
			$("#defaultTemplatesTable").DataTable({"language": {
	                "url": selectedLocalePath
	            }});
			if($(".verticalCheckbox").length == $(".verticalCheckbox:checked").length){
				$(".verticalCheckbox").parents("table").find(".selectAll").prop("checked",true);
			}
			if($(".connectorCheckbox").length == $(".connectorCheckbox:checked").length){
				$(".connectorCheckbox").parents("table").find(".selectAll").prop("checked",true);
			}
			if($(".dlsCheckbox").length == $(".dlsCheckbox:checked").length){
				$(".dlsCheckbox").parents("table").find(".selectAll").prop("checked",true);
			}
			if($(".tableScriptsCheckbox").length == $(".tableScriptsCheckbox:checked").length){
				$(".tableScriptsCheckbox").parents("table").find(".selectAll").prop("checked",true);
			}
			if($(".webServiceCheckbox").length == $(".webServiceCheckbox:checked").length){
				$(".webServiceCheckbox").parents("table").find(".selectAll").prop("checked",true);
			}
			setTimeout(function() { $("#pageErrors").hide().empty(); }, 5000);
			
		},
		getBucketList:function(){
			var userID = $("#userId").val();
			headers[header] = token;
			var url_getClientList = "/app_Admin/user/"+userID+"/etlAdmin/getBucketList";
			   var myAjax = common.postAjaxCallObject(url_getClientList,'GET', "" ,headers);
				myAjax.done(function(result) {
					showAjaxLoader(false);
					if(result != null){
			    		  if(result.hasMessages){
		    				  if(result.messages[0].code=="ERROR"){
		    					  common.showErrorAlert(result.messages[0].text);
		    					  var message = result.messages[0].text;	
		    				  }
			    			  if(result.messages[0].code=="SUCCESS"){
			    				  var bucketList = result.object;
			    				  var select$ = $("<select/>",{class:"bucket form-control"});
			    				  $.each(bucketList,function(key,value){
			    					  $("<option/>",{value:key,text:value}).appendTo(select$);
			    				  });
			    				  select$.appendTo(".bucketList");
			    				  select$.val($("#bucketId").val());
			    				  
			    			  }
			    		  }
					}
				});
		},
}
if($('.defaultMappingConfiguration-page').length){
	defaultMapping.initialPage();
	defaultMapping.getBucketList();
	
	$(document).on("click","#saveVertical, #saveConnector, #saveDls, #saveTableScripts, #saveWebServices,#saveS3Bucket",function(){
			
		var selectorId = this.id,
			userID = $("#userId").val(),
			masterIds = [],
		 	templateId = $("#templateId").val(),
		 	messageText = "",
		 	mappingType = "";
		var id = $(".bucket option:selected").val();
		
		if(selectorId == "saveVertical"){
			$(".verticalCheckbox:checked").each(function(){
				masterIds.push($(this).val());
			});
			messageText = globalMessage['anvizent.package.label.pleaseChooseAtLeastOneVertical'];
			mappingType = "vertical";
		}
		else if(selectorId == "saveConnector"){
			$(".connectorCheckbox:checked").each(function(){
				masterIds.push($(this).val());
			});
			messageText = globalMessage['anvizent.package.label.pleaseChooseAtLeastOneConnector'];
			mappingType = "connector";
		}
		else if(selectorId == "saveDls"){
			$(".dlsCheckbox:checked").each(function(){
				masterIds.push($(this).val());
			});
			messageText = globalMessage['anvizent.package.label.pleaseChooseAtLeastOneDL'];
			mappingType = "dl";
		}
		else if(selectorId == "saveTableScripts"){
			$(".tableScriptsCheckbox:checked").each(function(){
				masterIds.push($(this).val());
			});
			messageText = globalMessage['anvizent.package.label.pleaseChooseAtLeastOneTableScript'];
			mappingType = "tablescript";
		}
		else if(selectorId == "saveWebServices"){
			$(".webServiceCheckbox:checked").each(function(){
				masterIds.push($(this).val());
			});
			messageText = globalMessage['anvizent.package.label.pleaseChooseAtLeastOneWebservice'];
			mappingType = "webservice";
		}else{
			masterIds.push(id);
			messageText = globalMessage['anvizent.package.label.pleaseChooseAtLeastOneWebservice'];
			mappingType = "s3Bucket";
		}
		
	
        if(masterIds != ''){	 		
        	var selectData = {
	 				masterIds : masterIds.join(","),
	 				templateId : templateId,
	 				mappingType : mappingType
			}
        	
	 		showAjaxLoader(true);
        	headers[header] = token;
			var url_updateConnectorsAsDefault = "/app_Admin/user/"+userID+"/etlAdmin/saveDefaultTemplateMasterMappingData";
			   var myAjax = common.postAjaxCallObject(url_updateConnectorsAsDefault,'POST',selectData,headers);
				myAjax.done(function(result) {
					showAjaxLoader(false);
					if(result != null){						
			    		  if(result.hasMessages){
		    				  if(result.messages[0].code=="ERROR"){
		    					  var message = result.messages[0].text;
		    					  $("#successOrErrorMessage").empty().append("<div class='alert alert-danger'>"+message+"</div>").show();
			    				  setTimeout(function() { $("#successOrErrorMessage").hide().empty(); }, 10000);  					  
			    			  }
			    			  if(result.messages[0].code=="SUCCESS"){
			    				  var message = result.messages[0].text;
			    				  $("#successOrErrorMessage").empty().append("<div class='alert alert-success'>"+message+"</div>").show();
			    				  setTimeout(function() { $("#successOrErrorMessage").hide().empty(); }, 10000);
					    		 
			    			  }
			    		  }
					}
				});
		}else{
			var message = [{
				code : globalMessage['anvizent.message.error.code'],
				text : messageText
			}];
			common.displayMessages(message);
		}
	});
	
	$(document).on("click",".selectAll",function(){
		if($(this).is(":checked")){
			$(this).parents("table").find("input[type='checkbox']").prop("checked",true);
		}
		else{
			$(this).parents("table").find("input[type='checkbox']").prop("checked",false);
		}
	});
	
	$(document).on("click",".verticalCheckbox",function(){
		if($(".verticalCheckbox").length == $(".verticalCheckbox:checked").length){
			$(this).parents("table").find(".selectAll").prop("checked",true);
		}else{
			$(this).parents("table").find(".selectAll").prop("checked",false);
		}
	});
	
	$(document).on("click",".connectorCheckbox",function(){
		if($(".connectorCheckbox").length == $(".connectorCheckbox:checked").length){
			$(this).parents("table").find(".selectAll").prop("checked",true);
		}else{
			$(this).parents("table").find(".selectAll").prop("checked",false);
		}
	});
	
	$(document).on("click",".dlsCheckbox",function(){
		if($(".dlsCheckbox").length == $(".dlsCheckbox:checked").length){
			$(this).parents("table").find(".selectAll").prop("checked",true);
		}else{
			$(this).parents("table").find(".selectAll").prop("checked",false);
		}
	});
	
	$(document).on("click",".tableScriptsCheckbox",function(){
		if($(".tableScriptsCheckbox").length == $(".tableScriptsCheckbox:checked").length){
			$(this).parents("table").find(".selectAll").prop("checked",true);
		}else{
			$(this).parents("table").find(".selectAll").prop("checked",false);
		}
	});
	
	$(document).on("click",".webServiceCheckbox",function(){
		if($(".webServiceCheckbox").length == $(".webServiceCheckbox:checked").length){
			$(this).parents("table").find(".selectAll").prop("checked",true);
		}else{
			$(this).parents("table").find(".selectAll").prop("checked",false);
		}
	});
	
	$("#createDefaultTemplate").on("click",function(){
		var status = true;
		common.clearValidations(["#templateName,#description"]);
		$("#defaultTemplatesForm").prop("action",$("#add").val());
		var templateName = $("#templateName").val();
		var description = $("#description").val();
		if(templateName == ''){
			common.showcustommsg("#templateName", globalMessage['anvizent.package.label.pleaseEnterTemplateName'],"#templateName");
  	    	status = false;
		}
		if(description == ''){
			common.showcustommsg("#description", globalMessage['anvizent.package.label.PleaseChoosedescription'],"#description");
			status = false;
		}
		
		if(!status){
			return false;
		}
		
		this.form.submit();
		showAjaxLoader(true);
	});
	$("#saveSettings").on("click",function(){
		$("#defaultTemplatesForm").prop("action",$("#save").val());
		this.form.submit();
		showAjaxLoader(true);
	});
	
	$(document).on("click","#saveCurrency",function(){
		 common.clearValidations(["#clientId, .currencyType,#currencyName,#basecurrencyCode,#accountingCurrencyCode,.messageForCurrency"]);
		var dashboardCurrency = $(".dashCurrency").val();
		var userID = $("#userId").val();
		var currencyType = $("[name='currencyType']:checked").val();
		var accountCurrency = $(".accountingCurrency").val();
		var otherCurrency = $(".otherCurrency").val();
		var templateId = $("#templateId").val();
        var validStatus=true;
  	    if(currencyType == ''){
  	    	common.showcustommsg(".currencyType", "Please choose Currency type",".currencyType");
  	    	validStatus=false;
  	    }
  	    	
  	    if(dashboardCurrency == '' && accountCurrency == '' && otherCurrency == ''){
    		common.showcustommsg(".messageForCurrency","Please choose atleast one currency",".messageForCurrency");
  	    	validStatus=false;
    	}
  	    if(!validStatus){
			return false;
		}
		
		if(templateId != ''){	 		
        	var selectData = {
        			templateId:templateId,
        			currencyType:currencyType,
        			currencyName:dashboardCurrency,
        			basecurrencyCode:accountCurrency,
        			accountingCurrencyCode:otherCurrency
			}
        	var token = $("meta[name='_csrf']").attr("content");
			var header = $("meta[name='_csrf_header']").attr("content");
			headers[header] = token;
	 		showAjaxLoader(true);
			var url_update = "/app_Admin/user/"+userID+"/etlAdmin/saveDefaultTemplateMasterMappingDataForCurrency";
			   var myAjax = common.postAjaxCallObject(url_update,'POST',selectData,headers);
				myAjax.done(function(result) {
					showAjaxLoader(false);
					if(result != null){						
			    		  if(result.hasMessages){
		    				  if(result.messages[0].code=="ERROR"){
		    					  var message = result.messages[0].text;
		    					  $("#successOrErrorMessage").empty().append("<div class='alert alert-danger'>"+message+"</div>").show();
			    				  setTimeout(function() { $("#successOrErrorMessage").hide().empty(); }, 10000);  					  
			    			  }
			    			  if(result.messages[0].code=="SUCCESS"){
			    				  var message = result.messages[0].text;
			    				  $("#successOrErrorMessage").empty().append("<div class='alert alert-success'>"+message+"</div>").show();
			    				  setTimeout(function() { $("#successOrErrorMessage").hide().empty(); }, 10000);
					    		 
			    			  }
			    		  }
					}
				});
		}else{
			var message = [{
				code : globalMessage['anvizent.message.error.code'],
				text : messageText
			}];
			common.displayMessages(message);
		}
	});
	
}