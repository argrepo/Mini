/**
 * 
 */
package com.datamodel.anvizent.service.dao.impl;

import java.sql.SQLException;

import javax.sql.DataSource;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.support.JdbcDaoSupport;
import org.springframework.transaction.PlatformTransactionManager;

import com.datamodel.anvizent.common.sql.SqlHelper;
import com.datamodel.anvizent.service.dao.MasterDao;

public class MasterDaoImpl extends JdbcDaoSupport implements MasterDao {

	private SqlHelper sqlHelper;
	protected static final Log LOG = LogFactory.getLog(MasterDaoImpl.class);
	PlatformTransactionManager transactionManager = null;
	
	
	public MasterDaoImpl(DataSource dataSource) {
		setDataSource(dataSource);
		try {
			this.sqlHelper = new SqlHelper(MasterDaoImpl.class);
		} catch (SQLException ex) {
			throw new DataAccessResourceFailureException("Error creating QuartzDaoImpl SqlHelper.", ex);
		}
	}
	
}
