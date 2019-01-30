<%@page import="java.util.Calendar"%>
<%@ taglib uri="http://www.springframework.org/tags" prefix="spring"%>
<%@ taglib uri="http://tomcat.apache.org/date-taglib" prefix="date"%>

<div class="col-sm-12" style="border-top: 1px solid #ccc;">
	<p><spring:message code="footer.copyright"/>&copy; <%=Calendar.getInstance().get(Calendar.YEAR) %> &nbsp;&nbsp;&nbsp;V${version}&nbsp;&nbsp;&nbsp; <date:today/> </p>
</div>
