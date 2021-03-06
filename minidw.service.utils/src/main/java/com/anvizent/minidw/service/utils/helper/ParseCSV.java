package com.anvizent.minidw.service.utils.helper;

import static com.anvizent.minidw.service.utils.helper.CommonUtils.sanitizeForCsv;
import static com.anvizent.minidw.service.utils.helper.CommonUtils.appendDQ;
import static com.anvizent.minidw.service.utils.helper.CommonUtils.sanitizeForWsCsv;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.sql.DataSource;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.io.output.FileWriterWithEncoding;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.PreparedStatementCallback;
import org.springframework.jdbc.core.StatementCallback;
import org.springframework.jdbc.core.support.JdbcDaoSupport;
import com.datamodel.anvizent.service.model.ClientData;
import com.datamodel.anvizent.service.model.Column;
import com.datamodel.anvizent.service.model.Table;
import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;

/**
 * @author mahender.alaveni
 * modification date : 03/10/2018
 *  
 */
public class ParseCSV
{

	private static final Logger logger = LoggerFactory.getLogger(ParseCSV.class);

	private final String FILE_PATH;

	private boolean validateInsert = true;

	public boolean isValidateInsert()
	{
		return validateInsert;
	}

	public void setValidateInsert(boolean validateInsert)
	{
		this.validateInsert = validateInsert;
	}

	public ParseCSV(String filePath)
	{
		this.FILE_PATH = filePath;
	}

	public List<String> readColumns(String separatorChar, String stringQuoteChar) throws IOException
	{

		List<String> columns = null;

		boolean valid = isValidCSV();

		if( valid )
		{
			CSVReader reader = null;

			try
			{
				reader = createReader(separatorChar, stringQuoteChar);
				columns = processCsvHeader(reader);

			}
			finally
			{
				logger.debug(" Closing CSV Reader Object .. ");
				if( reader != null ) reader.close();
			}
		}
		else
		{
			logger.info("Given CSV file is not valid : {}", FILE_PATH);
		}

		return columns;
	}

	private List<String> processCsvHeader(CSVReader reader) throws IOException
	{

		List<String> columns = null;

		String[] headerRow = reader.readNext();

		columns = new ArrayList<>();

		for (String col : headerRow)
		{
			if( StringUtils.isNotEmpty(col.trim()) ) columns.add(col.trim().replaceAll("\\s+", "_").replaceAll("\\W+", "_"));
		}

		return columns;
	}
	
	private List<String> processCsvHeader(org.apache.commons.csv.CSVParser csvParser) throws IOException
	{

		final Map<String, Integer> headerMap = csvParser.getHeaderMap();
		final List<String> labels = new ArrayList<>(headerMap.size());
		for (final String label : headerMap.keySet())
		{
			final int pos = headerMap.get(label);
			if( StringUtils.isNotEmpty(label.trim()) ) labels.add(pos, label.trim().replaceAll("\\s+", "_").replaceAll("\\W+", "_"));
		}
		return labels;

	}

	private CSVReader createReader(String separatorChar, String stringQuoteChar) throws FileNotFoundException
	{

		CSVReader reader = null;

		logger.debug("creating csv reader object using given file path.");

		File csvFile = new File(FILE_PATH);

		boolean separatorPresent = separatorChar != null && separatorChar.length() == 1;
		boolean quotecharPresent = stringQuoteChar != null && stringQuoteChar.length() == 1;

		if( separatorPresent && quotecharPresent )
		{
			reader = new CSVReader(new FileReader(csvFile), separatorChar.charAt(0), stringQuoteChar.charAt(0));
		}
		else if( separatorPresent )
		{
			reader = new CSVReader(new FileReader(csvFile), separatorChar.charAt(0));
		}
		else
		{
			reader = new CSVReader(new FileReader(csvFile), ',', '"');
		}

		return reader;
	}

	private boolean isValidCSV()
	{

		logger.debug("validation csv file .. ");

		boolean valid = false;

		if( FILE_PATH != null && FILE_PATH.length() > 0 )
		{
			File csvFile = new File(FILE_PATH);

			valid = csvFile.exists();
		}
		else
		{
			logger.info("File path is empty or null .. {}", FILE_PATH);
		}

		return valid;
	}

	public boolean processCSVDataToFile(String outputFilePath, List<String> iLColumnNames, List<String> selectedFileHeaders, List<String> dafaultValues, String separatorChar, String stringQuoteChar) throws IOException
	{

		boolean isProcessed = Boolean.FALSE;
		boolean valid = isValidCSV();

		if( valid )
		{

			CSVReader reader = null;

			reader = createReader(separatorChar, stringQuoteChar);

			List<String> columns = processCsvHeader(reader);

			BufferedWriter fileWriter = new BufferedWriter(new FileWriter(outputFilePath));

			int i = 1, colslength = iLColumnNames.size();
			for (String iLColumn : iLColumnNames)
			{
				fileWriter.append(iLColumn.trim());
				if( i < colslength ) fileWriter.append(",");
				i++;
			}

			fileWriter.append(System.getProperty("line.separator"));

			String[] datarow = reader.readNext();

			while (datarow != null)
			{

				for (int j = 0; j < iLColumnNames.size(); j++)
				{
					String fileHeader = selectedFileHeaders.get(j);
					int colIndex;
					String data = null;
					if( StringUtils.isNotBlank(fileHeader) )
					{
						colIndex = columns.indexOf(fileHeader.trim());
						if( colIndex == -1 )
						{
							data = "";
							logger.warn("Source Column Header: " + fileHeader.trim() + " is not mapped with Saved Mapped Header.");
						}
						else
						{
							data = datarow[colIndex];
						}

						if( StringUtils.contains(data, ",") )
						{
							data = data.replaceAll(",", " ").replaceAll("\\s+", " ");
						}
					}
					else
					{
						String dafaultValue = dafaultValues.get(j);
						if( StringUtils.isNotBlank(dafaultValue) )
						{
							data = dafaultValue;
						}
					}

					if( StringUtils.isBlank(data) )
					{
						data = "";
					}

					data = sanitizeForCsv(data);
					fileWriter.append(data);

					if( j < colslength - 1 )
					{
						fileWriter.append(",");
					}
				}

				fileWriter.append(System.getProperty("line.separator"));

				datarow = reader.readNext();
			}
			if( fileWriter != null ) fileWriter.close();
			if( reader != null ) reader.close();
			isProcessed = Boolean.TRUE;

		}
		return isProcessed;
	}

