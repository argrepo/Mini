var isTimeZonesPopulated = false; /* Will be populated on demand */
var isWebServicesPopulated = false; /* Will be populated on demand */
var conDetails = [];
var apiDetails = [];
var headers = {};
var globalApiCounter = 1;
var standardPackage = {
		initialPage : function() {
			var token = $("meta[name='_csrf']").attr("content");
			var header = $("meta[name='_csrf_header']").attr("content");
			headers[header] = token;
			setTimeout(function() { $("#pageErrors").hide().empty(); }, 5000);
			$("#disabledPackages").DataTable( {
		        "order": [[ 0, "desc" ]],"language": {
	                "url": selectedLocalePath
	            }
		    } );
			$("#selectedhours").multipleSelect({
				filter : true,
				placeholder : 'Select Hours',
				enableCaseInsensitiveFiltering : true
			});
			$('[data-toggle="tooltip"]').tooltip();		
			
			$("#iLName").val($("#ilId").val());
			if ($("#timesZone").length) {
				$("#timesZone").select2({allowClear: true,  theme: "classic" });
			}
			$(".tool").tooltip({
		          content: function () {
		              return $(this).prop('title');
		          }
			});
			// $(".timesZone,.dateFormat").select2({allowClear: true, theme:
			// "classic" });
	},
	parseAuthenticationWithIlApis : function(authenticationObject) {
		globalApiCounter = 0;
		var tblRequiredParamsForApiAuthentication = $("#requiredParamsForApiAuthenticationTbl tbody").empty();
		$("#requiredParamsForApiAuthenticationDiv").hide();
		$('#webserviceType').val("");
		
		var tblRequiredBodyParamsForApiAuthentication = $("#requiredBodyParamsForApiAuthenticationTbl tbody").empty();
		$("#requiredBodyParamsForApiAuthenticationDiv").hide();
		$(".soapBodyElementDiv").hide();
		
		var tr$ = $("<tr>");
		var td$ = $("<td>");
		var dateFormat = conDetails.webServiceTemplateMaster.dateFormat;
		var webserviceType = conDetails.webServiceTemplateMaster.webserviceType;
		$("#webserviceType").val(webserviceType);
		if(webserviceType == 'SOAP'){
			$(".soapBodyElementDiv").show();
			$(".paginationHypermediaLable").hide();
			$(".paginationDateLable").hide();
		}
		var requiredRequestParams = $.parseJSON(conDetails.webServiceTemplateMaster.apiAuthRequestParams);
		$("#requiredApiRequestParamsFieldSet").hide();
		$("#requiredParamsForApiAuthenticationDiv").hide();	
		
		if (!$.isEmptyObject(requiredRequestParams)) {
			$("#requiredApiRequestParamsFieldSet").show();
			$.each(requiredRequestParams,function(key,val){
				var valArray = standardPackage.getPathParams(val,"{$");
				if ( valArray && valArray.length ) {
					$.each(valArray,function(i,v){
						if (authenticationObject[v]) {
							val = val.split("{$"+v+"}").join(authenticationObject[v]);
						}
						
					});
				}
				
				tblRequiredBodyParamsForApiAuthentication.append(tr$.clone().append(td$.clone().text(key)).append(td$.clone().text(val)) );
			});
			$("#requiredBodyParamsForApiAuthenticationDiv").show();	
		}
		var requiredBodyParams = $.parseJSON(conDetails.webServiceTemplateMaster.apiAuthBodyParams);
		$("#requiredApiBodyParamsFieldSet").hide();
		$("#requiredBodyParamsForApiAuthenticationDiv").hide();	
		if (!$.isEmptyObject(requiredBodyParams)) {
			$("#requiredApiBodyParamsFieldSet").show();
			$.each(requiredBodyParams,function(key,val){
				var valArray = standardPackage.getPathParams(val,"{$");
				if ( valArray && valArray.length ) {
					$.each(valArray,function(i,v){
						if (authenticationObject[v]) {
							val = val.split("{$"+v+"}").join(authenticationObject[v]);
						}
					});
				}
				tblRequiredBodyParamsForApiAuthentication.append(tr$.clone().append(td$.clone().text(key)).append(td$.clone().text(val)) );
			});
			$("#requiredBodyParamsForApiAuthenticationDiv").show();	
		}
		var requiredHeaderParamsForApiAuthentication = $("#requiredHeaderParamsForApiAuthenticationTbl tbody").empty();
		$("#requiredHeaderParamsForApiAuthenticationDiv").hide(); 
		
		var headerKeyvalues = conDetails.headerKeyvalues;
		console.log("headerKeyvalues--->",headerKeyvalues)
		var requiredApiAuthRequestHeaders = conDetails.webServiceTemplateMaster.apiAuthRequestHeaders;
		if ( headerKeyvalues ) {			
			$.each($.parseJSON(headerKeyvalues),function(key,val){ 
				var valArray = standardPackage.getPathParams(requiredApiAuthRequestHeaders,"{#");
				if ( valArray && valArray.length ) {
					$.each(valArray,function(i,v){
						requiredApiAuthRequestHeaders = requiredApiAuthRequestHeaders.split("{#"+v+"}").join(val);
					});
				}
				
			});
		}
		if(requiredApiAuthRequestHeaders){
			var valArray1 = standardPackage.getPathParams(requiredApiAuthRequestHeaders,"{$");
			if ( valArray1 && valArray1.length ) {
				$.each(valArray1,function(i,v){
					requiredApiAuthRequestHeaders = requiredApiAuthRequestHeaders.split("{$"+v+"}").join(authenticationObject[v]);
				});
			}
		}
		
		$("#wsHeaderDetailsDiv").hide();
		if(requiredApiAuthRequestHeaders){
			$("#wsHeaderDetails").text(requiredApiAuthRequestHeaders);
			$("#wsHeaderDetailsDiv").show();
		}
		
		var apiDetailsDiv  = $("#apiDetails");
		apiDetailsDiv.empty();
		
		if(apiDetails.length > 0){
			for(var i=0;i<apiDetails.length;i++){
				
				var apiInfoObj = $("#wsApiDetailsMainDiv").clone().removeAttr("id").addClass("wsApiDetailsDiv").show();
				apiInfoObj.find(".wsApiName").prop({value:apiDetails[i].apiName,title:apiDetails[i].apiName});
				apiInfoObj.find(".wsApiUrl").prop({value:apiDetails[i].apiUrl,title:apiDetails[i].apiUrl});
				apiInfoObj.find("#soapBodyElement").prop({value:apiDetails[i].soapBodyElement,title:apiDetails[i].soapBodyElement});
				
				console.log(apiDetails[i].soapBodyElement);
				console.log("apiDetails[i].baseUrl:", apiDetails[i].baseUrlRequired,apiDetails[i].baseUrl);
				if(apiDetails[i].baseUrlRequired){
				apiInfoObj.find('.wsApiBaseUrlRequired').prop({'checked':true});
				}else{
			    apiInfoObj.find('.wsApiBaseUrlRequired').prop({'checked':false});
				}
				apiInfoObj.find(".getWsApiUrlPathParam").show();
				
				var apiRequestParamsList = [];
				
				if ( apiDetails[i].apiRequestParams ){
					apiRequestParamsList = $.parseJSON(apiDetails[i].apiRequestParams);
				} 
				
				
				if(apiRequestParamsList && apiRequestParamsList.length){
					
					 $.each(apiRequestParamsList,function(k,requestParamValObject){
						 
						 var wsApiRequestParam = $("#wsApiRequestParam").clone().removeAttr("id").addClass("wsApiRequestParam").show();
						 wsApiRequestParam.find(".wsApiRequestParamName").val(requestParamValObject.paramName);
						 wsApiRequestParam.find(".wsApiRequestParamValue").data("mandatory",requestParamValObject.isMandatory);
						 
						 if (!requestParamValObject.isMandatory) {
							 wsApiRequestParam.find(".paramNameMandatory").remove();
						 } 
						 
						 if (requestParamValObject.ispasswordField) {
							 wsApiRequestParam.find(".wsApiRequestParamValue").prop("type","password");
						 }
						 
						 apiInfoObj.find(".wsApiRequestParamKeyValueDiv").append(wsApiRequestParam).show();
						 apiInfoObj.find(".deleteAddWsRequestParams").hide();
						 
					 });
					 apiInfoObj.find(".wsApiRequestParamDiv").show();
				}
				
				
				var apiBodyParamsList = [];
				
				if ( apiDetails[i].apiBodyParams ){
					apiBodyParamsList = $.parseJSON(apiDetails[i].apiBodyParams);
				} 
				
				
				if(apiBodyParamsList && apiBodyParamsList.length){
					
					 $.each(apiBodyParamsList,function(k,bodyParamValObject){
						 
						 var wsApiRequestParam = $("#wsApiRequestParam").clone().removeAttr("id").addClass("wsApiBodyParam").show();
						 wsApiRequestParam.find(".wsApiRequestParamName").val(bodyParamValObject.paramName);
						 wsApiRequestParam.find(".wsApiRequestParamValue").data("mandatory",bodyParamValObject.isMandatory);
						 
						 if (!bodyParamValObject.isMandatory) {
							 wsApiRequestParam.find(".paramNameMandatory").remove();
						 } 
						 
						 if (bodyParamValObject.ispasswordField) {
							 wsApiRequestParam.find(".wsApiRequestParamValue").prop("type","password");
						 }
						 
						 apiInfoObj.find(".wsApiBodyParamKeyValueDiv").append(wsApiRequestParam).show();
						 apiInfoObj.find(".deleteAddWsRequestParams").hide();
						 
					 });
					 apiInfoObj.find(".wsApiBodyParamDiv").show();
				}
				 if(apiDetails[i].apiMethodType == "POST"){
					 apiInfoObj.find(".addWsRequestBodyParams").show();
				 }
				
					var paginationRequestParamsArray = apiDetails[i].paginationRequestParamsData;
					var paginationRequired = apiDetails[i].paginationRequired;
					var paginationType = apiDetails[i].paginationType;
					apiInfoObj.find(".paginationRequired").prop("name","paginationRequired"+i);
					apiInfoObj.find(".paginationOffsetDateType").prop("name","paginationOffsetDateType"+i);
					if (paginationRequired && paginationRequestParamsArray) {
						apiInfoObj.find('.paginationRequired[value="yes"]').attr('checked',paginationRequired);
						var paramArrayObj = JSON.parse(paginationRequestParamsArray);
						if(paginationType == 'offset'){
							apiInfoObj.find('.paginationOffsetDateType[value="offset"]').attr('checked',true);
							$.each(paramArrayObj,function(ind,param){
								apiInfoObj.find(".paginationParamType").val(param['paginationParamType']);
								apiInfoObj.find(".paginationOffSetRequestParamName").val(param['paginationOffSetRequestParamName']);
								apiInfoObj.find(".paginationOffSetRequestParamValue").val(param['paginationOffSetRequestParamValue']);
								apiInfoObj.find(".paginationLimitRequestParamName").val(param['paginationLimitRequestParamName']);
								apiInfoObj.find(".paginationLimitRequestParamValue").val(param['paginationLimitRequestParamValue']);
								apiInfoObj.find(".paginationObjectName").val(param['paginationObjectName']);
								apiInfoObj.find(".paginationSearchId").val(param['paginationSearchId']);
								apiInfoObj.find(".PaginationSoapBody").val(param['PaginationSoapBody']);
								apiInfoObj.find(".paginationOffSetType").show();
							});
							
						}else if(paginationType == 'date'){
							apiInfoObj.find('.paginationOffsetDateType[value="date"]').attr('checked',true);
							$.each(paramArrayObj,function(ind,param){
								apiInfoObj.find('.paginationStartDate').datepicker({
									dateFormat : 'yy-mm-dd',
									defaultDate : new Date(),
									changeMonth : true,
									changeYear : true, 
									yearRange : "0:+20",
									numberOfMonths : 1
								});
								apiInfoObj.find(".paginationParamType").val(param['paginationParamType']);
								apiInfoObj.find(".paginationStartDateParam").val(param['paginationStartDateParam']);
								apiInfoObj.find(".paginationEndDateParam").val(param['paginationEndDateParam']);
								apiInfoObj.find(".paginationStartDate").val(param['paginationStartDate']);
								apiInfoObj.find(".paginationDateRange").val(param['paginationDateRange']);
								apiInfoObj.find(".paginationDateType").show();
								
							});
						} else {
							
							$.each(paramArrayObj,function(ind,param){
								apiInfoObj.find('.paginationOffsetDateType[value="hypermedia"]').attr('checked',true);
								apiInfoObj.find(".paginationHyperLinkPattern").val(param['paginationHyperLinkPattern']);
								apiInfoObj.find(".paginationHypermediaPageLimit").val(param['paginationHypermediaPageLimit']);
								apiInfoObj.find(".paginationHypermediaType").show();
							});
							
						}
						apiInfoObj.find(".paginationType").show();
					}else{
						apiInfoObj.find('.paginationRequired[value="no"]').attr('checked',true);
					}
					
				var incrementalUpdateparamdArray = apiDetails[i].incrementalUpdateparamdata;
				var incrementalUpdate = apiDetails[i].incrementalUpdate;
				apiInfoObj.find(".incrementalUpdate").prop("checked",incrementalUpdate);
				if (incrementalUpdate && incrementalUpdateparamdArray) {
					var paramArrayObj = JSON.parse(incrementalUpdateparamdArray);
					$.each(paramArrayObj,function(ind,param){
						apiInfoObj.find(".incrementalUpdateParamName").val(param['incrementalUpdateParamName']);
						apiInfoObj.find(".incrementalUpdateParamvalue").val(param['incrementalUpdateParamvalue']);
						apiInfoObj.find(".incrementalUpdateParamColumnName").val(param['incrementalUpdateParamColumnName']);
						apiInfoObj.find(".incrementalUpdateParamType").val(param['incrementalUpdateParamType']);
						apiInfoObj.find(".incrementalUpdateDetailsDiv").show();
					});
				}
				
				
				apiInfoObj.find(".wsApiMethodType").each(function(index,val){
					var valObj = $(val);
					valObj.prop("name","methodTypeAuthSelection"+i);
					
					if (valObj.val() == apiDetails[i].apiMethodType) {
						valObj.prop("checked",true);
					}
				});
				apiInfoObj.find(".wsApiResponseObjName").prop({value:apiDetails[i].responseObjectName,title:apiDetails[i].responseObjectName});
				apiInfoObj.find(".wsApiResponseColumnObjName").prop({value:apiDetails[i].responseColumnObjectName,title:apiDetails[i].responseColumnObjectName});

				 var apiPathParamsList; 
				 if ( apiDetails[i].apiPathParams ) {
					 apiPathParamsList = $.parseJSON(apiDetails[i].apiPathParams);
				 }
				 apiInfoObj.find(".wsManualSubUrlMainDiv").hide();
				 if(apiPathParamsList && apiPathParamsList.length ){
					 var wsManualSubUrlMainDivTemplate = apiInfoObj.find(".wsManualSubUrlMainDiv").show();
					 
					 $.each(apiPathParamsList,function(j,paramValueObj){
						 
						 var subUrlMainHolderDiv = $("#wsManualSubUrlMainDivTemplate").clone().removeAttr("id").addClass("wsManualSubUrlDiv").show();
						 wsManualSubUrlMainDivTemplate.append(subUrlMainHolderDiv); 
						 
						 subUrlMainHolderDiv.find(".pathVariableSno").text("Path Variable: " + (j+1));
						 subUrlMainHolderDiv.find(".wsUrlPathParam").text(paramValueObj.paramName);
						 
						 
						 subUrlMainHolderDiv.find(".pathParamValType").each(function(index,val){
								var valObj = $(val);
								valObj.prop("name","pathParamValType"+i+""+j);
								
								if (valObj.val() == paramValueObj.valueType) {
									valObj.prop("checked",true);
								}
						});
						 
						 apiInfoObj.find(".wsSubApiMethodType").each(function(index,val){
								var valObj = $(val);
								valObj.prop("name","wsSubApiMethodType"+i+""+j);
								
								if (valObj.val() == paramValueObj.subUrldetails.methodType) {
									valObj.prop("checked",true);
								}
						 });
						 if(paramValueObj.valueType == 'M'){
							 subUrlMainHolderDiv.find(".wsManualParamValDiv").show();
						 } else {
							 subUrlMainHolderDiv.find(".wsSubUrlApiDiv").show();
							 apiInfoObj.find(".wsSubApiUrl").prop({value:paramValueObj.subUrldetails.url,title:paramValueObj.subUrldetails.url});
							 if(paramValueObj.subUrldetails.baseUrlRequired){
								 apiInfoObj.find(".wsSubApiBaseUrlRequired").prop({'checked':true});
							 }else{
								 apiInfoObj.find(".wsSubApiBaseUrlRequired").prop({'checked':false});
							 }
							 apiInfoObj.find(".wsSubApiResponseObjName").prop({value:paramValueObj.subUrldetails.responseObjName,title:paramValueObj.subUrldetails.responseObjName});
							 apiInfoObj.find(".subUrlPaginationRequired").prop("name","subUrlPaginationRequired"+i+j);
							 apiInfoObj.find(".subUrlPaginationOffsetDateType").prop("name","subUrlPaginationOffsetDateType"+i+j);
							 if(paramValueObj.subUrldetails.subUrlPaginationRequired){
								    apiInfoObj.find('.subUrlPaginationRequired[value="yes"]').attr('checked',paramValueObj.subUrldetails.subUrlPaginationRequired);
								    debugger
								    if(paramValueObj.subUrldetails.subUrlPaginationType != 'hypermedia'){
								    	apiInfoObj.find(".subUrlPaginationParamType").val(paramValueObj.subUrldetails.subUrlPaginationParamType);
								    }
									if(paramValueObj.subUrldetails.subUrlPaginationType == 'offset'){
										 apiInfoObj.find('.subUrlPaginationOffsetDateType[value="offset"]').attr('checked',true);
										 apiInfoObj.find(".subUrlPaginationOffSetRequestParamName").val(paramValueObj.subUrldetails.subUrlPaginationOffSetRequestParamName);
										 apiInfoObj.find(".subUrlPaginationOffSetRequestParamValue").val(paramValueObj.subUrldetails.subUrlPaginationOffSetRequestParamValue);
										 apiInfoObj.find(".subUrlPaginationLimitRequestParamName").val(paramValueObj.subUrldetails.subUrlPaginationLimitRequestParamName);
										 apiInfoObj.find(".subUrlPaginationLimitRequestParamValue").val(paramValueObj.subUrldetails.subUrlPaginationLimitRequestParamValue);
										 apiInfoObj.find(".subUrlPaginationOffSetType").show(); 
									}else if(paramValueObj.subUrldetails.subUrlPaginationType == 'date'){
										apiInfoObj.find('.subUrlPaginationStartDate').datepicker({
											dateFormat : 'yy-mm-dd',
											defaultDate : new Date(),
											changeMonth : true,
											changeYear : true, 
											yearRange : "0:+20",
											numberOfMonths : 1
										});
										apiInfoObj.find('.subUrlPaginationOffsetDateType[value="date"]').attr('checked',true);
										apiInfoObj.find(".subUrlPaginationStartDateParam").val(paramValueObj.subUrldetails.subUrlPaginationStartDateParam);
										apiInfoObj.find(".subUrlPaginationEndDateParam").val(paramValueObj.subUrldetails.subUrlPaginationEndDateParam);
										apiInfoObj.find(".subUrlPaginationStartDate").val(paramValueObj.subUrldetails.subUrlPaginationStartDate);
										apiInfoObj.find(".subUrlPaginationDateRange").val(paramValueObj.subUrldetails.subUrlPaginationDateRange);
										apiInfoObj.find(".subUrlPaginationDateType").show();
									} else {
										apiInfoObj.find('.subUrlPaginationOffsetDateType[value="hypermedia"]').attr('checked',true);
										apiInfoObj.find(".subUrlPaginationHyperLinkPattern").val(paramValueObj.subUrldetails.paginationHyperLinkPattern);
										apiInfoObj.find(".subUrlPaginationHypermediaPageLimit").val(paramValueObj.subUrldetails.paginationHypermediaPageLimit);
										apiInfoObj.find(".subUrlPaginationHypermediaType").show();
									}
									apiInfoObj.find(".subUrlPaginationType").show();
							 }else{
								 apiInfoObj.find('.subUrlPaginationRequired[value="no"]').attr('checked',true);
							 }
						 }
					 });
				 }
				   apiDetailsDiv.append(apiInfoObj);
				   globalApiCounter++;
				}
		}else{
			common.showErrorAlert(globalMessage['anvizent.package.label.defualtMappingNotFoundForSelectedIl']);
			$("#saveWsApi,#wsFormatResponse,#joinWsApi,#wsdefaultApiDetails").hide(); 
			$("#addNewWsApi").show();   
			return false;     
		}
		  $("#addNewWsApi").hide();
		  $("#requiredApiRequestParameters,#wsdefaultApiDetails").show();
	},
	
	updateILTable : function(result, dL_Id, container,ilScheduleType,ilScheduleId){
		var packageId = $("#packageId").val();
		var table = $(container).next(".il-block").find(".table-inner-1 tbody");
		table.empty();
		var tableRow='';
		if(result.length>0){
			
			for(var i=0;i<result.length;i++){
				var sNo=i+1;
				var description = result[i].description ? result[i].description : "";
				 tableRow += "<tr>"+
				    		 	"<td>"+ sNo +"</td>"+
				    		 	"<td><span class = 'toolTip' data-toggle='tooltip' data-placement='bottom' title='"+description+"'>"+result[i].iL_name+"</span></td>"+
				    		 	"<td>"+result[i].iL_table_name+"</td>";
				 if(result[i].iLStatus == "Pending"){
						tableRow += "<td class='iLStatus"+result[i].iL_id+"'>"+globalMessage['anvizent.package.label.pending']+"</td>";
				 }else if(result[i].iLStatus == "Done"){
						tableRow += "<td class='iLStatus"+result[i].iL_id+"' style='font-weight:bold;color: black;'>"+globalMessage['anvizent.package.link.done']+"</td>";
				 }
				tableRow += "<td class='smalltd'>" +
								"<a class='btn btn-primary btn-sm table_btn startLoader' href='"+adt.appContextPath+"/adt/standardpackage/addILSource/"+packageId+"/"+dL_Id+"/"+result[i].iL_id+"'>"+
								globalMessage['anvizent.package.label.addSource']+"</a>" +
							"</td>";
				if (result[i].iLStatus == "Pending") {
					tableRow += "<td class='smalltd'><button type='button' class='btn btn-primary table_btn btn-sm' disabled>" +
					""+globalMessage['anvizent.package.label.run']+"</td>";
				} else {
					tableRow += "<td class='smalltd'><button type='button' class='runIL btn btn-primary table_btn btn-sm' data-scheduletype='"+ilScheduleType+"' data-scheduleid='"+ilScheduleId+"' data-iLId='"+result[i].iL_id+"'  data-iLName='"+result[i].iL_table_name+"' data-dLId='"+dL_Id+"'>" +
					""+globalMessage['anvizent.package.label.run']+"</td>";
				}
				
				 if(result[i].iLStatus == "Pending"){
					 tableRow += "<td class='smalltd'><button type='button' class='btn btn-primary table_btn btn-sm' data-container='body' data-toggle='popover' data-placement='top' data-content='"+globalMessage['anvizent.package.label.noSourceIsAdded']+"'>"+globalMessage['anvizent.package.link.viewSourceDetails']+"</button></td>";
				 }else{
					 tableRow += "<td class='smalltd'><a class='btn btn-primary table_btn btn-sm' href='"+adt.appContextPath+"/adt/package/viewIlSource/"+packageId+"/"+dL_Id+"/"+result[i].iL_id+"/?from=standard'>"+
				 		""+globalMessage['anvizent.package.link.viewSourceDetails']+" </a></td>";
				 }
				 tableRow += "<td class='smalltd'><button type='button' class='viewILSchema btn btn-primary table_btn btn-sm' data-iLId='"+result[i].iL_id+"' data-iLName='"+result[i].iL_table_name+"'>" +
							""+globalMessage['anvizent.package.button.viewTableStructure']+"</td>"
					"</tr>";
			}
		}
		table.append(tableRow);
	},
	resetWebserviceConnection : function() {
		$("#webServiceConnectionName").val("").removeAttr("disabled");
		$("#webServiceName").val($("#webServiceName option:first").val()).removeAttr("disabled");
		$("#basicAuthenticationDiv").empty();
	},
	showMessage:function(text){
			$(".messageText").empty();
			$(".successMessageText").empty();
			$(".messageText").html(text);
		  $(".message").show();
		  setTimeout(function() { $(".message").hide(); }, 10000);
	},
	showSuccessMessage:function(text, hidetick, time) {
		$(".messageText").empty();
		$(".successMessageText").empty();
		$(".successMessageText").html(text +(hidetick ? '' : '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>'));
	    $(".successMessage").show();
	  
	  setTimeout(function() { $(".successMessage").hide(); }, time && time>0 ? time : 2500);
	},
	showErrorMessage:function(text){
		$("#errors").empty();
		$("#errorMessage").html(text);
	  $("#errors").show();
	  setTimeout(function() { $("#errors").hide(); }, 5000);
	},
 
	getWebServiceConnections: function() {
		var userID = $("#userID").val();
		var url_getILConnections = "/app/user/"+userID+"/package/getWebServiceConnections";
		var myAjax = common.loadAjaxCall(url_getILConnections,'GET','',headers);
	    myAjax.done(function(result) {
	    	standardPackage.updateExistingWebserviceConnections([]);
	    	if(result != null && result.hasMessages ){
	    		if(result.messages[0].code == "SUCCESS"){
	    			standardPackage.updateExistingWebserviceConnections(result.object) ; 
		    	} else {
			    	common.displayMessages(result.messages);
		    	}
	    	} else {
	    		var messages = [ {
	    			code : globalMessage['anvizent.message.error.code'],
					text : globalMessage['anvizent.package.label.unableToProcessYourRequest']
				} ];
	    		common.displayMessages(result.messages);
	    	}
	    });
	},
	updateExistingConnections : function(result){
		$("#existingConnections").empty();
		$("#existingConnections").append("<option value=''>"+globalMessage['anvizent.package.label.selectConnection']+"</option>");
		if(result.length > 0){
			if(result.length == 1){ 
			var existingConnectins='';
			$.each(result, function(key, obj) { 
				var disabled = obj["webApp"] && !obj["availableInCloud"] ? 'disabled':'';
				 existingConnectins+= "<option value='" + obj["connectionId"] + "'" +disabled+" selected>" + obj["connectionName"].encodeHtml()+(obj["webApp"] && !obj["availableInCloud"] ? ' ( Local DB)':'') + "</option>";
			 });
			$("#existingConnections").append(existingConnectins);
			$("#existingConnections").trigger("change");
		} else {
			var existingConnectins='';
			$.each(result, function(key, obj) {
				var disabled = obj["webApp"] && !obj["availableInCloud"] ? 'disabled':'';
 				 existingConnectins+= "<option value='" + obj["connectionId"] + "'" + disabled+">" + obj["connectionName"].encodeHtml()+(obj["webApp"] && !obj["availableInCloud"] ? ' ( Local DB)':'') + "</option>";
			 
			 });
			$("#existingConnections").append(existingConnectins);
		}
	  }
	},
	updateExistingWebserviceConnections : function(result){
		$("#existingWebServices").empty();
		$("#existingWebServices").append("<option value='0'>Select WebService</option>");
		if(result.length>0){
			if(result.length == 1){
			var existingConnectins='';
			$.each(result, function(key, obj) {
				if(obj["active"]){
					existingConnectins+= "<option value='" + obj["id"] + "' " +" selected>" + obj["webServiceConName"].encodeHtml() + "</option>";
				}
			 });
			$("#existingWebServices").append(existingConnectins);
			$("#existingWebServices").trigger("change");
			}else{
				var existingConnectins='';
				$.each(result, function(key, obj) {
					if(obj["active"]){
						existingConnectins+= "<option value='" + obj["id"] + "' " +">" + obj["webServiceConName"].encodeHtml() + "</option>";
					}
				 });
				$("#existingWebServices").append(existingConnectins);
				
			}
		}
	},
	updateConnectionPanel : function(result){
					console.log("updateConnectionPanel --> ")
			       var connectionname = result["connectionName"];
			       var databaseId = result["database"].id; 
			       var connectionType = result["connectionType"]; 
			       var server = result["server"]; 
			       var username = result["username"];
			       var connector_Id = result["database"].connector_id;
			       var protocal = result["database"].protocal;
			       var dateFormat = result["dateFormat"];
		           var timesZone = result["timeZone"];
		           var dataSource = result["dataSourceName"];
			       
			       $("#IL_database_connectionName").val(connectionname).attr("disabled","disabled");
			       $("#IL_database_databaseType").val(databaseId).attr("disabled","disabled");
			       $("#IL_database_connectionType").val(connectionType).attr("disabled","disabled");
				   $("#IL_database_serverName").val(server).attr("disabled","disabled");
				   $("#IL_database_username").val(username).attr("disabled","disabled");
				   $("#dateFormat").val(dateFormat).attr("disabled","disabled");
				   $("#timesZone").val(timesZone).attr("disabled","disabled");
				   $("#timesZone").change();
				   if (dataSource){
					   $("#dataSourceName").val(dataSource);
				   } else {
					   $("#dataSourceName").val("-1");
				   }
				   $("#dataSourceName").trigger("change");
				   
				   if(protocal.indexOf('sforce') != -1){
			        	$("#typeOfCommand").empty();
			        	$("#typeOfCommand").append('<option value="Query">'+globalMessage['anvizent.package.label.query']+'</option>');
			        }else{
			        	$("#typeOfCommand").empty();
			        	$("#typeOfCommand").append('<option value="Query">'+globalMessage['anvizent.package.label.query']+'</option> <option value="Stored Procedure">'+globalMessage['anvizent.package.label.storedProcedure']+'</option>');
			        }
	},
	showDefaultIlQuery: function(connectionId,iLId){
		 
		if(connectionId !=null && iLId != ''){
		var userID = $("#userID").val();
		var token = $("meta[name='_csrf']").attr("content");
		var header = $("meta[name='_csrf_header']").attr("content");
		headers[header] = token;
		var url_checkQuerySyntax = "/app/user/"+userID+"/package/getIlEpicorQuery/"+iLId+"/"+connectionId;
		 var myAjax = common.loadAjaxCall(url_checkQuerySyntax,'GET','',headers);
		    myAjax.done(function(result) {
		    	 
		    	  if(result != null){ 
		    		  if(result.hasMessages){
		    			  if(result.messages[0].code == "ERROR") {
			    			  var message = '<div class="alert alert-danger alert-dismissible" role="alert">'+
	  							''+result.messages[0].text+''+
	  							'</div>';
			    			  	$(".queryValidatemessageDiv").append(message)
			    				  return false;
			    			  }  
		    		  }else{
		    			  $("#queryScript,#oldQueryScript").val('');
			    		  $("#queryScript,#oldQueryScript").val(result.object);
			    		  var query = result.object;			    		 
    		  if(query != null){ 
    			  $("#replaceShemas").show(); 
    			  var connector_id =  $("#IL_database_databaseType option:selected").attr('data-connectorid');
    			  var protocal =  $("#IL_database_databaseType option:selected").data('protocal');
    					if(connector_id !=null ){
    						standardPackage.displayDatabaseSchemaBasedOnConnectorId(connector_id,connectionId,protocal);
    						} 
			    			  var n = query.split(/from|FROM/).pop().split('.').shift().trim().split(" ");
				    		  var schemaName = n[n.length - 1]; 
				    		  if(protocal.indexOf('sqlserver') == -1 || protocal.indexOf('odbc') == -1){
			            	   schemaName = schemaName.replace(/[[\]]/g,'').encodeHtml(); 
			    			  }
				    		  else{
				    			  if(schemaName.indexOf("[") < 0)
				    				  schemaName = '['+schemaName+']'; 
				    		  }				    		   
					  		  var packageId = $("#packageId").val();
					  		  var dlId = $("#dlId").val();	
					  		  $("#qbschemaName").val(schemaName.encodeHtml());
					  		  $("#qbiLId").val(iLId);
					  		  $("#qbconnectionId").val(connectionId);
					  		  if(protocal.indexOf('ucanaccess') != -1 ){
					  			$("#replaceShemas").hide();
					   		  }
    		           }
			    		  else if(query == null){
			    			  $("#defualtVariableDbSchema").hide();
			    			  var schemaName = "noSchema";
			    			  var packageId = $("#packageId").val();
					  		  var dlId = $("#dlId").val();	
					  		  $("#qbschemaName").val(schemaName.encodeHtml());
					  		  $("#qbiLId").val(iLId);
					  		  $("#qbconnectionId").val(connectionId);
					  		  $("#replaceShemas").hide();  
			    		  }
		    		  }
		    		  
		    	  }else{
		    		  $("#queryScript").val(''); 
		    	  }		    	  
		    }); 
		}
		 
	},
	displayDatabaseSchemaBasedOnConnectorId : function(connector_id,connectionId,protocal){
		$('#defualtVariableDbSchema').empty();
		var userID = $("#userID").val();  
		if(protocal.indexOf('sqlserver') != -1 || protocal.indexOf('odbc') != -1){
			var dbSchemaSelection = $("#dbSchemaSelectionDivForSqlServer").clone().removeAttr('id').prop("id","dbSchemaSelection").show();
			$('#defualtVariableDbSchema').append(dbSchemaSelection); 
			showAjaxLoader(true);
			var url_getDbSchemaVaribles ="/app/user/"+userID+"/package/getDbSchemaVaribles/"+connector_id+""; 
			 var myAjax = common.loadAjaxCall(url_getDbSchemaVaribles,'GET','',headers);
			    myAjax.done(function(result) {
			    	showAjaxLoader(false);
			    	  if(result != null && result.hasMessages){ 
			    			  if(result.messages[0].code == "ERROR") { 
			    				  $("#defualtVariableDbSchema").hide();
			    				  $("#replaceShemas").hide();
			    				  common.showErrorAlert(result.messages[0].text);
			    				  return false;
			    			  }  
			    		   else if(result.messages[0].code == "SUCCESS"){
			    			   
			    			   var dbVariable='';
			    			   var schemaVariable = '';
			    			   if(result.object != null){
			    				   $('#dbVariable,#schemaVariable').empty();
			    				   dbVariable ='<option value="{db0}">'+globalMessage['anvizent.package.label.selectdbvariable']+'</option>'; 
			    				   schemaVariable ='<option value="{schema0}">'+globalMessage['anvizent.package.label.selectschemavariable']+'</option>';
			    				   $.each( result.object, function( key, value ) {
			    					   dbVariable += '<option value='+key+'>'+key+'</option>';
			    					   schemaVariable += '<option value='+value+'>'+value+'</option>';
				    				 });
			    				   $('#dbVariable').append(dbVariable);
			    				   $('#schemaVariable').append(schemaVariable);
			    				   standardPackage.getAllSchemasFromDatabase(connectionId,connector_id,protocal) ;
			    			   }else{
			    				   common.showErrorAlert(result.messages[0].text);
			    				   return false;
			    			   }
			    			 
			    			  } 
			    		    
			    	  } else{
				    		var messages = [ {
				    			code : globalMessage['anvizent.message.error.code'],
				    			text : globalMessage['anvizent.package.label.unableToProcessYourRequest']
				    		} ];
				    		common.displayMessages(messages);
				    	}   	  
			    }); 
			   
			}
		 
		 else if(protocal.indexOf('mysql') != -1   || protocal.indexOf('oracle') != -1   || protocal.indexOf('db2') != -1   || protocal.indexOf('sforce') != -1   || protocal.indexOf('as400') != -1   || protocal.indexOf('postgresql') != -1 || protocal.indexOf('vortex') != -1 || protocal.indexOf('openedge') != -1){
			 
                var dbSchemaSelectionDiv = $("#dbSchemaSelectionDivForNotSqlServer").clone().removeAttr('id').prop("id","dbSchemaSelection").show();
				$('#defualtVariableDbSchema').append(dbSchemaSelectionDiv); 
			 
				showAjaxLoader(true);
				var url_getDbSchemaVaribles ="/app/user/"+userID+"/package/getDbSchemaVaribles/"+connector_id+""; 
				 var myAjax = common.loadAjaxCall(url_getDbSchemaVaribles,'GET','',headers);
				    myAjax.done(function(result) {
				    	showAjaxLoader(false);
				    	  if(result != null && result.hasMessages){ 
				    			  if(result.messages[0].code == "ERROR") { 
				    				  $("#defualtVariableDbSchema").hide();
				    				  $("#replaceShemas").hide();
				    				  common.showErrorAlert(result.messages[0].text);
				    				  return false;
				    			  }  
				    		   else if(result.messages[0].code == "SUCCESS"){
				    			   var schemaVariable = '';
				    			   if(result.object != null){
				    				   $('#schemaVariable').empty();
				    				   schemaVariable ='<option value="{schema0}">'+globalMessage['anvizent.package.label.selectschemavariable']+'</option>';
				    				   $.each( result.object, function( key, value ) {
				    					   schemaVariable += '<option value='+value+'>'+value+'</option>';
					    				 });
				    				   $('#schemaVariable').append(schemaVariable);
				    				   
				    				   standardPackage.getAllSchemasFromDatabase(connectionId,connector_id,protocal) ;
				    				   
				    			   }else{
				    				   common.showErrorAlert(result.messages[0].text);
				    				   return false;
				    			   }
				    			 
				    			  } 
				    	  } else{
					    		var messages = [ {
					    			code : globalMessage['anvizent.message.error.code'],
					    			text : globalMessage['anvizent.package.label.unableToProcessYourRequest']
					    		} ];
					    		common.displayMessages(messages);
					    	}   	  
				    }); 
		       }
		 $("#defualtVariableDbSchema,#replaceShemas").show();
	},
	getAllSchemasFromDatabase: function(connectionId,connector_id,protocal){
		var userID = $("#userID").val();
		showAjaxLoader(true);
		var url_getDbSchemaVaribles1 ="/app/user/"+userID+"/package/getAllSchemasFromDatabase/"+connectionId+""; 
		 var myAjax = common.loadAjaxCall(url_getDbSchemaVaribles1,'GET',"",headers);
		    myAjax.done(function(dbResult) {
		    	showAjaxLoader(false);
		    	  if(dbResult != null){ 
		    		 
		    		  if(dbResult.hasMessages){
		    			  if(dbResult.messages[0].code == "ERROR") { 
		    				 
		    				  common.showErrorAlert(dbResult.messages[0].text);
		    				  return false;
		    			  }  
		    		   else if(dbResult.messages[0].code == "SUCCESS"){
		    			   var dbName='';
		    			   if(dbResult.object != null){
		    				   $('#dbName').empty();
		    				   if(protocal.indexOf('sqlserver') != -1 || protocal.indexOf('odbc') != -1){
		    					   dbName ='<option value="{dbName}">'+globalMessage['anvizent.package.label.selectdbname']+'</option>';
		    				   }else if(protocal.indexOf('mysql') != -1   || protocal.indexOf('oracle') != -1   || protocal.indexOf('db2') != -1   || protocal.indexOf('sforce') != -1   || protocal.indexOf('as400') != -1   || protocal.indexOf('postgresql') != -1 || protocal.indexOf('vortex') != -1 || protocal.indexOf('openedge') != -1){
		    					   dbName ='<option value="{dbName}">'+globalMessage['anvizent.package.label.selectschemaname']+'</option>';
		    				   }
		    				  
		    				   $.each( dbResult.object, function( key, value ) {
		    					   dbName += '<option value='+value.encodeHtml()+'>'+value.encodeHtml()+'</option>';
			    				 });
		    				  
		    				   $('#dbName').append(dbName);
		    			  
		    			   }else{
		    				   common.showErrorAlert(result.messages[0].text);
		    				   return false;
		    			   }
		    			 
		    			  } 
		    		  }	  
		    	  }    	  
		    }); 
	   },
	updateTableInfo : function(result){
			
		var table = $("#viewSchemaTable tbody");
		table.empty();
		var tableRow='';
		if(result.length>0){
			var i=0;
			$.each(result, function(key, obj) {
				var isPrimaryKey= obj["isPrimaryKey"];
				var isNotNull=obj["isNotNull"];
				var isAutoIncrement =obj["isAutoIncrement"];
				var columnName = obj["columnName"];
				var columnRow = null;
				if (isAutoIncrement || columnName.match("^XRef_")) {
					return;
				}
			    isPrimaryKey = isPrimaryKey == true ? '<span class="glyphicon glyphicon-ok"></span>' : '' ;
				isNotNull = isNotNull == false   ? '' :'<span class="glyphicon glyphicon-ok"></span>' ;
				isAutoIncrement = isAutoIncrement == true ? '<span class="glyphicon glyphicon-ok"></span>' : '';
				
				if(isNotNull && !isAutoIncrement)
					columnRow = "<td class='col-xs-2'>"+obj["columnName"]+" <span class='required'>*</span> </td>";
				
				else
					columnRow = "<td class='col-xs-2'>"+obj["columnName"]+"</td>";
				
				tableRow +=  "<tr>"+
						"<td class='col-xs-1'>"+(i+1)+"</td>"+
						columnRow+
						"<td class='col-xs-2'>"+obj["dataType"]+"</td>"+
						"<td class='col-xs-2'>"+obj["columnSize"]+"</td>"+
						"<td class='col-xs-1 text-center'>"+isPrimaryKey+"</td>"+
						"<td class='col-xs-1 text-center'>"+isNotNull+"</td>"+
						"<td class='col-xs-2'>"+isAutoIncrement+"</td>"+
						"<td class='col-xs-1'>"+(obj["defaultValue"] || '')+"</td>"+ 
						"</tr>";
				i++;
			});
		}
		table.append(tableRow);
		$("#viewSchema").modal('show');

	},
	saveILConnectionMapping :  function(selectData){
		var userID = $("#userID").val();
		 var url_saveILConnectionMapping = "/app/user/"+userID+"/package/saveILsConnectionMapping";
		 showAjaxLoader(true);
		   var myAjax = common.postAjaxCall(url_saveILConnectionMapping,'POST', selectData,headers);
		    myAjax.done(function(result) {
		    	showAjaxLoader(false);
		    		  if(result != null && result.hasMessages){
		    			  if(result.messages[0].code == "SUCCESS") {
		    				  $("#flatDataSourceOther").hide();
								 var  messages=[{
									  code : result.messages[0].code,
									  text : result.messages[0].text
								  }];
								 $("#popUpMessage").empty();
								 $("#popUpMessage").text(result.messages[0].text).addClass('alert alert-success').removeClass('alert-danger').show();
								 $("#fileMappingWithILPopUp").modal('hide');
								 $("#messagePopUp").modal('show');
								 if ( selectData.ilSourceName == "-1") {
										 common.addToSelectBox(selectData.dataSourceNameOther,"option.otherOption")
								 }
		    			  }else {
					    		common.displayMessages(result.messages);
		    			  }
		    		  }else{
		    			  standardPackage.showMessage(globalMessage['anvizent.package.label.operationFailedPleaseTryAgain']);
		    		  }
		    });
	},
	validateDefaultValue : function(obj) {
		var msg = globalMessage['anvizent.package.message.invalidData'];
		var status = true;
		
		if (obj) {
		 
			var val = $.trim(obj.value);
			common.clearcustomsg(obj);
			if (val !== '') {
				var input = $(obj), 
				row =  input.closest('tr'),
				datatype = row.find('td[data-dtype]').data('dtype'),
				dataColSize = row.find('td[data-colsize]').data('colsize');
				if(val.length > dataColSize && (datatype !== 'FLOAT' || datatype !== 'DECIMAL' || datatype !== 'DECIMAL UNSIGNED')){				
					common.showcustommsg(obj, globalMessage['anvizent.package.message.defaultValueLengthIsExceeded']);
					status = false;								
				}
				else{
					if (datatype === 'INT' || datatype === 'BIGINT' || datatype== 'INT UNSIGNED') {
						var isInt = common.isInteger(val);
						if (!isInt) {
							common.showcustommsg(obj, msg);
							status = false;
						}
					}
					else if (datatype === 'FLOAT' || datatype === 'DECIMAL' || datatype === 'DECIMAL UNSIGNED') {
						if(!val.match("^([-]?\\d*\\.\\d*)$")){
							common.showcustommsg(obj, msg);
							status = false;
						}
					}
					else if (datatype === 'BIT') {
						if (val !== '0' && val !== '1') {
							common.showcustommsg(obj, msg);
							status = false;
						}
					}
					else if (datatype === 'DATETIME') {
						var regEx = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
						if(!val.match(regEx)){
							common.showcustommsg(obj, msg);
							status = false;
						}
					}
				}	
			}
			else {
				this.value = val;
			}
		}
		return status;
	},
	updateDisabledPackagesTable : function(result){
		var filterBy = $("#filterPackages").val();
		var disabledPackages = $("#disabledPackages").DataTable();
		var isScheduled='';
			  if (result != null) {
				   disabledPackages.clear();
				   
				   for (var i = 0; i < result.object.length; i++) {	
					   var isStandardPackage = result.object[i].isStandard ? "standard" : "custom";
					   console.log(result.object[i].isStandard)
					   if((!result.object[i].isActive && result.object[i].isStandard && filterBy == isStandardPackage) || (!result.object[i].isActive && filterBy == "all" && result.object[i].isStandard)){	
						    var packageId = result.object[i].packageId !=null ? result.object[i].packageId : "";
						    var packageType = globalMessage['anvizent.package.label.standard'];
						    var packageName = result.object[i].packageName != null ? result.object[i].packageName : "";
						    var industry = result.object[i].industry != null ? result.object[i].industry.name : "";
						    var isActive = result.object[i].isActive == true ? globalMessage['anvizent.package.button.yes'] : globalMessage['anvizent.package.button.no'];
						    var isMapped = result.object[i].isMapped == true ? globalMessage['anvizent.package.button.yes'] : globalMessage['anvizent.package.button.no'];
						  
						    if(result.object[i].isActive == true){
						    		isScheduled = result.object[i].isScheduled == true ? globalMessage['anvizent.package.button.yes'] : globalMessage['anvizent.package.button.no'];
						    	  	 
						    }else{
						    	 	isScheduled='No';					    		 
						    }					  
						    
						    var packageRename = "<div><span class='packageName'>"+packageName+"</span>"+ "</div>" ;
						    
						    var row = [];
						    row.push(packageId);
						    row.push(globalMessage['anvizent.package.label.standard']);
						    row.push(packageRename);
						    row.push(industry);
						    row.push(isActive);
						    row.push(isMapped);
						    row.push(isScheduled);				    	
						    row.push("<button class='btn btn-primary btn-sm activatePackage' data-packageId='"+packageId+"'>"+globalMessage['anvizent.package.label.activate']+"</button>");
						    disabledPackages.row.add(row);
					   }
					   else if((!result.object[i].isActive && !result.object[i].isStandard && filterBy == isStandardPackage) || (!result.object[i].isActive && filterBy == "all" && !result.object[i].isStandard)){
						    var packageId = result.object[i].packageId !=null ? result.object[i].packageId : "";
						    var packageType = globalMessage['anvizent.package.label.custom'];
						    var packageName = result.object[i].packageName != null ? result.object[i].packageName : "";
						    var industry = result.object[i].industry != null ? result.object[i].industry.name : "";
						    var isActive = result.object[i].isActive == true ? globalMessage['anvizent.package.button.yes'] : globalMessage['anvizent.package.button.no'];
						    var isMapped = result.object[i].isMapped == true ? globalMessage['anvizent.package.button.yes'] : globalMessage['anvizent.package.button.no'];
						  
						    if(result.object[i].isActive == true){
						    		isScheduled = result.object[i].isScheduled == true ? globalMessage['anvizent.package.button.yes'] : globalMessage['anvizent.package.button.no'];
						    	  	 
						    }else{
						    	 	isScheduled='No';					    		 
						    }					  
						    
						    var packageRename = "<div><span class='packageName'>"+packageName+"</span>"+ "</div>" ;
						    
						    var row = [];
						    row.push(packageId);
						    row.push(globalMessage['anvizent.package.label.custom']);
						    row.push(packageRename);
						    row.push(industry);
						    row.push(isActive);
						    row.push(isMapped);
						    row.push(isScheduled);				    	
						    row.push("<button class='btn btn-primary btn-sm activatePackage' data-packageId='"+packageId+"'>"+globalMessage['anvizent.package.label.activate']+"</button>");
						    disabledPackages.row.add(row);
					   }
					   
					 
				   }
				   disabledPackages.draw(true);
				   if(result.hasMessages){
					   var messages=[{
							  code : result.messages[0].code,
							  text : result.messages[0].text
						  }];
					   common.displayMessages(messages);
				   }
			  }
		
	},
	
	filterDisabledPackagesTable : function(result){
		var filterBy = $("#filterPackages").val();
		var disabledPackages = $("#disabledPackages").DataTable();
		var isScheduled='';
			  if (result != null) {
				   disabledPackages.clear();
				   
				   for (var i = 0; i < result.object.length; i++) {	
					   var isStandardPackage = result.object[i].isStandard ? "standard" : "custom";
					   console.log(result.object[i].isStandard)
					   if((!result.object[i].isActive && result.object[i].isStandard && filterBy == isStandardPackage) || (!result.object[i].isActive && filterBy == "all" && result.object[i].isStandard)){	
						    var packageId = result.object[i].packageId !=null ? result.object[i].packageId : "";
						    var packageType = globalMessage['anvizent.package.label.standard'];
						    var packageName = result.object[i].packageName != null ? result.object[i].packageName : "";
						    var industry = result.object[i].industry != null ? result.object[i].industry.name : "";
						    var isActive = result.object[i].isActive == true ? globalMessage['anvizent.package.button.yes'] : globalMessage['anvizent.package.button.no'];
						    var isMapped = result.object[i].isMapped == true ? globalMessage['anvizent.package.button.yes'] : globalMessage['anvizent.package.button.no'];
						  
						    if(result.object[i].isActive == true){
						    		isScheduled = result.object[i].isScheduled == true ? globalMessage['anvizent.package.button.yes'] : globalMessage['anvizent.package.button.no'];
						    	  	 
						    }else{
						    	 	isScheduled='No';					    		 
						    }					  
						    
						    var packageRename = "<div><span class='packageName'>"+packageName+"</span></div>" 
						    var row = [];
						    row.push(packageId);
						    row.push(globalMessage['anvizent.package.label.standard']);
						    row.push(packageRename);
						    row.push(industry);
						    row.push(isActive);
						    row.push(isMapped);
						    row.push(isScheduled);				    	
						    row.push("<button class='btn btn-primary btn-sm activatePackage' data-packageId='"+packageId+"'>"+globalMessage['anvizent.package.label.activate']+"</button>");
						    disabledPackages.row.add(row);
					   }
					   else if((!result.object[i].isActive && !result.object[i].isStandard && filterBy == isStandardPackage) || (!result.object[i].isActive && filterBy == "all" && !result.object[i].isStandard)){
						 
						    var packageId = result.object[i].packageId !=null ? result.object[i].packageId : "";
						    var packageType = globalMessage['anvizent.package.label.custom'];
						    var packageName = result.object[i].packageName != null ? result.object[i].packageName : "";
						    var industry = result.object[i].industry != null ? result.object[i].industry.name : "";
						    var isActive = result.object[i].isActive == true ? globalMessage['anvizent.package.button.yes'] : globalMessage['anvizent.package.button.no'];
						    var isMapped = result.object[i].isMapped == true ? globalMessage['anvizent.package.button.yes'] : globalMessage['anvizent.package.button.no'];
						  
						    if(result.object[i].isActive == true){
						    		isScheduled = result.object[i].isScheduled == true ? globalMessage['anvizent.package.button.yes'] : globalMessage['anvizent.package.button.no'];
						    	  	 
						    }else{
						    	 	isScheduled='No';					    		 
						    }					  
						    
						    var packageRename = "<div><span class='packageName'>"+packageName+"</span></div>"  
						    var row = [];
						    row.push(packageId);
						    row.push(globalMessage['anvizent.package.label.custom']);
						    row.push(packageRename);
						    row.push(industry);
						    row.push(isActive);
						    row.push(isMapped);
						    row.push(isScheduled);				    	
						    row.push("<button class='btn btn-primary btn-sm activatePackage' data-packageId='"+packageId+"'>"+globalMessage['anvizent.package.label.activate']+"</button>");
						    disabledPackages.row.add(row);
					   }
				   }
				   disabledPackages.draw(true);
				   
			  }
	},
	
	  validateWebServiceAuthentication : function(){
		  
	    var authUrl = $("#webServiceAuthenticateUrl").text().trim();
		var userID = $("#userID").val();
		var requestMethod = $('#webServiceMethodType').text().trim();
		var authenticationTypeId = $("#webServiceAuthenticationType").attr("auth-type-id");
		var webServiceAuthenticationType =  $("#webServiceAuthenticationType").text().trim();
		var web_service_id= $("#webServiceName option:selected").val();
		var webServiceConnectionName = $("#webServiceConnectionName").val();
	    var webServiceAuthenticateUrl = $("#webServiceAuthenticateUrl").val(); 
	    var dataSourceName = $("#webserviceDataSourceName").val();
	    var dataSourceOther = $("#wsDataSourceOtherName").val();
	    var regex = /^[0-9a-zA-Z/ /_/,/./-]+$/
	    var validStatus=true;
	   
	    if(webServiceConnectionName == '' ){
	    	 common.showcustommsg("#webServiceConnectionName",globalMessage['anvizent.package.label.pleaseEnterwebServiceConnectionName'],"#webServiceConnectionName");
	    	 validStatus = false;
	    }else if(!regex.test(webServiceConnectionName)){
     		  common.showcustommsg("#webServiceConnectionName", globalMessage['anvizent.package.label.specialcharactersnotallowedexceptunderscoredigitsandalphabets'],"#webServiceConnectionName");
      	      validStatus=false;
      	}else{
      		var selectors = [];
      		selectors.push('#webServiceConnectionName');
      		validStatus = common.validate(selectors);
      	}
	    if(dataSourceName == '0'){
		   	 common.showcustommsg("#webserviceDataSourceName", globalMessage['anvizent.package.label.enterDataSourceName'],"#webserviceDataSourceName");
		     validStatus =false;
		}
	    if(dataSourceName == "-1"){
	    	   if(dataSourceOther.trim().length == 0){
	    		   common.showcustommsg("#wsDataSourceOtherName", globalMessage['anvizent.package.label.enterDataSource'],"#wsDataSourceOtherName");
	    		   return false;
	    	   }
	       }
		
	   	if(webServiceAuthenticationType == ''){
		   	 common.showcustommsg("#webServiceAuthenticationType", globalMessage['anvizent.package.label.pleaseChooseAuthenticationType'],"#webServiceAuthenticationType");
		     validStatus =false;
		}
 	 
	 	if(web_service_id == '' || web_service_id == 0){
		   	 common.showcustommsg("#webServiceName", globalMessage['anvizent.package.label.enterWebServiceName'],"#webServiceName");
		     validStatus =false;
		 }
	 	if (authenticationTypeId != 3) {
	 		if(webServiceAuthenticateUrl == ''){
		 		common.showcustommsg("#webServiceAuthenticateUrl", globalMessage['anvizent.package.label.pleaseEnterAuthenticationURL'],"#webServiceAuthenticateUrl");
			     validStatus =false;
		 	}
		   	if(requestMethod == ''){
		   	 common.showcustommsg("#webServiceMethodType", globalMessage['anvizent.package.label.pleaseChooseMethodType'],"#webServiceMethodType");
		     validStatus =false;
		   	  
		   	}
	 	}
	 		   	
	 	$('.basicAuthenticationDiv').find('.paramNameValue').each(function(i, obj) {
	    	
	    	var authRequestKey=$(this).find(".paramName").text().trim(); 
		    var authRequestValue=$(this).find(".paramValue").val();
		    
		    if(authRequestKey == '' ){
	  	    	 common.showcustommsg($(this).find(".paramName"),globalMessage['anvizent.package.label.pleaseEnterParamName'],$(this).find(".paramName"));
	  	    	 validStatus = false;
	  	     }
			if ( $(this).find(".paramValue").data("mandatory") == true ) {
				if(authRequestValue == ''){
					common.showcustommsg($(this).find(".paramValue"), globalMessage['anvizent.package.label.enterParamValue'],$(this).find(".paramValue"));
					validStatus =false;
				}
			}
		    
	    });
 	$('#authenticationBodyParamsDiv').find('.paramNameValue').each(function(i, obj) {
	    	
	    	var authRequestKey=$(this).find(".paramName").text().trim(); 
		    var authRequestValue=$(this).find(".paramValue").val();
		    
		    if(authRequestKey == '' ){
	  	    	 common.showcustommsg($(this).find(".paramName"),globalMessage['anvizent.package.label.pleaseEnterParamName'],$(this).find(".paramName"));
	  	    	 validStatus = false;
	  	     }
			if ( $(this).find(".paramValue").data("mandatory") == true ) {
				if(authRequestValue == ''){
					common.showcustommsg($(this).find(".paramValue"), globalMessage['anvizent.package.label.enterParamValue'],$(this).find(".paramValue"));
					validStatus =false;
				}
			}
		    
	    });
   
	 	return validStatus;
         
	  },
	  
	  getPathParams : function(source,pattern){
		  var pathParams = [];   var lastIndex = 0;
		  while(source.indexOf(pattern,lastIndex) != -1) {
			  var param = "";
			  var startIndex = source.indexOf(pattern, lastIndex);
			  var endIndex = source.indexOf("}",startIndex);
			  param = source.substring(startIndex+2,endIndex);
			  
			  if ( pathParams.indexOf(param) == -1 ) {
				  pathParams.push(param);
			  }
			  
			  lastIndex = endIndex;
		  }
		  return pathParams;
	  },
	  replacePathParams : function(source,object){
		  var pathParams = [];   var lastIndex = 0;
		  while(source.indexOf("{#",lastIndex) != -1) {
			  var param = "";
			  var startIndex = source.indexOf("{#", lastIndex);
			  var endIndex = source.indexOf("}",startIndex);
			  param = source.substring(startIndex+2,endIndex);

			  if ( pathParams.indexOf(param) == -1 ) {
				  pathParams.push(param);
			  }
			  lastIndex = endIndex;
		  }
		  
		  $.each(pathParams,function(i,v){
			  console.log("i ", i, " v ", v);
			  if ( object[v] ) {
				  source = source.split("{#"+v+"}").join(object[v]);
			  }
			  
		  });
		  
		  
		  return source;
	  },
	  getWebServiceConnectionDetails : function(object){
		  
		  var modifiedAuthenticationUrl = "";
		  conDetails = object.conDetails;
		  var webServiceTemplateMaster = object.conDetails.webServiceTemplateMaster;
		  var webServiceAuthenticationTypes = object.conDetails.webServiceTemplateMaster.webServiceAuthenticationTypes;
		  var oAuth2 = object.conDetails.webServiceTemplateMaster.oAuth2;
		  apiDetails = object.apiDetails;
		  var dataSourceNameWs = object.conDetails.dataSourceName;
		  
		  var authPathParams =  $.parseJSON(object.conDetails.authPathParams);
		  var authenticationUrl = webServiceTemplateMaster.authenticationUrl;
		  var authRequestParams =  $.parseJSON(object.conDetails.requestParams);
		  var authRequestBodyParams =  $.parseJSON(object.conDetails.bodyParams); 
		  var authenticationBodyParams = $.parseJSON(webServiceTemplateMaster.authenticationBodyParams);
		  
		  $("#wsOauth2Details,#authRequestParametersDiv,#authRequestBodyParametersDiv").hide();
		  $("#dataSource_name").val(dataSourceNameWs);
		  $(".dataSourceDiv").text(dataSourceNameWs);
		  $("#authenticationType").val(webServiceAuthenticationTypes.authenticationType).attr("authentication-type-id",webServiceAuthenticationTypes.id);
		  $(".authenticationTypeDiv").text(webServiceAuthenticationTypes.authenticationType);
		  modifiedAuthenticationUrl = standardPackage.replacePathParams(authenticationUrl,authPathParams);
		  
		  $("#authenticationURL").val(modifiedAuthenticationUrl).data("authenticationUrl",webServiceTemplateMaster.authenticationUrl);
		  $("#baseUrlAuth").val(webServiceTemplateMaster.baseUrl);    
		  
		  $("#authenticationMethodType").val(webServiceTemplateMaster.authenticationMethodType);
		  var authRequestParamsWithType = {};
		  $.each(webServiceTemplateMaster.webServiceTemplateAuthRequestparams,function(i,obje){
			  authRequestParamsWithType[obje.paramName] = obje.passwordType;
		  });
		  var authRequestBodyParamsWithType = {};
		  if(!$.isEmptyObject(authenticationBodyParams) && authenticationBodyParams != null ){
		  $.each(authenticationBodyParams,function(i,obje){
			  authRequestBodyParamsWithType[obje.paramName] = obje.isPassword;
		  });
		  } 
		  var authRequestParametersTbl = $("#authenticationParamsList tbody");
		  authRequestParametersTbl.empty();
		  
		  if(!$.isEmptyObject(authRequestParams)){
   			  
			  var tr$ = $("<tr>"); 
				var td$ = $("<td>");
					$.each(authRequestParams,function(key,val){
						var $tr = tr$.clone().append(td$.clone().text(key).append($("<input>",{type:"hidden", class:"authRequestParamName",value:key})));
						var $td = td$.clone().text(val).append($("<input>",{type:"hidden", class:"authRequestParamValue",value:val}));
						if ( authRequestParamsWithType[key] ) {
							$td.text("");
							$td.append($("<span>",{class:"plainValue"}).text(val).hide()).append($("<span>",{class:"hiddenValue"}).css("font-weight","bold").text("*********"))
							$tr.append($td);
							$td = td$.clone().append( $("<i class='fa fa-eye-slash togglePassword'  aria-hidden='true'></i>") ) ;
						} else {
							$td.prop("colspan","2")
						}
						$tr.append($td);
						
						authRequestParametersTbl.append($tr);
					});
					$("#authRequestParametersDiv").show();
   		}
		  var authRequestBodyParametersTbl = $("#authenticationRequestBodyParamsList tbody");
		  authRequestBodyParametersTbl.empty();
		  
      if(!$.isEmptyObject(authRequestBodyParams)){
			  var tr$ = $("<tr>"); 
				var td$ = $("<td>");
					$.each(authRequestBodyParams,function(key,val){
						var $tr = tr$.clone().append(td$.clone().text(key).append($("<input>",{type:"hidden", class:"authRequestParamName",value:key})));
						var $td = td$.clone().text(val).append($("<input>",{type:"hidden", class:"authRequestParamValue",value:val}));
						if ( authRequestBodyParamsWithType[key] ) {
							$td.text("");
							$td.append($("<span>",{class:"plainValue"}).text(val).hide()).append($("<span>",{class:"hiddenValue"}).css("font-weight","bold").text("*********"))
							$tr.append($td);
							$td = td$.clone().append( $("<i class='fa fa-eye-slash togglePassword'  aria-hidden='true'></i>") ) ;
						} else {
							$td.prop("colspan","2")
						}
						$tr.append($td);
						
						authRequestBodyParametersTbl.append($tr);
					});
					$("#authRequestBodyParametersDiv").show();
   		}
		 
		  
		  if ( webServiceAuthenticationTypes.id == 5 ) {
			  
			  $("#wsCallBackUrl").empty().text(oAuth2.redirectUrl);
			  $("#wsAccessTokenUrl").empty().text(oAuth2.accessTokenUrl);
			  $("#wsClientIdentifier").empty().text(oAuth2.clientIdentifier);
			  $("#wsClientSecret").empty().text(oAuth2.clientSecret);
			  $("#wsGrantType").empty().text(oAuth2.grantType);
			  
			  $("#wsOauth2Details").show();
			  
		  }
		  
		  if ( webServiceAuthenticationTypes.id == 3 ) {
			  $("#authenticationURL, #authenticationMethodType").closest(".form-group").hide();
		  } else {
			  $("#authenticationURL, #authenticationMethodType").closest(".form-group").show();
		  }
		  
		  $("#webServiceDefaultMapingConnectionDetails").show();
		  
		  
	  },
	   validateWebServiceApi : function(div){
		  
		var apiDiv = $(div.closest("div.wsApiDetailsDiv"));
		var userID = $("#userID").val();
		var wsApiName = apiDiv.find(".wsApiName").val();
		var wsApiUrl = apiDiv.find(".wsApiUrl").val();
		var soapBodyElement = apiDiv.find("#soapBodyElement").val();
		var methodType = apiDiv.find(".wsApiMethodType").is(":checked");
		var wsApiResponseObjName = apiDiv.find(".wsApiResponseObjName").val();
		var paginationOffSetTypeDiv = apiDiv.find(".paginationOffSetType");
		var paginationDateTypeDiv = apiDiv.find(".paginationDateType");
		var webserviceType = apiDiv.find("#webserviceType").val();
		
		common.clearValidations([apiDiv.find(".wsApiName"),apiDiv.find(".wsApiUrl"),apiDiv.find(".wsApiMethodType"),apiDiv.find("#soapBodyElement"),apiDiv.find("#webserviceType"),
		                         ,apiDiv.find(".wsApiResponseObjName"),paginationOffSetTypeDiv.find(".paginationLimitRequestParamName"),
		                         apiDiv.find(".paginationOffsetDateType"),
		                         paginationOffSetTypeDiv.find(".paginationOffSetRequestParamName")
		                         ,paginationOffSetTypeDiv.find(".paginationOffSetRequestParamValue")
		                         ,paginationOffSetTypeDiv.find(".paginationLimitRequestParamValue"),
		                         paginationDateTypeDiv.find(".paginationStartDateParam") ,
		                         paginationDateTypeDiv.find(".paginationEndDateParam") ,
		                         paginationDateTypeDiv.find(".paginationStartDate"),
		                         paginationDateTypeDiv.find(".paginationDateRange")
		                         ]);
		 
		 var validStatus=true;
		   
		    if(wsApiName == '' ){
		    	 common.showcustommsg(apiDiv.find(".wsApiName"),globalMessage['anvizent.package.message.pleaseEnterWebserviceApiName'],apiDiv.find(".wsApiName"));
		    	 validStatus = false;
		     }
		    if(webserviceType == 'SOAP'){
		    	 if(soapBodyElement == '' ){
			    	 common.showcustommsg(apiDiv.find("#soapBodyElement"),globalMessage['anvizent.package.message.pleaseEnterSoapBodyParameter'],apiDiv.find("#soapBodyElement"));
			    	 validStatus = false;
			     }
			}
		   
		   	if(wsApiUrl == ''){
		   	 common.showcustommsg(apiDiv.find(".wsApiUrl"), globalMessage['anvizent.package.message.pleaseEnterWebserviceApiUrl'],apiDiv.find(".wsApiUrl"));
		     validStatus =false;
		   	  
		   	}
		   	if(!methodType){
			   	 common.showcustommsg(apiDiv.find(".wsApiMethodType"), globalMessage['anvizent.package.message.pleaseChooseMethodtype'],apiDiv.find(".wsApiMethodType"));
			     validStatus =false;
			   	}
	 	 
		    
	  	     
	  		 apiDiv.find(".wsApiRequestParam").each(function(i,val){
	  			var valObj = $(val);
	   			var requestParamName = valObj.find(".wsApiRequestParamName").val();
	   			var requestParamValue = valObj.find(".wsApiRequestParamValue").val();
	   	    	 common.clearValidations([valObj.find(".wsApiRequestParamName"),valObj.find(".wsApiRequestParamValue")]);
			    
			    if(requestParamName == ''){
			    	 common.showcustommsg(valObj.find(".wsApiRequestParamName"),globalMessage['anvizent.package.message.pleaseEnterRequestParamName'] ,valObj.find(".wsApiRequestParamName"));
			    	 validStatus = false;
			    }
			    if ( valObj.find(".wsApiRequestParamValue").data("mandatory") == true) {
			    	if( requestParamValue == '' ){
			    		common.showcustommsg(valObj.find(".wsApiRequestParamValue"), globalMessage['anvizent.package.message.pleaseEnterRequestParamValue'], valObj.find(".wsApiRequestParamValue"));
			    		validStatus = false;
			    	}			    	
			    }
	   		});
	  		 
	  		 
	  		apiDiv.find(".wsApiBodyParam").each(function(i,val){
	  			var valObj = $(val);
	   			var requestParamName = valObj.find(".wsApiRequestParamName").val();
	   			var requestParamValue = valObj.find(".wsApiRequestParamValue").val();
	   	    	 common.clearValidations([valObj.find(".wsApiRequestParamName"),valObj.find(".wsApiRequestParamValue")]);
			    
			    if(requestParamName == ''){
			    	 common.showcustommsg(valObj.find(".wsApiRequestParamName"),globalMessage['anvizent.package.message.pleaseEnterRequestParamName'] ,valObj.find(".wsApiRequestParamName"));
			    	 validStatus = false;
			    }
			    if ( valObj.find(".wsApiRequestParamValue").data("mandatory") == true) {
			    	if( requestParamValue == '' ){
			    		common.showcustommsg(valObj.find(".wsApiRequestParamValue"), globalMessage['anvizent.package.message.pleaseEnterRequestParamValue'], valObj.find(".wsApiRequestParamValue"));
			    		validStatus = false;
			    	}			    	
			    }
	   		});
	  		
	  		var paginationRequired = apiDiv.find(".paginationRequired:checked").val() == 'yes' ? true : false ;
	  		var paginationType = apiDiv.find(".paginationOffsetDateType:checked").val();
			if ( paginationRequired ) {  
					if(paginationType == 'offset'){
						var paginationOffSetRequestParamName =  paginationOffSetTypeDiv.find(".paginationOffSetRequestParamName").val();
						var paginationOffSetRequestParamValue = paginationOffSetTypeDiv.find(".paginationOffSetRequestParamValue").val();
						var paginationLimitRequestParamName =   paginationOffSetTypeDiv.find(".paginationLimitRequestParamName").val();
						var paginationLimitRequestParamValue =  paginationOffSetTypeDiv.find(".paginationLimitRequestParamValue").val();
						var paginationObjectName =  paginationOffSetTypeDiv.find(".paginationObjectName").val();
						var paginationSearchId =  paginationOffSetTypeDiv.find(".paginationSearchId").val();
						var PaginationSoapBody =  paginationOffSetTypeDiv.find(".PaginationSoapBody").val();
						
						if(paginationOffSetRequestParamName == ''){
							common.showcustommsg(paginationOffSetTypeDiv.find(".paginationOffSetRequestParamName"), globalMessage['anvizent.package.label.pleaseEnterValue'], paginationOffSetTypeDiv.find(".paramValue"));
							validStatus = false;
						}
						if(paginationOffSetRequestParamValue == '' || !$.isNumeric(paginationOffSetRequestParamValue)){
							common.showcustommsg(paginationOffSetTypeDiv.find(".paginationOffSetRequestParamValue"),globalMessage['anvizent.package.label.pleaseenternumericvalueexcept0'], paginationOffSetTypeDiv.find(".paramValue"));
							validStatus = false;
						}
						if(paginationLimitRequestParamName == ''){
							common.showcustommsg(paginationOffSetTypeDiv.find(".paginationLimitRequestParamName"), globalMessage['anvizent.package.label.pleaseEnterValue'], paginationOffSetTypeDiv.find(".paramValue"));
							validStatus = false;
						}
						if(paginationLimitRequestParamValue == '' || paginationLimitRequestParamValue == 0 || !$.isNumeric(paginationLimitRequestParamValue)){
							common.showcustommsg(paginationOffSetTypeDiv.find(".paginationLimitRequestParamValue"),globalMessage['anvizent.package.label.pleaseenternumericvalueexcept0'], paginationOffSetTypeDiv.find(".paramValue"));
							validStatus = false;
						}
						
					}else if(paginationType == 'date'){
						var paginationStartDateParam =  paginationDateTypeDiv.find(".paginationStartDateParam").val();
						var paginationEndDateParam =  paginationDateTypeDiv.find(".paginationEndDateParam").val();
						var paginationStartDate = paginationDateTypeDiv.find(".paginationStartDate").val();
						var paginationDateRange =   paginationDateTypeDiv.find(".paginationDateRange").val();
						
						if(paginationStartDateParam == ''){  
							common.showcustommsg(paginationDateTypeDiv.find(".paginationStartDateParam"), globalMessage['anvizent.package.label.pleaseEnterValue'], paginationDateTypeDiv.find(".paginationStartDateParam"));
							validStatus = false;
						}
						if(paginationEndDateParam == ''){  
							common.showcustommsg(paginationDateTypeDiv.find(".paginationEndDateParam"), globalMessage['anvizent.package.label.pleaseEnterValue'], paginationDateTypeDiv.find(".paginationEndDateParam"));
							validStatus = false;
						}
						if(paginationStartDate == ''){
							common.showcustommsg(paginationDateTypeDiv.find(".paginationStartDate"), globalMessage['anvizent.package.label.pleasechoosestartdate'],paginationDateTypeDiv.find(".paginationStartDate"));
							validStatus = false;
						}
						if(paginationDateRange == ''){
							common.showcustommsg(paginationDateTypeDiv.find(".paginationDateRange"),globalMessage['anvizent.package.label.pleaseSelectdaterange'],paginationDateTypeDiv.find(".paginationDateRange"));
							validStatus = false;
						}
					}else if(paginationType == 'hypermedia'){
						
						var paginationHyperLinkPattern =  paginationDateTypeDiv.find(".paginationHyperLinkPattern").val();
						var paginationHypermediaPageLimit =  paginationDateTypeDiv.find(".paginationHypermediaPageLimit").val();
						
						if(paginationHyperLinkPattern == ''){  
							common.showcustommsg(paginationDateTypeDiv.find(".paginationHyperLinkPattern"), globalMessage['anvizent.package.label.pleaseEnterValue'], paginationDateTypeDiv.find(".paginationHyperLinkPattern"));
							validStatus = false;
						}
					}else{
						common.showcustommsg(apiDiv.find(".paginationOffsetDateType"), "Please choose pagination type.", apiDiv.find(".paginationOffsetDateType"));
						validStatus = false;
			    }
				 }
	  		
	  		var incrementalUpdate = apiDiv.find(".incrementalUpdate").prop("checked");
	  		
	  		var incrementalUpdateDetailsDiv = apiDiv.find(".incrementalUpdateDetailsDiv");
			if ( incrementalUpdate ) {
				var incrementalUpdateParamName = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamName").val();
				var incrementalUpdateParamvalue = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamvalue").val();
				var incrementalUpdateParamColumnName = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamColumnName").val();
				var incrementalUpdateParamType = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamType").val();
				
				if ( incrementalUpdateParamName.trim().length == 0 ) {
					common.showcustommsg(incrementalUpdateDetailsDiv.find(".incrementalUpdateParamName"), globalMessage['anvizent.package.label.pleaseEnterValue'], incrementalUpdateDetailsDiv.find(".incrementalUpdateParamName") );
					validStatus = false;
				}
				if ( incrementalUpdateParamvalue.trim().length == 0 ) {
					common.showcustommsg(incrementalUpdateDetailsDiv.find(".incrementalUpdateParamvalue"), globalMessage['anvizent.package.label.pleaseEnterValue'], incrementalUpdateDetailsDiv.find(".incrementalUpdateParamvalue") );
					validStatus = false;
				}
				
			}
	  		 
		 	apiDiv.find(".wsManualSubUrlDiv").each(function(i,val){
				 
				var valObj = $(val);
				
				var wsUrlPathParamVar = valObj.find(".wsUrlPathParam").text();
				var pathParamValTypeVarVal = valObj.find(".pathParamValType:checked").val();
				var pathParamValTypeVar = valObj.find(".pathParamValType").is(":checked");
				var manualParamValueVar = valObj.find(".manualParamValue").val();
				var subApiUrlVar = valObj.find(".wsSubApiUrl").val();
				var subApiMethodTypeVar = valObj.find(".wsSubApiMethodType").is(":checked");
				var subApiResponseObjectVar = valObj.find(".wsSubApiResponseObjName").val();
				
				 common.clearValidations([valObj.find(".wsUrlPathParam"),valObj.find(".pathParamValType"),
				                          valObj.find(".manualParamValue"),valObj.find(".wsSubApiUrl"),
				                          valObj.find(".wsSubApiMethodType"),valObj.find(".wsSubApiResponseObjName"),
				                          valObj.find('.subUrlPaginationOffSetRequestParamName'),
				                          valObj.find('.subUrlPaginationOffSetRequestParamValue'),valObj.find('.subUrlPaginationLimitRequestParamName'),
				                          valObj.find('.subUrlPaginationLimitRequestParamValue'),
				                          valObj.find('.subUrlPaginationStartDateParam'),valObj.find('.subUrlPaginationEndDateParam'),
				                          valObj.find('.subUrlPaginationStartDate'),valObj.find('.subUrlPaginationDateRange')
				                          ]);
				    
				    if(wsUrlPathParamVar == ''){
				    	 common.showcustommsg(valObj.find(".wsUrlPathParam"),globalMessage['anvizent.package.message.pleaseEnterPathParam'],valObj.find(".wsUrlPathParam"));
				    	 validStatus = false;
				    }
				    if(!pathParamValTypeVar ){
				    	common.showcustommsg( valObj.find(".pathParamValType"), globalMessage['anvizent.package.message.pleaseChooseMethodtype'], valObj.find(".pathParamValType"));
				    	 validStatus = false;
				    }
				    if (pathParamValTypeVarVal == "M") {
				    if(manualParamValueVar == ''){
				    	 common.showcustommsg(valObj.find(".manualParamValue"),globalMessage['anvizent.package.message.pleaseEnterParamValue'],valObj.find(".manualParamValue"));
				    	 validStatus = false;
				    }
				    }
			 
			       if(pathParamValTypeVarVal == "S"){
			    	if(subApiUrlVar == ''){
				    	 common.showcustommsg(valObj.find(".wsSubApiUrl"),globalMessage['anvizent.package.message.pleaseEnterSubApiUrl'] ,valObj.find(".wsSubApiUrl"));
				    	 validStatus = false;	
				    }
		    	   if(!subApiMethodTypeVar){
					   common.showcustommsg(valObj.find(".wsSubApiMethodType"),globalMessage['anvizent.package.message.pleaseChooseSubApiMethodtype'],valObj.find(".wsSubApiMethodType"));
					   validStatus = false;
				   }
		    	   if(subApiResponseObjectVar == ''){
					   common.showcustommsg( valObj.find(".wsSubApiResponseObjName"), globalMessage['anvizent.package.message.pleaseEnterSubApiResponseTypeObject'], valObj.find(".wsSubApiResponseObjName"));
					   validStatus = false;
				   }
					var subUrlPaginationRequired = valObj.find(".subUrlPaginationRequired:checked").val() == 'yes' ? true : false;
					var subUrlPaginationType = valObj.find(".subUrlPaginationOffsetDateType:checked").val();
					if(subUrlPaginationRequired){
					  if(subUrlPaginationType == 'offset'){
						var subUrlPaginationOffSetRequestParamName = valObj.find('.subUrlPaginationOffSetRequestParamName').val();
						var subUrlPaginationOffSetRequestParamValue = valObj.find('.subUrlPaginationOffSetRequestParamValue').val();
						var subUrlPaginationLimitRequestParamName = valObj.find('.subUrlPaginationLimitRequestParamName').val();
						var subUrlPaginationLimitRequestParamValue = valObj.find('.subUrlPaginationLimitRequestParamValue').val();
						
						if(subUrlPaginationOffSetRequestParamName == ''){
							common.showcustommsg(valObj.find('.subUrlPaginationOffSetRequestParamName') ,globalMessage['anvizent.package.label.pleaseentersuburloffsetparamname'] , valObj.find('.subUrlPaginationOffSetRequestParamName'));
							validStatus = false;
						} 
						if(subUrlPaginationOffSetRequestParamValue == '' || !$.isNumeric(subUrlPaginationOffSetRequestParamValue)){
							common.showcustommsg(valObj.find('.subUrlPaginationOffSetRequestParamValue') ,globalMessage['anvizent.package.label.pleaseentersuburloffsetparamvalue'] , valObj.find('.subUrlPaginationOffSetRequestParamValue'));
							validStatus = false;
							}
						if(subUrlPaginationLimitRequestParamName == ''){
							common.showcustommsg(valObj.find('.subUrlPaginationLimitRequestParamName') ,globalMessage['anvizent.package.label.pleaseentersuburllimitparamname'], valObj.find('.subUrlPaginationLimitRequestParamName'));
							validStatus = false;
						
						}
						if(subUrlPaginationLimitRequestParamValue == '' || subUrlPaginationLimitRequestParamValue == 0 || !$.isNumeric(subUrlPaginationLimitRequestParamValue)){   
							common.showcustommsg(valObj.find('.subUrlPaginationLimitRequestParamValue') ,globalMessage['anvizent.package.label.pleaseentersuburllimitparamvalue'] , valObj.find('.subUrlPaginationLimitRequestParamValue'));
							validStatus = false;
						}
						}else if(subUrlPaginationType == 'date'){
							var subUrlPaginationStartDateParam = valObj.find('.subUrlPaginationStartDateParam').val();
							var subUrlPaginationEndDateParam = valObj.find('.subUrlPaginationEndDateParam').val();
							var subUrlPaginationStartDate = valObj.find('.subUrlPaginationStartDate').val();
							var subUrlPaginationDateRange = valObj.find('.subUrlPaginationDateRange').val();
							if(subUrlPaginationStartDateParam == ''){
								common.showcustommsg(valObj.find('.subUrlPaginationStartDateParam') ,globalMessage['anvizent.package.label.pleaseentersuburlfromdateparamname'] , valObj.find('.subUrlPaginationStartDateParam'));
								validStatus = false;
							} 
							if(subUrlPaginationEndDateParam == ''){
								common.showcustommsg(valObj.find('.subUrlPaginationEndDateParam') ,globalMessage['anvizent.package.label.pleaseentersuburltodateparamname'], valObj.find('.subUrlPaginationEndDateParam'));
								validStatus = false;
							} 
							if(subUrlPaginationStartDate == ''){
								common.showcustommsg(valObj.find('.subUrlPaginationStartDate') ,globalMessage['anvizent.package.label.pleaseentersuburlstartdate'] , valObj.find('.subUrlPaginationStartDate'));
								validStatus = false;
								}
							if(subUrlPaginationDateRange == ''){
								common.showcustommsg(valObj.find('.subUrlPaginationDateRange') ,globalMessage['anvizent.package.label.pleasechoosedaterange'], valObj.find('.subUrlPaginationDateRange'));
								validStatus = false;
							}
						} else {
							var subUrlPaginationHyperLinkPattern = valObj.find('.subUrlPaginationHyperLinkPattern').val();
							
							if(subUrlPaginationHyperLinkPattern == ''){
								common.showcustommsg(valObj.find('.subUrlPaginationHyperLinkPattern') ,globalMessage['anvizent.package.label.pleaseentersuburl.hypermedia.pattern'] , valObj.find('.subUrlPaginationHyperLinkPattern'));
								validStatus = false;
							} 
						}
					}
			      }
	            });
			  return validStatus;
		  },
		 	 
	  validateJoinWebServiceApi : function(){
		  
		    var apiDiv = $("div.wsApiDetailsDiv");
		    
		    var  validStatus = true;
		    
		    apiDiv.each(function(i,val){
		    	
		    	   common.clearValidations([$(this).find(".wsApiName"),$(this).find(".wsApiUrl"), $(this).find('.wsApiMethodType'),$(this).find('.wsApiResponseObjName')]);
		    	   
		          	var apiName = $(this).find(".wsApiName").val(); 
				    var apiUrl = $(this).find(".wsApiUrl").val();
				    var webServiceMethodType = $(this).find('input[class=wsApiMethodType]').is(":checked");
				    var webServiceMethodTypeVal = $(this).find('input[class=wsApiMethodType]:checked').val();
				    var responseObjectName =  $(this).find(".wsApiResponseObjName").val();
			    
			    
			    if(apiName == ''){
			    	 common.showcustommsg($(this).find(".wsApiName"),globalMessage['anvizent.package.message.pleaseEnterWebserviceApiName'],$(this).find(".wsApiName"));
			    	 validStatus = false;
			    }
			    if(apiUrl == ''){
			    	common.showcustommsg( $(this).find(".wsApiUrl"),  globalMessage['anvizent.package.message.pleaseEnterWebserviceApiUrl'], $(this).find(".wsApiUrl"));
			    	 validStatus = false;
			    }
			    
			    
			   if(!webServiceMethodType){
				   common.showcustommsg($(this).find('.wsApiMethodType'),  globalMessage['anvizent.package.message.pleaseChooseMethodtype'],$(this).find('.wsApiMethodType'));
				   validStatus = false;
			   }
			   
		    });
		    
		    apiDiv.find(".wsApiRequestParam").each(function(i,val){
	  			var valObj = $(val);
	   			var requestParamName = valObj.find(".wsApiRequestParamName").val();
	   			var requestParamValue = valObj.find(".wsApiRequestParamValue").val();
	   			 
	   	    	 common.clearValidations([valObj.find(".wsApiRequestParamName"),valObj.find(".wsApiRequestParamValue")]);
			    
			    if(requestParamName == ''){
			    	 common.showcustommsg(valObj.find(".wsApiRequestParamName"),globalMessage['anvizent.package.message.pleaseEnterRequestParamName'],valObj.find(".wsApiRequestParamName"));
			    	 validStatus = false;
			    }
			    if ( valObj.find(".wsApiRequestParamValue").data("mandatory") == true) {
			    	
			    	if( requestParamValue == '' ){
			    		common.showcustommsg(valObj.find(".wsApiRequestParamValue"), globalMessage['anvizent.package.label.pleaseenterRequestParamValue'], valObj.find(".wsApiRequestParamValue"));
			    		validStatus = false;
			    	}
			    }
	   		});
		    
	        apiDiv.find(".wsManualSubUrlDiv").each(function(i,val){
			 
			var valObj = $(val);
			
			var wsUrlPathParamVar = valObj.find(".wsUrlPathParam").text();
			var pathParamValTypeVarVal = valObj.find(".pathParamValType:checked").val();
			var pathParamValTypeVar = valObj.find(".pathParamValType").is(":checked");
			var manualParamValueVar = valObj.find(".manualParamValue").val();
			var subApiUrlVar = valObj.find(".wsSubApiUrl").val();
			var subApiMethodTypeVar = valObj.find(".wsSubApiMethodType").is(":checked");
			var subApiResponseObjectVar = valObj.find(".wsSubApiResponseObjName").val();
			
			 common.clearValidations([valObj.find(".wsUrlPathParam"),valObj.find(".pathParamValType"),valObj.find(".manualParamValue"),valObj.find(".wsSubApiUrl"),valObj.find(".wsSubApiMethodType"),valObj.find(".wsSubApiResponseObjName")]);
			    
			    if(wsUrlPathParamVar == ''){
			    	 common.showcustommsg(valObj.find(".wsUrlPathParam"),globalMessage['anvizent.package.message.pleaseEnterPathParam'],valObj.find(".wsUrlPathParam"));
			    	 validStatus = false;
			    }
			    if(!pathParamValTypeVar ){
			    	common.showcustommsg( valObj.find(".pathParamValType"),globalMessage['anvizent.package.message.pleaseChooseMethodtype'], valObj.find(".pathParamValType"));
			    	 validStatus = false;
			    }
			    if (pathParamValTypeVarVal == "M") {
			    if(manualParamValueVar == ''){
			    	 common.showcustommsg(valObj.find(".manualParamValue"),globalMessage['anvizent.package.message.pleaseEnterParamValue'],valObj.find(".manualParamValue"));
			    	 validStatus = false;
			    }
			    }
		 
		       if(pathParamValTypeVarVal == "S"){
		    	if(subApiUrlVar == ''){
			    	 common.showcustommsg(valObj.find(".wsSubApiUrl"),globalMessage['anvizent.package.message.pleaseEnterSubApiUrl'],valObj.find(".wsSubApiUrl"));
			    	 validStatus = false;	
			    }
	    	   if(!subApiMethodTypeVar){
				   common.showcustommsg(valObj.find(".wsSubApiMethodType"), globalMessage['anvizent.package.message.pleaseChooseSubApiMethodtype'],valObj.find(".wsSubApiMethodType"));
				   validStatus = false;
			   }
	    	   if(subApiResponseObjectVar == ''){
				   common.showcustommsg( valObj.find(".wsSubApiResponseObjName"),globalMessage['anvizent.package.label.pleaseChooseMethodType'], valObj.find(".wsSubApiResponseObjName"));
				   validStatus = false;
			   }
		    }
            });
		  return validStatus;
	  },
	  getWsMappingDetails : function(wsConId ,ilId){
		  
	  var userID = $("#userID").val();
	  var url_getWebServiceMappingDetails = "/app/user/"+userID+"/package/getWebServiceConnectionDetails/"+wsConId+"/"+ilId;
		showAjaxLoader(true);
		 var myAjax = common.loadAjaxCall(url_getWebServiceMappingDetails,'GET','',headers);
	      myAjax.done(function(result) {
	    	  showAjaxLoader(false);
	    	  console.log("result:",result);
	    	  if(result != null && result.hasMessages){ 
	    			  if(result.messages[0].code == "FAILED") {
	    				   common.showErrorAlert(result.messages[0].text)
		    			   return false; 
		    			  } else if(result.messages[0].code == "SUCCESS") {
		    				  standardPackage.getWebServiceConnectionDetails(result.object);
		    				  if ( result.object.authenticationResponse ) {
		    					  standardPackage.parseAuthenticationWithIlApis(result.object.authenticationResponse);
		    				  } else {
		    					  $("#webServiceDefaultMapingConnectionDetails .panel-info .panel-body").show();
		    				  }
		    			  }
	    	       }else{
		    		var messages = [ {
		    			code : globalMessage['anvizent.message.error.code'],
		    			text : globalMessage['anvizent.package.label.unableToProcessYourRequest']
		    		} ];
		    		common.displayMessages(messages);
		    	}
	    });
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
    	
    	// schedule
    	schedulePackageOpenPopup : function(_this){
    		
    		common.clearValidations(["#weeklyRecurrencePatternValidation","#recurrencePatternValidation","#scheduleStartDateValidation","#rangeofRecurrenceValidation","#scheduleEndDateVaLidation","#scheduleStartDateValidation"]);
    		packageId = 0;
    		$("#packageId").val(packageId);
    		packageName = "Standard Package";  
    		dlName = $(_this).attr("data-dLName");
    		dlId=$(_this).attr("data-dLId");
    		industryId = $(_this).attr("data-industryId");
    		reRunVal = $(_this).attr("data-reSchedule");
    		scheduleId = $(_this).attr("data-scheduleId");
    		isClientDbTables = $(_this).attr("data-isClientDbTables");
    		packageType = $(_this).attr("data-packagetype");
    		schedulerType = $(_this).attr("data-schedulerType");
    		$("#schedulePackagePopUpHeader").text("Standard Package  --  " + dlName);
    		var runOrSchedule = $('input[name=runNowOrSchedule]:checked').val();
    		if (runOrSchedule == 'schedule') {
    			$('.checkedFlaseTrue').attr('checked', false);
    			$('#weeklyRecurrencePattern').hide();
    			$('#yearlyRecurrencePattern').hide();
    			$('#monthlyRecurrencePattern').hide();
    			$("#hourlyRecurrencePattern").hide();
    			$('input[name=recurrencePattern]').attr("checked", false);
    			$('#weeksToRun').val('');
    			$('input[name=weekDayCheckBox]').attr("checked", false);
    			$('.datepicker').datepicker('setDate', null);
    			$("#scheduleStartHours").prop('selectedIndex', 0);
    			$("#scheduleStartMinutes").prop('selectedIndex', 0);
    			$('#scheduleEndDate').datepicker('setDate', null);
    			$("#dayOfMonth").prop('selectedIndex', 30);
    			$("#monthsToRun").prop('selectedIndex', 5);
    			$('#yearsToRun').val('');
    			
    			$('#everyhour').val('');
    			$("#selectedhours").val([]);
    			$("#selectedhours").multipleSelect('refresh');
    			$('input[name=hourlyRadios]').attr("checked", false);
    			$("#hourlyRecurrencePattern").attr("checked", false);
    			
    			$("#monthOfYear option:first").attr('selected', 'selected');
    			$('#dayOfYear').val('1');
    			$('input[name=rangeOfRecurrence]').attr("checked", false);
    			$("#RecurrencePattern").hide();
    			$("#scheduleTime").hide();
    			$("#RangeofRecurrence,#timeZoneDivPanel").hide();
    			$("#yearsToRun").val("1");
    			$("#weeksToRun").val("1");

    		}
    		common.clearcustomsg("#runNowOrSchedulevalidation");
    		$("#scheduleStandardPackagePopUp").modal('show');
    		if (runOrSchedule == 'schedule') {
    			$("input[name='runNowOrSchedule'][value='schedule']").click()
    		}
    		$("#confirmSchedule").prop("disabled", false);

    	},
    	
    	schedulePackage : function(uploadStatus){
    		common.clearValidations(["#scheduleStartDateValidation, #recurrencePatternValidation, #scheduleEndDateVaLidation, #rangeofRecurrenceValidation","#timesZone"]);
    		if(packageId == null){
    			packageId = 0;
    		}
    		var scheduleStartDateVal = $("#scheduleStartDate").val();
    		var reloadUrl = $("#reloadUrl").val();
    		var rangeOfRecurrenceValidation = $('input:radio[name=rangeOfRecurrence]:checked').val();
    		var scheduleOnce = $('input:radio[name=recurrencePattern]:checked').val();
    		
    		if(scheduleOnce != 'once'){
    			
    		if (scheduleStartDateVal.length == 0) {
    			common.showcustommsg("#scheduleStartDateValidation", globalMessage['anvizent.package.label.pleaseFillScheduleStartDate']);
    		}
    		
    		if ($('input:radio[name=rangeOfRecurrence]').is(":checked")) {
    			if (rangeOfRecurrenceValidation == 'ScheduleEndDate') {
    				var scheduleEndDateVal = $("#scheduleEndDate").val();
    				if (scheduleEndDateVal.length == 0) {
    					common.showcustommsg("#scheduleEndDateVaLidation", globalMessage['anvizent.package.label.pleaseFillScheduleEndDate']);
    				}
    			}
    		} else {
    			common.showcustommsg("#rangeofRecurrenceValidation", globalMessage['anvizent.package.label.pleaseChooseAnyOneOfRangeOfRecurrence']);
    		}
    		}
    		var scheduleStartDate = null;
    		var scheduleStartTime = null;
    		var recurrencePattern = null;
    		var daysToRun = null;
    		var weeksToRun = null;
    		var dayOfMonth = null;
    		var monthsToRun = null;
    		var dayOfYear = null;
    		var monthOfYear = null;
    		var yearsToRun = null;
    		var isNoEndDate = false;
    		var scheduleEndDate = null;
    		var noOfMaxOccurences = null;
    		var timeZone=null;
    		var typeOfHours=null;
    		var hoursToRun=null
    		var runNowOrSchedule = $("input[type=radio][name='runNowOrSchedule']:checked").val();
    		// TODO validation for all fields
    		if (runNowOrSchedule == 'schedule') {
    			if(scheduleOnce != 'once'){
    				var validation = checkValidation();
    				if (!validation)
    					return false;
    			}
    			scheduleStartDate = $("#scheduleStartDate").val();
    			var scheduleStartHours = $("#scheduleStartHours").val();
    			var scheduleStartMinutes = $("#scheduleStartMinutes").val();
    			scheduleStartTime = scheduleStartHours + ":"+ scheduleStartMinutes;
    			
    			var recurrencePatternSelector = 'input[name="recurrencePattern"]';
    			$(recurrencePatternSelector).each(function() {
    				if ($(this).is(":checked")) {
    					
    					if ($(this).val() == "once") {
    						recurrencePattern = $(this).val();
    					}
    					
    					if ($(this).val() == "runnow") {
    						// no options for run
    						// now
    						recurrencePattern = $(this).val();
    					}
    					if ($(this).val() == "hourly") {
    						// no options for hourly
    						// recurrence
    						recurrencePattern = $(this).val();
    						if ($("#everyhourlyRadios").is(":checked")) { 
								typeOfHours=$("#everyhourlyRadios").val();
								hoursToRun = $("#everyhour").val();	
							}
						
							if ($("#selectedhourlyRadios").is(":checked")) {
								typeOfHours= $("#selectedhourlyRadios").val();
								hoursToRun = $("#selectedhours").val().join(",");
							}
    						
    					}
    					if ($(this).val() == "daily") {
    						// no options for daily
    						// recurrence
    						recurrencePattern = $(this).val();
    					}
    					if ($(this).val() == "weekly") {
    						recurrencePattern = $(this).val();
    						daysToRun = $('input[name=weekDayCheckBox]:checked') .map(function() {
    											return $(this).val();
    										}).get().join(",");
    						weeksToRun = $("#weeksToRun").val();
    						console.log("daysToRun>>>" + daysToRun)
    					}
    					if ($(this).val() == "monthly") {
    						recurrencePattern = $(this).val();
    						$('input[name=monthlyRadios]').each(function() {
    											if ($(this).is(":checked")) { 
    												if ($(this).val() == 'monthlyOption_first') {
    													dayOfMonth = $("#dayOfMonth").val();
    													monthsToRun = $("#monthsToRun").val();
    												}
    											}
    										});
    					}
    					if ($(this).val() == "yearly") {
    						recurrencePattern = $(this).val();
    						$('input[name=yearlyRadios]').each(function() {
    											if ($(this).is(":checked")) {
    												if ($(this).val() == 'yearlyOptions_first') {
    													dayOfYear = $("#dayOfYear").val();
    													monthOfYear = $("#monthOfYear").val();
    													yearsToRun = $("#yearsToRun").val();
    												}
    											}
    										});
    					}
    					
    				}
    			});

    			var rangeOfRecurrence = 'input[name="rangeOfRecurrence"]';
    			$(rangeOfRecurrence).each(function() {
    				if ($(this).is(":checked")) {
    					if ($(this).val() == 'NoEndDate') {
    						isNoEndDate = true;
    					}
    					if ($(this).val() == 'MaxOccurences') {
    						noOfMaxOccurences = $( "#noOfMaxOccurences").val();
    					}
    					if ($(this).val() == 'ScheduleEndDate') {
    						scheduleEndDate = $("#scheduleEndDate").val();

    					}
    				}
    			});
    			timeZone = $("#timesZone").val();
    			if(timeZone == "select"){
    				common.showcustommsg("#timesZone", globalMessage['anvizent.package.msg.pleaseChoosetimezone'],"#timesZone");
    				return false;
    			}
    		}
    		showAjaxLoader(true);
    			// schedule
    			var selectData = {
    					userPackage : {
    						packageId : packageId,
    						isStandard : true,
    						isClientDbTables:isClientDbTables,
    						industry : {
    							id : industryId
    						},
    					},
    					schedule : {
    						scheduleId : scheduleId,
    						scheduleType : runNowOrSchedule,
    						scheduleStartDate : scheduleStartDate,
    						scheduleStartTime : scheduleStartTime,
    						recurrencePattern : recurrencePattern,
    						daysToRun : daysToRun,
    						weeksToRun : weeksToRun,
    						dayOfMonth : dayOfMonth,
    						monthsToRun : monthsToRun,
    						dayOfYear : dayOfYear,
    						monthOfYear : monthOfYear,
    						yearsToRun : yearsToRun,
    						isNoEndDate : isNoEndDate,
    						scheduleEndDate : scheduleEndDate,
    						noOfMaxOccurences : noOfMaxOccurences,
    						timeZone: timeZone,
    						typeOfHours:typeOfHours,
    						hoursToRun:hoursToRun
    					},
    					dlInfo :{
		    				dL_id : dlId,
		    				dL_name : dlName
		    			}

    				};
         			$('.loader').fadeIn('fast');
    				$('body').addClass('cursor-wait');

    				var token = $("meta[name='_csrf']").attr("content");
    				var header = $("meta[name='_csrf_header']").attr("content");
    				headers[header] = token;
    				var url_saveSchedule = "/app/user/" + userID + "/saveDLSchedule";
    				var myAjax = common.postAjaxCall(url_saveSchedule, 'POST', selectData,headers);
    				myAjax.done(function(result1) {
    					$('.loader').fadeOut('fast');
    					$('body').removeClass('cursor-wait');

    					if (result1.hasMessages) {
    						var messages = "";
    						$.each(result1, function(key, value) {
    							if (key == 'messages') {
    								messages = [ {
    									code : value[0].code,
    									text : value[0].text
    								} ];
    							}
    						});
    						$("#scheduleStandardPackagePopUp").modal('hide');
    						common.displayMessages(messages);
    						$("html, body").animate({ scrollTop: 0 }, "slow");
    						setTimeout(function(){ window.location.reload(); }, 3000);
    					} else {
    						standardPackage.showMessage(globalMessage['anvizent.package.label.operationFailedPleaseTryAgain']);
    						$("html, body").animate({ scrollTop: 0 }, "slow");
    						setTimeout(function(){ window.location.reload(); }, 3000);
    					}
    				});
    	},
    	populateTimeZones: function() {
    		  // TODO call ajax
			  // TODO fetch Time zones List
			  // TODO append to select box
    		// /$("#timesZone").val('select');
    		// $(".timeZoneList").empty();
    		if (isTimeZonesPopulated) {
				  return false;
			}
    		console.log("in populate time zones");
    		var token = $("meta[name='_csrf']").attr("content");
			var header = $("meta[name='_csrf_header']").attr("content");
			headers[header] = token;
			var userID = $("#userID").val();
			
			var url_getTimeZones = "/app/user/" + userID + "/getTimeZones";
			showAjaxLoader(true); 				
	 		var myAjax = common.postAjaxCallObject(url_getTimeZones,'GET','',common.getcsrfHeader());
	 	    myAjax.done(function(result) {
		 	    	showAjaxLoader(false); 
		 	    	if(result.hasMessages){		    			  
		    			if(result.messages[0].code == "ERROR") {		    				  
							var message = '<div class="alert alert-danger alert-dismissible" role="alert">'+''+result.messages[0].text+''+'</div>';
							$(".message-class").empty().append(message).show();
							setTimeout(function() { $(".message-class").hide(); }, 5000);
		    				return false;
		    			} 
		    			if(result.messages[0].code == "SUCCESS") {
		    				
		    				var timeZoneList = result.object;
		    				
		    				 var select$ = $("#timesZone");
		    				 for(var i=0;i<result.object.length;i++){
		    					 var key = result.object[i].zoneName;
		    					 var value = result.object[i].zoneNameDisplay; 
	    						 $("<option/>",{value:key,text:value}).appendTo(select$);
		    				 }
		    				 select$.select2();
		    				 var timesZoneval = select$.val();
		    				 if(timesZoneval == "select"){
		    					 select$.val(common.getTimezoneName()).trigger("change");
		    				 }
		    				 isTimeZonesPopulated = true;
		    				 // select$.appendTo(".timeZoneList");
		    			}		    			  		    			  	
			    	}
	 	    	});
    	},
    	
    	populateWebServices: function() {
  		  // TODO call ajax
			  // TODO fetch WebServices List
			  // TODO append to select box
    		$("#webServiceName").val('0');
    		$(".webServiceList").empty();
  		var token = $("meta[name='_csrf']").attr("content");
			var header = $("meta[name='_csrf_header']").attr("content");
			headers[header] = token;
			var userID = $("#userID").val();
			
			var url_getAllWebServices = "/app/user/" + userID + "/getAllWebServices";
			showAjaxLoader(true); 				
	 		var myAjax = common.postAjaxCallObject(url_getAllWebServices,'GET','',common.getcsrfHeader());
	 	    myAjax.done(function(result) {
		 	    	showAjaxLoader(false); 
		 	    	if(result.hasMessages){		    			  
		    			if(result.messages[0].code == "ERROR") {		    				  
							var message = '<div class="alert alert-danger alert-dismissible" role="alert">'+''+result.messages[0].text+''+'</div>';
							$(".message-class").empty().append(message).show();
							setTimeout(function() { $(".message-class").hide(); }, 5000);
		    				return false;
		    			} 
		    			if(result.messages[0].code == "SUCCESS") {
		    				var webServiceList = result.object;
		    				 var select$ = $("<select/>",{class:"form-control" ,id:"webServiceName"}).append($("<option/>",{value:'0',text:"Select Webservice Template"}));
		    				 $.each(webServiceList,function(key,value){
		    					 $("<option/>",{value:key,text:value}).appendTo(select$); 
		    				 });
		    				 select$.appendTo(".webServiceList");
		    			}		    			  		    			  	
			    	}
	 	    	});
  	},
  	
};
 

		
if($('.standardPackage-page').length ||  $('.addILSource-page').length || $('.activePackage-page').length ){
	
	standardPackage.initialPage();
	var token = $("meta[name='_csrf']").attr("content");
	var header = $("meta[name='_csrf_header']").attr("content");
	headers[header] = token;
	
	var userID = $("#userID").val();
	var packageId = null;
	var packageName = null;
	var industryId = null;
    var reRunVal=null;
    var scheduleId= null;
    var isClientDbTables= null;
    var packageType = null;
    var isContinueProcess = true;
    var successCount = [];
    var runNowOrSchedule = null;
	var runJobType =null;
	var executionKey = '';
	var schedulerType ='';
	var schedulerId ='';
	var dlId = 0;
	var dlName = null;
	
	$('#historicalFromDate').datepicker({
		onSelect : function(date) {	
					var toDate = $('#historicalToDate');				 
		            var minDate = $(this).datepicker('getDate');		           
		            toDate.datepicker('option', 'minDate', minDate); 
		     },
		   
		dateFormat : 'yy-mm-dd',
		defaultDate : new Date(),
		changeMonth : true,
		changeYear : true, 
		yearRange : "0:+20",
		numberOfMonths : 1
	});
	
	$('#historicalToDate').datepicker({
		onSelect : function(date) {
			var toDate = $(this);			
	        var minDate = $('#historicalFromDate').datepicker('getDate');	       
	        toDate.datepicker('option', 'minDate', minDate); 
		},
		dateFormat : 'yy-mm-dd',
		changeMonth : true,
		changeYear : true, 
		yearRange : "0:+20",
		numberOfMonths : 1
	});
	
	var iL_Id = null;
	var dL_Id = null;
	
	$("#fileMappingWithILTable").on('blur', 'input.default-dtype', function() {
		var obj = this;
		 
		if($(this).val() != ''){
			$(this).closest('tr').find('.fileHeader').val('');
		}
		 standardPackage.validateDefaultValue(obj);
	});
	$("#fileMappingWithILTable").on('change', 'select.fileHeader', function() {
		var obj = this;
		var ilColumnName = $($(obj).closest("tr")).find(".iLcolumnName").text().replace("*","").trim().toLowerCase();
		 
		if ($(this).val() == ilColumnName) { 
			$(obj).removeClass("not-mapped").addClass("is-mapped");
		} else { 
			if ( $(obj).hasClass("is-mapped") ) { 
				$(obj).removeClass("is-mapped").addClass("not-mapped"); 
			} 
		}
		
		if($(this).val() != ''){
			$(this).closest('tr').find('input.default-dtype').val('');
		}
	});
	$(document).on('change', '.fileHeader', function(){
		$(this).closest('tr').find('input.default-dtype').val('').trigger('blur');
	});
	
	
	// expand
	$('.il-inner-block').on('shown.bs.collapse', function (e) {							
		// expand this il-block
		$(this).parents(".il-block").prev().find(".inner-tbls").removeClass("fa-caret-down").addClass("fa-caret-up");
		
		// collapse all another opened il-blocks.
		$(this).parents(".il-block").prev().siblings(".dl-block").each(function(){
			if($(this).find(".inner-tbls").attr("class").indexOf("fa-caret-up") !== -1){
				$(this).next(".il-block").find(".il-inner-block").removeClass("in");
				$(this).find(".inner-tbls").removeClass("fa-caret-up").addClass("fa-caret-down");
			}
		});
	});
	
	// collapse
	$('.il-inner-block').on('hidden.bs.collapse', function (e) {
		$(this).parents(".il-block").prev().find(".inner-tbls").removeClass("fa-caret-up").addClass("fa-caret-down");
	}); 
	 
	$(document).on('click', '.dlSelection', function(){
		var container = $(this).parents(".dl-block");
		var ilScheduleType = $(this).attr("data-scheduletype");
		var ilScheduleId = $(this).attr("data-scheduleid");
		var now_caret = $(this).find(".inner-tbls").attr("class").indexOf("fa-caret-down") !== -1 ? true : false;
		if(now_caret){
			var dL_Id = $(this).attr("data-dLId");
			$("#dLId").val($(this).attr("data-dLId"));
		    var userID = $("#userID").val();
			var DL_Id = $(this).attr("data-dLId");
			var packageId = $("#packageId").val();
			var dl_name = $(this).attr("data-dLName");
		    var url_getAllILs = "/app/user/"+userID+"/package/getILSWithStatus/"+DL_Id+"/"+packageId+"";
		    showAjaxLoader(true);
		    var myAjax = common.loadAjaxCall(url_getAllILs,'GET','',headers);
		    myAjax.done(function(result) {
		    	showAjaxLoader(false);
		    	  if(result != null){
		    		  $("#dl_Name").text(dl_name);

				    	if(result != null && result.hasMessages ){
				    		if(result.messages[0].code == "SUCCESS"){
				    			standardPackage.updateILTable(result.object,dL_Id,container,ilScheduleType,ilScheduleId);
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
		    		  
		    	  }
		    });
		}
	});
	
	$(document).on("click",".close-popup",function(){
		$(".dlSelection").prop("checked",false);
	});
		
		var iLId = "";
	    var dLId =  "";
	    var connectionMappingId= "";
		$(document).on('click', 'button.deleteIlSource', function(){
			iLId = $(this).attr("data-iLId");
		    dLId =  $(this).attr("data-dlId");
		    connectionMappingId= $(this).attr("data-mappingId");
			$("#deleStandardSourceFileAlert").modal('show');
		});
		
		// deleteIlSource
		$("#confirmDeleteStandardSource").on('click', function(){
		    var userID = $("#userID").val();
		    var packageId = $("#packageId").val();
		    $("#deleStandardSourceFileAlert").modal('hide');
		    showAjaxLoader(true);
		    var token = $("meta[name='_csrf']").attr("content");
			var header = $("meta[name='_csrf_header']").attr("content");
			headers[header] = token;
		    var url_deleteIlSource = "/app/user/"+userID+"/package/deleteIlSource/"+connectionMappingId+"/"+packageId+"/"+iLId+"/"+dLId+"";
		    var myAjax = common.loadAjaxCall(url_deleteIlSource,'POST','',headers);
		    myAjax.done(function(result) {
		    	
		    	  if(result != null && result.hasMessages){
		    			  if(result.messages[0].code == "ERROR") {
		    				  showAjaxLoader(false);
								 var  messages=[{
									  code : result.messages[0].code,
									  text : result.messages[0].text
								  }];
								 alert(result.messages[0].code);
			    				  return false;
			    			  }else{
			    				  common.displayMessages(result.messages);
			    			  }
		    		  
		    		  $('.alert-success').empty();
		    		  $('.alert-success').css('display','none');  
		    		  $('.modal-body').append('<div class="alert alert-success" role="alert">'+result.messages[0].text+'</div>');
		    		  var url_getILConnectionMappingInfo = "/app/user/"+userID+"/package/getILsConnectionMappingInfo/"+iLId+"/"+dLId+"/"+packageId+"";
		  		      var myAjax = common.loadAjaxCall(url_getILConnectionMappingInfo,'GET','',headers);
		  		      myAjax.done(function(result) {
		  		    	showAjaxLoader(false);
		  		      $("#viewSourceDetailsPoUp .panel-group").empty();
		  		    	  if(result != '' && result.hasMessages) {
		  		    		 if(result.messages[0].code == "SUCCESS"){
		  		    		  standardPackage.updateViewSourceDetailsPoUp(result.object);
		  		    		  $("#DLSectionTable").find('input.dlSelection:checked').trigger('click');
		  		    		 }else{
		  		    			 common.displayMessages(result.messages);
		  		    		 } 
		  		    	  }else{
		  		    		   console.log('empty result');
		  		    		   $("#DLSectionTable").find('input.dlSelection:checked').trigger('click');
		  		    	  }
		  		    });  
		    	  }else{
			    		var messages = [ {
			    			code : globalMessage['anvizent.message.error.code'],
			    			text : globalMessage['anvizent.package.label.unableToProcessYourRequest']
			    		} ];
			    		common.displayMessages(messages);
			    	}
		    }); 
		 
		}); 
		$(document).on('change', '#iLName', function(){
			 
			var ilId =$("#iLName").val();
			var packageId =$("#packageId").val();
			var dlId =$("#dlId").val();			 
			$("#il_incremental_update").attr('checked',false);		     
		    $('.viewILSourceDetails').attr('href', adt.appContextPath+'/adt/package/viewIlSource/'+packageId +'/'+dlId +'/'+ilId);		   
		});
		$(document).on('click', '.updateILDetails,.viewILDetails', function(){
			var _this = $(this);
			var name = _this.attr("id");
			var iLId =null;
			var iLName =null;
			if(name == "viewILDetails"){
				iLId = $("#iLName").val();
				iLName = $("#iLName :selected").text();
				
			}else{
				 iLId = $(this).attr("data-iLId");
				 iLName = $(this).attr("data-iLName");
			}
			
		    var dLId = $("#dLId").val();
		    var packageId = $("#packageId").val();
		    var userID = $("#userID").val();
		    $('.alert-success').empty();
  		    $('.alert-success').css('display','none');  
		    $("#databaseSettings").find('.s-param-vals').remove();
		
		    var url_getILConnectionMappingInfo = "/app/user/"+userID+"/package/getILsConnectionMappingInfo/"+iLId+"/"+dLId+"/"+packageId+"";
		    var myAjax = common.loadAjaxCall(url_getILConnectionMappingInfo,'GET','',headers);
		    myAjax.done(function(result) {
			    
		    	  if(result != '' && result.hasMessages) {
		    		  if(result.messages[0].code == "SUCCESS"){
			    		  console.log("result",result);
			    		  $("#viewSourceDetailsPoUpHeader").text(iLName);
			    		  standardPackage.updateViewSourceDetailsPoUp(result.object);
		    		  
		     
		    		  $("#viewSourceDetailsPoUp").modal('show');
		    		  }else{
		    			  common.displayMessages(result.messages)
		    		  }
		    	  }else {
		    		  var msg = '<div class="alert alert-danger">'+globalMessage['anvizent.package.label.noSourceIsAdded']+'</div>';
		    		  showAlert(msg);
		    	  }
		    });
		
	
		});
		$(document).on('click', '.addSource', function(){
			
				iL_Id = $(this).attr("data-iLId");
				var iLId = $(this).attr("data-iLId");
				var iLName = $(this).attr("data-iLName");
				$("#saveAndUpload").attr('disabled',false);
				$("#saveAndUpload").attr('value','Save & Upload');
			 	$("#iLPopUpHeader").text(iLName);
   		  		$("#iLId").val(iLId);
   		     	databaseConnection.getILDatabaseConnections('fromSpOrCp');
 			    $('#flatFiles,#database').prop('checked', false);
 			     $("#databaseConnectionDetails").hide();
			     $("#saveILConnectionMapping").hide();
			     $("#saveAndUpload").hide();
			     $("#databaseConnectionPanel").hide();
			     $("#flatFilesLocationPanel").hide();
			     $("#flatFilesLocationDetails").hide();
			     $(".IL_queryCommand").hide();
 		        $("#ILConnectionDetails").modal('show');  
			
		});
		$(document).on('click', '#flatFiles', function(){
			common.clearValidations(["#delimeter", "input:radio[name='isFirstRowHasColumnNames']", "#firstrowcolsvalidation", "#fileUpload"]);
			$("#webserviceNames").hide(); 
			 $("#databaseConnectionDetails").hide();
		    $("#databaseConnectionPanel").hide();
		    $(".IL_queryCommand").hide();
		    $("#flatFilesLocationDetails").show();
		    $("#flatFilesLocationPanel").show();
		    $("#saveAndUpload").show();
		    $("#saveILConnectionMapping").hide();
		    $("#mapFileWithIL").show();
		    $("#mapFileWithILCheckBox").prop("checked",false);
		    $("#fileUpload").val("");
		    $("#flatDataSourceName").val("0");
		    $("#flatDataSourceOtherName").val("");
		    $("#webServiceDetails").hide();
		    $("#createNewWebservicePanel").hide();
		    $("#webServiceDefaultMapingConnectionDetails,#requiredApiRequestParameters,#wsHeaderDetailsDiv,#wsdefaultApiDetails").hide();
		    
		});
		$(document).on('click', '#database', function(){
			$("#webserviceNames").hide(); 
			$("#flatFilesLocationDetails").hide();
			
			$("#deleteDatabaseTypeConnection").hide();
		 
			$("#mapFileWithIL").hide();
			$("#saveAndUpload").hide();
		    $("#saveILConnectionMapping").hide();
			$("#databaseConnectionPanel").hide();
		    $("#flatFilesLocationPanel").hide();
		    $("#existingConnections").val("");
		    $("#databaseConnectionDetails").show();
		    standardPackage.populateTimeZones();
		    databaseConnection.getILDatabaseConnections('fromSpOrCp');
		    $("#webServiceDetails").hide();
		    $("#createNewWebservicePanel").hide();
		    $("#webServiceDefaultMapingConnectionDetails,#requiredApiRequestParameters,#wsHeaderDetailsDiv,#wsdefaultApiDetails").hide();
		    common.clearValidations(['#IL_database_connectionName', '#IL_database_serverName', '#IL_database_username', '#IL_database_password','#dateFormat','#timesZone']);
		    
		});
		
		$(document).on('click', '#webService', function(){
			
			$("#createNewWebservicePanel").hide();
		    $("#databaseConnectionDetails").hide();
		    $("#saveILConnectionMapping").hide();
		    $("#flatFilesLocationDetails").hide();
  		    $("#databaseConnectionPanel").hide();
  		    $("#deleteDatabaseTypeConnection").hide();
  		    $("#webserviceNames").show();
  		    $("#flatFilesLocationPanel").hide();
  		  
  		    $("#mapFileWithIL").hide();
			$("#saveAndUpload").hide();
			
			$("#apiName").val('');
			$("#apiUrl").val('');
			$("#authenticationUrl").val('');
			$("#authorisationObjectParams").val('');
			$(".authorisationObjectParams").hide('');
			 
			$("input[name='isAuthenticationRequired']").attr("checked", false);
			$("input[name='cookieRequired']").attr("checked", false);
			$("input[class='methodTypeSelection']").attr("checked", false);
			$("input[name='methodTypeAuthSelection']").attr("checked", false);
			
			$('#responseObjName').val('');
			$('#tokenName').val('');
			
			$("#methodTypeForAuthentication").hide();
			$("#authRequestParams").hide();
			$("#authentication").hide();
			$("#cookie").hide();
			
			$("#headerDetails").val('');
			$(".paramKey").val('');
			$(".paramValue").val('');
			$(".requsetBodyParamKey").val('');
			$(".requsetBodyParamKeyParamValue").val('');
			
			$("#webServiceDefaultMapingConnectionDetails").hide();
				 
				standardPackage.getWebServiceConnections();
				
		});
		
		
		$(document).on('click', '#createNewConnection_dataBaseType', function(){
			databaseConnection.resetConnection();
			 $("#deleteDatabaseTypeConnection").hide();
			 $("#historicalIncremental").hide();
			 $("#historicalLoadDiv").hide();
			 $("#defualtVariableDbSchema").hide();
			 $("#replaceShemas").hide();
			 $(".buildQuery").hide();
			 $("#saveAndUpload").hide();
			 $("#saveILConnectionMapping").hide();
			 $("#testConnection").show();
			 $(".IL_queryCommand").hide();
			 $(".queryValidatemessageDiv").empty();
			 $("#checkQuerySyntax").hide();
			 $("#saveNewConnection_dataBaseType").show();
			 $("#IL_database_password_div").show();
		     $("#databaseConnectionPanel").show();
		     $("#checkTablePreview").hide();
		     $("#il_incremental_update_div").hide();
		     $("#replace").hide();
		     $("#replaceAll").hide();
		     $("#createNewWebservicePanel").hide();
		     $(".dataSourceOther").hide();
		     $('html, body').animate({scrollTop: $('#databaseConnectionPanel').offset().top}, 120);
		     var connectionId=$("#IL_database_databaseType option:selected").attr("data-connectorId");
		     var urlformat = $("#IL_database_databaseType option:selected").data("urlformat");
		 	 $('.serverIpWithPort').empty().text("Format : "+urlformat);
		 	 standardPackage.populateTimeZones();

		});
		
		// delete Database Type Connection
		$(document).on('click', '#deleteDatabaseTypeConnection', function(){
			$("#deleteIlConnection").modal('show');
		});
		$(document).on('click', '#confirmDeleteIlConnection', function(){
			var userID = $("#userID").val();
			var connectionId=$('#existingConnections').val();
			var connectionName=$("#existingConnections option:selected").text();
			common.clearValidations(['#existingConnections']);
			var url_deleteILConnection = "/app/user/"+userID+"/package/deleteILConnection/"+connectionId;
			 var myAjax = common.postAjaxCall(url_deleteILConnection,'POST','',headers);
	 	      myAjax.done(function(result) {
	 	    	  if(result != null && result.hasMessages){ 
		    			  if(result.messages[0].code == "ERROR") {
		    				  $('.message').show();
		    				  $('.messageText').empty();
			    			  $(".messageText").append(result.messages[0].text);
			    			  setTimeout(function() { $(".message").hide().empty(); }, 10000);
			    			  return false; 
			    			  } else if(result.messages[0].code == "SUCCESS") {
			    				  standardPackage.showSuccessMessage(connectionName+" "+result.messages[0].text, true, 5000);
			    				  databaseConnection.getILDatabaseConnections('fromSpOrCp');
				    			  $('#databaseConnectionPanel').hide();
				    			  $('#deleteDatabaseTypeConnection').hide();
				    			  $("#deleteIlConnection").modal('hide');
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
		$(document).on('change', '#IL_database_databaseType', function(){
			var connectionId=$(this).find('option:selected').attr("data-connectorId");
		    var urlformat = $(this).find('option:selected').data("urlformat");
	        $('.serverIpWithPort').empty().text("Format : "+urlformat);
		});
		
		$(document).on('click', '#saveNewConnection_dataBaseType,#testConnection', function(){
			 
		   var elementId = this.id;
		   var IL_database_connectionName = $("#IL_database_connectionName").val().trim();
		   var IL_database_databaseType = $("#IL_database_databaseType").val();
		   var IL_database_databaseName = $("#IL_database_databaseType option:selected").text();
		   var IL_database_connectionType = $("#IL_database_connectionType").val();
		   var IL_database_serverName = $("#IL_database_serverName").val();
		   var IL_database_username = $("#IL_database_username").val();
		   var IL_database_password = $("#IL_database_password").val();
		   var userID = $("#userID").val();
		   var connector_Id = $("#IL_database_databaseType option:selected").attr("data-connectorId");
		   var protocal = $("#IL_database_databaseType option:selected").data("protocal");
		   var dateFormat = $("#dateFormat").val();
	       var timeZone = $("#timesZone").val();
	       var dataSourceName=  $("#dataSourceName").val();
	       var dataSourceOther = $("#dataSourceOtherName").val();
	       common.clearValidations(["#dateFormat","timesZone","#dataSourceName"]);
	       
		   var selectors = [];
		   
		   selectors.push('#IL_database_connectionName');
		   selectors.push('#IL_database_serverName');
		   selectors.push('#dataSourceName');
		   
		   if ( $("#dataSourceName").val() == "-1") {
			   selectors.push('#dataSourceOtherName');
		   }
		   
		   if(protocal.indexOf('ucanaccess') == -1){
		       if(protocal.indexOf('postgresql') == -1){
		    	   selectors.push('#IL_database_username');
				   selectors.push('#IL_database_password');
			   }else{
				   selectors.push('#IL_database_username');
			   }
		       }	   
		   
		   var valid = common.validate(selectors);
		/*
		 * if(connector_Id != 6 && connector_Id != 7 && connector_Id != 3 &&
		 * connector_Id != 2){ if(valid && IL_database_serverName.indexOf(":") ==
		 * -1) { var message =
		 * globalMessage['anvizent.package.label.pleaseMentionPortNumberAfterServerIPAddressSeperatedby']+'
		 * '+'<b>:</b> Eg: 127.0.0.1:3306'
		 * common.showcustommsg("#IL_database_serverName", message); return
		 * false; } }
		 */
		   if (!valid) {
			   return false;
		   }
		   if(elementId == "saveNewConnection_dataBaseType" || elementId == "updateConnection"){
	           	var validate =  standardPackage.validateDateForamtAndTimeZone();
	           	  if (!validate) {
	      	           return false;
	      	        }
		       }
		   var selectData={
				   clientId : userID,
				   database :{
					   id: IL_database_databaseType,
					   name : IL_database_databaseName,
					   
				   },
				   connectionType : IL_database_connectionType,
				   server : IL_database_serverName,
				   username : IL_database_username,
				   password : IL_database_password,
				   connectionName : IL_database_connectionName,
				   dateFormat:dateFormat,
	           	   timeZone:timeZone,
	           	   dataSourceName:dataSourceName,
	           	   dataSourceNameOther:dataSourceOther
		   };

		    var token = $("meta[name='_csrf']").attr("content");
   		    var header = $("meta[name='_csrf_header']").attr("content");
   			headers[header] = token;
   			
   		   databaseConnection.testAndSaveDbConnection(elementId,headers,selectData);
		  
		});
		
		$(document).on('change', '#existingConnections,#iLName', function(){
			
			$(".max_date_query").hide();
			$(".dataSourceOther").hide();
			$("#defualtVariableDbSchema").hide();
			$("#replaceShemas").hide();
			$("#replace_variable").val("");
		    $("#replace_with").val("");
			if( $("#existingConnections").val() != '' ){
				$("#deleteDatabaseTypeConnection").show();
				}else{
					$("#deleteDatabaseTypeConnection").hide();
				}
			$(".serverIpWithPort").empty();
			$("#checkTablePreview").hide();
			$(".queryValidatemessageDiv").empty();
		    var ilId=$('#iLName').val();
			common.clearValidations(['#IL_database_connectionName', '#IL_database_serverName', '#IL_database_username', '#IL_database_password','#queryScript','#replace_variable','#replace_with','#maxDatequery','#dataSourceName','#dataSourceOtherName']);
			if($(this).val() != ''){
				var connectionId = null;
				var name = $(this).attr("name");
				if(name == "iLName"){
					if($("#existingConnections").is(":visible")){
						connectionId = $("#existingConnections").val();
					}
					
				}else{
					connectionId = $("#existingConnections").val();
				}
				
				standardPackage.populateTimeZones();
				
				
				var userID = $("#userID").val();
				var url_getILConnectionById = "/app/user/"+userID+"/package/getILsConnectionById/"+connectionId+"";
				if(connectionId != null && connectionId != ''){
					showAjaxLoader(true);
				   var myAjax = common.loadAjaxCall(url_getILConnectionById,'GET','',headers);
				   myAjax.done(function(result) {
					   showAjaxLoader(false);
				    	  if(result != null && result.hasMessages) {
				    		  if(result.messages[0].code == "SUCCESS"){
				    			  standardPackage.updateConnectionPanel(result.object);
				    		  	$("#queryScript").val("").closest('.s-script').show();
				    		  	$("#procedureName").val("").closest('.s-script').hide();
				    		  	$("#typeOfCommand").val("Query");
				    		  	$("#saveNewConnection_dataBaseType").hide();
								$("#IL_database_password_div").hide();
								$("#databaseConnectionPanel").show();
								$("#checkQuerySyntax").show();
								$(".IL_queryCommand").show();
								 $("#saveAndUpload").hide();
								 $("#testConnection").hide();
								 $("#il_incremental_update").attr('checked',false);
								 $("#historicalLoad").attr('checked',false);
								 $("#historicalFromDate,#historicalToDate").val("");
					    		 $("#loadInterval").val("0");			
					    		 $("#historicalIncremental").show();
					    		 $("#il_incremental_update_div").show();
								 $("#historicalLoadDiv").hide();
								 $(".buildQuery").show();
								 $("#replace").show();
								 $("#replaceAll").show();
								 $('html, body').animate({scrollTop: $('#databaseConnectionPanel').offset().top}, 120);
								 var databaseId = result.object["database"].id; 
								standardPackage.showDefaultIlQuery(connectionId,ilId); 
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
				
				
				
					
		}else{
			$("#databaseConnectionPanel").hide();
			$("#saveButtons").hide();
		}
		
		
		
		});
		$(document).on('click', '#saveAndUpload', function(){
			$('.alert-success').empty();
			$('.alert-success').css('display','none'); 
			var isFlatFile = true;
			var flatFileType = $("#flatFileType").val();
		    var filePath = $("#fileUpload").val();
		    var delimeter = $("#delimeter").val();
			var isFirstRowHasColumnNames =$("input:radio[name='isFirstRowHasColumnNames']:checked","#fileUploadForm").val();
			var iLId = $("#iLName").val();
		    var dLId = $("#dLId").val();
		    var packageId = $("#packageId").val();
		    var userID = $("#userID").val();
		    var industryId = $("#industryId").val();	
		    var dataSourceName = $("#flatDataSourceName").val();
		    var dataSourceOther = $("#flatDataSourceOtherName").val();
		    var sourceFileInfoId='';
		    
		    // validations
		    common.clearValidations(["#delimeter", "input:radio[name='isFirstRowHasColumnNames']", "#firstrowcolsvalidation","#flatDataSourceName","#fileUpload"]);
		   		    
		    if(delimeter == '' || delimeter.match(/^\s+$/)){		    	 
		    	common.showcustommsg("#delimeter",globalMessage['anvizent.package.label.thisFieldIsRequired']);
				return false;
			}else if(delimeter.length > '1'){	
				console.log("delimeter.length - "+delimeter.length)
				common.showcustommsg("#delimeter",globalMessage['anvizent.package.label.delimeterShouldBeOneCharacter']);
				return false;
			}
		    if(dataSourceName == "0"){
		    	common.showcustommsg("#flatDataSourceName",globalMessage['anvizent.package.label.enterDataSourceName']);
		    	return false;
		    }
		    
		    if(dataSourceName == "-1"){
		    	   if(dataSourceOther.trim().length == 0){
		    		   common.showcustommsg("#flatDataSourceOtherName", globalMessage['anvizent.package.label.enterDataSource'],"#flatDataSourceOtherName");
		    		   return false;
		    	   }
		       }
		    
		    if(filePath == '') {
		    	common.showcustommsg("#fileUpload", globalMessage['anvizent.package.label.pleaseChooseaFile']);
				return false;
			}
		    var fileExtension = filePath.replace(/^.*\./, '');
		    if(fileExtension != flatFileType) {
		    	common.showcustommsg("#fileUpload", globalMessage['anvizent.package.label.fileExtensionIsNotMatchingWithFileTypeSelected']);
		        return false;
		    }
		    
		    showAjaxLoader(true);
			// submit the file upload form
			$("#packageIdForFileUpload").val(packageId);
			$("#userIdForFileUpload").val(userID);
			$("#iLIdForFileUpload").val(iLId);
			$("#industryIdForFileUpload").val(industryId);
			
			// to avoid FormData object issue
			setTimeout(function(){
				
				var formData = new FormData($("#fileUploadForm")[0]);
				var token = $("meta[name='_csrf']").attr("content");
				var header = $("meta[name='_csrf_header']").attr("content");
				headers[header] = token;				 
		        var url_uploadFileIntoS3 = "/app/user/"+userID+"/package/uploadsFileIntoS3";
				var myAjax = common.postAjaxCallForFileUpload(url_uploadFileIntoS3,'POST', formData,headers);
				myAjax.done(function(result) {
			    	  if(result != null){
			    		  if(result.hasMessages){
			    			  if(result.messages[0].code == "ERROR") {
			    				  showAjaxLoader(false);
									 var  messages=[{
										  code : result.messages[0].code,
										  text : result.messages[0].text
									  }];
			    				  common.showcustommsg("#fileUpload", result.messages[0].text,'',true);
				    				  return false;
				    			  }
			    		  		}
			    			  if(result.object != null){
			    				  // filePath = result.object;
			    				  sourceFileInfoId = result.object;
			    				// save the mapping
			    					var selectData={
			    							   isMapped : true,
			    							   isFlatFile : isFlatFile,
			    							   fileType :flatFileType,
			    							   sourceFileInfoId : sourceFileInfoId,
			    							   delimeter : delimeter,
			    							   isFirstRowHasColoumnNames : isFirstRowHasColumnNames,
			    							   iLId : iLId,
			    							   dLId : dLId,
			    							   packageId : packageId,
			    							   isWebservice:false,
			    							   ilSourceName:dataSourceName,
			    							   dataSourceNameOther:dataSourceOther
			    							   
			    					   };
			    					standardPackage.saveILConnectionMapping(selectData);
			    			  }
			    	  }
			    });
			}, 150);
			
		});
		$(document).on('click', '#saveILConnectionMapping', function(){
			$('.alert-success').empty();
    		$('.alert-success').css('display','none'); 
			var isFlatFile =null;
			var connectionId =null;
		    var typeOfCommand =null;
		    var queryScript =null;
		    var iLId =null;
		    var dLId =null;
		    var packageId =null;
		    var userID =null;	
		    var isHavingParentTable = null;
		    var isIncrementalUpdate = false;
		    var isWebservice = null;
		    var isHistoricalLoad=false;
		    var historicalFromDate=null;
		    var historicalToDate=null;
			var loadInterval=null;
			var dataSourceName=  $("#dataSourceName").val();
			var dataSourceOther = $("#dataSourceOtherName").val();
			common.clearValidations(["#dataSourceName","#dataSourceOtherName"]);
			if($('#database').is(':checked')) {
				 isFlatFile = false;
				 isHavingParentTable = false;
				 isWebservice = false;
				 connectionId = $("#existingConnections").val();
				 typeOfCommand = $("#typeOfCommand").val();
				 queryScript = typeOfCommand== "Query" ? $("#queryScript").val() : $("#procedureName").val();
				 
				 if(queryScript =='') {
					   standardPackage.showMessage(globalMessage['anvizent.package.label.pleaseFillRequiredFields']);
					   return false;
				   }
				 if(dataSourceName == "0"){
					 common.showcustommsg("#dataSourceName",globalMessage['anvizent.package.label.enterDataSourceName']);
					 return false;
				 }
				 if(dataSourceName == "-1"){
			    	   if(dataSourceOther.trim().length == 0){
			    		   common.showcustommsg("#dataSourceOtherName", globalMessage['anvizent.package.label.enterDataSource'],"#dataSourceOtherName");
			    		   return false;
			    	   }
			       }
			}
			 if($("#historicalLoad").is(':checked')){
				 
		    	  historicalFromDate = $("#historicalFromDate").val();
		    	  historicalToDate =$("#historicalToDate").val();
		          var interval = $("#loadInterval option:selected").val();
		          common.clearValidations(['#historicalFromDate', '#historicalToDate', '#loadInterval']);
		    	  var validStatus = true;
				  if(historicalFromDate == ''){
					    common.showcustommsg("#historicalFromDate",globalMessage['anvizent.package.message.pleasechoosefromdate'],"#historicalFromDate");
				    	validStatus =false;
				  }
				  if(historicalToDate == '' ){
					    common.showcustommsg("#historicalToDate",globalMessage['anvizent.package.message.pleasechoosetodate'],"#historicalToDate");
				    	validStatus =false;
				  }
				  if(interval == '' || interval == 0){
					    common.showcustommsg("#loadInterval",globalMessage['anvizent.package.message.pleasechooseloadinterval'],"#loadInterval");
				    	validStatus =false;
				  }
				  if(!validStatus){
					 	return validStatus;
				   }
				  var fromDate ="{fromDate}";
				  var toDate="{toDate}";
				  if (queryScript.indexOf(fromDate) == -1 || queryScript.indexOf(toDate) == -1) {
			    		common.showErrorAlert(globalMessage['anvizent.package.message.variblesnotfound'] );
			    		return false;
			    	}
		    	isHistoricalLoad = true;
		    	
		        if(interval != 0){
		        	loadInterval = interval;
		        }
		    } 
		    if($("#il_incremental_update").is(':checked')){
		    	  var incrementalDateVariable = "{date}";
				  if (queryScript.indexOf(incrementalDateVariable) == -1) {
			    		common.showErrorAlert(globalMessage['anvizent.package.message.datevariablenotfound']);
			    		return false;
			    	}
		    	isIncrementalUpdate = true;
		    }else{
		    	isIncrementalUpdate = false;
		    }
		    
		    iLId = $("#iLName").val();
		    dLId = $("#dLId").val();
		    packageId = $("#packageId").val();
		    userID = $("#userID").val();
		    var maxDateQuery = $('#maxDatequery').val(); 
			  
			   var selectData={
					   isMapped : true,
					   isFlatFile : isFlatFile,
					   iLConnection:{
						   connectionId : connectionId, 
					   },
					   typeOfCommand : typeOfCommand,
					   iLquery : queryScript,
					   maxDateQuery : maxDateQuery,
					   iLId : iLId,
					   dLId : dLId,
					   packageId : packageId, 
					   isHavingParentTable :isHavingParentTable,
					   isIncrementalUpdate : isIncrementalUpdate,
					   isWebservice:isWebservice,
					   isHistoricalLoad : isHistoricalLoad,
					   historicalFromDate : historicalFromDate,
					   historicalToDate : historicalToDate,
					   loadInterval : interval,
					   historicalLastUpdatedTime : historicalFromDate,
					   ilSourceName:dataSourceName,
					   dataSourceNameOther:dataSourceOther
			   };
			   
			   if (typeOfCommand === "Stored Procedure") {
					var params = $("div.s-param-vals", "#databaseSettings");
					
					if (params && params.length) {
						var procedureParameters = [];
						params.each(function() {
							var param = $(this);
							
							var paramname = param.find('input.s-param-name').val(),
							paramvalue = param.find('input.s-param-value').val();
							
							if (paramname.replace(/\s+/g, '') && paramvalue.replace(/\s+/g, ''))
								procedureParameters.push(paramname+'='+paramvalue);
						});
						
						if (procedureParameters.length)
							selectData.procedureParameters = procedureParameters.join('^');
						
					}
				}
			   standardPackage.saveILConnectionMapping(selectData);
			});
		
		$(document).on('click', '.viewDLSchema,.viewILSchema,.viewILTableStructure', function(){
			 
			var tableName='';
			var ILpopUpFlag = false;
			$("#ILpopUpMesssage").empty().hide();
			if($(this).attr("id") == 'viewILTableStructure'){
				tableName = $("#iLName :selected").attr("data-tableName");
			}else{
				if($(this).attr("data-dL_name") != null){
					tableName = $(this).attr("data-dL_name");
				}
				if($(this).attr("data-iLName") != null){
					tableName = $(this).attr("data-iLName");
					ILpopUpFlag = true;
				}
			}
			
			$("#viewSchemaHeader").text(tableName);
			var industryId = $("#industryId").val();
			var userID = $("#userID").val();
			var token = $("meta[name='_csrf']").attr("content");
			var header = $("meta[name='_csrf_header']").attr("content");
			headers[header] = token;
			if(tableName != ''){
				showAjaxLoader(true);
				var url_getTableStructure = "/app/user/"+userID+"/package/getTablesStructure/"+industryId+"/"+tableName+"";
				   var myAjax = common.loadAjaxCall(url_getTableStructure,'GET','',headers);
				    myAjax.done(function(result) {
				    	showAjaxLoader(false);
				    	
				    	if(result != null && result.hasMessages ){
				    		
				    		if(result.messages[0].code == "SUCCESS"){
					    	  standardPackage.updateTableInfo(result.object);
					    	} else {
					    		if(ILpopUpFlag){
					    			$("#ILpopUpMesssage").append(result.messages[0].text);
					    			$("#ILpopUpMesssage").show();
					    		}else{ 
						    		common.displayMessages(result.messages);
					    		}
					    	}
				    	} else {
				    		var messages = [ {
				    			code : globalMessage['anvizent.message.error.code'],
								text : globalMessage['anvizent.package.label.unableToProcessYourRequest']
							} ];
				    		common.displayMessages(messages);
				    	}
				    });
			}
			
		});
		
		$("#queryScript").on('keyup',function(){
			$("#saveILConnectionMapping").hide();
			$("#checkTablePreview").hide();
			$(".queryValidatemessageDiv").empty();
		});
		$("#procedureName").on('keyup',function(){
			$("#saveILConnectionMapping").hide();
			$("#checkTablePreview").hide();
			$(".queryValidatemessageDiv").empty();
		});
		$("#checkQuerySyntax").click(function(){
			common.clearValidations(["#maxDatequery"]);
			$(".queryValidatemessageDiv").empty();
			$("#saveILConnectionMapping").hide();
			 $("#checkTablePreview").hide();
			var userID = $("#userID").val(); 
			var connectionId = $("#existingConnections").val();
			var typeOfCommand = $("#typeOfCommand").val(); 
			var query = typeOfCommand === "Query" ? $("#queryScript").val() : $("#procedureName").val();
			var isIncrementalUpdate = $("#il_incremental_update").is(":checked"); 
			var iL_id = $("#iLName").val();
			var maxDateQuery = $('#maxDatequery').val();
			common.clearValidations(["#queryScript", "#procedureName,#replace_variable"]);
			
			if( query != '') {
				
				if ( isIncrementalUpdate ) {
					var dateIndex = query.indexOf("{date}");
					if ( dateIndex == -1) {
						common.showErrorAlert("{date} placeholder not found in query");
   						return false;
					}
					var date_index = maxDateQuery.indexOf("{date}");
					if(maxDateQuery.trim().length == 0){
						common.showcustommsg($("#maxDatequery"),globalMessage['anvizent.package.label.shouldNotBeEmpty'] ,$("#maxDatequery"));
						return false;
					}
					else if ( date_index == -1) {
						common.showErrorAlert("{date} placeholder not found in query");
 						return false;
					}
				}
				var token = $("meta[name='_csrf']").attr("content");
				var header = $("meta[name='_csrf_header']").attr("content");
				headers[header] = token;
				var connector_id =  $("#IL_database_databaseType option:selected").attr('data-connectorid');
				var url_getDbSchemaVaribles ="/app/user/"+userID+"/package/getDbSchemaVaribles/"+connector_id+"";
				showAjaxLoader(true);
				 var myAjax = common.loadAjaxCall(url_getDbSchemaVaribles,'GET','',headers);
				    myAjax.done(function(result) {
				    	showAjaxLoader(false);
				    	  if(result != null && result.hasMessages){ 
				    			  if(result.messages[0].code == "ERROR") { 
				    				  common.showErrorAlert(result.messages[0].text);
				    				  return false;
				    			  }  
				    		   else if(result.messages[0].code == "SUCCESS"){
				    			   var unReplacedschemaAndDatabses = '';
				    			   if(result.object != null){ 
				    				   
				    				   var schemaAndDatabses = [];
				    				   $.each( result.object, function( key, value ) {
				    					   schemaAndDatabses.push(value);
				    					   schemaAndDatabses.push(key);
					    				 });
				    				   
				    				  
				    				   for (i = 0; i < schemaAndDatabses.length; i++) {
				    						if (query.indexOf(schemaAndDatabses[i]) >= 0){
				    							unReplacedschemaAndDatabses += 	schemaAndDatabses[i] +',';
				    					    }  
				    					      
				    					}
				    			   }
				   				    if(unReplacedschemaAndDatabses != ''){
				   						 var replacedWord = unReplacedschemaAndDatabses;
				   						 replacedWord = replacedWord.substring(0, replacedWord.length - 1);
				   						 common.showErrorAlert(globalMessage['anvizent.package.label.pleaseReplace']+" [ "+replacedWord+" ] "+globalMessage['anvizent.package.label.DatabasesOrSchemasInDefaultQuery']);
				   						return false;
				   					}else{
				   						

				   						var selectData ={
				   								iLId : iL_id,
				   								iLConnection : {
				   									connectionId : connectionId
				   								},
				   								iLquery : query,
				   								maxDateQuery : maxDateQuery,
				   								typeOfCommand : typeOfCommand,
				   								isIncrementalUpdate : isIncrementalUpdate
				   						}
				   						
				   						if (typeOfCommand === "Stored Procedure") {
				   							var params = $("div.s-param-vals", "#databaseSettings");
				   							 
				   							
				   							if (params && params.length) {
				   								var procedureParameters = [];
				   								params.each(function() {
				   									var param = $(this);
				   									
				   									var paramname = param.find('input.s-param-name').val(),
				   									paramvalue = param.find('input.s-param-value').val();
				   									
				   									if (paramname.replace(/\s+/g, '') && paramvalue.replace(/\s+/g, ''))
				   										procedureParameters.push(paramname+'='+paramvalue);
				   								});
				   								
				   								if (procedureParameters.length)
				   									selectData.procedureParameters = procedureParameters.join('^');
				   							}
				   						}
				   						
				   						showAjaxLoader(true);
				   						var url_checkQuerySyntax = "/app/user/"+userID+"/package/checksQuerySyntax";
				   						 var myAjax = common.postAjaxCall(url_checkQuerySyntax,'POST', selectData,headers);
				   						    myAjax.done(function(result) {
				   						     showAjaxLoader(false);
				   						    	  if(result != null && result.hasMessages){
				   						    		  var code = result.messages[0].code;
				   						    		  var text = result.messages[0].text;
				   						    		 var message = '';
				   						    		 if(result.messages[0].code == "SUCCESS") {
					   						    		  
					   						    		message += '<div class="alert alert-success alert-dismissible" role="alert">'+
					   						    					text +' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>'+
							    		  							'</div>';
									    			  	$(".queryValidatemessageDiv").append(message);
									    			  	//setTimeout(function() { $(".alert-success").hide() .empty(); }, 10000);
									    			  	$("#saveILConnectionMapping").show();
									    			  	$("#checkTablePreview").show();
					   						    		 
				   						    		 }else{
				   						    			message += '<div class="alert alert-danger alert-dismissible" role="alert">'+
			   				  							''+result.messages[0].text+''+
			   				  							'</div>';
			   						    			  	$(".queryValidatemessageDiv").append(message);
			   						    			  	setTimeout(function() { $(".alert-danger").hide() .empty(); }, 10000);
			   						    			  	if(result.object == "normal"){
			   						    			  		common.showcustommsg("#queryScript", " ", "#queryScript");
			   						    			  	}else{
			   						    			  		common.showcustommsg("#maxDatequery", " ", "#maxDatequery");
			   						    			  	}
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
				   				 
				    			  
				    		   }
				    	  }else{
					    		var messages = [ {
					    			code : globalMessage['anvizent.message.error.code'],
					    			text : globalMessage['anvizent.package.label.unableToProcessYourRequest']
					    		} ];
					    		common.displayMessages(messages);
					    	}
				    }); 
			 
			} else {
				common.showcustommsg((typeOfCommand === "Query" ? "#queryScript" : "#procedureName"), typeOfCommand+" "+globalMessage['anvizent.package.label.shouldNotBeEmpty']);
			}
		});
 
		// validate query table Preview
		$(document).on('click', '#checkTablePreview', function() {
			
			$(".queryValidatemessageDiv").empty();
			$("#saveILConnectionMapping").show();
			var userID = $("#userID").val(); 
			var connectionId = $("#existingConnections").val();
			var typeOfCommand = $("#typeOfCommand").val(); 
			var isIncrementalUpdate = $("#il_incremental_update").is(":checked");
			var ilId = $("#iLName option:selected").val();
			var packageId = $("#packageId").val();
			var query = typeOfCommand === "Query" ? $("#queryScript").val() : $("#procedureName").val();
			common.clearValidations(["#queryScript", "#procedureName"]);
			if( query != '') {
				var selectData ={
						packageId : packageId,
						iLId : ilId,
						iLConnection : {
							connectionId : connectionId
						},
						iLquery : query,
						typeOfCommand : typeOfCommand,
						isIncrementalUpdate :isIncrementalUpdate
				}
			 
				if (typeOfCommand === "Stored Procedure") {
					var params = $("div.s-param-vals", "#databaseSettings");
					if (params && params.length) {
						var procedureParameters = [];
						params.each(function() {
							var param = $(this);
							var paramname = param.find('input.s-param-name').val(),
							paramvalue = param.find('input.s-param-value').val();
							if (paramname.replace(/\s+/g, '') && paramvalue.replace(/\s+/g, ''))
								procedureParameters.push(paramname+'='+paramvalue);
						});
						if (procedureParameters.length)
							selectData.procedureParameters = procedureParameters.join('^');
					}
				}
				showAjaxLoader(true);
				var url_checkQuerySyntax = "/app/user/"+userID+"/package/getTablePreview";
				 var myAjax = common.postAjaxCall(url_checkQuerySyntax,'POST', selectData,headers);
				    myAjax.done(function(result) {
				    	showAjaxLoader(false);
				    	  if(result != null){
				    		  if(result.hasMessages){
				    			  if(result.messages[0].code == "ERROR") {
										
					    			  var message = '<div class="alert alert-danger alert-dismissible" role="alert">'+
			  							''+result.messages[0].text+''+
			  							'</div>';
					    			  	$(".queryValidatemessageDiv").append(message)
					    				  return false;
					    			  }  
				    		  }
				    		  
				    		  
				    		  $("#tablePreviewPopUp").modal('show');
				    	  var list = result.object;
				    	  if(list != null && list.length > 0){
				    		  var tablePreview='';
				    		  var colCount = 0;
					    	  $.each(list, function (index, row) {
					    		  
					    		  tablePreview+='<tr>';
					    		  $.each(row, function (index1, column) {
					    			  tablePreview += (index == 0 ? '<th>'+column+'</th>' : '<td>'+column+'</td>');
					    			  colCount = colCount + 1;
					    		  });
					    		 tablePreview+='</tr>'; 
					    		});
					    	  $(".tablePreview").empty();
					    	  if(list.length<2){
					    		  tablePreview+='<tr>';
					    		  tablePreview+='<td colspan = "'+colCount+'" >';
					    		  tablePreview+=globalMessage['anvizent.package.label.noRecordsAvailable'];
					    		  tablePreview+='</td>'; 
					    		  tablePreview+='</tr>'; 
					    	  }
					    	  $(".tablePreview").append(tablePreview);
					    	  }
					    	  else{
					    		  $(".tablePreview").empty();
					    		  $(".tablePreview").append(globalMessage['anvizent.package.label.noRecordsAvailableInTable']);
					    	  } 
				    	  }
				    	  
				    });
				
			} else {
				common.showcustommsg((typeOfCommand === "Query" ? "#queryScript" : "#procedureName"), typeOfCommand+" "+globalMessage['anvizent.package.label.shouldNotBeEmpty']);
			}
		});
  
	$(document).on('change', '#typeOfCommand', function() {
		$(".queryValidatemessageDiv").empty();
		common.clearValidations(["#queryScript", "#procedureName"]);
		if (this.value === "Stored Procedure") {
			$("#procedureName").closest('.s-script').show();
			$("#queryScript").closest('.s-script').hide();
			$("#maxDatequery").closest('.s-script').hide();
			$('#checkTablePreview').hide();
			$('#saveILConnectionMapping').hide();
		}
		else {
			$("#procedureName").closest('.s-script').hide();
			$("#queryScript").closest('.s-script').show();
			$('#checkTablePreview').hide();
			$('#saveILConnectionMapping').hide();
		}
	});
	
	$("#databaseSettings").on('click', '#addparameters', function() {
		var settings = $("#databaseSettings"), 
		hiddenrow =  $("div.param-hidden", settings);
		$("#saveILConnectionMapping").hide();
		var newrow = $("<div/>", {"class" : "row form-group s-param-vals"});
		
		newrow.html(hiddenrow.html());
		
		newrow.insertBefore($("#checkQuerySyntax").closest('.row'));
	});
	
	$("#databaseSettings").on('keyup', "input.s-param-value, input.s-param-name", function(){
		$("#saveILConnectionMapping").hide();
	});
	
	$("#mapFileWithILCheckBox").click(function(){
		
		var _this = $(this);
		if(_this.is(":checked")){
			$("#mapFileWithIL").show();
			$("#saveAndUpload").hide();
		}else{
			$("#mapFileWithIL").hide();
			$("#saveAndUpload").show();
		}
	});
	
$("#mapFileWithIL").click(function(e){
	var isFlatFile = true;
	var flatFileType = $("#flatFileType").val();
    var filePath = $("#fileUpload").val();
    var delimeter = $("#delimeter").val();
	var isFirstRowHasColumnNames =$("input:radio[name='isFirstRowHasColumnNames']:checked","#fileUploadForm").val();
	var iLId = $("#iLName").val();
    var dLId = $("#dLId").val();
    var packageId = $("#packageId").val();
    var userID = $("#userID").val();
    var dataSourceName = $("#flatDataSourceName").val();
    var dataSourceOther = $("#flatDataSourceOtherName").val();
    common.clearValidations(["#delimeter", "input:radio[name='isFirstRowHasColumnNames']", "#firstrowcolsvalidation","#flatDataSourceName","#fileUpload"]);
    
    // validations
  
    if(delimeter == '') {
    	common.showcustommsg("#delimeter");
		return false;
	}
    if(isFirstRowHasColumnNames === 'false') {
    	common.showcustommsg("#firstrowcolsvalidation", globalMessage['anvizent.package.label.fileMustHaveColumnNamesInFirstRow']);
		return false;
    }
    else {
    	isFirstRowHasColumnNames = true;
    }
    if(dataSourceName == "0"){
    	common.showcustommsg("#flatDataSourceName",globalMessage['anvizent.package.label.enterDataSourceName']);
    	return false;
    }
    if(dataSourceName == "-1"){
 	   if(dataSourceOther.trim().length == 0){
 		   common.showcustommsg("#flatDataSourceOtherName", globalMessage['anvizent.package.label.enterDataSource'],"#flatDataSourceOtherName");
 		   return false;
 	   }
    }
    
    if(filePath == '') {
    	common.showcustommsg("#fileUpload", globalMessage['anvizent.package.label.pleaseChooseaFile']);
		return false;
	}
    var fileExtension = filePath.replace(/^.*\./, '');
    if(fileExtension != flatFileType) {
    	common.showcustommsg("#fileUpload", globalMessage['anvizent.package.label.fileExtensionIsNotMatchingWithFileTypeSelected']);
        return false;
    }
    
    $(this).attr('value',globalMessage['anvizent.package.label.loading']);
    $(this).attr('disabled','disabled');
	// submit the file upload form
	$("#packageIdForFileUpload").val(packageId);
	$("#userIdForFileUpload").val(userID);
	$("#dLIdFileUpload").val($("#dLId").val());
	$("#iLIdForFileUpload").val(iLId);
	$("#industryIdForFileUpload").val($("#industryId").val());
	
	// to avoid FormData object issue
	setTimeout(function(){
		var formData = new FormData($("#fileUploadForm")[0]);
        var url_mapFileWithIL = "/app/user/"+userID+"/package/mapFileWithIL";
        showAjaxLoader(true);
		var myAjax = common.postAjaxCallForFileUpload(url_mapFileWithIL,'POST', formData,headers);
		myAjax.done(function(result) {
			showAjaxLoader(false);
			$("#mapFileWithIL").val(globalMessage['anvizent.package.label.mapFileHeadersUpload']).prop('disabled',false);
			var isDataFetched = false;
			var errorMessage = 'Unable to process your request';
			if(result != null){
    		  if(result.hasMessages){
    			  if(result.messages[0].code == "SUCCESS") {
    				  isDataFetched = true;
    			  } else {
    				  errorMessage = result.messages[0].text
    			  }
    			}
			}
			 if (isDataFetched) {
				  $("#fileMappingWithILTable").find('th.iLName').text($("#iLName :selected").text());
					  $("#fileMappingWithILTable").find('th.originalFileName').text(result.object["originalFileName"]);
					  fileMappingWithILTable.updateFileMappingWithILTable(result,"standard");
			  } else {
				  common.showcustommsg("#fileUpload", "<b>"+errorMessage+"</b>");
			  }
			 
		});
	},30);
});

$("#fileMappingWithILTable").on('click', '.m-check-all', function() {
	$("#fileMappingWithILTable").find('.m-check').prop('checked', this.checked);
});

$("#saveMappingWithIL").click(function(){
	$('.alert-success').empty();
	$('.alert-success').css('display','none');  
    var iLColumnNames = [];
    var selectedFileHeaders = [];
    var dafaultValues = [];
    var packageId = $("#packageId").val();
	var industryId = $("#industryId").val();
    var userID = $("#userID").val();
    var fileType = $("#flatFileType").val();
    var delimeter = $("#delimeter").val();
    var isFirstRowHasColumnNames =$("input:radio[name='isFirstRowHasColumnNames']:checked","#fileUploadForm").val(); 
    var originalFileName = $("#fileMappingWithILTable").find("thead").find("th.originalFileName").text();
    var iLId = $("#iLName").val();
    var dLId = $("#dLId").val();
    var dataSourceName = $("#flatDataSourceName").val();
    var dataSourceOther = $("#flatDataSourceOtherName").val();
    var filePath = null;
    var tablerows = $("#fileMappingWithILTable").find("tbody").find("tr");
    var sourceFileInfoId='';
    var process = true;
    tablerows.each(function() {
    	var row = $(this);
    	var ilcolumn = row.find('.iLcolumnName').clone();
    	ilcolumn.children().remove("span");
    	
    	var iLColumn = ilcolumn.text();
    	
    	var fileHeader = row.find('.fileHeader'). val() != ''? row.find('.fileHeader option:selected').text() : " ";
    	var notNull = row.find('.notNull').attr('data-notNull');
    	var fileHeaderVal = row.find('.fileHeader'). val();
    	if(notNull == "YES"){
    		var defVal =  row.find(".default").val();
    		if(fileHeaderVal == '' && defVal == ''){
    			var id =  row.find('.fileHeader').attr('id');
    			common.clearValidations(["#"+id]);
    			common.showcustommsg("#"+id, globalMessage['anvizent.package.label.pleaseChooseMandatoryField'],"#"+id);
    			process=false;
    		}
    	}
    	var defaultValue = null;
    	if(fileHeader.trim() == ''){
    		defaultValue = row.find(".default").val() != ''? row.find('.default'). val() : " ";
    		
    		if (defaultValue !== " ") {
    			var s = standardPackage.validateDefaultValue(row.find('input.default-dtype').get(0));
    			if (process && !s) process = false;
    		}
    		
    	}
    	  iLColumnNames.push(iLColumn);
    	  selectedFileHeaders.push(fileHeader);
    	  dafaultValues.push(defaultValue);
    });
    console.log(process)
    if (!process) return false;
    
    var selectData = {
    	packageId : packageId,
    	industryId : industryId,
    	iLId : iLId,
    	dLId : dLId,
    	fileType : fileType,
    	delimeter : delimeter,
    	isFirstRowHasColoumnNames : isFirstRowHasColumnNames,
    	originalFileName : originalFileName,
    	iLColumnNames : iLColumnNames.join(','),
    	selectedFileHeaders : selectedFileHeaders.join(','),
    	dafaultValues : dafaultValues.join(',')
    	
    }
    var token = $("meta[name='_csrf']").attr("content");
	var header = $("meta[name='_csrf_header']").attr("content");
	headers[header] = token;
    showAjaxLoader(true);
    var url_processMappingFileWithIL = "/app/user/"+userID+"/package/processMappingFileWithIL";
	 var myAjax = common.postAjaxCallObject(url_processMappingFileWithIL,'POST', selectData,headers);
	    myAjax.done(function(result) {
	    	showAjaxLoader(false);
	    	  if(result != null && result.hasMessages){
	    			  if(result.messages[0].code == "ERROR") {
							 var  messages=[{
								  code : result.messages[0].code,
								  text : result.messages[0].text
							  }];
							 $("#fileMappingWithILPopUp").modal('hide');
			    			 common.displayMessages(messages);
		    				  return false;
		    			  }
	    			  if(result.messages[0].code == "SUCCESS") {
	    				  if(result.object != null){
		    				  // filePath = result.object;
		    				  sourceFileInfoId = result.object;
		    				// save the mapping
		    					var selectData={
		    							   isMapped : true,
		    							   isFlatFile : true,
		    							   fileType :fileType,
		    							   sourceFileInfoId:sourceFileInfoId,
		    							   delimeter : delimeter,
		    							   isFirstRowHasColoumnNames : isFirstRowHasColumnNames,
		    							   iLId : iLId,
		    							   dLId : dLId,
		    							   packageId : packageId,
		    							   isWebservice:false,
		    							   ilSourceName:dataSourceName,
		    							   dataSourceNameOther:dataSourceOther
		    							   
		    					   };
		    					standardPackage.saveILConnectionMapping(selectData);
		    			  }
		    			  }else{
		    				  $("#fileMappingWithILPopUp").modal('hide');
		    				  common.displayMessages(result.messages);
		    			  }
	    		  
	    	  }else{
	    		  $("#fileMappingWithILPopUp").modal('hide');
		    		var messages = [ {
		    			code : globalMessage['anvizent.message.error.code'],
		    			text : globalMessage['anvizent.package.label.unableToProcessYourRequest']
		    		} ];
		    		common.displayMessages(messages);
		    	}
	    });
});
$("#saveMappingWithILForWebService").click(function(){
	var il_id=$("#iLName" ).val();
	$('.alert-success').empty();
	$('.alert-success').css('display','none');  
    var iLColumnNames = [];
    var selectedFileHeaders = [];
    var dafaultValues = [];
    var packageId = $("#packageId").val();
	var industryId = $("#industryId").val();
    var userID = $("#userID").val();
    var fileType = $("#flatFileType").val();
    var delimeter = $("#delimeter").val();
    var isFirstRowHasColumnNames =$("input:radio[name='isFirstRowHasColumnNames']:checked","#fileUploadForm").val(); 
    var originalFileName = $("#fileMappingWithILTable").find("thead").find("th.originalFileName").text();
    var iLId = $("#iLName").val();
    var dLId = $("#dLId").val();
    var filePath = null;
    var tablerows = $("#fileMappingWithILTable").find("tbody").find("tr");
    var dataSourceName = $("#flatDataSourceName").val();
    var dataSourceOther = $("#flatDataSourceOtherName").val();
    var dataSourceNameWSView = $(".dataSourceDiv").text();
    var dataSourceOtherWSView = $("#dataSourceOtherNameWSView").val();
    var process = true;
    tablerows.each(function() {
    	var row = $(this);
    	var ilcolumn = row.find('.iLcolumnName').clone();
    	ilcolumn.children().remove("span");
    	
    	var iLColumn = ilcolumn.text();
    	
    	var fileHeader = row.find('.fileHeader'). val() != ''? row.find('.fileHeader option:selected').text() : " ";
    	var notNull = row.find('.notNull').attr('data-notNull');
    	var fileHeaderVal = row.find('.fileHeader'). val();
    	if(notNull == "YES"){
    		var defVal =  row.find(".default").val();
    		if(fileHeaderVal == '' && defVal == ''){
    			var id =  row.find('.fileHeader').attr('id');
    			common.clearValidations(["#"+id]);
    			common.showcustommsg("#"+id, globalMessage['anvizent.package.label.pleaseChooseMandatoryField'],"#"+id);
    			process=false;
    		}
    	}
    	var defaultValue = null;
    	if(fileHeader.trim() == ''){
    		defaultValue = row.find(".default").val() != ''? row.find('.default'). val() : " ";
    		
    		if (defaultValue !== " ") {
    			var s = standardPackage.validateDefaultValue(row.find('input.default-dtype').get(0));
    			if (process && !s) process = false;
    		}
    		
    	}
    	  iLColumnNames.push(iLColumn);
    	  selectedFileHeaders.push(fileHeader);
    	  dafaultValues.push(defaultValue);
    });
    console.log(process)
    if (!process) return false;
    
    var selectData = {
    	packageId : packageId,
    	industryId : industryId,
    	iLId : iLId,
    	dLId : dLId,
    	fileType : fileType,
    	delimeter : delimeter,
    	isFirstRowHasColoumnNames : isFirstRowHasColumnNames,
    	originalFileName : originalFileName,
    	iLColumnNames : iLColumnNames.join(','),
    	selectedFileHeaders : selectedFileHeaders.join(','),
    	dafaultValues : dafaultValues.join(','),
    	ilSourceName:dataSourceNameWSView
    }
    showAjaxLoader(true);
    var url_processMappingFileWithIL = "/app/user/"+userID+"/package/saveMappingWithILForWebService";
	 var myAjax = common.postAjaxCallObject(url_processMappingFileWithIL,'POST', selectData,headers);
	    myAjax.done(function(result) {
	    	showAjaxLoader(false);
	    	  if(result != null && result.hasMessages){
	    			  if(result.messages[0].code == "ERROR") {
							 var  messages=[{
								  code : result.messages[0].code,
								  text : result.messages[0].text
							  }];
			    			 common.displayMessages(messages);
		    				  return false;
		    			  }
	    			  if(result.messages[0].code == "SUCCESS") {
	    				  if(result.object != null){
	    					  
		    				   var webserviceMappingHeaders = result.object;
		    				   var wsConId =  $('#existingWebServices option:selected').val(); 
		    				  
		    				    var apiDiv = $("div.wsApiDetailsDiv");
		    			 		var userID = $("#userID").val();
		    			 		var wsApiName = apiDiv.find(".wsApiName").val();
		    			 		var wsApiUrl = apiDiv.find(".wsApiUrl").val();
		    			 		var wssoapBodyElement = apiDiv.find("#soapBodyElement").val();
		    			 		// var wsApiBaseUrl =
								// apiDiv.find(".wsApiBaseUrl").val();
		    			 		var wsApiBaseUrlRequired = apiDiv.find(".wsApiBaseUrlRequired").is(':checked') ? true : false;
		    			 		var methodType = apiDiv.find(".wsApiMethodType:checked").val();
		    			 		var wsApiResponseObjName = apiDiv.find(".wsApiResponseObjName").val();
		    			 		var wsApiResponseColumnObjName = apiDiv.find(".wsApiResponseColumnObjName").val();
		    			 		var authenticationType = "";
		    			 		var wsConId = $("#existingWebServices").val();
		    			 		var iLId=$("#iLName option:selected").val();
		    			 		var userID = $("#userID").val(); 
		    					var industryId=$("#industryId").val();
		    					var packageId= $("#packageId").val() ;
		    				      
		    					 var pathParamValueDetails = {};
		    			 		 apiDiv.find(".wsManualSubUrlDiv").each(function(i,val){
		    			 			var pathParamValueObj = {};
		    			 			var valObj = $(val);
		    			 			
		    			 			var wsUrlPathParamVar = valObj.find(".wsUrlPathParam").text();
		    			 			var pathParamValTypeVar = valObj.find(".pathParamValType:checked").val();
		    			 			var manualParamValueVar = valObj.find(".manualParamValue").val();
		    			 			var subApiUrlVar = valObj.find(".wsSubApiUrl").val();
		    			 			var wsApiBaseUrlRequiredForSubUrlVar =  valObj.find(".wsSubApiBaseUrlRequired").is(":checked") ? true : false;
		    			 			var subApiMethodTypeVar = valObj.find(".wsSubApiMethodType:checked").val();
		    			 			var subApiResponseObjectVar = valObj.find(".wsSubApiResponseObjName").val();
		    			 			pathParamValueObj["paramName"] = wsUrlPathParamVar;
		    			 			pathParamValueObj["valueType"] = pathParamValTypeVar;
		    			 			
		    			 			if (pathParamValTypeVar == "M") {
		    			 				manualParamValueVar = valObj.find(".manualParamValue").val();
		    			 				pathParamValueObj["manualParamValue"] = manualParamValueVar;
		    			 			} else if (pathParamValTypeVar == "S") {
		    			 				pathParamValueObj["subUrldetailsurl"] = subApiUrlVar;
		    			 				pathParamValueObj["subUrldetailsmethodType"] = subApiMethodTypeVar;
		    			 				pathParamValueObj["subUrldetailsresponseObjName"] = subApiResponseObjectVar;
		    			 				pathParamValueObj["baseUrlRequired"] = wsApiBaseUrlRequiredForSubUrlVar;
		    			 				
		    			 				var subUrlPaginationRequired = valObj.find(".subUrlPaginationRequired:checked").val() == 'yes' ? true : false ;
		    			  		 		var subUrlPaginationOffSetType = valObj.find(".subUrlPaginationOffSetType");
		    			  		 		var subUrlPaginationDateType = valObj.find(".subUrlPaginationDateType");
		    			  		 		var subUrlPaginationHypermediaType = valObj.find(".subUrlPaginationHypermediaType");
		    			  		 		var subUrlPaginationType = valObj.find(".subUrlPaginationOffsetDateType:checked").val();
		    			  				if ( subUrlPaginationRequired ) { 
		    								var subUrlPaginationParamType = valObj.find(".subUrlPaginationParamType").val();
		    								pathParamValueObj["subUrlPaginationParamType"] = subUrlPaginationParamType;
		    								pathParamValueObj["subUrlPaginationRequired"] = subUrlPaginationRequired;
		    								if(subUrlPaginationType == 'offset'){
			    								pathParamValueObj['subUrlPaginationType']  =  subUrlPaginationType;
			    								var subUrlPaginationOffSetRequestParamName = subUrlPaginationOffSetType.find('.subUrlPaginationOffSetRequestParamName').val();
			    								var subUrlPaginationOffSetRequestParamValue = subUrlPaginationOffSetType.find('.subUrlPaginationOffSetRequestParamValue').val();
			    								var subUrlPaginationLimitRequestParamName = subUrlPaginationOffSetType.find('.subUrlPaginationLimitRequestParamName').val();
			    								var subUrlPaginationLimitRequestParamValue = subUrlPaginationOffSetType.find('.subUrlPaginationLimitRequestParamValue').val();
			    								pathParamValueObj['subUrlPaginationOffSetRequestParamName']  =  subUrlPaginationOffSetRequestParamName;
			    								pathParamValueObj['subUrlPaginationOffSetRequestParamValue']  =  subUrlPaginationOffSetRequestParamValue;
			    								pathParamValueObj['subUrlPaginationLimitRequestParamName']  =  subUrlPaginationLimitRequestParamName;
			    								pathParamValueObj['subUrlPaginationLimitRequestParamValue']  =  subUrlPaginationLimitRequestParamValue;
		    								}else if(subUrlPaginationType == 'date'){
		    									pathParamValueObj['subUrlPaginationType']  =  subUrlPaginationType;
		    									var subUrlPaginationStartDateParam = subUrlPaginationDateType.find('.subUrlPaginationStartDateParam').val();
		    									var subUrlPaginationEndDateParam = subUrlPaginationDateType.find('.subUrlPaginationEndDateParam').val();
		    									var subUrlPaginationStartDate = subUrlPaginationDateType.find('.subUrlPaginationStartDate').val();
		    									var subUrlPaginationDateRange = subUrlPaginationDateType.find('.subUrlPaginationDateRange').val();
		    									pathParamValueObj['subUrlPaginationStartDateParam']  =  subUrlPaginationStartDateParam;
		    									pathParamValueObj['subUrlPaginationEndDateParam']  =  subUrlPaginationEndDateParam;
		    									pathParamValueObj['subUrlPaginationStartDate']  =  subUrlPaginationStartDate;
		    									pathParamValueObj['subUrlPaginationDateRange']  =  subUrlPaginationDateRange;
		    								} else {
		    									pathParamValueObj['subUrlPaginationType']  =  subUrlPaginationType;
		    									var subUrlPaginationHyperLinkPattern = subUrlPaginationHypermediaType.find('.subUrlPaginationHyperLinkPattern').val();
		    									var subUrlPaginationHypermediaPageLimit = subUrlPaginationHypermediaType.find('.subUrlPaginationHypermediaPageLimit').val();
		    									pathParamValueObj['subUrlPaginationHyperLinkPattern']  =  subUrlPaginationHyperLinkPattern;
		    									pathParamValueObj['subUrlPaginationHypermediaPageLimit']  =  subUrlPaginationHypermediaPageLimit;
		    								}
		    			  				}else{
		    			  					pathParamValueObj["subUrlPaginationRequired"] = subUrlPaginationRequired;
		    			  				}
		    			 			} else {
		    			 				common.showcustommsg(valObj.find(".pathParamValType"),"Please select Path param response from type");
		    			 				status = false;
		    			 				return;
		    			 			}
		    			 			
		    			 			pathParamValueDetails[wsUrlPathParamVar] = pathParamValueObj;
		    			 			
		    			 		});
		    			 		 
		    			 		var requsetParamValue = [];
		    			  	     
		    			  		 apiDiv.find(".wsApiRequestParam").each(function(i,val){
		    			  			var  requestParamValueDetails = {} 
		    			  			var valObj = $(val);
		    			   			var requestParamName = valObj.find(".wsApiRequestParamName").val();
		    			   			var requestParamValue = valObj.find(".wsApiRequestParamValue").val();
		    			   			
		    			   			requestParamValueDetails["paramName"] = requestParamName;
		    			   			requestParamValueDetails["paramValue"] = requestParamValue;
		    			   			
		    			   			requsetParamValue.push(requestParamValueDetails);
		    			   		 
		    			   		});
		    			  		 
		    			  		 var bodyParamValue = [];
		    			  	     
		    			  		 apiDiv.find(".wsApiBodyParam").each(function(i,val){
		    			  			var  bodyParamValueDetails = {} 
		    			  			var valObj = $(val);
		    			   			var requestParamName = valObj.find(".wsApiRequestParamName").val();
		    			   			var requestParamValue = valObj.find(".wsApiRequestParamValue").val();
		    			   			
		    			   			bodyParamValueDetails["paramName"] = requestParamName;
		    			   			bodyParamValueDetails["paramValue"] = requestParamValue;
		    			   			
		    			   			bodyParamValue.push(bodyParamValueDetails);
		    			   		 
		    			   		});

		    			  		var paginationRequestParamsArray = [];
		    				    var paginationRequired = apiDiv.find(".paginationRequired:checked").val() == 'yes' ? true : false ;
		    				    var paginationOffSetType = apiDiv.find(".paginationOffSetType");
		    	  		 		var paginationDateType = apiDiv.find(".paginationDateType");
		    	  		 		var paginationHypermediaType = apiDiv.find(".paginationHypermediaType");
		    	  		 		var paginationType = apiDiv.find(".paginationOffsetDateType:checked").val();
		    					if ( paginationRequired ) { 
		    						var paginationRequestParamsObject = {};
		    					var paginationParamType = apiDiv.find(".paginationParamType").val();
		    					paginationRequestParamsObject["paginationParamType"] = paginationParamType;
		    				 
		    				  if(paginationType == 'offset'){
		    					    
		    					    var paginationOffSetRequestParamName = paginationOffSetType.find(".paginationOffSetRequestParamName").val();
		    						var paginationOffSetRequestParamValue = paginationOffSetType.find(".paginationOffSetRequestParamValue").val();
		    						var paginationLimitRequestParamName = paginationOffSetType.find(".paginationLimitRequestParamName").val();
		    						var paginationLimitRequestParamValue = paginationOffSetType.find(".paginationLimitRequestParamValue").val();
		    						var paginationObjectName =  paginationOffSetType.find(".paginationObjectName").val();
		    						var paginationSearchId =  paginationOffSetType.find(".paginationSearchId").val();
		    						var PaginationSoapBody =  paginationOffSetType.find(".PaginationSoapBody").val();
		    						
		    						paginationRequestParamsObject['paginationOffSetRequestParamName']  =  paginationOffSetRequestParamName;
		    						paginationRequestParamsObject['paginationOffSetRequestParamValue'] = paginationOffSetRequestParamValue;
		    						paginationRequestParamsObject['paginationLimitRequestParamName'] = paginationLimitRequestParamName;
		    						paginationRequestParamsObject['paginationLimitRequestParamValue']  =  paginationLimitRequestParamValue;
		    						paginationRequestParamsObject['paginationObjectName']  =  paginationObjectName;
		    						paginationRequestParamsObject['paginationSearchId']  =  paginationSearchId;
		    						paginationRequestParamsObject['PaginationSoapBody']  =  PaginationSoapBody;

		    					}else if(paginationType == 'date'){

		    						 
		    						var paginationStartDateParam = paginationDateType.find('.paginationStartDateParam').val();
		    						var paginationEndDateParam = paginationDateType.find('.paginationEndDateParam').val();
		    						var paginationStartDate = paginationDateType.find('.paginationStartDate').val();
		    						var paginationDateRange = paginationDateType.find('.paginationDateRange').val();
		    						
		    						paginationRequestParamsObject['paginationStartDateParam']  =  paginationStartDateParam;
		    						paginationRequestParamsObject['paginationEndDateParam']  =  paginationEndDateParam;
		    						paginationRequestParamsObject['paginationStartDate']  =  paginationStartDate;
		    						paginationRequestParamsObject['paginationDateRange']  =  paginationDateRange;
		    					
		    					} else {
		    						var paginationHyperLinkPattern = paginationHypermediaType.find('.paginationHyperLinkPattern').val();
		    						var paginationHypermediaPageLimit = paginationHypermediaType.find('.paginationHypermediaPageLimit').val();
		    						
		    						paginationRequestParamsObject['paginationHyperLinkPattern']  =  paginationHyperLinkPattern;
		    						paginationRequestParamsObject['paginationHypermediaPageLimit']  =  paginationHypermediaPageLimit;
		    					}
		    				  if(!$.isEmptyObject(paginationRequestParamsObject))
		    						paginationRequestParamsArray.push(paginationRequestParamsObject);
		    					}
		    			  		 
		    			  		 
		    			  		var inclUpdateParamsArray = [];
		    			  		var incrementalUpdate = apiDiv.find(".incrementalUpdate").prop("checked");
		    					var incrementalUpdateDetailsDiv = apiDiv.find(".incrementalUpdateDetailsDiv");
		    					if ( incrementalUpdate ) {
		    						var incrementalUpdateParamName = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamName").val();
		    						var incrementalUpdateParamvalue = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamvalue").val();
		    						var incrementalUpdateParamColumnName = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamColumnName").val();
		    						var incrementalUpdateParamType = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamType").val();
		    						
		    						
		    						var inclUpdateParamsObject = {};
		    						inclUpdateParamsObject['incrementalUpdateParamName'] = incrementalUpdateParamName;
		    						inclUpdateParamsObject['incrementalUpdateParamvalue'] = incrementalUpdateParamvalue;
		    						inclUpdateParamsObject['incrementalUpdateParamColumnName'] = incrementalUpdateParamName;
		    						inclUpdateParamsObject['incrementalUpdateParamType'] = incrementalUpdateParamType;
		    						
		    						if(!$.isEmptyObject(inclUpdateParamsObject))
		    							inclUpdateParamsArray.push(inclUpdateParamsObject);
		    					}
		    			 		  
		    			 		var webserviceData = {
		    							  url:wsApiUrl,
		    							 // baseUrl:wsApiBaseUrl,
		    							  baseUrlRequired:wsApiBaseUrlRequired,
		    							  requestMethod:methodType,
		    							  apiName:wsApiName,
		    							  soapBodyElement:wssoapBodyElement,
		    							  ilId:il_id,
		    							  industryId:industryId,
		    							  packageId:packageId ,
		    						      responseObjName:wsApiResponseObjName,
		    						      responseColumnObjName:wsApiResponseColumnObjName,
		    						      wsConId : wsConId,
		    						      ilId :iLId,
		    		 				      userId : userID,
		    		 				      apiPathParams:JSON.stringify(pathParamValueDetails),
		    		 				      requestParameters:JSON.stringify(requsetParamValue),
		    		 				      paginationRequired:paginationRequired,
		    		 				      paginationType:paginationType,
		    		 				 	  paginationRequestParamsData:JSON.stringify(paginationRequestParamsArray),
		    		 					  incrementalUpdate:incrementalUpdate,
		    		 					  incrementalUpdateparamdata:JSON.stringify(inclUpdateParamsArray),
		    		 					  apiBodyParams:JSON.stringify(bodyParamValue),
		    		 					  validateOrPreview:true
		    					       } 
		    			 	 
		    					var selectData={
		    							   isMapped : true,
		    							   isFlatFile : false,
		    							   fileType :null,
		    							   filePath : null,
		    							   delimeter : null,
		    							   isFirstRowHasColoumnNames : isFirstRowHasColumnNames,
		    							   iLId : iLId,
		    							   dLId : dLId,
		    							   packageId : packageId,
		    							   isWebservice:true,
		    					           webserviceMappingHeaders:webserviceMappingHeaders,
		    					           wsConId:wsConId,
		    					           isHavingParentTable:false,
		    					           webService:webserviceData,
		    					           ilSourceName:dataSourceNameWSView
		    							   
		    					   };
		    			 		
		    			 		
		    					standardPackage.saveILConnectionMapping(selectData);
		    			   }
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
$(document).on('click', '.flatFilePreviewStandard', function() {
	var userID = $("#userID").val();
	var packageId = $("#packageId").val();
	var mappedId = $(this).attr("data-mappingId");
	
	
		showAjaxLoader(true);
		var url_checkQuerySyntax = "/app/user/"+userID+"/package/getFlatFilePreview/"+packageId+"/"+mappedId;
		 var myAjax = common.loadAjaxCall(url_checkQuerySyntax,'GET','',headers);
		    myAjax.done(function(result) {
		    	showAjaxLoader(false);
		    	  if(result != null){
		    		  if(result.hasMessages){
		    			  if(result.messages[0].code == "ERROR") {
								
			    			  var message = '<div class="alert alert-danger alert-dismissible" role="alert">'+
	  							''+result.messages[0].text+''+
	  							'</div>';
			    			  	$(".queryValidatemessageDiv").append(message)
			    				  return false;
			    			  }  
		    		  }
		    		  
		    		  $("#viewDeatilsPreviewPopUp").modal('show');
		    	  var list = result.object;
		    	  if(list != null && list.length > 0){
		    		  var tablePreview='';
			    	  $.each(list, function (index, row) {
			    		  
			    		  tablePreview+='<tr>';
			    		  $.each(row, function (index1, column) {
			    			  tablePreview += (index == 0 ? '<th>'+column+'</th>' : '<td>'+column+'</td>');
			    		  });
			    		 tablePreview+='</tr>'; 
			    		});
			    	  $(".viewDeatilsPreview").empty();
			    	  $(".viewDeatilsPreview").append(tablePreview);
			    	  }
			    	  else{
			    		  $(".viewDeatilsPreview").empty();
			    		  $(".viewDeatilsPreview").append(globalMessage['anvizent.package.label.noRecordsAvailable']);
			    	  } 
		    	  }
		    	  
		    });
		
	
});

$(document).on('click', '.databasePreviewStandard', function() {
	$(".queryValidatemessageDiv").empty();
	var userID = $("#userID").val(); 
	var connectionId = $(this).attr("data-connectionId");
	var typeOfCommand = $(this).attr("data-typeOfCommand"); 
	var query = $(this).attr("data-query");
		var selectData ={
				iLConnection : {
					connectionId : connectionId
				},
				iLquery : query,
				typeOfCommand : typeOfCommand
		}
 
		if (typeOfCommand === "Stored Procedure") {
			var params = $("div.s-param-vals", "#databaseSettings");
			if (params && params.length) {
				var procedureParameters = [];
				params.each(function() {
					var param = $(this);
					var paramname = param.find('input.s-param-name').val(),
					paramvalue = param.find('input.s-param-value').val();
					if (paramname.replace(/\s+/g, '') && paramvalue.replace(/\s+/g, ''))
						procedureParameters.push(paramname+'='+paramvalue);
				});
				if (procedureParameters.length)
					selectData.procedureParameters = procedureParameters.join('^');
			}
		}
		showAjaxLoader(true);
		var url_checkQuerySyntax = "/app/user/"+userID+"/package/getTablePreview";
		 var myAjax = common.postAjaxCall(url_checkQuerySyntax,'POST', selectData,headers);
		    myAjax.done(function(result) {
		    	showAjaxLoader(false);
		    	  if(result != null){
		    		  if(result.hasMessages){
		    			  if(result.messages[0].code == "ERROR") {
								
			    			  var message = '<div class="alert alert-danger alert-dismissible" role="alert">'+
	  							''+result.messages[0].text+''+
	  							'</div>';
			    			  	$(".queryValidatemessageDiv").append(message)
			    				  return false;
			    			  }  
		    		  }
		    		  
		    		  $("#viewDeatilsPreviewPopUp").modal('show');
		    	  var list = result.object;
		    	  if(list != null && list.length > 0){
		    		  var tablePreview='';
			    	  $.each(list, function (index, row) {
			    		  
			    		  tablePreview+='<tr>';
			    		  $.each(row, function (index1, column) {
			    			  tablePreview += (index == 0 ? '<th>'+column+'</th>' : '<td>'+column+'</td>');
			    		  });
			    		 tablePreview+='</tr>'; 
			    		});
			    	  $(".viewDeatilsPreview").empty();
			    	  $(".viewDeatilsPreview").append(tablePreview);
			    	  }
			    	  else{
			    		  $(".viewDeatilsPreview").empty();
			    		  $(".viewDeatilsPreview").append(globalMessage['anvizent.package.label.noRecordsAvailableInTable']);
			    	  } 
		    	  }
		    	  
		    });
		
	
});



$("#addAnotherSource").click(function(){
	$(".flatDataSourceOther").hide();
	$("#messagePopUp").modal('hide');	
	$("#flatFiles").trigger("click");
	
});

$(".close-popup").click(function(){	
	$(".flatDataSourceOther").hide();
	$("#flatFiles").trigger("click");
});

$(document).on('click', '#downloadTemplate', function() {
	$("#downloadILTemplate").modal("show");
});
$(document).on('click', '#confirmDownloadILTemplate', function() {
	var il_id=$("#iLName" ).val();
	var userID = $("#userID").val();
	var packageId = $("#packageId").val();
	var templateType='';
	$("#downloadILTemplate").modal("hide");
	if($('#ilCsv').is(':checked')) {
		templateType="csv";	
	}
	if($('#ilXls').is(':checked')) {
		templateType="xls";	
	}
	if($('#ilXlsx').is(':checked')) {
		templateType="xlsx";	
	}
	
	
	var url_defaultILincrementalquery = "/app/user/"+userID+"/package/checkFordownloadIlTemplate/"+il_id+"/"+templateType;
	 var myAjax = common.loadAjaxCall(url_defaultILincrementalquery,'GET','',headers);
	    myAjax.done(function(result) {
	    	showAjaxLoader(false);
	    	if(result != null && result.hasMessages){
	    		if(result.messages[0].code == "SUCCESS") {
	    			window.open(adt.contextPath+"/app/user/"+userID+"/package/downloadIlTemplate/"+il_id+"/"+templateType,"_blank","");
	    		} else {
	    			common.displayMessages(result.messages);
	    		}
	    		
	    	}else{
	    		standardPackage.showMessage(globalMessage['anvizent.package.label.operationFailedPleaseTryAgain']);
	    	}
	    });
	    
});
 
// Accordion Toggle Items
     var iconOpen = 'glyphicon glyphicon-minus-sign', iconClose = 'glyphicon glyphicon-plus-sign';

 $(document).on('show.bs.collapse hide.bs.collapse', '.accordion', function (e) {
     var $target = $(e.target)
       $target.siblings('.accordion-heading')
       .find('span').toggleClass(iconOpen + ' ' + iconClose);
       if(e.type == 'show')
           $target.prev('.accordion-heading').find('.accordion-toggle').addClass('active');
       if(e.type == 'hide')
           $(this).find('.accordion-toggle').not($target).removeClass('active');
 });
 
 $("#il_incremental_update").click(function(e){
	 
	 if($(this).is(":checked")){
		 // get incremetal update query
		 $("#historicalLoad, #default").attr('checked',false);
		 $("#historicalLoadDiv").hide();
		 var ilid = $("#iLName").val();
		 var connectionId = $("#existingConnections").val();
		 var userID = $("#userID").val();
		 showAjaxLoader(true);
		 var url_defaultILincrementalquery = "/app/user/"+userID+"/package/defaultILIncrementalQuery/"+ilid+"/"+connectionId;
		 var myAjax = common.loadAjaxCall(url_defaultILincrementalquery,'GET','',headers);
		    myAjax.done(function(result) {
		    	showAjaxLoader(false);
		    	if(result != null && result.hasMessages){
		    		var query = result.object.query;
		    		var maxDateQuery = result.object.maxDateQuery;
		    			$(".max_date_query").show();
		    			$("#oldMaxDateQuery").val(maxDateQuery);
		    			$("#maxDatequery").val(maxDateQuery);
		    		$("#queryScript,#oldQueryScript").val(query);
		    		
		    	}else{
		    		$("#queryScript,#oldQueryScript").val("");
		    	}
		    });
		 
	 }else{
		 $("#existingConnections").trigger("change");
	 }
 });
 $(".buildQuery").on('click',function(e){
	 e.preventDefault();
	 $(this).attr("disabled",true).text(globalMessage['anvizent.package.label.loading']);
	 $("#intiateBuildQuery").submit();
 });
  
 function convertMonthToDate(staticYear, month, staticDay,sepearator) {
		
		if ( month != null && month != 'null' && month != '') {
			month = month+"";
			if (month.length == 1) {
				month = "0"+month; 
			}
			return staticYear + sepearator + month + sepearator + staticDay;
		}
		
		return null;
	}
  
  		$(document).on("click",".activatePackage",function(){
  			var packageId = $(this).attr("data-packageId");
  			$("#activatePackageAlert").modal("show");
			$("#confirmActivatePackage").attr("data-packageId",packageId); 
		});
  		
		$("#confirmActivatePackage").on("click",function(){
			var packageId = $(this).attr("data-packageId");
			var userId = $("#userID").val();
			var token = $("meta[name='_csrf']").attr("content");
			var header = $("meta[name='_csrf_header']").attr("content");
			headers[header] = token;
			 	showAjaxLoader(true);
			 	var url_activatePackage = "/app/user/"+userId+"/package/activateUserPackage/"+packageId;
	 		    var myAjax = common.postAjaxCall(url_activatePackage,'POST','',headers);
	 		    myAjax.done(function(result) {
	 		    	showAjaxLoader(false);
	 		    	  if(result != null && result.hasMessages){
	 		    			  if(result.messages[0].code == "SUCCESS") {
								 var  messages=[{
									  code : result.messages[0].code,
									  text : result.messages[0].text
								  }];
								 $("#activatePackageAlert").modal("hide");
								 standardPackage.updateDisabledPackagesTable(result);
	 			    		 }else{
	 			    			 common.displayMessages(result.messages);
	 			    		 }
	 		    		  }else{
	 		    			  standardPackage.showMessage(globalMessage['anvizent.package.label.operationFailedPleaseTryAgain']);
	 		    		  }
	 		    });
			 
		});
		
  		$(document).on("click",".edit",function(){
  			var packageId = $(this).attr("data-packageId");
  			$(this).hide();
  			$(this).parents("td").find(".newPackageName").show();
  			$(this).parents("td").find(".renamepackage").show();
  			$(this).parents("td").find(".cancel").show();
  		});
  		
  		$(document).on("click",".renamepackage",function(){
  			var renameBtn = $(this); 
  			var packageName = $(this).parents("td").find(".newPackageName").val();
  			var packageId = $(this).attr("data-packageId");
  			var userId = $("#userID").val();
  			var selectData = {
  					packageId : packageId,
  					packageName : packageName
  			}  			
  			var token = $("meta[name='_csrf']").attr("content");
			var header = $("meta[name='_csrf_header']").attr("content");
			headers[header] = token;
  			var url_renamePackage = "/app/user/"+userId+"/package/renameUserPackage";
 		    var myAjax = common.postAjaxCall(url_renamePackage,'POST', selectData,headers);
 		    myAjax.done(function(result) {
 		    	showAjaxLoader(false);
 		    	  if(result != null){
 		    		  if(result.hasMessages){ 		    			 
 		    			  if(result.messages[0].code == "SUCCESS") {														 
							 renameBtn.parents("td").find("span.packageName").text(packageName);
							 renameBtn.parents("td").find(".newPackageName").val("").hide();
							 renameBtn.parents("td").find(".cancel").hide();
							 renameBtn.parents("td").find(".edit").show();
							 renameBtn.hide();
							 var message = result.messages[0].text;
							 common.showSuccessAlert(message);
 			    		  }
 		    			  else if(result.messages[0].code == "ERROR"){
 		    				 var message = result.messages[0].text;
 		    				common.showErrorAlert(message);
 		    			  }
 		    		  }else{
 		    			  standardPackage.showMessage(globalMessage['anvizent.package.label.operationFailedPleaseTryAgain']);
 		    		  }
 		    	  }
 		    });
  		});
  		
  		$(document).on("click",".cancel",function(){
  			 $(this).parents("td").find(".edit").show();
			 $(this).parents("td").find(".newPackageName").val("").hide();
			 $(this).parents("td").find(".renamepackage").hide();
			 $(this).hide();
  		});
  		
  		$(document).on("change","#filterPackages",function(){  			
  			var userID = $("#userID").val();	
  			var token = $("meta[name='_csrf']").attr("content");
			var header = $("meta[name='_csrf_header']").attr("content");
			headers[header] = token;
  			showAjaxLoader(true);		
  			var url =  "/app/user/"+userID+"/package/filterPackagesOnIsActive";
  		    var myAjax = common.loadAjaxCall(url,'GET','',headers);
  		    myAjax.done(function(result) {
  		    	showAjaxLoader(false);
  		    	  if(result != null && result.hasMessages){  		    		 
  		    		  if(result.messages[0].code == "SUCCESS"){
  		    			standardPackage.filterDisabledPackagesTable(result);    			
  		    		  } else{
  		    			  common.displayMessages(result.messages);
  		    		  }		    		   
  		    	  }	else{
			    		var messages = [ {
  			    			code : globalMessage['anvizent.message.error.code'],
  			    			text : globalMessage['anvizent.package.label.unableToProcessYourRequest']
  			    		} ];
  			    		common.displayMessages(messages);
  			    	}    	 
  		    });
  		});
  		
  		
 
  		$(document).on('change', '#iLName', function(){ 
  			
  			var isWebSeriveChecked = $('#webService').is(':checked');
  			var ilId = $('#iLName option:selected').val();
  			var webserviceConId = $('#existingWebServices option:selected').val();
  			 
  			 $('#saveWsApi,#joinWsApi').hide();
  			
  			if(isWebSeriveChecked){
  				
  				if(webserviceConId == 0){
  	  				common.showErrorAlert(globalMessage['anvizent.package.message.pleaseselectwebservice']);
  	  				return false;
  	  			}
  	  			
  				standardPackage.getWsMappingDetails(webserviceConId ,ilId);
  			}
  		
  		 });
  	 
  		$("#flatFileType").on('change', function() {
  			var fileType = $("#flatFileType option:selected").val();
  			if (fileType == "csv") {
  				common.clearValidations([ "#delimeter"]);
  				$("#delimeter").val(",");
  				$(".delimeter-block").show();
  			} else {
  				$(".delimeter-block").hide();
  			}
  		});
  		
  		
  	  $(document).on("click",".addDbSchema",function(){
     		 
    		var connector_id =  $("#IL_database_databaseType option:selected").attr('data-connectorid');
    		var protocal =  $("#IL_database_databaseType option:selected").data('protocal');
    		var dbSchemaSelection = $(this).parents("#dbSchemaSelection");
    		$(dbSchemaSelection).find(".dbAndSchemalabel").text("");
      		var dbVariables = dbSchemaSelection.find("#dbVariable > option").clone();
      		var dbnames = dbSchemaSelection.find('#dbName  > option').clone();
      		var schemaVariables = dbSchemaSelection.find('#schemaVariable > option').clone();
      		
      		var dbSchemaSelectionDivForSqlServer = $("#dbSchemaSelectionDivForSqlServer").clone().removeAttr('id').prop("id","dbSchemaSelection").show();
      		var dbSchemaSelectionDivForNotSqlServer = $("#dbSchemaSelectionDivForNotSqlServer").clone().removeAttr('id').prop("id","dbSchemaSelection").show();
      	
      		if(protocal.indexOf('sqlserver') != -1 || protocal.indexOf('odbc') != -1){
      			
      			var dbVariable = dbSchemaSelectionDivForSqlServer.find("#dbVariable");
      			var dbName = dbSchemaSelectionDivForSqlServer.find("#dbName");
      			var schemaVariable =  dbSchemaSelectionDivForSqlServer.find("#schemaVariable");
      			
	  			dbVariable.empty().append(dbVariables);
				dbName.empty().append(dbnames);
	  			schemaVariable.empty().append(schemaVariables);
	  			dbSchemaSelectionDivForSqlServer.find(".labelForDbAndSchemaName").text("");
	  			dbSchemaSelectionDivForSqlServer.find(".deleteDbSchema").show();
				$("#defualtVariableDbSchema").append(dbSchemaSelectionDivForSqlServer);
				
      		}else if(protocal.indexOf('mysql') != -1 || protocal.indexOf('oracle') != -1  ||  protocal.indexOf('db2') != -1  || protocal.indexOf('sforce') != -1 || protocal.indexOf('as400') != -1  || protocal.indexOf('postgresql') != -1  || protocal.indexOf('vortex') != -1  ){
      			
      			var schemaVariable =  dbSchemaSelectionDivForNotSqlServer.find("#schemaVariable");
      			var dbName = dbSchemaSelectionDivForNotSqlServer.find("#dbName");
      			 
          		schemaVariable.empty().append(schemaVariables);
          		dbName.empty().append(dbnames);
          		
          		dbSchemaSelectionDivForNotSqlServer.find(".labelForDbAndSchemaName").text("");
          		dbSchemaSelectionDivForNotSqlServer.find(".deleteDbSchema").show();
          		$("#defualtVariableDbSchema").append(dbSchemaSelectionDivForNotSqlServer);
      		}
      		
      		
      		});
   
  	$(document).on("click",".deleteDbSchema",function(){ 		
 		$(this).parents("#dbSchemaSelection").remove(); 		 			 
 	});
  	
  	$(document).on("change","#dbName",function(){ 		
			    	
  		var connectionId = null;
		var name = $("#existingConnections option:selected").attr("name");
		
		var userID = $("#userID").val();
		if(name == "iLName"){
			if($("#existingConnections").is(":visible")){
				connectionId = $("#existingConnections").val();
			}
			
		}else{
			connectionId = $("#existingConnections").val();
		}
		var $schemaName = $(this).parents('#dbSchemaSelection').find('#schemaName');
		var databaseName = $(this).val();
		if(databaseName === '{dbName}' ){
			common.showErrorAlert(globalMessage['anvizent.package.message.pleaseselectdatabase']);
			return false;
		}
		 var connector_id =  $("#IL_database_databaseType option:selected").attr('data-connectorid');
		 var protocal =  $("#IL_database_databaseType option:selected").data('protocal');
		 
	if(connectionId !=null ){
		
		if(protocal.indexOf('sqlserver') != -1 || protocal.indexOf('odbc') != -1){
			var token = $("meta[name='_csrf']").attr("content");
			var header = $("meta[name='_csrf_header']").attr("content");
			headers[header] = token;
			showAjaxLoader(true);
			var url_getSchemaByDatabse ="/app/user/"+userID+"/package/getSchemaByDatabse/"+connectionId+"/"+databaseName+""; 
			var myAjax = common.loadAjaxCall(url_getSchemaByDatabse,'GET','',headers);
			    myAjax.done(function(result) {
			    	showAjaxLoader(false);
			    	  if(result != null){ 
			    		  if(result.hasMessages){
			    			  if(result.messages[0].code == "ERROR") { 
			    				  common.showErrorAlert(result.messages[0].text);
			    				  return false;
			    			  }  
			    		   else if(result.messages[0].code == "SUCCESS"){
			    			   console.log("result.object",result.object);
			    			   var schemaName='';
			    			   if(result.object != null){
			    				   $schemaName.empty();
			    				      schemaName  = '<option value="{schemaName}">'+globalMessage['anvizent.package.label.selectschemavariable']+'</option>';
			    				   $.each( result.object, function( key, value ) {
			    					   schemaName += '<option value='+value+'>'+value+'</option>';
				    				 });
			    				  
			    				   $schemaName.append(schemaName);
			    				  
			    			   }else{
			    				   common.showErrorAlert(result.messages[0].text);
			    				   return false;
			    			   }
			    			 
			    			  } 
			    		  }	  
			    	  }    	  
			    }); 
		   }
		
		}
	 	 
 	});
  	
  	
  	$(document).on("click","#replaceShemas",function(){ 	
  		
  		var queryScript = $('#queryScript').val();
  		var maxDateQuery = $('#maxDatequery').val();
  	    var script=queryScript;
  	    var maxScript=maxDateQuery;
  		var query='',
  		maxQuery='';
  		 var connector_id =  $("#IL_database_databaseType option:selected").attr('data-connectorid');
  		 var protocal =  $("#IL_database_databaseType option:selected").data('protocal');
  		showAjaxLoader(true);
	    $('#defualtVariableDbSchema').find('.dbSchemaSelection').each(function(i, obj) {
	    	
	    	var dbVariable=$(this).find(".dbVariable").val(); 
		    var dbName=$(this).find(".dbName").val();
		    var schemaVariable=$(this).find(".schemaVariable").val();
		    var schemaName=$(this).find(".schemaName").val();
		    common.clearValidations([$(obj).find('.dbVariable'), $(obj).find('.dbName'), $(obj).find('.schemaVariable'), $(obj).find('.schemaName')]);
		    
		  var validStatus = true;
		  if(dbVariable == '' || dbVariable == '{db0}'){
			    common.showcustommsg($(obj).find('.dbVariable'),globalMessage['anvizent.package.message.pleasechoosedatabasevariable'],$(obj).find('.dbVariable'));
		    	validStatus =false;
		  }
		  if(dbName == '' || dbName == '{dbName}'){
			    common.showcustommsg($(obj).find('.dbName'),globalMessage['anvizent.package.message.pleasechoosedatabasename'],$(obj).find('.dbName'));
		    	validStatus =false;
		  }
		  if(schemaVariable == '' || schemaVariable == '{schema0}'){
			    common.showcustommsg($(obj).find('.schemaVariable'),globalMessage['anvizent.package.message.pleasechooseschemavariable'],$(obj).find('.schemaVariable'));
		    	validStatus =false;
		  }
		  if(schemaName == '' || schemaName == '{schemaName}'){
			    common.showcustommsg($(obj).find('.schemaName'),globalMessage['anvizent.package.message.pleasechooseschemaname'],$(obj).find('.schemaName'));
		    	validStatus =false;
		  }
		 
		  if(!validStatus){
			 	return validStatus;
		   }
		  if(protocal.indexOf('sqlserver') != -1 || protocal.indexOf('odbc') != -1){
		    if ((script.indexOf(dbVariable) > -1 || script.indexOf(schemaVariable) > -1) || (maxScript.indexOf(dbVariable) > -1 || maxScript.indexOf(schemaVariable) > -1)) {
		    	
			    	query = script.split(dbVariable).join(dbName);
			    	query = query.split(schemaVariable).join(schemaName);
			    	
			    	maxQuery = maxScript.split(dbVariable).join(dbName);
			    	maxQuery = maxQuery.split(schemaVariable).join(schemaName);
		    	}
		    	
		    else{
		    	query = script;
		    	maxQuery = maxScript;
		    }
		  }
	     else if(protocal.indexOf('mysql') != -1 || protocal.indexOf('oracle') != -1 || protocal.indexOf('db2') != -1   ||  protocal.indexOf('sforce') != -1  || protocal.indexOf('as400') != -1 ||  protocal.indexOf('postgresql') != -1   ||   protocal.indexOf('vortex') != -1  || protocal.indexOf('openedge') != -1){
	    	 console.log(schemaVariable ,dbName);
	    	 if ((script.indexOf(schemaVariable) > -1) || (maxScript.indexOf(schemaVariable) > -1)) {
	    		 	
	    		    query = script.split(schemaVariable).join(dbName);
	    		    maxQuery = maxScript.split(schemaVariable).join(dbName);
		    	}
		    	
		    else{
		    	query = script;
		    	maxQuery = maxScript;
		    }
    	}
		   
		    script = query;
		    maxScript = maxQuery; 
	    });
	    showAjaxLoader(false);
	    $('#queryScript,#oldQueryScript,#maxDatequery').val("");
	    $('#queryScript,#oldQueryScript').val(script);
	    $('#maxDatequery').val(maxScript);
	    
  	});
  	
  	$("#flatFileType").on('change', function() {
		var fileType = $("#flatFileType option:selected").val();
		if (fileType == "csv") {
			common.clearValidations([ "#delimeter" ]);
			$("#delimeter").val(",");
			$(".delimeter-block").show();
		} else {
			$(".delimeter-block").hide();
		}
	});
  
  	 $("#historicalLoad").click(function(e){ 
		 if($(this).is(":checked")){
			$("#historicalFromDate,#historicalToDate").val("");
			$("#loadInterval").val("0");
			$("#il_incremental_update, #default").attr('checked',false);
			$("#historicalLoadDiv").show(); 
			var ilid = $("#iLName").val();
			 var connectionId = $("#existingConnections").val();
			 var userID = $("#userID").val();
				var token = $("meta[name='_csrf']").attr("content");
				var header = $("meta[name='_csrf_header']").attr("content");
				headers[header] = token;
			 showAjaxLoader(true);
			 var url_defaultILincrementalquery = "/app/user/"+userID+"/package/defaultILHistoricalLoadQuery/"+ilid+"/"+connectionId;
			 var myAjax = common.loadAjaxCall(url_defaultILincrementalquery,'GET','',headers);
			    myAjax.done(function(result) {
			    	showAjaxLoader(false);
			    	if(result != null){
			    		console.log("result.object:",result.object);
			    		$("#queryScript, #oldQueryScript").val("");
			    		$("#queryScript, #oldQueryScript").val(result.object);
			    	}else{
			    		$("#queryScript").val("");
			    	}
			    });
			 
		 }else{
			 $("#existingConnections").trigger("change");
		 }
});
  	 
  	 $("#replace_all").click(function(){
  		 common.clearValidations(["#replace_variable"]);
  		var replaceVar = $('#replace_variable').val().toLowerCase();
  		if(replaceVar == ''){ 
	    	common.showcustommsg("#replace_variable", globalMessage['anvizent.package.label.pleaseEnterVariable'] ,"#replace_variable");
			status = false;
  		}else{
  		    $("#replaceAllAlert").modal("show");
  		}
  	 });
  	 
  	 $("#confirmReplaceAll").click(function(){
  		$("#undo").show();
  		var queryScript = $('#queryScript').val().toLowerCase();
  		var maxDateQueryScript = $('#maxDatequery').val().toLowerCase();
  		var replaceVar = $('#replace_variable').val().toLowerCase();
  		var replaceWith = $('#replace_with').val();
  		var status = true;
  		if(replaceVar == ''){ 
	    	common.showcustommsg("#replace_variable", globalMessage['anvizent.package.label.pleaseEnterVariable'] ,"#replace_variable");
			status = false;
  		}
  		
  		if(!status){
  			return false;
  		}
  		queryScript=queryScript.replace(new RegExp(replaceVar, 'g'), replaceWith);
  		maxDateQueryScript=maxDateQueryScript.replace(new RegExp(replaceVar, 'g'), replaceWith);
  		$('#queryScript').val(queryScript);
  		$('#maxDatequery').val(maxDateQueryScript);
  		$("#replaceAllAlert").modal("hide");
  	 });
  	 
  	 $("#undo").click(function(){
  		var queryScript = $('#oldQueryScript').val();
  		var maxDateQuery = $('#oldMaxDateQuery').val();
  		$('#queryScript').val(queryScript);
  		$('#maxDatequery').val(maxDateQuery);
  		$("#undo").hide();
  		$('#replace_variable').val("");
  	    $('#replace_with').val("");
  	 });

  	 $("#default").click(function(e){
  		 if($(this).is(":checked")){
  			$("#il_incremental_update, #historicalLoad").attr('checked',false);
  			$("#historicalLoadDiv").hide();
  		 }
  	 });
  	 
  	$(document).on("click","#viewAuthTypeDetails",function(){ 
  		
  		var authtype = $("#authType option:selected").val().trim();
  		
  		if( authtype === 'Basic Auth'){
  			$("#authenticationBasicAuthTypePopUp").modal('show');
  		}else if(authtype === 'Digest Auth'){
  			$("#authenticationDigestAuthTypePopUp").modal('show');
  		}else if(authtype === 'OAuth1'){
  			$("#authenticationTypeOAuth1PopUp").modal('show');
  		}else if(authtype === 'OAuth2'){
  			$("#authenticationOAuth2TypePopUp").modal('show');
  		}else if(authtype === 'Hawk Authentication'){
  			$("#authenticationHawkTypePopUp").modal('show');
  		}else if(authtype ===  'AWS Signature'){
  			$("#authenticationAwsSignatureTypePopUp").modal('show');
  		} 
  		
  	});
  	 
  	$('.close-accordian').on('click', function(){ 
		$(this).parents(".il-block").prev().find(".inner-tbl").trigger( "click" );
	});
	 
	$(document).on("click","#saveWsApi",function(){ 	
		var il_id=$("#iLName" ).val();
		var apiDiv = $("div.wsApiDetailsDiv");
 		var userID = $("#userID").val();
 		var wsApiName = apiDiv.find(".wsApiName").val();
 		var wsApiUrl = apiDiv.find(".wsApiUrl").val();
 		var wssoapBodyElement = apiDiv.find("#soapBodyElement").val();
 		// var wsApiBaseUrl = apiDiv.find(".wsApiBaseUrl").val();
 		var wsApiBaseUrlRequired = apiDiv.find(".wsApiBaseUrlRequired").is(':checked') ? true : false;
 		var methodType = apiDiv.find(".wsApiMethodType:checked").val();
 		var wsApiResponseObjName = apiDiv.find(".wsApiResponseObjName").val();
 		var responseColumnObjName =  apiDiv.find(".wsApiResponseColumnObjName").val();
 		var authenticationType = "";
 		var wsConId = $("#existingWebServices").val();
 		var iLId=$("#iLName option:selected").val();
 		var userID = $("#userID").val(); 
		var industryId=$("#industryId").val();
		var packageId= $("#packageId").val() ;
	 
		  var status = standardPackage.validateJoinWebServiceApi();
	      if(!status){ return status;  }
	      
		 var pathParamValueDetails = {};
 		 apiDiv.find(".wsManualSubUrlDiv").each(function(i,val){
 			var pathParamValueObj = {};
 			var valObj = $(val);
 			
 			var wsUrlPathParamVar = valObj.find(".wsUrlPathParam").text();
 			var pathParamValTypeVar = valObj.find(".pathParamValType:checked").val();
 			var manualParamValueVar = valObj.find(".manualParamValue").val();
 			var subApiUrlVar = valObj.find(".wsSubApiUrl").val();
 			var wsApiBaseUrlRequiredForSubUrlVar =  valObj.find(".wsSubApiBaseUrlRequired").is(":checked") ? true : false;
 			var subApiMethodTypeVar = valObj.find(".wsSubApiMethodType:checked").val();
 			var subApiResponseObjectVar = valObj.find(".wsSubApiResponseObjName").val();
 			pathParamValueObj["paramName"] = wsUrlPathParamVar;
 			pathParamValueObj["valueType"] = pathParamValTypeVar;
 			
 			
 			if (pathParamValTypeVar == "M") {
 				manualParamValueVar = valObj.find(".manualParamValue").val();
 				pathParamValueObj["manualParamValue"] = manualParamValueVar;
 			} else if (pathParamValTypeVar == "S") {
 				pathParamValueObj["subUrldetailsurl"] = subApiUrlVar;
 				pathParamValueObj["subUrldetailsmethodType"] = subApiMethodTypeVar;
 				pathParamValueObj["subUrldetailsresponseObjName"] = subApiResponseObjectVar;
 				pathParamValueObj["baseUrlRequired"] = wsApiBaseUrlRequiredForSubUrlVar;
 				
 				var subUrlPaginationRequired = valObj.find(".subUrlPaginationRequired:checked").val() == 'yes' ? true : false ;
  		 		var subUrlPaginationOffSetType = valObj.find(".subUrlPaginationOffSetType");
  		 		var subUrlPaginationDateType = valObj.find(".subUrlPaginationDateType");
  		 		var subUrlPaginationHypermediaType = valObj.find(".subUrlPaginationHypermediaType");
  		 		var subUrlPaginationType = valObj.find(".subUrlPaginationOffsetDateType:checked").val();
  				if ( subUrlPaginationRequired ) { 
					var subUrlPaginationParamType = valObj.find(".subUrlPaginationParamType").val();
					pathParamValueObj["subUrlPaginationParamType"] = subUrlPaginationParamType;
					pathParamValueObj["subUrlPaginationRequired"] = subUrlPaginationRequired;
					if(subUrlPaginationType == 'offset'){
						pathParamValueObj['subUrlPaginationType']  =  subUrlPaginationType;
						var subUrlPaginationOffSetRequestParamName = subUrlPaginationOffSetType.find('.subUrlPaginationOffSetRequestParamName').val();
						var subUrlPaginationOffSetRequestParamValue = subUrlPaginationOffSetType.find('.subUrlPaginationOffSetRequestParamValue').val();
						var subUrlPaginationLimitRequestParamName = subUrlPaginationOffSetType.find('.subUrlPaginationLimitRequestParamName').val();
						var subUrlPaginationLimitRequestParamValue = subUrlPaginationOffSetType.find('.subUrlPaginationLimitRequestParamValue').val();
						pathParamValueObj['subUrlPaginationOffSetRequestParamName']  =  subUrlPaginationOffSetRequestParamName;
						pathParamValueObj['subUrlPaginationOffSetRequestParamValue']  =  subUrlPaginationOffSetRequestParamValue;
						pathParamValueObj['subUrlPaginationLimitRequestParamName']  =  subUrlPaginationLimitRequestParamName;
						pathParamValueObj['subUrlPaginationLimitRequestParamValue']  =  subUrlPaginationLimitRequestParamValue;
					}else if(subUrlPaginationType == 'date'){
						pathParamValueObj['subUrlPaginationType']  =  subUrlPaginationType;
						var subUrlPaginationStartDateParam = subUrlPaginationDateType.find('.subUrlPaginationStartDateParam').val();
						var subUrlPaginationEndDateParam = subUrlPaginationDateType.find('.subUrlPaginationEndDateParam').val();
						var subUrlPaginationStartDate = subUrlPaginationDateType.find('.subUrlPaginationStartDate').val();
						var subUrlPaginationDateRange = subUrlPaginationDateType.find('.subUrlPaginationDateRange').val();
						pathParamValueObj['subUrlPaginationStartDateParam']  =  subUrlPaginationStartDateParam;
						pathParamValueObj['subUrlPaginationEndDateParam']  =  subUrlPaginationEndDateParam;
						pathParamValueObj['subUrlPaginationStartDate']  =  subUrlPaginationStartDate;
						pathParamValueObj['subUrlPaginationDateRange']  =  subUrlPaginationDateRange;
					} else {
						pathParamValueObj['subUrlPaginationType']  =  subUrlPaginationType;
						var subUrlPaginationHyperLinkPattern = subUrlPaginationHypermediaType.find('.subUrlPaginationHyperLinkPattern').val();
						var subUrlPaginationHypermediaPageLimit = subUrlPaginationHypermediaType.find('.subUrlPaginationHypermediaPageLimit').val();
						pathParamValueObj['subUrlPaginationHyperLinkPattern']  =  subUrlPaginationHyperLinkPattern;
						pathParamValueObj['subUrlPaginationHypermediaPageLimit']  =  subUrlPaginationHypermediaPageLimit;
					}
  				}else{
  					pathParamValueObj["subUrlPaginationRequired"] = subUrlPaginationRequired;
  				}
 				
 			} else {
 				common.showcustommsg(valObj.find(".pathParamValType"),"Please select Path param response from type");
 				status = false;
 				return;
 			}
 			
 			pathParamValueDetails[wsUrlPathParamVar] = pathParamValueObj;
 			
 			
 		});
 		 
 		var requsetParamValue = [];
 	     
 		 apiDiv.find(".wsApiRequestParam").each(function(i,val){
 			var  requestParamValueDetails = {} 
 			var valObj = $(val);
  			var requestParamName = valObj.find(".wsApiRequestParamName").val();
  			var requestParamValue = valObj.find(".wsApiRequestParamValue").val();
  			
  			requestParamValueDetails["paramName"] = requestParamName;
  			requestParamValueDetails["paramValue"] = requestParamValue;
  			
  			requsetParamValue.push(requestParamValueDetails);
  		 
  		});
 		 
 		 var bodyParamValue = [];
 	     
 		 apiDiv.find(".wsApiBodyParam").each(function(i,val){
 			var  bodyParamValueDetails = {} 
 			var valObj = $(val);
  			var requestParamName = valObj.find(".wsApiRequestParamName").val();
  			var requestParamValue = valObj.find(".wsApiRequestParamValue").val();
  			
  			bodyParamValueDetails["paramName"] = requestParamName;
  			bodyParamValueDetails["paramValue"] = requestParamValue;
  			
  			bodyParamValue.push(bodyParamValueDetails);
  		 
  		});
 		 
 		var paginationRequestParamsArray = [];
	    var paginationRequired = apiDiv.find(".paginationRequired:checked").val() == 'yes' ? true : false ;
	    var paginationOffSetType = apiDiv.find(".paginationOffSetType");
 		var paginationType = apiDiv.find(".paginationOffsetDateType:checked").val();
 		var paginationDateType = apiDiv.find(".paginationDateType");
 		var paginationHypermediaType = apiDiv.find(".paginationHypermediaType");
		if ( paginationRequired ) {
			var paginationRequestParamsObject = {};
			var paginationParamType = apiDiv.find(".paginationParamType").val();
			paginationRequestParamsObject["paginationParamType"] = paginationParamType;
			 
		  if(paginationType == 'offset'){
			    
			    var paginationOffSetRequestParamName = paginationOffSetType.find(".paginationOffSetRequestParamName").val();
				var paginationOffSetRequestParamValue = paginationOffSetType.find(".paginationOffSetRequestParamValue").val();
				var paginationLimitRequestParamName = paginationOffSetType.find(".paginationLimitRequestParamName").val();
				var paginationLimitRequestParamValue = paginationOffSetType.find(".paginationLimitRequestParamValue").val();
				var paginationObjectName =  paginationOffSetType.find(".paginationObjectName").val();
				var paginationSearchId =  paginationOffSetType.find(".paginationSearchId").val();
				var PaginationSoapBody =  paginationOffSetType.find(".PaginationSoapBody").val();

				
				paginationRequestParamsObject['paginationOffSetRequestParamName']  =  paginationOffSetRequestParamName;
				paginationRequestParamsObject['paginationOffSetRequestParamValue'] = paginationOffSetRequestParamValue;
				paginationRequestParamsObject['paginationLimitRequestParamName'] = paginationLimitRequestParamName;
				paginationRequestParamsObject['paginationLimitRequestParamValue']  =  paginationLimitRequestParamValue;
				paginationRequestParamsObject['paginationObjectName']  =  paginationObjectName;
				paginationRequestParamsObject['paginationSearchId']  =  paginationSearchId;
				paginationRequestParamsObject['PaginationSoapBody']  =  PaginationSoapBody;
			}else if(paginationType == 'date'){
	
				var paginationStartDateParam = paginationDateType.find('.paginationStartDateParam').val();
				var paginationEndDateParam = paginationDateType.find('.paginationEndDateParam').val();
				var paginationStartDate = paginationDateType.find('.paginationStartDate').val();
				var paginationDateRange = paginationDateType.find('.paginationDateRange').val();
				
				paginationRequestParamsObject['paginationStartDateParam']  =  paginationStartDateParam;
				paginationRequestParamsObject['paginationEndDateParam']  =  paginationEndDateParam;
				paginationRequestParamsObject['paginationStartDate']  =  paginationStartDate;
				paginationRequestParamsObject['paginationDateRange']  =  paginationDateRange;
			
			} else {
				var paginationHyperLinkPattern = paginationHypermediaType.find('.paginationHyperLinkPattern').val();
				var paginationHypermediaPageLimit = paginationHypermediaType.find('.paginationHypermediaPageLimit').val();
				
				paginationRequestParamsObject['paginationHyperLinkPattern']  =  paginationHyperLinkPattern;
				paginationRequestParamsObject['paginationHypermediaPageLimit']  =  paginationHypermediaPageLimit;
			}
		  if(!$.isEmptyObject(paginationRequestParamsObject))
				paginationRequestParamsArray.push(paginationRequestParamsObject);
		}
		
 		var inclUpdateParamsArray = [];
 		var incrementalUpdate = apiDiv.find(".incrementalUpdate").prop("checked");
		var incrementalUpdateDetailsDiv = apiDiv.find(".incrementalUpdateDetailsDiv");
		if ( incrementalUpdate ) {
			var incrementalUpdateParamName = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamName").val();
			var incrementalUpdateParamvalue = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamvalue").val();
			var incrementalUpdateParamColumnName = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamColumnName").val();
			var incrementalUpdateParamType = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamType").val();
			
			
			var inclUpdateParamsObject = {};
			inclUpdateParamsObject['incrementalUpdateParamName'] = incrementalUpdateParamName;
			inclUpdateParamsObject['incrementalUpdateParamvalue'] = incrementalUpdateParamvalue;
			inclUpdateParamsObject['incrementalUpdateParamColumnName'] = incrementalUpdateParamName;
			inclUpdateParamsObject['incrementalUpdateParamType'] = incrementalUpdateParamType;
			
			if(!$.isEmptyObject(inclUpdateParamsObject))
				inclUpdateParamsArray.push(inclUpdateParamsObject);
		}
 		 
		var selectedData = {
					  url:wsApiUrl,
					 // baseUrl:wsApiBaseUrl,
					  soapBodyElement: wssoapBodyElement,
					  baseUrlRequired:wsApiBaseUrlRequired,
					  requestMethod:methodType,
					  apiName:wsApiName,
					  ilId:il_id,
					  industryId:industryId,
					  packageId:packageId ,
				      responseObjName:wsApiResponseObjName,
				      responseColumnObjName:responseColumnObjName,
				      wsConId : wsConId,
				      ilId :iLId,
 				      userId : userID,
 				      apiPathParams:JSON.stringify(pathParamValueDetails),
 				      requestParameters:JSON.stringify(requsetParamValue),
 				      paginationRequired:paginationRequired,
 				      paginationType:paginationType,
 					  paginationRequestParamsData:JSON.stringify(paginationRequestParamsArray),
 					  incrementalUpdate:incrementalUpdate,
 					  incrementalUpdateparamdata:JSON.stringify(inclUpdateParamsArray),
 					  apiBodyParams:JSON.stringify(bodyParamValue),
 					  validateOrPreview:true
 					
			       }
			console.log("selectedData:",selectedData);
		var url_saveWebService =  "/app/user/"+userID+"/package/saveWsApi";
		var token = $("meta[name='_csrf']").attr("content");
		var header = $("meta[name='_csrf_header']").attr("content");
		headers[header] = token;
	        showAjaxLoader(true);
		    var myAjax = common.postAjaxCall(url_saveWebService,'POST',selectedData,headers);
		    myAjax.done(function(result) {
		    	showAjaxLoader(false);
		    	$("#mapFileWithIL").val(globalMessage['anvizent.package.label.mapFileHeadersUpload']).prop('disabled',false);
				if(result != null){
	    		  if(result.hasMessages){ 
	    			  if(result.messages[0].code == "ERROR") {
							 var  messages=[{
								  code : result.messages[0].code,
								  text : result.messages[0].text
							  }];
							
							 common.showcustommsg("#fileUpload", result.messages[0].text);
							 return false;
	    			  }
	    			}	 
					$("#fileMappingWithILTable").find('th.iLName').text($("#iLName option:selected").text());
					$("#fileMappingWithILTable").find('th.originalFileName').text(result.object["originalFileName"]);
					fileMappingWithILTable.updateFileMappingWithILTable(result,"standard");
				}else{
					 if(result.messages[0].code == "ERROR") {
							 var  messages=[{
								  code : result.messages[0].code,
								  text : result.messages[0].text
							  }];
						     common.showErrorAlert(result.messages[0].text);
							 return false;
	    			  }
	    			}	
					 
				 
		    });
	   });
		
 
	    $(document).on('click', '#joinWsApi,#wsFormatResponse', function(){
	    	 var status = standardPackage.validateJoinWebServiceApi();
	         if(!status){ return status;  }
		    	$("#joinWebServiceAlert").modal('show');
	    });
 
	    $(document).on("click","#confirmjoinWebService",function(){ 	

	    	 var apiDiv = $("div.wsApiDetailsDiv");
			 var userID = $("#userID").val(); 
			 var industryId=$("#industryId").val();
			 var packageId= $("#packageId").val() ;
			 var tokenName = $("#tokenName").val(); 
			 var webserviceconid=$('#existingWebServices option:selected').val();
			 var iLId=$("#iLName option:selected").val();
			 var authenticationType = $("#authenticationType").val();
			 var dlId = $("#dLId").val();
			 
              var webServiceJoin = [];
  	 		  var wsConnectionId  = $("#existingWebServices").val();
  	 		  
  			 $('#wsdefaultApiDetails').find('.wsApiDetailsDiv').each(function(i, obj) {
  			    	
  					var apiName = $(this).find(".wsApiName").val(); 
  				    var apiUrl = $(this).find(".wsApiUrl").val();
  				    var wsApiUrl = apiDiv.find(".wsApiUrl").val();
  				    var wssoapBodyElement = apiDiv.find("#soapBodyElement").val();
  				   // var wsApiBaseUrl = apiDiv.find(".wsApiBaseUrl").val();
  		 		    var wsApiBaseUrlRequired = apiDiv.find(".wsApiBaseUrlRequired").is(':checked') ? true : false;
  			 	    var webServiceMethodType = $(this).find('input[class=wsApiMethodType]').is(":checked");
  				    var webServiceMethodTypeVal = $(this).find('input[class=wsApiMethodType]:checked').val();
  				    var responseObjectName =  $(this).find(".wsApiResponseObjName").val();
  				    var responseColumnObjectName = $(this).find(".wsApiResponseColumnObjName").val();
  				    
  				    var pathParamValueDetails = {};
  		 	        apiDiv.find(".wsManualSubUrlDiv").each(function(i,val){
  		 			var pathParamValueObj = {};
  		 			var valObj = $(val);
  		 			
  		 			var wsUrlPathParamVar = valObj.find(".wsUrlPathParam").text();
  		 			var pathParamValTypeVar = valObj.find(".pathParamValType:checked").val();
  		 			var manualParamValueVar = valObj.find(".manualParamValue").val();
  		 			var subApiUrlVar = valObj.find(".wsSubApiUrl").val();
  		 		    var wsApiBaseUrlRequiredForSubUrlVar =  valObj.find(".wsSubApiBaseUrlRequired").is(":checked") ? true : false;
  		 			var subApiMethodTypeVar = valObj.find(".wsSubApiMethodType:checked").val();
  		 			var subApiResponseObjectVar = valObj.find(".wsSubApiResponseObjName").val();
  		 			pathParamValueObj["paramName"] = wsUrlPathParamVar;
  		 			pathParamValueObj["valueType"] = pathParamValTypeVar;
  		 			
  		 			
  		 			if (pathParamValTypeVar == "M") {
  		 				manualParamValueVar = valObj.find(".manualParamValue").val();
  		 				pathParamValueObj["manualParamValue"] = manualParamValueVar;
  		 			} else if (pathParamValTypeVar == "S") {
  		 				pathParamValueObj["subUrldetailsurl"] = subApiUrlVar;
  		 				pathParamValueObj["subUrldetailsmethodType"] = subApiMethodTypeVar;
  		 				pathParamValueObj["subUrldetailsresponseObjName"] = subApiResponseObjectVar;
  		 				pathParamValueObj["baseUrlRequired"] = wsApiBaseUrlRequiredForSubUrlVar;
  		 				
  		 				var subUrlPaginationRequired = valObj.find(".subUrlPaginationRequired:checked").val() == 'yes' ? true : false ;
  		  		 		var subUrlPaginationOffSetType = valObj.find(".subUrlPaginationOffSetType");
  		  		 		var subUrlPaginationDateType = valObj.find(".subUrlPaginationDateType");
  		  		 	    var subUrlPaginationType = valObj.find(".subUrlPaginationOffsetDateType:checked").val();
  		  				if ( subUrlPaginationRequired ) { 
  							var subUrlPaginationParamType = valObj.find(".subUrlPaginationParamType").val();
  							pathParamValueObj["subUrlPaginationParamType"] = subUrlPaginationParamType;
  							pathParamValueObj["subUrlPaginationRequired"] = subUrlPaginationRequired;
  						  if(subUrlPaginationType == 'offset'){
  							pathParamValueObj['subUrlPaginationType']  =  subUrlPaginationType;
  							var subUrlPaginationOffSetRequestParamName = subUrlPaginationOffSetType.find('.subUrlPaginationOffSetRequestParamName').val();
  							var subUrlPaginationOffSetRequestParamValue = subUrlPaginationOffSetType.find('.subUrlPaginationOffSetRequestParamValue').val();
  							var subUrlPaginationLimitRequestParamName = subUrlPaginationOffSetType.find('.subUrlPaginationLimitRequestParamName').val();
  							var subUrlPaginationLimitRequestParamValue = subUrlPaginationOffSetType.find('.subUrlPaginationLimitRequestParamValue').val();
  							pathParamValueObj['subUrlPaginationOffSetRequestParamName']  =  subUrlPaginationOffSetRequestParamName;
  							pathParamValueObj['subUrlPaginationOffSetRequestParamValue']  =  subUrlPaginationOffSetRequestParamValue;
  							pathParamValueObj['subUrlPaginationLimitRequestParamName']  =  subUrlPaginationLimitRequestParamName;
  							pathParamValueObj['subUrlPaginationLimitRequestParamValue']  =  subUrlPaginationLimitRequestParamValue;
  							}else{
  								pathParamValueObj['subUrlPaginationType']  =  subUrlPaginationType;
  								var subUrlPaginationStartDateParam = subUrlPaginationDateType.find('.subUrlPaginationStartDateParam').val();
  								var subUrlPaginationEndDateParam = subUrlPaginationDateType.find('.subUrlPaginationEndDateParam').val();
  								var subUrlPaginationStartDate = subUrlPaginationDateType.find('.subUrlPaginationStartDate').val();
  								var subUrlPaginationDateRange = subUrlPaginationDateType.find('.subUrlPaginationDateRange').val();
  								pathParamValueObj['subUrlPaginationStartDateParam']  =  subUrlPaginationStartDateParam;
  								pathParamValueObj['subUrlPaginationEndDateParam']  =  subUrlPaginationEndDateParam;
  								pathParamValueObj['subUrlPaginationStartDate']  =  subUrlPaginationStartDate;
  								pathParamValueObj['subUrlPaginationDateRange']  =  subUrlPaginationDateRange;
  							}
  		  				}else{
  		  					pathParamValueObj["subUrlPaginationRequired"] = subUrlPaginationRequired;
  		  				}
  		 			} else {
  		 				common.showcustommsg(valObj.find(".pathParamValType"),"Please select Path param response from type");
  		 				status = false;
  		 				return;
  		 			}
  		 			
  		 			pathParamValueDetails[wsUrlPathParamVar] = pathParamValueObj;
  		 			
  		 		 });
  				    
  		 	     var requsetParamValue = [];
  		  	     
  		  		 apiDiv.find(".wsApiRequestParam").each(function(i,val){
  		  			var  requestParamValueDetails = {} 
  		  			var valObj = $(val);
  		   			var requestParamName = valObj.find(".wsApiRequestParamName").val();
  		   			var requestParamValue = valObj.find(".wsApiRequestParamValue").val();
  		   			
  		   			requestParamValueDetails["paramName"] = requestParamName;
  		   			requestParamValueDetails["paramValue"] = requestParamValue;
  		   			
  		   			requsetParamValue.push(requestParamValueDetails);
  		   		 
  		   		});
  		  		 
  		  		 var bodyParamValue = [];
  		  	     
  		  		 apiDiv.find(".wsApiBodyParam").each(function(i,val){
  		  			var  bodyParamValueDetails = {} 
  		  			var valObj = $(val);
  		   			var requestParamName = valObj.find(".wsApiRequestParamName").val();
  		   			var requestParamValue = valObj.find(".wsApiRequestParamValue").val();
  		   			
  		   			bodyParamValueDetails["paramName"] = requestParamName;
  		   			bodyParamValueDetails["paramValue"] = requestParamValue;
  		   			
  		   			bodyParamValue.push(bodyParamValueDetails);
  		   		 
  		   		});
  		  		 
  		  		var paginationRequestParamsArray = [];
  			    var paginationRequired = apiDiv.find(".paginationRequired:checked").val() == 'yes' ? true : false ;
  			    var paginationOffSetType = apiDiv.find(".paginationOffSetType");
  		 		var paginationDateType = apiDiv.find(".paginationDateType");
  		 		var paginationHypermediaType = apiDiv.find(".paginationHypermediaType");
  		 		var paginationType = apiDiv.find(".paginationOffsetDateType:checked").val();
  				if ( paginationRequired ) { 
  					var paginationRequestParamsObject = {};
  				var paginationParamType = apiDiv.find(".paginationParamType").val();
  				paginationRequestParamsObject["paginationParamType"] = paginationParamType;
  				 
  			  if(paginationType == 'offset'){
  				    
  				    var paginationOffSetRequestParamName = paginationOffSetType.find(".paginationOffSetRequestParamName").val();
  					var paginationOffSetRequestParamValue = paginationOffSetType.find(".paginationOffSetRequestParamValue").val();
  					var paginationLimitRequestParamName = paginationOffSetType.find(".paginationLimitRequestParamName").val();
  					var paginationLimitRequestParamValue = paginationOffSetType.find(".paginationLimitRequestParamValue").val();
  					var paginationObjectName =  paginationOffSetType.find(".paginationObjectName").val();
					var paginationSearchId =  paginationOffSetType.find(".paginationSearchId").val();
					var PaginationSoapBody =  paginationOffSetType.find(".PaginationSoapBody").val();
  					
  					paginationRequestParamsObject['paginationOffSetRequestParamName']  =  paginationOffSetRequestParamName;
  					paginationRequestParamsObject['paginationOffSetRequestParamValue'] = paginationOffSetRequestParamValue;
  					paginationRequestParamsObject['paginationLimitRequestParamName'] = paginationLimitRequestParamName;
  					paginationRequestParamsObject['paginationLimitRequestParamValue']  =  paginationLimitRequestParamValue;
  					paginationRequestParamsObject['paginationObjectName']  =  paginationObjectName;
  					paginationRequestParamsObject['paginationSearchId']  =  paginationSearchId;
  					paginationRequestParamsObject['PaginationSoapBody']  =  PaginationSoapBody;
  				}else  if(paginationType == 'date'){

  					 
  					var paginationStartDateParam = paginationDateType.find('.paginationStartDateParam').val();
  					var paginationEndDateParam = paginationDateType.find('.paginationEndDateParam').val();
  					var paginationStartDate = paginationDateType.find('.paginationStartDate').val();
  					var paginationDateRange = paginationDateType.find('.paginationDateRange').val();
  					
  					paginationRequestParamsObject['paginationStartDateParam']  =  paginationStartDateParam;
  					paginationRequestParamsObject['paginationEndDateParam']  =  paginationEndDateParam;
  					paginationRequestParamsObject['paginationStartDate']  =  paginationStartDate;
  					paginationRequestParamsObject['paginationDateRange']  =  paginationDateRange;
  				
  				} else {
  					var paginationHyperLinkPattern = paginationHypermediaType.find('.paginationHyperLinkPattern').val();
					var paginationHypermediaPageLimit = paginationHypermediaType.find('.paginationHypermediaPageLimit').val();
					
					paginationRequestParamsObject['paginationHyperLinkPattern']  =  paginationHyperLinkPattern;
					paginationRequestParamsObject['paginationHypermediaPageLimit']  =  paginationHypermediaPageLimit;
  				}
  			  if(!$.isEmptyObject(paginationRequestParamsObject))
  					paginationRequestParamsArray.push(paginationRequestParamsObject);
  				}
  		  		 
  		  		 
  		  		var inclUpdateParamsArray = [];
  		  		var incrementalUpdate = apiDiv.find(".incrementalUpdate").prop("checked");
  				var incrementalUpdateDetailsDiv = apiDiv.find(".incrementalUpdateDetailsDiv");
  				if ( incrementalUpdate ) {
  					var incrementalUpdateParamName = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamName").val();
  					var incrementalUpdateParamvalue = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamvalue").val();
  					var incrementalUpdateParamColumnName = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamColumnName").val();
  					var incrementalUpdateParamType = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamType").val();
  					
  					
  					var inclUpdateParamsObject = {};
  					inclUpdateParamsObject['incrementalUpdateParamName'] = incrementalUpdateParamName;
  					inclUpdateParamsObject['incrementalUpdateParamvalue'] = incrementalUpdateParamvalue;
  					inclUpdateParamsObject['incrementalUpdateParamColumnName'] = incrementalUpdateParamName;
  					inclUpdateParamsObject['incrementalUpdateParamType'] = incrementalUpdateParamType;
  					
  					if(!$.isEmptyObject(inclUpdateParamsObject))
  						inclUpdateParamsArray.push(inclUpdateParamsObject);
  				}
  		  		 
  				    var webserviceJoinInfo = {
  					   		  webServiceUrl:apiUrl,
  					   		 soapBodyElement:wssoapBodyElement,
  					   		  // baseUrl:wsApiBaseUrl,
  							  baseUrlRequired:wsApiBaseUrlRequired,
  					   		  webServiceMethodType:webServiceMethodTypeVal,
  					   		  responseObjectName:responseObjectName,
  					   		  responseColumnObjectName : responseColumnObjectName,
  					   		  webServiceApiName:apiName,
  					   		  apiPathParams:JSON.stringify(pathParamValueDetails),
  					   		  apiRequestParams:JSON.stringify(requsetParamValue),
  					   	      paginationRequired:paginationRequired,
  					   	      paginationType:paginationType,
  					   	      paginationRequestParamsData:JSON.stringify(paginationRequestParamsArray),
  							  incrementalUpdate:incrementalUpdate,
  							  incrementalUpdateparamdata:JSON.stringify(inclUpdateParamsArray),
  							  apiBodyParams:JSON.stringify(bodyParamValue),
  							  validateOrPreview:true
  					   	}
  				    
  				 	webServiceJoin.push(webserviceJoinInfo);
  				   
  	          });
  			   	
  			 
			var selectedData = {
					  ilId:iLId,
					  industryId:industryId,
					  packageId:packageId ,
					  wsConId : wsConnectionId,
				      userId : userID,
				      webServiceJoin:webServiceJoin
			         }
			 
			var url_joinWebService = "/app/user/"+userID+"/package/joinAndSaveWsApi";
			var token = $("meta[name='_csrf']").attr("content");
			var header = $("meta[name='_csrf_header']").attr("content");
			headers[header] = token;
		        showAjaxLoader(true);
			    var myAjax = common.postAjaxCall(url_joinWebService,'POST',selectedData,headers);
			    myAjax.done(function(result) {
			    	showAjaxLoader(false);
					if(result != null){
		    		  if(result.hasMessages){ 
		    			  if(result.messages[0].code == "ERROR") {
								 common.showErrorAlert(result.messages[0].text);
								 return false;
							 
		    			  }else if(result.messages[0].code == "SUCCESS"){

								setTimeout(function() {
									window.location = adt.appContextPath+"/adt/package/customTempTablesForWebservice/"+packageId+"/"+industryId+"/"+iLId+"/"+webserviceconid+"/"+dlId;
								}, 50);
		    			  }
		    			}	 
					} 
			    });
			  
		 });
	    
	    
	 
 	$(document).on('click', '#createNewWebserviceConnection', function(){
 		 common.clearValidations(["#webServiceConnectionName","#webServiceAuthenticateUrl","#webServiceMethodType","#webServiceName","#webserviceDataSourceName",["#clientIdentifier","#callBackUrl","#webServiceAuthenticateUrl","#accessTokenUrl","#clientSecret"],".paramValue"]);
 		 $("#createNewWebservicePanel").show();
 		 $(".basicAuthenticationDiv").empty();
 		 $(".authenticationBodyParamsDiv").empty();
 		 $("#testWebServiceAuthenticate,#webServiceDetails,#webServiceDefaultMapingConnectionDetails,#wsdefaultApiDetails,#requiredApiRequestParameters,#wsHeaderDetailsDiv,#webServiceAuthenticateUrl,#webServiceBaseUrl, #baseUrlRequiredLable, #baseUrlRequired,#webServiceBaseUrlLable").hide();
 		 $("#webServiceName").val("0");
 		 $("#existingWebServices").val("0");
 		 $("#webserviceDataSourceName").val("0");
 		 $(".wsDataSourceOther").hide();
 		 $("#wsDataSourceOtherName").val("");
 		 $("#webServiceConnectionName").val("");
		 $('#authenticationTypeLable,#webServiceAuthenticateUrlLable,#webServiceMethodTypeLable,#saveNewWebserviceConnection,#oauth2AuthenticationDiv, .activeSatusBlock').hide();
		 $('#webServiceAuthenticationType,#webServiceAuthenticateUrl,#webServiceMethodType').text('');
		 
		 if(!isWebServicesPopulated){
			 standardPackage.populateWebServices(); 
		 }
		 
		 
	});
 	$(document).on('change', '#webServiceName', function(){
 			common.clearValidations(["#webServiceAuthenticateUrl","#webServiceMethodType","#webServiceName",["#clientIdentifier","#callBackUrl","#webServiceAuthenticateUrl","#accessTokenUrl","#clientSecret"],".paramValue"]);
		 
 		  $('#authenticationTypeLable,#webServiceAuthenticateUrlLable,#webServiceMethodTypeLable,#testWebServiceAuthenticate, .activeSatusBlock').hide();
		  $('#webServiceAuthenticationType,#webServiceAuthenticateUrl,#webServiceMethodType').text('');
		  $('#callBackUrl,#accessTokenUrl,#authTokenName,#clientIdentifier,#clientSecret,#grantType,#scope').val('');
		  
		  $('.basicAuthenticationDiv').empty();
 		   var userID = $("#userID").val(); 
 		   var templateId = $("#webServiceName option:selected").val();
 		   var getPathParams ='';
 		   var getHeaderKeyValue='';
 		   var authRequestParams='';
 		   if(templateId == 0){
 			   common.showErrorAlert(globalMessage['anvizent.package.message.pleasechoosewebservice']);
 			   return false; 		   
 		   }
 			var token = $("meta[name='_csrf']").attr("content");
			var header = $("meta[name='_csrf_header']").attr("content");
			headers[header] = token;
 		   var url_getWebServiceMasterById = "/app/user/"+userID+"/package/getWebserviceTempleteDetails/"+templateId;
 		   showAjaxLoader(true);
 		   var myAjax = common.loadAjaxCall(url_getWebServiceMasterById,'GET','',headers);
 		    myAjax.done(function(result) {
 		    	showAjaxLoader(false);
 		    	if(result != null && result.hasMessages ){
 		    		
 		    		if(result.messages[0].code == "SUCCESS"){
 		    			
 		    	    var webservice = result.object;
 		    	    
 		    	    if(webservice != null){
 		    	    	
 		    	    	$("#webServiceAuthenticateUrlLable,#webServiceMethodTypeLable,#authenticationTypeLable,#webServiceAuthenticateUrl, .activeSatusBlock,#webServiceBaseUrlLable,#webServiceBaseUrl,#baseUrlRequired,#baseUrlRequiredLable").show();
 		    	    	 
 		    	    	$("#webServiceAuthenticationType").text(webservice.webServiceAuthenticationTypes.authenticationType);
 		    	    	
 		    	    	$("#basicAuthenticationDivs").show();
 		    	    	if (webservice.webServiceAuthenticationTypes.id == 3) {
 		    	    		$("#basicAuthenticationDivs").hide();$(".oauth2AuthenticationDiv").hide();
 		    	    	}
 		    	    	$("#webServiceBaseUrl").val(webservice.baseUrl);
 		    	    	if(webservice.baseUrlRequired){
 		    	    		$("#baseUrlRequired").prop("checked",true);
 		    	    	}else{
 		    	    		$("#baseUrlRequired").prop("checked",false);
 		    	    	}
 		    	    	$("#webServiceAuthenticateUrl").val(webservice.authenticationUrl);
 		    	    	 
 	 		    		$("#webServiceMethodType").text(webservice.authenticationMethodType);
 	 		    		$("#webServiceAuthenticationType").attr("auth-type-id",webservice.webServiceAuthenticationTypes.id);
 	 		    		
                         var basicAuthenticationDiv = $("#basicAuthenticationDiv").empty();
                      
 	 		    		if(webservice.webServiceTemplateAuthRequestparams != null && webservice.webServiceTemplateAuthRequestparams != ''){
 	 		    			 authRequestParams = webservice.webServiceTemplateAuthRequestparams;
 	 		    			for(var i=0;i<authRequestParams.length;i++){
 	 		    				
 	 		    				var newRow = $("#authenticationParamsTemplateDiv").clone().removeAttr("id").show();
 	 		    				
 	 		    				if(webservice.webServiceAuthenticationTypes.id != 3 && i == 0 ){
 	 		    					newRow.find(".requestParamHeader").text(globalMessage['anvizent.package.label.requestParameters'] +" :");
    		                    }
 	 		    				newRow.find(".paramName").text(authRequestParams[i].paramName);
 	 		    				if ( authRequestParams[i].passwordType ) {
 	 		    					newRow.find(".paramValue").prop("type","password")
 	 		    				}
 	 		    				if (!authRequestParams[i].mandatory) {
 	 		    					newRow.find(".paramNameMandatory").remove();
 	 		    				}
 	 		    				
 	 		    				newRow.find(".paramValue").data("mandatory",authRequestParams[i].mandatory);
 	 		    				
 	 	 						basicAuthenticationDiv.append(newRow);
 	 	 		    		
 	 	 		    		 }
 	 		    		}
 	 		    		
 	 		    		var authenticationBodyParamsDiv = $("#authenticationBodyParamsDiv").empty();
 	 		    		
 	 		    		if(!$.isEmptyObject(webservice.authenticationBodyParams)){ 
 	 		    			
 	 		    	    var  apiBodyParams = $.parseJSON(webservice.authenticationBodyParams);
 	 		    	    
 	 		    		if(apiBodyParams != null && apiBodyParams != ''){
 	 		    			
	 		    			for(var i=0;i<apiBodyParams.length;i++){
	 		    				
	 		    				var newRow = $("#authenticationParamsTemplateDiv").clone().removeAttr("id").show();
	 		    				
	 		    				if(webservice.webServiceAuthenticationTypes.id != 3 && i == 0 ){
	 		    					newRow.find(".requestParamHeader").text(globalMessage['anvizent.package.label.requestBodyParameters']+" :");
   		                    }
	 		    				newRow.find(".paramName").text(apiBodyParams[i].paramName);
	 		    				if ( apiBodyParams[i].ispasswordField ) {
	 		    					newRow.find(".paramValue").prop("type","password")
	 		    				}
	 		    				if (!apiBodyParams[i].isMandatory) {
	 		    					newRow.find(".paramNameMandatory").remove();
	 		    				}
	 		    				
	 		    				newRow.find(".paramValue").data("mandatory",apiBodyParams[i].isMandatory);
	 		    				
	 		    				authenticationBodyParamsDiv.append(newRow);
	 	 		    		
	 	 		    		 }
	 		    		}
 		    	    }
 	 	 		    		if(webservice.authenticationUrl != null && webservice.authenticationUrl != ''){
 	 	 		    			
 	 	 		    		 getPathParams = standardPackage.getPathParams(webservice.authenticationUrl,"{#");
 	 	 		    	  
 	 	 	 		        for(var i=0;i<getPathParams.length;i++){
 	 	 	 		        	
 	 	 	 		        	var pathParamNameValueDiv = $("#pathParamNameValueDiv").clone().removeAttr("id").show();
			 	 	 		        if(i != 0){ 
			 	 	 		        	pathParamNameValueDiv.find("#pathParametersLable").text("");
			 	 	 		        }
			 	 	 		      pathParamNameValueDiv.find(".pathParamName").text(getPathParams[i]);
			 	 	 		      pathParamNameValueDiv.find(".pathParamValue").attr("data-path-param-name",getPathParams[i]);
			 	 	 		      
 		 					      basicAuthenticationDiv.append(pathParamNameValueDiv);
 		 		    		 }
 	 	 		    		 
 	 	 		    		}
 	 	 		       
 	 	 		    		if(webservice.apiAuthRequestHeaders != null && webservice.apiAuthRequestHeaders != ''){
 	 	 		    			
 	 	 		            getHeaderKeyValue = standardPackage.getPathParams(webservice.apiAuthRequestHeaders,"{#");	
	 	 		        
	 	 		            for(var i=0;i<getHeaderKeyValue.length;i++){
	 	 		        	   
	    		               var headerKeyValueDiv = $("#headerKeyValueDiv").clone().removeAttr("id").show();
		 	 	 		        if(i != 0){ 
		 	 	 		        	headerKeyValueDiv.find("#headerKeyValuesLable").text("");
		 	 	 		        }
		 	 	 		      headerKeyValueDiv.find(".headerKey").text(getHeaderKeyValue[i]);
		 	 	 		      headerKeyValueDiv.find(".headerValue").attr("data-path-param-name",getHeaderKeyValue[i]);
		 	 	 		      
	 					      basicAuthenticationDiv.append(headerKeyValueDiv); 
	 	 		    	 
	 		    		     }
 	 	 		    		}
 	 	 		    		
 	 	 		    		basicAuthenticationDiv.show();
 	 	 		    		authenticationBodyParamsDiv.show();
	 	 		         if(webservice.webServiceAuthenticationTypes.id == 2){
	 	 		         	$(".oauth2AuthenticationDiv").hide();
	 	 		        	
 	 	 		     	
 	 		    	 	} else if(webservice.webServiceAuthenticationTypes.id == 5){
 	 		    	 		var oauth2 = webservice.oAuth2;
 	 		    	 	    if(oauth2 != null && oauth2 != '' ){
 	 		    	 	    	$("#accessTokenUrl").val(oauth2.accessTokenUrl);
 	 	 		    	 		$("#callBackUrl").val(oauth2.redirectUrl);
 	 	 		    	 		$("#grantType").text(oauth2.grantType);
 	 		    	 	    }
 	 		    	 	    $(".tokensDiv").empty();
 	 		    	 		$(".oauth2AuthenticationDiv").show();
 	 		    	 	}
	 	 		         $("#testWebServiceAuthenticate").show();
 		    	    }
 			    	} else {
 				    	common.displayMessages(result.messages);
 			    	} 

 		    	} else {
 		    		var messages = [ {
 		    			code : globalMessage['anvizent.message.error.code'],
 						text : globalMessage['anvizent.package.label.unableToProcessYourRequest']
 					} ];
 		    		common.displayMessages(result.messages);
 		    	}
 		    });
			 
	});
 	
 	
        // test authentication for all services
		
 	$("#apiDetails").on('click', '.validateWsApi', function(){
 		
 		var apiDiv = $($(this).closest("div.wsApiDetailsDiv"));
 		var userID = $("#userID").val();
 		var selectedIlId = $("#iLName").val();
 		var wsApiName = apiDiv.find(".wsApiName").val();
 		var wsApiUrl = apiDiv.find(".wsApiUrl").val();
 		var wssoapBodyElement = apiDiv.find("#soapBodyElement").val();
 		// var wsApiBaseUrl = apiDiv.find(".wsApiBaseUrl").val();
 		var wsApiBaseUrlRequired = apiDiv.find(".wsApiBaseUrlRequired").is(':checked') ? true : false;
 		var methodType = apiDiv.find(".wsApiMethodType:checked").val();
 		var wsApiResponseObjName = apiDiv.find(".wsApiResponseObjName").val();
 		var wsApiResponseColumnObjName = apiDiv.find(".wsApiResponseColumnObjName").val();
 		var previewWsApi = apiDiv.find(".previewWsApi");
 		var addNewApi =  apiDiv.find(".addNewApi");
 		var verifiedStatus = $(this).parents(".multipleWebSerivceValidate").find(".verifiedStatus");
 		var verifiedStatusError = $(this).parents(".multipleWebSerivceValidate").find(".verifiedStatusError");
 		
 		
 		url_getAuthenticationObject = "/app/user/"+userID+"/package/validateWebService";
 		
 		  var status = standardPackage.validateWebServiceApi($(this));
 	      if(!status){ return status;  }
	       
 		 var pathParamValueDetails = {};
  		 apiDiv.find(".wsManualSubUrlDiv").each(function(i,val){
  			var pathParamValueObj = {};
  			var valObj = $(val);
  			
  			var wsUrlPathParamVar = valObj.find(".wsUrlPathParam").text();
  			var pathParamValTypeVar = valObj.find(".pathParamValType:checked").val();
  			var manualParamValueVar = valObj.find(".manualParamValue").val();
  			var subApiUrlVar = valObj.find(".wsSubApiUrl").val();
  			var wsApiBaseUrlRequiredForSubUrlVar = valObj.find(".wsSubApiBaseUrlRequired").is(":checked") ? true : false;
  			var subApiMethodTypeVar = valObj.find(".wsSubApiMethodType:checked").val();
  			var subApiResponseObjectVar = valObj.find(".wsSubApiResponseObjName").val();
  			pathParamValueObj["paramName"] = wsUrlPathParamVar;
  			pathParamValueObj["valueType"] = pathParamValTypeVar;
  			
  			if (pathParamValTypeVar == "M") {
  				manualParamValueVar = valObj.find(".manualParamValue").val();
  				pathParamValueObj["manualParamValue"] = manualParamValueVar;
  			} else if (pathParamValTypeVar == "S") {
  				pathParamValueObj["subUrldetailsurl"] = subApiUrlVar;
  				pathParamValueObj["subUrldetailsmethodType"] = subApiMethodTypeVar;
  				pathParamValueObj["subUrldetailsresponseObjName"] = subApiResponseObjectVar;
  				pathParamValueObj["baseUrlRequired"] = wsApiBaseUrlRequiredForSubUrlVar;
  				 
  		 		var subUrlPaginationRequired = valObj.find(".subUrlPaginationRequired:checked").val() == 'yes' ? true : false ;
  		 		var subUrlPaginationType = valObj.find(".subUrlPaginationOffsetDateType:checked").val();
  		 		var subUrlPaginationOffSetType = valObj.find(".subUrlPaginationOffSetType");
  		 		var subUrlPaginationDateType = valObj.find(".subUrlPaginationDateType");
  		 		var subUrlPaginationHypermediaType = valObj.find(".subUrlPaginationHypermediaType");
  		 		
  				if ( subUrlPaginationRequired ) { 
					var subUrlPaginationParamType = valObj.find(".subUrlPaginationParamType").val();
					pathParamValueObj["subUrlPaginationParamType"] = subUrlPaginationParamType;
					pathParamValueObj["subUrlPaginationRequired"] = subUrlPaginationRequired;
				  if(subUrlPaginationType == 'offset'){
					pathParamValueObj['subUrlPaginationType']  =  subUrlPaginationType;
					var subUrlPaginationOffSetRequestParamName = subUrlPaginationOffSetType.find('.subUrlPaginationOffSetRequestParamName').val();
					var subUrlPaginationOffSetRequestParamValue = subUrlPaginationOffSetType.find('.subUrlPaginationOffSetRequestParamValue').val();
					var subUrlPaginationLimitRequestParamName = subUrlPaginationOffSetType.find('.subUrlPaginationLimitRequestParamName').val();
					var subUrlPaginationLimitRequestParamValue = subUrlPaginationOffSetType.find('.subUrlPaginationLimitRequestParamValue').val();
					pathParamValueObj['subUrlPaginationOffSetRequestParamName']  =  subUrlPaginationOffSetRequestParamName;
					pathParamValueObj['subUrlPaginationOffSetRequestParamValue']  =  subUrlPaginationOffSetRequestParamValue;
					pathParamValueObj['subUrlPaginationLimitRequestParamName']  =  subUrlPaginationLimitRequestParamName;
					pathParamValueObj['subUrlPaginationLimitRequestParamValue']  =  subUrlPaginationLimitRequestParamValue;
					}else if(subUrlPaginationType == 'date'){
						pathParamValueObj['subUrlPaginationType']  =  subUrlPaginationType;
						var subUrlPaginationStartDateParam = subUrlPaginationDateType.find('.subUrlPaginationStartDateParam').val();
						var subUrlPaginationEndDateParam = subUrlPaginationDateType.find('.subUrlPaginationEndDateParam').val();
						var subUrlPaginationStartDate = subUrlPaginationDateType.find('.subUrlPaginationStartDate').val();
						var subUrlPaginationDateRange = subUrlPaginationDateType.find('.subUrlPaginationDateRange').val();
						pathParamValueObj['subUrlPaginationStartDateParam']  =  subUrlPaginationStartDateParam;
						pathParamValueObj['subUrlPaginationEndDateParam']  =  subUrlPaginationEndDateParam;
						pathParamValueObj['subUrlPaginationStartDate']  =  subUrlPaginationStartDate;
						pathParamValueObj['subUrlPaginationDateRange']  =  subUrlPaginationDateRange;
					} else {
						pathParamValueObj['subUrlPaginationType']  =  subUrlPaginationType;
						var subUrlPaginationHyperLinkPattern = subUrlPaginationHypermediaType.find('.subUrlPaginationHyperLinkPattern').val();
						var subUrlPaginationHypermediaPageLimit = subUrlPaginationHypermediaType.find('.subUrlPaginationHypermediaPageLimit').val();
						pathParamValueObj['subUrlPaginationHyperLinkPattern']  =  subUrlPaginationHyperLinkPattern;
						pathParamValueObj['subUrlPaginationHypermediaPageLimit']  =  subUrlPaginationHypermediaPageLimit;
					}
  				}else{
  					pathParamValueObj["subUrlPaginationRequired"] = subUrlPaginationRequired;
  				}
  			} else {
  				common.showcustommsg(valObj.find(".pathParamValType"),"Please select Path param response from type");
  				status = false;
  				return;
  			}
  			
  			pathParamValueDetails[wsUrlPathParamVar] = pathParamValueObj;
  			
  			
  		});
  	     var requsetParamValue = [];
  	     
  		 apiDiv.find(".wsApiRequestParam").each(function(i,val){
  			var  requestParamValueDetails = {} 
  			var valObj = $(val);
   			var requestParamName = valObj.find(".wsApiRequestParamName").val();
   			var requestParamValue = valObj.find(".wsApiRequestParamValue").val();
   			
   			requestParamValueDetails["paramName"] = requestParamName;
   			requestParamValueDetails["paramValue"] = requestParamValue;
   			
   			requsetParamValue.push(requestParamValueDetails);
   		 
   		});
  		 
  		 var bodyParamValue = [];
  	     
  		 apiDiv.find(".wsApiBodyParam").each(function(i,val){
  			var  bodyParamValueDetails = {} 
  			var valObj = $(val);
   			var requestParamName = valObj.find(".wsApiRequestParamName").val();
   			var requestParamValue = valObj.find(".wsApiRequestParamValue").val();
   			
   			bodyParamValueDetails["paramName"] = requestParamName;
   			bodyParamValueDetails["paramValue"] = requestParamValue;
   			
   			bodyParamValue.push(bodyParamValueDetails);
   		 
   		});
  		 
  		var paginationRequestParamsArray = [];
	    var paginationRequired = apiDiv.find(".paginationRequired:checked").val() == 'yes' ? true : false ;
	    var paginationOffSetType = apiDiv.find(".paginationOffSetType");
	 	var paginationDateType = apiDiv.find(".paginationDateType");
	 	var paginationHypermediaType = apiDiv.find(".paginationHypermediaType");
	 	var paginationType = apiDiv.find(".paginationOffsetDateType:checked").val();
		if ( paginationRequired ) {
			var paginationRequestParamsObject = {};
			var paginationParamType = apiDiv.find(".paginationParamType").val();
			paginationRequestParamsObject["paginationParamType"] = paginationParamType;
			
			  if(paginationType == 'offset'){
				    var paginationOffSetRequestParamName = paginationOffSetType.find(".paginationOffSetRequestParamName").val();
					var paginationOffSetRequestParamValue = paginationOffSetType.find(".paginationOffSetRequestParamValue").val();
					var paginationLimitRequestParamName = paginationOffSetType.find(".paginationLimitRequestParamName").val();
					var paginationLimitRequestParamValue = paginationOffSetType.find(".paginationLimitRequestParamValue").val();
					var paginationObjectName =  paginationOffSetType.find(".paginationObjectName").val();
					var paginationSearchId =  paginationOffSetType.find(".paginationSearchId").val();
					var PaginationSoapBody =  paginationOffSetType.find(".PaginationSoapBody").val();
					
					
					paginationRequestParamsObject['paginationOffSetRequestParamName']  =  paginationOffSetRequestParamName;
					paginationRequestParamsObject['paginationOffSetRequestParamValue'] = paginationOffSetRequestParamValue;
					paginationRequestParamsObject['paginationLimitRequestParamName'] = paginationLimitRequestParamName;
					paginationRequestParamsObject['paginationLimitRequestParamValue']  =  paginationLimitRequestParamValue;
					paginationRequestParamsObject['paginationObjectName']  =  paginationObjectName;
					paginationRequestParamsObject['paginationSearchId']  =  paginationSearchId;
					paginationRequestParamsObject['PaginationSoapBody']  =  PaginationSoapBody;
					
				}else if(paginationType == 'date'){
					var paginationStartDateParam = paginationDateType.find('.paginationStartDateParam').val();
					var paginationEndDateParam = paginationDateType.find('.paginationEndDateParam').val();
					var paginationStartDate = paginationDateType.find('.paginationStartDate').val();
					var paginationDateRange = paginationDateType.find('.paginationDateRange').val();
					
					paginationRequestParamsObject['paginationStartDateParam']  =  paginationStartDateParam;
					paginationRequestParamsObject['paginationEndDateParam']  =  paginationEndDateParam;
					paginationRequestParamsObject['paginationStartDate']  =  paginationStartDate;
					paginationRequestParamsObject['paginationDateRange']  =  paginationDateRange;
				} else {
					var paginationHyperLinkPattern = paginationHypermediaType.find('.paginationHyperLinkPattern').val();
					var paginationHypermediaPageLimit = paginationHypermediaType.find('.paginationHypermediaPageLimit').val();
					
					paginationRequestParamsObject['paginationHyperLinkPattern']  =  paginationHyperLinkPattern;
					paginationRequestParamsObject['paginationHypermediaPageLimit']  =  paginationHypermediaPageLimit;
					
				}
			  if(!$.isEmptyObject(paginationRequestParamsObject))
					paginationRequestParamsArray.push(paginationRequestParamsObject);
		} 
		
  		var inclUpdateParamsArray = [];
  		var incrementalUpdate = apiDiv.find(".incrementalUpdate").prop("checked");
		var incrementalUpdateDetailsDiv = apiDiv.find(".incrementalUpdateDetailsDiv");
		if ( incrementalUpdate ) {
			var incrementalUpdateParamName = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamName").val();
			var incrementalUpdateParamvalue = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamvalue").val();
			var incrementalUpdateParamColumnName = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamColumnName").val();
			var incrementalUpdateParamType = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamType").val();
			
			
			var inclUpdateParamsObject = {};
			inclUpdateParamsObject['incrementalUpdateParamName'] = incrementalUpdateParamName;
			inclUpdateParamsObject['incrementalUpdateParamvalue'] = incrementalUpdateParamvalue;
			inclUpdateParamsObject['incrementalUpdateParamColumnName'] = incrementalUpdateParamName;
			inclUpdateParamsObject['incrementalUpdateParamType'] = incrementalUpdateParamType;
			
			if(!$.isEmptyObject(inclUpdateParamsObject))
				inclUpdateParamsArray.push(inclUpdateParamsObject);
		}

		 var selectedData = {
				 apiName: wsApiName,
				 apiUrl : wsApiUrl,
				 soapBodyElement : wssoapBodyElement,
				// baseUrl:wsApiBaseUrl,
				 baseUrlRequired:wsApiBaseUrlRequired,
				 apiMethodType : methodType,
				 responseObjectName : wsApiResponseObjName,
				 apiPathParams:JSON.stringify(pathParamValueDetails),
				 responseColumnObjectName : wsApiResponseColumnObjName,
				 webServiceConnectionMaster :{id: $("#existingWebServices").val()},
				 apiRequestParams:JSON.stringify(requsetParamValue),
				 ilId:selectedIlId,
				 paginationRequired:paginationRequired,
				 paginationType:paginationType,
				 paginationRequestParamsData:JSON.stringify(paginationRequestParamsArray),
				 incrementalUpdate:incrementalUpdate,
				 incrementalUpdateparamdata:JSON.stringify(inclUpdateParamsArray),
				 apiBodyParams:JSON.stringify(bodyParamValue),
				 validateOrPreview:true
				 
		 }
		var token = $("meta[name='_csrf']").attr("content");
		var header = $("meta[name='_csrf_header']").attr("content");
		headers[header] = token;
			showAjaxLoader(true); 
			verifiedStatus.empty().hide();
			verifiedStatusError.empty().hide();
			var myAjax = common.postAjaxCall(url_getAuthenticationObject,'POST',selectedData,headers);
		   myAjax.done(function(result) {
			showAjaxLoader(false);
			  if(result.hasMessages){
				    var messages = result.messages;
		     		var msg = messages[0];
		     		
		     		if (msg.code === "SUCCESS") {
		     		 
		     		  verifiedStatus.empty().text(msg.text).show();
		     		  setTimeout(function() { verifiedStatus.hide().empty(); }, 10000);
		     		  
		     		   previewWsApi.show();
		     		   addNewApi.show();
		     		    
		     		   if($("#apiDetails .wsApiUrl").length == 1){
		     			  $("#joinWsApi").hide();
		     			  $("#saveWsApi,#wsFormatResponse").show();
		     		   }else{
		     			  $("#joinWsApi").show();
		     			  $("#saveWsApi,#wsFormatResponse").hide();
		     		   }
		     		}
		     		else if (msg.code === "ERROR") {
		     			  verifiedStatusError.stop().fadeIn(1).fadeOut(40000).empty().html(msg.text).show();
		     			  
			     		  //setTimeout(function() { verifiedStatusError.hide().empty(); }, 10000);
		     			  $("#saveWsApi,#wsFormatResponse,#joinWsApi").hide();
		     			   previewWsApi.hide();
			     		   addNewApi.hide();
		     			  return false;
		     		}
		     		 
		 	  }else{
		 		    common.showErrorAlert(msg.text);
					return false;
		 	  }
		});
 	});
 	
 	// Preview Ws Api
 	$("#apiDetails").on('click', '.previewWsApi', function(){
 		
 		var apiDiv = $($(this).closest("div.wsApiDetailsDiv"));
 		var userID = $("#userID").val();
 		var selectedIlId = $("#iLName").val();
 		var wsApiName = apiDiv.find(".wsApiName").val();
 		var wsApiUrl = apiDiv.find(".wsApiUrl").val();
 		var wssoapBodyElement = apiDiv.find("#soapBodyElement").val();
 		// var wsApiBaseUrl = apiDiv.find(".wsApiBaseUrl").val();
 		var wsApiBaseUrlRequired = apiDiv.find(".wsApiBaseUrlRequired").is(':checked') ? true : false;
 		var methodType = apiDiv.find(".wsApiMethodType:checked").val();
 		var wsApiResponseObjName = apiDiv.find(".wsApiResponseObjName").val();
 		var wsApiResponseColumnObjName = apiDiv.find(".wsApiResponseColumnObjName").val();
 		var previewWsApi = apiDiv.find(".previewWsApi");
 		
 		 var status = standardPackage.validateWebServiceApi($(this));
 	      if(!status){ return status;  }
 		
 		var pathParamValueDetails = {};
  		apiDiv.find(".wsManualSubUrlDiv").each(function(i,val){
  			var pathParamValueObj = {};
  			var valObj = $(val);
  			
  			var wsUrlPathParamVar = valObj.find(".wsUrlPathParam").text();
  			var pathParamValTypeVar = valObj.find(".pathParamValType:checked").val();
  			var manualParamValueVar = valObj.find(".manualParamValue").val();
  			var subApiUrlVar = valObj.find(".wsSubApiUrl").val();
  			var wsApiBaseUrlRequiredForSubUrlVar = valObj.find(".wsSubApiBaseUrlRequired").is(":checked") ? true : false;
  			var subApiMethodTypeVar = valObj.find(".wsSubApiMethodType:checked").val();
  			var subApiResponseObjectVar = valObj.find(".wsSubApiResponseObjName").val();
  			pathParamValueObj["paramName"] = wsUrlPathParamVar;
  			pathParamValueObj["valueType"] = pathParamValTypeVar;
  			
  			
  			if (pathParamValTypeVar == "M") {
  				manualParamValueVar = valObj.find(".manualParamValue").val();
  				pathParamValueObj["manualParamValue"] = manualParamValueVar;
  			} else if (pathParamValTypeVar == "S") {
  				pathParamValueObj["subUrldetailsurl"] = subApiUrlVar;
  				pathParamValueObj["subUrldetailsmethodType"] = subApiMethodTypeVar;
  				pathParamValueObj["subUrldetailsresponseObjName"] = subApiResponseObjectVar;
  				pathParamValueObj["baseUrlRequired"] = wsApiBaseUrlRequiredForSubUrlVar;
  				 
  				var subUrlPaginationRequired = valObj.find(".subUrlPaginationRequired:checked").val() == 'yes' ? true : false ;
  		 		var subUrlPaginationOffSetType = valObj.find(".subUrlPaginationOffSetType");
  		 		var subUrlPaginationDateType = valObj.find(".subUrlPaginationDateType");
  		 		var subUrlPaginationHypermediaType = valObj.find(".subUrlPaginationHypermediaType");
  		 		
  		 		var subUrlPaginationType = valObj.find(".subUrlPaginationOffsetDateType:checked").val();
  				if ( subUrlPaginationRequired ) { 
					var subUrlPaginationParamType = valObj.find(".subUrlPaginationParamType").val();
					pathParamValueObj["subUrlPaginationParamType"] = subUrlPaginationParamType;
					pathParamValueObj["subUrlPaginationRequired"] = subUrlPaginationRequired;
					if(subUrlPaginationType == 'offset'){
						pathParamValueObj['subUrlPaginationType']  =  subUrlPaginationType;
						var subUrlPaginationOffSetRequestParamName = subUrlPaginationOffSetType.find('.subUrlPaginationOffSetRequestParamName').val();
						var subUrlPaginationOffSetRequestParamValue = subUrlPaginationOffSetType.find('.subUrlPaginationOffSetRequestParamValue').val();
						var subUrlPaginationLimitRequestParamName = subUrlPaginationOffSetType.find('.subUrlPaginationLimitRequestParamName').val();
						var subUrlPaginationLimitRequestParamValue = subUrlPaginationOffSetType.find('.subUrlPaginationLimitRequestParamValue').val();
						pathParamValueObj['subUrlPaginationOffSetRequestParamName']  =  subUrlPaginationOffSetRequestParamName;
						pathParamValueObj['subUrlPaginationOffSetRequestParamValue']  =  subUrlPaginationOffSetRequestParamValue;
						pathParamValueObj['subUrlPaginationLimitRequestParamName']  =  subUrlPaginationLimitRequestParamName;
						pathParamValueObj['subUrlPaginationLimitRequestParamValue']  =  subUrlPaginationLimitRequestParamValue;
					}else  if(subUrlPaginationType == 'date'){
						pathParamValueObj['subUrlPaginationType']  =  subUrlPaginationType;
						var subUrlPaginationStartDateParam = subUrlPaginationDateType.find('.subUrlPaginationStartDateParam').val();
						var subUrlPaginationEndDateParam = subUrlPaginationDateType.find('.subUrlPaginationEndDateParam').val();
						var subUrlPaginationStartDate = subUrlPaginationDateType.find('.subUrlPaginationStartDate').val();
						var subUrlPaginationDateRange = subUrlPaginationDateType.find('.subUrlPaginationDateRange').val();
						pathParamValueObj['subUrlPaginationStartDateParam']  =  subUrlPaginationStartDateParam;
						pathParamValueObj['subUrlPaginationEndDateParam']  =  subUrlPaginationEndDateParam;
						pathParamValueObj['subUrlPaginationStartDate']  =  subUrlPaginationStartDate;
						pathParamValueObj['subUrlPaginationDateRange']  =  subUrlPaginationDateRange;
					} else {
						pathParamValueObj['subUrlPaginationType']  =  subUrlPaginationType;
						var subUrlPaginationHyperLinkPattern = subUrlPaginationHypermediaType.find('.subUrlPaginationHyperLinkPattern').val();
						var subUrlPaginationHypermediaPageLimit = subUrlPaginationHypermediaType.find('.subUrlPaginationHypermediaPageLimit').val();
						pathParamValueObj['subUrlPaginationHyperLinkPattern']  =  subUrlPaginationHyperLinkPattern;
						pathParamValueObj['subUrlPaginationHypermediaPageLimit']  =  subUrlPaginationHypermediaPageLimit;
					}
  				}else{
  					pathParamValueObj["subUrlPaginationRequired"] = subUrlPaginationRequired;
  				}
  			} else {
  				common.showcustommsg(valObj.find(".pathParamValType"),"Please select Path param response from type");
  				status = false;
  				return;
  			}
  			
  			pathParamValueDetails[wsUrlPathParamVar] = pathParamValueObj;
  			
  			
  		});
 		
  	 
  		var requsetParamValue = [];
 	     
 		 apiDiv.find(".wsApiRequestParam").each(function(i,val){
 			var  requestParamValueDetails = {} 
 			var valObj = $(val);
  			var requestParamName = valObj.find(".wsApiRequestParamName").val();
  			var requestParamValue = valObj.find(".wsApiRequestParamValue").val();
  			
  			requestParamValueDetails["paramName"] = requestParamName;
  			requestParamValueDetails["paramValue"] = requestParamValue;
  			
  			requsetParamValue.push(requestParamValueDetails);
  		 
  		});
 		 
 		 var bodyParamValue = [];
 	     
 		 apiDiv.find(".wsApiBodyParam").each(function(i,val){
 			var  bodyParamValueDetails = {} 
 			var valObj = $(val);
  			var requestParamName = valObj.find(".wsApiRequestParamName").val();
  			var requestParamValue = valObj.find(".wsApiRequestParamValue").val();
  			
  			bodyParamValueDetails["paramName"] = requestParamName;
  			bodyParamValueDetails["paramValue"] = requestParamValue;
  			
  			bodyParamValue.push(bodyParamValueDetails);
  		 
  		});
 		 
 		var paginationRequestParamsArray = [];
	    var paginationRequired = apiDiv.find(".paginationRequired:checked").val() == 'yes' ? true : false ;
	    var paginationOffSetType = apiDiv.find(".paginationOffSetType");
	 	var paginationDateType = apiDiv.find(".paginationDateType");
	 	var paginationHypermediaType = apiDiv.find(".paginationHypermediaType");
	 	var paginationType = apiDiv.find(".paginationOffsetDateType:checked").val();
		if ( paginationRequired ) { 
				var paginationRequestParamsObject = {};
				var paginationParamType = apiDiv.find(".paginationParamType").val();
				paginationRequestParamsObject["paginationParamType"] = paginationParamType;
				 
			  if(paginationType == 'offset'){
				    var paginationOffSetRequestParamName = paginationOffSetType.find(".paginationOffSetRequestParamName").val();
					var paginationOffSetRequestParamValue = paginationOffSetType.find(".paginationOffSetRequestParamValue").val();
					var paginationLimitRequestParamName = paginationOffSetType.find(".paginationLimitRequestParamName").val();
					var paginationLimitRequestParamValue = paginationOffSetType.find(".paginationLimitRequestParamValue").val();
					var paginationObjectName =  paginationOffSetType.find(".paginationObjectName").val();
					var paginationSearchId =  paginationOffSetType.find(".paginationSearchId").val();
					var PaginationSoapBody =  paginationOffSetType.find(".PaginationSoapBody").val();
					
					paginationRequestParamsObject['paginationOffSetRequestParamName']  =  paginationOffSetRequestParamName;
					paginationRequestParamsObject['paginationOffSetRequestParamValue'] = paginationOffSetRequestParamValue;
					paginationRequestParamsObject['paginationLimitRequestParamName'] = paginationLimitRequestParamName;
					paginationRequestParamsObject['paginationLimitRequestParamValue']  =  paginationLimitRequestParamValue;
					paginationRequestParamsObject['paginationObjectName']  =  paginationObjectName;
					paginationRequestParamsObject['paginationSearchId']  =  paginationSearchId;
					paginationRequestParamsObject['PaginationSoapBody']  =  PaginationSoapBody;

				
				}else if(paginationType == 'date'){
		
					var paginationStartDateParam = paginationDateType.find('.paginationStartDateParam').val();
					var paginationEndDateParam = paginationDateType.find('.paginationEndDateParam').val();
					var paginationStartDate = paginationDateType.find('.paginationStartDate').val();
					var paginationDateRange = paginationDateType.find('.paginationDateRange').val();
					
					paginationRequestParamsObject['paginationStartDateParam']  =  paginationStartDateParam;
					paginationRequestParamsObject['paginationEndDateParam']  =  paginationEndDateParam;
					paginationRequestParamsObject['paginationStartDate']  =  paginationStartDate;
					paginationRequestParamsObject['paginationDateRange']  =  paginationDateRange;
				
				} else {
					var paginationHyperLinkPattern = paginationHypermediaType.find('.paginationHyperLinkPattern').val();
					var paginationHypermediaPageLimit = paginationHypermediaType.find('.paginationHypermediaPageLimit').val();
					
					paginationRequestParamsObject['paginationHyperLinkPattern']  =  paginationHyperLinkPattern;
					paginationRequestParamsObject['paginationHypermediaPageLimit']  =  paginationHypermediaPageLimit;
					
				}
			  if(!$.isEmptyObject(paginationRequestParamsObject))
					paginationRequestParamsArray.push(paginationRequestParamsObject);
		}
 		 
 		var inclUpdateParamsArray = [];
 		var incrementalUpdate = apiDiv.find(".incrementalUpdate").prop("checked");
		var incrementalUpdateDetailsDiv = apiDiv.find(".incrementalUpdateDetailsDiv");
		if ( incrementalUpdate ) {
			var incrementalUpdateParamName = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamName").val();
			var incrementalUpdateParamvalue = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamvalue").val();
			var incrementalUpdateParamColumnName = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamColumnName").val();
			var incrementalUpdateParamType = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamType").val();
			
			
			var inclUpdateParamsObject = {};
			inclUpdateParamsObject['incrementalUpdateParamName'] = incrementalUpdateParamName;
			inclUpdateParamsObject['incrementalUpdateParamvalue'] = incrementalUpdateParamvalue;
			inclUpdateParamsObject['incrementalUpdateParamColumnName'] = incrementalUpdateParamName;
			inclUpdateParamsObject['incrementalUpdateParamType'] = incrementalUpdateParamType;
			
			if(!$.isEmptyObject(inclUpdateParamsObject))
				inclUpdateParamsArray.push(inclUpdateParamsObject);
		}
 		 
 		url_getAuthenticationObject = "/app/user/"+userID+"/package/validateWebService";
		

		 var selectedData = {
				 apiName: wsApiName,
				 apiUrl : wsApiUrl,
				 soapBodyElement : wssoapBodyElement,
				// baseUrl:wsApiBaseUrl,
				 baseUrlRequired:wsApiBaseUrlRequired,
				 apiMethodType : methodType,
				 responseObjectName : wsApiResponseObjName,
				 apiPathParams:JSON.stringify(pathParamValueDetails),
				 responseColumnObjectName : wsApiResponseColumnObjName,
				 webServiceConnectionMaster :{id: $("#existingWebServices").val()},
				 apiRequestParams:JSON.stringify(requsetParamValue),
				 ilId:selectedIlId,
				 paginationRequired:paginationRequired,
				 paginationType:paginationType,
				 paginationRequestParamsData:JSON.stringify(paginationRequestParamsArray),
				 incrementalUpdate:incrementalUpdate,
				 incrementalUpdateparamdata:JSON.stringify(inclUpdateParamsArray),
				 apiBodyParams:JSON.stringify(bodyParamValue),
				 validateOrPreview:true
				 
		 }
			var token = $("meta[name='_csrf']").attr("content");
			var header = $("meta[name='_csrf_header']").attr("content");
			headers[header] = token;
			showAjaxLoader(true);
			var myAjax = common.postAjaxCall(url_getAuthenticationObject,'POST',selectedData,headers);
		    myAjax.done(function(result) { 
 		    	showAjaxLoader(false);
		    	  if(result != null && result.hasMessages){
		    			  if(result.messages[0].code == "ERROR") {
			    			  common.showErrorAlert(result.messages[0].text);
			    			  return false;
			    			  }  else if(result.messages[0].code == "SUCCESS"){
			    				  $("#viewDeatilsPreviewPopUp").modal('show');
			    				  var list = result.object;
						    	 
						    	  if(list != null ){
						    		  
						    		  if(list.length == 0){
						    			  $(".viewDeatilsPreview").empty();
							    		  $(".viewDeatilsPreview").append("No records available in web service.");
							    		  return false;
						    		  }
						    		  
						    		  var tablePreview='';
						    		  var headerPreview ="";
							    	  $.each(list, function (index, row) {
							    		  
							    		  tablePreview+='<tr>';
							    		  $.each(row, function (index1, column) {
							    			 
							    			  if (index == 0) {
							    				  headerPreview += '<th>'+index1+'</th>';
							    		  		  tablePreview += '<td>'+column+'</td>';
							    			  } else {
							    				  tablePreview += '<td>'+column+'</td>';
							    			  }
							    		  });
							    		  if (headerPreview != '') {
							    			  tablePreview = '<tr>' + headerPreview + '</tr>' + tablePreview;
							    			  headerPreview = '';
							    		  }
							    		 tablePreview+='</tr>'; 
							    		});
							    	      $(".viewDeatilsPreview").empty();
								    	  $(".viewDeatilsPreview").append(tablePreview);
							    	  }
							    	  else {
							    		  $(".viewDeatilsPreview").empty();
							    		  $(".viewDeatilsPreview").append(globalMessage['anvizent.package.label.noRecordsAvailableInTable']);
							    		   
							    	  } 
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
 	
		$(document).on('click', '#testWebServiceAuthenticate', function(){
			
			common.clearValidations(["#webServiceConnectionName","#webServiceMethodType","#webServiceMethodType","#wsDataSourceOtherName","#webserviceDataSourceName","#webServiceName",["#clientIdentifier","#callBackUrl","#webServiceAuthenticateUrl","#accessTokenUrl","#clientSecret"],".paramValue"]);
			$("#saveNewWebserviceConnection").hide();
			var baseUrl = $("#webServiceBaseUrl").val();
			var authUrl = $("#webServiceAuthenticateUrl").val();
			var baseUrlRequired = $('#baseUrlRequired').is(':checked') ? true : false;
			var userID = $("#userID").val();
			var requestMethod = $('#webServiceMethodType').text().trim();
			var authenticationTypeId = $("#webServiceAuthenticationType").attr("auth-type-id");
			var webServiceAuthenticationType =  $("#webServiceAuthenticationType").text().trim();
			var web_service_id= $("#webServiceName option:selected").val();
			var webServiceConnectionName = $("#webServiceConnectionName").val();
			var ilId = $("#iLName option:selected").val();
			
			
			 var authRequsetParamsObject = {} ,authRequsetParams = [],authPathParamsObject = {} ,authpathParams = [],authHeadersObject = {} ,authHeaders = [],auth_body_params = {};
			 
			 
		  	  $('.basicAuthenticationDiv').find('.pathParamNameValue').each(function(i, obj) {
			    	var pathParamName=$(this).find(".pathParamName").text().trim(); 
				    var pathParamValue=$(this).find(".pathParamValue").val(); 
				    authPathParamsObject[pathParamName] = pathParamValue;
			    });

				var modifiedAuthUrl = standardPackage.replacePathParams(authUrl,authPathParamsObject);
				
		      authpathParams.push(authPathParamsObject);
		      
		      $('.basicAuthenticationDiv').find('.headerKeyValue').each(function(i, obj) {
			    	var headerKey=$(this).find(".headerKey").text().trim(); 
				    var headerValue=$(this).find(".headerValue").val(); 
				    authHeadersObject[headerKey] = headerValue;
			    });
			    
		      authHeaders.push(authHeadersObject);
			    
	           $('.basicAuthenticationDiv').find('.paramNameValue').each(function(i, obj) {
			    	var authRequestKey=$(this).find(".paramName").text().trim(); 
				    var authRequestValue=$(this).find(".paramValue").val();
				    authRequsetParamsObject[authRequestKey] = authRequestValue;
				   
			    });
			    
			    authRequsetParams.push(authRequsetParamsObject);
		     
			    $("#authenticationBodyParamsDiv .paramNameValue").each(function(){
					var name = $(this).find("span.paramName").text();
					var	value = $(this).find("input.paramValue").val();
					auth_body_params[name] = value; 	
				});
				
			    
		    var status= standardPackage.validateWebServiceAuthentication();
			if(!status){ return false;}
			
			
			
			
			var url_getAuthenticationObject = '';
			if (authUrl || authenticationTypeId == 3) {
				/* for OAuth 2 */
				
				var replaceCallBackUrl = "";
				if(authenticationTypeId == 5){ 
					var validStatus = true;
					var callBackUrl = $("#callBackUrl").val().trim();
					var clientIdentifier = $("#clientIdentifier").val();
                    var webServiceAuthenticateUrl = $("#webServiceAuthenticateUrl").val();
                    var accessTokenUrl = $("#accessTokenUrl").val();
                    var clientSecret = $("#clientSecret").val();
                    
					if(webServiceAuthenticateUrl == '' ){
				    	 common.showcustommsg("#webServiceAuthenticateUrl",globalMessage['anvizent.package.label.pleaseenterauthenticationurl'],"#webServiceAuthenticateUrl");
				    	 validStatus = false;
				     }
					if(accessTokenUrl == '' ){
				    	 common.showcustommsg("#accessTokenUrl",globalMessage['anvizent.package.label.pleaseenteraccesstokenurl'],"#accessTokenUrl");
				    	 validStatus = false;
				     }
					if(clientIdentifier == '' ){
				    	 common.showcustommsg("#clientIdentifier",globalMessage['anvizent.package.label.pleaseenterclientIdentifier'],"#clientIdentifier");
				    	 validStatus = false;
				     }
					
				   	if(callBackUrl == ''){
				   	 common.showcustommsg("#callBackUrl", globalMessage['anvizent.package.label.pleaseentercallbackuri'],"#callBackUrl");
					 validStatus = false;
				   	}
				   	
				 	if(clientSecret == ''){
					   	 common.showcustommsg("#clientSecret", globalMessage['anvizent.package.label.pleaseenterclientsecret'],"#clientSecret");
						 validStatus = false;
					   	}
				 	
				   	if(!validStatus){
					 	return validStatus;
				      }
				}
				
				var selectedData = {
						 webServiceTemplateMaster: { 
							 "baseUrl":baseUrl, 
							 "authenticationUrl":authUrl, 
							 "baseUrlRequired":baseUrlRequired, 
							 "authenticationMethodType": requestMethod, 
							 "webServiceAuthenticationTypes":{ id:authenticationTypeId},
							 "oAuth2":{
								 	redirectUrl:$("#callBackUrl").val().trim(),
								 	accessTokenUrl:$("#accessTokenUrl").val(),
								 	grantType:$("#grantType").text().trim(),
								 	clientIdentifier:$("#clientIdentifier").val(),
								 	clientSecret:$("#clientSecret").val(),
								 	authCodeValue:""
								 }
						 },
						 requestParams:JSON.stringify(authRequsetParamsObject),
						 authPathParams:JSON.stringify(authPathParamsObject),
						 bodyParams : JSON.stringify(auth_body_params),
				}
				var token = $("meta[name='_csrf']").attr("content");
				var header = $("meta[name='_csrf_header']").attr("content");
				headers[header] = token;
				showAjaxLoader(true);
				url_getAuthenticationObject = "/app/user/"+userID+"/package/testAuthenticationUrl";
				
				var myAjax = common.postAjaxCall(url_getAuthenticationObject,'POST',selectedData,headers);
		        myAjax.done(function(result) {
		    	showAjaxLoader(false);
		    	  if(result.hasMessages){
		    		    var messages = result.messages;
			      		var msg = messages[0];
			      		 
			      		if (msg.code === "SUCCESS") {
			      			
			      			if(authenticationTypeId == 5){
			      				var params = "";
			      			 	var ua = window.navigator.userAgent;
			      			    var msie = ua.indexOf("MSIE ");
			      			    
			      			    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))  // If
																									// Internet
																									// Explorer,
																									// return
																									// version
																									// number
			      			    {
			      			    	params = [
			      				              'width='+screen.width,
			      				              'fullscreen=no' // only works in
																// IE, but here
																// for
																// completeness
			      				          ].join(',');
			      			    } else {
			      			    	params = [
			      				              'height='+screen.height,
			      				              'width='+screen.width,
			      				          ].join(',');
			      			    }
			      			  showAjaxLoader(true);
			      				var popup = window.open(result.object, 'oAuth2Authentication', params); 
			      			    popup.moveTo(0,0);
			      			    
			      		        var timer = setInterval(checkChild, 500);
			      		        
			      		        function checkChild() {
			      		        	if (popup.closed) {
			      		        		showAjaxLoader(false);
			      		        		clearInterval(timer);
			      		        		if ( $("#authCodeValue").val().trim() != "") {
			      		        			selectedData.webServiceTemplateMaster.oAuth2.authCodeValue = $("#authCodeValue").val();
			      		        			
			      		        			url_getAuthenticationObject = "/app/user/"+userID+"/package/testAuthenticationUrl";
				      		  				var myAjaxOAuth2 = common.postAjaxCall(url_getAuthenticationObject,'POST',selectedData,headers);
				      		  				showAjaxLoader(true);
				      		  				myAjaxOAuth2.done(function(myAjaxOAuth2) {
				      		  					showAjaxLoader(false);
				      		  					
				      		  					if (myAjaxOAuth2.messages[0].code == "SUCCESS") {		
				      		  						common.showSuccessAlert(myAjaxOAuth2.messages[0].text);
				      		  						$("#access_token").val(myAjaxOAuth2.object.access_token);
				      		  						$("#refresh_token").val(myAjaxOAuth2.object.refresh_token);
				      		  						$("#saveNewWebserviceConnection").show();
				      		  					} else {
					      		  					common.showErrorAlert(myAjaxOAuth2.messages[0].text);
					    			      			return false;
				      		  					}
				      		  		        });
			      		        		} else{
			      		        			common.showErrorAlert("Authentication failed");
			      		        			return false;
			      		        		}
			      		        	}
			      		        }
			      				
			      			} else {
			      				common.showSuccessAlert(msg.text);
					      		$("#saveNewWebserviceConnection").show();
			      			}
			      		}
			      		else if (msg.code === "ERROR") {
			      			common.showErrorAlert(msg.text);
			      			return false;
			      		}
			      		 
		      	  }else{
		      		common.showErrorAlert(msg.text);
	      			return false;
		      	  }
		        });
			} else {
				common.showErrorAlert("Invalid URL");
				return false;
			}
			
		});
		
		
  $(document).on('click', '#saveNewWebserviceConnection', function(){
			
			common.clearValidations(["#webServiceConnectionName","#webServiceMethodType","#webServiceMethodType"]);
			
			var baseUrl = $("#webServiceBaseUrl").val();
			var authUrl = $("#webServiceAuthenticateUrl").val();
			var baseUrlRequired = $('#baseUrlRequired').is(':checked') ? true : false;
			var userID = $("#userID").val();
			var requestMethod = $('#webServiceMethodType').text().trim();
			var authenticationTypeId = $("#webServiceAuthenticationType").attr("auth-type-id");
			var webServiceAuthenticationType =  $("#webServiceAuthenticationType").text().trim();
			var web_service_id= $("#webServiceName option:selected").val();
			var webServiceConnectionName = $("#webServiceConnectionName").val();
			var accessTokenValue = $("#access_token").val().trim();
			var refreshTokenValue = $("#refresh_token").val().trim();
			var accessTokenUrl=$("#accessTokenUrl").val().trim();
			var active = $("input[name='active']").val();
			var dataSourceName = $("#webserviceDataSourceName").val();
			var dataSourceOther = $("#wsDataSourceOtherName").val();
	  	    var authRequsetParamsObject = {} ,authRequsetParams = [],authPathParamsObject = {} ,authpathParams = [],authHeadersObject = {} ,authHeaders = [],auth_body_params={};
	  	    
	  	  $('.basicAuthenticationDiv').find('.pathParamNameValue').each(function(i, obj) {
		    	var pathParamName=$(this).find(".pathParamName").text().trim(); 
			    var pathParamValue=$(this).find(".pathParamValue").val(); 
			    authPathParamsObject[pathParamName] = pathParamValue;
		    });
		    
	      
	      $('.basicAuthenticationDiv').find('.headerKeyValue').each(function(i, obj) {
		    	var headerKey=$(this).find(".headerKey").text().trim(); 
			    var headerValue=$(this).find(".headerValue").val(); 
			    authHeadersObject[headerKey] = headerValue;
		    });
		    
		    
           $('.basicAuthenticationDiv').find('.paramNameValue').each(function(i, obj) {
		    	var authRequestKey=$(this).find(".paramName").text().trim(); 
			    var authRequestValue=$(this).find(".paramValue").val();
			    authRequsetParamsObject[authRequestKey] = authRequestValue;
			   
		    });
		    
           
           $("#authenticationBodyParamsDiv .paramNameValue").each(function(){
				var name = $(this).find("span.paramName").text();
				var	value = $(this).find("input.paramValue").val();
				auth_body_params[name] = value; 
			});
			
		    var status= standardPackage.validateWebServiceAuthentication();
			if(!status){ return false;}
		   
			if (authUrl || authenticationTypeId == 3) {
				
				var selectedData = {
						webServiceConName:webServiceConnectionName,
						wsApiAuthUrl:authUrl,
					    baseUrl:baseUrl,
						baseUrlRequired:baseUrlRequired,
						requestParams:JSON.stringify(authRequsetParamsObject),
					    webServiceTemplateMaster : {
					    	id:web_service_id,
					    	timeZone:getTimezoneName(),
					    	},
					    authenticationTypeId : authenticationTypeId,
					    authPathParams:JSON.stringify(authPathParamsObject),
			            headerKeyvalues:JSON.stringify(authHeadersObject),
			            bodyParams : JSON.stringify(auth_body_params),
			            oAuth2 :{
			        	    accessTokenUrl : accessTokenUrl,
			        	  	clientIdentifier:$("#clientIdentifier").val(),
						 	clientSecret:$("#clientSecret").val(),
						 	accessTokenValue: accessTokenValue,
				            refreshTokenValue:refreshTokenValue
			             },
			             active : active,
			             dataSourceName:dataSourceName,
			             dataSourceNameOther:dataSourceOther
			   }
				var token = $("meta[name='_csrf']").attr("content");
				var header = $("meta[name='_csrf_header']").attr("content");
				headers[header] = token;
				var url_saveWebserviceMasterConnectionMapping = "/app/user/"+userID+"/package/saveWebserviceMasterConnectionMapping"; 
				showAjaxLoader(true);
				var myAjax = common.postAjaxCall(url_saveWebserviceMasterConnectionMapping,'POST',selectedData,headers);
		        myAjax.done(function(result) {
		    	showAjaxLoader(false);
		    	  if(result.hasMessages){
		    		    var messages = result.messages;
			      		var msg = messages[0];
			      		if (msg.code === "SUCCESS") {
			      			  standardPackage.resetWebserviceConnection();
			    			  $("#createNewWebservicePanel").hide();
			    			  $('.alert-success').show();
			    			  var message = result.messages[0].text;
			    			  standardPackage.showSuccessMessage(message+" "+globalMessage['anvizent.package.label.pleaseSelectTheConnectionToCompleteTheProcess'], true, 5000);
			    			  standardPackage.getWebServiceConnections();
			      			 
			      		}
			      		else if (msg.code === "FAILED") {
			      			common.showErrorAlert(msg.text);
			      			return false;
			      		}
			      		 
		      	  }else{
		      		common.showErrorAlert(result.messages[0].text);
	      			return false;
		      	  }
		    });
				
			} else {
				common.showErrorAlert("Invalid URL");
				return false;
			}
			
		});	
		
$(document).on('change', '#existingWebServices', function(){
	     $(".verifiedStatus").css("display","none");
	     $("#requiredApiRequestParameters,#wsHeaderDetailsDiv,#wsdefaultApiDetails,#joinWsApi,#saveWsApi,#wsFormatResponse,#webServiceBaseUrl, #baseUrlRequiredLable, #baseUrlRequired").hide();   
	      $("#createNewWebservicePanel,#responseStatuscode").hide(); 
	     var ilId = $('#iLName option:selected').val();
	     var wsConId = $('#existingWebServices option:selected').val();
	     var userID = $("#userID").val();
	     
		if(wsConId == 0){
			common.showErrorAlert("Please Select Webservice Connection.");
			$("#webServiceDefaultMapingConnectionDetails").hide(); 
			return false;
		} 
		
		standardPackage.getWsMappingDetails(wsConId ,ilId);
});

$(document).on('click', '#testAuthenticateWebService', function(){
	
	 
	var authUrl = $("#authenticationURL").val();
	var userID = $("#userID").val();
	var requestMethod = $('#authenticationMethodType').val();
	var authenticationTypeId = $("#authenticationType").attr("authentication-type-id");
	var webServiceAuthenticationType =  $("#authenticationMethodType").val();
	
	 var authRequsetParamsObject = {} ,authRequsetParams = [] ;
  
       $('#authenticationParamsList tbody').each(function(i, obj) {
	    	var authRequestKey=$(this).find(".authRequestParamName").val(); 
		    var authRequestValue=$(this).find(".authRequestParamValue").val();
		    authRequsetParamsObject[authRequestKey] = authRequestValue;
		   
	    });
	    authRequsetParams.push(authRequsetParamsObject);
     
	
	 
	if (authUrl) {
		if(authenticationTypeId == 2 || authenticationTypeId == 5){
		 var url_getAuthenticationObject = "/app/user/"+userID+"/package/testAuthenticationUrl";
		 var selectedData = {
			  id: $("#existingWebServices option:selected").val()
		 }
		showAjaxLoader(true);
		var myAjax = common.postAjaxCall(url_getAuthenticationObject,'POST',selectedData,headers);
        myAjax.done(function(result) {
    	showAjaxLoader(false);
    	  if(result.hasMessages){
    		    var messages = result.messages;
    		    console.log("Auth result  -- > " , result);
	      		var msg = messages[0];
	      		if (msg.code === "SUCCESS") {
	      			var authResult = result.object;
	      			  standardPackage.parseAuthenticationWithIlApis(authResult);
	      			  $("#responseStatuscode").text(msg.text).show();
	      			  $('#responseStatuscode').css('color','blue');
	      			  setTimeout(function() { $("#responseStatuscode").hide().empty(); }, 10000);
	      			 
	      		}
	      		else if (msg.code === "ERROR") {
	      		 
	      			  $("#responseStatuscode").text(msg.text).show();
	      			  $('#responseStatuscode').css('color','red');
	      			  setTimeout(function() { $("#responseStatuscode").hide().empty(); }, 10000);
	      			 return false;
	      		}
	      		 
      	  }else{
      		 $("#responseStatuscode").text(msg.text).show();
 			  $('#responseStatuscode').css('color','red');
 			  setTimeout(function() { $("#responseStatuscode").hide().empty(); }, 10000);
  			  return false;
      	  }
    });
	} else {
		common.showErrorAlert("Invalid Access");
		return false;
	}
	} else {
		common.showErrorAlert("Invalid URL");
		return false;
	}
	
});


$(document).on("click",".addNewApi, #addNewWsApi",function(){
	
	 
	var apiDetailsDiv  = $("#apiDetails");   
	$("#wsdefaultApiDetails").show();
	var apiInffo = $("#wsApiDetailsMainDiv").clone().removeAttr("id").addClass("wsApiDetailsDiv").show();
	apiInffo.find(".wsManualSubUrlMainDiv").css("display","none");
	apiInffo.find(".getWsApiUrlPathParam").show();
	
	apiInffo.find(".wsApiMethodType").each(function(index,val){
			var valObj = $(val);
			valObj.prop("name","methodTypeAuthSelection"+globalApiCounter);
			
	 }); 
	
	apiInffo.find(".paginationOffsetDateType").each(function(index,val){
		var valObj = $(val);
		valObj.prop("name","paginationOffsetDateType"+globalApiCounter);
		
	}); 
	
	apiInffo.find(".paginationRequired").each(function(index,val){
		var valObj = $(val);
		if(valObj.val() == 'no'){
			valObj.prop("checked",true);
		}
		valObj.prop("name","paginationRequired"+globalApiCounter);
		
   }); 
	
	apiDetailsDiv.append(apiInffo);
	 
	  if($("#apiDetails .wsApiUrl").length == 1){
		  $("#joinWsApi").hide();
		  $("#saveWsApi,#wsFormatResponse").show();
		  
	   }else{
		  $("#joinWsApi").show();
		  $("#saveWsApi,#wsFormatResponse").hide();
	   }
	   
	  globalApiCounter++;
		 
	});

	$(document).on("click",".deleteAddedNewApi",function(){ 	
		
		  $(this).parents(".wsApiDetailsDiv").remove();
	   
			if($("#wsdefaultApiDetails").find(".wsApiDetailsDiv").length == 0){
				  $("#saveWsApi,#wsFormatResponse,#joinWsApi,#wsdefaultApiDetails").hide();
				  $("#addNewWsApi").show();
				  return false;
		   }
		
		   if($("#apiDetails .wsApiUrl").length == 1){
			  $("#joinWsApi").hide();
			  $("#saveWsApi,#wsFormatResponse").show();
			  
		   }else{
			  $("#joinWsApi").show();
			  $("#saveWsApi,#wsFormatResponse").hide();
		   }
		   
		  
	});

	$(document).on("click",".manualPathParamVal",function(){ 	
		$(this).parents(".wsManualSubUrlDiv").find(".wsManualParamValDiv").show();
		$(this).parents(".wsManualSubUrlDiv").find(".wsSubUrlApiDiv").hide();
	});
    $(document).on("click",".defaultSubUrl",function(){ 	
    	$(this).parents(".wsManualSubUrlDiv").find(".wsManualParamValDiv").hide();
		$(this).parents(".wsManualSubUrlDiv").find(".wsSubUrlApiDiv").show();
	});
     
   
    
    $(document).on("click",".getWsApiUrlPathParam",function(){ 	
    	 common.clearValidations([$(this).parents(".wsApiDetailsDiv").find(".wsApiUrl")]);
		 var url = $(this).parents(".wsApiDetailsDiv").find(".wsApiUrl").val();
		 var wsApiBaseUrlRequired = $(this).parents(".wsApiDetailsDiv").find(".wsApiBaseUrlRequired:checked").val();
		 
		 $(this).parents(".wsApiDetailsDiv").find(".wsManualSubUrlMainDiv > div").remove();
		 var wsApiUrlPathParam = null;
		 if(wsApiBaseUrlRequired){
			 if(url != ''){
				 wsApiUrlPathParam = standardPackage.getPathParams(url,"{#");
			 }else{
				 $(this).parents(".wsApiDetailsDiv").find(".wsManualSubUrlMainDiv").hide();
				 common.showcustommsg($(this).parents(".wsApiDetailsDiv").find(".wsApiUrl"),globalMessage['anvizent.package.message.invalidurl'] ,$(this).parents(".wsApiDetailsDiv").find(".wsApiUrl"));
				 return false;
			 } 
		 }else{
			 if(common.validURL(url)){
				 wsApiUrlPathParam = standardPackage.getPathParams(url,"{#");
			 }else{
				 $(this).parents(".wsApiDetailsDiv").find(".wsManualSubUrlMainDiv").hide();
				 common.showcustommsg($(this).parents(".wsApiDetailsDiv").find(".wsApiUrl"),globalMessage['anvizent.package.message.invalidurl'] ,$(this).parents(".wsApiDetailsDiv").find(".wsApiUrl"));
				 return false;
			 } 
		 
		 }
		
		var wsApiDetailsDiv = $(this).parents(".wsApiDetailsDiv").find(".wsManualSubUrlMainDiv");

		 if(wsApiUrlPathParam && wsApiUrlPathParam.length ){
			 
			 $.each(wsApiUrlPathParam,function(j,paramValueObj){
				 
			     var subUrlMainHolderDiv = $("#wsManualSubUrlMainDivTemplate").clone().removeAttr("id").addClass("wsManualSubUrlDiv").show();
			     
				 subUrlMainHolderDiv.find(".pathVariableSno").text("Path Variable: " + (j+1));
				 subUrlMainHolderDiv.find(".wsUrlPathParam").text(paramValueObj);
				 
				 subUrlMainHolderDiv.find(".pathParamValType").each(function(index,val){
						var valObj = $(val);
						valObj.prop("name","pathParamValType"+ globalApiCounter +""+j);
						 
				});
				 
				 subUrlMainHolderDiv.find(".wsSubApiMethodType").each(function(index,val){
						var valObj = $(val);
						valObj.prop("name","wsSubApiMethodType"+ globalApiCounter +""+j);
						
				 });
				 
				 subUrlMainHolderDiv.find(".subUrlPaginationRequired").prop("name","subUrlPaginationRequired" + globalApiCounter +j);
				 subUrlMainHolderDiv.find(".subUrlPaginationOffsetDateType").prop("name","subUrlPaginationOffsetDateType"+ globalApiCounter + j );
				 wsApiDetailsDiv.append(subUrlMainHolderDiv);
			    
				});
			 $(this).parents(".wsApiDetailsDiv").find(".wsManualSubUrlMainDiv").show();
			 
 

		 } else{
		  common.showcustommsg($(this).parents(".wsApiDetailsDiv").find(".wsApiUrl"),globalMessage['anvizent.package.message.nopathparamfound'],$(this).parents(".wsApiDetailsDiv").find(".wsApiUrl"));
		  return false;
		}
		
	});
    $(document).on("click",".addWsRequestParams",function(){ 
     
				 var wsApiRequestParam = $("#wsApiRequestParam").clone().removeAttr("id").addClass("wsApiRequestParam").show();
				 wsApiRequestParam.find(".paramNameMandatory").remove();
				 $(this).parents(".wsApiDetailsDiv").find(".requestparamsLable").show();
				 $(this).parents(".wsApiDetailsDiv").find(".wsApiRequestParamKeyValueDiv").append(wsApiRequestParam).show();
				 $(this).parents(".wsApiDetailsDiv").find(".wsApiRequestParamDiv").show();
			   
		
    });
    $(document).on("click",".deleteAddWsRequestParams",function(){ 
    	     var wsApiRequestParamLength =  $(this).parents(".wsApiDetailsDiv").find(".wsApiRequestParam");
	    	 if(wsApiRequestParamLength.length == 1){
		    	 $(this).parents(".wsApiDetailsDiv").find(".requestparamsLable").hide();
		     }
		    $(this).parents(".wsApiRequestParam").remove();
		
    });
  
    $("#authenticationParamsList tbody").on("click",".togglePassword",function(){
    	
    	var $parent = $($(this).closest("tr") )
    	 
    	if ($(this).hasClass("fa-eye")) {
    		$parent.find(".plainValue").hide(); 
        	$parent.find(".hiddenValue").show();
        	$(this).removeClass("fa-eye").addClass("fa-eye-slash")
    	} else {
    		$parent.find(".plainValue").show(); 
        	$parent.find(".hiddenValue").hide();
        	$(this).removeClass("fa-eye-slash").addClass("fa-eye")
    	}
    	
    });
    
    $(document).on("click", ".toggleClientSecrect", function(){
    	if ($(this).hasClass("fa-eye")) {
    		$(this).removeClass("fa-eye").addClass("fa-eye-slash");
        	$(this).closest("div").find(".showClientsSecret").show();
        	$(this).closest("div").find(".hideClientsSecret").hide();
    	}
    	else{
    		$(this).removeClass("fa-eye-slash").addClass("fa-eye");
    		$(this).closest("div").find(".showClientsSecret").hide();
    		$(this).closest("div").find(".hideClientsSecret").show();
    	}
    });
    
	  $(document).on("click","#addNewWsApi_old",function(){
		  
		  	var apiDetailsDiv  = $("#apiDetails");   
		  	$(".verifiedStatus").css("display","none");
		  	var apiInffo = $("#wsApiDetailsMainDiv").clone().removeAttr("id").addClass("wsApiDetailsDiv").show();
		  	apiInffo.find(".wsManualSubUrlMainDiv").css("display","none");
		  	apiInffo.find(".getWsApiUrlPathParam").show();
		 	apiInffo.find(".wsApiMethodType").each(function(index,val){
	  			var valObj = $(val);
	  			valObj.prop("name","methodTypeAuthSelection"+globalApiCounter);
	  			
	  	    });
		  	 $("#wsdefaultApiDetails").show();
		  	 $("#saveWsApi,#wsFormatResponse,#joinWsApi").hide();
		  	apiDetailsDiv.append(apiInffo);
		  	globalApiCounter++;
		});  
	  
	  $(document).on("click", ".paginationRequired", function(){
			var isPaginationRequired = $(this).val() == 'yes' ? true : false ;
			var paginationTypeDiv = $($(this).closest("div.wsApiDetailsDiv")).find(".paginationType");
			var paginationOffSetTypeDiv = $($(this).closest("div.wsApiDetailsDiv")).find(".paginationOffSetType");
			var paginationDateTypeDiv = $($(this).closest("div.wsApiDetailsDiv")).find(".paginationDateType");
			var paginationHypermediaTypeDiv = $($(this).closest("div.wsApiDetailsDiv")).find(".paginationHypermediaType");
			var paginationOffsetDateType =  $($(this).closest("div.wsApiDetailsDiv")).find(".paginationOffsetDateType:checked").val();
			if(isPaginationRequired){
				paginationTypeDiv.show();
				if(paginationOffsetDateType  == 'offset'){
					paginationOffSetTypeDiv.show();
					$($(this).closest("div.wsApiDetailsDiv")).find(".paginationOffset").trigger("click");
					paginationDateTypeDiv.hide();
				}else if(paginationOffsetDateType  == 'date'){
					paginationDateTypeDiv.show();
					$($(this).closest("div.wsApiDetailsDiv")).find(".paginationDate").trigger("click");
					paginationOffSetTypeDiv.hide();
				}else if(paginationOffsetDateType  == 'hypermedia'){
					paginationHypermediaTypeDiv.show();
					$($(this).closest("div.wsApiDetailsDiv")).find(".paginationHypermedia").trigger("click");
					paginationOffSetTypeDiv.hide();
				}else{
					 $($(this).closest("div.wsApiDetailsDiv")).find(".paginationOffSetType").prop("checked",false);
					  $($(this).closest("div.wsApiDetailsDiv")).find(".paginationDateType").prop("checked",false);
					  $($(this).closest("div.wsApiDetailsDiv")).find(".paginationHypermediaType").prop("checked",false);
				}
			}else{
				paginationTypeDiv.hide();
				paginationHypermediaType.hide();
				paginationDateTypeDiv.hide();
				paginationOffSetTypeDiv.hide();
				paginationTypeDiv.find(".paginationOffset").prop("checked",false);
				paginationTypeDiv.find(".paginationDate").prop("checked",false);
				paginationTypeDiv.find(".paginationHypermedia").prop("checked",false);
				paginationOffSetTypeDiv.find(".paginationOffSetRequestParamName").val("");
				paginationOffSetTypeDiv.find(".paginationOffSetRequestParamValue").val("");
				paginationOffSetTypeDiv.find(".paginationObjectName").val("");
				paginationOffSetTypeDiv.find(".paginationSearchId").val("");
				paginationOffSetTypeDiv.find(".PaginationSoapBody").val("");
				paginationOffSetTypeDiv.find(".paginationLimitRequestParamName").val("");
				paginationOffSetTypeDiv.find(".paginationLimitRequestParamValue").val("");
				paginationOffSetTypeDiv.find(".paginationHyperLinkPattern").val("");
				paginationOffSetTypeDiv.find(".paginationHypermediaPageLimit").val("");
			}
		});
		$(document).on("click", ".paginationOffset", function(){
			var paginationType = $(this).val();
			var paginationOffSetTypeDiv = $($(this).closest("div.wsApiDetailsDiv")).find(".paginationOffSetType");
			var paginationDateType = $($(this).closest("div.wsApiDetailsDiv")).find(".paginationDateType");
			var paginationHypermediaType = $($(this).closest("div.wsApiDetailsDiv")).find(".paginationHypermediaType");
			common.clearValidations([paginationOffSetTypeDiv,paginationDateType]);
			if(paginationType == 'offset') 
				paginationOffSetTypeDiv.show();
			paginationDateType.hide();
			paginationHypermediaType.hide();
		});

		$(document).on("click", ".paginationDate", function(){
			var paginationType = $(this).val();
			var paginationOffSetTypeDiv = $($(this).closest("div.wsApiDetailsDiv")).find(".paginationOffSetType");
			var paginationDateType = $($(this).closest("div.wsApiDetailsDiv")).find(".paginationDateType");
			var paginationHypermediaType = $($(this).closest("div.wsApiDetailsDiv")).find(".paginationHypermediaType");
			common.clearValidations([paginationOffSetTypeDiv,paginationDateType]);
			if(paginationType == 'date') {
				paginationDateType.find('.paginationStartDate').datepicker({
						dateFormat : 'yy-mm-dd',
						defaultDate : new Date(),
						changeMonth : true,
						changeYear : true, 
						yearRange : "0:+20",
						numberOfMonths : 1
					});
				 paginationDateType.show();
			}
				
			paginationOffSetTypeDiv.hide();
			paginationHypermediaType.hide();
		});
		$(document).on("click", ".paginationHypermedia", function(){
			var paginationType = $(this).val();
			var paginationOffSetTypeDiv = $($(this).closest("div.wsApiDetailsDiv")).find(".paginationOffSetType");
			var paginationDateType = $($(this).closest("div.wsApiDetailsDiv")).find(".paginationDateType");
			var paginationHypermediaType = $($(this).closest("div.wsApiDetailsDiv")).find(".paginationHypermediaType");
			common.clearValidations([paginationOffSetTypeDiv,paginationDateType]);
			if(paginationType == 'hypermedia') 
				paginationHypermediaType.show();
			paginationOffSetTypeDiv.hide();
			paginationDateType.hide();
		});

		$(document).on("click", ".subUrlPaginationRequired", function(){
			var subUrlPaginationRequired = $(this).val() == 'yes' ? true : false ;
			var subUrlPaginationTypeDiv = $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationType");
			var subUrlPaginationOffSetTypeDiv = $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationOffSetType");
			var subUrlPaginationDateTypeDiv = $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationDateType");
			var subUrlPaginationHypermediaTypeDiv = $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationHypermediaType");
			
			var subUrlPaginationOffsetDateType =  $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationOffsetDateType:checked").val();
			if(subUrlPaginationRequired){
				subUrlPaginationTypeDiv.show();
				if(subUrlPaginationOffsetDateType  == 'offset'){
					subUrlPaginationOffSetTypeDiv.show();
					$($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationOffset").trigger("click");
					subUrlPaginationDateTypeDiv.hide();
				}else if(subUrlPaginationOffsetDateType  == 'date'){
					subUrlPaginationDateTypeDiv.show();
					$($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationDate").trigger("click");
					subUrlPaginationOffSetTypeDiv.hide();
				} else if(subUrlPaginationOffsetDateType  == 'hypermedia'){
					subUrlPaginationHypermediaTypeDiv.show();
					$($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationHypermedia").trigger("click");
					subUrlPaginationOffSetTypeDiv.hide();
				} else{
					 $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationOffSetType").prop("checked",false);
					  $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationDateType").prop("checked",false);
					  $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationHypermediaType").prop("checked",false);
				}
			}else{
				subUrlPaginationTypeDiv.hide();
				subUrlPaginationDateTypeDiv.hide();
				subUrlPaginationOffSetTypeDiv.hide();
				subUrlPaginationHypermediaTypeDiv.hide();
				subUrlPaginationTypeDiv.find(".subUrlPaginationOffset").prop("checked",false);
				subUrlPaginationTypeDiv.find(".subUrlPaginationDate").prop("checked",false);
				subUrlPaginationTypeDiv.find(".subUrlPaginationHypermedia").prop("checked",false);
				subUrlPaginationOffSetTypeDiv.find(".subUrlPaginationOffSetRequestParamName").val("");
				subUrlPaginationOffSetTypeDiv.find(".subUrlPaginationOffSetRequestParamValue").val("");
				subUrlPaginationOffSetTypeDiv.find(".subUrlPaginationLimitRequestParamName").val("");
				subUrlPaginationOffSetTypeDiv.find(".subUrlPaginationLimitRequestParamValue").val("");
				subUrlPaginationOffSetTypeDiv.find(".subUrlPaginationHyperLinkPattern").val("");
				subUrlPaginationOffSetTypeDiv.find(".subUrlPaginationHypermediaPageLimit").val("");
				
			}
		});
		$(document).on("click", ".subUrlPaginationOffset", function(){
			var subUrlPaginationType = $(this).val();
			var subUrlPaginationOffSetTypeDiv = $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationOffSetType");
			var subUrlPaginationDateType = $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationDateType");
			var subUrlPaginationHypermediaType = $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationHypermediaType");
			var subUrlPaginationParamType = $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationParamType");
			
			if(subUrlPaginationType == 'offset') 
				subUrlPaginationOffSetTypeDiv.show();
			subUrlPaginationDateType.hide();
			subUrlPaginationHypermediaType.hide();
			subUrlPaginationDateType.hide();
		});
		  
		$(document).on("click", ".subUrlPaginationDate", function(){
			var subUrlPaginationType = $(this).val();
			var subUrlPaginationOffSetTypeDiv = $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationOffSetType");
			var subUrlPaginationDateType = $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationDateType");
			var subUrlPaginationHypermediaType = $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationHypermediaType");
			var subUrlPaginationParamType = $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationParamType");
			if(subUrlPaginationType == 'date') {
				subUrlPaginationDateType.find('.subUrlPaginationStartDate').datepicker({
						dateFormat : 'yy-mm-dd',
						defaultDate : new Date(),
						changeMonth : true,
						changeYear : true, 
						yearRange : "0:+20",
						numberOfMonths : 1
					});
				subUrlPaginationDateType.show();
		   }
			subUrlPaginationOffSetTypeDiv.hide();
			subUrlPaginationHypermediaType.hide();
			subUrlPaginationDateType.hide();
		});
		
		
		$(document).on("click", ".subUrlPaginationHypermedia", function(){
			var subUrlPaginationType = $(this).val();
			var subUrlPaginationOffSetTypeDiv = $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationOffSetType");
			var subUrlPaginationDateType = $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationDateType");
			var subUrlPaginationHypermediaType = $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationHypermediaType");
			var subUrlPaginationParamType = $($(this).closest("div.wsSubUrlApiDiv")).find(".subUrlPaginationParamType");
			
			if(subUrlPaginationType == 'hypermedia'){ 
				subUrlPaginationHypermediaType.show();
				subUrlPaginationParamType.show();
			}
			subUrlPaginationOffSetTypeDiv.hide();
			subUrlPaginationDateType.hide();
			
		});
	  
	  
	  
	  
	  $(document).on("click", ".incrementalUpdate", function(){
			var incrementalUpdate = this.checked;
			var incrementalUpdateDetailsDiv = $($(this).closest("div.wsApiDetailsDiv")).find(".incrementalUpdateDetailsDiv");
			if ( incrementalUpdate ) {
				incrementalUpdateDetailsDiv.show();
			} else {
				incrementalUpdateDetailsDiv.hide();
				incrementalUpdateDetailsDiv.find(".incrementalUpdateParamName").val("");
				incrementalUpdateDetailsDiv.find(".incrementalUpdateParamvalue").val("");
				incrementalUpdateDetailsDiv.find(".incrementalUpdateParamColumnName").val("");
			}
		});
	  
	  $(document).on("click", ".wsApiMethodType", function(){
		  var wsApiMethodType = $(this).val();
		  var  addWsRequestBodyParamButton = $(this).parents(".wsApiDetailsDiv").find(".addWsRequestBodyParams");
		  var  wsApiBodyParam = $(this).parents(".wsApiDetailsDiv").find(".wsApiBodyParam");
		  var  wsApiBodyParamDiv = $(this).parents(".wsApiDetailsDiv").find(".wsApiBodyParamDiv"); 
		  if(wsApiMethodType == "POST"){
			  $(this).parents(".wsApiDetailsDiv").find(".paginationParamType").val("Body Parameter");
			  addWsRequestBodyParamButton.show();
		  }else{
			  $(this).parents(".wsApiDetailsDiv").find(".paginationParamType").val("Request Parameter");
			  addWsRequestBodyParamButton.hide();
			  wsApiBodyParamDiv.hide();
			  wsApiBodyParam.remove();
		  }
	  });
	  $(document).on("click", ".wsSubApiMethodType", function(){
		  var wsApiMethodType = $(this).val();
		  if(wsApiMethodType == "POST"){
			  $(this).parents(".wsManualSubUrlDiv").find(".subUrlPaginationParamType").val("Body Parameter");
		  }else{
			  $(this).parents(".wsManualSubUrlDiv").find(".subUrlPaginationParamType").val("Request Parameter");
		  }
	  });
	  
	  
	   $(document).on("click",".addWsRequestBodyParams",function(){ 
			  var wsApiRequestParam = $("#wsApiRequestParam").clone().removeAttr("id").addClass("wsApiBodyParam").show();
			  wsApiRequestParam.find("#deleteAddWsRequestParams").removeAttr("id").addClass("deleteAddWsRequestBodyParams");
			  wsApiRequestParam.find(".paramNameMandatory").remove();
			  $(this).parents(".wsApiDetailsDiv").find(".requestparamsBodyLable").show();
			  $(this).parents(".wsApiDetailsDiv").find(".wsApiBodyParamKeyValueDiv").append(wsApiRequestParam).show();
			  $(this).parents(".wsApiDetailsDiv").find(".wsApiBodyParamDiv").show();
	
     });
	   $(document).on("click",".deleteAddWsRequestBodyParams",function(){ 
		     var wsApiBodyParamLength =  $(this).parents(".wsApiDetailsDiv").find(".wsApiBodyParam");
	    	 if(wsApiBodyParamLength.length == 1){
		    	 $(this).parents(".wsApiDetailsDiv").find(".requestparamsBodyLable").hide();
		     }
	    	 var wsApiRequestParamLength =  $(this).parents(".wsApiDetailsDiv").find(".wsApiRequestParam");
	    	 if(wsApiRequestParamLength.length == 1){
		    	 $(this).parents(".wsApiDetailsDiv").find(".requestparamsLable").show();
		     }
		     var wsApiBodyParam = $(this).parents(".wsApiBodyParam").remove();
		    
	    });
	   function getTimezoneName() {
	        timezone = jstz.determine()
	        return timezone.name();
	    } 
	   
	   $(document).on("change","#dataSourceName,#flatDataSourceName,#webserviceDataSourceName,.dataSource_name",function(){
	    	var dataSourceName=  $("#dataSourceName option:selected").val().trim();
	    	var dataSourceOtherName=$("#flatDataSourceName option:selected").val().trim();
	    	var wsDataSourceName=$("#webserviceDataSourceName").val().trim();
	    	var dataSorce_view=$(".dataSource_name option:selected").val().trim();
	    	if(dataSourceName == "-1" || dataSourceOtherName == "-1" || wsDataSourceName == "-1" || dataSorce_view == "-1"){
		    	   $(".dataSourceOther,.flatDataSourceOther,.wsDataSourceOther").show();
		       }else{
		    	   $(".dataSourceOther,.flatDataSourceOther,.wsDataSourceOther").hide();
		       }
	    });
	   var scheduleType;
	   var scheduleId;
	   $(document).on('click', '.runDL', function(){
			var userID = $("#userID").val();
			var dlId = $(this).attr("data-dLId");
			var dlName = $(this).attr("data-dLName");
			scheduleType = $(this).attr("data-scheduletype");
		    scheduleId = $(this).attr("data-scheduleid");
			var token = $("meta[name='_csrf']").attr("content");
			var header = $("meta[name='_csrf_header']").attr("content");
			headers[header] = token;
			showAjaxLoader(true);
			var url = "/app/user/"+userID+"/getSourceInfo/"+dlId;
			var myAjax = common.loadAjaxCall(url,'GET','',headers);
			myAjax.done(function(result){
				showAjaxLoader(false);
				if(result != null && result.hasMessages){
					if(result.messages[0].code == "FAILED" || result.messages[0].code == "ERROR") {
   				         common.showErrorAlert(result.messages[0].text);
	    				 return false;
	    			  } 
					  else if(result.messages[0].code == "SUCCESS"){
                	      var dlInfo = result.object;
                	      var ilInfo = dlInfo.ilList;
                	      var ddlayoutData = dlInfo.ddlayoutList;
                	      $('.runDlSourcesDiv').empty();
                	      $('.ddLayoutParentDiv').empty();
                	      $('.dlDialogHeader').text('Standard Package');
                	      $('#hiddenDlId').attr('data-dlId', dlInfo.dL_id);
                	      if(dlInfo != null){
                	    	  if(ilInfo.length > 0){
                	    	    for(var i = 0; i < ilInfo.length; i++){
                	    		   var clientId=null;
	                	   			var iLId=null;
	                	   			var dLId=null;
	                	   			var ilName = null;
	                	   			var packageId=null;
	                	   			var connectionMappingId=null;
	                	   			var filePath = null;
	                	   			var fileType= null;
	                	   			var typeOfCommand= null;
	                	   			var iLquery= null;
	                	   			var connectionName = null;
	                	   			var connectionId = null;
	                	   			var connectionType= null;
	                	   			var databaseName= null;
	                	   			var server= null;
	                	   			var username= null;
	                	   			var procedureParameters= null;
	                	   			var webserviceName = null;
	                	   			var previewClass = null;
	                	   			var disabled = '';
	                	   			var sourceName =null;
	                	   			var sourceType = null;
		               	   			    iLId=ilInfo[i].iL_id != null ? ilInfo[i].iL_id : "";
		               	   			    dLId=dlInfo.dL_id != null ? dlInfo.dL_id : "";
		               	   			    ilName = ilInfo[i].iL_name != null ? ilInfo[i].iL_name : "";
                	    		   var cloneDiv = $('.ils-accordian-outer').clone().removeClass('ils-accordian-outer').addClass('ils-accordian-outer'+i).css('display','');
                	    		   $(cloneDiv).find('.accordion').attr('id','accordion'+i);
                	    		   $(cloneDiv).find('.ilName').text(ilName);
                	    		   $(cloneDiv).find('.dlSourceCheck').attr("data-ilId", iLId);
                	    		   
                	    		   for(var j =0; j < ilInfo[i].ilSources.length; j++){
                	    			   
                	    			   connectionMappingId=ilInfo[i].ilSources[j].connectionMappingId != null ? ilInfo[i].ilSources[j].connectionMappingId : "";
          	    	 	    		   clientId=ilInfo[i].ilSources[j].clientId != null ? ilInfo[i].ilSources[j].clientId : "";
	          	    	 	    		  if(ilInfo[i].ilSources[j].isFlatFile && !ilInfo[i].ilSources[j].isWebservice){
	                      					 filePath = ilInfo[i].ilSources[j].filePath != null ? ilInfo[i].ilSources[j].filePath.encodeHtml() : "";
	                      					 fileType= ilInfo[i].ilSources[j].fileType != null ? ilInfo[i].ilSources[j].fileType.encodeHtml() : "";
	                      				    }else if(!ilInfo[i].ilSources[j].isFlatFile && !ilInfo[i].ilSources[j].isWebservice){
	                      					  if(ilInfo[i].ilSources[j].iLConnection != null){
	                      						 connectionName = ilInfo[i].ilSources[j].iLConnection.connectionName != null ? ilInfo[i].ilSources[j].iLConnection.connectionName.encodeHtml() : "";
	                      						 connectionId = ilInfo[i].ilSources[j].iLConnection.connectionId != null ? ilInfo[i].ilSources[j].iLConnection.connectionId : "";
	                      						 connectionType= ilInfo[i].ilSources[j].iLConnection.connectionType != null ? ilInfo[i].ilSources[j].iLConnection.connectionType.encodeHtml() : "";
	                      						 databaseName= ilInfo[i].ilSources[j].iLConnection.database.name != null ? ilInfo[i].ilSources[j].iLConnection.database.name.encodeHtml() : "";
	                      						 server= ilInfo[i].ilSources[j].iLConnection.server != null ? ilInfo[i].ilSources[j].iLConnection.server.encodeHtml() : "";
	                      						 username= ilInfo[i].ilSources[j].iLConnection.username != null ? ilInfo[i].ilSources[j].iLConnection.username.encodeHtml() : "";
	                      						 disabled = ilInfo[i].ilSources[j].iLConnection.webApp && !ilInfo[i].ilSources[j].iLConnection.availableInCloud ? "disabled" : "";
	                      					   }
	      	                					 iLquery= ilInfo[i].ilSources[j].iLquery != null ? ilInfo[i].ilSources[j].iLquery.encodeHtml() : "";
	                      				      }else if(!ilInfo[i].ilSources[j].isFlatFile && ilInfo[i].ilSources[j].isWebservice){
	                  							  webserviceName = ilInfo[i].ilSources[j].webService.webserviceName.encodeHtml();
	                  							  iLquery= ilInfo[i].ilSources[j].iLquery != null ? ilInfo[i].ilSources[j].iLquery.encodeHtml() : "";
	                      					  }
			          	    	 	    		if(ilInfo[i].ilSources[j].isFlatFile && !ilInfo[i].ilSources[j].isWebservice){								
			          	    	 	    			sourceName = filePath;
			          	    	 	    			sourceType = 'Flat File';
												}else if(!ilInfo[i].ilSources[j].isFlatFile && !ilInfo[i].ilSources[j].isWebservice){
													sourceName = connectionName;
													sourceType = ilInfo[i].ilSources[j].ilSourceName + ' (Database)';
												}else if(!ilInfo[i].ilSources[j].isFlatFile && ilInfo[i].ilSources[j].isWebservice){
													sourceName = webserviceName;
													sourceType = 'Web Service';
												}
	          	    	 	    		  
                	    			   var ilSourceDiv =  $('.ilSourceChild').clone().removeClass('ilSourceChild').addClass('ilSourceChild'+j).css('display','');
                	    			   $(ilSourceDiv).find('input[name="ilSourceCheck"]').removeAttr("name").attr("name", "ilSourceCheck"+iLId);
                	    			   $(ilSourceDiv).find('.ilSourceCheck').attr("data-ilSourceId", connectionMappingId);
                	    			   $(ilSourceDiv).find('#ilSourceName').text(sourceName + " ---- " + sourceType);
                	    			   $(cloneDiv).find('.ilSourceParentDiv').append($(ilSourceDiv));
                	    		   }
                	    		   var a_href = $(cloneDiv).find('a');
                	    		   $(a_href).attr('data-parent','#accordion'+i);
                	    		   $(a_href).attr('href','#collapse'+i);
                	    		   $(cloneDiv).find('.accordion-body').attr('id','collapse'+i);
                	    		   $(".runDlSourcesDiv").append(cloneDiv);
                	    	   }
                	    	 }/*else{
                	    		 common.showErrorAlert(globalMessage['anvizent.package.label.noInputlayoutMapped']);
    		    				  return false;
                	    	 }*/
                	    	  
                	    	  for(var k = 0; k < ddlayoutData.length; k++){
               	    		   
               	    		   var id = ddlayoutData[k].id;
               	    		   var tableName = ddlayoutData[k].tableName;
               	    		   var tableDes = ddlayoutData[k].tableDes;
               	    		   var table5ructure = ddlayoutData[k].table5ructure;
               	    		   var selectQry = ddlayoutData[k].selectQry;
               	    		   var ddlTables = ddlayoutData[k].ddlTables;
               	    		   
               	    		   var ddlCloneDiv = $('.ddLayoutChild').clone().removeClass('ddLayoutChild').addClass('ddLayoutChild'+k).css('display', '');
               	    		   $(ddlCloneDiv).find('.ddlClassCheck').attr('data-ddlId', id);
               	    		   $(ddlCloneDiv).find('.ddlClassCheck').val(tableName);
               	    		   $(ddlCloneDiv).find('#ddlName').text(tableName);
               	    		   
               	    		   $('.ddLayoutParentDiv').append(ddlCloneDiv);
               	    	   }
                	      }else{
                	    	  common.showErrorAlert(globalMessage['anvizent.package.label.noDataFound']);
 		    				  return false;
                	      }
               	        var $radios = $('.dlexecutionRequired');
               	           $radios.prop('checked', false);
               	         if($radios.is(':checked') === false) {
               	              $radios.filter('[value=true]').prop('checked', true);
               	              $('.ddLayoutParentDiv').show();
               	             }
               	      $("#runDLSourcesPopup").modal('show');
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
	   
	   $(document).on("click",".dlSourceCheck, .ilSourceCheck",function(){
		   ;
		   var checked = $(this).attr("name");
		   if(checked == "dlSourceCheck"){
			    if($(this).is(":checked")){
				   $(this).parent().find(".ilSourceCheck").prop("checked",true);
			     }else{
				   $(this).parent().find(".ilSourceCheck").prop("checked",false);
				   $(this).parents('.collapseAndExpandDiv').parent().find(".selectAllCheckBoxClass").prop("checked",false);
			     }
		      }
		    else{
			   if ($(this).parents('#accordion-first-clone').parent().find('.dlSourceCheck').prop('checked') == true && this.checked == false){
				   $(this).parents('#accordion-first-clone').parent().find('.dlSourceCheck').prop('checked', false);
				   $(this).parents('.collapseAndExpandDiv').parent().find(".selectAllCheckBoxClass").prop("checked",false);
			   }
               if (this.checked == true) {
                   var flag = true;
                   $(this).parents('#accordion-first-clone').parent().find('.ilSourceCheck').each(
	                    function() {
	                        if (this.checked == false)
	                            flag = false;
	                    }
                   );
                   $(this).parents('#accordion-first-clone').parent().find('.dlSourceCheck').prop('checked', flag);
                   $(this).parents('.collapseAndExpandDiv').parent().find(".selectAllCheckBoxClass").prop("checked",flag);
               }
		   }
	   });
	   
	   $(document).on('click', '.selectAllCheckBoxClass', function(){
		   if($(this).is(":checked")){
			   $(this).parents('.selectAllDiv').parent().find(".dlSourceCheck").prop("checked",true);
			   $(this).parents('.selectAllDiv').parent().find(".ilSourceCheck").prop("checked",true);
		     }else{
			   $(this).parents('.selectAllDiv').parent().find(".dlSourceCheck").prop("checked",false);
			   $(this).parents('.selectAllDiv').parent().find(".ilSourceCheck").prop("checked",false);
		     }
	   });
	   
	   $(document).on('click','.dlexecutionRequired', function(){
		   var radioValue = $("input[name='dlexecutionRequired']:checked").val()
		   if(radioValue == "true"){
			   $('.ddLayoutParentDiv').show();
			   $('.ddlClassCheck').prop('checked', false);
			   
		   }else{
			   $('.ddLayoutParentDiv').hide();
		   }
	   });
	   
	   
	   $(document).on("click","#confirmDlRun", function(){
		   var userID = $("#userID").val();
		   var dlId = $('#hiddenDlId', document).attr("data-dlId");
		   var dlExecutionReq = $("input[name='dlexecutionRequired']:checked").val();
		   var timeZone = common.getTimezoneName();
		   var dldata = {
				     ilList : [],
				     ddlayoutList : [],
				     dL_id: dlId,
				     dlExecutionRequired : dlExecutionReq
				};
		   $('.dlSourceCheck', document).each(function(){
			   var ilId = $(this).attr("data-ilId");
			   var selectedSourceList = $("input[name=ilSourceCheck"+ilId+"]:checked", document);
			  
			    if(selectedSourceList.length > 0){
			    	var ilInfo = {
			    			    iL_id:ilId, 
			    			    ilSources: []
			    	           };
			    	selectedSourceList.each(function(){
			    		var ilSource  = {
			    				       connectionMappingId : $(this).attr("data-ilSourceId")
			    				       };
			    		ilInfo.ilSources.push(ilSource);
			    	});
			    	dldata.ilList.push(ilInfo);
			    	dldata.dlExecutionRequired = dlExecutionReq;
			    }
		   });
		   
		   if (dldata.ilList.length == 0 && dlExecutionReq == "false") {
			   common.showErrorAlert("Please choose at lease one source or dl execution");
    		   return false;
		   }
		   
		   if(dlExecutionReq == "true"){
		    	var selectedDDLs = $('.ddlClassCheck:checked', document);
			     if(selectedDDLs.length > 0){
			    	 selectedDDLs.each(function(){
			    		 var ddlInfo = {
				    		       id : $(this).attr('data-ddlId'), 
				    		       tableName : $(this).val()
				    	 }
			    		 dldata.ddlayoutList.push(ddlInfo);
			    	 });
			     }
		    }
		    var token = $("meta[name='_csrf']").attr("content");
			var header = $("meta[name='_csrf_header']").attr("content");
			headers[header] = token;
			
		   var url_runDl =  "/app/user/"+userID+"/runSources?timeZone="+timeZone+"&schedulerType="+scheduleType+"&schedulerId="+scheduleId;
		   showAjaxLoader(true);
		   var myAjax = common.postAjaxCall(url_runDl, 'POST', dldata, headers);
		    myAjax.done(function(result){
		    	showAjaxLoader(false);
		    	if(result != null && result.hasMessages){
		    		if(result.messages[0].code == "FAILED" || result.messages[0].code == "ERROR") {
  				         common.showErrorAlert(result.messages[0].text);
  				         if (scheduleId == 0) {
  				        	setTimeout(function(){location.reload()}, 3000);
  				         }
	    				 return false;
	    			  } 
					  else if(result.messages[0].code == "SUCCESS"){
						  $("#runDLSourcesPopup").modal('hide');
						  $("#successorfailure").empty().append("<div class='alert alert-success'>"+result.messages[0].text+"</div>").show();
		  				  setTimeout(function() { $("#successorfailure").hide().empty(); }, 10000);
		  				if (scheduleId == 0) {
  				        	setTimeout(function(){location.reload()}, 3000)
  				         }
		  				$("html, body").animate({ scrollTop: 0 }, "slow");
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
	   
	   $(document).on('click', '.runIL', function(){
		    var userID = $("#userID").val();
			var dlId = $(this).attr("data-dLId");
			var iLId = $(this).attr("data-iLId");
			scheduleType = $(this).attr("data-scheduletype");
		    scheduleId = $(this).attr("data-scheduleid");
			var iLName = $(this).attr("");
			var token = $("meta[name='_csrf']").attr("content");
			var header = $("meta[name='_csrf_header']").attr("content");
			headers[header] = token;
			showAjaxLoader(true);
			var ilrunUrl = "/app/user/"+userID+"/getSourceInfo/"+dlId+"/"+iLId;
			
			var myAjax = common.loadAjaxCall(ilrunUrl, 'GET', '', headers);
			myAjax.done(function(result){
				showAjaxLoader(false);
				
				if(result != null && result.hasMessages){
					if(result.messages[0].code == "FAILED" || result.messages[0].code == "ERROR") {
   				         common.showErrorAlert(result.messages[0].text);
	    				 return false;
	    			  } 
					  else if(result.messages[0].code == "SUCCESS"){
						  $('.runIlOptionsDiv').empty();
						    var dlInfo = result.object;
						    var ilInfo = dlInfo.ilInfo;
                	      $('.runIlHeader').text(ilInfo.iL_name);
                	      $("#hiddenDlIdforRunIl").attr("data-dlid", dlInfo.dL_id);
                	      $("#hiddenIlIdforRunIl").attr("data-ilid", ilInfo.iL_id);
						    var ilSources = ilInfo.ilSources;
						    var clientId=null;
            	   			var iLId=null;
            	   			var dLId=null;
            	   			var ilName = null;
            	   			var packageId=null;
            	   			var connectionMappingId=null;
            	   			var filePath = null;
            	   			var fileType= null;
            	   			var typeOfCommand= null;
            	   			var iLquery= null;
            	   			var connectionName = null;
            	   			var connectionId = null;
            	   			var connectionType= null;
            	   			var databaseName= null;
            	   			var server= null;
            	   			var username= null;
            	   			var procedureParameters= null;
            	   			var webserviceName = null;
            	   			var previewClass = null;
            	   			var disabled = '';
            	   			var sourceName =null;
            	   			var sourceType = null;
	      	   			    iLId=ilInfo.iLId != null ? ilInfo.iLId : "";
	      	   			    dLId=dlInfo.dLId != null ? dlInfo.dLId : "";
						  if(dlInfo != null){
							      for(var j = 0; j < ilSources.length; j++){
							    	  
							    	  connectionMappingId=ilSources[j].connectionMappingId != null ? ilSources[j].connectionMappingId : "";
         	    	 	    		   clientId=ilSources[j].clientId != null ? ilSources[j].clientId : "";
	          	    	 	    		  if(ilSources[j].isFlatFile && !ilSources[j].isWebservice){
	                      					 filePath = ilSources[j].filePath != null ? ilSources[j].filePath.encodeHtml() : "";
	                      					 fileType= ilSources[j].fileType != null ? ilSources[j].fileType.encodeHtml() : "";
	                      				    }else if(!ilSources[j].isFlatFile && !ilSources[j].isWebservice){
	                      					  if(ilSources[j].iLConnection != null){
	                      						 connectionName = ilSources[j].iLConnection.connectionName != null ? ilSources[j].iLConnection.connectionName.encodeHtml() : "";
	                      						 connectionId = ilSources[j].iLConnection.connectionId != null ? ilSources[j].iLConnection.connectionId : "";
	                      						 connectionType= ilSources[j].iLConnection.connectionType != null ? ilSources[j].iLConnection.connectionType.encodeHtml() : "";
	                      						 databaseName= ilSources[j].iLConnection.database.name != null ? ilSources[j].iLConnection.database.name.encodeHtml() : "";
	                      						 server= ilSources[j].iLConnection.server != null ? ilSources[j].iLConnection.server.encodeHtml() : "";
	                      						 username= ilSources[j].iLConnection.username != null ? ilSources[j].iLConnection.username.encodeHtml() : "";
	                      						 disabled = ilSources[j].iLConnection.webApp && !ilSources[j].iLConnection.availableInCloud ? "disabled" : "";
	                      					   }
	      	                					 iLquery= ilSources[j].iLquery != null ? ilSources[j].iLquery.encodeHtml() : "";
	                      				      }else if(!ilSources[j].isFlatFile && ilSources[j].isWebservice){
	                  							  webserviceName = ilSources[j].webService.webserviceName.encodeHtml();
	                  							  iLquery= ilSources[j].iLquery != null ? ilSources[j].iLquery.encodeHtml() : "";
	                      					  }
			          	    	 	    		if(ilSources[j].isFlatFile && !ilSources[j].isWebservice){								
			          	    	 	    			sourceName = filePath;
			          	    	 	    			sourceType = 'Flat File'
												}else if(!ilSources[j].isFlatFile && !ilSources[j].isWebservice){
													sourceName = connectionName;
													sourceType = 'Database';
												}else if(!ilSources[j].isFlatFile && ilSources[j].isWebservice){
													sourceName = webserviceName;
													sourceType = 'Web Service'
												}
			          	    	 	    		
			          	    	 	    var cloneIlDiv = $(".ilSources-outer").clone().removeClass("ilSources-outer").addClass(".ilSources-outer"+j).css('display', '');
			          	    	 	    $(cloneIlDiv).find('.sourceCheckClass').attr('data-connectionmappingid', connectionMappingId);
			          	    	 	    $(cloneIlDiv).find('.sourceName').text(sourceName+" ---- "+sourceType);
			          	    	 	    $('.runIlOptionsDiv').append(cloneIlDiv);
							      }
						  }else{
            	    	      common.showErrorAlert(globalMessage['anvizent.package.label.noDataFound']);
		    				  return false;
            	         }
						 $("#runIlPopup").modal('show');
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
	   
	   $(document).on('click', '.selectAllILCheckBoxClass', function(){
		   if($(this).is(":checked")){
			   $(this).parent().find(".sourceCheckClass").prop("checked",true);
		     }else{
			   $(this).parent().find(".sourceCheckClass").prop("checked",false);
		     }
	   });
	   
	  $(document).on('click', '#confirmIlRun', function(){
		  var userId = $("#userID").val();
		  var dlId = $("#hiddenDlIdforRunIl", document).attr('data-dlid');
		  var ilId = $("#hiddenIlIdforRunIl", document).attr('data-ilid');
		  var timeZone = common.getTimezoneName();
		  var dldata = {
				  ilList : [],
				  dL_id : dlId,
				  dlExecutionRequired : false
		  }
		   var selectedSourceList = $(".sourceCheckClass:checked", document);
		     if(selectedSourceList.length > 0){
			    	var ilInfo = {
			    			    iL_id:ilId, 
			    			    ilSources: []
			    	           };
			    	selectedSourceList.each(function(){
			    		var ilSource  = {
			    				       connectionMappingId : $(this).attr('data-connectionmappingid')
			    				       };
			    		ilInfo.ilSources.push(ilSource);
			    	});
			    	
			    	dldata.ilList.push(ilInfo);
			    } else {
		    		common.showErrorAlert("Please choose at lease one source");
		    		return false;
			    }
		     
		        var token = $("meta[name='_csrf']").attr("content");
				var header = $("meta[name='_csrf_header']").attr("content");
				    headers[header] = token;
				var url_runIL = "/app/user/"+userId+"/runSources?timeZone="+timeZone+"&schedulerType="+scheduleType+"&schedulerId="+scheduleId;
				 showAjaxLoader(true);
				 var myAjax = common.postAjaxCall(url_runIL, 'POST', dldata, headers);
				  myAjax.done(function(result){
					  showAjaxLoader(false);
				  if(result != null && result.hasMessages){
						if(result.messages[0].code == "FAILED" || result.messages[0].code == "ERROR") {
				         common.showErrorAlert(result.messages[0].text);
				         if (scheduleId == 0) {
	  				        	setTimeout(function(){location.reload()}, 3000)
  				         }
		  				 return false;
		  			    } 
						  else if(result.messages[0].code == "SUCCESS"){
							  $("#runIlPopup").modal('hide');
							  $("#successorfailure").empty().append("<div class='alert alert-success'>"+result.messages[0].text+"</div>").show();
			  				  	setTimeout(function() { $("#successorfailure").hide().empty(); }, 10000); 
			  				  if (scheduleId == 0) {
		  				        	setTimeout(function(){location.reload()}, 3000)
	  				          }
			  				  $("html, body").animate({ scrollTop: 0 }, "slow");
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
	  
	  $(document).on('click', '.scheduleDL', function() {
			var _this = $(this);
		  	
			$("input[name='runNowOrSchedule'][value='schedule']").click()
			standardPackage.schedulePackageOpenPopup(_this);
			standardPackage.populateTimeZones();
		});
	  
	  function checkValidation() {
			var recurrencePatternvalidation = $('input:radio[name=recurrencePattern]:checked').val();
				if ($('input:radio[name=recurrencePattern]').is(":checked")) {
					if (recurrencePatternvalidation == 'weekly') {
						 var weeksToRun = $("#weeksToRun").val();
						 common.clearValidations(["#weeksToRun","#weeklyRecurrencePatternValidation"]);
						 if(weeksToRun.match(/[^0-9]/) || weeksToRun == ""){
							common.showcustommsg("#weeksToRun", "Please enter week(s) in number.");
							return false;
						 }		 
						 if ($('input[type=checkbox]:checked').length == 0) {
							common.showcustommsg("#weeklyRecurrencePatternValidation", globalMessage['anvizent.package.label.pleaseChooseAtLeastOneDay']);
							return false;
						 }
					  }else if(recurrencePatternvalidation == 'hourly'){
							common.clearcustomsg("#scheduleStartDateValidation","[name='hourlyRadios']","#everyhour","#selectedhours + div");
							var scheduleStartDateVal = $("#scheduleStartDate").val();
							if (scheduleStartDateVal.length == 0) {
								common.showcustommsg("#scheduleStartDateValidation", globalMessage['anvizent.package.label.pleaseFillScheduleStartDate']);
								return false;
							}
							
							var typeOfHourRecurrence = $('input:radio[name=hourlyRadios]:checked').val();
							if (typeOfHourRecurrence) {
								
								if (typeOfHourRecurrence == 'every') {
									var noOfHours =  parseInt($("#everyhour").val(),10);
									if ( noOfHours ) {
										$("#everyhour").val(noOfHours);
									} else {
										common.showcustommsg("#everyhour", globalMessage['anvizent.package.message.invalidData']);
										return false;
									}
								}
								if (typeOfHourRecurrence == 'selected') {
									var selectedHours = $("#selectedhours").val();
									if ( !selectedHours ) {
										common.showcustommsg("#selectedhours + div", "Select hours");
										return false;
									}
								
								}
								
								
								
							} else {
								common.showcustommsg("[name='hourlyRadios']", globalMessage['anvizent.package.label.pleaseChooseOption']);
								return false;
							}
							
							
							
					   }
					} else {
					common.clearValidations(["#recurrencePatternValidation"]);
					common.showcustommsg("#recurrencePatternValidation", globalMessage['anvizent.package.label.pleaseChooseAnyOneOfRecurrencePattern']);
					return false;
				 }
				var rangeOfRecurrenceValidation = $('input:radio[name=rangeOfRecurrence]:checked').val();
				if ($('input:radio[name=rangeOfRecurrence]').is(":checked")) {
					common.clearValidations(["#rangeofRecurrenceValidation","#scheduleEndDateVaLidation"]);
					if (rangeOfRecurrenceValidation == 'ScheduleEndDate') {
						var scheduleEndDateVal = $("#scheduleEndDate").val();
						if (scheduleEndDateVal.length == 0) {
							common.showcustommsg("#scheduleEndDateVaLidation", globalMessage['anvizent.package.label.pleaseFillScheduleEndDate']);
							return false;
						}
						else{
							return true;
						}
					}
					return true;
				} else {
					common.clearValidations(["#rangeofRecurrenceValidation"]);
					common.showcustommsg("#rangeofRecurrenceValidation", globalMessage['anvizent.package.label.pleaseChooseAnyOneOfRangeOfRecurrence']);
					return false;
				}
			
		}
	  
	  $('input[type=radio][name="runNowOrSchedule"]').click(function() {
			common.clearcustomsg("#runNowOrSchedulevalidation");
			common.clearValidations(["#weeklyRecurrencePatternValidation","#recurrencePatternValidation","#scheduleStartDateValidation","#rangeofRecurrenceValidation","#scheduleEndDateVaLidation","#scheduleStartDateValidation"]);
			$("#RecurrencePattern").show();
			$("#scheduleTime").show();
			$("#RangeofRecurrence,#timeZoneDivPanel").show();
			var _this = $(this);
			
		    $("#scheduleOptionsDiv").hide();
			
			$("#confirmSchedule").prop("disabled", false);
			$("#scheduleOptionsDiv").show();
			$("input[name=recurrencePattern]").attr("checked",false);
			$("#dailyRecurrencePattern").hide();
			$("#weeklyRecurrencePattern").hide();
			$("#monthlyRecurrencePattern").hide();
			$("#yearlyRecurrencePattern").hide();
			$("#hourlyRecurrencePattern").hide();
			$("#scheduleStartDate").val("");
			$("#scheduleStartHours").val("00");
			$("#scheduleStartMinutes").val("00");
			$("input[name=rangeOfRecurrence]").attr("checked",false);
			$("#scheduleEndDate").val("");
			$("#scheduleEndDate").removeAttr("disabled");
			$("#scheduleEndDate").datepicker('option','minDate',0);
			$("#timesZone").val(common.getTimezoneName()).trigger("change");
		});

	$(' input[name="recurrencePattern"]').click(function() {
							 common.clearcustomsg("#recurrencePatternValidation");
							 $("#scheduleTime,#timeZoneDivPanel,#RangeofRecurrence").show();
							if ($(this).val() == "runnow" || $(this).val() == "daily") {
								// empty other fields
								$("#dailyRecurrencePattern").show();
								$("#weeklyRecurrencePattern").hide();
								$("#monthlyRecurrencePattern").hide();
								$("#yearlyRecurrencePattern").hide();
								$("#hourlyRecurrencePattern").hide();
							}
							if ($(this).val() == "once") {
								// empty other fields
								$("#dailyRecurrencePattern").hide();
								$("#weeklyRecurrencePattern").hide();
								$("#monthlyRecurrencePattern").hide();
								$("#yearlyRecurrencePattern").hide();
								$("#hourlyRecurrencePattern").hide();
								$("#scheduleTime,#timeZoneDivPanel,#RangeofRecurrence").hide();
							}
							if ($(this).val() == "hourly") {
								// empty other fields
								$("#hourlyRecurrencePattern").show();
								$("#minutesPatternValidation").hide();
								$("#dailyRecurrencePattern").hide();
								$("#weeklyRecurrencePattern").hide();
								$("#monthlyRecurrencePattern").hide();
								$("#yearlyRecurrencePattern").hide();
							}
							if ($(this).val() == "weekly") {
								// empty other fields
								$("#weeksToRun").val("1");
								$('input[name="weekDayCheckBox"]').each(function() {
									if ($(this).is(":checked")) {
										$(this).attr('checked', false);
									}
								});

								$("#dailyRecurrencePattern").hide();
								$("#weeklyRecurrencePattern").show();
								$("#monthlyRecurrencePattern").hide();
								$("#yearlyRecurrencePattern").hide();
								$("#hourlyRecurrencePattern").hide();
							}
							if ($(this).val() == "monthly") {
								// empty other fields

								$("#dayOfMonth").val($("#dayOfMonth option:last").val());
								$("#monthsToRun").val($("#monthsToRun option:first").val());

								$("#dailyRecurrencePattern").hide();
								$("#weeklyRecurrencePattern").hide();
								$("#monthlyRecurrencePattern").show();
								$("#yearlyRecurrencePattern").hide();
								$("#hourlyRecurrencePattern").hide();
							}
							if ($(this).val() == "yearly") {
								// empty other fields

								$("#monthOfYear").val("1");
								$("#dayOfYear").val("1");
								$("#dailyRecurrencePattern").hide();
								$("#weeklyRecurrencePattern").hide();
								$("#monthlyRecurrencePattern").hide();
								$("#yearlyRecurrencePattern").show();
								$("#hourlyRecurrencePattern").hide();
							}
						});

		$(' input[name="rangeOfRecurrence"]').click(function() {
			 common.clearcustomsg("#rangeofRecurrenceValidation");
			if ($(this).val() == "NoEndDate") {
				// empty other fields
				$("#noOfMaxOccurences").val("");
				$("#scheduleEndDate").val("");
				$("#scheduleEndDate").attr("disabled","disabled");
			}
			if ($(this).val() == "MaxOccurences") {
				// empty other fields
				$("#scheduleEndDate").val("");
				$("#scheduleEndDate").attr("disabled","disabled");

			}
			if ($(this).val() == "ScheduleEndDate") {
				// empty other fields
				$("#noOfMaxOccurences").val("");
				$("#scheduleEndDate").removeAttr("disabled");

			}
		});

		$("#monthOfYear").on( "change", function() {
					var _this = $(this);
					if (_this.val() == 2) {
						$("#dayOfYear option[value=30]").attr('disabled', true);
						$("#dayOfYear option[value=31]").attr('disabled', true);
					} else if (_this.val() == 4 || _this.val() == 6 || _this.val() == 9 || _this.val() == 11) {
						$("#dayOfYear option[value=30]").attr('disabled', false);
						$("#dayOfYear option[value=31]").attr('disabled', true);
					} else {
						$("#dayOfYear option[value=30]").attr('disabled', false);
						$("#dayOfYear option[value=31]").attr('disabled', false);

					}
				});
		$('.datepicker').datepicker({
			onSelect : function(date) {
				var toDate =  $("#scheduleEndDate"),
					minDate = $("#scheduleStartDate").val();
				var minDateVar = new Date((minDate));
				minDateVar.setDate(minDateVar.getDate() + 1);
				toDate.datepicker('option','minDate',minDateVar);
			},
			dateFormat : 'yy-mm-dd',
			defaultDate : new Date(),
			minDate : 0,
			changeMonth : true,
			changeYear : true,
			yearRange : "0:+20",
			numberOfMonths : 1
		});
		
		$("#confirmSchedule").on("click",function(){
			var jobRunType = $("input[name='runJobType']:checked").val(),
				fetchFrom = $("input[name='fetchSourceType']:checked").val(),
				runNowOrSchedule = $("input:radio[name='runNowOrSchedule']:checked").val();
			standardPackage.schedulePackage();
		});
		
		// unSchedulePackage
		var selectedUnscheduleDL = null;
		$(document).on("click",'.unScheduleDL',function(){
			selectedUnscheduleDL = $(this);
			$("#alertForUnScheduleDLPopUp").modal("show");	
		});
		
		$(document).on("click",'.confirmUnScheduleDL',function(){
			var scheduleid = selectedUnscheduleDL.data("scheduleid");
			var packageid = selectedUnscheduleDL.data("packageid");
			var dlid = selectedUnscheduleDL.data("dLI");
			var userId = $("#userID").val();
			var token = $("meta[name='_csrf']").attr("content");
	 		var header = $("meta[name='_csrf_header']").attr("content");
	 		headers[header] = token;
	 		var unSchedule = "UNSCHEDULED"
	 		var schedule = {
	 				scheduleId:scheduleid,
	 				packageId:packageid,
	 				scheduleType:unSchedule
	 		   }
	 		var url_getSourceDetails = "/app/user/" + userId + "/unScheduleDL";
	 		showAjaxLoader(true);
			var myAjax = common.loadAjaxCall(url_getSourceDetails, 'POST', schedule, headers);
			myAjax.done(function(result) {
				showAjaxLoader(false);
				
				if(result != null && result.hasMessages){
					if(result.messages[0].code == "SUCCESS"){
						var message = "UnScheduled Successfully"
						$("#alertForUnScheduleDLPopUp").modal("hide");
						$("#successOrErrorMessage").empty().append("<div class='alert alert-success'>"+message+"</div>").show();
	  				  	setTimeout(function() { $("#successOrErrorMessage").hide().empty(); }, 10000);  					  
	  				    //schedulePage.getPackageListForSchedule();
	  				  	setTimeout(function(){ window.location.reload(); }, 2000);
					}
					else{
						var errorMsg = "Unable to UnSchedule the Module"
						 $("#successOrErrorMessage").empty().append("<div class='alert alert-danger'>"+message+"</div>");
						 setTimeout(function() { $("#successOrErrorMessage").hide(); }, 10000);
					}
				}
				else{
					common.showErrorAlert(globalMessage['anvizent.package.label.unableToProcessYourRequest']);
				}
			});
		});
	  
	   $(document).on("click",".saveTrailingDlMap",function(){
		   var dL_id = $(this).attr('data-dLId');
		   var trailingMonths = $(this).closest('tr').find(".trialmonths").val();
		   var userId = $("#userID").val();
			var token = $("meta[name='_csrf']").attr("content");
	 		var header = $("meta[name='_csrf_header']").attr("content");
	 		headers[header] = token;
	 		selectData = {
	 				dL_id : dL_id,
	 				trailingMonths : trailingMonths
	 		}
	 		var url_saveDLTrailing = "/app/user/"+userID+"/saveDLTrailing";
	 		var myAjax = common.postAjaxCallObject(url_saveDLTrailing,'POST',selectData,headers);
		    myAjax.done(function(result) {
		    	showAjaxLoader(false);
		    		  if(result != null && result.hasMessages){
		    			  if(result.messages[0].code == "SUCCESS") {
		    				  setTimeout(function(){ window.location.reload(); }, 1000);
		    				  var message = '<div class="alert alert-success alert-dismissible" role="alert">'+''+result.messages[0].text+''+'</div>';
								$(".message-class").empty().append(message).show();
								setTimeout(function() { $(".message-class").hide(); }, 5000);
		    			  }
		    			  if(result.messages[0].code == "ERROR") {		    				  
								var message = '<div class="alert alert-danger alert-dismissible" role="alert">'+''+result.messages[0].text+''+'</div>';
								$(".message-class").empty().append(message).show();
								setTimeout(function() { $(".message-class").hide(); }, 5000);
			    				return false;
		    			} 
		    		  }else{
		    			  standardPackage.showMessage(globalMessage['anvizent.package.label.operationFailedPleaseTryAgain']);
		    		  }
		    });
	   })
	   
	   $(document).on("click",".updateTrailingDlMapId",function(){
		   var dL_id = $(this).attr('data-dLId');
		   var trailingMonths = $(this).closest('tr').find(".trialmonths").val();
		   var userId = $("#userID").val();
			var token = $("meta[name='_csrf']").attr("content");
	 		var header = $("meta[name='_csrf_header']").attr("content");
	 		headers[header] = token;
	 		selectData = {
	 				dL_id : dL_id,
	 				trailingMonths : trailingMonths
	 		}
	 		var url_saveDLTrailing = "/app/user/"+userID+"/updateDLTrailing";
	 		var myAjax = common.postAjaxCallObject(url_saveDLTrailing,'POST',selectData,headers);
		    myAjax.done(function(result) {
		    	showAjaxLoader(false);
		    		  if(result != null && result.hasMessages){
		    			  if(result.messages[0].code == "SUCCESS") {
		    				  var message = '<div class="alert alert-success alert-dismissible" role="alert">'+''+result.messages[0].text+''+'</div>';
								$(".message-class").empty().append(message).show();
								setTimeout(function() { $(".message-class").hide(); }, 5000);
		    			  }
		    			  if(result.messages[0].code == "ERROR") {	
								var message = '<div class="alert alert-danger alert-dismissible" role="alert">'+''+result.messages[0].text+''+'</div>';
								$(".message-class").empty().append(message).show();
								setTimeout(function() { $(".message-class").hide(); }, 5000);
			    				return false;
		    			} 
		    		  }else{
		    			  standardPackage.showMessage(globalMessage['anvizent.package.label.operationFailedPleaseTryAgain']);
		    		  }
		    		  $("html, body").animate({ scrollTop: 0 }, "slow"); 
		    });
	   })
}

