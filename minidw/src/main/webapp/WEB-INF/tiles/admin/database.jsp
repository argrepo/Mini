<!DOCTYPE HTML>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<%@ taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://www.springframework.org/tags" prefix="spring"%>

<spring:htmlEscape defaultHtmlEscape="true" />
<div class="col-md-12 rightdiv">
  	
  	<div class='row form-group'>
		<h4 class="alignText"><spring:message code="anvizent.package.label.databases"/></h4>
 	</div>

 	<input type="hidden" id="userID" value="${principal.userId}">
	<jsp:include page="admin_error.jsp"></jsp:include>
	
	<c:url value="/admin/database/edit" var="editUrl"/>	
	<div class="col-sm-12">
		<form:form modelAttribute="databaseForm" action="${editUrl} " enctype="multipart/form-data">
			<c:choose>
			  	<c:when test="${databaseForm.pageMode == 'list' }">
			  	<div class='row form-group'>
			  		<a style="float:right;margin-right: 1.5em;"  	class="btn btn-sm btn-success" href="<c:url value="/admin/database/add"/>"><spring:message code="anvizent.package.label.Add"/></a>
			  	</div>
					<div class='row form-group'>
						<div class="table-responsive">
							<table class="table table-striped table-bordered tablebg " id="databaseConnectorTable">
								<thead>
									<tr>
										<th><spring:message code="anvizent.package.label.sNo"/></th>
										<th><spring:message code="anvizent.package.label.databaseName"/></th>
										<th><spring:message code="anvizent.package.label.drivername"/></th>
										<th><spring:message code="anvizent.package.label.protocal"/></th>
										<th><spring:message code="anvizent.package.label.urlformat"/></th>
										<th><spring:message code="anvizent.package.label.isActive"/></th>
										<th><spring:message code="anvizent.package.label.edit"/></th>
									</tr>
								</thead>
								<tbody>
									<c:forEach items="${databaseConnector}" var="dbConnector" varStatus="index">
										<tr>
											<td>${index.index+1}</td>
											<td id="dbName"><c:out value="${dbConnector.name}" /></td>
											<td id="driverName"><c:out value="${dbConnector.driverName}" /></td>
											<td id="protocal"><c:out value="${dbConnector.protocal}" /></td>
											<td id="urlFormat"><c:out value="${dbConnector.urlFormat}" /></td>
											<td>${dbConnector.isActive == true ? 'Yes' : 'No'}</td>
											<td> 
												<button class="btn btn-primary btn-sm tablebuttons" name="id" value="${dbConnector.id}" title="<spring:message code="anvizent.package.label.edit"/>" >
													<i class="fa fa-pencil" aria-hidden="true"></i>
												</button>
											</td>								
										</tr>
									</c:forEach>
								</tbody>
							</table>
						</div>
				    </div>
				</c:when>
				
				<c:when test="${databaseForm.pageMode == 'edit' || databaseForm.pageMode == 'add' }">
					
					<c:set var="updateMode" value="Update" />
					<c:if test="${databaseForm.pageMode == 'add'  }">
						<c:set var="updateMode" value="Add" />
					</c:if>
						<div class="panel panel-default">
							<div class="panel-heading">${updateMode } <spring:message code="anvizent.package.label.DatabaseDetails"/></div>
							<div class="panel-body">
								<div class="row form-group">
									<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.databaseName"/> :</label>
									<div class='col-sm-6'>
										<form:hidden path="id" class="form-control"/>
										<spring:message code="anvizent.package.label.database" var="database"/>
										<form:input path="databaseName" class="form-control" placeholder="${database}" data-maxlength="255"/>
									</div>
							 	</div>
							<div class="row form-group">
									<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.drivername"/> :</label>
									<div class='col-sm-6'>
										<spring:message code="anvizent.package.label.drivername" var="driverName"/>
										<form:input path="driverName" class="form-control" placeholder="${driverName}" data-maxlength="255"/>
									</div>
								</div>
								<div class="row form-group">
									<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.protocal"/> :</label>
									<div class='col-sm-6'>
										<spring:message code="anvizent.package.label.protocal" var="protocal"/>
										<form:input path="protocal" class="form-control" placeholder="${protocal}" data-maxlength="255"/>
									</div>
								</div>  
								<div class="row form-group">
									<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.urlformat"/> :</label>
									<div class='col-sm-6'>
										<spring:message code="anvizent.package.label.urlformat" var="urlFormat"/>
										<form:input path="urlFormat" class="form-control" placeholder="${urlFormat}" data-maxlength="255"/>
									</div>
								</div>
								<div class="jobFilesDiv">
								 <c:forEach var="conJarsName" items="${databaseForm.conJars}" varStatus="loop">
								<div class="row form-group fileContainer">
									<c:if test="${loop.index == 0}">
										<label class="control-label col-sm-2 connector-jar-file-name"><spring:message code="anvizent.package.label.connectorJar"/> : </label>
									</c:if>
									<c:if test="${loop.index > 0}">
										<label class="control-label col-sm-2 connector-jar-file-name"></label>
									</c:if>
									<div class="col-sm-6">
										<label class="checkbox" style="margin-left: 20px;">
										  	<input type="checkbox" name="useOldConnectorJarFile" class="useOldConnectorJarFile" checked="checked">
										</label>
										<h5 class="jobFileName" style="margin-left: 20px;"><c:out value="${conJarsName}"/></h5>
										<form:hidden path="conJars[${loop.index}]" cssClass="conJars"/>	
								    </div>
								    <div class="col-sm-2">
								    	<a href="#" class="btn btn-primary btn-sm addConnectorJar"> <span class="glyphicon glyphicon-plus"></span> </a>				    	
								    </div>
								</div>
							</c:forEach>
							<c:if test="${empty databaseForm.conJars}">
					    			<div class="row form-group fileContainer">
									<label class="control-label col-sm-2 connector-jar-file-name"><spring:message code="anvizent.package.label.connectorJar"/> : </label>
						    		<div class="col-sm-6">			    			
								    	<input type="file" class=connectorJars name="connectorJars">
								    </div>
								    <div class="col-sm-2">
								    	<a href="#" class="btn btn-primary btn-sm addConnectorJar"> <span class="glyphicon glyphicon-plus"></span> </a>
								    </div>
								</div>
					    	</c:if>	
					    	<div class='uploadedJobFileNames'></div>	
						 </div>
								<div class="row form-group">
									<label class="control-label col-sm-2"><spring:message code="anvizent.package.label.activeStatus"/> :</label>
									<div class='col-sm-6'>
									 	<div class="activeStatus">
									 		 <label class="radio-inline">
												<form:radiobutton path="isActive" value="true"/><spring:message code="anvizent.package.button.yes"/>
											 </label>	
											 <label class="radio-inline">
										    	<form:radiobutton path="isActive" value="false"/><spring:message code="anvizent.package.button.no"/> 
										    </label>
									 	</div>
									</div>
								</div>
								
								
								<div class="row form-group">
									<label class="control-label col-sm-3"></label>
									<div class="col-sm-6">
										<c:url value="/admin/database/add" var="addUrl"/>
										<input type="hidden" value="${addUrl}" id="addUrl">
										<c:url value="/admin/database/update" var="updateUrl"/>
										<input type="hidden" value="${updateUrl}" id="updateUrl">
										<form:hidden path="id" class="form-control"/>
									</div>
								</div>
								<div class="row form-group">
									<div class="col-sm-6">								
										<c:choose>
											<c:when test="${databaseForm.pageMode == 'edit'}">
												<button id="updateDBMaster" type="button" class="btn btn-primary btn-sm"><spring:message code="anvizent.package.label.Update"/></button>
											 
											</c:when>
											<c:when test="${databaseForm.pageMode == 'add'}">
												<button id="addDB" type="button" class="btn btn-primary btn-sm"><spring:message code="anvizent.package.label.Add"/></button>
											</c:when>
										</c:choose>
										<a href="<c:url value="/admin/database"/>" class="btn btn-primary btn-sm back_btn"><spring:message code="anvizent.package.label.Back"/></a>
									</div>
								</div>
							</div>
						</div>
				</c:when>
			</c:choose> 
		</form:form>	
	</div>	
	 
								<div class="row form-group" id="fileContainer" style="display:none;">
								<label class="control-label col-sm-2 connector-jar-file-name"></label>
						    		<div class="col-sm-6">			    			
								    	<input type="file" class="connectorJars" name="connectorJars">
								    </div>
								    <div class="col-sm-2">
								    	<a href="#" class="btn btn-primary btn-sm addConnectorJar"> <span class="glyphicon glyphicon-plus"></span> </a>
								    	<a href="#" class="btn btn-primary btn-sm deleteConnectorJar"> <span class="glyphicon glyphicon-trash"></span> </a>
								    </div>
								</div>
</div>