	public boolean processCSVDataToWsFile(String outputFilePath, List<String> iLColumnNames, List<String> selectedFileHeaders, List<String> dafaultValues, String separatorChar, String stringQuoteChar) throws IOException
	{

		boolean isProcessed = Boolean.FALSE;
		boolean valid = isValidCSV();

		if( valid )
		{

			CSVReader reader = null;

			reader = createReader(separatorChar, stringQuoteChar);

			List<String> columns = processCsvHeader(reader);

			BufferedWriter fileWriter = new BufferedWriter(new FileWriter(outputFilePath));

			int i = 1, colslength = iLColumnNames.size();
			for (String iLColumn : iLColumnNames)
			{
				fileWriter.append(iLColumn.trim());
				if( i < colslength ) fileWriter.append(",");
				i++;
			}

			fileWriter.append(System.getProperty("line.separator"));

			String[] datarow = reader.readNext();

			while (datarow != null)
			{

				for (int j = 0; j < iLColumnNames.size(); j++)
				{
					String fileHeader = selectedFileHeaders.get(j);
					int colIndex;
					String data = null;
					if( StringUtils.isNotBlank(fileHeader) )
					{
						colIndex = columns.indexOf(fileHeader.trim());
						if( colIndex == -1 )
						{
							data = "";
							logger.warn("Source Column Header: " + fileHeader.trim() + " is not mapped with Saved Mapped Header.");
						}
						else
						{
							data = datarow[colIndex];
						}

					}
					else
					{
						String dafaultValue = dafaultValues.get(j);
						if( StringUtils.isNotBlank(dafaultValue) )
						{
							data = dafaultValue;
						}
					}

					if( StringUtils.isBlank(data) )
					{
						data = "";
					}

					data = appendDQ(data);
					fileWriter.append(data);

					if( j < colslength - 1 )
					{
						fileWriter.append(",");
					}
				}

				fileWriter.append(System.getProperty("line.separator"));

				datarow = reader.readNext();
			}
			if( fileWriter != null ) fileWriter.close();
			if( reader != null ) reader.close();
			isProcessed = Boolean.TRUE;

		}
		return isProcessed;
	}
	private org.apache.commons.csv.CSVParser commonsCSVReader(String separatorChar, String stringQuoteChar) throws IOException
	{

		org.apache.commons.csv.CSVParser csvParser = null;

		logger.debug("creating CSVParser object using given file path.");

		Reader reader = Files.newBufferedReader(Paths.get(FILE_PATH));

		String separator = String.valueOf(separatorChar);
		String quote = String.valueOf(stringQuoteChar);
		
		boolean separatorPresent = separator!= null && separator.length() == 1;
		boolean quotecharPresent = quote != null && quote.length() == 1;

		if( separatorPresent && quotecharPresent )
		{
			csvParser = new CSVParser(reader, 
				    CSVFormat.RFC4180.withFirstRecordAsHeader()
				   .withDelimiter(separatorChar.charAt(0))
				   .withQuote(stringQuoteChar.charAt(0)));
		}
		else if( separatorPresent )
		{
		  csvParser = new CSVParser(reader,CSVFormat.DEFAULT.withFirstRecordAsHeader());
		}
		else
		{
			csvParser = new CSVParser(reader,CSVFormat.DEFAULT.withFirstRecordAsHeader().withQuote('"'));
		}
		return csvParser;
	}
	public boolean processCSVDataUsingCSVReaderWriter(String outputFilePath, List<String> iLColumnNames, List<String> selectedFileHeaders, List<String> dafaultValues, String separatorChar, String stringQuoteChar) throws IOException
	{

		boolean isProcessed = Boolean.FALSE;
		boolean valid = isValidCSV();
		FileWriterWithEncoding fileWriterWithEncoding = null;
		com.opencsv.CSVWriter csvWriter = null;
		org.apache.commons.csv.CSVParser csvParser = null;
		if( valid )
		{
			fileWriterWithEncoding = new FileWriterWithEncoding(outputFilePath, com.anvizent.client.data.to.csv.path.converter.constants.Constants.Config.CSV_ENCODING_TYPE);

			csvWriter = new com.opencsv.CSVWriter(fileWriterWithEncoding, CSVWriter.DEFAULT_SEPARATOR, CSVWriter.DEFAULT_QUOTE_CHARACTER);

			csvParser = commonsCSVReader(separatorChar, stringQuoteChar);

			List<String> columns = processCsvHeader(csvParser);

			List<String> iLHeaders = new ArrayList<String>();

			for (String iLColumn : iLColumnNames)
			{
				iLHeaders.add(iLColumn.trim());
			}

			csvWriter.writeNext(iLHeaders.toArray(new String[] {}));

			for (org.apache.commons.csv.CSVRecord csvRecord : csvParser)
			{

				List<String> finalDataRow = new ArrayList<String>();

				for (int j = 0; j < iLColumnNames.size(); j++)
				{
					String fileHeader = selectedFileHeaders.get(j);
					int colIndex;
					String data = null;
					if( StringUtils.isNotBlank(fileHeader) )
					{
						colIndex = columns.indexOf(fileHeader.trim());
						if( colIndex == -1 )
						{
							data = "";
							logger.warn("Source Column Header: " + fileHeader.trim() + " is not mapped with Saved Mapped Header.");
						}
						else
						{
							data = csvRecord.get(colIndex);
						}
					}
					else
					{
						String dafaultValue = dafaultValues.get(j);
						if( StringUtils.isNotBlank(dafaultValue) )
						{
							data = dafaultValue;
						}
					}
					if( StringUtils.isBlank(data) )
					{
						data = "";
					}
					data = sanitizeForWsCsv(data);

					finalDataRow.add(data);

				}
				csvWriter.writeNext(finalDataRow.toArray(new String[] {}), false);

			}

			if( fileWriterWithEncoding != null )
			{
				fileWriterWithEncoding.close();
			}
			if( csvWriter != null )
			{
				csvWriter.close();
			}

			if( csvParser != null )
			{
				csvParser.close();
			}

			isProcessed = Boolean.TRUE;

		}
		return isProcessed;
	}

