package minidwclientws;

import static com.anvizent.minidw.service.utils.helper.CommonUtils.sanitizeCsvForWsTempTable;
import static com.anvizent.minidw.service.utils.helper.WebServiceCSVWriter.collectHeaders;
import static com.anvizent.minidw.service.utils.helper.WebServiceCSVWriter.createTargetTable;
import static com.anvizent.minidw.service.utils.helper.WebServiceCSVWriter.tempTableForming;

import java.io.IOException;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URLDecoder;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.DateFormat;
import java.text.Format;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.StringJoiner;
import java.util.TimeZone;
import java.util.UUID;

import javax.net.ssl.SSLContext;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpResponse;
import org.apache.http.ParseException;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.protocol.HTTP;
import org.apache.http.ssl.TrustStrategy;
import org.apache.http.util.EntityUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.parser.JSONParser;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import com.anvizent.minidw.service.utils.helper.ApiJsonFlatten;
import com.datamodel.anvizent.common.exception.AnvizentRuntimeException;
import com.datamodel.anvizent.common.exception.ClientWebserviceRequestException;
import com.datamodel.anvizent.helper.OAuthConstants;
import com.datamodel.anvizent.helper.minidw.Constants;
import com.datamodel.anvizent.service.model.ClientData;
import com.datamodel.anvizent.service.model.Column;
import com.datamodel.anvizent.service.model.OAuth2;
import com.datamodel.anvizent.service.model.Package;
import com.datamodel.anvizent.service.model.Table;
import com.datamodel.anvizent.service.model.WebServiceApi;
import com.datamodel.anvizent.service.model.WebServiceConnectionMaster;
import com.datamodel.anvizent.service.model.WebServiceTemplateMaster;
import com.mysql.jdbc.exceptions.MySQLSyntaxErrorException;

import sun.misc.BASE64Encoder;

public class WebServiceUtils
{
	static final int WEB_SERVICE_SLEEP_TIME = 5000;
	private static int MAX_API_HIT_LIMIT = 5;

	protected static final Log LOG = LogFactory.getLog(WebServiceUtils.class);
	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static ResponseEntity<Map> testAuthenticationUrl(WebServiceConnectionMaster webServiceConnectionMaster, RestTemplate restTemplate)
	{

		String authenticationUrl = null;
		String authenticationUrlMethodType = null;
		ResponseEntity<Map> response = null;
		String authPathParams = "";
		JSONObject authPathParamJsonObj = null;
		String authRequestParams = "";
		JSONObject authRequestParamJsonObj = null;
		try
		{
			HttpHeaders headers = new HttpHeaders();
			headers.add("Content-Type", "application/json");
			headers.add("Accept", "application/json");

			Long authenticationType = webServiceConnectionMaster.getWebServiceTemplateMaster().getWebServiceAuthenticationTypes().getId();
			/* for No Auth */
			if( authenticationType == 1 )
			{
				return new ResponseEntity<Map>(new HashMap<>(), HttpStatus.OK);
			}
			/* for basic and OAuth2 Authentication */
			if( webServiceConnectionMaster.getWebServiceTemplateMaster().isBaseUrlRequired() )
			{
				authenticationUrl = webServiceConnectionMaster.getWebServiceTemplateMaster().getBaseUrl() + webServiceConnectionMaster.getWebServiceTemplateMaster().getAuthenticationUrl();
			}
			else
			{
				authenticationUrl = webServiceConnectionMaster.getWebServiceTemplateMaster().getAuthenticationUrl();
			}
			authPathParams = webServiceConnectionMaster.getAuthPathParams();

			if( authPathParams != null )
			{
				authPathParamJsonObj = new JSONObject(authPathParams);
				Iterator<String> keys = authPathParamJsonObj.keys();
				while (keys.hasNext())
				{
					String key = keys.next();
					authenticationUrl = StringUtils.replace(authenticationUrl, "{#" + key + "}", authPathParamJsonObj.getString(key));
				}
			}

			authRequestParams = webServiceConnectionMaster.getRequestParams();
			StringBuilder requestParams = new StringBuilder();
			if( StringUtils.isNotBlank(authRequestParams) )
			{
				authRequestParamJsonObj = new JSONObject(authRequestParams);
				Iterator<String> keys = authRequestParamJsonObj.keys();
				while (keys.hasNext())
				{
					String key = keys.next();
					requestParams.append(key).append("=").append(authRequestParamJsonObj.getString(key)).append("&");
				}
			}
			JSONObject authBodyParamJsonObj = null;
			String authBodyParams = webServiceConnectionMaster.getBodyParams();
			JSONObject bodyParams = new JSONObject();
			if( StringUtils.isNotBlank(authBodyParams) )
			{
				authBodyParamJsonObj = new JSONObject(authBodyParams);
				Iterator<String> keys = authBodyParamJsonObj.keys();
				while (keys.hasNext())
				{
					String key = keys.next();
					bodyParams.put(key, authBodyParamJsonObj.getString(key));
				}
			}

			if( requestParams.length() > 0 )
			{
				requestParams.deleteCharAt(requestParams.length() - 1);
				authenticationUrl += (authenticationUrl.contains("?") ? "&" : "?") + requestParams;
			}

			authenticationUrlMethodType = webServiceConnectionMaster.getWebServiceTemplateMaster().getAuthenticationMethodType();

			if( authenticationType == 2 )
			{
				URI uri = UriComponentsBuilder.fromUriString(authenticationUrl).build().encode().toUri();
				if( authenticationUrlMethodType.equalsIgnoreCase("post") )
				{
					try
					{
						HttpEntity<Object> headerParamsPost = new HttpEntity<Object>(bodyParams.toString(), headers);
						response = restTemplate.postForEntity(uri, headerParamsPost, Map.class);
					}
					catch ( Exception exception )
					{
						response = new ResponseEntity<Map>(null, HttpStatus.BAD_REQUEST);
					}
				}
				else if( authenticationUrlMethodType.equals("GET") )
				{
					try
					{
						response = restTemplate.getForEntity(uri, Map.class);
					}
					catch ( Exception exception )
					{
						response = new ResponseEntity<Map>(null, HttpStatus.BAD_REQUEST);
					}
				}
			}
			else if( authenticationType == 3 )
			{
				Map<String, String> resp = new HashMap<>();
				if( authRequestParamJsonObj != null )
				{

					String authString = authRequestParamJsonObj.getString("Username") + ":" + authRequestParamJsonObj.getString("Password");
					String authStringEnc = new BASE64Encoder().encode(authString.getBytes());
					resp.put("Authorization", "Basic " + authStringEnc);
					response = new ResponseEntity<Map>(resp, HttpStatus.OK);
				}
				else
				{
					return new ResponseEntity<Map>(resp, HttpStatus.BAD_REQUEST);
				}

			}
			else if( authenticationType == 5 )
			{
				Map<String, String> resp = new HashMap<>();

				if( webServiceConnectionMaster.getId() != null && webServiceConnectionMaster.getId() != 0 )
				{
					if( StringUtils.isNotBlank(webServiceConnectionMaster.getAuthenticationRefreshToken()) )
					{
						resp = getAccesTokenWithRefreshToken(webServiceConnectionMaster);
					}
					else
					{
						resp.put("access_token", webServiceConnectionMaster.getAuthenticationToken());
					}
				}
				else
				{
					if( authenticationUrlMethodType.equalsIgnoreCase("post") )
					{
						resp = getAccesToken(webServiceConnectionMaster);
					}
					else if( authenticationUrlMethodType.equals("GET") )
					{
						String tokenLocation = null;

						if( webServiceConnectionMaster.getWebServiceTemplateMaster().isBaseUrlRequired() )
						{
							tokenLocation = webServiceConnectionMaster.getWebServiceTemplateMaster().getBaseUrl() + webServiceConnectionMaster.getWebServiceTemplateMaster().getoAuth2().getAccessTokenUrl().trim();
						}
						else
						{
							tokenLocation = webServiceConnectionMaster.getWebServiceTemplateMaster().getoAuth2().getAccessTokenUrl().trim();
						}
						String clientidentifier = webServiceConnectionMaster.getWebServiceTemplateMaster().getoAuth2().getClientIdentifier().trim();
						String clientScret = webServiceConnectionMaster.getWebServiceTemplateMaster().getoAuth2().getClientSecret().trim();
						String code = webServiceConnectionMaster.getWebServiceTemplateMaster().getoAuth2().getAuthCodeValue();
						String scope = webServiceConnectionMaster.getWebServiceTemplateMaster().getoAuth2().getScope();
						String state = webServiceConnectionMaster.getWebServiceTemplateMaster().getoAuth2().getState();

						if( StringUtils.isNotBlank(webServiceConnectionMaster.getAuthenticationToken()) )
						{
							resp.put("access_token", webServiceConnectionMaster.getAuthenticationToken());
						}
						else
						{
							StringBuilder url = new StringBuilder();

							if( tokenLocation.contains("?") )
							{
								url.append(tokenLocation).append("&").append(OAuthConstants.CLIENT_ID).append("=").append(clientidentifier).append("&").append(OAuthConstants.CLIENT_SECRET).append("=").append(clientScret).append("&").append(OAuthConstants.CODE).append("=").append(code);
						        if(StringUtils.isNotBlank(scope))
						        {
						        	url.append(OAuthConstants.SCOPE).append("=").append(scope);
						        }
						        if(StringUtils.isNotBlank(state))
						        {
						        	url.append(OAuthConstants.STATE).append("=").append(state);
						        }
							}
							else
							{
								url.append(tokenLocation).append("?").append(OAuthConstants.CLIENT_ID).append("=").append(clientidentifier).append("&").append(OAuthConstants.CLIENT_SECRET).append("=").append(clientScret).append("&").append(OAuthConstants.CODE).append("=").append(code);
							    if(StringUtils.isNotBlank(scope))
						         {
						         	url.append(OAuthConstants.SCOPE).append("=").append(scope);
						         }
						         if(StringUtils.isNotBlank(state))
						         {
						         	url.append(OAuthConstants.STATE).append("=").append(state);
						         }
							} 
							System.out.println("url------>"+url);
							response = restTemplate.getForEntity(url.toString(), Map.class, headers);
							resp = response.getBody();
						}
					}
				}

				if( resp == null || resp.size() == 0 )
				{
					return new ResponseEntity<Map>(resp, HttpStatus.BAD_REQUEST);
				}

				return new ResponseEntity<Map>(resp, HttpStatus.OK);
			}

		}
		catch ( Exception e )
		{
			e.printStackTrace();
		}

		return response;
	}

	@SuppressWarnings({ "deprecation", "unchecked" })
	public static Map<String, String> getAccesToken(WebServiceConnectionMaster webService)
	{

		String tokenLocation = null;
		String clientidentifier = null;
		String redirectUrl = null;
		String clientScret = null;
		HttpResponse httpResponse = null;
		String accessToken = null;
		String grantType = null;
		String refreshToken = null;
		String scope = null;
		String state = null;
		OAuth2 oauth2 = new OAuth2();
		Map<String, String> map = new HashMap<String, String>();
		org.apache.http.impl.client.DefaultHttpClient client = null;
		try
		{

			if( webService != null )
			{
				client = new org.apache.http.impl.client.DefaultHttpClient();
				if( webService.getWebServiceTemplateMaster().isBaseUrlRequired() )
				{
					tokenLocation = webService.getWebServiceTemplateMaster().getBaseUrl() + webService.getWebServiceTemplateMaster().getoAuth2().getAccessTokenUrl().trim();
				}
				else
				{
					tokenLocation = webService.getWebServiceTemplateMaster().getoAuth2().getAccessTokenUrl().trim();
				}
				clientidentifier = webService.getWebServiceTemplateMaster().getoAuth2().getClientIdentifier().trim();
				redirectUrl = webService.getWebServiceTemplateMaster().getoAuth2().getRedirectUrl().trim();
				clientScret = webService.getWebServiceTemplateMaster().getoAuth2().getClientSecret().trim();
				grantType = webService.getWebServiceTemplateMaster().getoAuth2().getGrantType().trim();
				scope = webService.getWebServiceTemplateMaster().getoAuth2().getScope().trim();
				state = webService.getWebServiceTemplateMaster().getoAuth2().getState().trim();
				
				HttpPost post = new HttpPost(tokenLocation);

				List<BasicNameValuePair> parametersBody = new ArrayList<BasicNameValuePair>();

				parametersBody.add(new BasicNameValuePair(OAuthConstants.GRANT_TYPE, grantType));

				parametersBody.add(new BasicNameValuePair(OAuthConstants.CODE, webService.getWebServiceTemplateMaster().getoAuth2().getAuthCodeValue()));

				parametersBody.add(new BasicNameValuePair(OAuthConstants.CLIENT_ID, clientidentifier));

				parametersBody.add(new BasicNameValuePair(OAuthConstants.CLIENT_SECRET, clientScret));

				parametersBody.add(new BasicNameValuePair(OAuthConstants.REDIRECT_URI, redirectUrl));
				
				if(StringUtils.isNotBlank(scope))
				{
					parametersBody.add(new BasicNameValuePair(OAuthConstants.SCOPE, scope));
				}
				if(StringUtils.isNotBlank(state) )
				{
					parametersBody.add(new BasicNameValuePair(OAuthConstants.STATE, state));
				}
				post.setEntity(new UrlEncodedFormEntity(parametersBody, HTTP.UTF_8));

				httpResponse = client.execute(post);

				int statusCode = httpResponse.getStatusLine().getStatusCode();

				map = handleResponse(httpResponse);

				if( statusCode == 200 )
				{
					accessToken = map.get(OAuthConstants.ACCESS_TOKEN);
					refreshToken = map.get(OAuthConstants.REFRESH_TOKEN);
					oauth2.setAccessTokenValue(accessToken);
					oauth2.setRefreshTokenValue(refreshToken);
				}

			}

		}
		catch ( UnsupportedEncodingException e )
		{
			e.printStackTrace();
			throw new RuntimeException(e.getMessage());
		}
		catch ( IOException e )
		{
			e.printStackTrace();
			throw new RuntimeException(e.getMessage());
		}
		catch ( Exception e )
		{
			e.printStackTrace();
			throw new RuntimeException(e.getMessage());
		}
		finally
		{
			if( client != null )
			{
				client.close();
			}
		}

		return map;
	}

