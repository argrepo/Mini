<!DOCTYPE HTML>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<%@ taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://www.springframework.org/tags" prefix="spring"%>

<spring:htmlEscape defaultHtmlEscape="true" />
<div class="col-md-12 rightdiv">
  	<div class='row form-group'>
		<h4 class="alignText"><spring:message code="anvizent.package.label.webServiceTemplate" /></h4>
 	</div>
 	
	<jsp:include page="admin_error.jsp"></jsp:include>
	<c:url value="/admin/webservice/webServiceTemplate" var="url"/>
	<input type="hidden" value="${url}/add" id="addUrl"/>
 	<input type="hidden" value="${url}/save" id="saveUrl"/>
 	<c:url value="/admin/webservice/webServiceTemplate/edit" var="editUrl"/>

	<input type="hidden" id="userId" value="${principal.userId}"> 	
	
	<form:form modelAttribute="webServiceTemplateMaster" action="${editUrl}">
		<form:hidden path="pageMode"/>
		<c:choose>
			<c:when test="${webServiceTemplateMaster.pageMode == 'list'}">
				<div style="padding:0px 15px;">
				    <div class="row form-group" style="padding:5px;border-radius:4px;">
					    <c:url value="/admin/webservice/webServiceTemplate/add" var="addUrl" />
						<a style="float:right;margin-right: 1.5em;" class="btn btn-sm btn-success" href="<c:url value="/admin/webservice/webServiceTemplate/add"/>"> Add </a>
					</div>
				</div>
				 
				<div class="col-sm-12">
				   <table class="table table-striped table-bordered tablebg " id="requestParamTable" style ="table-layout: fixed;word-wrap: break-word;">
				    	<thead>
						    <tr>
					           <th class="col-xs-1"><spring:message code="anvizent.package.label.id"/></th>
					           <th class="col-xs-1"><spring:message code="anvizent.package.label.webserviceName"/></th>
					           <th class="col-xs-2"><spring:message code="anvizent.package.label.authenticationType"/></th>
					           <th class="col-xs-2"><spring:message code="anvizent.package.label.authenticationUrl"/></th>
					           <th class="col-xs-2"><spring:message code="anvizent.package.label.baseUrl"/></th>
					           <th class="col-xs-2"><spring:message code="anvizent.package.label.baseUrlRequired"/></th>
					           <th class="col-xs-1"><spring:message code="anvizent.package.label.methodtype"/></th>
					           <th class="col-xs-1"><spring:message code="anvizent.package.label.calBackUrl"/></th>
					           <th class="col-xs-1"><spring:message code="anvizent.package.label.accessTokenUrl"/></th>
					           <th class="col-xs-1"><spring:message code="anvizent.package.label.grantType"/></th>
					           <th class="col-xs-1"><spring:message code="anvizent.package.label.isActive"/></th>
					           <th class="col-xs-1"><spring:message code="anvizent.package.label.edit"/></th>
						  	</tr>
						</thead>	
			        	<tbody id ="webServiceList">
				          	<c:forEach items="${webServiceTempList}" var ="webServiceTempList">
					          	<tr>
					  			    <td class="col-xs-1">${webServiceTempList.id }</td>
					  				<td class="col-xs-1"><c:out value="${webServiceTempList.webServiceName }" /></td>
									<td class="col-xs-1"><c:out value="${webServiceTempList.webServiceAuthenticationTypes.authenticationType}" /></td>
									<td class="col-xs-1"><c:out value="${webServiceTempList.authenticationUrl}" /></td>
									<td class="col-xs-1"><c:out value="${not empty webServiceTempList.baseUrl ? webServiceTempList.baseUrl :'-'}" /> </td>
									<td class="col-xs-1"><c:out value="${webServiceTempList.baseUrlRequired}" /></td>
								    <td class="col-xs-1"><c:out value="${webServiceTempList.authenticationMethodType}" /></td>
									<td class="col-xs-1"><c:out value="${webServiceTempList.oAuth2.redirectUrl}" /></td>
									<td class="col-xs-1"><c:out value="${webServiceTempList.oAuth2.accessTokenUrl}" /></td>
									<td class="col-xs-1">${webServiceTempList.oAuth2.grantType == "0" ? "-": webServiceTempList.oAuth2.grantType}</td>
									<td class="col-xs-1">${webServiceTempList.active ? "yes": "No"}</td>
									<td class="col-xs-1">
										<button class="btn btn-primary btn-sm tablebuttons edit" name="id" type="submit" value="${webServiceTempList.id}">
										<i class="fa fa-pencil" aria-hidden="true"></i>
										</button>
									</td>
					       		</tr>
				        	</c:forEach>
						</tbody>
				 	</table>
				</div>
			 </c:when>
		 
			 <c:when test="${webServiceTemplateMaster.pageMode == 'add' || webServiceTemplateMaster.pageMode == 'edit'}">
				<form:hidden path="id"/>
				<div class="row form-group">
					<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.webServiceTemplateName"/> :</label>
					<div class="col-sm-6">
						<spring:message code="anvizent.package.label.enterWebserviceNames" var="enterWebserviceNames" />
						<form:input path="webServiceName" placeholder="${enterWebserviceNames}" data-minlength="1" data-maxlength="255" cssClass="form-control"/>
					</div>
				</div>
				
		 <div class='row form-group'>
		 			<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.WebserviceType"/> :</label>
					<div class="col-sm-6">
						<form:select path="webserviceType" cssClass="form-control WebserviceType" >
						 <spring:message code="anvizent.package.label.WebserviceType" var="selectOption" />
							    <form:option value="0">${selectOption }</form:option>
								<form:option value="SOAP">SOAP</form:option>
								<form:option value="RESTful">RESTful</form:option>   
						</form:select>
				 	</div>
		 	   	</div>  
		 	   	
			
		 	   	<div class='row form-group'>
		 			<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.authenticationType"/> :</label>
					<div class="col-sm-6">
						<form:select path="webServiceAuthenticationTypes.id" cssClass="form-control webServiceAuthenticationTypes" >
							<spring:message code="anvizent.package.label.selecAuthentication" var="selectOption" />
								<form:option value="0">${selectOption }</form:option>
								<form:options items="${webServiceAuthenticationTypes}"/>   
						</form:select>
				 	</div>
		 	   	</div>
		 	   	
		 	   	<div class="row form-group webServicesDiv">
								<div class='row form-group'>
						 			<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.dateFormat" /> :</label>
									<div class="col-sm-6">
										<form:select path="dateFormat" cssClass="form-control dateFormat" >
											<form:option value="0"><spring:message code="anvizent.package.label.selectDateFormat" /></form:option>
											<form:option value="yyyy-MM-dd'T'HH:mm:ss"><c:out value="yyyy-MM-dd'T'HH:mm:ss" /></form:option>
											<form:option value="dd,MM,yyyy'T'HH:mm:ss"><c:out value="dd,MM,yyyy'T'HH:mm:ss" /></form:option>
											<form:option value="yyyy/MM/dd'T'HH:mm:ss"><c:out value="yyyy/MM/dd'T'HH:mm:ss" /></form:option>
											<form:option value="MM/dd/yyyy'T'HH:mm:ss"><c:out value="MM/dd/yyyy'T'HH:mm:ss" /></form:option>
											<form:option value="MM-dd-yyyy'T'HH:mm:ss"><c:out value="MM-dd-yyyy'T'HH:mm:ss" /></form:option>
											<form:option value="yyyy-dd-MM'T'HH:mm:ss"><c:out value="yyyy-dd-MM'T'HH:mm:ss" /></form:option>
											<form:option value="yyyy-MM-dd"><c:out value="yyyy-MM-dd" /></form:option>
											<form:option value="yyyy-MM-dd'T'HH:mm:ss"><c:out value="yyyy-MM-dd'T'HH:mm:ss" /></form:option>
											<form:option value="yyyy-MM-dd'T'HH:mm:ss.SSSXXX"><c:out value="yyyy-MM-dd'T'HH:mm:ss.SSSXXX" /></form:option>
											<form:option value="epoch"><c:out value="Epoch TimeStamp" /></form:option>
										</form:select>
								 	</div>
							 	 </div>
	           	</div>
	           	<div class="row form-group webServicesDiv">
								<div class='row form-group'>
						 			<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.timeZone" /> :</label>
									<div class="col-sm-6">
										<form:select path="timeZone" cssClass="form-control timeZone">
										<spring:message code="anvizent.package.label.selectTimeZone" var="selectOption" />
											<form:option value="0">${selectOption}</form:option>
											<form:options items="${timesZoneList}" />
										</form:select>
								 	</div>
							 	 </div>
	           	</div>
	           	
	           	<div class="row form-group">
					<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.sslDisable"/> :</label>
					<div class='col-sm-6'>
								<form:checkbox path="sslDisable" />
					 	</div>
				</div>
	           	
	           	<div class="row form-group">
					<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.activeStatus"/> :</label>
					<div class='col-sm-6'>
					 	<div class="activeStatus">
					 		 <label class="radio-inline">
								<form:radiobutton path="active" value="1"/><spring:message code="anvizent.package.button.yes"/>
							 </label>	
							 <label class="radio-inline">
						    	<form:radiobutton path="active" value="0"/><spring:message code="anvizent.package.button.no"/> 
						    </label>
					 	</div>
					</div>
				</div>  
		
				<div class="col-sm-12">
					<div class="panel panel-info authView" style='display:none;'>
						<div class="panel-heading authName"></div>
						<div class="panel-body">
						    <div class="row form-group baseUrlDiv" style="display:none">
								<label class="control-label col-sm-2"> <spring:message code="anvizent.package.label.baseUrl" /> :</label>
								<div class="col-sm-10">
								    <spring:message code="anvizent.package.label.enterUrl" var="enterUrl" />
									<form:input path="baseUrl" placeholder="${enterUrl}"  data-minlength="1" data-maxlength="255" cssClass="form-control"/>
								</div>
							</div>
							<div class="row form-group url">
								<label class="control-label col-sm-2"> <spring:message code="anvizent.package.label.authenticationUrl" /> :</label>
								<div class="col-sm-10">
								    <spring:message code="anvizent.package.label.enterUrl" var="enterUrl" />
									<form:input path="authenticationUrl" placeholder="${enterUrl}"  data-minlength="1" data-maxlength="255" cssClass="form-control"/>
								</div>
							</div>
							
							<div class="row form-group baseUrlRequiredForAuthentication">
								<label class="control-label col-sm-2"></label>
								<div class="col-sm-10">
									<form:checkbox path="baseUrlRequired"/> <spring:message code="anvizent.package.label.baseUrlRequired"	/>
								</div>
							</div>
							
							<div class="row form-group methodType">
								<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.methodType" /> :</label>
								<div class="col-sm-10">
									<div class="methodTypeSelectionValidation">
										<label class="radio-inline">
												<form:radiobutton path="authenticationMethodType" value="GET"/>
												<spring:message code="anvizent.package.label.get" />
										 </label>	
										<label class="radio-inline">
												<form:radiobutton path="authenticationMethodType" value="POST"/>
												<spring:message code="anvizent.package.label.post" />
										</label>
									</div>
								</div>
							</div>
							
							<div class="row form-group calBackUrl" style='display:none;'>
								<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.calBackUrl" /> :</label>
								<div class="col-sm-10">
						   			<spring:message code="anvizent.package.label.enterCallBackUrl" var="enterCallBackUrlPlaceholder" />
									<form:input path="oAuth2.redirectUrl"  placeHolder = "${enterCallBackUrlPlaceholder}" data-minlength="1" data-maxlength="255" cssClass="form-control"/>
								</div>
							</div>
							
							<div class="row form-group accessTokenUrl" style='display:none;'>
								<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.accessTokenUrl" /> :</label>
								<div class="col-sm-10">
								   	<spring:message code="anvizent.package.label.enterAccessTokenUrl" var="enterAccessUrlPlaceholder" />
									<form:input path="oAuth2.accessTokenUrl"  placeHolder = "${enterAccessUrlPlaceholder}" data-minlength="1" data-maxlength="255" cssClass="form-control"/>
								</div>
							</div>
							
							<div class="row form-group webServicesCoveringDiv" style='display:none;'>
								<div class='row form-group'>
						 			<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.grantType" /> :</label>
									<div class="col-sm-6">
										<form:select path="OAuth2.grantType" cssClass="form-control grantType" >
											<form:option value="0"><spring:message code="anvizent.package.label.selectGrantType"/></form:option>
											<form:option value="authorization_code"><spring:message code="anvizent.package.label.authorizationCode"/></form:option>
											<form:option value="client_credentials"><spring:message code="anvizent.package.label.clientCredentials"/></form:option>
										</form:select>
								 	</div>
							 	 </div>
				           	</div>
				           	<div class='row form-group clientIdentifier' style='display:none;'>
											  <label class='col-sm-2 control-label'><spring:message code="anvizent.package.label.clientIdentifier" /> :</label>
											   <div class='col-sm-10' >
													<form:input path="oAuth2.clientIdentifier" cssClass="form-control"/>
											   </div>
								 </div>
								 <div class='row form-group clientSecret' style='display:none;'>
											  <label class='col-sm-2 control-label'><spring:message code="anvizent.package.label.clientSecret" /> :</label>
											   <div class='col-sm-10' >
													<form:input type="password" cssClass="form-control" path="oAuth2.clientSecret" />
											   </div>
										</div>
                                   <div class='row form-group scope' style='display:none;'>
											  <label class='col-sm-2 control-label'><spring:message code="anvizent.package.label.scope" /> :</label>
											   <div class='col-sm-10' >
													<form:input cssClass="form-control" path="OAuth2.scope" />
											   </div>
									</div>	
									<div class='row form-group scope' style='display:none;'>
											  <label class='col-sm-2 control-label'><spring:message code="anvizent.package.label.state" /> :</label>
											   <div class='col-sm-10' >
													<form:input cssClass="form-control" path="OAuth2.state" />
											   </div>
									</div>			           
							<div class="row form-group requestParams">
							    <label class="control-label col-sm-2"><spring:message code="anvizent.package.label.requestParameters" /> :</label>
							  	<div class=" col-sm-10">
									<table class="table table-striped table-bordered tablebg " id="requestParamsTable">
										<thead>
												<tr>
													<th class="col-xs-4"><spring:message code = "anvizent.package.label.paramName"/></th>
													<th class="col-xs-3"><spring:message code = "anvizent.package.label.isMandatory"/></th>
													<th class="col-xs-2"><spring:message code = "anvizent.package.label.isPassword"/></th>
													<th class="col-xs-2"> 
												        <button type ="button" class="btn btn-primary btn-sm addAuthRequestParam">
									      					<span class="glyphicon glyphicon-plus"></span>
									    				</button>
									    				<button  type="button" class="btn btn-primary btn-sm deleteAuthRequestParam" id="deleteAuthRequestParam">
				      										<span class="glyphicon glyphicon-trash"></span>
									    				</button>
									    	       </th>
												</tr>
										</thead>
										<tbody>
											<c:forEach items="${webServiceTemplateMaster.webServiceTemplateAuthRequestparams }" var="webServiceTemplateAuthRequestparams1" varStatus="index">
												<tr>
												     <td><form:input cssClass="form-control requestParam" path="webServiceTemplateAuthRequestparams[${index.index}].paramName"/></td>
												     <td><form:checkbox class="isMandatory" path="webServiceTemplateAuthRequestparams[${index.index}].mandatory" value="false"/></td>
												     <td><form:checkbox class="isPassword" path="webServiceTemplateAuthRequestparams[${index.index}].passwordType" value="false"/></td>
												     <td></td>
												</tr>
											</c:forEach>
										</tbody>
										<tfoot>
										   <tr id="webserviceParamSample" style="display:none;">
											     <td><form:input cssClass="form-control requestParam" path="webServiceTemplateAuthRequestparams[0].paramName" placeholder="Ex. Email or Password"/></td>
											     <td><form:checkbox class="isMandatory" path="webServiceTemplateAuthRequestparams[0].mandatory" /></td>
											     <td><form:checkbox class="isPassword" path="webServiceTemplateAuthRequestparams[0].passwordType"/></td>
											     <td></td>
											</tr>
										</tfoot>
									</table>
								</div>
							</div>
							<div class="row form-group" id="apiBodyParams" ${webServiceTemplateMaster.authenticationMethodType == 'POST' ? '' : 'style="display:none;"'}>
									<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.requestBodyParameters" /> :</label>
									<div class="col-sm-10">
										<table class="table table-striped table-bordered tablebg" id="bodyParamsTable">
											<thead>
												<tr>
													<th class="col-xs-4"><spring:message code = "anvizent.package.label.paramName"/></th>
													<th class="col-xs-3"><spring:message code = "anvizent.package.label.isMandatory"/></th>
													<th class="col-xs-2"><spring:message code="anvizent.package.label.isPassword"/></th>
													<th class="col-xs-2"> 
													   <button type ="button" class="btn btn-primary btn-sm addBodyParam">
															<span class="glyphicon glyphicon-plus"></span>
														</button>
													</th>
												</tr>
											</thead>
											<tbody>
											</tbody>
											<tfoot>
												<tr class="data-row" style="display:none;">
													<td><input type="text" class="form-control paramValue"/></td>
													<td><input type="checkbox" class="isMandatory"/></td>
													<td><input type="checkbox" class="isPassword"/></td>
													<td>
														<button type="button" class="btn btn-primary btn-sm deleteBodyParam remove_field">
															<span class="glyphicon glyphicon-trash"></span>
														</button>
													</td>
												</tr>
											</tfoot>
										</table>
									</div>	
									<div>
									<form:hidden path="authenticationBodyParams" class="authenticationBodyParams"/>
									</div>
					     </div>
					     <div class="row form-group" id="apiBodyParams">
							<div style="border:1px solid gray;">
								<h4><spring:message code="anvizent.package.label.RequestParametersHeadersRequiredforAPIfromAuthenticationResponse"/></h4>
								<div id="authRequestParamsToApi" style="margin-top: 5px;"></div>
							
								<div class="row-form-group authRequestKeyValue" id="addRequestParamsApi" style="display: none">
										<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.requestparamsToApi"/> :</label>	
										<div class="row form-group">
											<div class="col-sm-4">
												<spring:message code = "anvizent.package.label.enterKey" var="enterKey"/>
												<input class="form-control authRequestKey" placeholder="Ex. token">
											</div>
											<div class="col-sm-4">
												<spring:message code = "anvizent.package.label.enterValue" var ="enterValue"/>
												<input class="form-control authRequestValue" placeholder="Ex. {$token}">
											</div>
											<div class="col-sm-2">
												<button type="button" class="btn btn-primary btn-sm addRequestParam">
													<span class="glyphicon glyphicon-plus"></span>
												</button>
												<button type="button" class="btn btn-primary btn-sm deleteRequestParam">
													<span class="glyphicon glyphicon-trash"></span>
												</button>
											</div>
										</div>
						        </div>	
						        <div id="authBodyParamsToApi" style="margin-top: 5px;"></div>
						        <div class="row-form-group authBodyKeyValue" id="addBodyParamsApi" style="display: none">
										<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.bodyparamsToApi"/> :</label>	
										<div class="row form-group">
											<div class="col-sm-4">
												<spring:message code = "anvizent.package.label.enterKey" var="enterKey"/>
												<input class="form-control authBodyKey" placeholder="Ex. token">
											</div>
											<div class="col-sm-4">
												<spring:message code = "anvizent.package.label.enterValue" var ="enterValue"/>
												<input class="form-control authBodyValue" placeholder="Ex. {$token}">
											</div>
											<div class="col-sm-2">
												<button type="button" class="btn btn-primary btn-sm addBodyParam">
													<span class="glyphicon glyphicon-plus"></span>
												</button>
												<button type="button" class="btn btn-primary btn-sm deleteBodyParam">
													<span class="glyphicon glyphicon-trash"></span>
												</button>
											</div>
										</div>
						        </div>	
								<form:hidden path="apiAuthRequestParams" class="apiAuthRequestParam"/>
								<form:hidden path="apiAuthBodyParams" class="apiAuthBodyParam"/>
								 <div id="authRequestHeadersToApi">
									 <div class="row-form-group">
										<div class="row form-group authRequestHeaders">
											<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.requestHeadersToApi"/> :</label>
											<div class="col-sm-4">
											    <spring:message code = "anvizent.package.label.enterHeaderDetails" var ="enterHeader"/>
												<form:textarea path="apiAuthRequestHeaders" cssClass="form-control authreqheaders" id="authrequestheaders" placeholder="Ex. Authorization:  Bearer {$access_token}"/>
											</div>
										</div>
									  </div>
								</div>	
								
								<div id="soapBodyElement">
									 <div class="row-form-group">
										<div class="row form-group soapBodyElement"  style='display:none;'>
											<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.soapBodyElement"/> :</label>
											<div class="col-sm-8">
												<form:textarea path="soapBodyElement" cssClass="form-control soapBodyElement" id="soapBodyElement" placeholder="Enter Soap Body "/>
											</div>
										</div>
									  </div>
								</div>	
							</div>	
					     </div>
			     	</div>
				</div>
				</div>
		       <div class="row form-group viewSave">
					<div class="col-sm-10">
						<input type="button" value="<spring:message code = "anvizent.package.button.save"/>" id="saveWebserviceTemp" class="btn btn-primary  btn-sm">
						<a href="<c:url value="/admin/webservice/webServiceTemplate"/>" class="btn btn-primary btn-sm back back_btn"><spring:message code = "anvizent.package.label.Back"/></a>
					</div>
		       </div>
		     </c:when>  
	  	</c:choose>

  </form:form>	
</div>
