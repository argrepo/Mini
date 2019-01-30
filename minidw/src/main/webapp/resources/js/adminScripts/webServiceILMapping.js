var webService = {
		initialPage : function(){
			if($("select#wsTemplateId").length){
				$("#wsTemplateId").select2({               
	                allowClear: true,
	                theme: "classic"
				});
			}
			
			$("#iLsTable").DataTable({"language": {
	                "url": selectedLocalePath
	            }});
			if($("#wsApiMappingBlocks .wsApiMappingBlock").length == "0"){
				$(".saveWebService").prop("disabled",true);
			}
		},
		changeIndices : function(){
			var count = $("#wsApiMappingBlocks .wsApiMappingBlock").length;
			for(var i= 0; i<count; i++){
				$("#wsApiMappingBlocks .wsApiMappingBlock").each(function(j,row){
					if(i == j){
						$(row).find(".wsApiField").each(function(){
							var str = $(this).attr("name");
							var index = str.substring(str.indexOf("["),str.indexOf("]")+1);
							$(this).prop("name",$(this).attr("name").split(index).join("["+i+"]"));
						});
						$(row).find(".getPathParams").val(i);
						$(row).find("a").prop("href","#collapse"+i);
						$(row).find("#collapse0").attr("id","collapse"+i);
					}
				});
			}
		},
		addRequestParameters : function(){
			$("#wsApiMappingBlocks .wsApiMappingBlock").each(function(i,v){
				var mainDiv = $(v);
				var paramArray = mainDiv.find(".reqParams").val();
				if (paramArray) {
					var paramArrayObj = JSON.parse(paramArray);
					$.each(paramArrayObj,function(ind,param){
						var newParamTr = mainDiv.find("#requestParamsTable tfoot tr:first").clone();
						$(newParamTr).removeAttr("style class");
						newParamTr.find(".paramValue").val(param['paramName']);
						newParamTr.find(".isMandatory").prop({"checked":param['isMandatory'], "disabled":false});
						newParamTr.find(".isPassword").prop({"checked":param['ispasswordField'], "disabled":false});
						mainDiv.find("#requestParamsTable tbody").append(newParamTr);
					});
				}
				
				var bodyArray = mainDiv.find(".bodyParams").val();
				if (bodyArray) {
					var paramArrayObj = JSON.parse(bodyArray);
					$.each(paramArrayObj,function(ind,param){
						var newParamTr = mainDiv.find("#bodyParamsTable tfoot tr:first").clone();
						$(newParamTr).removeAttr("style class");
						newParamTr.find(".paramValue").val(param['paramName']);
						newParamTr.find(".isMandatory").prop({"checked":param['isMandatory'], "disabled":false});
						newParamTr.find(".isPassword").prop({"checked":param['ispasswordField'], "disabled":false});
						mainDiv.find("#bodyParamsTable tbody").append(newParamTr);
					});
				}
				
				var paginationRequestParamsArray = mainDiv.find(".paginationRequestParamsData").val();
				var paginationRequired = mainDiv.find(".paginationRequired:checked").val() == 'yes' ? true : false;
				var paginationType = mainDiv.find(".paginationOffsetDateType:checked").val();
				if (paginationRequired && paginationRequestParamsArray) {
					var paramArrayObj = JSON.parse(paginationRequestParamsArray);
					if(paginationType == 'offset'){
						$.each(paramArrayObj,function(ind,param){
							mainDiv.find(".paginationParamType").val(param['paginationParamType']);
							mainDiv.find(".paginationOffSetRequestParamName").val(param['paginationOffSetRequestParamName']);
							mainDiv.find(".paginationOffSetRequestParamValue").val(param['paginationOffSetRequestParamValue']);
							mainDiv.find(".paginationLimitRequestParamName").val(param['paginationLimitRequestParamName']);
							mainDiv.find(".paginationLimitRequestParamValue").val(param['paginationLimitRequestParamValue']);
							mainDiv.find(".paginationObjectName").val(param['paginationObjectName']);
							mainDiv.find(".paginationSearchId").val(param['paginationSearchId']);
							mainDiv.find(".PaginationSoapBody").val(param['PaginationSoapBody']);
							mainDiv.find(".paginationOffSetType").show();
							mainDiv.find(".paginationDateType").hide();
							mainDiv.find(".paginationOtherType").hide();
						});
					}else if(paginationType == 'date'){
						$.each(paramArrayObj,function(ind,param){
							mainDiv.find(".paginationParamType").val(param['paginationParamType']);
							mainDiv.find(".paginationStartDateParam").val(param['paginationStartDateParam']);
							mainDiv.find(".paginationEndDateParam").val(param['paginationEndDateParam']);
							mainDiv.find(".paginationStartDate").val(param['paginationStartDate']);
							mainDiv.find(".paginationDateRange").val(param['paginationDateRange']);
							mainDiv.find(".paginationDateType").show();
							mainDiv.find(".paginationOffSetType").hide();
							mainDiv.find(".paginationOtherType").hide();
							mainDiv.find(".paginationStartDate").datepicker({
									dateFormat : 'yy-mm-dd',
									defaultDate : new Date(),
									changeMonth : true,
									changeYear : true, 
									yearRange : "0:+20",
									numberOfMonths : 1
								});
						});
					}else{
						$.each(paramArrayObj,function(ind,param){
							mainDiv.find(".paginationParamType option:first").prop("selected", "selected");
							mainDiv.find(".paginationOtherRequestKeyParam").val(param['paginationHyperLinkPattern']);
							mainDiv.find(".paginationOtherRequestLimit").val(param['paginationHypermediaPageLimit']);
							mainDiv.find(".paginationOtherType").show();
							mainDiv.find(".paginationParamTypeDiv").hide();
							mainDiv.find(".paginationOffSetType").hide();
							mainDiv.find(".paginationDateType").hide();
						});
					}
				}else{
					mainDiv.find("input[value='no']").prop("checked",true);
					mainDiv.find("input[value='offset']").prop("checked",false);
					mainDiv.find("input[value='date']").prop("checked",false);
					mainDiv.find("input[value='hypermedia']").prop("checked",false);					
					mainDiv.find(".paginationOffSetType").hide();
					mainDiv.find(".paginationDateType").hide();
					mainDiv.find(".paginationOtherType").hide();
				}
				
				var incrementalUpdateparamdArray = mainDiv.find(".incrementalUpdateparamdata").val();
				var incrementalUpdate = mainDiv.find(".incrementalUpdate").prop("checked");
				
				if (incrementalUpdate && incrementalUpdateparamdArray) {
					var paramArrayObj = JSON.parse(incrementalUpdateparamdArray);
					$.each(paramArrayObj,function(ind,param){
						mainDiv.find(".incrementalUpdateParamName").val(param['incrementalUpdateParamName']);
						mainDiv.find(".incrementalUpdateParamvalue").val(param['incrementalUpdateParamvalue']);
						mainDiv.find(".incrementalUpdateParamColumnName").val(param['incrementalUpdateParamColumnName']);
						mainDiv.find(".incrementalUpdateParamType").val(param['incrementalUpdateParamType']);
						mainDiv.find(".incrementalUpdateDetailsDiv").show();
					});
				}
			});
		},
		addPathParameters : function(){
			$("#wsApiMappingBlocks .wsApiMappingBlock").each(function(i,v){
				
				var mainDiv = $(v);
				var paramArray = mainDiv.find(".apiPathParams").val();
				var baseUrl = mainDiv.find(".baseUrl").val();
				
				if (paramArray) {
					var paramArrayObj = JSON.parse(paramArray);
					
					$.each(paramArrayObj,function(j, param){
						var pathParamDetailsBlock = $("#pathParamDetailsSampleBlock").clone();
						$(pathParamDetailsBlock).removeAttr("style id");
						pathParamDetailsBlock.find(".pathParamName").text(param['paramName']);
						
						var valueType = param['valueType'];
						pathParamDetailsBlock.find(".pathParamValueType").prop("name","pathParamValueType"+i+j)
						if(valueType == "M"){
							pathParamDetailsBlock.find("input[value='M']").prop("checked",true);
						}
						else{
							pathParamDetailsBlock.find("input[value='S']").prop("checked",true);
							
							var subUrlObj = param['subUrldetails'];
							var subUrlBlock = pathParamDetailsBlock.find(".subUrlBlock");
							$(subUrlBlock).css("display","");
							var methodType = subUrlObj["methodType"];
							var subUrlPaginationRequired = subUrlObj["subUrlPaginationRequired"];
							var subUrlPaginationType = subUrlObj["subUrlPaginationType"];
							var subUrlPaginationStartDateParam = subUrlObj["subUrlPaginationStartDateParam"];
							var subUrlPaginationEndDateParam = subUrlObj["subUrlPaginationEndDateParam"];
							var subUrlPaginationStartDate = subUrlObj["subUrlPaginationStartDate"];
							var subUrlPaginationDateRange = subUrlObj["subUrlPaginationDateRange"];
							var subUrlPaginationParamType = subUrlObj["subUrlPaginationParamType"];
							
							var subUrlPaginationOffSetRequestParamName = subUrlObj["subUrlPaginationOffSetRequestParamName"];
							var subUrlPaginationOffSetRequestParamValue = subUrlObj["subUrlPaginationOffSetRequestParamValue"];
							var subUrlPaginationLimitRequestParamName = subUrlObj["subUrlPaginationLimitRequestParamName"];
							var subUrlPaginationLimitRequestParamValue = subUrlObj["subUrlPaginationLimitRequestParamValue"];
							
							var subUrlPaginationOtherRequestParamkey = subUrlObj["paginationHyperLinkPattern"];
							var subUrlPaginationOtherRequestLimit = subUrlObj["paginationHypermediaPageLimit"];
							
							subUrlBlock.find(".subUrl").val(subUrlObj["url"]);
							if(baseUrl != null && baseUrl != ''){
								subUrlBlock.find(".baseUrlForSubUrl").text("["+baseUrl+"]");
							}
							if(subUrlObj["baseUrlRequired"]){
								subUrlBlock.find(".baseUrlRequired").prop("checked",true);
							}else{
								subUrlBlock.find(".baseUrlRequired").prop("checked",false);
							}
							subUrlBlock.find(".subUrlResObj").val(subUrlObj["responseObjName"]);
							subUrlBlock.find(".subUrlMethodType").prop("name","subUrlMethodType"+i+j);
							
							if(methodType == "GET"){
								subUrlBlock.find("input[value='GET']").prop("checked",true);
							}else{
								subUrlBlock.find("input[value='POST']").prop("checked",true);
							}
							subUrlBlock.find(".subUrlPaginationRequired").prop("name","subUrlPaginationRequired"+i+j);
							subUrlBlock.find(".subUrlPaginationOffsetDateType").prop("name","subUrlPaginationOffsetDateType"+i+j);
							if(subUrlPaginationRequired){
								subUrlBlock.find(".subUrlPaginationType").show();
								subUrlBlock.find("input[value='yes']").prop("checked",true);
								subUrlBlock.find(".subUrlPaginationParamType").val(subUrlPaginationParamType);
								if(subUrlPaginationType == 'offset'){
									subUrlBlock.find("input[value='offset']").prop("checked",true);
									subUrlBlock.find(".subUrlPaginationOffSetRequestParamName").val(subUrlPaginationOffSetRequestParamName);
									subUrlBlock.find(".subUrlPaginationOffSetRequestParamValue").val(subUrlPaginationOffSetRequestParamValue);
									subUrlBlock.find(".subUrlPaginationLimitRequestParamName").val(subUrlPaginationLimitRequestParamName);
									subUrlBlock.find(".subUrlPaginationLimitRequestParamValue").val(subUrlPaginationLimitRequestParamValue);
									subUrlBlock.find(".subUrlPaginationOffSetType").show();
									subUrlBlock.find(".subUrlPaginationDateType").hide();
									subUrlBlock.find(".subUrlPaginationOtherType").hide();
								}else if(subUrlPaginationType == 'date'){
									subUrlBlock.find(".subUrlPaginationStartDate").datepicker({
											dateFormat : 'yy-mm-dd',
											defaultDate : new Date(),
											changeMonth : true,
											changeYear : true, 
											yearRange : "0:+20",
											numberOfMonths : 1
										});
									subUrlBlock.find("input[value='date']").prop("checked",true);
									subUrlBlock.find(".subUrlPaginationStartDate").val(subUrlPaginationStartDate);
									subUrlBlock.find(".subUrlPaginationDateRange").val(subUrlPaginationDateRange);
									subUrlBlock.find(".subUrlPaginationStartDateParam").val(subUrlPaginationStartDateParam);
									subUrlBlock.find(".subUrlPaginationEndDateParam").val(subUrlPaginationEndDateParam);
									subUrlBlock.find(".subUrlPaginationDateType").show();
									subUrlBlock.find(".subUrlPaginationOffSetType").hide();
									subUrlBlock.find(".subUrlPaginationOtherType").hide();
								}else{
									subUrlBlock.find("input[value='hypermedia']").prop("checked",true);
									subUrlBlock.find(".subUrlPaginationOtherRequestParamkey").val(subUrlPaginationOtherRequestParamkey);
									subUrlBlock.find(".subUrlPaginationOtherRequestLimit").val(subUrlPaginationOtherRequestLimit);
									subUrlBlock.find(".subUrlPaginationParamType option:first").prop("selected", "selected");
									subUrlBlock.find(".subUrlPaginationOtherType").show();
									subUrlBlock.find(".subUrlPaginationParamTypeDiv").hide();
									subUrlBlock.find(".subUrlPaginationOffSetType").hide();
									subUrlBlock.find(".subUrlPaginationDateType").hide();
								}
							}else{
								subUrlBlock.find("input[value='no']").prop("checked",true);
								subUrlBlock.find("input[value='offset']").prop("checked",false);
								subUrlBlock.find("input[value='date']").prop("checked",false);
								subUrlBlock.find("input[value='hypermedia']").prop("checked",false);
								subUrlBlock.find(".subUrlPaginationDateType").hide();
								subUrlBlock.find(".subUrlPaginationOffSetType").hide();
								subUrlBlock.find(".subUrlPaginationDateType").hide();
							}
						}
						mainDiv.find(".pathParamsDetailsBlocks").append(pathParamDetailsBlock);
					});
				}
			});
		},
		getPathParams : function(source,pattern){
		  var pathParams = [];   var lastIndex = 0;
		  while(source.indexOf(pattern,lastIndex) != -1) {
			  var param = "";
			  var startIndex = source.indexOf(pattern, lastIndex);
			  var endIndex = source.indexOf("}",startIndex);
			  if(endIndex != -1){
				  param = source.substring(startIndex+2,endIndex);
			  
				  if ( pathParams.indexOf(param) == -1 ) {
					  pathParams.push(param);
				  }
				  
				  lastIndex = endIndex;
			  }
			  else{
				  break;
			  }
		  }
		  return pathParams;
	  },	
	
};