	public static void main(String[] args)
	{
		WebServiceConnectionMaster webService = new WebServiceConnectionMaster();
		WebServiceTemplateMaster webServiceTemplateMaster = new WebServiceTemplateMaster();
		OAuth2 oAuth2 = new OAuth2();
		webService.setWebServiceTemplateMaster(webServiceTemplateMaster);
		webServiceTemplateMaster.setBaseUrlRequired(false);
		webServiceTemplateMaster.setoAuth2(oAuth2);
		oAuth2.setAccessTokenUrl("https://accounts.google.com/o/oauth2/token");
		oAuth2.setClientIdentifier("1008728103824-u7ldbehfe9ls12bej6u5ktcj1qebd4k2.apps.googleusercontent.com");
		oAuth2.setClientSecret("u3TK-wPSS_aBL1SI2160wFfK");
		oAuth2.setRedirectUrl("https://schedulerv3.anvizent.com/minidw/adt/package/webServiceConnection/webServiceOAuth2Authenticationcallback");
		oAuth2.setGrantType("authorization_code");
		oAuth2.setAuthCodeValue("4/AABwtmxeMUH2gIvabslGmpUAMXDezAmzJwZ1o5BJuMNqE93SLI-V5qHYD40zLSjcnXkgYua0wuI-pGSQS-B5bZE");
		System.out.println(getAccesToken(webService));

	}

	@SuppressWarnings({ "deprecation", "unchecked" })
	public static Map<String, String> getAccesTokenWithRefreshToken(WebServiceConnectionMaster webService)
	{

		String tokenLocation = null;
		String clientidentifier = null;
		String clientScret = null;
		HttpResponse httpResponse = null;
		String accessToken = null;
		String refreshToken = null;
		OAuth2 oauth2 = new OAuth2();
		Map<String, String> map = new HashMap<String, String>();
		org.apache.http.impl.client.DefaultHttpClient client = null;
		try
		{
			if( webService != null )
			{

				client = new org.apache.http.impl.client.DefaultHttpClient();

				if( webService.getWebServiceTemplateMaster().isBaseUrlRequired() )
				{
					tokenLocation = webService.getWebServiceTemplateMaster().getBaseUrl() + webService.getWebServiceTemplateMaster().getoAuth2().getAccessTokenUrl().trim();
				}
				else
				{
					tokenLocation = webService.getWebServiceTemplateMaster().getoAuth2().getAccessTokenUrl().trim();
				}

				clientidentifier = webService.getWebServiceTemplateMaster().getoAuth2().getClientIdentifier().trim();
				clientScret = webService.getWebServiceTemplateMaster().getoAuth2().getClientSecret().trim();
				refreshToken = webService.getAuthenticationRefreshToken();

				if( !isValid(refreshToken) )
				{
					throw new RuntimeException("Please provide valid refresh token.");
				}
				if( !isValid(tokenLocation) )
				{
					throw new RuntimeException("Please provide valid token location.");
				}

				HttpPost post = new HttpPost(tokenLocation);

				List<BasicNameValuePair> parametersBody = new ArrayList<BasicNameValuePair>();

				parametersBody.add(new BasicNameValuePair(OAuthConstants.GRANT_TYPE, OAuthConstants.REFRESH_TOKEN));

				parametersBody.add(new BasicNameValuePair(OAuthConstants.REFRESH_TOKEN, refreshToken));

				if( isValid(clientidentifier) )
				{
					parametersBody.add(new BasicNameValuePair(OAuthConstants.CLIENT_ID, clientidentifier));
				}

				if( isValid(clientScret) )
				{
					parametersBody.add(new BasicNameValuePair(OAuthConstants.CLIENT_SECRET, clientScret));
				}

				post.setEntity(new UrlEncodedFormEntity(parametersBody, HTTP.UTF_8));
				httpResponse = client.execute(post);
				int code = httpResponse.getStatusLine().getStatusCode();
				map = handleResponse(httpResponse);
				if( code == 200 )
				{
					accessToken = map.get(OAuthConstants.ACCESS_TOKEN);
					refreshToken = map.get(OAuthConstants.REFRESH_TOKEN);
					oauth2.setAccessTokenValue(accessToken);
					oauth2.setRefreshTokenValue(refreshToken);
				}

			}
		}
		catch ( ClientProtocolException e )
		{
			e.printStackTrace();
			throw new RuntimeException(e.getMessage());
		}
		catch ( IOException e )
		{
			e.printStackTrace();
			throw new RuntimeException(e.getMessage());
		}
		finally
		{
			if( client != null )
			{
				client.close();
			}
		}
		return map;
	}

	public static boolean isValid(String str)
	{
		return (str != null && str.trim().length() > 0);
	}