	private String buildInsertScript(Table table)
	{
		final char QUOTE_CHAR = '`';
		StringBuilder insertScript = new StringBuilder();

		String tableName = table.getTableName();
		String schemaName = table.getSchemaName();

		List<String> tColumns = table.getOriginalColumnNames();
		int colslen = tColumns.size();

		insertScript.append("INSERT INTO ").append(schemaName).append(".").append(QUOTE_CHAR).append(tableName).append(QUOTE_CHAR).append(" ( \n ");

		for (int i = 0; i < colslen; i++)
		{

			String column = tColumns.get(i);
			String colname = column;

			insertScript.append(QUOTE_CHAR + colname + QUOTE_CHAR);

			if( i < colslen - 1 ) insertScript.append(", ");
		}
		insertScript.append(" \n ) VALUES ( \n ");

		return insertScript.toString();
	}

	private String buildInsertScriptForPreparedStatement(Table table)
	{
		StringBuilder insertScript = new StringBuilder();

		String tableName = table.getTableName();
		String schemaName = table.getSchemaName();

		List<String> tColumns = table.getOriginalColumnNames();
		int colslen = tColumns.size();

		insertScript.append("INSERT INTO ").append(schemaName).append(".").append(tableName).append(" ( \n ");

		for (int i = 0; i < colslen; i++)
		{

			String column = tColumns.get(i);
			String colname = column;

			insertScript.append(colname);

			if( i < colslen - 1 ) insertScript.append(", ");
		}
		insertScript.append(" ) VALUES ( ");

		for (int i = 0; i < colslen; i++)
		{
			insertScript.append("? ");
			if( i < colslen - 1 ) insertScript.append(", ");
		}
		insertScript.append(" ) ");
		return insertScript.toString();
	}

	private int[] getArgsType(Table table)
	{
		List<Column> columns = table.getColumns();
		int[] argsTypes = new int[columns.size()];
		int index = 0;
		for (Column column : columns)
		{
			argsTypes[index] = getSqlType(column.getDataType());
			index++;
		}
		return argsTypes;
	}

	int getSqlType(String datatType)
	{
		int dataTypeId = 0;
		switch (datatType.toLowerCase())
		{
		case "float":
		case "decimal":
			dataTypeId = Types.DOUBLE;
			break;
		case "int":
		case "bigint":
		case "bit":
			dataTypeId = Types.INTEGER;
			break;
		default:
			dataTypeId = Types.VARCHAR;
		}
		return dataTypeId;
	}

