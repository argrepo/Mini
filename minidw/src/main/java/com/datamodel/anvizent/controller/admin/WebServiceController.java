package com.datamodel.anvizent.controller.admin;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.datamodel.anvizent.data.controller.RestTemplateUtilities;
import com.datamodel.anvizent.helper.minidw.CommonUtils;
import com.datamodel.anvizent.service.model.DataResponse;
import com.datamodel.anvizent.service.model.OAuth2;
import com.datamodel.anvizent.service.model.TimeZones;
import com.datamodel.anvizent.service.model.User;
import com.datamodel.anvizent.service.model.WebServiceAuthenticationTypes;
import com.datamodel.anvizent.service.model.WebServiceTemplateMaster;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * 
 * @author usharani.konda
 *
 */
@Controller
@RequestMapping(value = "/admin/webservice")
public class WebServiceController {
	protected static final Log LOGGER = LogFactory.getLog(WebServiceController.class);

	@Autowired
	@Qualifier("etlAdminServicesRestTemplateUtilities")
	private RestTemplateUtilities restUtilities;

	@Autowired
	@Qualifier("commonServicesRestTemplateUtilities")
	private RestTemplateUtilities restUtilitiesCommon;

	@Autowired
	private MessageSource messageSource;

	@RequestMapping(value = "/webServiceTemplate", method = RequestMethod.GET)
	public ModelAndView webServiceAuthTemplate(HttpServletRequest request, HttpServletResponse response, ModelAndView mv, HttpSession session,
			@ModelAttribute("webServiceTemplateMaster") WebServiceTemplateMaster webServiceTemplateMaster, Locale locale) {
		LOGGER.debug("in webServiceTemplate()");
		CommonUtils.setActiveScreenName("webServiceTemplate", session);
		User user = CommonUtils.getUserDetails(request, null, null);

		try {

			DataResponse dataResponse = restUtilitiesCommon.getRestObject(request, "/getWebserviceTemplate", user.getUserId());

			if (dataResponse != null && dataResponse.getHasMessages()) {
				if (dataResponse.getMessages().get(0).getCode().equals("SUCCESS")) {
					mv.addObject("webServiceTempList", dataResponse.getObject());
				} else {
					mv.addObject("messagecode", dataResponse.getMessages().get(0).getCode());
					mv.addObject("errors", dataResponse.getMessages().get(0).getText());
				}
			} else {
				mv.addObject("messagecode", "FAILED");
				mv.addObject("errors", messageSource.getMessage("anvizent.package.label.unableToProcessYourRequest", null, locale));
			}

		} catch (Exception e) {
			mv.addObject("messagecode", "FAILED");
			mv.addObject("errors", messageSource.getMessage("anvizent.package.label.unableToProcessYourRequest", null, locale));
			e.printStackTrace();
		}

		webServiceTemplateMaster.setPageMode("list");
		mv.setViewName("tiles-anvizent-admin:webServiceTemplate");
		return mv;

	}

	@RequestMapping(value = "/webServiceTemplate/add", method = RequestMethod.GET)
	public ModelAndView webServiceTemplates(HttpServletRequest request, HttpServletResponse response, ModelAndView mv,
			@ModelAttribute("webServiceTemplateMaster") WebServiceTemplateMaster webServiceTemplateMaster, Locale locale) {
		LOGGER.debug("in webServiceTemplate Add ()");
		mv.setViewName("tiles-anvizent-admin:webServiceTemplate");
		webServiceTemplateMaster.setPageMode("add");
		mv.addObject("timesZoneList", getTimesZoneList(request));
		return mv;
	}

	@RequestMapping(value = "/webServiceTemplate/add", method = RequestMethod.POST)
	public ModelAndView webServiceTemplate(HttpServletRequest request, HttpServletResponse response, ModelAndView mv,
			@ModelAttribute("webServiceTemplateMaster") WebServiceTemplateMaster webServiceTemplateMaster, Locale locale) {
		LOGGER.debug("in webServiceAuthentication()");
		User user = CommonUtils.getUserDetails(request, null, null);
		if (user != null) {
			try {
				DataResponse dataResponse = restUtilities.postRestObject(request, "/getAllWebServices", user.getUserId());
				mv.addObject("webservicelist", dataResponse.getObject());
				mv.addObject("timesZoneList", getTimesZoneList(request));
				mv.setViewName("tiles-anvizent-admin:webServiceTemplate");
			} catch (Exception e) {
				mv.addObject("messagecode", "FAILED");
				mv.addObject("errors", messageSource.getMessage("anvizent.package.label.unableToProcessYourRequest", null, locale));
				e.printStackTrace();
			}
		}
		return mv;
	}

