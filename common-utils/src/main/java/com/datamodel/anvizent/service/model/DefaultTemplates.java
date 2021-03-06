package com.datamodel.anvizent.service.model;

public class DefaultTemplates {
	
	private int templateId;
	private String templateName;
	private String description;
	private boolean isActive;
	private String pageMode;
	private Modification modification;
	private boolean trialTemplate;
	public int getTemplateId() {
		return templateId;
	}
	public void setTemplateId(int templateId) {
		this.templateId = templateId;
	}
	public String getTemplateName() {
		return templateName;
	}
	public void setTemplateName(String templateName) {
		this.templateName = templateName;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public boolean isActive() {
		return isActive;
	}
	public void setActive(boolean isActive) {
		this.isActive = isActive;
	}
	public String getPageMode() {
		return pageMode;
	}
	public void setPageMode(String pageMode) {
		this.pageMode = pageMode;
	}
	public Modification getModification() {
		return modification;
	}
	public void setModification(Modification modification) {
		this.modification = modification;
	}
	public boolean isTrialTemplate() {
		return trialTemplate;
	}
	public void setTrialTemplate(boolean trialTemplate) {
		this.trialTemplate = trialTemplate;
	}
	@Override
	public String toString() {
		return "DefaultTemplates [templateId=" + templateId + ", templateName=" + templateName + ", description="
				+ description + ", isActive=" + isActive + ", pageMode=" + pageMode + ", modification=" + modification
				+ ", trialTemplate=" + trialTemplate + "]";
	}
	
	
	
	
}