	public Map<String, Object> processCSVData(Table table, DataSource dataSource, String separatorChar, String stringQuoteChar) throws Exception
	{

		Map<String, Object> processedData = new HashMap<>();
		logger.debug("processing csv data .. ");

		boolean valid = isValidCSV();

		if( valid )
		{

			CSVReader reader = null;

			try
			{
				reader = createReader(separatorChar, stringQuoteChar);

				List<String> columns = processCsvHeader(reader);

				logger.debug("columns before applying pattern : {}", columns);

				for (int i = 0; i < columns.size(); i++)
				{
					String col = columns.get(i);
					col = col.trim().replaceAll("\\s+", "_");
					columns.set(i, col);
				}

				logger.debug("columns after applying pattern : {}", columns);

				String tableName = table.getTableName();
				String schemaName = table.getSchemaName();

				List<Column> tColumns = table.getColumns();
				int colslen = tColumns.size();

				logger.debug("Schema Name : {} --> Table Name : {} ", schemaName, tableName);

				logger.debug("Columns Size : {} ", colslen);

				String[] datarow = reader.readNext();

				StringBuilder selectScript = new StringBuilder();

				selectScript.append("SELECT COUNT(*) FROM ").append(schemaName).append(".").append(tableName).append(" \n WHERE ");

				String insertScript = buildInsertScript(table);

				DBDataOperations dbOp = new DBDataOperations();
				dbOp.setDataSource(dataSource);

				int total = 0, success = 0, fail = 0, duplicates = 0;

				while (datarow != null)
				{

					StringBuilder insertQuery = new StringBuilder(insertScript);
					StringBuilder selectQuery = new StringBuilder(selectScript);

					for (int i = 0; i < colslen; i++)
					{
						Column column = tColumns.get(i);
						String colname = column.getColumnName();
						String datatype = column.getDataType();
						int colIndex = columns.indexOf(colname);

						selectQuery.append(colname).append(" = ");

						String value = datarow[colIndex];

						if( "text".equalsIgnoreCase((String) datatype) || "varchar".equalsIgnoreCase(datatype) )
						{

							value = value.replaceAll("'", "''");

							insertQuery.append("'").append(value).append("'");
							selectQuery.append("'").append(value).append("'");

						}

						else if( "datetime".equalsIgnoreCase(datatype) )
						{
							insertQuery.append("'").append(value).append("'");
							selectQuery.append("'").append(value).append("'");
						}

						else
						{
							insertQuery.append(value);
							selectQuery.append(value);
						}

						if( i < colslen - 1 )
						{
							insertQuery.append(", ");
							selectQuery.append(" AND ");

						}

					}

					insertQuery.append(" \n )");

					try
					{

						boolean recordexists = false;

						if( validateInsert )
						{
							recordexists = dbOp.checkRecordExist(selectQuery.toString());
						}

						if( recordexists )
						{
							duplicates++;
						}
						else
						{
							boolean queryExeStatus = dbOp.executeQuery(insertQuery.toString());

							if( queryExeStatus ) success++;
							else fail++;
						}

					}
					catch ( Exception e )
					{
						fail++;
						logger.error("Error while execution the insert query script ", e);
					}

					total++;
					datarow = reader.readNext();
				}

				logger.debug("Total Records : {} ", total);
				logger.debug("Sccuess Records : {} ", success);
				logger.debug("Failed Records : {} ", fail);
				logger.debug("Duplicate Records : {} ", duplicates);

				processedData.put("totalRecords", total);
				processedData.put("successRecords", success);
				processedData.put("failedRecords", fail);
				processedData.put("duplicateRecords", duplicates);
			}
			finally
			{
				logger.debug("Closing CSV reader object .. ");
				if( reader != null ) reader.close();
			}
		}

		return processedData;
	}

	public Map<String, Object> processCSVDataBatch(ClientData clientData, DataSource dataSource, String separatorChar, String stringQuoteChar, String clientSchemaName) throws Exception
	{
		return processCSVDataBatchOld(clientData, dataSource, separatorChar, stringQuoteChar, clientSchemaName);
	}

	public Map<String, Object> processCSVDataBatchOld(ClientData clientData, DataSource dataSource, String separatorChar, String stringQuoteChar, String clientSchemaName) throws Exception
	{

		Map<String, Object> result = new HashMap<>();
		Table table = clientData.getUserPackage().getTable();
		logger.debug("processing csv data batch.. ");

		boolean valid = isValidCSV();

		if( valid )
		{

			CSVReader reader = null;

			try
			{
				reader = createReader(separatorChar, stringQuoteChar);

				List<String> columns = processCsvHeader(reader);

				logger.debug("columns before applying pattern : {}", columns);

				for (int i = 0; i < columns.size(); i++)
				{
					String col = columns.get(i);
					col = col.trim().replaceAll("\\s+", "_");
					columns.set(i, col);
				}

				logger.debug("columns after applying pattern : {}", columns);

				String tableName = table.getTableName();
				String schemaName = table.getSchemaName();

				List<Column> tColumns = table.getColumns();
				int colslen = tColumns.size();

				logger.debug("Schema Name : {} --> Table Name : {} ", schemaName, tableName);

				logger.debug("Columns Size : {} ", colslen);

				String[] datarow = reader.readNext();

				String insertScript = buildInsertScript(table);

				DBDataOperations dbOp = new DBDataOperations();
				dbOp.setDataSource(dataSource);

				int total = 0, success = 0, fail = 0, duplicates = 0;

				int index = 0;

				List<String> queries = new ArrayList<>();

				SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss_SS");
				SimpleDateFormat startDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
				String startTime = startDateFormat.format(new Date());
				String batchId = clientData.getUserId() + "_" + clientData.getUserPackage().getPackageId() + "_" + clientData.getUserPackage().getPackageName() + "_" + sdf.format(new Date());

				while (datarow != null)
				{
					if( datarow.length < colslen )
					{
						// TODO add other as null
						datarow = reader.readNext();
						continue;
					}

					StringBuilder insertQuery = new StringBuilder(insertScript);

					for (int i = 0; i < colslen; i++)
					{
						Column column = tColumns.get(i);
						String colname = column.getColumnName();
						String datatype = column.getDataType();

						int colIndex = columns.indexOf(colname);

						String value = datarow[colIndex];

						if( StringUtils.isEmpty(value) )
						{
							insertQuery.append("coalesce(null,DEFAULT(").append(colname).append(")) ");

						}
						else
						{
							if( "text".equalsIgnoreCase(datatype) || "varchar".equalsIgnoreCase(datatype) )
							{
								value = value.replaceAll("'", "''");
								insertQuery.append("'").append(value).append("'");
							}
							else if( "datetime".equalsIgnoreCase(datatype) )
							{
								insertQuery.append("'").append(value).append("'");
							}
							else
							{
								if( NumberUtils.isNumber(value) || "bit".equalsIgnoreCase(datatype) )
								{
									insertQuery.append(value);
								}
								else
								{
									value = value.replaceAll("'", "''");
									insertQuery.append("'").append(value).append("'");
								}

							}
						}

						if( i < colslen - 1 )
						{
							insertQuery.append(", ");

						}
					}

					insertQuery.append(" \n )");

					queries.add(insertQuery.toString());
					total++;
					index++;

					if( index % 10000 == 0 )
					{
						String[] querriesArr = queries.toArray(new String[0]);
						int updates = dbOp.batchExecute(querriesArr, tableName, clientSchemaName, clientData.getUserPackage().getPackageId() + "", clientData.getUserPackage().getPackageName(), clientData.getUserId(), batchId);

						success += updates;
						fail += (queries.size() - updates);

						queries.clear();
						index = 0;
						logger.debug("executed records : " + total);
					}

					datarow = reader.readNext();
				}

				if( queries.size() > 0 )
				{
					String[] querriesArr = queries.toArray(new String[0]);
					int updates = dbOp.batchExecute(querriesArr, tableName, clientSchemaName, clientData.getUserPackage().getPackageId() + "", clientData.getUserPackage().getPackageName(), clientData.getUserId(), batchId);

					success += updates;
					fail += (queries.size() - updates);
				}

				String endTime = startDateFormat.format(new Date());
				StringBuilder loadSummerySql = new StringBuilder("INSERT INTO ");
				loadSummerySql.append(clientSchemaName).append(".ETL_JOB_LOAD_SMRY (DataSource_Id,BATCH_ID, JOB_NAME, SRC_COUNT, TGT_INSERT_COUNT, ERROR_ROWS_COUNT, JOB_START_DATETIME, JOB_END_DATETIME, JOB_RUN_STATUS, JOB_LOG_FILE_LINK, ADDED_DATETIME, ADDED_USER) VALUES( ");
				loadSummerySql.append("'").append("unknown").append("', ").append("'").append(batchId).append("', '").append(tableName).append("', ").append(total).append(", ").append(success).append(", ").append(fail).append(", '").append(startTime).append("', '").append(endTime)
						.append("', 'Success', 'unknown', now(), 'Custom');");
				try
				{
					dbOp.getJdbcTemplate().update(loadSummerySql.toString());
				}
				catch ( Exception er )
				{
				}

				logger.debug("Total Records : {} ", total);
				logger.debug("Sccuess Records : {} ", success);
				logger.debug("Failed Records : {} ", fail);
				logger.debug("Duplicate Records : {} ", duplicates);

				result.put("totalRecords", total);
				result.put("successRecords", success);
				result.put("failedRecords", fail);
				result.put("duplicateRecords", duplicates);
			}
			finally
			{
				logger.debug("Closing CSV reader object .. ");
				if( reader != null ) reader.close();
			}
		}

		return result;
	}

