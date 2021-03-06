var headers = {};
var interval;
var webServiceConnection = {
		initialPage : function(){
			$("#existingWsConnectionsTable").DataTable({"language": {
	                "url": selectedLocalePath
	            }});
			 $(".timeZone").select2({               
	             allowClear: true,
	             theme: "classic"
				});
			setTimeout(function() { $("#pageErrors").hide().empty(); }, 5000);	 
			var token = $("meta[name='_csrf']").attr("content");
			var header = $("meta[name='_csrf_header']").attr("content");
			headers[header] = token;
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
	
	  validateWebService : function(){
		var validStatus = true;
		var webServiceConName = $("#webServiceConName").val();
		var authTypeId = $("#webServiceTemplateMaster\\.webServiceAuthenticationTypes\\.id").val();
		var authUrl = $("#webServiceTemplateMaster\\.authenticationUrl").val();
		var callBackUrl = $("#webServiceTemplateMaster\\.oAuth2\\.redirectUrl").val();
		var accessTokenURl = $("#webServiceTemplateMaster\\.oAuth2\\.accessTokenUrl").val();
		var clientIdentifier = $("#webServiceTemplateMaster\\.oAuth2\\.clientIdentifier").val();
		var clientSecret = $("#webServiceTemplateMaster\\.oAuth2\\.clientSecret").val();
		//var scope = $("#webServiceTemplateMaster\\.oAuth2\\.scope").val();
		var methodType = $('input[type=radio][name="webServiceTemplateMaster\\.authenticationMethodType"]:checked').val();
		var dataSourceName = $("#dataSourceName").val();
		var dataSourceOther = $("#dataSourceNameOther").val();
		var regex = /^[0-9a-zA-Z/ /_/,/./-]+$/
		if(webServiceConName == ''){
			common.showcustommsg("#webServiceConName", globalMessage['anvizent.package.label.pleaseEnterwebServiceConnectionName'], "#webServiceConName");
			validStatus = false;
		}
		else if(!regex.test(webServiceConName)){
    		  common.showcustommsg("#webServiceConName", globalMessage['anvizent.package.label.specialcharactersnotallowedexceptunderscoredigitsandalphabets'],"#webServiceConName");
      	      validStatus=false;
  	  	}
		else{
			var selectors = [];
			selectors.push("#webServiceConName");
			validStatus = common.validate(selectors);
		}
		if(dataSourceName == '0'){
		   	 common.showcustommsg("#dataSourceName", globalMessage['anvizent.package.label.enterDataSourceName'],"#dataSourceName");
		     validStatus =false;
		}
		if(dataSourceName == "-1"){
	    	   if(dataSourceOther.trim().length == 0){
	    		   common.showcustommsg("#dataSourceNameOther", globalMessage['anvizent.package.label.enterDataSource'],"#dataSourceNameOther");
	    		   validStatus = false;
	    	   }
	       }
		
		if(authTypeId == 2 || authTypeId == 5 || authTypeId == 3){
			if(authUrl == '' && (authTypeId == 2 || authTypeId == 5)){
				common.showcustommsg("#webServiceTemplateMaster\\.authenticationUrl",globalMessage['anvizent.package.label.pleaseEnterAuthenticationURL'], "#webServiceTemplateMaster\\.authenticationUrl");
				validStatus = false;
			}
			if(authTypeId == 2 || authTypeId == 3){
				$(".fieldIsMadatory").each(function(){
					if($(this).val() == ""){
						common.showcustommsg($(this),globalMessage['anvizent.package.label.enterParamValue'], $(this));
						validStatus = false;
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
		   
				
			}
			
			if(authTypeId == 5){
				if(callBackUrl == ''){
					common.showcustommsg("#webServiceTemplateMaster\\.oAuth2\\.redirectUrl",globalMessage['anvizent.package.label.enterCallBackUrl'], "#webServiceTemplateMaster\\.oAuth2\\.redirectUrl");
					validStatus = false;
				}
				if(accessTokenURl == ''){
					common.showcustommsg("#webServiceTemplateMaster\\.oAuth2\\.accessTokenUrl",globalMessage['anvizent.package.label.enterAccessTokenUrl'], "#webServiceTemplateMaster\\.oAuth2\\.accessTokenUrl");
					validStatus = false;
				}
				if(!methodType){
					common.showcustommsg("#methodType",globalMessage['anvizent.package.label.pleaseChooseMethodType'], "#methodType");
					validStatus = false;
				}	
				if(clientIdentifier == ''){
					common.showcustommsg("#webServiceTemplateMaster\\.oAuth2\\.clientIdentifier",globalMessage['anvizent.package.label.enterClientIdentifier'], "#webServiceTemplateMaster\\.oAuth2\\.clientIdentifier");
					validStatus = false;
				}
				if(clientSecret == ''){
					common.showcustommsg("#webServiceTemplateMaster\\.oAuth2\\.clientSecret",globalMessage['anvizent.package.label.enterClientSecret'], "#webServiceTemplateMaster\\.oAuth2\\.clientSecret");
					validStatus = false;
				}
				/*if(scope == ''){
					common.showcustommsg("#webServiceTemplateMaster\\.oAuth2\\.scope",globalMessage['anvizent.package.label.enterScope'], "#webServiceTemplateMaster\\.oAuth2\\.scope");
					validStatus = false;
				}*/
			}	
		}				
		return validStatus;
	  },
	  findAllTypeOfParams : function(){
		  var auth_request_params = {},
		  	auth_body_params = {},
			auth_path_params = {},
			header_key_values = {};
		  var authTypeId = $("#webServiceTemplateMaster\\.webServiceAuthenticationTypes\\.id").val();
		  if(authTypeId == 2 || authTypeId == 3){
				$("div#requestParams").each(function(){
					var name = $(this).find("span.paramName").text(),
						value = $(this).find("input.paramValue").val();
					auth_request_params[name] = value; 
				});
				
				$("#authenticationBodyParamsDiv .paramNameValue").each(function(){
					var name = $(this).find("span.paramName").text(),
						value = $(this).find("input.paramValue").val();
					auth_body_params[name] = value; 
				});
				
				if(authTypeId == 2){
					$("#pathParamsBlocks .pathParamsBlock").each(function(){
						var name = $(this).find("span.pathParamName").text(),
							value = $(this).find("input.pathParamValue").val();
							auth_path_params[name] = value; 
					});
					
					$("#headerKeyValueBlocks .headerKeyValue").each(function(){
						var name = $(this).find("span.headerKey").text(),
							value = $(this).find("input.headerValue").val();
							header_key_values[name] = value; 
					});
				}
		  }
		  $("input#requestParams").val(JSON.stringify(auth_request_params));
		  $("input#bodyParams").val(JSON.stringify(auth_body_params));
		  $("input#authPathParams").val(JSON.stringify(auth_path_params));
		  $("input#headerKeyvalues").val(JSON.stringify(header_key_values));
		  if(authTypeId == 5){
		  var authenticationToken = $("#webServiceTemplateMaster\\.oAuth2\\.accessTokenValue").val();
		  var authenticationRefreshToken = $("#webServiceTemplateMaster\\.oAuth2\\.refreshTokenValue").val();
		  $("#authenticationToken").val(authenticationToken);
		  $("#authenticationRefreshToken").val(authenticationRefreshToken);
		  }
		 
	  }
	  
};
if($('.webServiceConnection-page').length){
	
	$(".wsDetails").hide();
	
	webServiceConnection.initialPage();
	var responseStatusCode = $("#responseStatusCode").val(),
		responseStatusText = $("#responseStatusText").val();
	
	
	if(responseStatusCode == 'SUCCESS' && responseStatusCode != ''){
		$("#saveNewWebserviceConnection").show();
		$("#statusCode").append("<div class='alert alert-success'>"+responseStatusText+"</div>");
	}
	else if(responseStatusCode == 'FAILED' && responseStatusCode != ''){
		$("#saveNewWebserviceConnection").hide();
		$("#statusCode").append("<div class='alert alert-danger'>"+responseStatusText+"</div>");
	}
	if(responseStatusCode == 'SUCCESS' /*&& authTypeId == 5*/){
		 interval = setInterval(function() {
			$("#saveNewWebserviceConnection").trigger( "click" );
		}, 1000);
		$("#statusCode").empty();
		$("#responseStatusCode").val("");
	}
	if($("#dataSourceName").val() == "-1"){
		$("#dataSourceName").change();
		$(".dataSourceOther").show();
	}
	
	var getPathParams = [],
		getHeaderKeyValue = [],
		pathParamsBlock = '', 
		headerKeyValueBlock = '',
		requestParams = $("input#requestParams").length == 0 ? "" : $("#requestParams").val() == "" ? null : JSON.parse($("#requestParams").val()),
		authPathParams = $("input#authPathParams").length == 0 ? "" : $("#authPathParams").val() == "" ? null : JSON.parse($("#authPathParams").val()),
		headerKeyvalues = $("input#headerKeyvalues").length == 0 ? "" : $("#headerKeyvalues").val() == "" ? null : JSON.parse($("#headerKeyvalues").val());
	
	

	
	var apiBodyParamsList = [];
	var apiBodyParams = $("#webServiceTemplateMaster\\.authenticationBodyParams").val();
	if ( apiBodyParams ){
		apiBodyParamsList = $.parseJSON(apiBodyParams);
	}
	
	var bodyParamsObjList = [];
	var bodyParamsObj = $("#bodyParams").val();
	if ( bodyParamsObj ){
		bodyParamsObjList = $.parseJSON(bodyParamsObj);
	}
	
	var authenticationBodyParamsDiv = $("#authenticationBodyParamsDiv").empty();
	
	if(apiBodyParamsList && apiBodyParamsList.length){
		
		 $.each(apiBodyParamsList,function(k,authBodyParams){

				var newRow = $("#authenticationBodyParamsBlock").clone().removeAttr("id").show();
				
				if($("#webServiceTemplateMaster\\.webServiceAuthenticationTypes\\.id").val() != 3 && k == 0 ){
					newRow.find(".requestBodyParams").text(globalMessage['anvizent.package.label.BodyParameters']);
				}
				newRow.find(".paramName").text(authBodyParams.paramName);
				newRow.find(".paramValue").val(bodyParamsObjList[authBodyParams.paramName]);
				if ( authBodyParams.ispasswordField ) {
					newRow.find(".paramValue").prop("type","password")
				}
				if (!authBodyParams.isMandatory) {
					newRow.find(".paramNameMandatory").remove();
				}
				
				newRow.find(".paramValue").data("mandatory",authBodyParams.isMandatory);
				
				authenticationBodyParamsDiv.append(newRow);
			 
		 });
		 authenticationBodyParamsDiv.show();
	}
	
	
	if($("#webServiceTemplateMaster\\.authenticationUrl").length)
		getPathParams = webServiceConnection.getPathParams($("#webServiceTemplateMaster\\.authenticationUrl").val(),"{#");
	
	for(var i=0;i<getPathParams.length;i++){
		var samplePathParamsBlock = $("#samplePathParamsBlock").clone().removeAttr("id style");
		if(i>=1){
			samplePathParamsBlock.find(".labelText").text("");
		}
		var value = "";
		if(authPathParams != null)
			value = authPathParams[getPathParams[i]];
		samplePathParamsBlock.find(".pathParamName").text(getPathParams[i]);
		samplePathParamsBlock.find(".pathParamValue").attr("data-path-param-name",getPathParams[i]).val(value);
		$("#pathParamsBlocks").append(samplePathParamsBlock);
	 }
	
	
	if($("#webServiceTemplateMaster\\.apiAuthRequestHeaders").length)
		getHeaderKeyValue = webServiceConnection.getPathParams($("#webServiceTemplateMaster\\.apiAuthRequestHeaders").val(),"{#");
	
	for(var i=0;i<getHeaderKeyValue.length;i++){
		var sampleHeaderKeyValueBlock = $("#sampleHeaderKeyValueBlock").clone().removeAttr("id style");
		if(i>=1){
			sampleHeaderKeyValueBlock.find(".labelText").text("");
		}
		var value = "";
		if(headerKeyvalues != null)
			value = headerKeyvalues[getHeaderKeyValue[i]];
		sampleHeaderKeyValueBlock.find(".headerKey").text(getHeaderKeyValue[i]);
		sampleHeaderKeyValueBlock.find(".headerValue").attr("data-path-param-name",getHeaderKeyValue[i]).val(value);
		$("#headerKeyValueBlocks").append(sampleHeaderKeyValueBlock);
	 }
	
	if(requestParams != null) {
		$("#requestParams .paramName").each(function(){
			var paramName = $(this).text().trim();
			$(this).parents("#requestParams").find(".paramValue").val(requestParams[paramName]);
		});
	}
	 	
	$(document).on("keyup",function(){
		$("#saveNewWebserviceConnection").hide();
		$("#statusCode").empty();
	});
	
	$(document).on("click","input[type='radio'][name='webServiceTemplateMaster\\.authenticationMethodType']",function(){
		$("#saveNewWebserviceConnection").hide();
		$("#statusCode").empty();
	});
	
	$("#webServiceTemplateMaster\\.id").on("change",function(){
	
	    if($(this).val() == 0)
		{
	    	common.showErrorAlert("Please select webservie template.");
  			return false;
		}
	
		$("#webServiceConnectionMaster").prop("action",$("#addUrl").val());
		 this.form.submit();
		 showAjaxLoader(true);
	});
	 var iconOpen = 'glyphicon glyphicon-minus-sign', iconClose = 'glyphicon glyphicon-plus-sign';
	 $(document).on('show.bs.collapse hide.bs.collapse', '.accordion','.accordionWs', function (e) {
	     var $target = $(e.target)
	       $target.siblings('.accordion-heading')
	       .find('span').toggleClass(iconOpen + ' ' + iconClose);
	       if(e.type == 'show')
	           $target.prev('.accordion-heading').find('.accordion-toggle').addClass('active');
	       if(e.type == 'hide')
	           $(this).find('.accordion-toggle').not($target).removeClass('active');
	 });
	 /*
	  $("#confirmSSLDisable").on("click",function(){
		 webServiceConnection.findAllTypeOfParams();
		 var status = webServiceConnection.validateWebService();
			if(!status){
				return false;
			}
		var	sslDisable =  $('#webServiceTemplateMaster\\.sslDisable1:checked').is(":checked") ? true : false;
		 if(sslDisable){
			 $("#sslDisableModal").modal('show');
		 }else{
			 $("#confirmSSLDisable").trigger( "click" );
		 }
	 }); */
	 $("#testWebServiceAuthenticate").on("click",function(){
		common.clearValidations(["#webServiceConName,#webServiceTemplateMaster\\.webServiceAuthenticationTypes\\.id,#webServiceTemplateMaster\\.authenticationUrl," +
				"#webServiceTemplateMaster\\.oAuth2\\.redirectUrl, .fieldIsMadatory, #webServiceTemplateMaster\\.oAuth2\\.accessTokenUrl, #webServiceTemplateMaster\\.oAuth2\\.clientSecret,#webServiceTemplateMaster\\.oAuth2\\.scope," +
				"#webServiceTemplateMaster\\.oAuth2\\.clientIdentifier"]);
		webServiceConnection.findAllTypeOfParams();
		var authTypeId = $("#webServiceTemplateMaster\\.webServiceAuthenticationTypes\\.id").val();
		var status = webServiceConnection.validateWebService();
		if(!status){
			return false;
		}
		if(authTypeId == 5){
			var authUrl = $("#webServiceTemplateMaster\\.authenticationUrl").val(),
				userID = $("#userID").val(),
				requestMethod = $('#webServiceTemplateMaster\\.authenticationMethodType').val(),
				baseUrl =  $('#webServiceTemplateMaster\\.baseUrl').val(),
				baseUrlRequired =  $('#webServiceTemplateMaster\\.baseUrlRequired1:checked').is(":checked") ? true : false,
				authenticationTypeId = $("#webServiceTemplateMaster\\.webServiceAuthenticationTypes\\.id").val(),
				callBackUrl = $("#webServiceTemplateMaster\\.oAuth2\\.redirectUrl").val(),
				accessTokenURl = $("#webServiceTemplateMaster\\.oAuth2\\.accessTokenUrl").val(),
				clientIdentifier = $("#webServiceTemplateMaster\\.oAuth2\\.clientIdentifier").val(),
				clientSecret = $("#webServiceTemplateMaster\\.oAuth2\\.clientSecret").val(),
				grantType = $("#webServiceTemplateMaster\\.oAuth2\\.grantType").val(),
				scope = $("#webServiceTemplateMaster\\.oAuth2\\.scope").val(),
				state = $("#webServiceTemplateMaster\\.oAuth2\\.state").val(),
				selectedData = {
					 webServiceTemplateMaster: {
						 "baseUrl":baseUrl,
						 "baseUrlRequired":baseUrlRequired,
						 "authenticationUrl":authUrl, 
						 "authenticationMethodType": requestMethod, 
						 "webServiceAuthenticationTypes":{ id:authenticationTypeId},
						 "oAuth2":{
							 	redirectUrl : callBackUrl,
							 	accessTokenUrl : accessTokenURl,
							 	grantType : grantType,
							 	clientIdentifier : clientIdentifier,
							 	clientSecret : clientSecret,
							 	authCodeValue : "",
							    scope:scope,
							    state:state
							 }
					 },
					 requestParams : $("input#requestParams").val(),
					 authPathParams : $("input#authPathParams").val(),
			};
		 
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
		      				var params = "";
		      			 	var ua = window.navigator.userAgent;
		      			    var msie = ua.indexOf("MSIE ");
		      			    
		      			    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))  // If Internet Explorer, return version number
		      			    {
		      			    	params = [
		      				              //'height='+screen.height,
		      				              'width='+screen.width,
		      				              'fullscreen=no' // only works in IE, but here for completeness
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
		      		        			$("#webServiceTemplateMaster\\.oAuth2\\.authCodeValue").val($("#authCodeValue").val())
				      		  			$("#webServiceConnectionMaster").prop("action",$("#validateUrl").val());
		      		        			$("#webServiceConnectionMaster").submit();
		      		        		} else{
		      		        			common.showErrorAlert("Authentication failed");
		      		        			return false;
		      		        		}
		      		        	}
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
			
		}
		else{
			$("#webServiceConnectionMaster").prop("action",$("#validateUrl").val());
			this.form.submit();
			showAjaxLoader(true);
		}
	});
	
	$("#saveNewWebserviceConnection").on("click",function(){
		webServiceConnection.findAllTypeOfParams();
		$("#webServiceConnectionMaster").prop("action",$("#saveUrl").val());
		this.form.submit();
		showAjaxLoader(true);
	    if(authTypeId == 5)
		{
		  clearInterval(interval);
		}
	 });
	
	$(document).on("change","#dataSourceName",function(){
    	var dataSourceName=  $("#dataSourceName option:selected").val().trim();
    	if(dataSourceName == "-1"){
	    	   $(".dataSourceOther").show();
	       }else{
	    	   $(".dataSourceOther").hide();
	       }
    });
	$(document).on("change","#webServiceTemplateMaster\\.sslDisable1",function(){
		 var status = $(this).is(":checked");
		 console.log("status-->",status)
		 if(status){
		 $("#sslauthenticationdisable").empty().text("SSL Authentication disable ! ( data transmit over un secured layer ).")
		 }else{
			 $("#sslauthenticationdisable").empty();
		 }
    });
	
	
}