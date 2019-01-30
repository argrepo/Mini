package com.datamodel.anvizent.AmazonS3;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.json.JSONObject;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

public class RestExample {
	
	
	
	
	public RestExample() {
		// TODO Auto-generated constructor stub
		System.out.println("in constructor block");
	}
	
	public static void main(String[] args) {
		JSONObject jo = new JSONObject();
		jo.put("Modified_Date", "2017-03-07 00:00:00");
		
		System.out.println("jo -- > " + jo.toString());
	}
	
	public static void main19(String[] args) {
		RestTemplate rt = new RestTemplate();
		HttpHeaders headers = new HttpHeaders();
		headers.add("Content-Type",MediaType.APPLICATION_FORM_URLENCODED_VALUE);
		headers.add("Accept","application/json");
		/*headers.add("Cookie","k3.anvizs=cm3fLF-FyUmIk74PiDhxP5lRFtsgD0UIszWNMMcbzQBSunRsyAZqK1n61IsoZ-YbWbGpIn5BOCIvACl3AAneP_gKjQIj8WGXtALPIK0wc7NBDq7GoBbH4NEYQPyFSE5VstXKJlOyEXdLY2FOmCjwXOyjMLlZ7WjRWL43KUPODYhxo_c6bHAdrdNTyJ9HZIn380RRmxqblwQqe8IIbpm-C8HInVrs-cXLYKHUtwMysuRwHxYC0i14TfZ6RUh0CNKZN9CWuoMveGqbnz0PBMq-PojSK8Z8H5xJ1Zo6hSKlYVF1TTFe0apjui8D545fmD257PNbZ5Yf1uhzme_4UJmAk4A0dtA; path=/; HttpOnly");
		headers.add("Authorization","Konfigure-v1  token=\"x/eAoGfKsvGFg5q2FbhAEd4743+IbmyLML3JRBxaYRJCkXFGqoaID/ZxX5+B024M2Utt3Ze3BS4McrpahD6EuwNvTQI=\"");
		
		headers.add("X-Authentication-code","JlzsAtRwQ1l2mbAepT5vEV1_tHP9FP9EjvOmDeovndY7Q8UnBzBYbD4KdB7WchvNWNXk9FJyTa8CZXDaT1HFyw");
		*/
		
		MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
		params.add("wsTemplateId", "64");
		params.add("iLId", "2");
		HttpEntity<Object> headerParamsPost = new HttpEntity<Object>(params, headers);
		
		try {
			ResponseEntity<Map> imap = rt.exchange("http://localhost:9090/minidwwebservice/adminWServices/user/vdamR0MQ_JNcWARht8nLMg/etlAdmin/getWSILMappingDetailsById",
					HttpMethod.POST, headerParamsPost, Map.class);
			System.out.println(imap.getBody());
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		//
	}
	
	public static void main18(String[] args) {
		RestTemplate rt = new RestTemplate();
		HttpHeaders headers = new HttpHeaders();
		headers.add("Content-Type",MediaType.APPLICATION_JSON_VALUE);
		headers.add("Accept","application/json");
		headers.add("Cookie","k3.anvizs=LZqL5sb6kuqgry3_rinenwqXfPNWvwpNbVrRov19PF6IfGONzKfiGeAe8-xDujeT4MffmyqB7ZCZettRET9qRmUFfhS5AO54wVaw63qtzSA-qInEBFW73RaCIEAGRrDHWmWoB4ev9KeDSGtahuYNJuBWme1is_o-Snxi3EbJTWCZ87FHzWTfL6Gew791LNPy0iAd60twCosn6JQu_AAy3UH_moW5i6E0dyEHejtnm252GjonI5P5uAe0FreCSdyRc6NRf1psTI3s5TnIqXTTsPHze9kOa6VIRDETj2Jf8PyRH_05RwXrLCkfbmH4mN7vsHnqMLckpA3Vl1JRkRUh9rhdugE; path=/; HttpOnly");
		//headers.add("Authorization","Konfigure-v1  token=\"x/eAoGfKsvGFg5q2FbhAEd4743+IbmyLML3JRBxaYRJCkXFGqoaID/ZxX5+B024M2Utt3Ze3BS4McrpahD6EuwNvTQI=\"");
		
		String body = "{\"Modified_Date\":\"2017-03-07 00:00:00\"}";
//		MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
//		params.add("Modified_Date", "2017-03-07 00:00:00");
		HttpEntity<Object> headerParamsPost = new HttpEntity<Object>(body, headers);
		
		try {
			ResponseEntity<Map> imap = rt.exchange("https://sandbox.keyedinmanufacturing.com/Anvizent-Sandbox/api/v1/report/b614cd2006944b5cb933e9a38bd49ef7/run",
					HttpMethod.POST, headerParamsPost, Map.class);
			System.out.println(imap.getBody());
		} catch (Exception e) {
			e.printStackTrace();
		}
		
	}
	
	public static void main2(String[] args) {
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss:SS");
		System.out.println(sdf.format(new Date()));
		
	}
	
	
	public static void main10(String[] args) {
		String paramName = "$filter";
		String paramValue = "state eq tg and --#/*orderdate gt {date} and */#- country eq india";
		int startingIndex = StringUtils.indexOf(paramValue, "/*");
		int endingIndex = StringUtils.indexOf(paramValue, "*/",startingIndex);
		String newParamValue = "";
		newParamValue += StringUtils.substring(paramValue, 0, startingIndex);
		newParamValue += StringUtils.substring(paramValue, startingIndex+2, endingIndex);
		newParamValue += StringUtils.substring(paramValue, endingIndex+2, paramValue.length());
		
		System.out.println(newParamValue);
	}
	
	public static void main9(String[] args) {
		//String pattern = "d{}.results[].Code";
		//String pattern = "d{}.results[].__metadata{}.uri";
		String pattern = "d{}.results";
		String[] patternSplit = StringUtils.split(pattern,".");
		Map fileObj2 = null;
		try {
			 	File file = new File("C:\\Rajesh\\tempMyObj");
			    FileInputStream f = new FileInputStream(file);
			    ObjectInputStream s = new ObjectInputStream(f);
			    fileObj2 = (HashMap) s.readObject();
			    s.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
		List response = new ArrayList();
		System.out.println("fileObj2  -- > " + fileObj2);
		getObjects(patternSplit, 0, fileObj2, response);
		System.out.println("Response  -- > " + response);
	}

	@SuppressWarnings("unchecked")
	static void getObjects(String[] patternSplit, int patternIndex, Map<String, Object> sourceObject, List<Object> response) {
		
		if ( sourceObject != null && patternIndex <= patternSplit.length ) {
			
			String currentPattern = patternSplit[patternIndex];
			System.out.println(currentPattern);
			if ( currentPattern.endsWith("{}") ) {
				Map<String, Object> resp = (Map<String, Object>)sourceObject.get(currentPattern.substring(0, currentPattern.length()-2));
				System.out.println(resp);
				getObjects(patternSplit, patternIndex+1, resp, response);
			} else if ( currentPattern.endsWith("[]") ) {
				List<Object> resp = (List<Object>)sourceObject.get(currentPattern.substring(0, currentPattern.length()-2));
				System.out.println(resp);
				if ( resp != null) {
					int dataLength = resp.size();
					for ( int i=0; i< dataLength; i++ ) {
						Map<String, Object> intResp = (Map<String, Object>) resp.get(i);
						getObjects(patternSplit, patternIndex+1, intResp, response);
					}
				}
			} else {
				Object finalOutput = sourceObject.get(currentPattern.substring(0, currentPattern.length()));
				
				if (finalOutput != null) {
					if ( finalOutput instanceof List) {
						List<Object> finalArray =  (List<Object>) finalOutput;
						for (Object arr: finalArray) {
							response.add(arr);
						}
					} else {
						response.add(finalOutput);
					}
					
				}
				
			}
		}
	}
	
	
	public static void main8(String[] args) {
		try {
			HashMap fileObj = new HashMap();

		    ArrayList<String> cols = new ArrayList<String>();
		    cols.add("a");
		    cols.add("b");
		    cols.add("c");
		    fileObj.put("mylist", cols);
		    {
		        File file = new File("C:\\Rajesh\\temp");
		        FileOutputStream f = new FileOutputStream(file);
		        ObjectOutputStream s = new ObjectOutputStream(f);
		        s.writeObject(fileObj);
		        s.close();
		    }
		    File file = new File("C:\\Rajesh\\temp");
		    FileInputStream f = new FileInputStream(file);
		    ObjectInputStream s = new ObjectInputStream(f);
		    HashMap fileObj2 = (HashMap) s.readObject();
		    
		    System.out.println("fileObj2  -- > " + fileObj2);
		    s.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	
	
	
	/*public static void main(String[] args) {
		RestTemplate rt = new RestTemplate();
		HttpHeaders headers = new HttpHeaders();
		headers.add("Content-Type", "application/json");
		headers.add("Accept", "application/json");
		HttpEntity<Object> tsr = new HttpEntity<Object>(new LinkedMultiValueMap<>(), headers);
		ResponseEntity<Map> map = rt.postForEntity("https://staging.skuvault.com/api/gettokens?Email=gokul.a@anvizent.com&Password=6wE5tTyaTlvi", 
				tsr, Map.class);
		System.out.println("map " + map);
	}*/
	
	public static void main6(String[] args) {
		String authPathParams = "";
		JSONObject authPathParamJsonObj = null;

		String authRequestParams = "";
		JSONObject authRequestParamJsonObj = null;
		
		String authenticationUrl = "";
		
		
		try {
			authenticationUrl =  "https://sandbox.keyedinmanufacturing.com/{#clientsandbaxname}/api/v1/authenticate/{#clientId}?r=antha";
			authPathParams = "{\"clientsandbaxname\":\"Anvizent-Sandbox\",\"clientId\":\"CF574369BE28DB0A9913AB59950060576CC025FF\"}";
			
			if ( authPathParams != null) {
				authPathParamJsonObj = new JSONObject(authPathParams);
				Iterator<String> keys = authPathParamJsonObj.keys();
				while ( keys.hasNext() ) {
					String key = keys.next();
					authenticationUrl = StringUtils.replace(authenticationUrl, "{#"+key+"}", authPathParamJsonObj.getString(key));
				}
			}
			
			authRequestParams = "{\"password\":\"ap asv ^*&!i2\"}";
			StringBuilder requestParams = new StringBuilder();
			if ( authRequestParams != null) {
				authRequestParamJsonObj = new JSONObject(authRequestParams);
				Iterator<String> keys = authRequestParamJsonObj.keys();
				while ( keys.hasNext() ) {
					String key = keys.next();
					requestParams.append(key).append("=").append(URLEncoder.encode(authRequestParamJsonObj.getString(key), "UTF-8")).append("&");
				}
			}
			
			
			if ( requestParams.length() > 0 ) {
				requestParams.deleteCharAt( requestParams.length()-1 );
				authenticationUrl += (authenticationUrl.contains("?") ? "&":"?") +requestParams;
			}
			
			
			System.out.println(authenticationUrl);
			
		} catch (Exception e) {
			e.printStackTrace();
			
		}
	}
	
	public static void main3(String[] args) {

try {
			
			String data = "{\"data\":{\"oldVersion\":0,\"newVersion\":1},\"hasMessages\":false,\"inputBody\":null,\"inputParams\":null,\"messages\":null,\"status\":\"OK\"}";
			
			JSONObject jobj = new JSONObject(data);
			if (jobj != null && jobj.get("status").toString().equalsIgnoreCase("ok")) {
				JSONObject druidVersion = (JSONObject) jobj.get("data");
		    	Long oldversion = druidVersion.getLong("oldVersion");
		    	Long newversion = druidVersion.getLong("newVersion");
		    	System.out.println(oldversion+"-"+newversion);
			}
			
			//String code = URLEncoder.encode(AESConverter.encrypt("superadmin@anvizent.com#$#test#$#"+new Date()), "UTF-8");
			/*String code = URLEncoder.encode(AESConverter.encrypt("dataprepteam@arghainc.com#$#test@123#$#"+new Date()), "UTF-8");
			System.out.println(code);*/
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public int sumOfNumber(Integer[] nums) {
		int sum = 0;
		for ( int n:nums ) {
			sum += n;
		}
		return sum;
	}
	
	public String[][] sumOfNumber1(Integer[] nums) {
		int sum = 0;
		System.out.println("in method");
		
		try {
			Thread.sleep(5000);
		} catch (Exception e) {
			e.printStackTrace();
		}
		for ( int n:nums ) {
			sum += n;
		}
		
		String[][] num = {{Integer.toString(sum)}};
		return num;
	}
	

	
	
	
	
	
	
	static {
		System.out.println("in static block");
	}
}
