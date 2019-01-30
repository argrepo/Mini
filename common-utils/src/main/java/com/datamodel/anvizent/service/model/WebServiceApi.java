package com.datamodel.anvizent.service.model;

import java.util.List;

public class WebServiceApi {
	
	private Long id;
	private WebServiceConnectionMaster webServiceConnectionMaster;
	private Long ilId;
	private String apiName;
	private String apiUrl;
	private String apiMethodType;
	private String apiPathParams;
	private String apiRequestParams;
	private String apiBodyParams;
	private String inclUpdateDate;
	private String responseColumnObjectName;
	private String responseObjectName;
	private Boolean active;
	private Modification modification;
	private List<WebServiceJoin> webServiceJoinList;
	private boolean incrementalUpdate;
	private String incrementalUpdateparamdata;
	private Boolean paginationRequired;
	private String paginationType;
	private String paginationRequestParamsData;
	private Boolean validateOrPreview=false;
	private Boolean baseUrlRequired=false;
	private String baseUrl;
	private String soapBodyElement;
	private Table table;
	private String mappedHeaders;
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public WebServiceConnectionMaster getWebServiceConnectionMaster() {
		return webServiceConnectionMaster;
	}
	public void setWebServiceConnectionMaster(WebServiceConnectionMaster webServiceConnectionMaster) {
		this.webServiceConnectionMaster = webServiceConnectionMaster;
	}
	public Long getIlId() {
		return ilId;
	}
	public void setIlId(Long ilId) {
		this.ilId = ilId;
	}
	public String getApiName() {
		return apiName;
	}
	public void setApiName(String apiName) {
		this.apiName = apiName;
	}
	public String getApiUrl() {
		return apiUrl;
	}
	public void setApiUrl(String apiUrl) {
		this.apiUrl = apiUrl;
	}
	public String getApiMethodType() {
		return apiMethodType;
	}
	public void setApiMethodType(String apiMethodType) {
		this.apiMethodType = apiMethodType;
	}
	public String getApiPathParams() {
		return apiPathParams;
	}
	public void setApiPathParams(String apiPathParams) {
		this.apiPathParams = apiPathParams;
	}
	public String getApiRequestParams() {
		return apiRequestParams;
	}
	public void setApiRequestParams(String apiRequestParams) {
		this.apiRequestParams = apiRequestParams;
	}
	public String getApiBodyParams() {
		return apiBodyParams;
	}
	public void setApiBodyParams(String apiBodyParams) {
		this.apiBodyParams = apiBodyParams;
	}
	public String getResponseObjectName() {
		return responseObjectName;
	}
	public String getResponseColumnObjectName() {
		return responseColumnObjectName;
	}
	public void setResponseColumnObjectName(String responseColumnObjectName) {
		this.responseColumnObjectName = responseColumnObjectName;
	}
	public void setResponseObjectName(String responseObjectName) {
		this.responseObjectName = responseObjectName;
	}
	public Boolean getActive() {
		return active;
	}
	public void setActive(Boolean active) {
		this.active = active;
	}
	public Modification getModification() {
		return modification;
	}
	public void setModification(Modification modification) {
		this.modification = modification;
	}
	public List<WebServiceJoin> getWebServiceJoinList() {
		return webServiceJoinList;
	}
	public void setWebServiceJoinList(List<WebServiceJoin> webServiceJoinList) {
		this.webServiceJoinList = webServiceJoinList;
	}
	public String getInclUpdateDate() {
		return inclUpdateDate;
	}
	public void setInclUpdateDate(String inclUpdateDate) {
		this.inclUpdateDate = inclUpdateDate;
	}
	
	public boolean getIncrementalUpdate() {
		return incrementalUpdate;
	}
	public void setIncrementalUpdate(boolean incrementalUpdate) {
		this.incrementalUpdate = incrementalUpdate;
	}
	public String getIncrementalUpdateparamdata() {
		return incrementalUpdateparamdata;
	}
	public void setIncrementalUpdateparamdata(String incrementalUpdateparamdata) {
		this.incrementalUpdateparamdata = incrementalUpdateparamdata;
	}
	public Boolean getPaginationRequired() {
		return paginationRequired;
	}
	public void setPaginationRequired(Boolean paginationRequired) {
		this.paginationRequired = paginationRequired;
	}
	public String getPaginationRequestParamsData() {
		return paginationRequestParamsData;
	}
	public void setPaginationRequestParamsData(String paginationRequestParamsData) {
		this.paginationRequestParamsData = paginationRequestParamsData;
	}
	
	public String getPaginationType() {
		return paginationType;
	}
	public void setPaginationType(String paginationType) {
		this.paginationType = paginationType;
	}
	public Boolean getValidateOrPreview() {
		return validateOrPreview;
	}
	public void setValidateOrPreview(Boolean validateOrPreview) {
		this.validateOrPreview = validateOrPreview;
	}
	public Boolean getBaseUrlRequired() {
		return baseUrlRequired;
	}
	public void setBaseUrlRequired(Boolean baseUrlRequired) {
		this.baseUrlRequired = baseUrlRequired;
	}
	public String getBaseUrl() {
		return baseUrl;
	}
	public void setBaseUrl(String baseUrl) {
		this.baseUrl = baseUrl;
	}
	public String getSoapBodyElement() {
		return soapBodyElement;
	}
	public void setSoapBodyElement(String soapBodyElement) {
		this.soapBodyElement = soapBodyElement;
	}
	public Table getTable()
	{
		return table;
	}
	public void setTable(Table tanble)
	{
		this.table = tanble;
	}
	public String getMappedHeaders()
	{
		return mappedHeaders;
	}
	public void setMappedHeaders(String mappedHeaders)
	{
		this.mappedHeaders = mappedHeaders;
	}
	@Override
	public String toString()
	{
		return "WebServiceApi [id=" + id + ", webServiceConnectionMaster=" + webServiceConnectionMaster + ", ilId=" + ilId + ", apiName=" + apiName + ", apiUrl=" + apiUrl + ", apiMethodType=" + apiMethodType + ", apiPathParams=" + apiPathParams + ", apiRequestParams=" + apiRequestParams
				+ ", apiBodyParams=" + apiBodyParams + ", inclUpdateDate=" + inclUpdateDate + ", responseColumnObjectName=" + responseColumnObjectName + ", responseObjectName=" + responseObjectName + ", active=" + active + ", modification=" + modification + ", webServiceJoinList="
				+ webServiceJoinList + ", incrementalUpdate=" + incrementalUpdate + ", incrementalUpdateparamdata=" + incrementalUpdateparamdata + ", paginationRequired=" + paginationRequired + ", paginationType=" + paginationType + ", paginationRequestParamsData=" + paginationRequestParamsData
				+ ", validateOrPreview=" + validateOrPreview + ", baseUrlRequired=" + baseUrlRequired + ", baseUrl=" + baseUrl + ", soapBodyElement=" + soapBodyElement + ", table=" + table + ", mappedHeaders=" + mappedHeaders + "]";
	}
	 
}
