package com.datamodel.anvizent.service.model;

import java.util.List;

public class DefaultMappingInfoForm {
	private Integer clientId;	
	private List<DLInfo> dLInfo;
	private List<TableScripts> tableScripts;	
	private List<String> verticals;
	private List<String> connectors;
	private ClientCurrencyMapping clientCurrencyMapping;
	private String pageMode;
	private AllMappingInfoForm allMappingInfoForm; 
	private boolean skipVerticals;
	private boolean skipConnectors;
	private boolean skipDLs;
	private boolean skipTableScripts;
	private boolean skipCurrency;
	private int templateId;
	private List<String> webServices;
	private boolean skipWebServices;
	private String bucketId;
	private boolean skipS3Bucket;
	
	
	public String getBucketId() {
		return bucketId;
	}
	public void setBucketId(String bucketId) {
		this.bucketId = bucketId;
	}
	public Integer getClientId() {
		return clientId;
	}
	public void setClientId(Integer clientId) {
		this.clientId = clientId;
	}	
	public List<DLInfo> getdLInfo() {
		return dLInfo;
	}
	public void setdLInfo(List<DLInfo> dLInfo) {
		this.dLInfo = dLInfo;
	}	
	public List<TableScripts> getTableScripts() {
		return tableScripts;
	}
	public void setTableScripts(List<TableScripts> tableScripts) {
		this.tableScripts = tableScripts;
	}
	public List<String> getVerticals() {
		return verticals;
	}
	public void setVerticals(List<String> verticals) {
		this.verticals = verticals;
	}
	public List<String> getConnectors() {
		return connectors;
	}
	public void setConnectors(List<String> connectors) {
		this.connectors = connectors;
	}
	public String getPageMode() {
		return pageMode;
	}
	public void setPageMode(String pageMode) {
		this.pageMode = pageMode;
	}
	public AllMappingInfoForm getAllMappingInfoForm() {
		return allMappingInfoForm;
	}
	public void setAllMappingInfoForm(AllMappingInfoForm allMappingInfoForm) {
		this.allMappingInfoForm = allMappingInfoForm;
	}
	public Boolean getSkipVerticals() {
		return skipVerticals;
	}
	public void setSkipVerticals(Boolean skipVerticals) {
		this.skipVerticals = skipVerticals;
	}
	public Boolean getSkipConnectors() {
		return skipConnectors;
	}
	public void setSkipConnectors(Boolean skipConnectors) {
		this.skipConnectors = skipConnectors;
	}
	public Boolean getSkipDLs() {
		return skipDLs;
	}
	public void setSkipDLs(Boolean skipDLs) {
		this.skipDLs = skipDLs;
	}
	public Boolean getSkipTableScripts() {
		return skipTableScripts;
	}
	public void setSkipTableScripts(Boolean skipTableScripts) {
		this.skipTableScripts = skipTableScripts;
	}
	public int getTemplateId() {
		return templateId;
	}
	public void setTemplateId(int templateId) {
		this.templateId = templateId;
	}
	public List<String> getWebServices() {
		return webServices;
	}
	public void setWebServices(List<String> webServices) {
		this.webServices = webServices;
	}
	public boolean getSkipWebServices() {
		return skipWebServices;
	}
	public void setSkipWebServices(boolean skipWebServices) {
		this.skipWebServices = skipWebServices;
	}
	public ClientCurrencyMapping getClientCurrencyMapping() {
		return clientCurrencyMapping;
	}
	public void setClientCurrencyMapping(ClientCurrencyMapping clientCurrencyMapping) {
		this.clientCurrencyMapping = clientCurrencyMapping;
	}
	public boolean isSkipCurrency() {
		return skipCurrency;
	}
	public void setSkipCurrency(boolean skipCurrency) {
		this.skipCurrency = skipCurrency;
	}
	@Override
	public String toString() {
		return "DefaultMappingInfoForm [clientId=" + clientId + ", dLInfo=" + dLInfo + ", tableScripts=" + tableScripts
				+ ", verticals=" + verticals + ", connectors=" + connectors + ", clientCurrencyMapping="
				+ clientCurrencyMapping + ", pageMode=" + pageMode + ", allMappingInfoForm=" + allMappingInfoForm
				+ ", skipVerticals=" + skipVerticals + ", skipConnectors=" + skipConnectors + ", skipDLs=" + skipDLs
				+ ", skipTableScripts=" + skipTableScripts + ", skipCurrency=" + skipCurrency + ", templateId="
				+ templateId + ", webServices=" + webServices + ", skipWebServices=" + skipWebServices + "]";
	}
	
}