	@SuppressWarnings("unchecked")
	public Map<Object, Object> getTimesZoneList(HttpServletRequest request) {

		User user = CommonUtils.getUserDetails(request, null, null);
		DataResponse dataResponse = restUtilitiesCommon.getRestObject(request, "/getTimeZones", user.getUserId());
		List<TimeZones> zoneNames = null;
		if (dataResponse != null && dataResponse.getHasMessages() && dataResponse.getMessages().get(0).getCode().equals("SUCCESS")) {

			List<LinkedHashMap<String, Object>> timeZoneResponse = (List<LinkedHashMap<String, Object>>) dataResponse.getObject();
			ObjectMapper mapper =new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			zoneNames = mapper.convertValue(timeZoneResponse, new TypeReference<List<TimeZones>>() {
			});

		} else {
			zoneNames = new ArrayList<>();
		}

		Map<Object, Object> zonesMap = new LinkedHashMap<>();
		for (TimeZones timeZone : zoneNames) {
			zonesMap.put(timeZone.getZoneName(), timeZone.getZoneNameDisplay());
		}

		return zonesMap;
	}

	@SuppressWarnings("unchecked")
	@ModelAttribute("webServiceAuthenticationTypes")
	public Map<Object, Object> getWebServiceAuthenticationTypes(HttpServletRequest request) {
		List<WebServiceAuthenticationTypes> authTypes = null;
		User user = CommonUtils.getUserDetails(request, null, null);
		DataResponse dataResponse = restUtilitiesCommon.getRestObject(request, "/getWebServiceAuthenticationTypes", user.getUserId());
		if (dataResponse != null && dataResponse.getHasMessages() && dataResponse.getMessages().get(0).getCode().equals("SUCCESS")) {
			List<LinkedHashMap<String, Object>> authResponse = (List<LinkedHashMap<String, Object>>) dataResponse.getObject();
			ObjectMapper mapper =new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			authTypes = mapper.convertValue(authResponse, new TypeReference<List<WebServiceAuthenticationTypes>>() {
			});
		} else {
			return new HashMap<>();
		}

		Map<Object, Object> authTypesList = new LinkedHashMap<>();
		for (WebServiceAuthenticationTypes wsAuthTypes : authTypes) {

			authTypesList.put(wsAuthTypes.getId(), wsAuthTypes.getAuthenticationType());
		}
		return authTypesList;

	}