	public Map<String, Object> processCSVDataBatchWithSqlsBatch(ClientData clientData, DataSource dataSource, String separatorChar, String stringQuoteChar, String clientSchemaName) throws Exception
	{

		Map<String, Object> result = new HashMap<>();
		Table table = clientData.getUserPackage().getTable();
		logger.debug("processing csv data batch.. ");

		boolean valid = isValidCSV();

		if( valid )
		{

			CSVReader reader = null;

			try
			{
				reader = createReader(separatorChar, stringQuoteChar);

				List<String> columns = processCsvHeader(reader);

				logger.debug("columns before applying pattern : {}", columns);

				for (int i = 0; i < columns.size(); i++)
				{
					String col = columns.get(i);
					col = col.trim().replaceAll("\\s+", "_");
					columns.set(i, col);
				}

				logger.debug("columns after applying pattern : {}", columns);

				String tableName = table.getTableName();
				String schemaName = table.getSchemaName();

				List<Column> tColumns = table.getColumns();
				int colslen = tColumns.size();

				logger.debug("Schema Name : {} --> Table Name : {} ", schemaName, tableName);

				logger.debug("Columns Size : {} ", colslen);

				String[] datarow = reader.readNext();

				String insertScript = buildInsertScriptForPreparedStatement(table);

				DBDataOperations dbOp = new DBDataOperations();
				dbOp.setDataSource(dataSource);

				int total = 0, success = 0, fail = 0, duplicates = 0;

				int index = 0;

				SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss_SS");
				SimpleDateFormat startDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
				String startTime = startDateFormat.format(new Date());
				String batchId = clientData.getUserId() + "_" + clientData.getUserPackage().getPackageId() + "_" + clientData.getUserPackage().getPackageName() + "_" + sdf.format(new Date());
				List<Object[]> dataRows = new ArrayList<>();
				while (datarow != null)
				{
					if( datarow.length < colslen )
					{
						// TODO add other as null
						datarow = reader.readNext();
						continue;
					}
					Object[] rowData = new Object[colslen];

					for (int i = 0; i < colslen; i++)
					{
						Column column = tColumns.get(i);
						String colname = column.getColumnName();
						String defaultValue = column.getDefaultValue();
						int colIndex = columns.indexOf(colname);

						String value = datarow[colIndex];

						if( StringUtils.isEmpty(value) )
						{
							if( StringUtils.isNotEmpty(defaultValue) )
							{
								value = defaultValue;
							}
							else
							{
								value = null;
							}
						}
						rowData[i] = value;
					}

					dataRows.add(rowData);
					total++;
					index++;

					if( index % 10000 == 0 )
					{
						int updates = dbOp.batchExecute(insertScript, dataRows, tableName, clientSchemaName, clientData.getUserPackage().getPackageId() + "", clientData.getUserPackage().getPackageName(), clientData.getUserId(), batchId);

						success += updates;
						fail += (dataRows.size() - updates);

						dataRows.clear();
						index = 0;
						logger.debug("executed records : " + total);
					}

					datarow = reader.readNext();
				}

				if( dataRows.size() > 0 )
				{
					int updates = dbOp.batchExecute(insertScript, dataRows, tableName, clientSchemaName, clientData.getUserPackage().getPackageId() + "", clientData.getUserPackage().getPackageName(), clientData.getUserId(), batchId);

					success += updates;
					fail += (dataRows.size() - updates);
				}

				String endTime = startDateFormat.format(new Date());
				StringBuilder loadSummerySql = new StringBuilder("INSERT INTO ");
				loadSummerySql.append(clientSchemaName).append(".ETL_JOB_LOAD_SMRY (DataSource_Id,BATCH_ID, JOB_NAME, SRC_COUNT, TGT_INSERT_COUNT, ERROR_ROWS_COUNT, JOB_START_DATETIME, JOB_END_DATETIME, JOB_RUN_STATUS, JOB_LOG_FILE_LINK, ADDED_DATETIME, ADDED_USER) VALUES( ");
				loadSummerySql.append("'").append("unknown").append("', ").append("'").append(batchId).append("', '").append(tableName).append("', ").append(total).append(", ").append(success).append(", ").append(fail).append(", '").append(startTime).append("', '").append(endTime)
						.append("', 'Success', 'unknown', now(), 'Custom');");
				try
				{
					dbOp.getJdbcTemplate().update(loadSummerySql.toString());
				}
				catch ( Exception er )
				{
					er.printStackTrace();
				}

				logger.debug("Total Records : {} ", total);
				logger.debug("Sccuess Records : {} ", success);
				logger.debug("Failed Records : {} ", fail);
				logger.debug("Duplicate Records : {} ", duplicates);

				result.put("totalRecords", total);
				result.put("successRecords", success);
				result.put("failedRecords", fail);
				result.put("duplicateRecords", duplicates);
			}
			finally
			{
				logger.debug("Closing CSV reader object .. ");
				if( reader != null ) reader.close();
			}
		}

		return result;
	}

