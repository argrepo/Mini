package com.anvizent.minidw.client.jdbc.utils;

public class Constants {

	public static class Database {
		public static final int MYSQL = 1;

	}

	final public class DataBaseDrivers { 
		private DataBaseDrivers() {
		}

		public static final String MYSQL_DRIVER_CLASS = "com.mysql.jdbc.Driver";

	}

	final public class DataBaseDriverURL {
		private DataBaseDriverURL() {
		}

		public static final String MYSQL_DB_URL = "jdbc:mysql://";
	}

	final public class DataBaseDriverType {
		private DataBaseDriverType() {
		}

		public static final String MYSQL_DB_TYPE = "mysql";
		public static final String SQLSERVER_DB_TYPE = "sqlserver";
		public static final String MSACCESS_DB_TYPE = "ucanaccess";
		public static final String ORACLE_DB_TYPE = "oracle";
		public static final String DB2_DB_TYPE = "db2";
		public static final String SALESFORCE_DB_TYPE = "sforce";
		public static final String DB2AS400_DB_TYPE = "as400";
		public static final String POSTGRESQL_DB_TYPE = "postgresql";
		public static final String MICROFOCUS_DB_TYPE = "vortex";
		public static final String ODBC_DB_TYPE = "odbc";
		public static final String OPENEDGE_DB_TYPE = "openedge";
	}

}
