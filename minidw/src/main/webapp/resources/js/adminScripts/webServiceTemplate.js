var webServiceAuthentication = {
		 initialPage : function(){ 
			 $("#requestParamTable").DataTable({"language": {
	                "url": selectedLocalePath
	            }});
			 setTimeout(function() { $("#pageErrors").hide(); }, 5000); 
 			 $("#timeZone").select2({               
	                allowClear: true,
	                theme: "classic"
				});
			 
		 },
		 validateWebServiceTemplate : function(){
			 var validStatus = true;
			 var calBackURL = $('#oAuth2\\.redirectUrl').val();
			 var accessUrl = $('#oAuth2\\.accessTokenUrl').val();
			 var grantType = $('#OAuth2\\.grantType option:selected').val();
			 var clientIdentifier = $("#oAuth2\\.clientIdentifier").val();
			 var clientSecret = $("#oAuth2\\.clientSecret").val();
			// var scope = $("#oAuth2\\.scope").val();
			// var state = $("#oAuth2\\.state").val();
				 if(calBackURL == ''){
					 common.showcustommsg("#oAuth2\\.redirectUrl", globalMessage['anvizent.package.label.enterCallBackUrl'], "#oAuth2\\.redirectUrl");
					 validStatus = false;
				 }
				 if(accessUrl == ''){
					 common.showcustommsg("#oAuth2\\.accessTokenUrl", globalMessage['anvizent.package.label.enterAccessTokenUrl'], "#oAuth2\\.accessTokenUrl");
					 validStatus = false;
				 }
				 if(grantType == 0){
					 common.showcustommsg("#OAuth2\\.grantType", globalMessage['anvizent.package.label.enterGrantType'], "#OAuth2\\.grantType");
					 validStatus = false;
				 }
				 if(clientIdentifier == ''){
						common.showcustommsg("#oAuth2\\.clientIdentifier",globalMessage['anvizent.package.label.enterClientIdentifier'], "#webServiceTemplateMaster\\.oAuth2\\.clientIdentifier");
						validStatus = false;
					}
				if(clientSecret == ''){
					common.showcustommsg("#oAuth2\\.clientSecret",globalMessage['anvizent.package.label.enterClientSecret'], "#webServiceTemplateMaster\\.oAuth2\\.clientSecret");
					validStatus = false;
				}
				/*if(scope == ''){
					common.showcustommsg("#oAuth2\\.scope",globalMessage['anvizent.package.label.enterScope'], "#webServiceTemplateMaster\\.oAuth2\\.scope");
					validStatus = false;
				}
				if(state == ''){
					common.showcustommsg("#oAuth2\\.state",globalMessage['anvizent.package.label.enterState'], "#webServiceTemplateMaster\\.oAuth2\\.state");
					validStatus = false;
				}*/
			 return validStatus;
		 },
		 
		 validateWebServiceBasicTemplate : function(){
			 var validStatus =true;
			 var webserviceName = $('#webServiceName').val();
			 var authTypeId = $("#webServiceTemplateMaster\\.webServiceAuthenticationTypes\\.id").val();
			 var dateFormat = $("#dateFormat option:selected").val();
			 var timeZone =$("#timeZone option:selected").val();
			 var authUrl = $("#authenticationUrl").val();
			 var methodType = $('input[type=radio][name="authenticationMethodType"]:checked').val();
			 var webserviceType = $('#webserviceType').val();
			 var authReqHeaders = $("#authrequestheaders").val();
			 var isActive = $('input[type=radio][name="active"]:checked').val();
			 var reqParamsArray = [];
			 var bodyParamsArray = [];
			 var authenticationUrl = $("#authenticationUrl").val();
			 var authBodyParamsToApi = $("#authBodyParamsToApi").val();
			 var baseUrlIsChecked = $("#baseUrlRequired1").is(":checked")
			 var baseUrl = $("#baseUrl").val();
			 var regex = /^[0-9a-zA-Z/ /_/,/./-]+$/
				 if(webserviceName == ''){
					 common.showcustommsg("#webServiceName", globalMessage['anvizent.package.label.pleaseEnterWebServiceName'], "#webServiceName");
					  validStatus = false;
				 } else if(!regex.test(webserviceName)){
		      		  common.showcustommsg("#webServiceName", globalMessage['anvizent.package.label.specialcharactersnotallowedexceptunderscoredigitsandalphabets'],"#webServiceName");
		      	      validStatus=false;
		      	  }
			
				 if(dateFormat == 0){
					 common.showcustommsg("#dateFormat", globalMessage['anvizent.package.label.pleaseChooseDateformat'], "#dateFormat"); 
					 validStatus=false;
				 }
				 if(timeZone == 0){
					 common.showcustommsg("#timeZone", globalMessage['anvizent.package.label.pleaseChooseTimeZone'], "#timeZone"); 
					 validStatus=false;
				 }
				 if(authUrl == ''){
					 common.showcustommsg("#authenticationUrl", globalMessage['anvizent.package.label.pleaseEnterAuthenticationURL'], "#authenticationUrl");
					 validStatus=false;
				 }
				 if(!methodType){
					 common.showcustommsg(".methodTypeSelectionValidation", globalMessage['anvizent.package.label.pleaseChooseMethodType'], ".methodTypeSelectionValidation");
					 validStatus=false;
				 }
				 $(".requestParams #requestParamsTable tbody tr").each(function(){
					 var requestParam = $(this).find(".requestParam").val().toLowerCase();
					 if(requestParam == '' ){
			   				common.showcustommsg($(this).find(".requestParam"),globalMessage['anvizent.package.label.enterReqparams'],$(this).find(".requestParam"));
			   				validStatus=false;
			   			}
					 else if(reqParamsArray.indexOf(requestParam)!=-1){
						 common.showcustommsg($(this).find(".requestParam"),globalMessage['anvizent.package.label.duplicateName'],$(this).find(".requestParam")); 
						 validStatus=false;
					 }else{
						 reqParamsArray.push(requestParam);
					 }
			     });
				 var reqParamObject = {}
				 $("#authRequestParamsToApi .authRequestKeyValue").each(function(){
					 var reqKey = $(this).find(".authRequestKey").val();
					 var reqVal =$(this).find(".authRequestValue").val();
					 
					 if ( !reqKey && !reqVal ) {
						 
					 } else {
						 if(reqKey == '' ){
							 common.showcustommsg($(this).find(".authRequestKey"),globalMessage['anvizent.package.label.enterKey'],$(this).find(".authRequestKey"));
				   				validStatus=false;
						 }
						 if(reqVal ==''){
							 common.showcustommsg($(this).find(".authRequestValue"),globalMessage['anvizent.package.label.enterValue'],$(this).find(".authRequestValue"));
				   				validStatus=false;
						 }else{
							 reqParamObject[reqKey]=reqVal;
						 }
					 }
				 });
				 
				 
				 var reqBodyObject = {}
				 $("#authBodyParamsToApi .authBodyKeyValue").each(function(){
					 var bodyKey = $(this).find(".authBodyKey").val();
					 var bodyVal =$(this).find(".authBodyValue").val();
					 
					 if ( !bodyKey && !bodyVal ) {
						 
					 } else {
						 if(bodyKey == '' ){
							 common.showcustommsg($(this).find(".authBodyKey"),globalMessage['anvizent.package.label.enterKey'],$(this).find(".authBodyKey"));
				   				validStatus=false;
						 }
						 if(bodyVal ==''){
							 common.showcustommsg($(this).find(".authBodyValue"),globalMessage['anvizent.package.label.enterValue'],$(this).find(".authBodyValue"));
				   				validStatus=false;
						 }else{
							 reqBodyObject[bodyKey]=bodyVal;
						 }
					 }
				 });
				 
				 if(baseUrlIsChecked){
						if(baseUrl == ''){
							 common.showcustommsg("#baseUrl", globalMessage['anvizent.package.label.pleaseEnterBaseUrl'], "#baseUrl");
							 validStatus=false;
						}else if(baseUrl.match(/^(http|https)/)){
							if(authenticationUrl.match(/^(http|https)/)){
								common.showcustommsg("#authenticationUrl",'Please enter valid url', "#authenticationUrl");
								validStatus=false;
							}
						}else{
							common.showcustommsg("#baseUrl",'http or https is allowed', "#baseUrl");
							validStatus=false;
						}
					 }else{
						 if(!authenticationUrl.match(/^(http|https)/)){
								common.showcustommsg("#authenticationUrl",globalMessage['anvizent.package.label.pleaseentervalidurl'], "#authenticationUrl");
								validStatus=false;
							}
					 }
				 
				 if (methodType == "POST" ) {
					$("#apiBodyParams").find("#bodyParamsTable tbody tr").each(function(){
						var isMandatory = $(this).find(".isMandatory").is(":checked"),
							isPassword = $(this).find(".isPassword").is(":checked"),
							paramValue = $(this).find(".paramValue").val()
						if(((isMandatory || isPassword) ) && paramValue == ''){
							common.showcustommsg($(this).find(".paramValue"), globalMessage['anvizent.package.label.pleaseEnterValue'], $(this).find(".paramValue"));
							validStatus = false;
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
					
					if(bodyParamsArray.length > 0){
					 $("#authenticationBodyParams").val(JSON.stringify(bodyParamsArray));
					}else{
					 $("#authenticationBodyParams").val(JSON.stringify(bodyParamsArray)); 
					}
					
				 } else{
					 $("#authenticationBodyParams").val(JSON.stringify(bodyParamsArray)); 
				 }
				 $("#authenticationBodyParams").val(JSON.stringify(bodyParamsArray));
				 $("#apiAuthRequestParams").val(JSON.stringify(reqParamObject));
				 $("#apiAuthBodyParams").val(JSON.stringify(reqBodyObject));
			 return validStatus;
		 },
		 validateWebServiceNoAuthTemplate : function(){
			 var validStatus =true;
			 var webserviceName = $('#webServiceName').val();
			 var dateFormat = $("#dateFormat option:selected").val();
			 var timeZone =$("#timeZone option:selected").val();
			 var baseUrlIsChecked = $("#baseUrlRequired1").is(":checked")
			 var baseUrl = $("#baseUrl").val();
			 var regex = /^[0-9a-zA-Z/ /_/,/./-]+$/
				if(webserviceName == ''){
					 common.showcustommsg("#webServiceName", globalMessage['anvizent.package.label.pleaseEnterWebServiceName'], "#webServiceName");
					 validStatus= false;
				}
				else if(!regex.test(webserviceName)){
		      		  common.showcustommsg("#webServiceName", globalMessage['anvizent.package.label.specialcharactersnotallowedexceptunderscoredigitsandalphabets'],"#webServiceName");
		      	      validStatus=false;
		      	}
				 if(dateFormat == 0){
					 common.showcustommsg("#dateFormat", globalMessage['anvizent.package.label.pleaseChooseDateformat'], "#dateFormat"); 
					 validStatus=false;
				 }
				 if(timeZone == 0){
					 common.showcustommsg("#timeZone", globalMessage['anvizent.package.label.pleaseChooseTimeZone'], "#timeZone"); 
					 validStatus=false;
				 }
				 if(baseUrlIsChecked){
					if(baseUrl == ''){
						 common.showcustommsg("#baseUrl", globalMessage['anvizent.package.label.pleaseEnterBaseUrl'], "#baseUrl");
						 validStatus=false;
					} else if(!baseUrl.match(/^(http|https)/)){
						common.showcustommsg("#baseUrl", 'enter http ot https is allowed', "#baseUrl");
						validStatus=false;
					}
				 }
				 $("#authenticationBodyParams").val(JSON.stringify([]));
				 $("#apiAuthRequestParams").val(JSON.stringify({}));
				 $("#apiAuthBodyParams").val(JSON.stringify({}));
			return validStatus;
		 }
}
if($(".webServiceTemplate-page").length){
	webServiceAuthentication.initialPage();
	var webserviceType = $('#webserviceType option:selected').val();
	if(webserviceType == 'SOAP'){
		$(".soapBodyElement").show();
	}else{
		$(".soapBodyElement").hide();
	} 
	
	var addReq = $("#webserviceParamSample");
	addReq.find("[name^='webServiceTemplateAuthRequestparams[0]']").prop("checked",false)
	addReq.find("[name^='webServiceTemplateAuthRequestparams[0]']").val("");
	var authTypeid = $('#webServiceAuthenticationTypes\\.id option:selected').val();
	var authName = $('#webServiceAuthenticationTypes\\.id option:selected').text();
	$(".authName").text(authName);
	if(authTypeid == 2){
		$(".calBackUrl,.oAuthAuthenticationUrl,.accessTokenUrl,.webServicesCoveringDiv,.clientIdentifier,.clientSecret,.scope,.state").hide();
		$(".authView").show();
	}
	if(authTypeid == 5){
		$(".calBackUrl,.oAuthAuthenticationUrl,.accessTokenUrl,.webServicesCoveringDiv,.authView,.clientIdentifier,.clientSecret,.scope,.state").show();
	}
	if(authTypeid == 3){
		$(".calBackUrl,.oAuthAuthenticationUrl,.accessTokenUrl,.webServicesCoveringDiv,.url,.methodType,.requestParams,#apiBodyParams,.clientIdentifier,.clientSecret,.scope,.state").hide();
		$(".authView").show();
	}
	if(authTypeid == 1){
		$(".authView").hide();
	}
	
	$("#webServiceAuthenticationTypes\\.id").on("change",function(){
		common.clearValidations(["#webServiceName,#authenticationUrl,#authenticationMethodType,.methodTypeSelectionValidation,#oAuth2\\.redirectUrl," +
				"#oAuth2\\.accessTokenUrl,#OAuth2\\.grantType,#oAuth2\\.authUrl,.requestParam,#authRequestKey,#authRequestValue,#authrequestheaders, " +
				"#webServiceAuthenticationTypes\\.id,#dateFormat,#timeZone,#baseUrl"]);
		 $("#authenticationUrl,#oAuth2\\.redirectUrl,#oAuth2\\.accessTokenUrl,#oAuth2\\.authUrl,.requestParam,.oAuthRequestParam,.authRequestKey," +
				 ".authRequestValue,.authreqheaders,.authBodyValue,.authBodyKey,.url,#baseUrl").val("");
		$("[name='baseUrlRequired']").prop("checked",false);
		$("[name='authenticationMethodType']").prop("checked",false);
		$(".isMandatory,.isPassword,.oAuthIsMandatory,.oAuthIsPassword").prop("checked",false);
		$("#requestParamsTable tbody").remove();
		$("#requestParamsTable tbody").remove();
		$("#authRequestParamsToApi .authRequestKeyValue").slice(1).remove();
		$("#authBodyParamsToApi .authBodyKeyValue").slice(1).remove(); 
		$("#OAuth2\\.grantType").val("0");
		$("#timeZone").prop("checked",false);
		var authTypeid = $('#webServiceAuthenticationTypes\\.id option:selected').val();
		var authvalue = $('#webServiceAuthenticationTypes\\.id option:selected').val();
		var authName = $('#webServiceAuthenticationTypes\\.id option:selected').text();
		var webserviceType = $('#webserviceType option:selected').val();
		if(authTypeid ==0){
			 common.showcustommsg("#webServiceAuthenticationTypes\\.id", "Please choose authentication type", "#webServiceAuthenticationTypes\\.id");
			 $(".authView").hide();
			 return false;
		}
			if(authvalue!=0){
			 $(".authName").text(authName);
			}
			if(authTypeid == 2){
				$(".calBackUrl,.oAuthAuthenticationUrl,.accessTokenUrl,.webServicesCoveringDiv,.baseUrlDiv,.clientIdentifier,.clientSecret,.scope,.state").hide();
				$(".authView").show();
				$(".url,.methodType,.requestParams,#apiBodyParams,.authView,.baseUrlRequiredForAuthentication").show();
				 
			}
			if(authTypeid == 5){
				$(".calBackUrl,.oAuthAuthenticationUrl,.accessTokenUrl,.webServicesCoveringDiv,.authView,.url,.baseUrlRequiredForAuthentication,.methodType,.requestParams,#apiBodyParams,.clientIdentifier,.clientSecret,.scope,.state").show();
				$(".authView").show();
				$('.baseUrlDiv').hide();  
			}
			if(authTypeid == 3){
				$(".calBackUrl,.oAuthAuthenticationUrl,.accessTokenUrl,.webServicesCoveringDiv,.url,.methodType,.requestParams,#apiBodyParams,.baseUrlDiv,.clientIdentifier,.clientSecret,.scope,.state").hide();
				$(".authView,.baseUrlRequiredForAuthentication").show();
			}
			if(authTypeid == 1){
				$(".authView").hide();
			}
			
			if(webserviceType == 'SOAP'){
				$(".soapBodyElement").show();
			}else{
				$(".soapBodyElement").hide();
			} 
			
	 });
	$("#webserviceType").on("change",function(){
		var webserviceType = $('#webserviceType option:selected').val();
		if(webserviceType == 'SOAP'){
			$(".soapBodyElement").show();
		}else{
			$(".soapBodyElement").hide();
		} 
	
	});
		
		$(".addAuthRequestParam").on("click",function(){
			var rowCount = $("#requestParamsTable tbody tr").length;
			var addReq = $("#webserviceParamSample").clone().removeAttr("id");
				addReq.find("[name^='webServiceTemplateAuthRequestparams[0]']").each(function(i,v){
					var vObj = $(v);
					vObj.prop("name",vObj.prop("name").split("[0]").join("["+rowCount+"]"));
				});
			$(addReq).removeAttr("id");
			$(addReq).css("display","");
			$("#requestParamsTable").append(addReq);
		});
	
		$(document).on("click","#deleteAuthRequestParam",function(){
			if ($("#requestParamsTable tbody tr").length) {
				$("#requestParamsTable tbody tr:last").remove();
			}
		});
		

		$(document).on("click",".addBodyParam",function(){
			var requestKeyValue = $(this).parents("#bodyParamsTable").find("tfoot tr.data-row").clone();
			$(requestKeyValue).removeAttr("style class");
			$(this).parents("#bodyParamsTable").append(requestKeyValue);
		});
		
		$(document).on("click",".deleteBodyParam",function(){ 		
	 		$(this).parents("tr").remove(); 		 			 
	 	});
		
$(document).on("click","#saveWebserviceTemp",function(){
	
	common.clearValidations(["#webServiceName,#authenticationUrl,#authenticationMethodType,.methodTypeSelectionValidation,#oAuth2\\.redirectUrl," +
			"#oAuth2\\.accessTokenUrl,#OAuth2\\.grantType,.requestParam,#oAuth2\\.authUrl,#authRequestKey,#authRequestValue,#authrequestheaders, #webServiceAuthenticationTypes\\.id,#dateFormat,#timeZone,#baseUrl,#soapBodyElement"]);
	var status=true;
	var statusTemp=true;
	var authTypeid = $('#webServiceAuthenticationTypes\\.id option:selected').val();
	var webserviceType = $('#webserviceType option:selected').val();
	if(webserviceType == 0){
		common.showErrorAlert("Please Select Webservice type.");
		return false;
	} 
		if(authTypeid==1 || authTypeid==3){
			 status = webServiceAuthentication.validateWebServiceNoAuthTemplate();
		}
		else if(authTypeid==2){
			 status = webServiceAuthentication.validateWebServiceBasicTemplate();
		}
		else if(authTypeid==5){
			  status = webServiceAuthentication.validateWebServiceBasicTemplate();
			  statusTemp = webServiceAuthentication.validateWebServiceTemplate();
		}
		else{
			status = webServiceAuthentication.validateWebServiceNoAuthTemplate();
			common.showcustommsg("#webServiceAuthenticationTypes\\.id", "Please choose authentication type", "#webServiceAuthenticationTypes\\.id");
			status = false;
		}
		if(!(status && statusTemp)){
			return status;
		}
		 else{
			$("#webServiceTemplateMaster").prop("action",$("#saveUrl").val());
			$("#webserviceParamSample").remove();
			this.form.submit();
			showAjaxLoader(true);
       }
	});
	$("#authRequestParamsToApi").on("click",".addRequestParam",function(){
		var addReqParam = $("#addRequestParamsApi").clone().removeAttr("id style");
		if ( $("#authRequestParamsToApi > div").length > 0 ) {
			addReqParam.find(".control-label").text("")
		}
		
		$("#authRequestParamsToApi").append(addReqParam);
	});
	$("#authRequestParamsToApi").on("click",".deleteRequestParam",function(){
		$(this).parents(".authRequestKeyValue").remove();
	});
	
	$("#authBodyParamsToApi").on("click",".addBodyParam",function(){
		var addBodyParam = $("#addBodyParamsApi").clone().removeAttr("id style");
		if ( $("#authBodyParamsToApi > div").length > 0 ) {
			addBodyParam.find(".control-label").text("")
		}
		
		$("#authBodyParamsToApi").append(addBodyParam);
	});
	$("#authBodyParamsToApi").on("click",".deleteBodyParam",function(){
		$(this).parents(".authBodyKeyValue").remove();
	});
	
	
	$("#addWebServiceTemplate").on("click",function(){
		$("#webServiceTemplateMaster").prop("action",$("#addUrl").val());
		this.form.submit();
		showAjaxLoader(true);
	});

		if ($("#pageMode").val() == "edit"  ) {
			var authenticationMethodType = $('input[type=radio][name="authenticationMethodType"]:checked').val();
			var baseUrlRequired = $("#baseUrlRequired1").is(":checked") ? $(".baseUrlDiv").show() : $(".baseUrlDiv").hide();
			var paramsList = $("#apiAuthRequestParams").val();
			if ( paramsList && paramsList != null) {
				var paramsListObj = JSON.parse(paramsList);
				$.each(paramsListObj,function(key,val){
					var addReqParam = $("#addRequestParamsApi").clone().removeAttr("id").show();
					var divCount = $("#authRequestParamsToApi > div").length;
					if ( divCount > 0 ) {
						addReqParam.find(".control-label").text("")
					}else if ( divCount == 0) {
						addReqParam.find(".deleteRequestParam").remove();
					}
					addReqParam.find(".authRequestKey").val(key);
					addReqParam.find(".authRequestValue").val(val);
					$("#authRequestParamsToApi").append(addReqParam);
				});
			 }
			
			var bodyParamsList = $("#apiAuthBodyParams").val();
			if ( bodyParamsList && bodyParamsList != null) {
				var bodyParamsListObj = JSON.parse(bodyParamsList);
				$.each(bodyParamsListObj,function(key,val){
					var addbodyParam = $("#addBodyParamsApi").clone().removeAttr("id").show();
					var divCount = $("#authBodyParamsToApi > div").length;
					if ( divCount > 0 ) {
						addbodyParam.find(".control-label").text("")
					}else if ( divCount == 0) {
						addbodyParam.find(".deleteBodyParam").remove();
					}
					addbodyParam.find(".authBodyKey").val(key);
					addbodyParam.find(".authBodyValue").val(val);
					$("#authBodyParamsToApi").append(addbodyParam);
				});
			 }
			
		var bodyArray = $(".authenticationBodyParams").val();
		if (bodyArray) {
			var paramArrayObj = JSON.parse(bodyArray);
			$.each(paramArrayObj,function(ind,param){
				var newParamTr = $("#apiBodyParams").find("#bodyParamsTable tfoot tr:first").clone();
				$(newParamTr).removeAttr("style class");
				newParamTr.find(".paramValue").val(param['paramName']);
				newParamTr.find(".isMandatory").prop({"checked":param['isMandatory'], "disabled":false});
				newParamTr.find(".isPassword").prop({"checked":param['ispasswordField'], "disabled":false});
				 $("#apiBodyParams").find("#bodyParamsTable tbody").append(newParamTr);
			});
		  }
			
		}

		if ( $("#authRequestParamsToApi > div").length == 0) {
			var addReqParam = $("#addRequestParamsApi").clone().removeAttr("id").show();
			addReqParam.find(".deleteRequestParam").remove();
			$("#authRequestParamsToApi").append(addReqParam);
		}
		if ( $("#authBodyParamsToApi > div").length == 0) {
			var addBodyParam = $("#addBodyParamsApi").clone().removeAttr("id").show();
			addBodyParam.find(".deleteBodyParam").remove();
			$("#authBodyParamsToApi").append(addBodyParam);
		} 
		
	$(document).on("click",".isMandatory, .isPassword",function(){
		if($(this).is(":checked")){
			$(this).val("true");
		}
		else{
			$(this).val("false");
		}
	});	
	
	$(document).on("click","input[name='type']",function(){
		if($(this).is(":checked")){
			$(this).val("true");
		}
		else{
			$(this).val("false");
		}
	});	
	
	$(document).on("click","input[name='authenticationMethodType']",function(){
		var val = $(this).val();
	    if(val === 'POST'){
	    $("#apiBodyParams").show();	
	    }else{
	    $("#apiBodyParams").hide();
	    }
	});	
	
	$("#baseUrlRequired1").on("click",function(){
		if($(this).is(':checked')){
			$(".baseUrlDiv").show();	
		}else{
			$(".baseUrlDiv").hide();
			$("#baseUrl").val("");
		}
		
	})
}