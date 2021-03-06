package com.datamodel.anvizent.helper;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.DateFormat;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.TimeZone;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.dbcp.BasicDataSource;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.output.FileWriterWithEncoding;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.poi.EncryptedDocumentException;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.HandlerMapping;

import com.anvizent.minidw.client.jdbc.utils.ClientJDBCUtil;
import com.anvizent.minidw.service.utils.helper.WebServiceCSVWriter;
import com.datamodel.anvizent.common.exception.CSVConversionException;
import com.datamodel.anvizent.common.exception.ClassPathException;
import com.datamodel.anvizent.helper.minidw.Constants;
import com.datamodel.anvizent.service.dao.FileDao;
import com.datamodel.anvizent.service.dao.PackageDao;
import com.datamodel.anvizent.service.model.ClientData;
import com.datamodel.anvizent.service.model.Column;
import com.datamodel.anvizent.service.model.DDLayout;
import com.datamodel.anvizent.service.model.Database;
import com.datamodel.anvizent.service.model.ErrorLog;
import com.datamodel.anvizent.service.model.FileInfo;
import com.datamodel.anvizent.service.model.ILConnection;
import com.datamodel.anvizent.service.model.ILConnectionMapping;
import com.datamodel.anvizent.service.model.Modification;
import com.datamodel.anvizent.service.model.Package;
import com.datamodel.anvizent.service.model.ServerConfigurations;
import com.datamodel.anvizent.service.model.Table;
import com.datamodel.anvizent.service.model.TemplateMigration;
import com.datamodel.anvizent.service.model.User;
import com.datamodel.anvizent.service.model.WebService;
import com.datamodel.anvizent.service.model.WebServiceApi;
import com.monitorjbl.xlsx.StreamingReader;

/**
 * 
 * @author rakesh.gajula
 *
 */
public class CommonUtils {
	protected static final Log LOGGER = LogFactory.getLog(CommonUtils.class);

	private static Matcher numericMatcher = Pattern.compile("[+-]?(?=\\d*[.eE])(?=\\.?\\d)\\d*\\.?\\d*(?:[eE][+-]?\\d+)?").matcher("");
	private static Matcher numericMatcher1 = Pattern.compile("^[-+]?[0-9]*\\.?[0-9]+([eE][-+]?[0-9]+)?$").matcher("");

	public static String getFileName(String filePath) {
		String fileName = null;
		filePath = filePath.replace("/", File.separator).replace("\\", File.separator);
		if (filePath != null) {
			int index = filePath.lastIndexOf(File.separator);
			fileName = filePath.substring(index + 1, filePath.length());
			return fileName;
		}
		return fileName;
	}

	public static File multipartToFile(MultipartFile multipart) {
		String dir = CommonUtils.createDir(Constants.Temp.getTempFileDir());
		File tempFile = new File(dir + multipart.getOriginalFilename());
		try {
			multipart.transferTo(tempFile);
		} catch (IllegalStateException e) {
			LOGGER.error("", e);
		} catch (IOException e) {
			LOGGER.error("", e);
		}
		return tempFile;
	}
	
	public static File multipartToFile(MultipartFile multipart, String dir) {
		File tempFile = null;
		if (StringUtils.isNotBlank(dir)) {
			CommonUtils.createDir(dir);
			tempFile = new File(dir + multipart.getOriginalFilename());
			try {
				multipart.transferTo(tempFile);
			} catch (IllegalStateException e) {
				LOGGER.error("", e);
			} catch (IOException e) {
				LOGGER.error("", e);
			}
		}
		return tempFile;
	}

	// check system OS
	private static  String oS = System.getProperty("os.name").toLowerCase();

	public static boolean isWindows() {
		return (oS.indexOf("win") >= 0);
	}

	public static boolean isMac() {
		return (oS.indexOf("mac") >= 0);
	}

	public static boolean isUnix() {
		return (oS.indexOf("nix") >= 0 || oS.indexOf("nux") >= 0 || oS.indexOf("aix") > 0);
	}

	// ***********************//
	public static String createDir(String dirName) {

		if (StringUtils.isNotBlank(dirName)) {
			if (!new File(dirName).exists()) {
				new File(dirName).mkdirs();
				LOGGER.info("dir created:" + dirName);
			}

		}
		return dirName;
	}
	
	public static String getClientIDFromHeader(HttpServletRequest request) {
		return request.getHeader(Constants.Config.HEADER_CLIENT_ID);
	}

	public static String getUserClientIDFromHeader(HttpServletRequest request) {
		return request.getHeader(Constants.Config.HEADER_USER_CLIENT_ID);
	}
	public static String getTimeZoneFromHeader(HttpServletRequest request) {
		return request.getHeader(Constants.Config.TIME_ZONE);
	}
	
	public static String getCsvPath(HttpServletRequest request) {
		return request.getHeader(Constants.Config.CSV_SAVE_PATH);
	}
	

	public static Connection connectDatabase(ILConnection iLConnection)throws SQLException, InstantiationException, IllegalAccessException, ClassNotFoundException {

		Connection con = null;
		if (iLConnection != null) {
			Integer connectorID = iLConnection.getDatabase().getConnector_id();
			String serverIPAndPort = iLConnection.getServer();
			String userName = iLConnection.getUsername();
			String password = iLConnection.getPassword();
			String driverName = iLConnection.getDatabase().getDriverName();
			String protocal = iLConnection.getDatabase().getProtocal();
			
			con = ClientJDBCUtil.getClientDataBaseConnection(connectorID, serverIPAndPort, userName, password,driverName,protocal);
		}
		return con;
	}

	public static String createFileByConncetion(ILConnectionMapping ilConnectionMapping) {

		String filePath = null;
		Connection conn = null;
		FileWriterWithEncoding fw = null;
		try {

			conn = connectDatabase(ilConnectionMapping.getiLConnection());

			Statement stmt = null;
			CallableStatement cstmt = null;

			if (conn != null) {

				String typeOfCommand = ilConnectionMapping.getTypeOfCommand();

				ResultSet res = null;

				boolean isQuery = ("Query".equals(typeOfCommand));

				if (isQuery) {
					System.out.println("isQuery 9in if:==========>" + isQuery);
					String query = ilConnectionMapping.getiLquery();
					stmt = conn.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
					res = stmt.executeQuery(query);
				} else {

					String procName = ilConnectionMapping.getiLquery();
					String procParams = ilConnectionMapping.getProcedureParameters();

					List<Map<String, String>> paramList = new ArrayList<>();

					if (StringUtils.isNotEmpty(procParams)) {
						String[] params = procParams.split("\\^");

						if (params.length > 0) {
							for (String param : params) {
								String[] p = param.split("=");

								if (p.length == 2) {
									Map<String, String> paramMap = new HashMap<>();
									paramMap.put("name", p[0]);
									paramMap.put("value", p[1]);
									paramList.add(paramMap);
								}
							}
						}
					}

					int noofparams = paramList.size();

					StringBuilder query = new StringBuilder();

					query.append("{call ").append(procName);

					if (noofparams > 0) {
						query.append("(");
						for (int i = 1; i <= noofparams; i++) {
							query.append("?");
							if (i < noofparams) {
								query.append(", ");
							}
						}
						query.append(")");
					}

					query.append("}");

					cstmt = conn.prepareCall(query.toString(), ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);

					if (noofparams > 0) {
						int index = 1;
						for (Map<String, String> paramMap : paramList) {
							cstmt.setObject(index++, paramMap.get("value"));
						}
					}

					res = cstmt.executeQuery();
					String fileDir = CommonUtils.createDir(Constants.Temp.getTempFileDir());
					filePath = fileDir + (procName.replaceAll("\\.", "_").replaceAll("\\W+", "")) + ".csv";

				}
				// set table name as file name
				ResultSetMetaData rsMetaData = res.getMetaData();

				if (isQuery) {
					String fileDir = CommonUtils.createDir(Constants.Temp.getTempFileDir());
					String tablename = rsMetaData.getTableName(1);
					String newfilename = "";

					if (StringUtils.isNotEmpty(tablename)) {
						newfilename = tablename;
					} else {
						newfilename = "datafile_" + CommonUtils.generateUniqueIdWithTimestamp();
					}

					filePath = fileDir + newfilename + ".csv";
				}

				LOGGER.debug("file path : " + filePath);

				fw = new FileWriterWithEncoding(filePath, Constants.Config.ENCODING_TYPE);

				int columnCount = rsMetaData.getColumnCount();

				for (int i = 1; i <= columnCount; i++) {
					fw.append(res.getMetaData().getColumnLabel(i));
					if (i < columnCount)
						fw.append(",");

				}
				fw.append(System.getProperty("line.separator"));
				while (res.next()) {
					for (int i = 1; i <= columnCount; i++) {
						String data = res.getString(i);
						if (data != null) {
							fw.append(sanitizeForCsv(data));
						}
						if (i < columnCount)
							fw.append(",");
					}
					fw.append(System.getProperty("line.separator"));
				}

			}
		} catch (Exception e) {
			LOGGER.error("", e);
		} finally {
			try {
				if (conn != null) {
					conn.close();
				}
				if (fw != null) {
					fw.flush();
					fw.close();
				}
			} catch (SQLException e) {
				LOGGER.error("", e);
			} catch (IOException e) {
				LOGGER.error("", e);
			}
		}

		return filePath;
	}

	public static String createFileByConncetionForNoOption(ILConnectionMapping ilConnectionMapping) throws Exception {

		String filePath = null;
		Connection conn = null;
		FileWriterWithEncoding fw = null;
		try {
			conn = connectDatabase(ilConnectionMapping.getiLConnection());
			SimpleDateFormat startDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss:SS");

			Statement stmt = null;
			CallableStatement cstmt = null;

			if (conn != null) {

				String typeOfCommand = ilConnectionMapping.getTypeOfCommand();
				ResultSet res = null;

				boolean isQuery = ("Query".equals(typeOfCommand));

				if (isQuery) {
					System.out.println("isQuery 9in if:==========>" + isQuery);
					String query = ilConnectionMapping.getiLquery();

					int connectorId = ilConnectionMapping.getiLConnection().getDatabase().getConnector_id();
					// MySQL
					if (connectorId == com.anvizent.minidw.client.jdbc.utils.Constants.Database.MYSQL) {
						query = "select a.* from (" + ilConnectionMapping.getiLquery() + ") a LIMIT 10 ";
					}

					stmt = conn.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
					String queryStartTime = startDateFormat.format(new Date());
					LOGGER.info("Query execution started " + queryStartTime);
					res = stmt.executeQuery(query);
					String queryEndTime = startDateFormat.format(new Date());
					LOGGER.info("Query execution completed " + queryEndTime);
				} else {

					String procName = ilConnectionMapping.getiLquery();
					String procParams = ilConnectionMapping.getProcedureParameters();

					List<Map<String, String>> paramList = new ArrayList<>();

					if (StringUtils.isNotEmpty(procParams)) {
						String[] params = procParams.split("\\^");

						if (params.length > 0) {
							for (String param : params) {
								String[] p = param.split("=");

								if (p.length == 2) {
									Map<String, String> paramMap = new HashMap<>();
									paramMap.put("name", p[0]);
									paramMap.put("value", p[1]);
									paramList.add(paramMap);
								}
							}
						}
					}

					int noofparams = paramList.size();

					StringBuilder query = new StringBuilder();

					query.append("{call ").append(procName);

					if (noofparams > 0) {
						query.append("(");
						for (int i = 1; i <= noofparams; i++) {
							query.append("?");
							if (i < noofparams) {
								query.append(", ");
							}
						}
						query.append(")");
					}

					query.append("}");

					cstmt = conn.prepareCall(query.toString(), ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);

					if (noofparams > 0) {
						int index = 1;
						for (Map<String, String> paramMap : paramList) {
							cstmt.setObject(index++, paramMap.get("value"));
						}
					}
					String queryStartTime = startDateFormat.format(new Date());
					LOGGER.info(
							"SP Query execution Started " + queryStartTime + " for IL Mapping Id " + ilConnectionMapping.getiLConnection().getConnectionId());
					res = cstmt.executeQuery();
					String queryEndTime = startDateFormat.format(new Date());
					LOGGER.info(
							"SP Query execution completed " + queryEndTime + " for IL Mapping Id " + ilConnectionMapping.getiLConnection().getConnectionId());
					String fileDir = CommonUtils.createDir(Constants.Temp.getTempFileDir());
					filePath = fileDir + (procName.replaceAll("\\.", "_").replaceAll("\\W+", "")) + ".csv";

				}
				// set table name as file name
				ResultSetMetaData rsMetaData = res.getMetaData();

				if (isQuery) {
					String fileDir = CommonUtils.createDir(Constants.Temp.getTempFileDir());
					String newfilename = "";
					newfilename = "datafile_" + CommonUtils.generateUniqueIdWithTimestamp();
					filePath = fileDir + newfilename + ".csv";
				}

				LOGGER.debug("file path : " + filePath);

				fw = new FileWriterWithEncoding(filePath, Constants.Config.ENCODING_TYPE);
				int columnCount = rsMetaData.getColumnCount();

				for (int i = 1; i <= columnCount; i++) {
					fw.append(res.getMetaData().getColumnLabel(i));
					if (i < columnCount)
						fw.append(",");
				}
				fw.append(System.getProperty("line.separator"));
				String writeStartTime = startDateFormat.format(new Date());
				LOGGER.info("File write execution started " + writeStartTime + " for IL Mapping Id " + ilConnectionMapping.getiLConnection().getConnectionId());
				String newLineCharacter = System.getProperty("line.separator");
				while (res.next()) {

					for (int i = 1; i <= columnCount; i++) {
						String data = res.getString(i);
						if (data != null) {
							fw.append(sanitizeForCsv(data));
						}
						if (i < columnCount)
							fw.append(",");
					}
					fw.append(newLineCharacter);
				}
				String writeEndTime = startDateFormat.format(new Date());
				LOGGER.info("File write execution Completed " + writeEndTime + " for IL Mapping Id " + ilConnectionMapping.getiLConnection().getConnectionId());

			}
		} finally {
			try {
				if (conn != null) {
					conn.close();
				}
				if (fw != null) {
					fw.flush();
					fw.close();
				}
			} catch (SQLException e) {
				LOGGER.error("", e);
			} catch (IOException e) {
				LOGGER.error("", e);
			}
		}

		return filePath;
	}