	public Map<String, Object> processCSVDataBatchWithSpring(ClientData clientData, DataSource dataSource, String separatorChar, String stringQuoteChar, String clientSchemaName) throws Exception
	{

		Map<String, Object> result = new HashMap<>();
		Table table = clientData.getUserPackage().getTable();
		logger.debug("processing csv data batch.. ");

		boolean valid = isValidCSV();

		if( valid )
		{

			CSVReader reader = null;

			try
			{
				reader = createReader(separatorChar, stringQuoteChar);

				List<String> columns = processCsvHeader(reader);

				logger.debug("columns before applying pattern : {}", columns);

				for (int i = 0; i < columns.size(); i++)
				{
					String col = columns.get(i);
					col = col.trim().replaceAll("\\s+", "_");
					columns.set(i, col);
				}

				logger.debug("columns after applying pattern : {}", columns);

				String tableName = table.getTableName();
				String schemaName = table.getSchemaName();

				List<Column> tColumns = table.getColumns();
				int[] argsType = getArgsType(table);
				int colslen = tColumns.size();

				logger.debug("Schema Name : {} --> Table Name : {} ", schemaName, tableName);

				logger.debug("Columns Size : {} ", colslen);

				String[] datarow = reader.readNext();

				String insertScript = buildInsertScriptForPreparedStatement(table);

				BatchExecutionProcesser batchExecutionProcesser = new BatchExecutionProcesser(insertScript, argsType, dataSource);

				int total = 0, duplicates = 0;

				int index = 0;

				List<Object[]> queries = new ArrayList<>();

				while (datarow != null)
				{
					if( datarow.length < colslen )
					{
						// TODO add other as null
						datarow = reader.readNext();
						continue;
					}

					Object[] rowdata = new Object[colslen];
					for (int i = 0; i < colslen; i++)
					{
						Column column = tColumns.get(i);
						String colname = column.getColumnName();
						int colIndex = columns.indexOf(colname);
						String defaultValue = column.getDefaultValue();
						String value = datarow[colIndex];

						if( StringUtils.isEmpty(value) )
						{
							rowdata[i] = defaultValue;
						}
						else
						{
							rowdata[i] = value;
						}
					}

					queries.add(rowdata);
					total++;
					index++;

					if( index % 1000 == 0 )
					{
						batchExecutionProcesser.executeSpringBatch(queries);
						queries.clear();
						index = 0;
						logger.debug("executed records : " + total);
					}
					datarow = reader.readNext();
				}

				if( queries.size() > 0 )
				{
					batchExecutionProcesser.executeSpringBatch(queries);
				}

				logger.debug("Total Records : {} ", batchExecutionProcesser.getTotalCount());
				logger.debug("Sccuess Records : {} ", batchExecutionProcesser.getInsertedCount());
				logger.debug("Failed Records : {} ", batchExecutionProcesser.getFailedCount());
				logger.debug("Duplicate Records : {} ", 0);

				result.put("totalRecords", batchExecutionProcesser.getTotalCount());
				result.put("successRecords", batchExecutionProcesser.getInsertedCount());
				result.put("failedRecords", batchExecutionProcesser.getFailedCount());
				result.put("duplicateRecords", duplicates);
			}
			finally
			{
				logger.debug("Closing CSV reader object .. ");
				if( reader != null ) reader.close();
			}
		}

		return result;
	}

	public static class DBDataOperations extends JdbcDaoSupport
	{

		private static final Logger logger = LoggerFactory.getLogger(DBDataOperations.class);

		public boolean executeQuery(String query)
		{

			boolean status = false;
			try
			{

				int count = getJdbcTemplate().update(query);

				status = count > 0;
			}
			catch ( Exception e )
			{
				logger.error("Error while exeucting ", e.getMessage());
			}

			return status;
		}