if($(".webServiceILMapping-page").length){
	

	
	webService.initialPage();
	webService.addRequestParameters();
	webService.addPathParameters();
	
	$(document).on("click", ".addOrEdit", function(){
		var iLId = $(this).val();
		$("#iLId").val(iLId);
		$("#webServiceILMapping").prop("action",$("#edit").val());
		this.form.submit();
		showAjaxLoader(true);
	});
	
	$(document).on("change","#wsTemplateId",function(){
		this.form.submit();
		showAjaxLoader(true);
	});
	
	$(document).on("click",".addRequestParam",function(){
		var requestKeyValue = $(this).parents("#requestParamsTable").find("tfoot tr.data-row").clone();
		$(requestKeyValue).removeAttr("style class");
		$(this).parents("#requestParamsTable").append(requestKeyValue);
	});
	
	$(document).on("click",".deleteRequestParam",function(){ 		
 		$(this).parents("tr").remove(); 		 			 
 	});
	

	$(document).on("click",".addBodyParam",function(){
		var requestKeyValue = $(this).parents("#bodyParamsTable").find("tfoot tr.data-row").clone();
		$(requestKeyValue).removeAttr("style class");
		$(this).parents("#bodyParamsTable").append(requestKeyValue);
	});
	
	$(document).on("click",".deleteBodyParam",function(){ 		
 		$(this).parents("tr").remove(); 		 			 
 	});
	
	
	$(document).on("click", ".deleteWsApiBlock", function(){
		$(this).parents(".wsApiMappingBlock").remove();
		webService.changeIndices();
		if($("#wsApiMappingBlocks .wsApiMappingBlock").length == "0"){
			$(".saveWebService").prop("disabled",true);
		}
	});
	
	$(document).on("click", ".addNewWsApiBlock", function(){
		var wsApiMappingBlock = $("#wsApiBlock .wsApiMappingBlock").clone();
		$("#wsApiMappingBlocks").append(wsApiMappingBlock);
		webService.changeIndices();
		$(".saveWebService").prop("disabled",false);
	});
	
	var mappingDetails = $("#mappingDetails").val();
	if(mappingDetails == ''){
		$(".addNewWsApiBlock").trigger("click");
	}
	
	$(document).on("click",".saveWebService", function(){
		common.clearValidations([".apiName, .apiUrl, .methodTypeValidation, .paramValue, .pathParamValue, .subUrl, " +
				".subUrlResObj, .subUrlMethodTypeValidation, .pathParamValueType, .responseObjectName, " +
				".paginationOffSetRequestParamName,.paginationOffSetRequestParamValue,.incrementalUpdateParamName," +
				".paginationLimitRequestParamName,.paginationLimitRequestParamValue," +
				" .incrementalUpdateParamvalue, .responseColumnObjectName,.subUrlPaginationRequired," +
				".subUrlPaginationOffSetRequestParamName," +
				".subUrlPaginationLimitRequestParamName," +
				".subUrlPaginationOffSetRequestParamValue,.subUrlPaginationLimitRequestParamValue," +
				".subUrlPaginationStartDateParam,.subUrlPaginationStartDate,.subUrlPaginationDateRange," +
				".subUrlPaginationEndDateParam,.paginationEndDateParam,.paginationStartDateParam,.subUrlPaginationOffsetDateType,.paginationOffsetDateType, .paginationOtherRequestKeyParam, .subUrlPaginationOtherRequestParamkey"]);
		var validStatus = true,
			arrayApiName = [];
		
		$("#wsApiMappingBlocks .wsApiMappingBlock").each(function(i,val){
			var apiName = $(this).find(".apiName").val(),
				apiUrl = $(this).find(".apiUrl").val(),
				baseUrlRequired = $(this).find(".baseUrlRequired").val(),
				apiMethodType = $(this).find('.apiMethodType').is(':checked'),
				apiMethodTypeVal = $(this).find("input[name='webServiceApis[0].apiMethodType']:checked").val(),
				apiResObj = $(this).find(".responseObjectName").val(),
				soapBodyElement = $(this).find(".soapBodyElement").val(),
				requestParamsArray = [],
				bodyParamsArray = [],
				inclUpdateParamsArray = [],
				paginationRequestParamsArray = [],
				pathParamsArray = [],
				collapseDiv = $(this).find(".collapseDiv"),
				status = true;
			
			if(apiName == ''){
				common.showcustommsg($(this).find(".apiName"), globalMessage['anvizent.package.label.pleaseEnterAPIName'], $(this).find(".apiName"));
				status = false;
			}else{
				arrayApiName.push(apiName);
			} 
			
			if(apiUrl == ''){
				common.showcustommsg($(this).find(".apiUrl"), globalMessage['anvizent.package.label.pleaseEnterAPIURL'], $(this).find(".apiUrl"));
				status = false;
			}
			if(!apiMethodType){
				common.showcustommsg($(this).find(".methodTypeValidation"), globalMessage['anvizent.package.label.pleaseChooseMethodType'], 
						$(this).find(".methodTypeValidation"));
				status = false;
			}
			
			// Request Params
			$(this).find("#requestParamsTable tbody tr").each(function(){
				var isMandatory = $(this).find(".isMandatory").is(":checked"),
					isPassword = $(this).find(".isPassword").is(":checked"),
					paramValue = $(this).find(".paramValue").val()
				if(((isMandatory || isPassword) ) && paramValue == ''){
					common.showcustommsg($(this).find(".paramValue"), globalMessage['anvizent.package.label.pleaseEnterValue'], $(this).find(".paramValue"));
					status = false;
				}
				else if(paramValue != ''){
					var paramsObj = {};
					paramsObj['paramName'] = paramValue;
					paramsObj['isMandatory'] = isMandatory;
					paramsObj['ispasswordField'] = isPassword;
						
					if(!$.isEmptyObject(paramsObj))
						requestParamsArray.push(paramsObj);
				}
			});

			if(requestParamsArray.length > 0)
				$(this).find(".reqParams").val(JSON.stringify(requestParamsArray));
			else
				$(this).find(".reqParams").val("");
			

			// Body Params
			$(this).find(".bodyParams").val("");
			if ( apiMethodTypeVal == "POST" ) {
				$(this).find("#bodyParamsTable tbody tr").each(function(){
					var isMandatory = $(this).find(".isMandatory").is(":checked"),
						isPassword = $(this).find(".isPassword").is(":checked"),
						paramValue = $(this).find(".paramValue").val()
					if(((isMandatory || isPassword) ) && paramValue == ''){
						common.showcustommsg($(this).find(".paramValue"), globalMessage['anvizent.package.label.pleaseEnterValue'], $(this).find(".paramValue"));
						status = false;
					}
					else if(paramValue != ''){
						var paramsObj = {};
						paramsObj['paramName'] = paramValue;
						paramsObj['isMandatory'] = isMandatory;
						paramsObj['ispasswordField'] = isPassword;
							
						if(!$.isEmptyObject(paramsObj))
							bodyParamsArray.push(paramsObj);
					}
				});
				
				if(bodyParamsArray.length > 0)
					$(this).find(".bodyParams").val(JSON.stringify(bodyParamsArray));
			}
			 
			var paginationRequestParamsObject = {};
			var paginationRequired = $($(this).closest("div.wsApiMappingBlock")).find(".paginationRequired:checked").val() == 'yes' ? true : false ;
			var paginationType = $($(this).closest("div.wsApiMappingBlock")).find(".paginationOffsetDateType:checked").val();
			console.log("paginationType",paginationType);
			var paginationOffSetTypeDiv = $($(this).closest("div.wsApiMappingBlock")).find(".paginationOffSetType");
			var paginationDateType = $($(this).closest("div.wsApiMappingBlock")).find(".paginationDateType");
			var paginationOtherType = $($(this).closest("div.wsApiMappingBlock")).find(".paginationOtherType");
			var paginationParamType = $($(this).closest("div.wsApiMappingBlock")).find(".paginationParamType");
			if ( paginationRequired ) {
				if(paginationType != 'hypermedia'){
					paginationRequestParamsObject['paginationParamType']  =  paginationParamType.val();
				}
				 
			 if(paginationType != 'undefined' && paginationType != null){ 
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
						status = false;
					}
					if(paginationOffSetRequestParamValue == '' || paginationOffSetRequestParamValue == 0 || !$.isNumeric(paginationOffSetRequestParamValue)){
						common.showcustommsg(paginationOffSetTypeDiv.find(".paginationOffSetRequestParamValue"), globalMessage['anvizent.package.label.pleaseenternumericvalueexcept0'], paginationOffSetTypeDiv.find(".paramValue"));
						status = false;
					}
					if(paginationLimitRequestParamName == ''){
						common.showcustommsg(paginationOffSetTypeDiv.find(".paginationLimitRequestParamName"), globalMessage['anvizent.package.label.pleaseEnterValue'], paginationOffSetTypeDiv.find(".paramValue"));
						status = false;
					}
					if(paginationLimitRequestParamValue == '' || paginationLimitRequestParamValue == 0 || !$.isNumeric(paginationLimitRequestParamValue)){
						common.showcustommsg(paginationOffSetTypeDiv.find(".paginationLimitRequestParamValue"),globalMessage['anvizent.package.label.pleaseenternumericvalueexcept0'], paginationOffSetTypeDiv.find(".paramValue"));
						status = false;
					}
					
					paginationRequestParamsObject['paginationOffSetRequestParamName']  =  paginationOffSetRequestParamName;
					paginationRequestParamsObject['paginationOffSetRequestParamValue'] = paginationOffSetRequestParamValue;
					paginationRequestParamsObject['paginationLimitRequestParamName'] = paginationLimitRequestParamName;
					paginationRequestParamsObject['paginationLimitRequestParamValue']  =  paginationLimitRequestParamValue;
					paginationRequestParamsObject['paginationObjectName']  =  paginationObjectName;
					paginationRequestParamsObject['paginationSearchId']  =  paginationSearchId;
					paginationRequestParamsObject['PaginationSoapBody']  =  PaginationSoapBody;
					
				}else if(paginationType == 'date'){
					var paginationStartDateParam =  paginationDateType.find(".paginationStartDateParam").val();
					var paginationEndDateParam =   paginationDateType.find(".paginationEndDateParam").val();
					var paginationStartDate = paginationDateType.find(".paginationStartDate").val();
					var paginationDateRange =   paginationDateType.find(".paginationDateRange").val();
					
					if(paginationStartDateParam == ''){ 
						common.showcustommsg(paginationDateType.find(".paginationStartDateParam"), globalMessage['anvizent.package.label.pleaseEnterValue'], paginationDateType.find(".paginationStartDateParam"));
						status = false;
					}
					if(paginationEndDateParam == ''){ 
						common.showcustommsg(paginationDateType.find(".paginationEndDateParam"), globalMessage['anvizent.package.label.pleaseEnterValue'], paginationDateType.find(".paginationEndDateParam"));
						status = false;
					}
					if(paginationStartDate == ''){
						common.showcustommsg(paginationDateType.find(".paginationStartDate"), globalMessage['anvizent.package.label.pleasechoosestartdate'],paginationDateType.find(".paginationStartDate"));
						status = false;
					}
					if(paginationDateRange == ''){
						common.showcustommsg(paginationDateType.find(".paginationDateRange"),globalMessage['anvizent.package.label.pleaseSelectdaterange'],paginationDateType.find(".paginationDateRange"));
						status = false;
					}
					
					paginationRequestParamsObject['paginationStartDateParam']  =  paginationStartDateParam;
					paginationRequestParamsObject['paginationEndDateParam']  =  paginationEndDateParam;
					paginationRequestParamsObject['paginationStartDate'] = paginationStartDate;
					paginationRequestParamsObject['paginationDateRange'] = paginationDateRange;
					
				}else {
					var paginationOtherRequestKeyParam = paginationOtherType.find(".paginationOtherRequestKeyParam").val();
					var paginationOtherRequestLimit = paginationOtherType.find(".paginationOtherRequestLimit").val();
					if(paginationOtherRequestKeyParam == ''){ 
						common.showcustommsg(paginationOtherType.find(".paginationOtherRequestKeyParam"), globalMessage['anvizent.package.label.pleaseEnterKeyParam'], paginationOtherType.find(".paginationOtherRequestKeyParam"));
						status = false;
					}
					
					paginationRequestParamsObject['paginationHyperLinkPattern'] = paginationOtherRequestKeyParam;
					paginationRequestParamsObject['paginationHypermediaPageLimit'] = paginationOtherRequestLimit;
				}
				
				if(!$.isEmptyObject(paginationRequestParamsObject))
					paginationRequestParamsArray.push(paginationRequestParamsObject);
			 }else{
				 common.showcustommsg($($(this).closest("div.wsApiMappingBlock")).find(".paginationOffsetDateType"),'please choose pagination type.',$($(this).closest("div.wsApiMappingBlock")).find(".paginationOffsetDateType"));
				 status = false;
			 }
		   }
			if(paginationRequestParamsArray.length > 0)
				$($(this).closest("div.wsApiMappingBlock")).find(".paginationRequestParamsData").val(JSON.stringify(paginationRequestParamsArray));
			else
				$($(this).closest("div.wsApiMappingBlock")).find(".paginationRequestParamsData").val("");
		 
			var incrementalUpdate = $(this).find(".incrementalUpdate").prop("checked");
			var incrementalUpdateDetailsDiv = $($(this).closest("div.wsApiMappingBlock")).find(".incrementalUpdateDetailsDiv");
			if ( incrementalUpdate ) {
				var incrementalUpdateParamName = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamName").val();
				var incrementalUpdateParamvalue = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamvalue").val();
				var incrementalUpdateParamColumnName = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamColumnName").val();
				var incrementalUpdateParamType = incrementalUpdateDetailsDiv.find(".incrementalUpdateParamType").val();
				
				if ( incrementalUpdateParamName.trim().length == 0 ) {
					common.showcustommsg(incrementalUpdateDetailsDiv.find(".incrementalUpdateParamName"), globalMessage['anvizent.package.label.pleaseEnterValue'], incrementalUpdateDetailsDiv.find(".incrementalUpdateParamName") );
					status = false;
				}
				if ( incrementalUpdateParamvalue.trim().length == 0 ) {
					common.showcustommsg(incrementalUpdateDetailsDiv.find(".incrementalUpdateParamvalue"), globalMessage['anvizent.package.label.pleaseEnterValue'], incrementalUpdateDetailsDiv.find(".incrementalUpdateParamvalue") );
					status = false;
				}
				
				var inclUpdateParamsObject = {};
				inclUpdateParamsObject['incrementalUpdateParamName'] = incrementalUpdateParamName;
				inclUpdateParamsObject['incrementalUpdateParamvalue'] = incrementalUpdateParamvalue;
				inclUpdateParamsObject['incrementalUpdateParamColumnName'] = incrementalUpdateParamName;
				inclUpdateParamsObject['incrementalUpdateParamType'] = incrementalUpdateParamType;
				
				if(!$.isEmptyObject(inclUpdateParamsObject))
					inclUpdateParamsArray.push(inclUpdateParamsObject);
			} 
			if(inclUpdateParamsArray.length > 0)
				$(this).find(".incrementalUpdateparamdata").val(JSON.stringify(inclUpdateParamsArray));
			else
				$(this).find(".incrementalUpdateparamdata").val("");
		
			
			//Path Params
			$(this).find(".pathParamDetailsBlock").each(function(){
				var pathParamDetailsBlock = $(this),
					paramValueTypeEle = $(pathParamDetailsBlock).find(".pathParamValueType"),
					pathParamsObj = {};
				
				if(!$(paramValueTypeEle).is(":checked")){
					common.showcustommsg($(paramValueTypeEle).parents(".methodTypeValidation") ,globalMessage['anvizent.package.label.pleasechoosepathparamvaluetype'], 
							$(paramValueTypeEle).parents(".methodTypeValidation"));
					status = false;
				}
				else{
					var paramValueType = $(pathParamDetailsBlock).find(".pathParamValueType:checked").val();
					pathParamsObj["paramName"] = $(pathParamDetailsBlock).find(".pathParamName").text();

					if(paramValueType == "M"){
						pathParamsObj["valueType"] = "M";
						pathParamsObj["subUrldetails"] = {};
					}
					else{
						pathParamsObj["valueType"] = "S";
						var subUrlEle = $(pathParamDetailsBlock).find(".subUrl"),
						subUrlMethodTypeEle = $(pathParamDetailsBlock).find(".subUrlMethodType"),
						subUrlResObj = $(pathParamDetailsBlock).find(".subUrlResObj"),
						subUrlPaginationOffSetType = $(pathParamDetailsBlock).find(".subUrlPaginationOffSetType"),
						subUrlPaginationDateTypeEle = $(pathParamDetailsBlock).find(".subUrlPaginationDateType"),
						subUrlPaginationOtherType = $(pathParamDetailsBlock).find(".subUrlPaginationOtherType");
						subUrldetailsObj = {};
						
						if($(subUrlEle).val() == ''){
							common.showcustommsg($(subUrlEle) ,globalMessage['anvizent.package.label.pleaseentersuburl'] , $(subUrlEle));
							status = false;
							subUrldetailsObj["url"] = "";
						}
						else{
							subUrldetailsObj["url"] = $(subUrlEle).val();
						}
						
						if(!$(subUrlMethodTypeEle).is(":checked")){
							common.showcustommsg($(subUrlMethodTypeEle).parents(".subUrlMethodTypeValidation") ,globalMessage['anvizent.package.label.pleaseChooseMethodType']
							, $(subUrlMethodTypeEle).parents(".subUrlMethodTypeValidation"));
							status = false;
							subUrldetailsObj["methodType"] = "";
						}
						else{
							subUrldetailsObj["methodType"] = $(pathParamDetailsBlock).find(".subUrlMethodType:checked").val();
						}
						
						if($(subUrlResObj).val() == ''){
							common.showcustommsg($(subUrlResObj) ,globalMessage['anvizent.package.label.Pleaseentersuburlresponseobject'] , $(subUrlResObj));
							status = false;
							subUrldetailsObj["responseObjName"] = "";
						}
						else{
							subUrldetailsObj["responseObjName"] = $(subUrlResObj).val();
						}
						 
						var subUrlPaginationRequired = $(pathParamDetailsBlock).find(".subUrlPaginationRequired:checked").val() == 'yes' ? true : false;
						var subUrlPaginationType = $(pathParamDetailsBlock).find(".subUrlPaginationOffsetDateType:checked").val();
						if(subUrlPaginationRequired){
							var subUrlPaginationParamType = $(pathParamDetailsBlock).find(".subUrlPaginationParamType").val();
							if(subUrlPaginationType != 'hypermedia'){
								subUrldetailsObj["subUrlPaginationParamType"] = subUrlPaginationParamType;
							}
							subUrldetailsObj["subUrlPaginationRequired"] = subUrlPaginationRequired;
						 if(subUrlPaginationType != 'undefined' && subUrlPaginationType != null){
						  if(subUrlPaginationType == 'offset'){
							var subUrlPaginationOffSetRequestParamName = subUrlPaginationOffSetType.find('.subUrlPaginationOffSetRequestParamName').val();
							var subUrlPaginationOffSetRequestParamValue = subUrlPaginationOffSetType.find('.subUrlPaginationOffSetRequestParamValue').val();
							var subUrlPaginationLimitRequestParamName = subUrlPaginationOffSetType.find('.subUrlPaginationLimitRequestParamName').val();
							var subUrlPaginationLimitRequestParamValue = subUrlPaginationOffSetType.find('.subUrlPaginationLimitRequestParamValue').val();
							
							if(subUrlPaginationOffSetRequestParamName == ''){
								common.showcustommsg(subUrlPaginationOffSetType.find('.subUrlPaginationOffSetRequestParamName') ,globalMessage['anvizent.package.label.pleaseentersuburloffsetparamname'] , subUrlPaginationOffSetType.find('.subUrlPaginationOffSetRequestParamName'));
								status = false;
								subUrldetailsObj["subUrlPaginationOffSetRequestParamName"] = "";
							}else{
								subUrldetailsObj["subUrlPaginationOffSetRequestParamName"] = subUrlPaginationOffSetRequestParamName;
							}
							if(subUrlPaginationOffSetRequestParamValue == ''){
								common.showcustommsg(subUrlPaginationOffSetType.find('.subUrlPaginationOffSetRequestParamValue') ,globalMessage['anvizent.package.label.pleaseentersuburloffsetparamvalue'] , subUrlPaginationOffSetType.find('.subUrlPaginationOffSetRequestParamValue'));
								status = false;
								subUrldetailsObj["subUrlPaginationOffSetRequestParamValue"] = "";				
								}else{
									subUrldetailsObj["subUrlPaginationOffSetRequestParamValue"] = subUrlPaginationOffSetRequestParamValue;	
								}
							if(subUrlPaginationLimitRequestParamName == ''){
								common.showcustommsg(subUrlPaginationOffSetType.find('.subUrlPaginationLimitRequestParamName') ,globalMessage['anvizent.package.label.pleaseentersuburllimitparamname'], subUrlPaginationOffSetType.find('.subUrlPaginationLimitRequestParamName'));
								status = false;
								subUrldetailsObj["subUrlPaginationLimitRequestParamName"] = "";
							}else{
								subUrldetailsObj["subUrlPaginationLimitRequestParamName"] = subUrlPaginationLimitRequestParamName;
							}
							if(subUrlPaginationLimitRequestParamValue == ''){
								common.showcustommsg(subUrlPaginationOffSetType.find('.subUrlPaginationLimitRequestParamValue') ,globalMessage['anvizent.package.label.pleaseentersuburllimitparamvalue'], subUrlPaginationOffSetType.find('.subUrlPaginationLimitRequestParamValue'));
								status = false;
								subUrldetailsObj["subUrlPaginationLimitRequestParamValue"] = "";
							}else{
								subUrldetailsObj["subUrlPaginationLimitRequestParamValue"] = subUrlPaginationLimitRequestParamValue;
							}
							 subUrldetailsObj['subUrlPaginationType']  =  subUrlPaginationType;
							}else if(subUrlPaginationType == 'date'){
								var subUrlPaginationStartDateParam = subUrlPaginationDateTypeEle.find('.subUrlPaginationStartDateParam').val();
								var subUrlPaginationStartDate = subUrlPaginationDateTypeEle.find('.subUrlPaginationStartDate').val();
								var subUrlPaginationDateRange = subUrlPaginationDateTypeEle.find('.subUrlPaginationDateRange').val();
								var subUrlPaginationEndDateParam = subUrlPaginationDateTypeEle.find('.subUrlPaginationEndDateParam').val();
								if(subUrlPaginationStartDateParam == ''){
									common.showcustommsg(subUrlPaginationDateTypeEle.find('.subUrlPaginationStartDateParam') ,globalMessage['anvizent.package.label.pleaseentersuburlfromdateparamname'] , subUrlPaginationDateTypeEle.find('.subUrlPaginationStartDateParam'));
									status = false;
									subUrldetailsObj["subUrlPaginationStartDateParam"] = "";
								}else{
									subUrldetailsObj["subUrlPaginationStartDateParam"] = subUrlPaginationStartDateParam;
								}
								if(subUrlPaginationStartDate == ''){
									common.showcustommsg(subUrlPaginationDateTypeEle.find('.subUrlPaginationStartDate') ,globalMessage['anvizent.package.label.pleaseentersuburlstartdate'] , subUrlPaginationDateTypeEle.find('.subUrlPaginationStartDate'));
									status = false;
									subUrldetailsObj["subUrlPaginationStartDate"] = "";				
									}else{
										subUrldetailsObj["subUrlPaginationStartDate"] = subUrlPaginationStartDate;	
									}
								if(subUrlPaginationDateRange == ''){
									common.showcustommsg(subUrlPaginationDateTypeEle.find('.subUrlPaginationDateRange') ,globalMessage['anvizent.package.label.pleasechoosedaterange'], subUrlPaginationDateTypeEle.find('.subUrlPaginationDateRange'));
									status = false;
									subUrldetailsObj["subUrlPaginationDateRange"] = "";
								}else{
									subUrldetailsObj["subUrlPaginationDateRange"] = subUrlPaginationDateRange;
								}
								if(subUrlPaginationEndDateParam == ''){
									common.showcustommsg(subUrlPaginationDateTypeEle.find('.subUrlPaginationEndDateParam') ,globalMessage['anvizent.package.label.pleaseentersuburltodateparamname'] , subUrlPaginationDateTypeEle.find('.subUrlPaginationEndDateParam'));
									status = false;
									subUrldetailsObj["subUrlPaginationEndDateParam"] = "";
								}else{
									subUrldetailsObj["subUrlPaginationEndDateParam"] = subUrlPaginationEndDateParam;
								}
								
								subUrldetailsObj['subUrlPaginationType']  =  subUrlPaginationType;
							}else{
								var subUrlPaginationOtherRequestParamkey = subUrlPaginationOtherType.find('.subUrlPaginationOtherRequestParamkey').val();
								var subUrlPaginationOtherRequestLimit = subUrlPaginationOtherType.find('.subUrlPaginationOtherRequestLimit').val();
								
								if(subUrlPaginationOtherRequestParamkey == ''){ 
									common.showcustommsg(subUrlPaginationOtherType.find(".subUrlPaginationOtherRequestParamkey"), globalMessage['anvizent.package.label.pleaseEnterKeyParam'], subUrlPaginationOtherType.find(".subUrlPaginationOtherRequestParamkey"));
									status = false;
								}
								  subUrldetailsObj['subUrlPaginationType']  =  subUrlPaginationType;
								  subUrldetailsObj["paginationHyperLinkPattern"] = subUrlPaginationOtherRequestParamkey;
								  subUrldetailsObj["paginationHypermediaPageLimit"] = subUrlPaginationOtherRequestLimit;
							}
						 }else{
								common.showcustommsg($(pathParamDetailsBlock).find(".subUrlPaginationOffsetDateType") ,globalMessage['anvizent.package.label.pleasechoosesuburlpaginationtype'], $(pathParamDetailsBlock).find(".subUrlPaginationOffsetDateType"));
								status = false;
						 }
						}else{
							subUrldetailsObj["subUrlPaginationRequired"] = subUrlPaginationRequired;
						}
						
						subUrldetailsObj["baseUrlRequired"] = $(pathParamDetailsBlock).find('.baseUrlRequired').is(":checked") ? true : false;

						pathParamsObj["subUrldetails"] = subUrldetailsObj;
					}
				}
				if(!$.isEmptyObject(pathParamsObj))
					pathParamsArray.push(pathParamsObj);
				
			});
			if(pathParamsArray != '')
				$(this).find(".apiPathParams").val(JSON.stringify(pathParamsArray));
			else
				$(this).find(".apiPathParams").val("");
			
			if(arrayApiName != ""){
				for(var i=0; i< arrayApiName.length; i++){
					for(var j=0; j <arrayApiName.length; j++){
						if(i!=j && arrayApiName[i] == arrayApiName[j]){
							common.showcustommsg($(this).find(".apiName"), globalMessage['anvizent.package.label.duplicateName'], $(this).find(".apiName"));
							status = false;
							break;
						}
					}
				}
			}
			
			if(!status){
				validStatus = status;
				collapseDiv.removeClass("collapse").addClass("collapse in").removeAttr("style");
				var glyphicon = collapseDiv.siblings(".accordion-heading").find("a span").attr("class");
				if(glyphicon == "glyphicon glyphicon-plus-sign"){
					collapseDiv.siblings(".accordion-heading").find("a span").removeClass("glyphicon-plus-sign").addClass("glyphicon-minus-sign");
				}
			}
		});
		
		if(!validStatus){
			return false;
		}
		
		$("#wsApiBlock").remove();
		$("#pageMode").val("");
		$("#webServiceILMapping").prop("action",$("#save").val());
		this.form.submit();
		showAjaxLoader(true);
	});
	
	$(document).on("click", ".inactivateWsILMapping", function(){
		$("#deleteWSILMappingAlert #confirmDeletedeleteWSILMapping").val($(this).parents(".wsApiMappingBlock").find(".id").val());
		$("#deleteWSILMappingAlert").modal("show");
	});
	
	$(document).on("click", ".paginationRequired", function(){
		var isPaginationRequired = $(this).val() == 'yes' ? true : false ;
		var paginationTypeDiv = $($(this).closest("div.wsApiMappingBlock")).find(".paginationType");
		var paginationOffSetTypeDiv = $($(this).closest("div.wsApiMappingBlock")).find(".paginationOffSetType");
		var paginationDateTypeDiv = $($(this).closest("div.wsApiMappingBlock")).find(".paginationDateType");
		var paginationOtherTypeDiv = $($(this).closest("div.wsApiMappingBlock")).find(".paginationOtherType");
		var paginationOffsetDateType =  $($(this).closest("div.wsApiMappingBlock")).find(".paginationOffsetDateType:checked").val();
		var paginationParamTypeDiv = $($(this).closest("div.wsApiMappingBlock")).find(".paginationParamTypeDiv");
		if(isPaginationRequired){
			paginationTypeDiv.show();
			paginationParamTypeDiv.show();
			if(paginationOffsetDateType  == 'offset'){
				paginationOffSetTypeDiv.show();
				$($(this).closest("div.wsApiMappingBlock")).find(".paginationOffset").trigger("click");
				paginationDateTypeDiv.hide();
				paginationOtherTypeDiv.hide();
			}else if(paginationOffsetDateType  == 'date'){
				paginationDateTypeDiv.show();
				$($(this).closest("div.wsApiMappingBlock")).find(".paginationDate").trigger("click");
				paginationOffSetTypeDiv.hide();
				paginationOtherTypeDiv.hide();
			}else if(paginationOffsetDateType  == 'hypermedia'){ 
				paginationOtherTypeDiv.show();
				$($(this).closest("div.wsApiMappingBlock")).find(".paginationOther").trigger("click");
				paginationOffSetTypeDiv.hide();
				paginationDateTypeDiv.hide();
			}else{
				 $($(this).closest("div.wsApiMappingBlock")).find(".paginationOffset").prop("checked",false);
				 $($(this).closest("div.wsApiMappingBlock")).find(".paginationDate").prop("checked",false);
				 $($(this).closest("div.wsApiMappingBlock")).find(".paginationOther").prop("checked",false);
			}
		}else{
			paginationTypeDiv.hide();
			paginationDateTypeDiv.hide();
			paginationOffSetTypeDiv.hide();
			paginationOtherTypeDiv.hide();
			paginationTypeDiv.find(".paginationOffset").prop("checked",false);
			paginationTypeDiv.find(".paginationDate").prop("checked",false);
			paginationTypeDiv.find(".paginationOther").prop("checked",false);
			paginationOffSetTypeDiv.find(".paginationOffSetRequestParamName").val("");
			paginationOffSetTypeDiv.find(".paginationOffSetRequestParamValue").val("");
			paginationOffSetTypeDiv.find(".paginationLimitRequestParamName").val("");
			paginationOffSetTypeDiv.find(".paginationLimitRequestParamValue").val("");
			paginationOtherTypeDiv.find(".paginationOtherRequestKeyParam").val("");
			paginationOtherTypeDiv.find(".paginationOtherRequestLimit").val("");
			paginationOtherTypeDiv.find(".paginationObjectName").val("");
			paginationOtherTypeDiv.find(".paginationSearchId").val("");
			paginationOtherTypeDiv.find(".PaginationSoapBody").val("");
			
		}
	});
	$(document).on("click", ".paginationOffset", function(){
		var paginationType = $(this).val();
		var paginationOffSetTypeDiv = $($(this).closest("div.wsApiMappingBlock")).find(".paginationOffSetType");
		var paginationDateType = $($(this).closest("div.wsApiMappingBlock")).find(".paginationDateType");
		var paginationOtherType = $($(this).closest("div.wsApiMappingBlock")).find(".paginationOtherType");
		var paginationParamTypeDiv = $($(this).closest("div.wsApiMappingBlock")).find(".paginationParamTypeDiv");
		if(paginationType == 'offset') 
		paginationOffSetTypeDiv.show();
		paginationParamTypeDiv.show();
		paginationDateType.hide();
		paginationOtherType.hide();
	});

	$(document).on("click", ".paginationDate", function(){
		var paginationType = $(this).val();
		var paginationOffSetTypeDiv = $($(this).closest("div.wsApiMappingBlock")).find(".paginationOffSetType");
		var paginationDateType = $($(this).closest("div.wsApiMappingBlock")).find(".paginationDateType");
		var paginationOtherType = $($(this).closest("div.wsApiMappingBlock")).find(".paginationOtherType");
		var paginationParamTypeDiv = $($(this).closest("div.wsApiMappingBlock")).find(".paginationParamTypeDiv");
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
		paginationParamTypeDiv.show();
		paginationOtherType.hide();
		paginationOffSetTypeDiv.hide();
	});
	
	$(document).on("click", ".paginationOther", function(){
		var paginationType = $(this).val();
		var paginationOffSetTypeDiv = $($(this).closest("div.wsApiMappingBlock")).find(".paginationOffSetType");
		var paginationDateType = $($(this).closest("div.wsApiMappingBlock")).find(".paginationDateType");
		var paginationOtherType = $($(this).closest("div.wsApiMappingBlock")).find(".paginationOtherType");
		var paginationParamTypeDiv = $($(this).closest("div.wsApiMappingBlock")).find(".paginationParamTypeDiv");
        var subUrlPaginationParamTypeDiv = $($(this).closest("")) 
		if(paginationType == 'hypermedia') 
			paginationOtherType.show();
        paginationParamTypeDiv.hide();
		paginationDateType.hide();
		paginationOffSetTypeDiv.hide();
	});
	
	
	
	$(document).on("click", ".subUrlPaginationRequired", function(){
		var subUrlPaginationRequired = $(this).val() == 'yes' ? true : false ;
		var subUrlPaginationTypeDiv = $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationType");
		var subUrlPaginationOffSetTypeDiv = $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationOffSetType");
		var subUrlPaginationDateTypeDiv = $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationDateType");
		var subUrlPaginationOtherDiv = $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationOtherType");
		var subUrlPaginationParamTypeDiv= $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationParamTypeDiv");
		var subUrlPaginationOffsetDateType =  $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationOffsetDateType:checked").val();
		if(subUrlPaginationRequired){
			subUrlPaginationTypeDiv.show();
			subUrlPaginationParamTypeDiv.show();
			if(subUrlPaginationOffsetDateType  == 'offset'){
				subUrlPaginationOffSetTypeDiv.show();
				$($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationOffset").trigger("click");
				subUrlPaginationDateTypeDiv.hide();
				subUrlPaginationOtherDiv.hide();
			}else if(subUrlPaginationOffsetDateType  == 'date'){
				subUrlPaginationDateTypeDiv.show();
				$($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationDate").trigger("click");
				subUrlPaginationOffSetTypeDiv.hide();
				subUrlPaginationOtherDiv.hide();
			}else if(subUrlPaginationOffsetDateType  == 'hypermedia'){
				subUrlPaginationOtherDiv.show();
				$($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationOther").trigger("click");
				subUrlPaginationDateTypeDiv.hide();
				subUrlPaginationOffSetTypeDiv.hide();
			}else{
				 $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationOffSetType").prop("checked",false);
				 $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationDateType").prop("checked",false);
				 $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationOther").prop("checked",false);
			}
		}else{
			subUrlPaginationTypeDiv.hide();
			subUrlPaginationDateTypeDiv.hide();
			subUrlPaginationOffSetTypeDiv.hide();
			subUrlPaginationOtherDiv.hide();
			subUrlPaginationTypeDiv.find(".subUrlPaginationOffset").prop("checked",false);
			subUrlPaginationTypeDiv.find(".subUrlPaginationDate").prop("checked",false);
			subUrlPaginationTypeDiv.find(".subUrlPaginationOther").prop("checked",false);
			subUrlPaginationOffSetTypeDiv.find(".subUrlPaginationOffSetRequestParamName").val("");
			subUrlPaginationOffSetTypeDiv.find(".subUrlPaginationOffSetRequestParamValue").val("");
			subUrlPaginationOffSetTypeDiv.find(".subUrlPaginationLimitRequestParamName").val("");
			subUrlPaginationOffSetTypeDiv.find(".subUrlPaginationLimitRequestParamValue").val("");
			subUrlPaginationOtherDiv.find(".subUrlPaginationOtherRequestParamkey").val("");
			subUrlPaginationOtherDiv.find(".subUrlPaginationOtherRequestLimit").val("");
		}
	});
	$(document).on("click", ".subUrlPaginationOffset", function(){
		var subUrlPaginationType = $(this).val();
		var subUrlPaginationOffSetTypeDiv = $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationOffSetType");
		var subUrlPaginationDateType = $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationDateType");
		var subUrlPaginationOtherType= $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationOtherType");
		var subUrlPaginationParamTypeDiv= $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationParamTypeDiv");
		if(subUrlPaginationType == 'offset') 
			subUrlPaginationOffSetTypeDiv.show();
		
		subUrlPaginationParamTypeDiv.show();
		subUrlPaginationDateType.hide();
		subUrlPaginationOtherType.hide();
	});
	  
	$(document).on("click", ".subUrlPaginationDate", function(){
		var subUrlPaginationType = $(this).val();
		var subUrlPaginationOffSetTypeDiv = $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationOffSetType");
		var subUrlPaginationDateType = $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationDateType");
		var subUrlPaginationOtherType= $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationOtherType");
		var subUrlPaginationParamTypeDiv= $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationParamTypeDiv");
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
		subUrlPaginationParamTypeDiv.show();
		subUrlPaginationOffSetTypeDiv.hide();
		subUrlPaginationOtherType.hide();
	});
	
	$(document).on("click", ".subUrlPaginationOther", function(){
		var subUrlPaginationType = $(this).val();
		var subUrlPaginationOffSetTypeDiv = $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationOffSetType");
		var subUrlPaginationDateType = $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationDateType");
		var subUrlPaginationOtherType= $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationOtherType");
		var subUrlPaginationParamTypeDiv= $($(this).closest("div.wsApiMappingBlock")).find(".subUrlPaginationParamTypeDiv");
		if(subUrlPaginationType == 'hypermedia')
			subUrlPaginationOtherType.show();
		
		subUrlPaginationParamTypeDiv.hide();
		subUrlPaginationDateType.hide();
		subUrlPaginationOffSetTypeDiv.hide();
	});
	
	$(document).on("click", ".incrementalUpdate", function(){
		var incrementalUpdate = this.checked;
		var incrementalUpdateDetailsDiv = $($(this).closest("div.wsApiMappingBlock")).find(".incrementalUpdateDetailsDiv");
		if ( incrementalUpdate ) {
			incrementalUpdateDetailsDiv.show();
		} else {
			incrementalUpdateDetailsDiv.hide();
			incrementalUpdateDetailsDiv.find(".incrementalUpdateParamName").val("");
			incrementalUpdateDetailsDiv.find(".incrementalUpdateParamvalue").val("");
			incrementalUpdateDetailsDiv.find(".incrementalUpdateParamColumnName").val("");
		}
	});
	
	$(document).on("click", ".incrementalUpdate", function(){
		var incrementalUpdate = this.checked;
		var incrementalUpdateDetailsDiv = $($(this).closest("div.wsApiMappingBlock")).find(".incrementalUpdateDetailsDiv");
		if ( incrementalUpdate ) {
			incrementalUpdateDetailsDiv.show();
		} else {
			incrementalUpdateDetailsDiv.hide();
			incrementalUpdateDetailsDiv.find(".incrementalUpdateParamName").val("");
			incrementalUpdateDetailsDiv.find(".incrementalUpdateParamvalue").val("");
			incrementalUpdateDetailsDiv.find(".incrementalUpdateParamColumnName").val("");
		}
	});
	
	
	$("#confirmDeletedeleteWSILMapping").on("click", function(){
		$("#wsILMappingId").val($(this).val());
		$("#pageMode").val("delete");
		$("#webServiceILMapping").prop("action",$("#edit").val());
		this.form.submit();
		showAjaxLoader(true);
	});
	
	$(document).on("click", ".wsApiMappingBlock .getPathParams", function(){
		var j = $(this).val();
		var ele = $(this).parents(".wsApiMappingBlock").find(".apiUrl");
		common.clearValidations([$(ele)])
		var apiUrl = $(ele).val();
		
		if(apiUrl == ''){
			common.showcustommsg($(ele), globalMessage['anvizent.package.label.pleaseEnterAPIURL'], $(ele));
  	    	$(this).parents(".wsApiMappingBlock").find(".pathParamsDetailsBlocks").empty();
		}
		else{
			var getPathParams = webService.getPathParams(apiUrl,"{#");
			
			if(getPathParams != '' && getPathParams.length > 0){
				var pathParamDetailsBlocks = "";
				
				$.each(getPathParams , function(i, val){
					var pathParamDetailsBlock = $("#pathParamDetailsSampleBlock").clone();
					$(pathParamDetailsBlock).removeAttr("style id");
					$(pathParamDetailsBlock).find("label.pathParamName").text(val);
					$(pathParamDetailsBlock).find("input[name='pathParamValueType']").prop("name","pathParamValueType"+j+i);
					$(pathParamDetailsBlock).find("input[name='subUrlMethodType']").prop("name","subUrlMethodType"+j+i);
					pathParamDetailsBlocks += pathParamDetailsBlock.html(); 
				});
				
				$(ele).parents(".wsApiMappingBlock").find(".pathParamsDetailsBlocks").empty().append(pathParamDetailsBlocks);
			}
			else{
				common.showcustommsg($(ele), "No path params found", $(ele));
	  	    	$(this).parents(".wsApiMappingBlock").find(".pathParamsDetailsBlocks").empty();
			}
		}
	});
	
	$(document).on("click", ".pathParamValueType", function(){
		if($(this).val() == 'M'){
			$(this).parents(".pathParamDetailsBlock").find(".subUrlBlock").hide();
		}
		else{
			$(this).parents(".pathParamDetailsBlock").find(".subUrlBlock").show();
		}
	});

	// Accordion Toggle Items
    var iconOpen = 'glyphicon glyphicon-minus-sign', iconClose = 'glyphicon glyphicon-plus-sign';

	$(document).on('show.bs.collapse hide.bs.collapse', '#accordion', function (e) {
	    var $target = $(e.target);
	    $target.siblings('.accordion-heading').find('a span').toggleClass(iconOpen + ' ' + iconClose);
	    if(e.type == 'show')
	    	$target.prev('.accordion-heading').find('.accordion-toggle').addClass('active');
	    if(e.type == 'hide')
	    	$(this).find('.accordion-toggle').not($target).removeClass('active');
	});
	
	$(document).on("click",".apiMethodType",function(){
		if($(this).is(":checked") && $(this).val() == 'POST'){
			$(this).parents(".wsApiMappingBlock").find("#apiBodyParams").show();
			$(this).parents(".wsApiMappingBlock").find(".incrementalUpdateParamType").val("Body Parameter");
			$(this).parents(".wsApiMappingBlock").find(".paginationParamType").val("Body Parameter");
			$(this).parents(".wsApiMappingBlock").find(".incrementalUpdateParamType .incrementalUpdateBodyParamType").show();
			
		}
		else{
			$(this).parents(".wsApiMappingBlock").find("#apiBodyParams").hide();
			$(this).parents(".wsApiMappingBlock").find(".incrementalUpdateParamType").val("Request Parameter");
			$(this).parents(".wsApiMappingBlock").find(".paginationParamType").val("Request Parameter");
			$(this).parents(".wsApiMappingBlock").find(".incrementalUpdateParamType .incrementalUpdateBodyParamType").hide();
		}
	});
	$(document).on("click",".subUrlMethodType",function(){
		if($(this).is(":checked") && $(this).val() == 'POST'){
			$(this).parents(".subUrlBlock").find(".subUrlPaginationParamType").val("Body Parameter");
		}
		else{
			$(this).parents(".subUrlBlock").find(".subUrlPaginationParamType").val("Request Parameter");
		}
	});
	/*var paginationOffsetDateType =  $("div.wsApiMappingBlock").find(".paginationOffsetDateType:checked").val();
	if(paginationOffsetDateType  == 'offset'){
		 $(".paginationSoapBody").show();
	
}*/
}