	public static String sanitizeForCsv(String cellData) {

		if (StringUtils.isEmpty(cellData))
			return "";
		cellData = cellData.trim();
		StringBuilder resultBuilder = new StringBuilder(cellData);
		int lastIndex = 0;
		while (resultBuilder.indexOf("\"", lastIndex) >= 0) {
			int quoteIndex = resultBuilder.indexOf("\"", lastIndex);
			resultBuilder.replace(quoteIndex, quoteIndex + 1, "\"\"");
			lastIndex = quoteIndex + 2;
		}

		char firstChar = cellData.charAt(0);
		char lastChar = cellData.charAt(cellData.length() - 1);

		if (cellData.contains(",") || // Check for commas
				cellData.contains("\r") || // CR
				cellData.contains("\r\n") || // CR LF
				cellData.contains("\n") || // LF
				cellData.contains("\"") || // DQ
				Character.isWhitespace(firstChar) || // Check for leading
														// whitespace.
				Character.isWhitespace(lastChar)) { // Check for trailing
													// whitespace
			resultBuilder.insert(0, "\"").append("\""); // Wrap in doublequotes.
		}
		return resultBuilder.toString();
	}

	public static int getRowCount(ResultSet res) throws SQLException {
		res.last();
		int numberOfRows = res.getRow();
		res.beforeFirst();
		return numberOfRows;
	}

	/*
	 * Checking for given string value is number or not. returns boolean value.
	 */
	public static boolean isNumber(String str) {
		if (isEmpty(str))
			return false;
		/* checking for both integer and numeric values */
		return isInteger(str) || isNumeric(str);
	}

	/*
	 * Checking for given string is empty or not. returns boolean value.
	 */
	public static boolean isEmpty(String str) {
		return str == null || str.length() == 0;
	}

	public static boolean isNotEmpty(String str) {
		return !isEmpty(str);
	}

	/*
	 * checking for integer values.
	 */
	public static boolean isInteger(CharSequence cs) {
		if (cs == null || cs.length() == 0) {
			return false;
		}
		int sz = cs.length(), i = 0;
		char c = cs.charAt(i);

		/*
		 * checking for the first char is `-`(minus) or `+` plus sign.
		 */
		if (c == '-' || c == '+') {
			if (sz > 1)
				i++;
			else
				return false;
		}

		for (; i < sz; i++) {
			if (!Character.isDigit(cs.charAt(i))) {
				return false;
			}
		}
		return true;
	}

	/*
	 * to check the given number is a valid number or not.
	 */

	public static boolean isNumeric(String str) {
		if (isEmpty(str))
			return false;
		/*
		 * matching with two regex patterns, so we can give more accurate
		 * results
		 */
		return numericMatcher.reset(str).matches() || numericMatcher1.reset(str).matches();
	}

	public static String generateUniqueIdWithTimestamp() {

		String op = "";

		try {
			DateFormat format = new SimpleDateFormat("yyyyMMdd_HHmmss_SS");
			Date currentTime = new Date();

			op = format.format(currentTime);

		} catch (Exception e) {
			LOGGER.error("Error while creating new unique id", e);
		}

		return op;
	}

	public static int getColumnCount(ResultSet res) throws SQLException {
		return res.getMetaData().getColumnCount();
	}


	/**
	 * 
	 * @param dir
	 * @param fileExtn
	 * @return
	 */
	public static File[] getFiles(String dir, String fileExtn) {
		File[] files = null;
		if (StringUtils.isNotBlank(dir)) {
			File fileDir = new File(dir);
			if (!fileDir.exists()) {
				fileDir.mkdirs();
				System.out.println("dir is created.." + dir);
			} else {
				files = fileDir.listFiles(new FilenameFilter() {
					@Override
					public boolean accept(File fileDir, String name) {
						return name.endsWith(fileExtn);
					}
				});

			}
		}

		return files;
	}