		public boolean checkRecordExist(String query)
		{

			boolean exist = false;

			try
			{
				Integer count = getJdbcTemplate().queryForObject(query, Integer.class);

				exist = (count != null && count.intValue() > 0);

			}
			catch ( Exception e )
			{
				logger.error("Error while checking for existing record", e);
			}

			return exist;
		}

		public int batchExecute(String[] queries, String tableName, String clientStagingSchemaName, String packageId, String packageName, String userId, String batchId)
		{
			int exes = 0;

			try
			{

				int updates = getJdbcTemplate().execute(new StatementCallback<Integer>()
				{
					@Override
					public Integer doInStatement(Statement stmt) throws SQLException, DataAccessException
					{
						int successCount = 0;

						String failureSql = "INSERT INTO " + clientStagingSchemaName + ".ETL_JOB_ERROR_LOG ( DataSource_Id, BATCH_ID, ERROR_CODE, ERROR_TYPE, ERROR_MSG, ERROR_SYNTAX, ADDED_DATETIME, ADDED_USER) VALUES( ";
						for (String sqlStmt : queries)
						{
							try
							{
								int insertedStatus = stmt.executeUpdate(sqlStmt);
								if( insertedStatus == 1 )
								{
									successCount++;
								}
							}
							catch ( Exception e )
							{
								e.printStackTrace();
								StringBuilder sb = new StringBuilder(failureSql);
								String errMessage = e.getMessage().replaceAll("'", "''");
								sb.append("'").append("unknown").append("', ").append("'").append(batchId).append("', ").append(1).append(",'").append("Data Error").append("','").append(errMessage).append("','").append(errMessage).append("', now(),'Custom')");
								try
								{
									stmt.executeUpdate(sb.toString());
								}
								catch ( Exception er )
								{
									er.printStackTrace();
								}
							}
						}

						return successCount;
					}
				});

				exes = updates;
			}
			catch ( Exception e )
			{
				e.printStackTrace();
				logger.error("Error while executing batch", e);
			}

			return exes;
		}

		public int batchExecute(String query, List<Object[]> params, String tableName, String clientStagingSchemaName, String packageId, String packageName, String userId, String batchId)
		{

			String failureSql = "INSERT INTO " + clientStagingSchemaName + ".ETL_JOB_ERROR_LOG ( DataSource_Id, BATCH_ID, ERROR_CODE, ERROR_TYPE, ERROR_MSG, ERROR_SYNTAX, DATA_VALUE_SET, ADDED_DATETIME, ADDED_USER) VALUES( 'unknown', '" + batchId + "', 1, 'Data Error', '', '', ?, now(),'Custom' )";
			int successCount = 0;
			try
			{
				List<String> errTrackParams = new ArrayList<>();
				int[] batchUpdate = getJdbcTemplate().batchUpdate(query, params);

				int rowCount = 0;
				for (int status : batchUpdate)
				{
					if( status == 1 )
					{
						successCount++;
					}
					else
					{
						errTrackParams.add(Arrays.toString(params.get(rowCount)));
					}
					rowCount++;
				}
				updateErrorLogByMessage(failureSql, errTrackParams);

			}
			catch ( Exception e )
			{
				e.printStackTrace();
				logger.error("Error while executing batch", e.getMessage());
			}

			return successCount;
		}

		public int plainBatchExecute(String query, List<Object[]> params, String tableName, String clientStagingSchemaName, String packageId, String packageName, String userId, String batchId)
		{

			String failureSql = "INSERT INTO " + clientStagingSchemaName + ".ETL_JOB_ERROR_LOG ( DataSource_Id, BATCH_ID, ERROR_CODE, ERROR_TYPE, ERROR_MSG, ERROR_SYNTAX, DATA_VALUE_SET, ADDED_DATETIME, ADDED_USER) VALUES( 'unknown', '" + batchId + "', 1, 'Data Error', '', '', ?, now(),'Custom' )";
			int successCount = 0;
			try
			{
				List<String> errTrackParams = new ArrayList<>();

				int[] batchUpdate = batchUpdate(query, params);

				int rowCount = 0;
				for (int status : batchUpdate)
				{
					if( status == 1 )
					{
						successCount++;
					}
					else
					{
						errTrackParams.add(Arrays.toString(params.get(rowCount)));
					}
					rowCount++;
				}
				updateErrorLogByMessage(failureSql, errTrackParams);

			}
			catch ( Exception e )
			{
				e.printStackTrace();
				logger.error("Error while executing batch", e.getMessage());
			}

			return successCount;
		}

		private int[] batchUpdate(String query, List<Object[]> params) throws SQLException
		{
			Connection connection = null;
			PreparedStatement pStatement = null;
			try
			{
				connection = getDataSource().getConnection();
				pStatement = connection.prepareStatement(query);

				for (Object[] dataRowObj : params)
				{
					int objLength = dataRowObj.length;
					for (int i = 0; i < objLength; i++)
					{
						pStatement.setObject(i + 1, dataRowObj[i]);
					}
					pStatement.addBatch();
					pStatement.clearParameters();
				}

				return pStatement.executeBatch();
			}
			finally
			{
				closeObject(pStatement);
				closeObject(connection);

			}
		}

		public static void closeObject(Connection connection)
		{
			try
			{
				if( connection != null && !connection.isClosed() )
				{
					connection.close();
				}
			}
			catch ( Exception e )
			{
			}
		}

		public static void closeObject(Statement statement)
		{
			try
			{
				if( statement != null && !statement.isClosed() )
				{
					statement.close();
				}
			}
			catch ( Exception e )
			{
			}
		}