	@RequestMapping(value = "/webServiceTemplate/save", method = RequestMethod.POST)
	public ModelAndView saveWebServiceTemplate(HttpServletRequest request, HttpServletResponse response, ModelAndView mv,
			@ModelAttribute("webServiceTemplateMaster") WebServiceTemplateMaster webServiceTemplateMaster, RedirectAttributes redirectAttributes,
			Locale locale) {

		LOGGER.info("in saveWebServiceTemplate()");
		User user = CommonUtils.getUserDetails(request, null, null);
		try {
			mv.setViewName("rediect:/admin/webservice/webServiceTemplate");
			DataResponse dataResponse = restUtilitiesCommon.postRestObject(request, "/saveWebServiceTemplate", webServiceTemplateMaster, user.getUserId());
			if (dataResponse != null && dataResponse.getMessages().get(0).getCode().equals("SUCCESS")) {
				redirectAttributes.addFlashAttribute("messagecode", dataResponse.getMessages().get(0).getCode());
				redirectAttributes.addFlashAttribute("errors", dataResponse.getMessages().get(0).getText());
				mv.setViewName("redirect:/admin/webservice/webServiceTemplate");
			} else {
				mv.setViewName("tiles-anvizent-admin:webServiceTemplate");
				mv.addObject("messagecode", dataResponse.getMessages().get(0).getCode());
				mv.addObject("errors", dataResponse.getMessages().get(0).getText());

			}

		} catch (Exception e) {
			redirectAttributes.addFlashAttribute("messagecode", "FAILED");
			redirectAttributes.addFlashAttribute("errors", messageSource.getMessage("anvizent.package.label.unableToProcessYourRequest", null, locale));
			e.printStackTrace();
		}

		return mv;
	}

	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/webServiceTemplate/edit", method = RequestMethod.POST)
	public ModelAndView getWebServiceTempById(HttpServletRequest request, HttpServletResponse response, ModelAndView mv,
			@ModelAttribute("webServiceTemplateMaster") WebServiceTemplateMaster webServiceTemplateMaster, RedirectAttributes redirectAttributes,
			BindingResult result, Locale locale) {
		LOGGER.info("in getWebServiceTempById");
		User user = CommonUtils.getUserDetails(request, null, null);
		try {
			DataResponse dataResponse = restUtilitiesCommon.postRestObject(request, "/getWebServiceTemplateById", webServiceTemplateMaster, user.getUserId());

			if (dataResponse != null && dataResponse.getHasMessages()) {
				if (dataResponse.getMessages().get(0).getCode().equals("SUCCESS")) {
					LinkedHashMap<String, Object> map = (LinkedHashMap<String, Object>) dataResponse.getObject();
					ObjectMapper mapper =new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
					WebServiceTemplateMaster webServiceTemplate = mapper.convertValue(map, new TypeReference<WebServiceTemplateMaster>() {
					});
					webServiceTemplateMaster.setId(webServiceTemplate.getId());
					webServiceTemplateMaster.setWebServiceName(webServiceTemplate.getWebServiceName());

					WebServiceAuthenticationTypes wsAuthTypes = new WebServiceAuthenticationTypes();

					wsAuthTypes.setId(webServiceTemplate.getWebServiceAuthenticationTypes().getId());
					webServiceTemplateMaster.setWebServiceAuthenticationTypes(wsAuthTypes);

					webServiceTemplateMaster.setDateFormat(webServiceTemplate.getDateFormat());
					webServiceTemplateMaster.setTimeZone(webServiceTemplate.getTimeZone());
					webServiceTemplateMaster.setBaseUrl(webServiceTemplate.getBaseUrl());
					webServiceTemplateMaster.setBaseUrlRequired(webServiceTemplate.isBaseUrlRequired());
					webServiceTemplateMaster.setAuthenticationUrl(webServiceTemplate.getAuthenticationUrl());
					webServiceTemplateMaster.setAuthenticationMethodType(webServiceTemplate.getAuthenticationMethodType());
					webServiceTemplateMaster.setApiAuthRequestParams(webServiceTemplate.getApiAuthRequestParams());
					webServiceTemplateMaster.setApiAuthBodyParams(webServiceTemplate.getApiAuthBodyParams());
					webServiceTemplateMaster.setApiAuthRequestHeaders(webServiceTemplate.getApiAuthRequestHeaders());
					webServiceTemplateMaster.setAuthenticationBodyParams(webServiceTemplate.getAuthenticationBodyParams());
					webServiceTemplateMaster.setWebserviceType(webServiceTemplate.getWebserviceType());
					webServiceTemplateMaster.setSoapBodyElement(webServiceTemplate.getSoapBodyElement());

					OAuth2 oAuth = new OAuth2();
					oAuth.setRedirectUrl(webServiceTemplate.getoAuth2().getRedirectUrl());
					oAuth.setAccessTokenUrl(webServiceTemplate.getoAuth2().getAccessTokenUrl());
					oAuth.setGrantType(webServiceTemplate.getoAuth2().getGrantType());
					oAuth.setClientIdentifier(webServiceTemplate.getoAuth2().getClientIdentifier());
					oAuth.setClientSecret(webServiceTemplate.getoAuth2().getClientSecret());
					oAuth.setScope(webServiceTemplate.getoAuth2().getScope());
					oAuth.setState(webServiceTemplate.getoAuth2().getState());
					webServiceTemplateMaster.setoAuth2(oAuth);
					webServiceTemplateMaster.setActive(webServiceTemplate.isActive());
					webServiceTemplateMaster.setSslDisable(webServiceTemplate.isSslDisable());
					webServiceTemplateMaster.setWebServiceTemplateAuthRequestparams(webServiceTemplate.getWebServiceTemplateAuthRequestparams());

					mv.addObject("timesZoneList", getTimesZoneList(request));
					mv.setViewName("tiles-anvizent-admin:webServiceTemplate");
					webServiceTemplateMaster.setPageMode("edit");

				} else {
					redirectAttributes.addFlashAttribute("messagecode", dataResponse.getMessages().get(0).getCode());
					redirectAttributes.addFlashAttribute("errors", dataResponse.getMessages().get(0).getText());
				}
			} else {
				redirectAttributes.addFlashAttribute("messagecode", "FAILED");
				redirectAttributes.addFlashAttribute("errors", messageSource.getMessage("anvizent.package.label.unableToProcessYourRequest", null, locale));
			}

		} catch (Exception ae) {
			redirectAttributes.addFlashAttribute("messagecode", "failed");
			redirectAttributes.addFlashAttribute("errors", messageSource.getMessage("anvizent.package.label.unableToProcessYourRequest", null, locale));
		}
		return mv;
	}

}