	/**
	 * 
	 * @param url
	 *            of the file which will be added to class path
	 * @throws ClassPathException 
	 */
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public static void addFileToClassPath(URL u) throws ClassPathException {

		ClassLoader c = CommonUtils.class.getClassLoader();
		URLClassLoader sysloader = (URLClassLoader) c;
		Class sysclass = URLClassLoader.class;

		Method method;
		try {
			method = sysclass.getDeclaredMethod("addURL", new Class[] { URL.class });
			method.setAccessible(true);
			method.invoke(sysloader, new Object[] { u });
		} catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException|NoSuchMethodException | SecurityException e) {
			throw new ClassPathException("Unable to add jobs to claa path", e);
		}

	}

	public static String getEtlJobsPath() {
		return com.datamodel.anvizent.helper.Constants.Config.ETL_JOBS;
	}
	
	public static String getCommonEtlJobsPath() {
		return com.datamodel.anvizent.helper.Constants.Config.COMMON_ETL_JOBS;
	}

	public static String getTableScriptsPath() {
		return getEtlJobsPath() + com.datamodel.anvizent.helper.Constants.Config.TABLE_SCRIPTS;
	}

	public static String getILCsvTemplatePath() {
		return getEtlJobsPath() + com.datamodel.anvizent.helper.Constants.Config.TEMPLATES_CSV;
	}

	public static String getILExcelTemplatePath() {
		return getEtlJobsPath() + com.datamodel.anvizent.helper.Constants.Config.TEMPLATES_EXCEL;
	}

	public static String getXRefILCsvTemplatePath() {
		return getEtlJobsPath() + com.datamodel.anvizent.helper.Constants.Config.TEMPLATES_XREF_CSV;
	}

	public static String getXRefILExcelTemplatePath() {
		return getEtlJobsPath() + com.datamodel.anvizent.helper.Constants.Config.TEMPLATES_XREF_EXCEL;
	}

	/**
	 * 
	 * add the location of all the files from external dir to class path
	 * @throws ClassPathException 
	 * 
	 * @throws IOException
	 */
	@SuppressWarnings({ "deprecation", "resource" })
	public static void addFilesToClassPath() throws ClassPathException  {

		String etlJobs = getEtlJobsPath();
		String commonEtlJobs = getCommonEtlJobsPath();

		if (StringUtils.isNotBlank(etlJobs)) {
			File[] etlJarFiles = CommonUtils.getFiles(etlJobs, ".jar");
			File[] commonEtlJarFiles = CommonUtils.getFiles(commonEtlJobs, ".jar");
			URLClassLoader sysloader = null;
			if (etlJarFiles != null) {
				// get all files which are already in class path
				ClassLoader c = CommonUtils.class.getClassLoader();
				sysloader = (URLClassLoader) c;
				URL[] urls = ((URLClassLoader) sysloader).getURLs();
				List<String> filesInClasspath = new ArrayList<>();
				for (URL url : urls) {
					String formattedURL = url.getFile();
					if (formattedURL.indexOf('\\') != -1) {
						formattedURL = url.getFile().replaceAll("\\\\", "/");
					}
					filesInClasspath.add(formattedURL.substring(formattedURL.lastIndexOf('/') + 1));
				}
				for (File etlJarFile : commonEtlJarFiles) {
					String formattedURL = etlJarFile.getAbsolutePath();
					if (formattedURL.indexOf('\\') != -1) {
						formattedURL = formattedURL.replaceAll("\\\\", "/");
					}

					if (!filesInClasspath.contains(formattedURL.substring(formattedURL.lastIndexOf('/') + 1))) {
						try {
							addFileToClassPath(etlJarFile.toURL());
						} catch (MalformedURLException | ClassPathException e) {
							throw new ClassPathException("Unable to add jobs to claa path", e);
						}
					}
				}
				for (File etlJarFile : etlJarFiles) {
					String formattedURL = etlJarFile.getAbsolutePath();
					if (formattedURL.indexOf('\\') != -1) {
						formattedURL = formattedURL.replaceAll("\\\\", "/");
					}

					if (!filesInClasspath.contains(formattedURL.substring(formattedURL.lastIndexOf('/') + 1))) {
						try {
							addFileToClassPath(etlJarFile.toURL());
						} catch (MalformedURLException e) {
							throw new ClassPathException("Unable to add jobs to claa path", e);
						}
					}
				}

			}

		}
	}

	/**
	 * get column headers by query or stored procedure
	 * 
	 * @param ilConnectionMapping
	 * @return
	 */
	public static List<String> getColumnHeadersByQuery(ILConnectionMapping ilConnectionMapping)
			throws InstantiationException, IllegalAccessException, ClassNotFoundException, SQLException {
		Connection conn = null;
		List<String> columnHeaders = new ArrayList<>();
		try {
			conn = connectDatabase(ilConnectionMapping.getiLConnection());
			Statement stmt = null;
			CallableStatement cstmt = null;
			if (conn != null) {
				String typeOfCommand = ilConnectionMapping.getTypeOfCommand();
				ResultSet res = null;
				boolean isQuery = ("Query".equals(typeOfCommand));
				if (isQuery) {
					String query = ilConnectionMapping.getiLquery();
					stmt = conn.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
					res = stmt.executeQuery(query);
				} else {

					String procName = ilConnectionMapping.getiLquery();
					String procParams = ilConnectionMapping.getProcedureParameters();

					List<Map<String, String>> paramList = new ArrayList<>();

					if (StringUtils.isNotEmpty(procParams)) {
						String[] params = procParams.split("\\^");

						if (params.length > 0) {
							for (String param : params) {
								String[] p = param.split("=");

								if (p.length == 2) {
									Map<String, String> paramMap = new HashMap<>();
									paramMap.put("name", p[0]);
									paramMap.put("value", p[1]);
									paramList.add(paramMap);
								}
							}
						}
					}

					int noofparams = paramList.size();

					StringBuilder query = new StringBuilder();

					query.append("{call ").append(procName);

					if (noofparams > 0) {
						query.append("(");
						for (int i = 1; i <= noofparams; i++) {
							query.append("?");
							if (i < noofparams) {
								query.append(", ");
							}
						}
						query.append(")");
					}

					query.append("}");

					cstmt = conn.prepareCall(query.toString(), ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);

					if (noofparams > 0) {
						int index = 1;
						for (Map<String, String> paramMap : paramList) {
							cstmt.setObject(index++, paramMap.get("value"));
						}
					}

					res = cstmt.executeQuery();

				}
				// set table name as file name
				ResultSetMetaData rsMetaData = res.getMetaData();

				int columnCount = rsMetaData.getColumnCount();

				for (int i = 1; i <= columnCount; i++) {
					String columnHeader = res.getMetaData().getColumnLabel(i);
					columnHeaders.add(columnHeader.replaceAll("\\s+", "_").replaceAll("\\W+", "_"));

				}

			}
		} finally {
			try {
				if (conn != null) {
					conn.close();
				}
			} catch (SQLException e) {
				LOGGER.error("", e);
			}
		}

		return columnHeaders;
	}

	public static String currentDateTime() {

		LocalDateTime currentTime = LocalDateTime.now();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
		String cTime = currentTime.format(formatter);

		return cTime;
	}
	
	public static String currentDateTime(String timeZoneString) {
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		TimeZone timeZone = (timeZoneString == null || timeZoneString.isEmpty()) ? TimeZone.getDefault() : TimeZone.getTimeZone(timeZoneString);
		formatter.setTimeZone(timeZone);

		return formatter.format(new Date());
	}
	
	

	public static String[] convertToContextParamsArray(Map<String, String> params) {
		if (params == null || params.size() == 0)
			return new String[0];

		String[] parameters = new String[params.size()];

		Set<Map.Entry<String, String>> set = params.entrySet();

		int index = 0;
		for (Map.Entry<String, String> entry : set) {
			String param = "--context_param " + entry.getKey() + "=" + entry.getValue();
			parameters[index] = param;
			index++;
		}

		return parameters;
	}

	public static String getETLFolderPath(String fileType) {
		String path = null;

		if (StringUtils.isNotBlank(fileType)) {

			if (fileType.equals(Constants.FileType.JAR)) {
				path = getEtlJobsPath();
			} else if (fileType.equals(Constants.FileType.TEXT)) {
				path = getTableScriptsPath();
			} else if (fileType.equals(Constants.FileType.CSV)) {
				path = getILCsvTemplatePath();
			} else if (fileType.equals(Constants.FileType.XLS)) {
				path = getILExcelTemplatePath();
			} else if (fileType.equals(Constants.FileType.XLSX)) {
				path = getILExcelTemplatePath();
			} else {
				path = getEtlJobsPath();
			}

		}
		return path;
	}

	public static String getXRefETLFolderPath(String fileType) {
		String path = null;

		if (StringUtils.isNotBlank(fileType)) {

			if (fileType.equals(Constants.FileType.JAR)) {
				path = getEtlJobsPath();
			} else if (fileType.equals(Constants.FileType.TEXT)) {
				path = getTableScriptsPath();
			} else if (fileType.equals(Constants.FileType.CSV)) {
				path = getXRefILCsvTemplatePath();
			} else if (fileType.equals(Constants.FileType.XLS)) {
				path = getXRefILExcelTemplatePath();
			} else if (fileType.equals(Constants.FileType.XLSX)) {
				path = getXRefILExcelTemplatePath();
			} else {
				path = getEtlJobsPath();
			}

		}
		return path;
	}

	public static void sendFIleToStream(String filePath, HttpServletRequest request, HttpServletResponse response) throws IOException {

		ServletContext context = request.getServletContext();
		File downloadFile = new File(filePath);
		FileInputStream inputStream = new FileInputStream(downloadFile);

		// get MIME type of the file
		String mimeType = context.getMimeType(filePath);
		if (mimeType == null) {
			// set to binary type if MIME mapping not found
			mimeType = "application/octet-stream";
		}
		System.out.println("MIME type: " + mimeType);

		// set content attributes for the response
		response.setContentType(mimeType);
		response.setContentLength((int) downloadFile.length());

		// set headers for the response
		String headerKey = "Content-Disposition";
		String headerValue = String.format("inline; filename=\"%s\"", downloadFile.getName());
		response.setHeader(headerKey, headerValue);

		// get output stream of the response
		OutputStream outStream = response.getOutputStream();

		byte[] buffer = new byte[Constants.Config.BUFFER_SIZE];
		int bytesRead = -1;

		// write bytes read from the input stream into the output stream
		while ((bytesRead = inputStream.read(buffer)) != -1) {
			outStream.write(buffer, 0, bytesRead);
		}

		inputStream.close();
		outStream.close();
	}

	@SuppressWarnings("unchecked")
	public static String createCsvFile(WebService webService, @SuppressWarnings("rawtypes") Map restApiResponse) throws Exception {
		Map<String, List<Map<String, String>>> restResponse = (Map<String, List<Map<String, String>>>) restApiResponse;
		String newfilename = webService.getApiName().replaceAll("\\s+", "_") + "_" + CommonUtils.generateUniqueIdWithTimestamp();
		FileWriterWithEncoding fw = null;
		String filePath = null;
		try {

			String fileDir = CommonUtils.createDir(Constants.Temp.getTempFileDir() + "fileMappingWithIL/");
			filePath = fileDir + newfilename + ".csv";
			fw = new FileWriterWithEncoding(filePath, Constants.Config.ENCODING_TYPE);
			List<Map<String, String>> columns = restResponse.get("columns");
			List<Map<String, String>> results = restResponse.get("results");

			int columnCount = columns.size();
			fw.append("SNO,");
			for (int i = 0; i < columnCount; i++) {
				Map<String, String> column = columns.get(i);
				fw.append(column.get("name"));
				if (column.get("name").equals("Shipment_Date____Month_")) {
					fw.append(",Shipment_Date");
				}
				if (i < columnCount - 1)
					fw.append(",");

			}
			fw.append(System.getProperty("line.separator"));
			int rowCount = results.size();
			for (int r = 0; r < rowCount; r++) {

				Map<String, String> rowData = results.get(r);
				fw.append((r + 1) + ",");
				for (int i = 0; i < columnCount; i++) {
					Map<String, String> column = columns.get(i);
					Object rawData = rowData.get(column.get("name"));

					if (rawData != null) {
						String data = rawData.toString();
						if (column.get("name").equals("Total_Items")) {
							Double totalItems = Double.parseDouble(data);
							data = "" + totalItems.intValue();
						}
						fw.append(sanitizeForCsv(data));

						if (column.get("name").equals("Shipment_Date____Month_")) {
							fw.append("," + CommonUtils.convertMonthToDate("2016", data, "01", "-"));
						}
					}

					if (i < columnCount - 1)
						fw.append(",");

				}
				fw.append(System.getProperty("line.separator"));
			}

		} catch (Exception e) {
			LOGGER.error("", e);
		} finally {
			if (fw != null) {
				fw.flush();
				fw.close();
			}
		}
		return filePath;
	}

	public static String convertMonthToDate(String staticYear, String month, String staticDay, String sepearator) {

		if (StringUtils.isNotBlank(month) && StringUtils.isNotEmpty(month)) {
			if (month.length() == 1) {
				month = "0" + month;
			}
			return staticYear + sepearator + month + sepearator + staticDay;
		}

		return null;
	}

	public static void deleteFilesFromDirWithMatching(String dir, String match) {

		if (StringUtils.isNotBlank(dir) && StringUtils.isNotBlank(match)) {
			System.out.println("deleting Job files...");
			File fileDir = new File(dir);
			File[] files = fileDir.listFiles(new FilenameFilter() {

				@Override
				public boolean accept(File fileDir, String name) {
					return name.matches(match);
				}
			});

			if ( files != null ) {
				for (final File file : files) {
					if (!file.delete()) {
						System.err.println("Can't remove " + file.getAbsolutePath());
					}
				}
			}
			

		}

	}

	public static List<LinkedHashMap<String, Object>> getResultsFromApiResponse(List<LinkedHashMap<String, Object>> flatJson) {

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
					if (value != null && value.toString().contains("/Date(")) {
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

	public static File getCsvFromXLS(File excelFile) throws CSVConversionException {
		LOGGER.debug("writing xls into csv started..." + CommonDateHelper.formatDateAsString(new Date()));
		File tempFile = excelFile;
		String excelFilePath = tempFile.getAbsolutePath();
		String fileName = StringUtils.substring(tempFile.getName(), 0, StringUtils.ordinalIndexOf(tempFile.getName(), ".", 1));
		System.out.println("excelFilePath " + excelFilePath);
		FileWriterWithEncoding fw = null;
		InputStream excelFileToRead = null;
		File newCsvFileName = null;
		HSSFWorkbook wb = null;

		try {
			excelFileToRead = new FileInputStream(excelFilePath);
			wb = new HSSFWorkbook(excelFileToRead);
			// keep this in below for loop instead of '1' to iterate though
			// multiple sheets.
			for (int j = 0; j < 1; j++) {
				Sheet sheet = wb.getSheetAt(0);
				String sheetName = sheet.getSheetName();
				String dirPath = CommonUtils.createDir(Constants.Temp.TEMP_FILE_DIR + com.datamodel.anvizent.helper.Constants.Config.CSV_FROM_EXCEL);
				String timestamp = CommonDateHelper.formatDateAsTimeStamp(new Date());
				newCsvFileName = new File(dirPath + "/" + fileName + "_" + sheetName + "_" + timestamp + ".csv");
				fw = new FileWriterWithEncoding(newCsvFileName, Constants.Config.ENCODING_TYPE);

				Iterator<Row> rows = sheet.rowIterator();
				ParseExcel parseExcel = new ParseExcel(excelFilePath);
				List<String> columns = parseExcel.getHeadersFromFile(excelFilePath);
				int colslen = columns.size();

				for (int i = 0; i < colslen; i++) {
					fw.append(columns.get(i));

					if (i < colslen)
						fw.append(",");

				}
				fw.append(System.getProperty("line.separator"));

				while (rows.hasNext()) {
					Row row = (Row) rows.next();
					int getRowNumb = row.getRowNum();
					if (getRowNumb == 0) {
						// just skip the rows if row number is 0
						continue;
					}
					String value = null;
					for (int i = 0; i < colslen; i++) {
						Cell cell = row.getCell(i);
						if (cell != null) {
							Cell formattedCell = formatExcelCellData(cell);
							value = String.valueOf(formattedCell);
						} else {
							value = "";
						}

						if (value != null) {
							fw.append(sanitizeForCsv(value));
						}
						if (i < colslen)
							fw.append(",");

					}
					fw.append(System.getProperty("line.separator"));
				}
			}

		}  catch (EncryptedDocumentException | InvalidFormatException e) {
			throw new CSVConversionException("Invalid column format found", e);
		} catch(IOException e) {
			throw new CSVConversionException("File Access exception" +e.getMessage(), e);
		} finally {
			try {
				if (fw != null) {
					fw.flush();
					fw.close();
				}
				if (excelFileToRead != null) {
					excelFileToRead.close();
				}
				if (wb != null) {
					wb.close();
				}
			} catch (IOException e) {
				LOGGER.error("", e);
			}

		}
		LOGGER.debug("writing xls into csv completed..." + CommonDateHelper.formatDateAsString(new Date()));
		return newCsvFileName;
	}

	@SuppressWarnings("deprecation")
	public static File getCsvFromXLSX(File excelFile) throws CSVConversionException {
		LOGGER.debug("writing xlsx into csv started..." + CommonDateHelper.formatDateAsString(new Date()));
		File tempFile = excelFile;
		String excelFilePath = tempFile.getAbsolutePath();
		String fileName = StringUtils.substring(tempFile.getName(), 0, StringUtils.ordinalIndexOf(tempFile.getName(), ".", 1));
		System.out.println("excelFilePath " + excelFilePath);
		FileWriterWithEncoding fw = null;
		InputStream excelFileToRead = null;
		File newCsvFileName = null;
		Workbook wb = null;

		try {
			excelFileToRead = new FileInputStream(excelFilePath);
			wb = StreamingReader.builder().rowCacheSize(1000).bufferSize(4096).open(excelFile);
			for (int j = 0; j < 1; j++) {
				Sheet sheet = wb.getSheetAt(0);
				String sheetName = sheet.getSheetName();
				String dirPath = CommonUtils.createDir(Constants.Temp.TEMP_FILE_DIR + com.datamodel.anvizent.helper.Constants.Config.CSV_FROM_EXCEL);
				String timestamp = CommonDateHelper.formatDateAsTimeStamp(new Date());
				newCsvFileName = new File(dirPath + "/" + fileName + "_" + sheetName + "_" + timestamp + ".csv");
				fw = new FileWriterWithEncoding(newCsvFileName, Constants.Config.ENCODING_TYPE);
				Iterator<Row> rows = sheet.rowIterator();
				ParseExcel parseExcel = new ParseExcel(excelFilePath);
				List<String> columns = parseExcel.getHeadersFromXLSXFile(excelFilePath);
				int colslen = columns.size();

				for (int i = 0; i < colslen; i++) {
					fw.append(columns.get(i));

					if (i < colslen)
						fw.append(",");

				}
				fw.append(System.getProperty("line.separator"));

				while (rows.hasNext()) {
					Row row = (Row) rows.next();
					int getRowNumb = row.getRowNum();
					if (getRowNumb == 0) {
						// just skip the rows if row number is 0
						continue;
					}
					String value = null;
					for (int i = 0; i < colslen; i++) {
						Cell cell = row.getCell(i);
						if (cell != null) {
							if (cell.getCellType() == Cell.CELL_TYPE_STRING) {
								value = cell.getStringCellValue();
							} else if (cell.getCellType() == Cell.CELL_TYPE_BOOLEAN) {
								value = String.valueOf(cell.getBooleanCellValue());
							} else if (cell.getCellType() == Cell.CELL_TYPE_NUMERIC) {

								if (DateUtil.isCellDateFormatted(cell)) {
									value = String.valueOf(cell.getDateCellValue());
								} else {
									DecimalFormat dFormat = new DecimalFormat("#.######");

									String changeValue = dFormat.format(cell.getNumericCellValue());
									value = String.valueOf(changeValue);
								}
							}

						} else {
							value = "";
						}

						if (value != null) {
							fw.append(sanitizeForCsv(value));
						}
						if (i < colslen)
							fw.append(",");

					}
					fw.append(System.getProperty("line.separator"));
				}
			}

		} catch(IOException e) {
			throw new CSVConversionException("File Access exception" +e.getMessage(), e);
		}  finally {
			try {
				if (fw != null) {
					fw.flush();
					fw.close();
				}
				if (excelFileToRead != null) {
					excelFileToRead.close();
				}
				if (wb != null) {
					wb.close();
				}
			} catch (IOException e) {
				LOGGER.error("", e);
			}

		}
		LOGGER.debug("writing xlsx into csv completed..." + CommonDateHelper.formatDateAsString(new Date()));
		return newCsvFileName;
	}

	@SuppressWarnings("deprecation")
	public static Cell formatExcelCellData(Cell cell) {
		if (cell != null) {
			switch (cell.getCellType()) {
				case Cell.CELL_TYPE_STRING:
					String s = cell.getStringCellValue();
					if (s.matches("^[0-9]*\\.?[0]$")) {
						String s2 = s.replace(".0", "");
						cell.setCellValue(s2);
					}

					break;
				case Cell.CELL_TYPE_NUMERIC:
					double numericCellValue = cell.getNumericCellValue();
					String numStr = String.valueOf(numericCellValue);
					if (DateUtil.isCellDateFormatted(cell)) {
						Date date = cell.getDateCellValue();
						String formattedCellValue = CommonDateHelper.formatDateAsString(date);
						cell.setCellValue(formattedCellValue);
					} else if (numStr.matches("^[0-9]*\\.?[0]$")) {
						String s2 = numStr.replace(".0", "");
						cell.setCellValue(s2);
					}

					break;
				case Cell.CELL_TYPE_BOOLEAN:
					break;
				default:
					break;
			}
		}

		return cell;
	}

	public static ErrorLog createErrorLog(Throwable ex, HttpServletRequest request) {
		ErrorLog errorLog = new ErrorLog();
		StringBuilder receivedVariables = new StringBuilder();
		StringBuilder clientInformation = new StringBuilder();
		String userId = "0";
		if (request != null) {

			@SuppressWarnings("unchecked")
			Map<String, Object> pathVariables = (Map<String, Object>) request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
			receivedVariables.append("PathVariables : ").append(pathVariables.toString());
			receivedVariables.append("\nRequestParams : ").append(formatReceivedParams(request.getParameterMap()));
			clientInformation.append(request.getHeader(Constants.Config.BROWSER_DETAILS));
			userId = (String) pathVariables.get("clientId");
		}

		StringWriter errorBody = new StringWriter();
		ex.printStackTrace(new PrintWriter(errorBody));

		String errorCode = ex.getLocalizedMessage();
		/*
		 * to handle Null pointer cases; error code will be empty for
		 * NullpointerException
		 */
		if (StringUtils.isBlank(errorCode)) {
			try {
				if (errorBody.toString().contains(";") && errorBody.toString().length() < 500) {
					errorCode = errorBody.toString().substring(0, errorBody.toString().indexOf(";"));
				} else {
					errorCode = errorBody.toString().substring(0, errorBody.toString().indexOf("\n"));
				}
			} catch (Exception e) {
			}
		}
		errorLog.setErrorCode(errorCode);
		errorLog.setErrorBody(errorBody.toString());
		errorLog.setReceivedParameters(receivedVariables.toString());
		errorLog.setUserId(userId);
		errorLog.setClientDetails(clientInformation.toString());

		return errorLog;
	}

	public static String formatReceivedParams(Map<String, String[]> maps) {
		if (maps == null)
			return "";

		StringBuilder paramsMapping = new StringBuilder();
		try {
			String separator = ",";
			maps.forEach((key, value) -> {
				paramsMapping.append(key).append(" = {");
				for (String val : value) {
					paramsMapping.append(val).append(separator);
				}
				paramsMapping.append(" }, ");
			});

		} catch (Exception e) {
			LOGGER.error("", e);
		}

		return paramsMapping.toString();
	}

	public static void closeDataSource(JdbcTemplate clientJdbcTemplate) {
		if (clientJdbcTemplate != null && clientJdbcTemplate.getDataSource() != null && clientJdbcTemplate.getDataSource() instanceof BasicDataSource) {
			try {
				((BasicDataSource) clientJdbcTemplate.getDataSource()).close();
			} catch (Exception e) {
				LOGGER.error("", e);
			}
		}
	}
	public static void closeConnection(Connection con) throws SQLException {
		if (con != null && !con.isClosed()) {
			con.close();
		}
	}

	public static String writeScriptFile(String tableScript) {
		String folderPath = null;
		String filePath = null;
		FileWriterWithEncoding fw = null;
		try {
			folderPath = com.datamodel.anvizent.helper.Constants.Temp.getTempFileDirForTableScripts();
			filePath = folderPath + generateUniqueIdWithTimestamp() + ".sql";
			CommonUtils.createDir(folderPath);
			fw = new FileWriterWithEncoding(filePath, Constants.Config.ENCODING_TYPE);
			fw.write(tableScript);
		} catch (Exception e) {
			filePath = null;
			System.out.println(e.getLocalizedMessage());

		} finally {
			try {
				if (fw != null) {
					fw.flush();
					fw.close();
				}
			} catch (IOException e) {
				LOGGER.error("", e);
			}
		}

		return filePath;
	}
	
	public static String writeScriptFile(List<String> tableScript) {
		String folderPath = null;
		String filePath = null;
		FileWriterWithEncoding fw = null;
		try {
			folderPath = com.datamodel.anvizent.helper.Constants.Temp.getTempFileDirForTableScripts();
			filePath = folderPath + generateUniqueIdWithTimestamp() + ".sql";
			CommonUtils.createDir(folderPath);
			fw = new FileWriterWithEncoding(filePath, Constants.Config.ENCODING_TYPE);
			fw.write(String.join(";\n", tableScript));
		} catch (Exception e) {
			filePath = null;
			System.out.println(e.getLocalizedMessage());

		} finally {
			try {
				if (fw != null) {
					fw.flush();
					fw.close();
				}
			} catch (IOException e) {
				LOGGER.error("", e);
			}
		}

		return filePath;
	}

	public static Map<String, String> mappedWebserviceHeaders(String mappedHeadersForWebservice) {
		Map<String, String> mappedWebserviceHeaders = new HashMap<String, String>();
		String[] webserviceHeaders = StringUtils.split(mappedHeadersForWebservice, "||");
		for (int i = 0; i < webserviceHeaders.length; i++) {
			String s = webserviceHeaders[i];
			String[] iLApiHeaders = s.split("=");
			String iL_Header = iLApiHeaders[0];
			String api_header = iLApiHeaders[1];
			mappedWebserviceHeaders.put(iL_Header, api_header);
		}
		return mappedWebserviceHeaders;
	}

	public static String getFilePathForWebServiceApi(WebService webService, List<LinkedHashMap<String, Object>> finalformattedApiResponse) {

		WebServiceCSVWriter writer = new WebServiceCSVWriter();

		String fileDir = createDir(Constants.Temp.getTempFileDir() + "fileMappingWithIL/");
		String newfilename = webService.getApiName().replaceAll("\\s+", "_") + "_" + generateUniqueIdWithTimestamp();
		String filePath = fileDir + newfilename + ".csv";

		if (finalformattedApiResponse != null && filePath != null) {
			try {
				writer.writeAsCSV(finalformattedApiResponse, filePath);
			} catch (FileNotFoundException e) {
				LOGGER.error("", e);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				LOGGER.error("", e);
			}
		}
		return filePath;
	}

	public static String getFilePathForWsApi(WebServiceApi webServiceApi, List<LinkedHashMap<String, Object>> finalformattedApiResponse, String csvSavePath) {

		WebServiceCSVWriter writer = new WebServiceCSVWriter();
		if ( StringUtils.isBlank(csvSavePath) ) {
			csvSavePath = Constants.Temp.getTempFileDir();
		}
		String fileDir = createDir(csvSavePath + "fileMappingWithIL/");
		String newfilename = webServiceApi.getApiName().replaceAll("\\s+", "_") + "_" + generateUniqueIdWithTimestamp();
		String filePath = fileDir + newfilename + ".csv";

		if (finalformattedApiResponse != null && filePath != null) {
			try {
				writer.writeAsCSV(finalformattedApiResponse, filePath);
			} catch (FileNotFoundException e) {
				LOGGER.error("", e);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				LOGGER.error("", e);
			}
		}
		return filePath;
	}

	public static ILConnectionMapping getIlConnection(JdbcTemplate clientstagingJdbcTemplate, ILConnectionMapping ilConnectionMappingInfo,
			String clientSchemaStaging) {

		ILConnectionMapping ilConnectionMappings = new ILConnectionMapping();

		ILConnection ilConnections = new ILConnection();

		BasicDataSource basicDataSource = (BasicDataSource) clientstagingJdbcTemplate.getDataSource();

		String databaseInfo1[] = StringUtils.substringBetween(basicDataSource.getUrl(), "//", "/").split(":");
		String databaseHost1 = databaseInfo1[0];
		String databasePort1 = databaseInfo1[1];
		ilConnectionMappings.setiLquery(ilConnectionMappingInfo.getiLquery());
		ilConnections.setUsername(basicDataSource.getUsername());
		ilConnections.setPassword(basicDataSource.getPassword());
		ilConnections.setServer(databaseHost1 + ":" + databasePort1 + "/" + clientSchemaStaging);

		Database db = new Database();

		db.setId(com.anvizent.minidw.client.jdbc.utils.Constants.Database.MYSQL);
		db.setConnector_id(com.anvizent.minidw.client.jdbc.utils.Constants.Database.MYSQL);
		ilConnections.setDatabase(db);
		ilConnectionMappings.setTypeOfCommand(com.datamodel.anvizent.helper.Constants.QueryType.QUERY);
		ilConnectionMappings.setiLConnection(ilConnections);

		return ilConnectionMappings;
	}
	

	public static ILConnectionMapping getIlConnection(Map<String, Object> databaseDetails, ILConnectionMapping ilConnectionMappingInfo, boolean isStaging) {

		ILConnectionMapping ilConnectionMappings = new ILConnectionMapping();

		ILConnection ilConnections = new ILConnection();

		String databaseHost1 = databaseDetails.get("region_hostname").toString();
		String databasePort1 = databaseDetails.get("region_port").toString();
		ilConnectionMappings.setiLquery(ilConnectionMappingInfo.getiLquery());
		ilConnections.setUsername(databaseDetails.get("clientdb_username").toString());
		ilConnections.setPassword(databaseDetails.get("clientdb_password").toString());
		ilConnections.setServer(databaseHost1 + ":" + databasePort1 + "/" + (isStaging ? databaseDetails.get("clientdb_staging_schema").toString():databaseDetails.get("clientdb_schema").toString()));
		Database db = new Database();
		db.setId(com.anvizent.minidw.client.jdbc.utils.Constants.Database.MYSQL);
		db.setConnector_id(com.anvizent.minidw.client.jdbc.utils.Constants.Database.MYSQL);
		db.setProtocal(com.anvizent.minidw.client.jdbc.utils.Constants.DataBaseDriverURL.MYSQL_DB_URL);
		db.setDriverName(com.anvizent.minidw.client.jdbc.utils.Constants.DataBaseDrivers.MYSQL_DRIVER_CLASS);
		ilConnections.setDatabase(db);
		ilConnectionMappings.setTypeOfCommand(com.datamodel.anvizent.helper.Constants.QueryType.QUERY);
		ilConnectionMappings.setiLConnection(ilConnections);

		return ilConnectionMappings;
	}
	


	public static void deleteWebServiceIlConnectionMapping(User user, String clientId, String clientSchemaStaging, JdbcTemplate clientJdbcTemplate,
			WebService webService, PackageDao packageDao, FileDao fileDao, Modification modification) {

		List<Table> tables = fileDao.getCustomTempTablesForWebservice(clientId, String.valueOf(webService.getPackageId()), webService.getIlId(),clientJdbcTemplate);

		for (Table deleteTable : tables) {

			packageDao.dropTable(clientSchemaStaging, deleteTable.getTableName(), clientJdbcTemplate);

			File tempFileForDelete = new File(deleteTable.getFilePath());
			if (tempFileForDelete != null) {
				tempFileForDelete.delete();
			}

			FileInfo fileInfo = new FileInfo();
			fileInfo.setPackageId(webService.getPackageId());
			fileInfo.setClientid(clientId);

			fileDao.deletefileHeader(fileInfo, deleteTable, modification, webService, clientJdbcTemplate);
			fileDao.deleteIlConnectionWebServiceMapping(fileInfo, deleteTable, modification, webService, clientJdbcTemplate);

		}
	}

	public static void saveIlConnectionWebServiceMapping(String filePath, List<String> originalFileheaders, String clientId,JdbcTemplate clientStagingJdbcTemplate,
			JdbcTemplate clientAppDbJdbcTemplate, WebService webService, PackageDao packageDao, FileDao fileDao, Modification modification) throws Exception {

		ILConnectionMapping ilConnectionMapping = new ILConnectionMapping();

		try {

			ilConnectionMapping.setFilePath(filePath);
			ilConnectionMapping.setDelimeter(",");
			ilConnectionMapping.setFileType(Constants.FileType.CSV);

			ClientData clientData = new ClientData();

			StringBuilder fileHeaders = new StringBuilder();

			int index = 1, colslen = originalFileheaders.size();

			for (String column : originalFileheaders) {
				fileHeaders.append(column.replaceAll("\\s+", "_"));
				if (index < colslen)
					if (ilConnectionMapping.getFileType().equals(Constants.FileType.CSV)) {
						fileHeaders.append(",");
					} else if (ilConnectionMapping.getFileType().equals(Constants.FileType.XLS)) {
						fileHeaders.append(",");
					} else if (ilConnectionMapping.getFileType().equals(Constants.FileType.XLSX)) {
						fileHeaders.append(",");
					}

				index++;
			}

			FileInfo fileInfo = new FileInfo();
			fileInfo.setFileHeaders(fileHeaders.toString());
			fileInfo.setDelimeter(ilConnectionMapping.getDelimeter());
			fileInfo.setFileType(ilConnectionMapping.getFileType());
			fileInfo.setPackageId(webService.getPackageId());
			fileInfo.setClientid(clientId);
			fileInfo.setFilePath(ilConnectionMapping.getFilePath());
			fileInfo.setIsFirstRowHasColumnNames(false);
			fileInfo.setModification(modification);

			fileDao.insertFileColumnDetails(fileInfo, clientAppDbJdbcTemplate);

			Table table = processTempTableForFile(fileInfo);
			table.setOriginalColumnNames(originalFileheaders);

			clientData.setUserPackage(new Package());
			clientData.getUserPackage().setTable(table);
			Package userPackage = packageDao.getPackageById(webService.getPackageId(), clientId, clientAppDbJdbcTemplate);
			clientData.getUserPackage().setPackageId(webService.getPackageId());
			clientData.getUserPackage().setPackageName(userPackage.getPackageName());

			String tableStructure = null;
			try {
				tableStructure = packageDao.createTargetTable(clientData, clientStagingJdbcTemplate);
			} catch (Exception e) {
				throw new Exception(e.getMessage());
			}
			table.setTableStructure(tableStructure);

			fileDao.insertIlConnectionWebServiceMapping(fileInfo, table, modification, webService, clientAppDbJdbcTemplate);
		} catch (Exception e) {
			throw new Exception(e.getMessage());
		}
	}

	public static Table getTempTableAndColumns(Table table, String clientSchemaStaging, ClientData clientData,
			String clientId, List<Column> columns,
			JdbcTemplate clientstagingJdbcTemplate) {
		table.setSchemaName(clientSchemaStaging);
		List<String> originaCols = new ArrayList<String>();
		for (Column col : columns) {
			originaCols.add(col.getColumnName());
			table.setOriginalColumnNames(originaCols);
		}
		table.setColumns(columns);
		return table;
	}

	public static boolean isValid(String str) {
		return (str != null && str.trim().length() > 0);
	}

	public static List<Map<String, Object>> getListOfEtlJars() {
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss:SS");
		List<Map<String, Object>> listFileInfo = new ArrayList<>();
		String etlJobs = getEtlJobsPath();
		if (StringUtils.isNotBlank(etlJobs)) {
			File[] etlJarFiles = CommonUtils.getFiles(etlJobs, ".jar");
			for (File etlJarFile : etlJarFiles) {
				Map<String, Object> fileInfoMap = new LinkedHashMap<>();
				fileInfoMap.put("fileName", etlJarFile.getName());
				fileInfoMap.put("fileSize", FileUtils.byteCountToDisplaySize(etlJarFile.length()));
				fileInfoMap.put("lastModified", sdf.format(new Date(etlJarFile.lastModified())));
				listFileInfo.add(fileInfoMap);
			}
		}
		String commonEtlJobs = getCommonEtlJobsPath();
		if (StringUtils.isNotBlank(commonEtlJobs)) {
			File[] etlJarFiles = CommonUtils.getFiles(commonEtlJobs, ".jar");
			for (File etlJarFile : etlJarFiles) {
				Map<String, Object> fileInfoMap = new LinkedHashMap<>();
				fileInfoMap.put("fileName", etlJarFile.getName());
				fileInfoMap.put("fileSize", FileUtils.byteCountToDisplaySize(etlJarFile.length()));
				fileInfoMap.put("lastModified", sdf.format(new Date(etlJarFile.lastModified())));
				listFileInfo.add(fileInfoMap);
			}
		}
		return listFileInfo;
	}

	public static Table tempTableForming(List<String> headers) {

		try {
			 
			Table table = new Table();

			StringBuilder tableName = new StringBuilder("anv_temp_");
			tableName.append(0).append("_").append(CommonUtils.generateUniqueIdWithTimestamp());

			LOGGER.debug("temp table name : " + tableName);

			table.setTableName(tableName.toString());

			List<Column> columns = new ArrayList<>();
			table.setColumns(columns);
			Column column = null;

			if ( headers == null) {
				throw new Exception();
			}

			for (String header : headers) {
				column = new Column();

				column.setColumnName(header);
				column.setColumnSize(null);
				column.setDataType("TEXT");
				column.setDefaultValue("");
				column.setIsAutoIncrement(false);
				column.setIsNotNull(false);
				column.setIsPrimaryKey(false);
				column.setIsUnique(false);

				columns.add(column);
			}

			return table;
		} catch (Exception e) {
			LOGGER.error("Error while creating file object from file columns ", e);
		}

		return null;
	}
	
	public static Table processTempTableForFile(FileInfo fileInfo) {

		try {
			String fileHeaders = fileInfo.getFileHeaders();

			if (StringUtils.isEmpty(fileHeaders)) {
				return null;
			}

			Table table = new Table();
			Integer packageId = fileInfo.getPackageId() == null ? 0 : fileInfo.getPackageId();

			StringBuilder tableName = new StringBuilder("anv_temp_");
			tableName.append(packageId).append("_").append(CommonUtils.generateUniqueIdWithTimestamp());

			LOGGER.debug("temp table name : " + tableName);

			table.setTableName(tableName.toString());

			List<Column> columns = new ArrayList<>();
			table.setColumns(columns);
			Column column = null;

			String[] headers = null;

			if (fileInfo.getFileType().equals(Constants.FileType.CSV)) {
				headers = fileHeaders.split(fileInfo.getDelimeter());
			} else if (fileInfo.getFileType().equals(Constants.FileType.XLS)) {
				headers = fileHeaders.split(",");
			} else if (fileInfo.getFileType().equals(Constants.FileType.XLSX)) {
				headers = fileHeaders.split(",");
			}
			if ( headers == null) {
				throw new Exception();
			}

			for (String header : headers) {
				column = new Column();

				column.setColumnName(header);
				column.setColumnSize(null);
				column.setDataType("TEXT");
				column.setDefaultValue("");
				column.setIsAutoIncrement(false);
				column.setIsNotNull(false);
				column.setIsPrimaryKey(false);
				column.setIsUnique(false);

				columns.add(column);
			}

			return table;
		} catch (Exception e) {
			LOGGER.error("Error while creating file object from file columns ", e);
		}

		return null;
	}

	public static String getNewMinidwVersionPath() {
		return getEtlJobsPath() + "/NEW_MINIDW_VERSION";
	}

	public static boolean downloadNewMinidwVersion() {
		boolean isDownloaded = true;

		String downloadPath = "D:\\Minidw_Auto_Update_Assistant\\Downloaded";
		String newBuildPath = "file:///" + getNewMinidwVersionPath() + "/minidw.war";
		// "file://fsvn/projects/AnvizentDataModel/build/Minidwv2.1_Production_build/minidw.war";

		/*
		 * file:URL file://host/path file:///path - no hostname is present on
		 * the URL, URL refers to a file on local machine
		 * 
		 */
		FileInputStream fis = null;
		FileOutputStream fos = null;
		BufferedInputStream bis = null;

		File file = new File(downloadPath);
		if (!file.exists()) {
			file.mkdirs();
		}
		try {
			bis = new BufferedInputStream(new URL(newBuildPath).openStream());
			fos = new FileOutputStream(file.getAbsolutePath() + "\\minidw.war");
			byte[] buffer = new byte[1024];
			int len = 0;
			while ((len = bis.read(buffer)) > 0) {
				fos.write(buffer, 0, len);
			}

		} catch (FileNotFoundException e) {
			isDownloaded = false;
			LOGGER.error("Error while downloadNewMinidwVersion ", e);
		} catch (IOException e) {
			LOGGER.error("Error while downloadNewMinidwVersion ", e);
			isDownloaded = false;
		} finally {
			try {
				if (fis != null) {
					fis.close();
				}
				if (bis != null) {
					bis.close();
				}
				if (fos != null) {
					fos.close();
				}
			} catch (IOException e) {
				LOGGER.error("", e);
			}
		}
		return isDownloaded;
	}
	public static JdbcTemplate getClientJdbcTemplate(ILConnection iLConnection)
			throws SQLException, InstantiationException, IllegalAccessException, ClassNotFoundException {

		JdbcTemplate jdbcTemplate = new JdbcTemplate();

		String driver = null;
		String url = null;
		if (iLConnection != null) {
			
			if ( iLConnection.isWebApp() && !iLConnection.isAvailableInCloud() ) {
				throw new IllegalAccessException("Can't connect to local database.");
			}
			
			driver = iLConnection.getDatabase().getDriverName();
			url = iLConnection.getDatabase().getProtocal();;
			
			if (driver != null && url != null) {
				BasicDataSource dataSource = new BasicDataSource();
				dataSource.setDriverClassName(driver);
				dataSource.setUrl(url);
				dataSource.setInitialSize(1);
				try {
					if (StringUtils.isNotEmpty(iLConnection.getUsername()) && StringUtils.isNotEmpty(iLConnection.getPassword())) {
						dataSource.setUsername(iLConnection.getUsername());
						dataSource.setPassword(iLConnection.getPassword());
					} else if (StringUtils.isNotEmpty(iLConnection.getUsername())) {
						dataSource.setUsername(iLConnection.getUsername());
						dataSource.setPassword("");
					}

				} catch (Exception ex) {
					LOGGER.debug(ex.getMessage());
				}
				jdbcTemplate.setDataSource(dataSource);
			} else {
				throw new IllegalAccessException("JDBC Driver Name and URL should not be empty or Invalid database Type");
			}
		} else {
			throw new IllegalAccessException("JDBC Driver Name and URL should not be empty or Invalid database Type");
		}

		return jdbcTemplate;
	}
	
public static ILConnection getSourceIlConnection(ServerConfigurations serverConfigurations){
		
		ILConnection ilConnection = new ILConnection();
		Database database = new Database();
		database.setConnector_id(com.anvizent.minidw.client.jdbc.utils.Constants.Database.MYSQL);
		ilConnection.setServer(serverConfigurations.getIpAddress()+":"+serverConfigurations.getPortNumber()+"/"+serverConfigurations.getMinidwSchemaName());
		ilConnection.setUsername(serverConfigurations.getUserName());
		ilConnection.setPassword(serverConfigurations.getServerPassword());
		ilConnection.setDatabase(database);
		
		return ilConnection;
	}
	public static ILConnection getDestinationIlConnection(ServerConfigurations serverConfigurations){
		
		ILConnection ilConnection = new ILConnection();
		Database database = new Database();
		database.setConnector_id(com.anvizent.minidw.client.jdbc.utils.Constants.Database.MYSQL);
		ilConnection.setServer(serverConfigurations.getIpAddress()+":"+serverConfigurations.getPortNumber()+"/"+serverConfigurations.getMinidwSchemaName());
		ilConnection.setUsername(serverConfigurations.getUserName());
		ilConnection.setPassword(serverConfigurations.getServerPassword());
		ilConnection.setDatabase(database);
		
		return ilConnection;
	}
	 
	public static String createInsertSql(ResultSetMetaData resultSetMetaData,String tableName) throws SQLException
	{
	  StringBuffer insertSql = new StringBuffer("INSERT INTO ");
	  StringBuffer values = new StringBuffer(" VALUES (");

	  insertSql.append(tableName).append(" ( ");
	  
	  for (int i = 1; i <= resultSetMetaData.getColumnCount(); i++)
	  {
		   
		   if(!resultSetMetaData.isAutoIncrement(i)) {
			    insertSql.append(resultSetMetaData.getColumnName(i));
			    values.append("?");

			    if (i <= resultSetMetaData.getColumnCount())
			    {
			      insertSql.append(", ");
			      values.append(", ");
			    }  
		  }
	  }
      String insertColumns = insertSql.toString().substring(0, insertSql.length()-2);
      String insertIndexes = values.toString().substring(0, values.length()-2);
	   
	  return insertColumns+")" + insertIndexes +")";
	}
	public static void setParameters(PreparedStatement preparedStatement, ResultSet resultSet,TemplateMigration templateMigration) throws SQLException
	{
	  
	  for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++)
	  {
		// if(!resultSet.getMetaData().isAutoIncrement(i)) {
		 if(resultSet.getMetaData().getColumnName(i).equals("client_id")){
			 preparedStatement.setObject(i, templateMigration.getDestinationClientId());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_by")){
			 preparedStatement.setObject(i, "From Migration");
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_time")){
			 preparedStatement.setObject(i, templateMigration.getModification().getCreatedTime());
		 }else{
			 preparedStatement.setObject(i, resultSet.getObject(i));
		 }
		//}
	  }  
	}
	public static Map<String,Object> setPackageParameters(PreparedStatement preparedStatement, ResultSet resultSet,TemplateMigration templateMigration,boolean packExist) throws SQLException
	{
	  Map<String,Object> packageMap = new HashMap<>();
	  for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++)
	  {
		if(!resultSet.getMetaData().isAutoIncrement(i)) {
		 if(resultSet.getMetaData().getColumnName(i).equals("user_id")){
			 preparedStatement.setObject(i-1, templateMigration.getUserId());
			 packageMap.put("sourceUserId", resultSet.getObject(i));
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_by")){
			 preparedStatement.setObject(i-1, "From Migration");
		 }else if(resultSet.getMetaData().getColumnName(i).equals("isScheduled")){
			 preparedStatement.setObject(i-1, false);
		 }else if(resultSet.getMetaData().getColumnName(i).equals("schedule_status")){
			 preparedStatement.setObject(i-1, "Pending");
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_time")){
			 preparedStatement.setObject(i-1, templateMigration.getModification().getCreatedTime());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("isStandard")){
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
			 packageMap.put("isStandard", resultSet.getObject(i));
		 } else if(resultSet.getMetaData().getColumnName(i).equals("package_name")){
			 if(packExist){
				 preparedStatement.setObject(i-1, templateMigration.getPackageName());
			 }else{
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
			 }
			 packageMap.put("packName", resultSet.getString(i));
		 } 
		 else{ 
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		 }
		   
	  }  
	}
	  return packageMap;
   }
	