		public int updateErrorLog(String query, List<List<Object>> params)
		{
			int updates = 0;

			try
			{

				updates = getJdbcTemplate().execute(query, new PreparedStatementCallback<Integer>()
				{

					@Override
					public Integer doInPreparedStatement(PreparedStatement ps) throws SQLException, DataAccessException
					{

						for (List<Object> list : params)
						{
							try
							{
								for (int i = 0, j = 1; i < list.size(); i++, j++)
								{
									ps.setObject(j, list.get(i));
								}
								ps.executeUpdate();
							}
							catch ( Exception e )
							{
								  e.printStackTrace();
							}
						}
						return params.size();
					}
				});

			}
			catch ( Exception e )
			{
				e.printStackTrace();
				logger.error("Error while executing batch", e.getMessage());
			}

			return updates;
		}

		public int updateErrorLogByMessage(String query, List<String> params)
		{
			int updates = 0;

			try
			{

				updates = getJdbcTemplate().execute(query, new PreparedStatementCallback<Integer>()
				{

					@Override
					public Integer doInPreparedStatement(PreparedStatement ps) throws SQLException, DataAccessException
					{

						for (String message : params)
						{
							ps.setObject(1, message);
							ps.addBatch();
						}
						ps.executeBatch();
						return params.size();
					}
				});

			}
			catch ( Exception e )
			{
				e.printStackTrace();
				logger.error("Error while executing batch", e.getMessage());
			}

			return updates;
		}

	}

	public List<List<String>> processCSVDataForPreview(String separatorChar, String stringQuoteChar) throws Exception
	{

		List<List<String>> processedData = new ArrayList<>();
		logger.debug("processing csv data .. ");

		boolean valid = isValidCSV();

		if( valid )
		{

			CSVReader reader = null;

			try
			{
				reader = createReader(separatorChar, stringQuoteChar);
				List<String> columns = processCsvHeader(reader);
				processedData.add(columns);
				int colslen = columns.size();
				int total = 0;
				String[] datarow = reader.readNext();
				List<String> row = null;
				while (datarow != null)
				{
					if( total > 10 ) break;
					row = new ArrayList<>();
					for (int i = 0; i < colslen; i++)
					{
						row.add(datarow[i]);
					}
					processedData.add(row);
					total++;
					datarow = reader.readNext();
				}
			}
			finally
			{
				logger.debug("Closing CSV reader object .. ");
				if( reader != null ) reader.close();
			}
		}

		return processedData;
	}

	public List<String> getColumnsDataType(String separatorChar, String stringQuoteChar) throws IOException
	{
		logger.debug("get column data types of csv file.. ");
		List<String> datatypes = new ArrayList<>();

		boolean valid = isValidCSV();

		if( valid )
		{
			CSVReader reader = null;

			try
			{
				reader = createReader(separatorChar, stringQuoteChar);
				int count = 0;
				String[] datarow = reader.readNext();

				while (datarow != null)
				{
					int colslen = datarow.length;
					for (int i = 0; i < colslen; i++)
					{
						String value = datarow[i];

						if( value.matches("^[-]?[0-9*]{1,10}$") )
						{
							datatypes.add("INT");
						}
						else if( value.matches("^[-]?[0-9]{10,}$") )
						{
							datatypes.add("BIGINT");
						}
						else if( value.matches("^[0-1]{1}$") )
						{
							datatypes.add("BIT");
						}
						else if( value.matches("^([-]?\\d*\\.\\d*)$") )
						{
							datatypes.add("FLOAT");
						}
						else if( value.matches("[0-9a-zA-z!\"\',/@#$*\\s]*") )
						{
							datatypes.add("VARCHAR");
						}
						else
						{
							datatypes.add("VARCHAR");
						}
					}
					datarow = reader.readNext();
					count++;

					if( count < 1 )
					{
						continue;
					}
					else break;
				}

			}
			finally
			{
				logger.debug(" Closing CSV Reader Object .. ");
				if( reader != null ) reader.close();
			}
		}
		else
		{
			logger.info("Given CSV file is not valid : {}", FILE_PATH);
		}

		return datatypes;
	}

	public List<LinkedHashMap<String, Object>> parseCSVToListOfMap(String csvFilepath, String separatorChar, String stringQuoteChar) throws IOException
	{
		LinkedHashMap<String, Object> map;
		List<LinkedHashMap<String, Object>> parsedCSVToListMap = new ArrayList<>();
		CSVReader reader = null;
		try
		{
			reader = createReader(separatorChar, stringQuoteChar);
			List<String> headers = processCsvHeader(reader);
			String[] data = reader.readNext();
			while (data != null)
			{
				map = new LinkedHashMap<String, Object>();
				for (int i = 0; i < headers.size(); i++)
				{
					Object obj = data[i].isEmpty() ? null : data[i];
					map.put(headers.get(i), obj);
				}
				parsedCSVToListMap.add(map);
				data = reader.readNext();
			}
		}
		catch ( Exception e )
		{
			e.printStackTrace();
		}
		finally
		{
			logger.debug(" Closing CSV Reader Object .. ");
			if( reader != null ) reader.close();
		}
		return parsedCSVToListMap;
	}

	public boolean hasData(String absolutePath, String separatorChar, String stringQuoteChar)
	{

		CSVReader reader = null;

		try
		{
			reader = createReader(separatorChar, stringQuoteChar);
			String[] datarow = reader.readNext();
			int rowno = 0;
			while (datarow != null)
			{
				rowno++;
				if( rowno > 1 ) return true;
			}
		}
		catch ( Exception e )
		{
			e.printStackTrace();
		}
		finally
		{
			if( reader != null )
			{
				try
				{
					reader.close();
				}
				catch ( IOException e )
				{
					e.printStackTrace();
				}
			}
		}
		return false;
	}
}