	@SuppressWarnings("rawtypes")
	public static Map handleResponse(HttpResponse response)
	{
		String contentType = OAuthConstants.JSON_CONTENT;
		if( response.getEntity().getContentType() != null )
		{
			contentType = response.getEntity().getContentType().getValue();
		}
		if( contentType.contains(OAuthConstants.JSON_CONTENT) )
		{
			return handleJsonResponse(response);
		}
		else if( contentType.contains(OAuthConstants.XML_CONTENT) )
		{
			return handleXMLResponse(response);
		}
		else
		{
			throw new RuntimeException("Cannot handle " + contentType + " content type. Supported content types include JSON, XML and URLEncoded");
		}

	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public static Map handleJsonResponse(HttpResponse response)
	{
		Map<String, String> oauthLoginResponse = null;

		try
		{
			oauthLoginResponse = (Map<String, String>) new JSONParser().parse(EntityUtils.toString(response.getEntity()));
		}
		catch ( ParseException e )
		{
			e.printStackTrace();
			throw new RuntimeException(e.getMessage());
		}
		catch ( IOException e )
		{
			e.printStackTrace();
			throw new RuntimeException(e.getMessage());
		}
		catch ( Exception e )
		{
			throw new RuntimeException(e.getMessage());
		}
		LOG.debug("********** Response Received **********");
		for (Map.Entry<String, String> entry : oauthLoginResponse.entrySet())
		{
			LOG.debug(String.format("  %s = %s", entry.getKey(), entry.getValue()));
		}
		return oauthLoginResponse;
	}

	@SuppressWarnings("rawtypes")
	public static Map handleXMLResponse(HttpResponse response)
	{
		Map<String, String> oauthResponse = new HashMap<String, String>();
		try
		{

			String xmlString = EntityUtils.toString(response.getEntity());
			DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
			factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
			DocumentBuilder db = factory.newDocumentBuilder();
			InputSource inStream = new InputSource();
			inStream.setCharacterStream(new StringReader(xmlString));
			Document doc = db.parse(inStream);

			LOG.debug("********** Response Receieved **********");
			parseXMLDoc(null, doc, oauthResponse);
		}
		catch ( Exception e )
		{
			e.printStackTrace();
			throw new RuntimeException("Exception occurred while parsing XML response");
		}
		return oauthResponse;
	}

	public static void parseXMLDoc(Element element, Document doc, Map<String, String> oauthResponse)
	{
		NodeList child = null;
		if( element == null )
		{
			child = doc.getChildNodes();

		}
		else
		{
			child = element.getChildNodes();
		}
		for (int j = 0; j < child.getLength(); j++)
		{
			if( child.item(j).getNodeType() == org.w3c.dom.Node.ELEMENT_NODE )
			{
				org.w3c.dom.Element childElement = (org.w3c.dom.Element) child.item(j);
				if( childElement.hasChildNodes() )
				{
					LOG.debug(childElement.getTagName() + " : " + childElement.getTextContent());
					oauthResponse.put(childElement.getTagName(), childElement.getTextContent());
					parseXMLDoc(childElement, null, oauthResponse);
				}

			}
		}
	}

	public static List<LinkedHashMap<String, Object>> validateWebService(WebServiceApi webServiceApi, RestTemplate restTemplate,Map<String, Object> clientDbDetails) throws JSONException, Exception
	{
		return validateWebService(webServiceApi, restTemplate, null,  clientDbDetails);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static List<LinkedHashMap<String, Object>> validateWebService(WebServiceApi webServiceApi, RestTemplate restTemplate, String filePath,Map<String, Object> clientDbDetails) throws JSONException, Exception
	{
		ResponseEntity authenticationResponse = null;

		List<LinkedHashMap<String, Object>> formattedApiResponse = null;
		Map<String, List<Object>> pathParamSubUrlDetails = new HashMap<>();

		 if(webServiceApi.getWebServiceConnectionMaster().getWebServiceTemplateMaster().getWebserviceType().endsWith("SOAP")) {
	        	authenticationResponse = testAuthenticationUrl(restTemplate , webServiceApi.getWebServiceConnectionMaster());
	        }else {
	        	authenticationResponse = testAuthenticationUrl(webServiceApi.getWebServiceConnectionMaster(), restTemplate);
	        }
	      	String requiredRequestParamsPairs = "";
		   String requiredRequestHeaderValue = "";
		if( authenticationResponse.getStatusCode().equals(HttpStatus.OK) || authenticationResponse.getStatusCode().equals(HttpStatus.NO_CONTENT) )
		{
			Map autheticateParams = null;
			if( authenticationResponse.getBody() != null && authenticationResponse.getBody() instanceof Map )
			{
				autheticateParams = (Map) authenticationResponse.getBody();
			}
			Long authenticationType = webServiceApi.getWebServiceConnectionMaster().getWebServiceTemplateMaster().getWebServiceAuthenticationTypes().getId();
			String timeZone = webServiceApi.getWebServiceConnectionMaster().getWebServiceTemplateMaster().getTimeZone();
			String dateFormat = webServiceApi.getWebServiceConnectionMaster().getWebServiceTemplateMaster().getDateFormat();
			HttpHeaders headers = new HttpHeaders();
			headers.add("Content-Type", "application/json");
			headers.add("Accept", "application/json");

			Set<Entry<String, List<String>>> headersSet = authenticationResponse.getHeaders().entrySet();
			Iterator<Entry<String, List<String>>> iterator = headersSet.iterator();

			while (iterator.hasNext())
			{

				Entry<String, List<String>> key = iterator.next();

				if( key.getKey().equals("Set-Cookie") )
				{
					for (String cookie : key.getValue())
					{
						headers.add("Cookie", cookie);
					}
				}

			}
			// add api authentication body parameters here
			JSONObject postBodyObject = new JSONObject();
			if( authenticationType != 1 )
			{

				String requiredRequestParams = "";
				requiredRequestParams = webServiceApi.getWebServiceConnectionMaster().getWebServiceTemplateMaster().getApiAuthRequestParams();
				if( StringUtils.isNotBlank(requiredRequestParams) && autheticateParams != null )
				{
					JSONObject requiredRequestParamsJObj = new JSONObject(requiredRequestParams);
					Iterator<String> requiredRequestParamsJObjInterator = (Iterator<String>) requiredRequestParamsJObj.keySet().iterator();
					while (requiredRequestParamsJObjInterator.hasNext())
					{
						String paramKey = requiredRequestParamsJObjInterator.next();
						String paramValue = requiredRequestParamsJObj.getString(paramKey);
						ArrayList<String> autheticateParamVariables = getParameterVariables(paramValue, "{$");

						for (String variable : autheticateParamVariables)
						{
							if( autheticateParams.get(variable) != null )
							{
								paramValue = StringUtils.replace(paramValue, "{$" + variable + "}", autheticateParams.get(variable).toString());
							}
							else
							{

								throw new ClientWebserviceRequestException("required parameters not found in authentication response");
							}
						}
						postBodyObject.put(paramKey, paramKey);
					}
				}
				String requiredBodyParams = "";
				requiredBodyParams = webServiceApi.getWebServiceConnectionMaster().getWebServiceTemplateMaster().getApiAuthBodyParams();
				if( StringUtils.isNotBlank(requiredBodyParams) && requiredBodyParams != null && autheticateParams != null )
				{
					JSONObject requiredBodyParamsJObj = new JSONObject(requiredBodyParams);
					Iterator<String> requiredBodyParamsJObjInterator = (Iterator<String>) requiredBodyParamsJObj.keySet().iterator();
					while (requiredBodyParamsJObjInterator.hasNext())
					{
						String paramKey = requiredBodyParamsJObjInterator.next();
						String paramValue = requiredBodyParamsJObj.getString(paramKey);
						ArrayList<String> autheticateBodyParamVariables = getParameterVariables(paramValue, "{$");

						for (String variable : autheticateBodyParamVariables)
						{
							if( autheticateParams.get(variable) != null )
							{
								paramValue = StringUtils.replace(paramValue, "{$" + variable + "}", autheticateParams.get(variable).toString());
							}
							else
							{
								throw new ClientWebserviceRequestException("required parameters not found in authentication response");
							}
						}
						postBodyObject.put(paramKey, paramValue);
					}
				}

				String requiredRequestHeaders = webServiceApi.getWebServiceConnectionMaster().getWebServiceTemplateMaster().getApiAuthRequestHeaders();

				if( requiredRequestHeaders != null && autheticateParams != null )
				{

					ArrayList<String> autheticateParamVariables = getParameterVariables(requiredRequestHeaders, "{$");
					for (String variable : autheticateParamVariables)
					{
						if( autheticateParams.get(variable) != null )
						{
							requiredRequestHeaders = StringUtils.replace(requiredRequestHeaders, "{$" + variable + "}", autheticateParams.get(variable).toString());
						}
						else
						{
							throw new ClientWebserviceRequestException("required header parameters not found in authentication response");
						}
					}

					ArrayList<String> autheticateHeaderVariables = getParameterVariables(requiredRequestHeaders, "{#");

					if( autheticateHeaderVariables.size() > 0 )
					{
						String headerKeyvalues = webServiceApi.getWebServiceConnectionMaster().getHeaderKeyvalues();
						if( headerKeyvalues != null )
						{
							JSONObject headerKeyvaluesObj = new JSONObject(headerKeyvalues);
							for (String variable : autheticateHeaderVariables)
							{
								if( headerKeyvaluesObj.get(variable) != null )
								{
									requiredRequestHeaders = StringUtils.replace(requiredRequestHeaders, "{#" + variable + "}", headerKeyvaluesObj.get(variable).toString());
								}
								else
								{
									throw new ClientWebserviceRequestException("required header parameters not found in authentication response");
								}
							}
						}
						else
						{
							throw new ClientWebserviceRequestException("required header parameters not found in authentication response");
						}
					}

					requiredRequestHeaderValue = requiredRequestHeaders;

					String[] rHeaders = StringUtils.split(requiredRequestHeaderValue, ";");

					for (String hdr : rHeaders)
					{
						String[] eachHeader = StringUtils.split(hdr, ":");
						headers.add(eachHeader[0], eachHeader[1]);
					}

				}

				if( authenticationType == 3 )
				{
					if( autheticateParams.get("Authorization") != null )
					{
						headers.add("Authorization", autheticateParams.get("Authorization").toString());
					}
					else
					{
						throw new ClientWebserviceRequestException("Basic authentication failed");
					}

				}

				String pathParams = "";
				pathParams = webServiceApi.getApiPathParams();
				// JSONObject subUrlPostBodyObject = new JSONObject();
				if( StringUtils.isNotBlank(pathParams) )
				{
					JSONObject pathParamsJObj = new JSONObject(pathParams);
					String apiUrl = webServiceApi.getApiUrl();
					ArrayList<String> pathParamVariables = getParameterVariables(apiUrl, "{#");
					for (String paramKey : pathParamVariables)
					{
						JSONObject paramValueObj = pathParamsJObj.getJSONObject(paramKey);

						if( paramValueObj != null )
						{
							if( paramValueObj.get("valueType").equals("M") )
							{
								apiUrl = StringUtils.replace(apiUrl, "{#" + paramKey + "}", paramValueObj.get("manualParamValue").toString());
							}
							else if( paramValueObj.get("valueType").equals("S") )
							{
								String subUrldetailsurl = null;
								boolean baseUrlRequired = (boolean) paramValueObj.get("baseUrlRequired");
								if( baseUrlRequired )
								{
									subUrldetailsurl = webServiceApi.getWebServiceConnectionMaster().getWebServiceTemplateMaster().getBaseUrl() + paramValueObj.get("subUrldetailsurl").toString();
								}
								else
								{
									subUrldetailsurl = paramValueObj.get("subUrldetailsurl").toString();
								}
								String subUrldetailsmethodType = paramValueObj.get("subUrldetailsmethodType").toString();
								String subUrldetailsresponseObjName = paramValueObj.get("subUrldetailsresponseObjName").toString();
								boolean subUrlPaginationRequired = (boolean) paramValueObj.get("subUrlPaginationRequired");
								List<Object> dataList = new ArrayList<>();
								if( subUrlPaginationRequired )
								{
									String subUrlPaginationType = paramValueObj.get("subUrlPaginationType").toString();
									if( subUrlPaginationType.equals("offset") )
									{
										String paginationParamType = paramValueObj.getString("subUrlPaginationParamType");
										String offsetParamName = paramValueObj.getString("subUrlPaginationOffSetRequestParamName");
										String offsetParamValue = paramValueObj.getString("subUrlPaginationOffSetRequestParamValue");
										String limitParamName = paramValueObj.getString("subUrlPaginationLimitRequestParamName");
										String limitParamValue = paramValueObj.getString("subUrlPaginationLimitRequestParamValue");
										int limit = Integer.parseInt(limitParamValue);
										int offset = Integer.parseInt(offsetParamValue);

										if( paginationParamType.equals("Request Parameter") )
										{
											subUrldetailsurl += (subUrldetailsurl.contains("?") ? "&" : "?") + limitParamName + "=" + limit + "&" + offsetParamName + "=";
											boolean isResultSetCompleted = true;
											if( webServiceApi.getValidateOrPreview() )
											{
												getResponseObject(webServiceApi, subUrldetailsurl + offset, subUrldetailsmethodType, subUrldetailsresponseObjName, new JSONObject(), dataList, autheticateParams, null, headers, restTemplate);
											}
											else
											{
												while (isResultSetCompleted)
												{
													isResultSetCompleted = getResponseObject(webServiceApi, subUrldetailsurl + offset, subUrldetailsmethodType, subUrldetailsresponseObjName, new JSONObject(), dataList, autheticateParams, null, headers, restTemplate, limit);
													offset += limit;
												}
											}
										}
										else
										{
											// body parameter
											postBodyObject.put(offsetParamName, offset);
											postBodyObject.put(limitParamName, limit);

											boolean isResultSetCompleted = true;
											if( webServiceApi.getValidateOrPreview() )
											{
												getResponseObject(webServiceApi, subUrldetailsurl, subUrldetailsmethodType, subUrldetailsresponseObjName, postBodyObject, dataList, autheticateParams, null, headers, restTemplate);
											}
											else
											{
												while (isResultSetCompleted)
												{
													isResultSetCompleted = getResponseObject(webServiceApi, subUrldetailsurl, subUrldetailsmethodType, subUrldetailsresponseObjName, postBodyObject, dataList, autheticateParams, null, headers, restTemplate, limit);
													offset += limit;
												}
											}
										}

									}
									else if( subUrlPaginationType.equals("date") )
									{
										// date pagination
										String paginationParamType = paramValueObj.getString("subUrlPaginationParamType");
										String paginationStartDateParam = paramValueObj.getString("subUrlPaginationStartDateParam");
										String paginationEndDateParam = paramValueObj.getString("subUrlPaginationEndDateParam");
										String paginationStartDate = paramValueObj.getString("subUrlPaginationStartDate");
										int paginationDateRange = Integer.parseInt(paramValueObj.getString("subUrlPaginationDateRange"));

										if( paginationParamType.equals("Request Parameter") )
										{

											String startDate = convertDateFormat(dateFormat, paginationStartDate, timeZone);
											String paginationEndDate = getEndDateByInterval(startDate, dateFormat, paginationDateRange);
											subUrldetailsurl += (subUrldetailsurl.contains("?") ? "&" : "?") + paginationStartDateParam + "=" + startDate + "&" + paginationEndDateParam + "=";
											boolean isResultSetCompleted = true;
											if( webServiceApi.getValidateOrPreview() )
											{
												getResponseObject(webServiceApi, subUrldetailsurl + paginationEndDate, webServiceApi.getApiMethodType(), webServiceApi.getResponseObjectName(), postBodyObject, dataList, autheticateParams, null, headers, restTemplate);
											}
											else
											{
												while (isResultSetCompleted)
												{
													getResponseObject(webServiceApi, subUrldetailsurl + paginationEndDate, webServiceApi.getApiMethodType(), webServiceApi.getResponseObjectName(), postBodyObject, dataList, autheticateParams, null, headers, restTemplate);
													startDate = paginationEndDate;
													paginationEndDate = getEndDateByInterval(startDate, dateFormat, paginationDateRange);
												}
											}

										}
										else
										{
											// body parameter
											String startDate = convertDateFormat(dateFormat, paginationStartDate, timeZone);
											String paginationEndDate = getEndDateByInterval(startDate, dateFormat, paginationDateRange);
											postBodyObject.put(paginationStartDateParam, startDate);
											postBodyObject.put(paginationEndDateParam, paginationEndDate);

											boolean isResultSetCompleted = true;
											if( webServiceApi.getValidateOrPreview() )
											{
												getResponseObject(webServiceApi, subUrldetailsurl, webServiceApi.getApiMethodType(), webServiceApi.getResponseObjectName(), postBodyObject, dataList, autheticateParams, null, headers, restTemplate);
											}
											else
											{
												while (isResultSetCompleted)
												{
													isResultSetCompleted = getResponseObject(webServiceApi, subUrldetailsurl, webServiceApi.getApiMethodType(), webServiceApi.getResponseObjectName(), postBodyObject, dataList, autheticateParams, null, headers, restTemplate);
													startDate = paginationEndDate;
													paginationEndDate = getEndDateByInterval(startDate, dateFormat, paginationDateRange);

													postBodyObject.put(paginationStartDateParam, startDate);
													postBodyObject.put(paginationEndDateParam, paginationEndDate);

													String todayDate = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
													if( startDate.equals(convertDateFormat(dateFormat, todayDate, timeZone)) )
													{
														break;
													}
												}
											}
										}

									}
									else
									{

										boolean isResultSetCompleted = true;

										if( webServiceApi.getValidateOrPreview() )
										{
											getResponseObject(webServiceApi, subUrldetailsurl, webServiceApi.getApiMethodType(), webServiceApi.getResponseObjectName(), postBodyObject, dataList, autheticateParams, null, headers, restTemplate);
										}
										else
										{

											String paginationNextParam = paramValueObj.getString("subUrlPaginationHyperLinkPattern");

											int paginationLimit = -1;
											if( StringUtils.isNotBlank(paramValueObj.getString("subUrlPaginationHypermediaPageLimit")) )
											{
												paginationLimit = Integer.parseInt(paramValueObj.getString("subUrlPaginationHypermediaPageLimit"));
											}

											List<Object> nextPathList = new ArrayList<>();

											String nextUrlPath = subUrldetailsurl;

											do
											{

												isResultSetCompleted = getResponseObject(webServiceApi, nextUrlPath, webServiceApi.getApiMethodType(), webServiceApi.getResponseObjectName(), postBodyObject, dataList, autheticateParams, null, headers, restTemplate, paginationLimit,
														paginationNextParam, nextPathList);

												if( nextPathList.size() > 0 && (paginationLimit == -1 || (paginationLimit != -1 && !isResultSetCompleted)) )
												{

													Object nextUrlPathObject = nextPathList.get(0);
													if( nextUrlPathObject != null && nextUrlPathObject instanceof String && StringUtils.isNotBlank(nextUrlPathObject.toString()) )
													{
														nextUrlPath = nextUrlPathObject.toString();
													}
													else
													{
														nextUrlPath = null;
													}

													nextPathList.clear();
												}
												else
												{
													nextUrlPath = null;
												}
											}
											while (nextUrlPath != null);
										}

									}
								}
								else
								{
									getResponseObject(webServiceApi, subUrldetailsurl, subUrldetailsmethodType, subUrldetailsresponseObjName, new JSONObject(), dataList, autheticateParams, null, headers, restTemplate);
								}
								if( dataList != null && dataList.size() > 0 )
								{
									for (Object obj : dataList)
									{
										if( obj instanceof List || dataList.get(0) instanceof Map )
										{
											throw new ClientWebserviceRequestException("Sub url Response should not be List or Map");
										}
									}

									pathParamSubUrlDetails.put(paramKey, dataList);
								}

							}
							else
							{
								throw new ClientWebserviceRequestException("sub url Response type not found");
							}
						}
						else
						{
							throw new ClientWebserviceRequestException("Path Variable value not found");
						}

					}

					webServiceApi.setApiUrl(apiUrl);

				}
			}

			String apiUrl = null;
			if( webServiceApi.getBaseUrlRequired() )
			{
				apiUrl = webServiceApi.getWebServiceConnectionMaster().getWebServiceTemplateMaster().getBaseUrl() + webServiceApi.getApiUrl();
			}
			else
			{
				apiUrl = webServiceApi.getApiUrl();
			}

			if( requiredRequestParamsPairs.trim().length() > 0 )
			{
				apiUrl += (apiUrl.contains("?") ? "&" : "?") + requiredRequestParamsPairs;
			}
			// add api request parameters here
			if( StringUtils.isNotBlank(webServiceApi.getApiRequestParams()) && StringUtils.startsWith(webServiceApi.getApiRequestParams(), "[") )
			{
				JSONArray paramters = new JSONArray(webServiceApi.getApiRequestParams());
				for (int i = 0; i < paramters.length(); i++)
				{
					JSONObject paramObject = paramters.getJSONObject(i);
					if( !paramObject.isNull("paramName") )
					{
						String paramName = paramObject.getString("paramName");
						String paramValue = paramObject.getString("paramValue");

						apiUrl += (apiUrl.contains("?") ? "&" : "?") + paramName + "=" + paramValue;
					}
				}
			}
			// add api body parameters here
			if( StringUtils.isNotBlank(webServiceApi.getApiBodyParams()) && StringUtils.startsWith(webServiceApi.getApiBodyParams(), "[") )
			{
				JSONArray paramters = new JSONArray(webServiceApi.getApiBodyParams());
				for (int i = 0; i < paramters.length(); i++)
				{
					JSONObject paramObject = paramters.getJSONObject(i);
					if( !paramObject.isNull("paramName") )
					{
						String paramName = paramObject.getString("paramName");
						String paramValue = paramObject.getString("paramValue");
						postBodyObject.put(paramName, paramValue);
					}
				}
			}

			if( webServiceApi.getIncrementalUpdate() && StringUtils.isNotBlank(webServiceApi.getIncrementalUpdateparamdata()) && StringUtils.startsWith(webServiceApi.getIncrementalUpdateparamdata(), "[") )
			{

				String incrementalDate = webServiceApi.getInclUpdateDate();

				if( webServiceApi.getValidateOrPreview() )
				{
					incrementalDate = "1970-01-01 00:00:00 UTC";
				}

				if( StringUtils.isNotBlank(incrementalDate) )
				{

					if( StringUtils.isNotBlank(timeZone) )
					{
						SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss z");
						Date inclDateObj = null;
						try
						{
							inclDateObj = sdf.parse(incrementalDate);
						}
						catch ( ParseException e )
						{
							LOG.error("Unable to parse date " + incrementalDate + " for webservice incremental update ");
						}
						if( dateFormat.equals("epoch") )
						{
							incrementalDate = inclDateObj.getTime() + "";
						}
						else
						{
							SimpleDateFormat clientDateFormat = new SimpleDateFormat(dateFormat);
							clientDateFormat.setTimeZone(TimeZone.getTimeZone(timeZone));
							incrementalDate = clientDateFormat.format(inclDateObj);
						}
					}
				}

				JSONArray paramters = new JSONArray(webServiceApi.getIncrementalUpdateparamdata());

				for (int i = 0; i < paramters.length(); i++)
				{
					JSONObject paramObject = paramters.getJSONObject(i);
					if( !paramObject.isNull("incrementalUpdateParamName") )
					{
						String paramName = paramObject.getString("incrementalUpdateParamName");
						String paramValue = paramObject.getString("incrementalUpdateParamvalue");
						String paramType = paramObject.getString("incrementalUpdateParamType");

						if( StringUtils.contains(paramValue, "/*") && StringUtils.contains(paramValue, "*/") )
						{

							if( StringUtils.isNotBlank(incrementalDate) )
							{
								if( StringUtils.contains(paramValue, "{date}") )
								{
									paramValue = StringUtils.replace(paramValue, "{date}", incrementalDate);

									int startingIndex = StringUtils.indexOf(paramValue, "/*");
									int endingIndex = StringUtils.indexOf(paramValue, "*/", startingIndex);

									String newParamValue = "";
									newParamValue += StringUtils.substring(paramValue, 0, startingIndex);
									newParamValue += StringUtils.substring(paramValue, startingIndex + 2, endingIndex);
									newParamValue += StringUtils.substring(paramValue, endingIndex + 2, paramValue.length());
									paramValue = newParamValue;
								}
								else
								{
									throw new ClientWebserviceRequestException("Param value does not have date placeholder");
								}
							}
							else
							{
								int startingIndex = StringUtils.indexOf(paramValue, "/*");
								int endingIndex = StringUtils.indexOf(paramValue, "*/", startingIndex);
								String newParamValue = "";
								newParamValue += StringUtils.substring(paramValue, 0, startingIndex);
								newParamValue += StringUtils.substring(paramValue, endingIndex + 2, paramValue.length());
								paramValue = newParamValue;
							}

						}
						else
						{
							throw new ClientWebserviceRequestException(" Incremental update /*{date}*/ placeholder was not found");
						}

						if( StringUtils.isNotBlank(incrementalDate) )
						{
							if( paramType.equalsIgnoreCase("Request Parameter") )
							{
								apiUrl += (apiUrl.contains("?") ? "&" : "?") + paramName + "=" + paramValue;
							}
							else
							{
								postBodyObject.put(paramName, paramValue);
							}
						}
					}
				}
			}

			List<Object> dataList = null;
			List<String> apiUrls = new ArrayList<>();
			ArrayList<String> pathParamVariables = getParameterVariables(apiUrl, "{#");

			if( pathParamVariables.size() > 0 )
			{
				if( pathParamVariables.size() == 1 )
				{

					if( pathParamSubUrlDetails.size() == 1 )
					{
						String key = pathParamVariables.get(0);
						List<Object> values = pathParamSubUrlDetails.get(key);

						for (Object val : values)
						{
							String valWithType = "";
							if( val instanceof Integer )
							{
								valWithType = (Integer) val + "";
							}
							else if( val instanceof String )
							{
								valWithType = (String) val;
							}
							else if( val instanceof Long )
							{
								valWithType = (Long) val + "";
							}
							apiUrls.add(StringUtils.replace(apiUrl, "{#" + key + "}", valWithType));
						}
					}
					else
					{
						throw new ClientWebserviceRequestException("Sub url response is empty");
					}

				}
				else
				{
					throw new ClientWebserviceRequestException("Only one Sub url per Api is allowed");
				}
			}
			else
			{
				apiUrls.add(apiUrl);
			}
			dataList = new ArrayList<>();
			try
			{
				for (String url : apiUrls)
				{
					if(webServiceApi.getWebServiceConnectionMaster().getWebServiceTemplateMaster().getWebserviceType().equals("SOAP")) {
						
					    String soapBodyElement = webServiceApi.getSoapBodyElement();
						String soapBodyParams = webServiceApi.getWebServiceConnectionMaster().getBodyParams();
						if (soapBodyParams != null) {
							JSONObject soapBodyParamsJsonObj = new JSONObject(soapBodyParams);
							Iterator<String> keys = soapBodyParamsJsonObj.keys();
							while (keys.hasNext()) {
								String key = keys.next();
								soapBodyElement = StringUtils.replace(soapBodyElement, "{$" + key + "}",
										soapBodyParamsJsonObj.getString(key));
							}
						}
						
						
						webServiceApi.setSoapBodyElement(soapBodyElement);
						headers = new HttpHeaders();
						headers.add("Content-Type", "text/plain");
						headers.add("SOAPAction", "search");
		
				
				
				if (webServiceApi.getPaginationRequired()
						&& StringUtils.isNotBlank(webServiceApi.getPaginationRequestParamsData())
						&& StringUtils.startsWith(webServiceApi.getPaginationRequestParamsData(), "[")) {
					
					String searchId = null;
					JSONArray paramters = new JSONArray(webServiceApi.getPaginationRequestParamsData());
					for (int i = 0; i < paramters.length(); i++) {
						JSONObject paramObject = paramters.getJSONObject(i);
						String offsetParamName = paramObject.getString("paginationOffSetRequestParamName");
						String offsetParamValue = paramObject.getString("paginationOffSetRequestParamValue");
						String limitParamName = paramObject.getString("paginationLimitRequestParamName");
						String limitParamValue = paramObject.getString("paginationLimitRequestParamValue");
						String paginationParamType = paramObject.getString("paginationParamType");
						String paginationObjectName = paramObject.getString("paginationObjectName");
						String paginationSearchId = paramObject.getString("paginationSearchId");
						String paginationSoapBody = paramObject.getString("PaginationSoapBody");
						
						int limit = Integer.parseInt(limitParamValue);
						int offset = Integer.parseInt(offsetParamValue);
						
						  if (paginationSoapBody != null) {
								JSONObject soapBodyParamsJsonObj = new JSONObject(soapBodyParams);
								Iterator<String> keys = soapBodyParamsJsonObj.keys();
								while (keys.hasNext()) {
									String key = keys.next();
									paginationSoapBody = StringUtils.replace(paginationSoapBody, "{$" + key + "}",
											soapBodyParamsJsonObj.getString(key));
								}
						}
						
						if (paginationParamType.equals("Request Parameter")) {
							url += (url.contains("?") ? "&" : "?") + limitParamName + "=" + limit + "&"
									+ offsetParamName + "=";
							boolean isResultSetCompleted = true;
											
						 
							if (webServiceApi.getValidateOrPreview()) {
								getResponseObject(webServiceApi, url + offset, webServiceApi.getApiMethodType(),
										webServiceApi.getResponseObjectName(), postBodyObject, dataList,
										autheticateParams, null, headers, restTemplate);
							} else {
								while (isResultSetCompleted) {
									
									isResultSetCompleted = getResponseObject(webServiceApi, url + offset,
											webServiceApi.getApiMethodType(),
											webServiceApi.getResponseObjectName(), postBodyObject, dataList,
											autheticateParams, null, headers, restTemplate, limit);
								}
							}
						} else {
							// body parameter
							postBodyObject.put(offsetParamName, offset);
							postBodyObject.put(limitParamName, limit);

							boolean isResultSetCompleted = true;
							if (!webServiceApi.getValidateOrPreview()) {
								String soapBody = webServiceApi.getSoapBodyElement();
								soapBody = StringUtils.replace(soapBody,limitParamName,limitParamValue);
								webServiceApi.setSoapBodyElement(soapBody);
								getResponseObject(webServiceApi, url, webServiceApi.getApiMethodType(),
										paginationObjectName, postBodyObject, dataList,
										autheticateParams, null, headers, restTemplate);
								if (dataList != null) {
									LinkedHashMap<String , Object> searchIdMap =  (LinkedHashMap<String, Object>) dataList.get(0);
									Set<String> set = searchIdMap.keySet();
									for (String key : set) {
										searchId = (String) searchIdMap.get(key);
									}
								}
								dataList.clear();			
							}
							if (webServiceApi.getValidateOrPreview()) {
								String soapBody = webServiceApi.getSoapBodyElement();
								soapBody = StringUtils.replace(soapBody,limitParamName,limitParamValue);
								webServiceApi.setSoapBodyElement(soapBody);
								getResponseObject(webServiceApi, url, webServiceApi.getApiMethodType(),
										webServiceApi.getResponseObjectName(), postBodyObject, dataList,
										autheticateParams, null, headers, restTemplate);
							} else {
								while (isResultSetCompleted) {
									paginationSoapBody = StringUtils.replace(paginationSoapBody,offsetParamName,offsetParamValue);
									paginationSoapBody = StringUtils.replace(paginationSoapBody,paginationSearchId,searchId);
									webServiceApi.setSoapBodyElement(paginationSoapBody);
									headers = new HttpHeaders();
									headers.add("Content-Type", "text/plain");
									headers.add("SOAPAction", "searchMoreWithId");
									isResultSetCompleted = getResponseObject(webServiceApi, url,
											webServiceApi.getApiMethodType(),
											webServiceApi.getResponseObjectName(), postBodyObject, dataList,
											autheticateParams, null, headers, restTemplate);
									offset = offset+1;
									offsetParamValue = String.valueOf(offset);
									
									if( dataList.size() > 0)
									{
										Connection connection = null;
										try
										{
										connection = getStagingConnection(clientDbDetails);
										System.out.println("flatten Started \t\t\t\t\t\t" + new Date());
										formattedApiResponse = new ApiJsonFlatten(dataList).getFlattenJson();
										formattedApiResponse = getResultsFromApiResponse(formattedApiResponse);
										System.out.println("flatten Ended \t\t\t\t\t\t\t" + new Date());

										String tableName = webServiceApi.getTable().getTableName();
										
										if(tableName == null)
										{
											tableName = getTempTableName( formattedApiResponse , connection);
											webServiceApi.getTable().setTableName(tableName);
										}
										
										List<Column> columns = getTableStructure(tableName, connection);
										Table tempTable = getTempTableAndColumns(webServiceApi.getTable(), columns);
										
										List<String> alterTableColumns = alterTempTableForWs(formattedApiResponse, tempTable.getOriginalColumnNames(), tableName, connection);
										webServiceApi.getTable().setOriginalColumnNames(alterTableColumns);
										writeDataToTempTable(alterTableColumns, formattedApiResponse, tableName, connection);
										dataList.clear();
										}
										finally
										{
											closeConnection(connection);
										}
									}
									else
									{
										String tableName = webServiceApi.getTable().getTableName();
										if(tableName == null)
										{
											createTempTableUsingMappedHeaders(clientDbDetails , webServiceApi );
										}
									}
								}

							}
						}

					}
				
					
				}else {
					
					getResponseObject(webServiceApi, url, webServiceApi.getApiMethodType(),
							webServiceApi.getResponseObjectName(), postBodyObject, dataList, autheticateParams,
							null, headers, restTemplate);
							if( !webServiceApi.getValidateOrPreview() )
							{
								if( dataList.size() > 0 )
								{
									Connection connection = null;
									try
									{
									connection = getStagingConnection(clientDbDetails);
									System.out.println("flatten Started \t\t\t\t\t\t" + new Date());
									formattedApiResponse = new ApiJsonFlatten(dataList).getFlattenJson();
									formattedApiResponse = getResultsFromApiResponse(formattedApiResponse);
									System.out.println("flatten Ended \t\t\t\t\t\t\t" + new Date());

									String tableName = webServiceApi.getTable().getTableName();
									
									if(tableName == null)
									{
										tableName = getTempTableName( formattedApiResponse , connection);
										webServiceApi.getTable().setTableName(tableName);
									}
									
									List<Column> columns = getTableStructure(tableName, connection);
									Table tempTable = getTempTableAndColumns(webServiceApi.getTable(), columns);
									
									List<String> alterTableColumns = alterTempTableForWs(formattedApiResponse, tempTable.getOriginalColumnNames(), tableName, connection);
									webServiceApi.getTable().setOriginalColumnNames(alterTableColumns);
									writeDataToTempTable(alterTableColumns, formattedApiResponse, tableName, connection);
									dataList.clear();
									}
									finally
									{
										closeConnection(connection);
									}
								}
								else
								{
									String tableName = webServiceApi.getTable().getTableName();
									if(tableName == null)
									{
										createTempTableUsingMappedHeaders(clientDbDetails , webServiceApi );
									}
								}
							}
				}
				if (webServiceApi.getValidateOrPreview()) {
					break;
				}
				
			}else {

				if (webServiceApi.getPaginationRequired()
						&& StringUtils.isNotBlank(webServiceApi.getPaginationRequestParamsData())
						&& StringUtils.startsWith(webServiceApi.getPaginationRequestParamsData(), "[")) {
						// offset pagination
						if( webServiceApi.getPaginationType().equals("offset") )
						{
							JSONArray paramters = new JSONArray(webServiceApi.getPaginationRequestParamsData());
							for (int i = 0; i < paramters.length(); i++)
							{
								JSONObject paramObject = paramters.getJSONObject(i);
								String offsetParamName = paramObject.getString("paginationOffSetRequestParamName");
								String offsetParamValue = paramObject.getString("paginationOffSetRequestParamValue");
								String limitParamName = paramObject.getString("paginationLimitRequestParamName");
								String limitParamValue = paramObject.getString("paginationLimitRequestParamValue");
								String paginationParamType = paramObject.getString("paginationParamType");
								int limit = Integer.parseInt(limitParamValue);
								int offset = Integer.parseInt(offsetParamValue);
								if( paginationParamType.equals("Request Parameter") )
								{
									url += (url.contains("?") ? "&" : "?") + limitParamName + "=" + limit + "&" + offsetParamName + "=";
									boolean isResultSetCompleted = true;
									if( webServiceApi.getValidateOrPreview() )
									{
										getResponseObject(webServiceApi, url + offset, webServiceApi.getApiMethodType(), webServiceApi.getResponseObjectName(), postBodyObject, dataList, autheticateParams, null, headers, restTemplate);
									}
									else
									{
										while (isResultSetCompleted)
										{
											isResultSetCompleted = getResponseObject(webServiceApi, url + offset, webServiceApi.getApiMethodType(), webServiceApi.getResponseObjectName(), postBodyObject, dataList, autheticateParams, null, headers, restTemplate, limit);
											offset += limit;
									 

											if( dataList.size() > 0)
											{
												Connection connection = null;
												try
												{
												connection = getStagingConnection(clientDbDetails);
												System.out.println("flatten Started \t\t\t\t\t\t" + new Date());
												formattedApiResponse = new ApiJsonFlatten(dataList).getFlattenJson();
												formattedApiResponse = getResultsFromApiResponse(formattedApiResponse);
												System.out.println("flatten Ended \t\t\t\t\t\t\t" + new Date());

												String tableName = webServiceApi.getTable().getTableName();
												
												if(tableName == null)
												{
													tableName = getTempTableName( formattedApiResponse , connection);
													webServiceApi.getTable().setTableName(tableName);
												}
												
												List<Column> columns = getTableStructure(tableName, connection);
												Table tempTable = getTempTableAndColumns(webServiceApi.getTable(), columns);
												
												List<String> alterTableColumns = alterTempTableForWs(formattedApiResponse, tempTable.getOriginalColumnNames(), tableName, connection);
												webServiceApi.getTable().setOriginalColumnNames(alterTableColumns);
												writeDataToTempTable(alterTableColumns, formattedApiResponse, tableName, connection);
												dataList.clear();
												}
												finally
												{
													closeConnection(connection);
												}
											}
											else
											{ 
												String tableName = webServiceApi.getTable().getTableName();
												if(tableName == null)
												{
													createTempTableUsingMappedHeaders(clientDbDetails , webServiceApi );
												}
											}
										}
									}
								}
								else
								{
									// body parameter
									postBodyObject.put(offsetParamName, offset);
									postBodyObject.put(limitParamName, limit);

									boolean isResultSetCompleted = true;
									if( webServiceApi.getValidateOrPreview() )
									{
										getResponseObject(webServiceApi, url, webServiceApi.getApiMethodType(), webServiceApi.getResponseObjectName(), postBodyObject, dataList, autheticateParams, null, headers, restTemplate);
									}
									else
									{
										while (isResultSetCompleted)
										{
											isResultSetCompleted = getResponseObject(webServiceApi, url, webServiceApi.getApiMethodType(), webServiceApi.getResponseObjectName(), postBodyObject, dataList, autheticateParams, null, headers, restTemplate);
											offset += limit;
											
											if( dataList.size() > 0)
											{
												Connection connection = null;
												try
												{
												connection = getStagingConnection(clientDbDetails);
												System.out.println("flatten Started \t\t\t\t\t\t" + new Date());
												formattedApiResponse = new ApiJsonFlatten(dataList).getFlattenJson();
												formattedApiResponse = getResultsFromApiResponse(formattedApiResponse);
												System.out.println("flatten Ended \t\t\t\t\t\t\t" + new Date());

												String tableName = webServiceApi.getTable().getTableName();
												
												if(tableName == null)
												{
													tableName = getTempTableName( formattedApiResponse , connection);
													webServiceApi.getTable().setTableName(tableName);
												}
												
												List<Column> columns = getTableStructure(tableName, connection);
												Table tempTable = getTempTableAndColumns(webServiceApi.getTable(), columns);
												
												List<String> alterTableColumns = alterTempTableForWs(formattedApiResponse, tempTable.getOriginalColumnNames(), tableName, connection);
												webServiceApi.getTable().setOriginalColumnNames(alterTableColumns);
												writeDataToTempTable(alterTableColumns, formattedApiResponse, tableName, connection);
												dataList.clear();
												}
												finally
												{
													closeConnection(connection);
												}
											}
											else
											{ 
												String tableName = webServiceApi.getTable().getTableName();
												if(tableName == null)
												{
													createTempTableUsingMappedHeaders(clientDbDetails , webServiceApi );
												}
											}
										}

									}
								}

							}
						}
						else if( webServiceApi.getPaginationType().equals("date") )
						{
							// date pagination
							JSONArray paramters = new JSONArray(webServiceApi.getPaginationRequestParamsData());
							for (int i = 0; i < paramters.length(); i++)
							{
								JSONObject paramObject = paramters.getJSONObject(i);
								String paginationStartDateParam = paramObject.getString("paginationStartDateParam");
								String paginationEndDateParam = paramObject.getString("paginationEndDateParam");
								String paginationStartDate = paramObject.getString("paginationStartDate");
								int paginationDateRange = Integer.parseInt(paramObject.getString("paginationDateRange"));
								String paginationParamType = paramObject.getString("paginationParamType");

								if( paginationParamType.equals("Request Parameter") )
								{

									String startDate = convertDateFormat(dateFormat, paginationStartDate, timeZone);
									String paginationEndDate = getEndDateByInterval(startDate, dateFormat, paginationDateRange);
									url += (url.contains("?") ? "&" : "?") + paginationStartDateParam + "=%s" + "&" + paginationEndDateParam + "=%s";
									boolean isResultSetCompleted = true;
									if( webServiceApi.getValidateOrPreview() )
									{
										while (isResultSetCompleted)
										{
											getResponseObject(webServiceApi, String.format(url, startDate, paginationEndDate), webServiceApi.getApiMethodType(), webServiceApi.getResponseObjectName(), postBodyObject, dataList, autheticateParams, null, headers, restTemplate);
											startDate = paginationEndDate;
											paginationEndDate = getEndDateByInterval(startDate, dateFormat, paginationDateRange);
 
											String toDayDate = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
											if(compareDates(startDate,convertDateFormat(dateFormat, toDayDate, timeZone), dateFormat))
											{
												break;
											}
											else
											{
												if(dataList.size() > 0)
												{
													break;
												}
												else
												{
													isResultSetCompleted = true;	
												}
											}
										}
									}
									else
									{
										while (isResultSetCompleted)
										{
											getResponseObject(webServiceApi, String.format(url, startDate, paginationEndDate), webServiceApi.getApiMethodType(), webServiceApi.getResponseObjectName(), postBodyObject, dataList, autheticateParams, null, headers, restTemplate);
											startDate = paginationEndDate;
											paginationEndDate = getEndDateByInterval(startDate, dateFormat, paginationDateRange);

											if( dataList.size() > 0)
											{
												Connection connection = null;
												try
												{
												connection = getStagingConnection(clientDbDetails);
												System.out.println("flatten Started \t\t\t\t\t\t" + new Date());
												formattedApiResponse = new ApiJsonFlatten(dataList).getFlattenJson();
												formattedApiResponse = getResultsFromApiResponse(formattedApiResponse);
												System.out.println("flatten Ended \t\t\t\t\t\t\t" + new Date());

												String tableName = webServiceApi.getTable().getTableName();
												
												if(tableName == null)
												{
													tableName = getTempTableName( formattedApiResponse , connection);
													webServiceApi.getTable().setTableName(tableName);
												}
												
												List<Column> columns = getTableStructure(tableName, connection);
												Table tempTable = getTempTableAndColumns(webServiceApi.getTable(), columns);
												
												List<String> alterTableColumns = alterTempTableForWs(formattedApiResponse, tempTable.getOriginalColumnNames(), tableName, connection);
												webServiceApi.getTable().setOriginalColumnNames(alterTableColumns);
												writeDataToTempTable(alterTableColumns, formattedApiResponse, tableName, connection);
												dataList.clear();
												}
												finally
												{
													closeConnection(connection);
												}
											}
											else
											{ 
												String tableName = webServiceApi.getTable().getTableName();
												if(tableName == null)
												{
													createTempTableUsingMappedHeaders(clientDbDetails , webServiceApi );
												}
											}
											String toDayDate = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
											if(compareDates(startDate,convertDateFormat(dateFormat, toDayDate, timeZone), dateFormat))
											{
												String tableName = webServiceApi.getTable().getTableName();
												if(tableName == null)
												{
													createTempTableUsingMappedHeaders(clientDbDetails , webServiceApi );
												}
											}
											else
											{
												isResultSetCompleted = true;
											}

										}
									}

								}
								else
								{
									// body parameter
									String startDate = convertDateFormat(dateFormat, paginationStartDate, timeZone);
									String paginationEndDate = getEndDateByInterval(startDate, dateFormat, paginationDateRange);
									postBodyObject.put(paginationStartDateParam, startDate);
									postBodyObject.put(paginationEndDateParam, paginationEndDate);

									boolean isResultSetCompleted = true;
									if( webServiceApi.getValidateOrPreview() )
									{
										UUID uuid = UUID.randomUUID();
										LOG.info("Retrieval started for the Url : " + url + " with id: " + uuid);
										while (isResultSetCompleted)
										{
											LOG.info("Initiating call for uuid : " + uuid.toString() + " startDate -> " + startDate + " End date -> " + paginationEndDate + " Range -> " + paginationDateRange + " days");
											isResultSetCompleted = getResponseObject(webServiceApi, url, webServiceApi.getApiMethodType(), webServiceApi.getResponseObjectName(), postBodyObject, dataList, autheticateParams, null, headers, restTemplate);
											LOG.info("Completed call for uuid : " + uuid.toString() + " Records -> " + dataList.size());
											startDate = paginationEndDate;
											paginationEndDate = getEndDateByInterval(startDate, dateFormat, paginationDateRange);
  
											postBodyObject.put(paginationStartDateParam, startDate);
											postBodyObject.put(paginationEndDateParam, paginationEndDate);
											
											String toDayDate = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
											if(compareDates(startDate,convertDateFormat(dateFormat, toDayDate, timeZone), dateFormat))
											{
												break;
											}
											else
											{
												if(dataList.size() > 0)
												{
													break;
												}
												else
												{
													isResultSetCompleted = true;	
												}
											}
										}
									}
									else
									{
										UUID uuid = UUID.randomUUID();
										LOG.info("Retrieval started for the Url : " + url + " with id: " + uuid);
										while (isResultSetCompleted)
										{
											LOG.info("Initiating call for uuid : " + uuid.toString() + " startDate -> " + startDate + " End date -> " + paginationEndDate + " Range -> " + paginationDateRange + " days");
											isResultSetCompleted = getResponseObject(webServiceApi, url, webServiceApi.getApiMethodType(), webServiceApi.getResponseObjectName(), postBodyObject, dataList, autheticateParams, null, headers, restTemplate);
											LOG.info("Completed call for uuid : " + uuid.toString() + " Records -> " + dataList.size());
											startDate = paginationEndDate;
											paginationEndDate = getEndDateByInterval(startDate, dateFormat, paginationDateRange);

											/*
											 * updating body params with updated  dates
											 */
											postBodyObject.put(paginationStartDateParam, startDate);
											postBodyObject.put(paginationEndDateParam, paginationEndDate);


											if( dataList.size() > 0)
											{
												Connection connection = null;
												try
												{
												connection = getStagingConnection(clientDbDetails);
												System.out.println("flatten Started \t\t\t\t\t\t" + new Date());
												formattedApiResponse = new ApiJsonFlatten(dataList).getFlattenJson();
												formattedApiResponse = getResultsFromApiResponse(formattedApiResponse);
												System.out.println("flatten Ended \t\t\t\t\t\t\t" + new Date());

												String tableName = webServiceApi.getTable().getTableName();
												
												if(tableName == null)
												{
													tableName = getTempTableName( formattedApiResponse , connection);
													webServiceApi.getTable().setTableName(tableName);
												}
												
												List<Column> columns = getTableStructure(tableName, connection);
												Table tempTable = getTempTableAndColumns(webServiceApi.getTable(), columns);
												
												List<String> alterTableColumns = alterTempTableForWs(formattedApiResponse, tempTable.getOriginalColumnNames(), tableName, connection);
												webServiceApi.getTable().setOriginalColumnNames(alterTableColumns);
												writeDataToTempTable(alterTableColumns, formattedApiResponse, tableName, connection);
												dataList.clear();
												}
												finally
												{
													closeConnection(connection);
												}
											}
											else
											{ 
												String tableName = webServiceApi.getTable().getTableName();
												if(tableName == null)
												{
													createTempTableUsingMappedHeaders(clientDbDetails , webServiceApi );
												}
											}
											String toDayDate = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
											if(compareDates(startDate,convertDateFormat(dateFormat, toDayDate, timeZone), dateFormat))
											{
												String tableName = webServiceApi.getTable().getTableName();
												if(tableName == null)
												{
													createTempTableUsingMappedHeaders(clientDbDetails , webServiceApi );
												}
												break;
											}
											else
											{
												isResultSetCompleted = true;
											}
										}
									}
								}

							}
						}
						else
						{

							boolean isResultSetCompleted = true;

							if( webServiceApi.getValidateOrPreview() )
							{
								getResponseObject(webServiceApi, url, webServiceApi.getApiMethodType(), webServiceApi.getResponseObjectName(), postBodyObject, dataList, autheticateParams, null, headers, restTemplate);
							}
							else
							{

								JSONArray paramters = new JSONArray(webServiceApi.getPaginationRequestParamsData());
								JSONObject paramObject = paramters.getJSONObject(0);
								String paginationNextParam = paramObject.getString("paginationHyperLinkPattern");

								int paginationLimit = -1;
								if( StringUtils.isNotBlank(paramObject.getString("paginationHypermediaPageLimit")) )
								{
									paginationLimit = Integer.parseInt(paramObject.getString("paginationHypermediaPageLimit"));
								}

								List<Object> nextPathList = new ArrayList<>();

								String nextUrlPath = url;
								int nextCounter = 0;
								UUID uuid = UUID.randomUUID();
								do
								{

									isResultSetCompleted = getResponseObject(webServiceApi, nextUrlPath, webServiceApi.getApiMethodType(), webServiceApi.getResponseObjectName(), postBodyObject, dataList, autheticateParams, null, headers, restTemplate, paginationLimit, paginationNextParam,
											nextPathList);

									if( dataList.size() > 0)
									{
										Connection connection = null;
										try
										{
										connection = getStagingConnection(clientDbDetails);
										System.out.println("flatten Started \t\t\t\t\t\t" + new Date());
										formattedApiResponse = new ApiJsonFlatten(dataList).getFlattenJson();
										formattedApiResponse = getResultsFromApiResponse(formattedApiResponse);
										System.out.println("flatten Ended \t\t\t\t\t\t\t" + new Date());

										String tableName = webServiceApi.getTable().getTableName();
										
										if(tableName == null)
										{
											tableName = getTempTableName( formattedApiResponse , connection);
											webServiceApi.getTable().setTableName(tableName);
										}
										
										List<Column> columns = getTableStructure(tableName, connection);
										Table tempTable = getTempTableAndColumns(webServiceApi.getTable(), columns);
										
										List<String> alterTableColumns = alterTempTableForWs(formattedApiResponse, tempTable.getOriginalColumnNames(), tableName, connection);
										webServiceApi.getTable().setOriginalColumnNames(alterTableColumns);
										writeDataToTempTable(alterTableColumns, formattedApiResponse, tableName, connection);
										dataList.clear();
										}
										finally
										{
											closeConnection(connection);
										}
									}
									else
									{
										String tableName = webServiceApi.getTable().getTableName();
										if(tableName == null)
										{
											createTempTableUsingMappedHeaders(clientDbDetails , webServiceApi );
										}
									}
									LOG.info((++nextCounter) + "; WID:- " + uuid + "; Next URL" + nextPathList);
									if( nextPathList.size() > 0 && (paginationLimit == -1 || (paginationLimit != -1 && isResultSetCompleted)) )
									{

										Object nextUrlPathObject = nextPathList.get(0);
										if( nextUrlPathObject != null && nextUrlPathObject instanceof String && StringUtils.isNotBlank(nextUrlPathObject.toString()) )
										{
											nextUrlPath = nextUrlPathObject.toString();
											nextUrlPath = URLDecoder.decode(nextUrlPath, "UTF-8");
											LOG.info((nextCounter) + "; WID:- " + uuid + "; Next URL  After Decode " + nextUrlPath);
										}
										else
										{
											nextUrlPath = null;
										}

										nextPathList.clear();
									}
									else
									{
										nextUrlPath = null;
									}
								}
								while (nextUrlPath != null);
							}

						}
				    }
					else
					{

						getResponseObject(webServiceApi, url, webServiceApi.getApiMethodType(), webServiceApi.getResponseObjectName(), postBodyObject, dataList, autheticateParams, null, headers, restTemplate);
					
						if( !webServiceApi.getValidateOrPreview() )
						{
							if( dataList.size() > 0 )
							{
								Connection connection = null;
								try
								{
								connection = getStagingConnection(clientDbDetails);
								System.out.println("flatten Started \t\t\t\t\t\t" + new Date());
								formattedApiResponse = new ApiJsonFlatten(dataList).getFlattenJson();
								formattedApiResponse = getResultsFromApiResponse(formattedApiResponse);
								System.out.println("flatten Ended \t\t\t\t\t\t\t" + new Date());

								String tableName = webServiceApi.getTable().getTableName();
								
								if(tableName == null)
								{
									tableName = getTempTableName( formattedApiResponse , connection);
									webServiceApi.getTable().setTableName(tableName);
								}
								
								List<Column> columns = getTableStructure(tableName, connection);
								Table tempTable = getTempTableAndColumns(webServiceApi.getTable(), columns);
								
								List<String> alterTableColumns = alterTempTableForWs(formattedApiResponse, tempTable.getOriginalColumnNames(), tableName, connection);
								webServiceApi.getTable().setOriginalColumnNames(alterTableColumns);
								writeDataToTempTable(alterTableColumns, formattedApiResponse, tableName, connection);
								dataList.clear();
								}
								finally
								{
									closeConnection(connection);
								}
								}
								else
								{
									String tableName = webServiceApi.getTable().getTableName();
									if(tableName == null)
									{
										createTempTableUsingMappedHeaders(clientDbDetails , webServiceApi );
									}
								}
							}
					}
					if( webServiceApi.getValidateOrPreview() )
					{
						break;
					}
				}
				}
			}catch(Exception e)
			{
				throw new ClientWebserviceRequestException(e.getMessage());
			}

			if ( dataList.size() > 0 ) {
				System.out.println("flatten Started \t\t\t\t\t\t" + new Date());
				formattedApiResponse = new ApiJsonFlatten(dataList).getFlattenJson();
				System.out.println("flatten Ended \t\t\t\t\t\t\t" + new Date());
				formattedApiResponse = getResultsFromApiResponse(formattedApiResponse);
				System.out.println("date formatting Ended \t\t\t\t\t\t" + new Date());
			} 

		}
		else
		{
			throw new ClientWebserviceRequestException("Authentication failed");
		}

		return formattedApiResponse;
	}
	
  private static void createTempTableUsingMappedHeaders(Map<String, Object> clientDbDetails ,WebServiceApi webServiceApi ) throws Exception
	{

		Connection connection = null;
		try
		{
			connection = getStagingConnection(clientDbDetails);
			Set<String> tempMappingColumns = new HashSet<>();
			String[] map = StringUtils.split(webServiceApi.getMappedHeaders(), "||");
			for (int i = 0; i < map.length; i++)
			{
				String s = map[i];
				String[] iLApiHeaders = s.split("=");
				String apiHeader = iLApiHeaders[1];
				if( !apiHeader.contains("{") )
				{
					tempMappingColumns.add(apiHeader.trim());
				}
			}
			List<String> mappingColumnList = new ArrayList<String>(tempMappingColumns);
			String mappingTableName = WebServiceUtils.getMappingColumnTempTableName(mappingColumnList, connection);
			webServiceApi.getTable().setTableName(mappingTableName);
			webServiceApi.getTable().setOriginalColumnNames(mappingColumnList);
		}
		finally
		{
			closeConnection(connection);
		}
	
	}
	
	public static void writeDataToTempTable(List<String> headers, List<LinkedHashMap<String, Object>> flatJson, String tableName, Connection connection) throws SQLException
	{
		PreparedStatement preparedStatement = null;
		try
		{
			int size = flatJson.size();

			StringBuilder stringBuilder = new StringBuilder();
			StringJoiner headersData = new StringJoiner(",");
			StringJoiner headersPlaceHolders = new StringJoiner(",");
			stringBuilder.append(" SET NAMES utf8mb4; INSERT INTO " + tableName).append(" ( ");
			for (String header : headers)
			{
				headersData.add("`"+ header +"`" );
				headersPlaceHolders.add("?");
			}
			stringBuilder.append(headersData.toString()).append(" ) ").append(" VALUES ( ").append(headersPlaceHolders.toString()).append(" );");
			
			//System.out.println("insert dynamic query for web service --- >"+stringBuilder.toString());
			
			preparedStatement = connection.prepareStatement(stringBuilder.toString());
			int counter = 1;
			for (int i = 1; i < size; i++)
			{
				Map<String, Object> map = flatJson.get(i);
				int increment = 1;
				for (String header : headers)
				{
					String value = map.get(header) == null ? "" :  sanitizeCsvForWsTempTable(map.get(header).toString());
					preparedStatement.setObject(increment++, value);
				}
				preparedStatement.addBatch();
				increment = 1;
				if( i % 1000 == 0 )
				{
					preparedStatement.executeBatch();
					connection.commit();
					System.out.println("Batch " + (counter++) + " executed successfully.");
				}
			}
			// execute final batch
			preparedStatement.executeBatch();
			connection.commit();
			System.out.println("Batch " + (counter++) + " executed successfully.");
		}
		finally
		{
			if( preparedStatement != null )
			{
				preparedStatement.close();
			}
		}

	}
	
	static Connection getStagingConnection(Map<String,Object> clientDbDetails) throws SQLException, ClassNotFoundException
	{
			String host = (String) clientDbDetails.get("region_hostname");
			String port = (String) clientDbDetails.get("region_port");
			String schemaName = (String) clientDbDetails.get("clientdb_staging_schema");
			String user = (String) clientDbDetails.get("clientdb_username");
			String password = (String) clientDbDetails.get("clientdb_password");
			Class.forName(Constants.MYSQL_DRIVER_CLASS);
			return DriverManager.getConnection(Constants.MYSQL_DB_URL+host + ":" + port + "/" + schemaName+"?useUnicode=yes&characterEncoding=UTF-8&autoReconnect=true&relaxAutoCommit=true&allowMultiQueries=true",user,password);
		 
	}
	
	static void closeConnection(Connection connection)
	{
		if(connection != null)
		{
			try
			{
				connection.close();
			}
			catch ( SQLException e )
			{
				e.printStackTrace();
			}
		}
	}
	
	public static  String getTempTableName(List<LinkedHashMap<String, Object>> formattedApiResponse ,Connection connection) throws Exception
	{
        
		String tempTableName = null;
		ClientData clientData = new ClientData();
		List<String> headerColumnsFromWs =  collectHeaders(formattedApiResponse);
		Table tempTable =  tempTableForming(headerColumnsFromWs);
		tempTable.setOriginalColumnNames(headerColumnsFromWs);

		Package userPackage =  new Package();
		
		userPackage.setPackageName("Standard");
		userPackage.setPackageId(0);
		clientData.setUserPackage(userPackage);
		clientData.getUserPackage().setTable(tempTable);
		
		String query = createTargetTable(clientData, connection);
		
		if(query != null)
		{
			tempTableName = tempTable.getTableName();
			System.out.println("created temp table name --> "+tempTableName);
		}
		return tempTableName;
		
	}
	
	public static  String getMappingColumnTempTableName(List<String> headerColumnsFromWs ,Connection connection) throws Exception
	{
        
		String tempTableName = null;
		ClientData clientData = new ClientData();
		Table tempTable =  tempTableForming(headerColumnsFromWs);
		tempTable.setOriginalColumnNames(headerColumnsFromWs);

		Package userPackage =  new Package();
		
		userPackage.setPackageName("Standard");
		userPackage.setPackageId(0);
		clientData.setUserPackage(userPackage);
		clientData.getUserPackage().setTable(tempTable);
		
		String query = createTargetTable(clientData, connection);
		
		if(query != null)
		{
			tempTableName = tempTable.getTableName();
			System.out.println("created temp table name --> "+tempTableName);
		}
		return tempTableName;
		
	}
	
	public static Table getTempTableAndColumns(Table table,List<Column> columns)
	{
		List<String> originaCols = new ArrayList<String>();
		for (Column col : columns)
		{
			originaCols.add(col.getColumnName());
		}
		table.setOriginalColumnNames(originaCols);
		table.setColumns(columns);
		return table;
	}
	
	public static List<String> alterTempTableForWs(List<LinkedHashMap<String, Object>> flatJson, List<String> columnsList, String tableName, Connection connection) throws SQLException
	{
		PreparedStatement ps = null;
		Set<String> newAndExistingColumns = new HashSet<String>();
		List<String> finalNewColumns = new ArrayList<String>();
		try
		{
			List<String> headerColumnsFromWs =  collectHeaders(flatJson);
			newAndExistingColumns.addAll(columnsList);

			Collection<String> similar = new HashSet<String>(headerColumnsFromWs);
			Collection<String> newColumns = new HashSet<String>();
			newColumns.addAll(headerColumnsFromWs);
			newColumns.addAll(columnsList);
			similar.retainAll(columnsList);
			newColumns.removeAll(similar);
			newAndExistingColumns.addAll(newColumns);

			for (String columnName : newColumns)
			{
				if( !columnsList.contains(columnName) )
				{
					finalNewColumns.add(columnName);
				}
			}

			if( finalNewColumns.size() > 0 )
			{
				StringBuilder alterQuery = new StringBuilder();
				alterQuery.append("ALTER TABLE " + tableName);
				for (String alterColumn : finalNewColumns)
				{
					alterQuery.append(" ADD COLUMN " + alterColumn + " LONGTEXT ").append(",");
				}
				System.out.println("alter query -->"+removeLastChar(alterQuery.toString()) + ";");
				ps = connection.prepareStatement(removeLastChar(alterQuery.toString()) + ";");
				ps.executeUpdate();
			}
		}
		catch ( MySQLSyntaxErrorException e )
		{
			e.printStackTrace();
		}
		finally
		{
			if( ps != null )
			{
				ps.close();
			}
		}
	return new ArrayList<String>(newAndExistingColumns);}
    static String removeLastChar(String str) {
	    return str.substring(0, str.length() - 1);
	}
	public static List<Column> getTableStructure(String tableName,Connection connection) throws SQLException {
		final String table = tableName;
		List<Column> columnInfo = new ArrayList<>();
		List<Column> primaryKeyColumnInfo = new ArrayList<>();
		ResultSet rs = null;
		ResultSet primaryKeyRs = null;
		try {
					java.sql.DatabaseMetaData metaData = connection.getMetaData();
					primaryKeyRs = metaData.getPrimaryKeys(null, null, table);
					rs = metaData.getColumns(null, null, table, null);

					while (primaryKeyRs.next()) {
						Column primaryKeycolumn = new Column();
						primaryKeycolumn.setColumnName(primaryKeyRs.getString("COLUMN_NAME"));
						primaryKeycolumn
								.setIsPrimaryKey(primaryKeyRs.getString("PK_NAME").equals("PRIMARY") ? true : false);
						primaryKeyColumnInfo.add(primaryKeycolumn);
					}
					while (rs.next()) {

						Column column = new Column();
						column.setSchemaName(rs.getString("TABLE_SCHEM"));
						column.setTableName(rs.getString("TABLE_NAME"));
						column.setColumnName(rs.getString("COLUMN_NAME"));
						column.setDataType(rs.getString("TYPE_NAME"));
						if (rs.getString("TYPE_NAME").contains("FLOAT") || rs.getString("TYPE_NAME").contains("DOUBLE")
								|| rs.getString("TYPE_NAME").contains("DECIMAL")
								|| rs.getString("TYPE_NAME").contains("NUMERIC")) {
							String scale = rs.getString("DECIMAL_DIGITS");
							if (scale != null) {
								column.setColumnSize(
										rs.getString("COLUMN_SIZE") + "," + rs.getString("DECIMAL_DIGITS"));
							} else {
								column.setColumnSize(rs.getString("COLUMN_SIZE"));
							}

						} else {
							column.setColumnSize(rs.getString("COLUMN_SIZE"));
						}
						column.setIsPrimaryKey(false);
						column.setIsNotNull(rs.getString("IS_NULLABLE").equals("YES") ? false : true);
						column.setDefaultValue(rs.getString("COLUMN_DEF"));
						column.setIsAutoIncrement(rs.getString("IS_AUTOINCREMENT").equals("YES") ? true : false);
						columnInfo.add(column);
					}
					for (Column pkColumn : primaryKeyColumnInfo) {
						for (Column column : columnInfo) {
							if (column.getColumnName().equals(pkColumn.getColumnName())) {
								if (pkColumn.getIsPrimaryKey()) {
									column.setIsPrimaryKey(true);
								}

							}
						}

					}
              return columnInfo;
			 

		} catch (DataAccessException ae) {
			LOG.error("error while getTableStructure()", ae);
			throw new AnvizentRuntimeException(ae);
		}finally{
			if(rs != null)
			{
				rs.close();
			}
			if(primaryKeyRs != null)
			{
				primaryKeyRs.close();
			}
		}
	}
	
	public static List<LinkedHashMap<String, Object>> getResultsFromApiResponse( List<LinkedHashMap<String, Object>> flatJson ) {

		List<LinkedHashMap<String, Object>> formattedApiResponse = new ArrayList<>();
		List<String> headers = new ArrayList<>();
		LinkedHashMap<String, Object> mainHeaders = new LinkedHashMap<String, Object>();
		for (LinkedHashMap<String, Object> h : flatJson) {
			h.forEach((k, v) -> {
				if (!headers.contains(k)) {
					headers.add(k);
					mainHeaders.put(k, "");
				}
			});
		}
		formattedApiResponse.add(mainHeaders);
		int headersSize = headers.size();

		for (LinkedHashMap<String, Object> data1 : flatJson) {
			LinkedHashMap<String, Object> currentData = new LinkedHashMap<String, Object>();
			Object currentValue = null;
			int i = 0;
			do {

				String mainHeader = headers.get(i);
				for (Map.Entry<String, Object> entry : data1.entrySet()) {

					String key = entry.getKey();
					Object value = entry.getValue();
					if(value != null && value.toString().contains("/Date(")){
						String date = value.toString();
						date = date.replace("/", "").replace("Date", "").replace("(", "").replace(")", "");
						Long dateInMilliseconds = Long.parseLong(date);
						SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
						String s = f.format(new Date(dateInMilliseconds));
						value = s;
					}
					if (mainHeader.equals(key)) {
						currentValue = value;
					}

				}
				i++;
				currentData.put(mainHeader, currentValue);
				currentValue = "";
			} while (i < headersSize);
			
			
			formattedApiResponse.add(currentData);
		}

		return formattedApiResponse;
	}
	@SuppressWarnings("rawtypes")
	public static boolean getResponseObject(WebServiceApi webServiceApi, String apiUrl, String methodType, String responseObjectName, JSONObject postBodyObject, List<Object> dataList, Map autheticateParams, HttpEntity<String> headerParams, HttpHeaders headers, RestTemplate restTemplate)
			throws ClientWebserviceRequestException
	{
		return getResponseObject(webServiceApi, apiUrl, methodType, responseObjectName, postBodyObject, dataList, autheticateParams, headerParams, headers, restTemplate, -1);
	}

	@SuppressWarnings("rawtypes")
	public static boolean getResponseObject(WebServiceApi webServiceApi, String apiUrl, String methodType, String responseObjectName, JSONObject postBodyObject, List<Object> dataList, Map autheticateParams, HttpEntity<String> headerParams, HttpHeaders headers, RestTemplate restTemplate, int limit)
			throws ClientWebserviceRequestException
	{
		return getResponseObject(webServiceApi, apiUrl, methodType, responseObjectName, postBodyObject, dataList, autheticateParams, headerParams, headers, restTemplate, limit, null, null);
	}

	@SuppressWarnings("rawtypes")
	public static boolean getResponseObject(WebServiceApi webServiceApi, String apiUrl, String methodType, String responseObjectName, JSONObject postBodyObject, List<Object> dataList, Map autheticateParams, HttpEntity<String> headerParams, HttpHeaders headers, RestTemplate restTemplate, int limit,
			String nextLinkUrlPattern, List<Object> nextLinkList) throws ClientWebserviceRequestException
	{
		return getResponseObject(webServiceApi, apiUrl, methodType, responseObjectName, postBodyObject, dataList, autheticateParams, headerParams, headers, restTemplate, limit, 0, nextLinkUrlPattern, nextLinkList);
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public static boolean getResponseObject(WebServiceApi webServiceApi, String apiUrl, String methodType, String responseObjectName, JSONObject postBodyObject, List<Object> dataList, Map autheticateParams, HttpEntity<String> headerParams, HttpHeaders headers, RestTemplate restTemplate, int limit,
			int retryCount, String nextLinkUrlPattern, List<Object> nextLinkList) throws ClientWebserviceRequestException
	{
		ResponseEntity<?> restApiResponse = null;
		int initialDataListSize = dataList.size();
		URI uri = UriComponentsBuilder.fromUriString(apiUrl).build().encode().toUri();
		int diffSize = 0;
		try
		{
			if(webServiceApi.getWebServiceConnectionMaster().getWebServiceTemplateMaster().getWebserviceType().equals("SOAP")) {
				if (methodType.equals("GET")) {
					headerParams = new HttpEntity<>(headers);
					restApiResponse = restTemplate.exchange(uri, HttpMethod.GET, headerParams, String.class);
					LOG.debug("calling API Started ");
				} else if (methodType.equals("POST")) {
					HttpEntity<Object> headerParamsPost = new HttpEntity<Object>(webServiceApi.getSoapBodyElement(), headers);
					restApiResponse = restTemplate.exchange(uri, HttpMethod.POST, headerParamsPost, String.class);
					LOG.debug("calling API Ended ");
				}
				if (responseObjectName != null && restApiResponse != null
						&& restApiResponse.getStatusCode().equals(HttpStatus.OK)) {
					String response = (String) restApiResponse.getBody();
					getSoapObject(response , responseObjectName ,dataList);
				
				}
			}else {
			if( methodType.equals("GET") )
			{
				headerParams = new HttpEntity<>(headers);
				restApiResponse = restTemplate.exchange(uri, HttpMethod.GET, headerParams, Object.class);
				LOG.debug("calling API Started ");
			}
			else if( methodType.equals("POST") )
			{
				HttpEntity<Object> headerParamsPost = new HttpEntity<Object>(postBodyObject.toString(), headers);
				restApiResponse = restTemplate.exchange(uri, HttpMethod.POST, headerParamsPost, Object.class);
				LOG.debug("calling API Ended ");
			}
			if( responseObjectName != null && restApiResponse != null && restApiResponse.getStatusCode().equals(HttpStatus.OK) )
			{
				if( restApiResponse.getBody() != null )
				{
					if( restApiResponse.getBody() instanceof Map )
					{
						Map<String, Object> sourceObject = (Map<String, Object>) restApiResponse.getBody();
						if( StringUtils.isNotBlank(responseObjectName) )
						{
							String[] patternSplit = StringUtils.split(responseObjectName, ".");
							getObjects(patternSplit, 0, sourceObject, dataList);

							if( StringUtils.isNotBlank(nextLinkUrlPattern) )
							{
								String[] nextUrlLinkPatternSplit = StringUtils.split(nextLinkUrlPattern, ".");
								getObjects(nextUrlLinkPatternSplit, 0, sourceObject, nextLinkList);
							}
						}
						else
						{
							dataList.add((Map) restApiResponse.getBody());
						}
					}
					else if( restApiResponse.getBody() instanceof List )
					{
						dataList.addAll((List) restApiResponse.getBody());
					}
				}
			}
			}
			int finalDataListSize = dataList.size();
			diffSize = finalDataListSize - initialDataListSize;
			LOG.debug("fetched Data List Size:" + finalDataListSize + " difference with previous fetch :" + diffSize);

			if( limit != -1 && limit != diffSize )
			{
				LOG.debug("Terminating the data fetching\nFetched Data (" + diffSize + ") and limit (" + limit + ") not matching for " + apiUrl);
				diffSize = 0;
			}
		}
		catch ( Exception he )
		{
			if( he instanceof HttpServerErrorException )
			{
				throw new ClientWebserviceRequestException(((HttpServerErrorException) he).getResponseBodyAsString(), he);
			}
			else if( he instanceof HttpClientErrorException && ((HttpClientErrorException) he).getStatusCode().equals(HttpStatus.TOO_MANY_REQUESTS) )
			{
				LOG.debug("Too many Requests Api url:" + " -- " + apiUrl);
				retryCount++;
				try
				{
					int sleepTime = (int) Math.pow(3, retryCount - 1) * WEB_SERVICE_SLEEP_TIME;
					LOG.debug("Too many Requests Retry seconds" + " -- " + sleepTime);
					Thread.sleep(sleepTime);
				}
				catch ( InterruptedException e )
				{
					e.printStackTrace();
					throw new ClientWebserviceRequestException("Sleep timer omitted " + e.getMessage());
				}

				if( retryCount <= MAX_API_HIT_LIMIT )
				{
					return getResponseObject(webServiceApi, apiUrl, methodType, responseObjectName, postBodyObject, dataList, autheticateParams, null, headers, restTemplate, limit, retryCount, nextLinkUrlPattern, nextLinkList);
				}
				else
				{
					throw new ClientWebserviceRequestException(MAX_API_HIT_LIMIT + " retries completed for too many requests");
				}
			}
			else if( he instanceof HttpClientErrorException && ((HttpClientErrorException) he).getStatusCode().equals(HttpStatus.UNAUTHORIZED) )
			{
				// TODO ADDEDCODE
				retryCount++;
				boolean isTokenRefreshed = refreshOauth2Token(headers, webServiceApi, restTemplate);
				if( isTokenRefreshed )
				{
					if( retryCount <= MAX_API_HIT_LIMIT )
					{
						return getResponseObject(webServiceApi, apiUrl, methodType, responseObjectName, postBodyObject, dataList, autheticateParams, null, headers, restTemplate, limit, retryCount, nextLinkUrlPattern, nextLinkList);
					}
				}

			}
			if( he instanceof HttpClientErrorException )
			{
				LOG.debug("Error occured while fetching data");
				throw new ClientWebserviceRequestException(((HttpClientErrorException) he).getResponseBodyAsString(), he);
			}
			else
			{
				LOG.debug("Error occured while fetching data");
				throw new ClientWebserviceRequestException(he);
			}

		}
		return diffSize == 0 ? false : true;
	}

	@SuppressWarnings("unchecked")
	static void getObjects(String[] patternSplit, int patternIndex, Map<String, Object> sourceObject, List<Object> response)
	{

		if( sourceObject != null && patternIndex <= patternSplit.length && patternSplit.length > 0 )
		{

			String currentPattern = patternSplit[patternIndex];
			if( currentPattern.endsWith("{}") )
			{
				Map<String, Object> resp = (Map<String, Object>) sourceObject.get(currentPattern.substring(0, currentPattern.length() - 2));
				getObjects(patternSplit, patternIndex + 1, resp, response);
			}
			else if( currentPattern.endsWith("[]") )
			{
				List<Object> resp = (List<Object>) sourceObject.get(currentPattern.substring(0, currentPattern.length() - 2));
				if( resp != null )
				{
					int dataLength = resp.size();
					for (int i = 0; i < dataLength; i++)
					{
						Map<String, Object> intResp = (Map<String, Object>) resp.get(i);
						getObjects(patternSplit, patternIndex + 1, intResp, response);
					}
				}
			}
			else
			{
				Object finalOutput = sourceObject.get(currentPattern.substring(0, currentPattern.length()));

				if( finalOutput != null )
				{
					if( finalOutput instanceof List )
					{
						List<Object> finalArray = (List<Object>) finalOutput;
						for (Object arr : finalArray)
						{
							response.add(arr);
						}
					}
					else
					{
						response.add(finalOutput);
					}

				}

			}
		}
	}

	public static ArrayList<String> getParameterVariables(String source, String pattern)
	{
		ArrayList<String> variableNames = new ArrayList<>();

		int lastIndex = 0;
		while (source.indexOf(pattern, lastIndex) != -1)
		{
			String param = "";
			int startIndex = source.indexOf(pattern, lastIndex);
			int endIndex = source.indexOf("}", startIndex);
			param = source.substring(startIndex + 2, endIndex);

			if( variableNames.indexOf(param) == -1 )
			{
				variableNames.add(param);
			}

			lastIndex = endIndex;
		}

		return variableNames;
	}

	static String convertDateFormat(String requiredDateFormat, String date, String timeZone) throws Exception, java.text.ParseException
	{

		int dayOfYear = LocalDate.parse(date).getDayOfYear();
		int year = LocalDate.parse(date).getYear();

		final Calendar c = Calendar.getInstance(TimeZone.getTimeZone(timeZone));
		c.set(1, 0, 1, 0, 0, 0);
		c.set(Calendar.MILLISECOND, 0);
		c.set(Calendar.YEAR, year);
		c.set(Calendar.DAY_OF_YEAR, dayOfYear);

		SimpleDateFormat sdf = new SimpleDateFormat(requiredDateFormat);
		sdf.setTimeZone(TimeZone.getTimeZone(timeZone));

		return sdf.format(c.getTime()).toString();
	}

  static boolean compareDates(String startDate, String todayDate, String dateFormat) throws java.text.ParseException
	{
		boolean status = false;
		SimpleDateFormat sdf = new SimpleDateFormat(dateFormat);
		Date date1 = sdf.parse(startDate);
		Date date2 = sdf.parse(todayDate);
		if( date1.compareTo(date2) >= 0 )
		{
			status = true;
		}
		return status;
	}
 
	static String getEndDateByInterval(String fromDate, String dateFormat, int interval) throws java.text.ParseException
	{
		DateFormat formatter = new SimpleDateFormat(dateFormat);
		Date startDate = (Date) formatter.parse(fromDate);
		long calculatedInterval = (interval * 24) * 1000 * 60 * 60; // 1 hour in
																	// millis
		long curTime = startDate.getTime();
		curTime += calculatedInterval;
		Format format = new SimpleDateFormat(dateFormat);
		return format.format(new Date(curTime));

	}

	@SuppressWarnings("rawtypes")
	static boolean refreshOauth2Token(HttpHeaders headers, WebServiceApi webServiceApi, RestTemplate restTemplate)
	{

		boolean isTokenRefreshed = false;
		Long authenticationType = webServiceApi.getWebServiceConnectionMaster().getWebServiceTemplateMaster().getWebServiceAuthenticationTypes().getId();
		if( authenticationType == 5 )
		{
			ResponseEntity<Map> authenticationResponse = null;
			authenticationResponse = testAuthenticationUrl(webServiceApi.getWebServiceConnectionMaster(), restTemplate);

			if( authenticationResponse.getStatusCode().equals(HttpStatus.OK) || authenticationResponse.getStatusCode().equals(HttpStatus.NO_CONTENT) )
			{
				Map autheticateParams = null;
				if( authenticationResponse.getBody() != null && authenticationResponse.getBody() instanceof Map )
				{
					autheticateParams = authenticationResponse.getBody();
				}

				String requiredRequestHeaders = webServiceApi.getWebServiceConnectionMaster().getWebServiceTemplateMaster().getApiAuthRequestHeaders();

				if( requiredRequestHeaders != null && autheticateParams != null )
				{

					ArrayList<String> autheticateParamVariables = getParameterVariables(requiredRequestHeaders, "{$");
					for (String variable : autheticateParamVariables)
					{
						if( autheticateParams.get(variable) != null )
						{
							requiredRequestHeaders = StringUtils.replace(requiredRequestHeaders, "{$" + variable + "}", autheticateParams.get(variable).toString());
						}
						else
						{
							throw new ClientWebserviceRequestException("required header parameters not found in authentication response");
						}
					}

					ArrayList<String> autheticateHeaderVariables = getParameterVariables(requiredRequestHeaders, "{#");

					if( autheticateHeaderVariables.size() > 0 )
					{
						String headerKeyvalues = webServiceApi.getWebServiceConnectionMaster().getHeaderKeyvalues();
						if( headerKeyvalues != null )
						{
							JSONObject headerKeyvaluesObj = new JSONObject(headerKeyvalues);
							for (String variable : autheticateHeaderVariables)
							{
								if( headerKeyvaluesObj.get(variable) != null )
								{
									requiredRequestHeaders = StringUtils.replace(requiredRequestHeaders, "{#" + variable + "}", headerKeyvaluesObj.get(variable).toString());
								}
								else
								{
									throw new ClientWebserviceRequestException("required header parameters not found in authentication response");
								}
							}
						}
						else
						{
							throw new ClientWebserviceRequestException("required header parameters not found in authentication response");
						}
					}

					String[] rHeaders = StringUtils.split(requiredRequestHeaders, ";");

					for (String hdr : rHeaders)
					{
						String[] eachHeader = StringUtils.split(hdr, ":");

						if( headers.containsKey(eachHeader[0]) )
						{
							headers.remove(eachHeader[0]);
						}
						headers.add(eachHeader[0], eachHeader[1]);
					}
					isTokenRefreshed = true;

				}

			}
		}

		return isTokenRefreshed;
	}
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static ResponseEntity testAuthenticationUrl(RestTemplate restTemplate,
			WebServiceConnectionMaster webServiceConnectionMaster) {

		String soapBodyElement =null;
		ResponseEntity<String> response =null;
		String authenticationUrlMethodType=null;
		JSONObject authBodyParamJsonObj = null;
		try {
		String authBodyParams = webServiceConnectionMaster.getBodyParams();
		JSONObject bodyParams = new JSONObject();
		if (StringUtils.isNotBlank(authBodyParams)) {
			authBodyParamJsonObj = new JSONObject(authBodyParams);
			Iterator<String> keys = authBodyParamJsonObj.keys();
			while (keys.hasNext()) {
				String key = keys.next();
				bodyParams.put(key, authBodyParamJsonObj.getString(key));
			}
		}
		
			soapBodyElement = webServiceConnectionMaster.getWebServiceTemplateMaster().getSoapBodyElement();
			String soapBodyParams = webServiceConnectionMaster.getBodyParams();
			if (soapBodyParams != null) {
				JSONObject soapBodyParamsJsonObj = new JSONObject(soapBodyParams);
				Iterator<String> keys = soapBodyParamsJsonObj.keys();
				while (keys.hasNext()) {
					String key = keys.next();
					soapBodyElement = StringUtils.replace(soapBodyElement, "{$" + key + "}",
							soapBodyParamsJsonObj.getString(key));
				}
			}
			
			authenticationUrlMethodType = webServiceConnectionMaster.getWebServiceTemplateMaster()
					.getAuthenticationMethodType();
		
			if(authenticationUrlMethodType.equalsIgnoreCase("post")) {
					HttpHeaders soapHeader = new HttpHeaders();
					soapHeader.add("Content-Type", "text/plain");
					soapHeader.add("SOAPAction", "search");
					HttpEntity<String> entity=new HttpEntity<>(soapBodyElement,soapHeader);
					String endPointUrl = webServiceConnectionMaster.getWebServiceTemplateMaster().getAuthenticationUrl();
					
					try { 
						response = restTemplate.exchange(endPointUrl, HttpMethod.POST, entity, String.class);
					} catch (Exception exception) {
						response = new ResponseEntity(null, HttpStatus.BAD_REQUEST);
						exception.printStackTrace();
					}			
					
	}
		}catch(Exception e) {
			e.printStackTrace();
		}
			return response;

}
	
	 private static Map<String, String> flattXml(String currentPath, Node currentNode ,Map<String, String> nodemap) {
	        if (currentNode.getNodeType() == Node.TEXT_NODE &&
	                !currentNode.getNodeValue().trim().isEmpty()) {
	            nodemap.put(currentPath.replaceAll("\\s+", "_").replaceAll("\\W+", "_"), currentNode.getNodeValue());
	        } else {
	            NodeList childNodes = currentNode.getChildNodes();
	            int length = childNodes.getLength();
	            String nextPath = currentPath.isEmpty()
	                    ? currentNode.getNodeName()
	                    : currentPath + "_" + currentNode.getNodeName().substring(currentNode.getNodeName().indexOf(":"));
	            for (int i = 0; i < length; i++) {
	                Node item = childNodes.item(i);
	                flattXml(nextPath, item ,nodemap);
	            }
	        }
			return nodemap;
	    }
	 
	 public static void getSoapObject(String response , String reqResponseObj ,List<Object> list) throws SAXException, IOException, ParserConfigurationException{
		 DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
			DocumentBuilder builder = factory.newDocumentBuilder();
			Document document = builder.parse(new InputSource(new StringReader(response)));
			document.getDocumentElement().normalize();     
			Element root = document.getDocumentElement();
			NodeList nodeList = root.getElementsByTagName(reqResponseObj);
			
			
			 for (int i = 0; i < nodeList.getLength(); i++) {
				 Map<String, String> nodemap = new LinkedHashMap<>();
	             Node item = nodeList.item(i);
	             Map<String, String> node= flattXml("", item ,nodemap);
	             list.add(node);
	             
	         }
	 }

	public static RestTemplate getRestTemplate() throws KeyManagementException, NoSuchAlgorithmException, KeyStoreException
	{
		TrustStrategy acceptingTrustStrategy = new TrustStrategy()
		{
			@Override
			public boolean isTrusted(java.security.cert.X509Certificate[] arg0, String arg1) throws CertificateException
			{
				return true;
			}
		};
		SSLContext sslContext = org.apache.http.ssl.SSLContexts.custom().loadTrustMaterial(null, acceptingTrustStrategy).build();
		SSLConnectionSocketFactory csf = new SSLConnectionSocketFactory(sslContext, new NoopHostnameVerifier());
		CloseableHttpClient httpClient = HttpClients.custom().setSSLSocketFactory(csf).build();
		HttpComponentsClientHttpRequestFactory httpRequestFactory = new HttpComponentsClientHttpRequestFactory();
		httpRequestFactory.setHttpClient(httpClient);
		return new RestTemplate(httpRequestFactory);
	}
	 
}