public static Map<String,Object> setIlConnectionParameters(PreparedStatement preparedStatement, ResultSet resultSet,TemplateMigration templateMigration,Map<Integer,Integer> ilConnectionMap,Map<Integer,Integer> wsConnectionMap) throws SQLException
	{
	  
	  Map<String,Object> ilMappingIdWsConIdDbConIdMap = new HashMap<>();
	  
	  for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++)
	  {
		if(!resultSet.getMetaData().isAutoIncrement(i)) {
			
		 if(resultSet.getMetaData().getColumnName(i).equals("userid")){
			 preparedStatement.setObject(i-1, templateMigration.getUserId());
		 }  else if(resultSet.getMetaData().getColumnName(i).equals("created_by")){
			 preparedStatement.setObject(i-1, "From Migration");
		 } else if(resultSet.getMetaData().getColumnName(i).equals("created_time")){
			 preparedStatement.setObject(i-1, templateMigration.getModification().getCreatedTime());
		 } else if(resultSet.getMetaData().getColumnName(i).equals("Package_id")){
			 preparedStatement.setObject(i-1, templateMigration.getPackageId());
		 }  else if(resultSet.getMetaData().getColumnName(i).equals("connection_id")){
			 ilMappingIdWsConIdDbConIdMap.put("ilConnectionId", resultSet.getObject(i));
			 if(ilConnectionMap != null){
			 if ( ilConnectionMap.containsKey(resultSet.getInt(i)) ) {
				 preparedStatement.setObject(i-1, ilConnectionMap.get(resultSet.getInt(i)));
				 ilMappingIdWsConIdDbConIdMap.put("destinationIlConnectionId", ilConnectionMap.get(resultSet.getInt(i)));
			 } else {
				 preparedStatement.setObject(i-1, resultSet.getObject(i));
			 }
			 }else{
				 preparedStatement.setObject(i-1, resultSet.getObject(i)); 
			 }
			 
		 } else if(resultSet.getMetaData().getColumnName(i).equals("webservice_Id")){
			 ilMappingIdWsConIdDbConIdMap.put("wsConnectionId", resultSet.getObject(i));
			 if(wsConnectionMap != null){
			 if ( wsConnectionMap.containsKey(resultSet.getInt(i)) ) {
				 preparedStatement.setObject(i-1, wsConnectionMap.get(resultSet.getInt(i)));
				 
			 } else {
				 preparedStatement.setObject(i-1, resultSet.getObject(i));
			 }
			 }else{
				 preparedStatement.setObject(i-1, resultSet.getObject(i));
			 }
		 }  else if(resultSet.getMetaData().getColumnName(i).equals("isWebService")){
			 ilMappingIdWsConIdDbConIdMap.put("isWebService", resultSet.getObject(i));	
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		} else if(resultSet.getMetaData().getColumnName(i).equals("is_join_web_service")){
			 ilMappingIdWsConIdDbConIdMap.put("isJoinWebService", resultSet.getObject(i));	
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		} else if(resultSet.getMetaData().getColumnName(i).equals("isFlatFile")){
			 ilMappingIdWsConIdDbConIdMap.put("isFlatFile", resultSet.getObject(i));	
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		} 
		 else{ 
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		 }
		   
	  } else{
		  ilMappingIdWsConIdDbConIdMap.put("ilMappingId", resultSet.getObject(i));
	  }
	}
	 return ilMappingIdWsConIdDbConIdMap;
   }
	
	public static Map<String,Object> setIlConJoinWsMappingParameters(PreparedStatement preparedStatement, ResultSet resultSet,TemplateMigration templateMigration) throws SQLException
	{
      //String tempTableName = "";
	 Map<String,Object> ilConJoinWsMappingMap = new HashMap<>();
	  for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++)
	  {
		if(!resultSet.getMetaData().isAutoIncrement(i)) {
		 if(resultSet.getMetaData().getColumnName(i).equals("userid")){
			 preparedStatement.setObject(i-1, templateMigration.getUserId());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_by")){
			 preparedStatement.setObject(i-1, "From Migration");
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_time")){
			 preparedStatement.setObject(i-1, templateMigration.getModification().getCreatedTime());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("packageId")){
			 preparedStatement.setObject(i-1, templateMigration.getPackageId());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("il_connection_mapping_id")){
			 preparedStatement.setObject(i-1, templateMigration.getIlConMappingId());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("temp_table_name")){
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
			// tempTableName = resultSet.getString(i);
			 ilConJoinWsMappingMap.put("tempTableName", resultSet.getString(i));
		 }else if(resultSet.getMetaData().getColumnName(i).equals("fileId")){
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
			 ilConJoinWsMappingMap.put("fileId", resultSet.getObject(i));
		 }
		 else if(resultSet.getMetaData().getColumnName(i).equals("temp_table_structure")){
			 String tempTableStructure = resultSet.getObject(i).toString().replace(templateMigration.getSourceClientStagingDbSchemaname(), templateMigration.getDestinationClientStagingDbSchemaname());
			 preparedStatement.setObject(i-1, tempTableStructure);
		 } 
		 else{ 
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		 }
	  }  
	}
	 return ilConJoinWsMappingMap;
   }
	public static String  setIlConWsMappingParameters(PreparedStatement preparedStatement, ResultSet resultSet,TemplateMigration templateMigration) throws SQLException
	{
      String tempTableName = "";
	  for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++)
	  {
		if(!resultSet.getMetaData().isAutoIncrement(i)) {
		 if(resultSet.getMetaData().getColumnName(i).equals("userid")){
			 preparedStatement.setObject(i-1, templateMigration.getUserId());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_by")){
			 preparedStatement.setObject(i-1, "From Migration");
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_time")){
			 preparedStatement.setObject(i-1, templateMigration.getModification().getCreatedTime());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("packageId")){
			 preparedStatement.setObject(i-1, templateMigration.getPackageId());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("il_connection_mapping_id")){
			 preparedStatement.setObject(i-1, templateMigration.getIlConMappingId());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("temp_table_name")){
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
			 tempTableName = resultSet.getString(i);
		 } 
		 else{ 
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		 }
	  }  
	}
	 return tempTableName;
   }
	public static Map<String,Object> setWsConMasterParameters(PreparedStatement preparedStatement, ResultSet resultSet,TemplateMigration templateMigration,boolean conExist) throws SQLException
	{
	  Map<String,Object> connectionMap = new HashMap<String,Object>();
	  for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++)
	  {
		if(!resultSet.getMetaData().isAutoIncrement(i)) {
		 if(resultSet.getMetaData().getColumnName(i).equals("user_id")){
			 preparedStatement.setObject(i-1, templateMigration.getUserId());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_by")){
			 preparedStatement.setObject(i-1, "From Migration");
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_time")){
			 preparedStatement.setObject(i-1, templateMigration.getModification().getCreatedTime());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("web_service_con_name")){
			 if(conExist){
				 preparedStatement.setObject(i-1,templateMigration.getWsConName());
			 }else{
			 preparedStatement.setObject(i-1,resultSet.getObject(i));
			 }
			 connectionMap.put("wsConName", resultSet.getString(i));
		 }
		 else{ 
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		 }
	  }   else{
		  connectionMap.put("wsConId", resultSet.getInt(i)); 
	  }
	}
	 return connectionMap;
   }
	public static Map<String,Object> setDbConnectionParameters(PreparedStatement preparedStatement, ResultSet resultSet,TemplateMigration templateMigration,boolean conExist) throws SQLException
	{
	  Map<String,Object> connectionMap = new HashMap<String,Object>();
	  for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++)
	  {
		if(!resultSet.getMetaData().isAutoIncrement(i)) {
			
		 if(resultSet.getMetaData().getColumnName(i).equals("userid")){
			 preparedStatement.setObject(i-1, templateMigration.getUserId());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_by")){
			 preparedStatement.setObject(i-1, "From Migration");
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_time")){
			 preparedStatement.setObject(i-1, templateMigration.getModification().getCreatedTime());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("DB_type_id")){
			 preparedStatement.setObject(i-1,resultSet.getObject(i));
		 }  else if(resultSet.getMetaData().getColumnName(i).equals("connection_name")){
			 if(conExist){
				 preparedStatement.setObject(i-1,templateMigration.getIlConName());
			 }else{
			 preparedStatement.setObject(i-1,resultSet.getObject(i));
			 }
			 connectionMap.put("connectionName", resultSet.getString(i));
		 } 
		 else{ 
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		 }
	  } else{
		  connectionMap.put("connectionId", resultSet.getInt(i)); 
	  }
	}
	 return connectionMap;
   }
	
	public static int setDbTypeParameters(PreparedStatement preparedStatement, ResultSet resultSet,TemplateMigration templateMigration) throws SQLException
	{
	  int dbTypeId = 0;
	  for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++)
	  {
		if(!resultSet.getMetaData().isAutoIncrement(i)) {
			
		 if(resultSet.getMetaData().getColumnName(i).equals("userid")){
			 preparedStatement.setObject(i-1, templateMigration.getUserId());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_by")){
			 preparedStatement.setObject(i-1, "From Migration");
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_time")){
			 preparedStatement.setObject(i-1, templateMigration.getModification().getCreatedTime());
		 }
		 else{ 
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		 }
	  }else{
		  dbTypeId = resultSet.getInt(i);
	  }
	}
	  return dbTypeId;
   }
	
	public static int setWsTemMasterParameters(PreparedStatement preparedStatement, ResultSet resultSet,TemplateMigration templateMigration) throws SQLException
	{
	  int wsConId = 0;
	  
	  for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++)
	  {
		if(!resultSet.getMetaData().isAutoIncrement(i)) {
		 if(resultSet.getMetaData().getColumnName(i).equals("created_by")){
			 preparedStatement.setObject(i-1, "From Migration");
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_time")){
			 preparedStatement.setObject(i-1, templateMigration.getModification().getCreatedTime());
		 }else{ 
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		 }
	  }  else{
		  wsConId =  resultSet.getInt(i);
	  }
		
	}
	 return wsConId;
   }
	public static void setWsTemAuthreqParamsParameters(PreparedStatement preparedStatement, ResultSet resultSet,TemplateMigration templateMigration) throws SQLException
	{
	  for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++)
	  {
		if(!resultSet.getMetaData().isAutoIncrement(i)) {
		 if(resultSet.getMetaData().getColumnName(i).equals("created_by")){
			 preparedStatement.setObject(i-1, "From Migration");
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_time")){
			 preparedStatement.setObject(i-1, templateMigration.getModification().getCreatedTime());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("ws_template_id")){
			 preparedStatement.setObject(i-1,templateMigration.getWsTemplateId());
		 }else{ 
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		 }
	  }  
		
	}
   }
	public static void setWsApiMappingParameters(PreparedStatement preparedStatement, ResultSet resultSet,TemplateMigration templateMigration) throws SQLException
	{
	  for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++)
	  {
		if(!resultSet.getMetaData().isAutoIncrement(i)) {
		 if(resultSet.getMetaData().getColumnName(i).equals("created_by")){
			 preparedStatement.setObject(i-1, "From Migration");
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_time")){
			 preparedStatement.setObject(i-1, templateMigration.getModification().getCreatedTime());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("ws_template_id")){
			 preparedStatement.setObject(i-1,templateMigration.getWsTemplateId());
		 }  
		 else{ 
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		 }
	  }  
		
	}
   }
	public static void setDefaultQryParameters(PreparedStatement preparedStatement, ResultSet resultSet,TemplateMigration templateMigration) throws SQLException
	{
	  for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++)
	  {
		if(!resultSet.getMetaData().isAutoIncrement(i)) {
		 if(resultSet.getMetaData().getColumnName(i).equals("created_by")){
			 preparedStatement.setObject(i-1, "From Migration");
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_time")){
			 preparedStatement.setObject(i-1, templateMigration.getModification().getCreatedTime());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("connector_id")){
			 preparedStatement.setObject(i-1, templateMigration.getDbConTypeId());
		 }
		 else{ 
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		 }
	  }  
		
	}
   } 
	public static void setS3FileInfoParameters(PreparedStatement preparedStatement, ResultSet resultSet,TemplateMigration templateMigration) throws SQLException
	{
	  for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++)
	  {
		if(!resultSet.getMetaData().isAutoIncrement(i)) {
		 if(resultSet.getMetaData().getColumnName(i).equals("created_by")){
			 preparedStatement.setObject(i-1, "From Migration");
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_time")){
			 preparedStatement.setObject(i-1, templateMigration.getModification().getCreatedTime());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("package_Id")){
			 preparedStatement.setObject(i-1,templateMigration.getPackageId());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("user_id")){
			 preparedStatement.setObject(i-1, templateMigration.getUserId());
		 }
		 else{ 
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		 }
	  }  
		
	}
   } 
	public static void setCpTargetTblQryParameters(PreparedStatement preparedStatement, ResultSet resultSet,TemplateMigration templateMigration) throws SQLException
	{
	  for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++)
	  {
		if(!resultSet.getMetaData().isAutoIncrement(i)) {
		 if(resultSet.getMetaData().getColumnName(i).equals("created_by")){
			 preparedStatement.setObject(i-1, "From Migration");
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_time")){
			 preparedStatement.setObject(i-1, templateMigration.getModification().getCreatedTime());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("packageId")){
			 preparedStatement.setObject(i-1,templateMigration.getPackageId());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("clientId")){
			 preparedStatement.setObject(i-1, templateMigration.getUserId());
		 }
		 else{ 
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		 }
	  }  
		
	}
   } 
	public static void setFileheaderInfoParameters(PreparedStatement preparedStatement, ResultSet resultSet,TemplateMigration templateMigration) throws SQLException
	{
	  String userId ="";
	  Integer packageId = 0;
	  String filePath = "";
	  for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++)
	  {
		if(!resultSet.getMetaData().isAutoIncrement(i)) {
		 if(resultSet.getMetaData().getColumnName(i).equals("created_by")){
			 preparedStatement.setObject(i-1, "From Migration");
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_time")){
			 preparedStatement.setObject(i-1, templateMigration.getModification().getCreatedTime());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("packageId")){
			 preparedStatement.setObject(i-1,templateMigration.getPackageId());
			 packageId = resultSet.getInt(i);
		 }else if(resultSet.getMetaData().getColumnName(i).equals("clientId")){
			 preparedStatement.setObject(i-1, templateMigration.getUserId());
			 userId = resultSet.getString(i);
		 }else if(resultSet.getMetaData().getColumnName(i).equals("file_path")){
			 if(packageId != 0){
				 filePath = resultSet.getString(i).replace(userId, templateMigration.getUserId()).replace(packageId.toString(), templateMigration.getPackageId().toString()); 
			 }
			 
			 preparedStatement.setObject(i-1, filePath);
		 }
		 else{ 
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		 }
	  }  
		
	}
   } 
	public static  Map<String,Object> setCpFileTempTblMappingParameters(PreparedStatement preparedStatement, ResultSet resultSet,TemplateMigration templateMigration) throws SQLException
	{
	  //String tempTableName = "";
	  Map<String,Object> cpFileTempTblMappingmap = new HashMap<>();
	  for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++)
	  {
		if(!resultSet.getMetaData().isAutoIncrement(i)) {
		 if(resultSet.getMetaData().getColumnName(i).equals("created_by")){
			 preparedStatement.setObject(i-1, "From Migration");
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_time")){
			 preparedStatement.setObject(i-1, templateMigration.getModification().getCreatedTime());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("packageId")){
			 preparedStatement.setObject(i-1,templateMigration.getPackageId());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("clientId")){
			 preparedStatement.setObject(i-1, templateMigration.getUserId());
		 } else if(resultSet.getMetaData().getColumnName(i).equals("fileId")){
			 preparedStatement.setObject(i-1,  resultSet.getObject(i));
			 cpFileTempTblMappingmap.put("cpTempTableFileId", resultSet.getObject(i));
		 }else if(resultSet.getMetaData().getColumnName(i).equals("il_mapping_id")){
			 preparedStatement.setObject(i-1, templateMigration.getIlConMappingId());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("temp_table_name")){
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
			// tempTableName = resultSet.getString(i);
			 cpFileTempTblMappingmap.put("cpTempTable", resultSet.getObject(i));
		 }
		 else{ 
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		 }
	  }  
		
	 }
	  return cpFileTempTblMappingmap;
   } 
	public static String setTarTblInfoParameters(PreparedStatement preparedStatement, ResultSet resultSet,TemplateMigration templateMigration) throws SQLException
	{
	  String targetTableName = "";
	  for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++)
	  {
		if(!resultSet.getMetaData().isAutoIncrement(i)) {
		 if(resultSet.getMetaData().getColumnName(i).equals("created_by")){
			 preparedStatement.setObject(i-1, "From Migration");
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_time")){
			 preparedStatement.setObject(i-1, templateMigration.getModification().getCreatedTime());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("package_Id")){
			 preparedStatement.setObject(i-1,templateMigration.getPackageId());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("client_Id")){
			 preparedStatement.setObject(i-1, templateMigration.getUserId());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("target_table_name")){
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
			 targetTableName = resultSet.getString(i);
		 } else if(resultSet.getMetaData().getColumnName(i).equals("schemaName")){
			 preparedStatement.setObject(i-1,templateMigration.getDestinationClientDbSchemaname());
		 }  
		 else{ 
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		 }
	  }  
		
	}
	  return targetTableName;
   } 
	public static String setCpTarTblDerivativesParameters(PreparedStatement preparedStatement, ResultSet resultSet,TemplateMigration templateMigration) throws SQLException
	{
	  String derivedTargetTblName = "";
	  for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++)
	  {
		if(!resultSet.getMetaData().isAutoIncrement(i)) {
		 if(resultSet.getMetaData().getColumnName(i).equals("created_by")){
			 preparedStatement.setObject(i-1, "From Migration");
		 }else if(resultSet.getMetaData().getColumnName(i).equals("created_time")){
			 preparedStatement.setObject(i-1, templateMigration.getModification().getCreatedTime());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("package_Id")){
			 preparedStatement.setObject(i-1,templateMigration.getPackageId());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("client_Id")){
			 preparedStatement.setObject(i-1, templateMigration.getUserId());
		 }else if(resultSet.getMetaData().getColumnName(i).equals("target_table_id")){
			 preparedStatement.setObject(i-1, templateMigration.getTargetTblInfoId());
		 } else if(resultSet.getMetaData().getColumnName(i).equals("target_table_name")){
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
			 derivedTargetTblName = resultSet.getString(i);
		 } else if(resultSet.getMetaData().getColumnName(i).equals("schemaName")){
			 preparedStatement.setObject(i-1, templateMigration.getDestinationClientDbSchemaname());
		 }   
		 else{ 
			 preparedStatement.setObject(i-1, resultSet.getObject(i));
		 }
	   }  
	 }
	  return derivedTargetTblName;
   } 
	public static String buildMySQLCreateTable(ClientData clientData) {
		 
		/*
		 * CREATE TABLE manufacturing_1001.new_table ( id BIGINT(10) NOT NULL
		 * AUTO_INCREMENT , name VARCHAR(45) NOT NULL , isActive BIT(1) NOT NULL
		 * , date DATETIME NOT NULL , PRIMARY KEY (id, name, isActive, date) ,
		 * UNIQUE INDEX id_UNIQUE (id ASC) );
		 */

		String script = null;
		StringBuilder query = new StringBuilder("CREATE TABLE");
		query.append(" ");
		//query.append(clientData.getUserPackage().getTable().getSchemaName());
		//query.append(".");
		query.append(clientData.getUserPackage().getTable().getTableName());
		query.append("(\n");
		// add columns
		for (Column column : clientData.getUserPackage().getTable().getColumns()) {
			if (StringUtils.isNotBlank(column.getColumnName())) {

				String columnName = column.getColumnName();

				columnName = columnName.trim().replaceAll("\\s+", "_").replaceAll("\\W+", "_");

				query.append("`").append(columnName).append("`");
				query.append(" ");
				query.append(column.getDataType());

				// append the column size
				if (!column.getDataType().equals("DATETIME")) {

					boolean addbraces = true;

					/*
					 * if (column.getColumnSize() == null) { addbraces = false;
					 * }
					 */
					if(!column.getDataType().equals("DATE")){
						
						addbraces = (column.getColumnSize() != null);

						if (addbraces && column.getDataType().equals("DECIMAL")) {
							addbraces = (column.getDecimalPoints() != null);
						}

						if (addbraces)
							query.append("(");

						if (column.getDataType().equals("DECIMAL")) {
							if (column.getColumnSize() != null && column.getDecimalPoints() != null) {
								query.append(column.getColumnSize());
								query.append(",");
								query.append(column.getDecimalPoints());
							} /*
								 * else{ query.append("10,2"); }
								 */
						} else {
							if (StringUtils.isNotBlank(column.getColumnSize())) {
								query.append(column.getColumnSize());
							}
						}

						if (addbraces)
							query.append(")");
					}
				}
				query.append(" ");
				if (column.getIsNotNull().equals(Boolean.TRUE)) {
					query.append("NOT NULL");
				} else {
					query.append("NULL");
				}
				if ((column.getDataType().equals("BIGINT") || column.getDataType().equals("INT")) && column.getIsAutoIncrement().equals(Boolean.TRUE)) {
					query.append(" ");
					query.append("AUTO_INCREMENT");
				}
				if (StringUtils.isNotBlank(column.getDefaultValue())) {
					query.append(" DEFAULT ");

					if (column.getDataType().equals("BIGINT") || column.getDataType().equals("INT") || column.getDataType().equals("DECIMAL")
							|| column.getDataType().equals("BIT"))
						query.append(column.getDefaultValue());
					else
						query.append("'").append(column.getDefaultValue()).append("'");
				}
				query.append(",\n");
			}
		}
		query.replace(query.lastIndexOf(","), query.length(), "");
		// check for PKs
		boolean isHavingPK = Boolean.FALSE;
		for (Column column : clientData.getUserPackage().getTable().getColumns()) {
			if (column.getIsPrimaryKey().equals(Boolean.TRUE)) {
				isHavingPK = Boolean.TRUE;
				break;
			}
		}
		if (isHavingPK) {
			query.append(",\n");
			query.append("PRIMARY KEY (");
		}
		// add PKs
		StringBuilder primaryKeyConstraint = new StringBuilder();
		for (Column column : clientData.getUserPackage().getTable().getColumns()) {
			if (column.getIsPrimaryKey()) {
				if (column.getIsAutoIncrement()) {
					String primaryKeyConstraintStr = primaryKeyConstraint.toString();
					primaryKeyConstraint = new StringBuilder();
					primaryKeyConstraint.append("`").append(column.getColumnName()).append("`");
					primaryKeyConstraint.append(",").append(primaryKeyConstraintStr);

				} else {
					primaryKeyConstraint.append("`").append(column.getColumnName()).append("`");
					primaryKeyConstraint.append(",");
				}

			}
		}
		// remove ',' at the end of last PK
		if (isHavingPK) {
			primaryKeyConstraint.replace(primaryKeyConstraint.lastIndexOf(","), primaryKeyConstraint.length(), "");
			primaryKeyConstraint.append(")");
		}
		query.append(primaryKeyConstraint);
		// add UQs
		for (Column column : clientData.getUserPackage().getTable().getColumns()) {
			if (column.getIsUnique()) {
				query.append(",\n");
				query.append("UNIQUE INDEX ");
				query.append("`").append(column.getColumnName() + "_UNIQUE").append("`");
				query.append(" (");
				query.append("`").append(column.getColumnName()).append("`");
				query.append(" ASC)");
			}
		}
		query.append(") ");
		script = query.toString();
		System.out.println("query>>>>>>\n" + script);
		return script;
	}
	
	public static ClientData getClientData(String tableName,List<Column> columns){
		 ClientData clientData = new ClientData();
	     Package pack =new Package();
	     Table table = new Table();
	     table.setTableName(tableName);
	     table.setColumns(columns);
	     pack.setTable(table);
	     clientData.setUserPackage(pack);
		return clientData;
	}

	public static String getRandomNumber() throws ParseException{
		DateFormat dateFormat = new SimpleDateFormat("yyyy");
	    Date dateFrom = dateFormat.parse("2012");
	    long timestampFrom = dateFrom.getTime();
	    Date dateTo = dateFormat.parse("2018");
	    long timestampTo = dateTo.getTime();
	    Random random = new Random();
	    long timeRange = timestampTo - timestampFrom;
	    long randomTimestamp = timestampFrom + (long) (random.nextDouble() * timeRange);
	    String randomNumber = String.valueOf(randomTimestamp);
	    return "_M_"+randomNumber.substring(2, 5);
	}
	public static void setDDltableParameters(PreparedStatement preparedStatement, ResultSet resultSet) throws SQLException
	{
	  for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++)
	  {
		//if(!resultSet.getMetaData().isAutoIncrement(i)) {
			 preparedStatement.setObject(i, resultSet.getObject(i));
	    //  } 
	 }
   } 
	
	/*public static int runDDlayoutTable(String table, Connection connection,String selectQry) throws SQLException {
		int count = 0;
	    try (PreparedStatement s1 = connection.prepareStatement(selectQry);
	         ResultSet rs = s1.executeQuery()) {
	         ResultSetMetaData meta = rs.getMetaData();

	        List<String> columns = new ArrayList<>();
	        for (int i = 1; i <= meta.getColumnCount(); i++)
	            columns.add(meta.getColumnName(i));

	        try (PreparedStatement s2 = connection.prepareStatement(
	                "INSERT INTO " + table + " ("
	              + columns.stream().collect(Collectors.joining(", "))
	              + ") VALUES ("
	              + columns.stream().map(c -> "?").collect(Collectors.joining(", "))
	              + ")"
	        )) {
 
	            while (rs.next()) {
	            	count ++;
	                for (int i = 1; i <= meta.getColumnCount(); i++)
	                    s2.setObject(i, rs.getObject(i));

	                s2.addBatch();
	            }
	            s2.executeBatch();
	            if(s2 != null){
	               s2.close();
	            }
	        }
	        if(rs != null){
	        	 rs.close();
	        }
	        if(s1 != null){
	        	s1.close();
	        }
	        if(connection != null){
	           connection.close();
	        }
	       
	    }
	   return count;
	}*/
	
	public static int runDDlayoutTable(DDLayout ddlayout, JdbcTemplate clientJdbcTemplate) throws SQLException {
		int selectQryCount = -1;
		int insertCount = -1;
		String selectQry = "select count(*) from ( " + ddlayout.getSelectQry() + ") as q";
		selectQryCount = clientJdbcTemplate.queryForObject(selectQry, Integer.class);
		if (selectQryCount > 0) {
			clientJdbcTemplate.execute("truncate table " + ddlayout.getTableName() + ";");
			String insertQry = "INSERT INTO " + ddlayout.getTableName() + " ( " + ddlayout.getSelectQry() + " ) ";
			insertCount = clientJdbcTemplate.update(insertQry);
		} else {
			throw new SQLException(selectQryCount + " records found in source query");
		}
		return insertCount;
	}
	
	static int dbConCount = 0;
	public static Map<Integer,Integer> getIlConnectionMap(ResultSet ilConSelectResultSet,TemplateMigration templateMigration ,Connection destinationConnection,boolean conExist ) throws SQLException{
		String ilConName = "";
		ResultSet ilConDestinationResultSet = null;
		Map<Integer,Integer> ilConnectionMap = new HashMap<>();
		Map<String,Object> connectionMap = null;
		PreparedStatement  ilConInsertStatement = null;
		try{
		  ilConInsertStatement = destinationConnection.prepareStatement(CommonUtils.createInsertSql(ilConSelectResultSet.getMetaData(),"il_connection"),Statement.RETURN_GENERATED_KEYS);
		  connectionMap = setDbConnectionParameters(ilConInsertStatement, ilConSelectResultSet, templateMigration,conExist);
		  ilConInsertStatement.executeUpdate();
		  ilConDestinationResultSet = ilConInsertStatement.getGeneratedKeys();
		  while(ilConDestinationResultSet != null && ilConDestinationResultSet.next()){
			  ilConnectionMap.put((Integer)connectionMap.get("connectionId"), ilConDestinationResultSet.getInt(1));
			  dbConCount = 0;
 		  }
		  if(ilConInsertStatement != null){
			  ilConInsertStatement.close();
		  }
		  if(ilConDestinationResultSet != null){
			  ilConDestinationResultSet.close();
		  }
		  return ilConnectionMap;
		}catch(Exception e){
			dbConCount += 1 ;
			ilConName = connectionMap.get("connectionName").toString()+"_V"+dbConCount;
			templateMigration.setIlConName(ilConName);
			return getIlConnectionMap(ilConSelectResultSet,templateMigration ,destinationConnection,true);
		}
	}
	static int wsConCount = 0;
	public static Map<Integer,Integer> getWsConnectionMap(ResultSet wsConSelectResultSet,TemplateMigration templateMigration ,Connection destinationConnection,boolean conExist ) throws SQLException{
		String wsConName = "";
		ResultSet wsConDestinationResultSet = null;
		Map<Integer,Integer> wsConnectionMap = new HashMap<>();
		PreparedStatement wsConInsertStatement=null;
		Map<String,Object> connectionMap = null;
		try{  
			  wsConInsertStatement = destinationConnection.prepareStatement(CommonUtils.createInsertSql(wsConSelectResultSet.getMetaData(),"ws_connections_mst"),Statement.RETURN_GENERATED_KEYS);
			  connectionMap =  setWsConMasterParameters(wsConInsertStatement, wsConSelectResultSet, templateMigration,conExist);
			  wsConInsertStatement.executeUpdate();
			  wsConDestinationResultSet = wsConInsertStatement.getGeneratedKeys();
			  while(wsConDestinationResultSet != null && wsConDestinationResultSet.next()){
				  wsConnectionMap.put((Integer)connectionMap.get("wsConId"), wsConDestinationResultSet.getInt(1));
				  wsConCount = 0;
			  }
			  if(wsConInsertStatement != null){
				  wsConInsertStatement.close();
			  }
			  if(wsConDestinationResultSet != null){
				  wsConDestinationResultSet.close();
			  }
			  return wsConnectionMap;  
		}catch(Exception e){
			wsConCount ++ ; 
			wsConName = connectionMap.get("wsConName").toString()+"_V"+wsConCount;
			templateMigration.setWsConName(wsConName);
			return getWsConnectionMap(wsConSelectResultSet,templateMigration ,destinationConnection,true);
		}
	}
	static int packCount = 0;
	public static Map<String,Object> getPackageMap(ResultSet packageSelectResultSet,TemplateMigration templateMigration ,Connection destinationConnection,boolean packExist ) throws SQLException{
		String packName = "";
		ResultSet packageDestinationResultSet = null;
		PreparedStatement packageInsertStatement=null;
		Map<String,Object> packageMap = null;
		try{  
			  packageInsertStatement = destinationConnection.prepareStatement(CommonUtils.createInsertSql(packageSelectResultSet.getMetaData(),"package"),Statement.RETURN_GENERATED_KEYS);
			  packageMap =  setPackageParameters(packageInsertStatement, packageSelectResultSet, templateMigration,packExist);
			  packageInsertStatement.executeUpdate();
			  packageDestinationResultSet = packageInsertStatement.getGeneratedKeys();
			  while(packageDestinationResultSet != null && packageDestinationResultSet.next()){
				  packageMap.put("packageId", packageDestinationResultSet.getInt(1));
				  packCount = 0;
			  }
			  if(packageInsertStatement != null){
				  packageInsertStatement.close();
			  }
			  if(packageDestinationResultSet != null){
				  packageDestinationResultSet.close();
			  }
			  return packageMap;  
		}catch(Exception e){
			packCount += 1;
			packName = packageMap.get("packName").toString()+"_V"+packCount;
			templateMigration.setPackageName(packName);
			return getPackageMap(packageSelectResultSet,templateMigration ,destinationConnection,true);
		}
	}
}
