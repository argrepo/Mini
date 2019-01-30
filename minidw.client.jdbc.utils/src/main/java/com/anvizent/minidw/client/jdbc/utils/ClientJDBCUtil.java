package com.anvizent.minidw.client.jdbc.utils;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import org.apache.commons.lang.StringUtils;

/**
 * Hello world!
 *
 */
public class ClientJDBCUtil {
	public static Connection getClientDataBaseConnection(int connectorID, String serverIPAndPort, String userName,
			String password,String driverName,String protocal)
			throws SQLException, InstantiationException, IllegalAccessException, ClassNotFoundException {
		Connection connection = null;
		String driver = driverName;
		String url = protocal+serverIPAndPort;

		if (url != null) {
			
			if (driver != null && url != null) {
				Class.forName(driver).newInstance();
				if (StringUtils.isNotEmpty(userName) && StringUtils.isNotEmpty(password))
				{
					connection = DriverManager.getConnection(url, userName, password);
				}else if (StringUtils.isNotEmpty(userName)){
					connection = DriverManager.getConnection(url, userName, "");
				}else{
					connection = DriverManager.getConnection(url);
				}

			}
		}
		return connection;
	}


}
