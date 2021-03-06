package com.datamodel.anvizent.service.dao.impl;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import javax.sql.DataSource;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.support.JdbcDaoSupport;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;

import com.datamodel.anvizent.common.exception.AnvizentDuplicateFileNameException;
import com.datamodel.anvizent.common.exception.AnvizentRuntimeException;
import com.datamodel.anvizent.common.sql.SqlHelper;
import com.datamodel.anvizent.common.sql.SqlNotFoundException;
import com.datamodel.anvizent.service.dao.WebServiceDao;
import com.datamodel.anvizent.service.model.Modification;
import com.datamodel.anvizent.service.model.OAuth2;
import com.datamodel.anvizent.service.model.TimeZones;
import com.datamodel.anvizent.service.model.WebServiceApi;
import com.datamodel.anvizent.service.model.WebServiceAuthenticationTypes;
import com.datamodel.anvizent.service.model.WebServiceConnectionMaster;
import com.datamodel.anvizent.service.model.WebServiceTemplateAuthRequestparams;
import com.datamodel.anvizent.service.model.WebServiceTemplateMaster;

/**
 * 
 * @author rajesh.anthari
 *
 */
public class WebServiceDaoImpl extends JdbcDaoSupport implements WebServiceDao {

	protected static final Log LOG = LogFactory.getLog(WebServiceDaoImpl.class);

	private SqlHelper sqlHelper;

	public WebServiceDaoImpl(DataSource dataSource) {
		setDataSource(dataSource);
		try {
			this.sqlHelper = new SqlHelper(WebServiceDaoImpl.class);
		} catch (SQLException ex) {
			throw new DataAccessResourceFailureException("Error creating WebServiceDaoImpl SqlHelper.", ex);
		}
	}

	public WebServiceTemplateMaster getWebserviceTempleteDetails(Long wsTemplateId, String clientId, JdbcTemplate clientAppDbJdbcTemplate) {
		String masterSql = "";
		String requestParamsSql = "";
		WebServiceTemplateMaster webServiceTemplateMaster = null;
		List<WebServiceTemplateAuthRequestparams> webServiceTemplateAuthRequestparams = null;
		try {
			masterSql = sqlHelper.getSql("getWebserviceTemplateMaster");
			requestParamsSql = sqlHelper.getSql("getWebserviceTemplateRequestMappings");

			webServiceTemplateMaster = clientAppDbJdbcTemplate.query(masterSql, new Object[] { clientId, wsTemplateId },
					new ResultSetExtractor<WebServiceTemplateMaster>() {

						@Override
						public WebServiceTemplateMaster extractData(ResultSet rs) throws SQLException, DataAccessException {

							if (rs != null && rs.next()) {

								WebServiceTemplateMaster webServiceTemplateMaster = new WebServiceTemplateMaster();

								webServiceTemplateMaster.setId(rs.getLong("web_service_template_id"));
								webServiceTemplateMaster.setWebServiceName(rs.getString("web_service_name"));

								WebServiceAuthenticationTypes webServiceAuthenticationTypes = new WebServiceAuthenticationTypes();
								webServiceAuthenticationTypes.setId(rs.getLong("authentication_type_id"));
								webServiceAuthenticationTypes.setAuthenticationType(rs.getString("authentication_type_name"));

								webServiceTemplateMaster.setWebServiceAuthenticationTypes(webServiceAuthenticationTypes);
								webServiceTemplateMaster.setBaseUrl(rs.getString("base_url"));
								webServiceTemplateMaster.setAuthenticationUrl(rs.getString("authentication_url"));
								webServiceTemplateMaster.setBaseUrlRequired(rs.getBoolean("base_url_required"));
								webServiceTemplateMaster.setAuthenticationMethodType(rs.getString("authentication_method_type"));
								webServiceTemplateMaster.setApiAuthRequestParams(rs.getString("api_auth_request_params"));
								webServiceTemplateMaster.setAuthenticationBodyParams(rs.getString("api_auth_request_body_params"));
								webServiceTemplateMaster.setApiAuthRequestHeaders(rs.getString("api_auth_request_headers"));
								webServiceTemplateMaster.setDateFormat(rs.getString("date_format"));
								webServiceTemplateMaster.setTimeZone(rs.getString("time_zone"));
								webServiceTemplateMaster.setWebserviceType(rs.getString("webservice_type"));
								webServiceTemplateMaster.setSoapBodyElement(rs.getString("soap_body_element"));
								webServiceTemplateMaster.setApiAuthBodyParams(rs.getString("api_auth_body_params"));
								webServiceTemplateMaster.setSslDisable(rs.getBoolean("ssl_disable"));
								OAuth2 oauth = new OAuth2();
								oauth.setRedirectUrl(rs.getString("callback_url"));
								oauth.setAccessTokenUrl(rs.getString("access_token_url"));
								oauth.setGrantType(rs.getString("grant_type"));
								oauth.setClientIdentifier(rs.getString("clientid"));
								oauth.setClientSecret(rs.getString("client_secret"));
								oauth.setScope(rs.getString("scope"));
								oauth.setState(rs.getString("state"));
								webServiceTemplateMaster.setoAuth2(oauth);
								return webServiceTemplateMaster;
							} else {
								return null;
							}

						}

					});

			if (webServiceTemplateMaster != null) {
				webServiceTemplateAuthRequestparams = clientAppDbJdbcTemplate.query(requestParamsSql, new Object[] { wsTemplateId },
						new RowMapper<WebServiceTemplateAuthRequestparams>() {

							@Override
							public WebServiceTemplateAuthRequestparams mapRow(ResultSet rs, int rowNum) throws SQLException {
								WebServiceTemplateAuthRequestparams webServiceTemplateAuthRequestparams = new WebServiceTemplateAuthRequestparams();
								webServiceTemplateAuthRequestparams.setId(rs.getLong("id"));
								webServiceTemplateAuthRequestparams.setWsTemplateId(rs.getLong("ws_template_id"));
								webServiceTemplateAuthRequestparams.setParamName(rs.getString("param_name"));
								webServiceTemplateAuthRequestparams.setMandatory(rs.getBoolean("is_mandatory"));
								webServiceTemplateAuthRequestparams.setPasswordType(rs.getBoolean("is_passwordtype"));
								webServiceTemplateAuthRequestparams.setCreatedBy(rs.getString("created_by"));
								webServiceTemplateAuthRequestparams.setCreatedTime(rs.getDate("created_time"));
								return webServiceTemplateAuthRequestparams;
							}

						});
				webServiceTemplateMaster.setWebServiceTemplateAuthRequestparams(webServiceTemplateAuthRequestparams);
			}

		} catch (Exception e) {
			throw new AnvizentRuntimeException(e);
		}
		return webServiceTemplateMaster;
	}

	public List<WebServiceAuthenticationTypes> getWebServiceAuthenticationTypes(JdbcTemplate clientAppDbJdbcTemplate) {
		List<WebServiceAuthenticationTypes> webServiceAuthenticationTypes = null;
		try {
			String sql = sqlHelper.getSql("getWebServiceAuthenticationTypes");

			webServiceAuthenticationTypes = clientAppDbJdbcTemplate.query(sql, new RowMapper<WebServiceAuthenticationTypes>() {

				@Override
				public WebServiceAuthenticationTypes mapRow(ResultSet rs, int rowNum) throws SQLException {
					WebServiceAuthenticationTypes webServiceAuthenticationTypes = new WebServiceAuthenticationTypes();
					webServiceAuthenticationTypes.setId(rs.getLong("id"));
					webServiceAuthenticationTypes.setAuthenticationType(rs.getString("authentication_type"));
					webServiceAuthenticationTypes.setActive(rs.getBoolean("isActive"));
					return webServiceAuthenticationTypes;
				}

			});

		} catch (Exception e) {
			throw new AnvizentRuntimeException(e);
		}
		return webServiceAuthenticationTypes;
	}

	@Override
	public int saveWebServiceTemplate(WebServiceTemplateMaster webServiceTemplateMaster, JdbcTemplate clientAppDbJdbcTemplate) {
		Long templateIdTemp = 0L;
		int updatedCount = 0;
		try {

			KeyHolder keyHolder = new GeneratedKeyHolder();
			String saveWebServiceTemplate = sqlHelper.getSql("saveWebServiceTemplate");
			if (webServiceTemplateMaster.getId() != null) {
				saveWebServiceTemplate = sqlHelper.getSql("updateWebServiceTemplate");
			}
			String saveWebServiceTemplateFinal = saveWebServiceTemplate;
			updatedCount = clientAppDbJdbcTemplate.update(new PreparedStatementCreator() {

				@Override
				public PreparedStatement createPreparedStatement(Connection con) throws SQLException {
					PreparedStatement pst = con.prepareStatement(saveWebServiceTemplateFinal, new String[] { "id" });
					int psCount = 0;
					pst.setString(++psCount, webServiceTemplateMaster.getWebServiceName());
					pst.setLong(++psCount, webServiceTemplateMaster.getWebServiceAuthenticationTypes().getId());
					pst.setString(++psCount, webServiceTemplateMaster.getDateFormat());
					pst.setString(++psCount, webServiceTemplateMaster.getBaseUrl());
					pst.setString(++psCount, webServiceTemplateMaster.getAuthenticationUrl());
					pst.setBoolean(++psCount, webServiceTemplateMaster.isBaseUrlRequired());
					pst.setString(++psCount, webServiceTemplateMaster.getAuthenticationMethodType());
					pst.setString(++psCount, webServiceTemplateMaster.getApiAuthRequestParams());
					pst.setString(++psCount, webServiceTemplateMaster.getApiAuthBodyParams());
					pst.setString(++psCount, webServiceTemplateMaster.getApiAuthRequestHeaders());
					pst.setString(++psCount, webServiceTemplateMaster.getoAuth2().getRedirectUrl());
					pst.setString(++psCount, webServiceTemplateMaster.getoAuth2().getAccessTokenUrl());
					pst.setString(++psCount, webServiceTemplateMaster.getoAuth2().getResponseType());
					pst.setString(++psCount, webServiceTemplateMaster.getoAuth2().getGrantType());
					pst.setString(++psCount, webServiceTemplateMaster.getoAuth2().getClientIdentifier());
					pst.setString(++psCount, webServiceTemplateMaster.getoAuth2().getClientSecret());
					pst.setBoolean(++psCount, webServiceTemplateMaster.isActive());
					pst.setString(++psCount, webServiceTemplateMaster.getModification().getCreatedBy());
					pst.setString(++psCount, webServiceTemplateMaster.getModification().getCreatedTime());
					pst.setString(++psCount, webServiceTemplateMaster.getTimeZone());
					pst.setString(++psCount, webServiceTemplateMaster.getAuthenticationBodyParams());
					pst.setString(++psCount, webServiceTemplateMaster.getWebserviceType());
					pst.setString(++psCount, webServiceTemplateMaster.getSoapBodyElement());
					pst.setString(++psCount, webServiceTemplateMaster.getoAuth2().getScope());
					pst.setString(++psCount, webServiceTemplateMaster.getoAuth2().getState());
					pst.setBoolean(++psCount, webServiceTemplateMaster.isSslDisable());
					if (webServiceTemplateMaster.getId() != null) {
						pst.setLong(++psCount, webServiceTemplateMaster.getId());
					}

					return pst;
				}
			}, keyHolder);

			if (keyHolder != null) {
				Number autoIncrement = keyHolder.getKey();
				try {
					templateIdTemp = autoIncrement.longValue();
				} catch (Exception e) {
					templateIdTemp = new Long(webServiceTemplateMaster.getId());
				}
			}

			final long templateId = templateIdTemp.longValue();
			if (templateIdTemp != 0) {

				clientAppDbJdbcTemplate.update(sqlHelper.getSql("deleteWebServiceTemplateAuthenticationRequestParams"), templateIdTemp);

				if (webServiceTemplateMaster.getWebServiceTemplateAuthRequestparams() != null
						&& webServiceTemplateMaster.getWebServiceTemplateAuthRequestparams().size() > 0) {
					final String saveWebServiceTemplateAuthenticationRequestParams = sqlHelper.getSql("saveWebServiceTemplateAuthenticationRequestParams");

					clientAppDbJdbcTemplate.batchUpdate(saveWebServiceTemplateAuthenticationRequestParams, new BatchPreparedStatementSetter() {
						@Override
						public void setValues(PreparedStatement ps, int i) throws SQLException {
							ps.setLong(1, templateId);
							ps.setString(2, webServiceTemplateMaster.getWebServiceTemplateAuthRequestparams().get(i).getParamName());
							ps.setBoolean(3, webServiceTemplateMaster.getWebServiceTemplateAuthRequestparams().get(i).isMandatory());
							ps.setString(4, webServiceTemplateMaster.getModification().getCreatedBy());
							ps.setString(5, webServiceTemplateMaster.getModification().getCreatedTime());
							ps.setBoolean(6, webServiceTemplateMaster.getWebServiceTemplateAuthRequestparams().get(i).isPasswordType());
						}

						@Override
						public int getBatchSize() {
							System.out.println("webServiceTemplateMaster.getWebServiceTemplateAuthRequestparams().size() "
									+ webServiceTemplateMaster.getWebServiceTemplateAuthRequestparams().size());
							return webServiceTemplateMaster.getWebServiceTemplateAuthRequestparams().size();
						}
					});
				}
			}

		} catch (DuplicateKeyException ae) {
			LOG.error("error while saveWebServiceTemplate()", ae);
			throw new AnvizentDuplicateFileNameException(ae);
		} catch (DataAccessException ae) {
			LOG.error("error while saveWebServiceTemplate", ae);
			throw new AnvizentRuntimeException(ae);
		} catch (SqlNotFoundException e) {
			LOG.error("error while saveWebServiceTemplate", e);
			e.printStackTrace();
		}
		return updatedCount;
	}

	@Override
	public int saveWebserviceMasterConnectionMapping(String clientId, WebServiceConnectionMaster webServiceConnectionMaster, JdbcTemplate clientAppDbJdbcTemplate) {

		// TODO Auto-generated method stub
		int count = -1;
		try {
			String sql = sqlHelper.getSql("saveWebserviceMasterConnectionMapping");
			count = clientAppDbJdbcTemplate.update(sql,
					new Object[] { 
							webServiceConnectionMaster.getWebServiceConName(), 
							webServiceConnectionMaster.getWebServiceTemplateMaster().getTimeZone(),
							webServiceConnectionMaster.getBaseUrl(),
							webServiceConnectionMaster.getWsApiAuthUrl(), 
							webServiceConnectionMaster.isBaseUrlRequired(),
							webServiceConnectionMaster.getWebServiceTemplateMaster().getId(),
							webServiceConnectionMaster.getRequestParams(), 
							webServiceConnectionMaster.getBodyParams(),
							webServiceConnectionMaster.getAuthPathParams(),
							webServiceConnectionMaster.getHeaderKeyvalues(),
							webServiceConnectionMaster.getoAuth2().getAccessTokenUrl(),
							webServiceConnectionMaster.getoAuth2().getClientIdentifier(),
							webServiceConnectionMaster.getoAuth2().getClientSecret(),
							webServiceConnectionMaster.getoAuth2().getScope(),
							webServiceConnectionMaster.getoAuth2().getState(),
							webServiceConnectionMaster.getoAuth2().getAccessTokenValue(),
							webServiceConnectionMaster.getoAuth2().getRefreshTokenValue(),
							webServiceConnectionMaster.getModification().getCreatedBy(),
							webServiceConnectionMaster.getModification().getCreatedTime(),
							clientId,
							webServiceConnectionMaster.isActive(),
							webServiceConnectionMaster.getDataSourceName(),
							webServiceConnectionMaster.getWebServiceTemplateMaster().isSslDisable() });

		} catch (DuplicateKeyException ae) {
			LOG.error("error while saveWebserviceMasterConnectionMapping()", ae);
			throw new AnvizentDuplicateFileNameException(ae);
		} catch (DataAccessException ae) {
			LOG.error("error while saveHistoricalLoad()", ae);
			throw new AnvizentRuntimeException(ae);
		} catch (SqlNotFoundException e) {
			LOG.error("error while saveHistoricalLoad()", e);
			e.printStackTrace();
		}

		return count;
	}

	@Override
	public List<WebServiceConnectionMaster> getWebServiceConnections(String clientId, String userId, JdbcTemplate clientAppDbJdbcTemplate) {
		List<WebServiceConnectionMaster> webServiceConnectionMasterList = null;
		try {
			String sql = sqlHelper.getSql("getWebServiceConnections");
			webServiceConnectionMasterList = clientAppDbJdbcTemplate.query(sql, new Object[] { clientId, userId }, new RowMapper<WebServiceConnectionMaster>() {
				public WebServiceConnectionMaster mapRow(ResultSet rs, int i) throws SQLException {
					WebServiceConnectionMaster webServiceConnectionMaster = new WebServiceConnectionMaster();
					webServiceConnectionMaster.setId(rs.getLong("id"));
					webServiceConnectionMaster.setWebServiceConName(rs.getString("web_service_con_name"));
					webServiceConnectionMaster.setActive(rs.getBoolean("isActive"));
					return webServiceConnectionMaster;
				}
			});

		} catch (DataAccessException ae) {
			LOG.error("error while getWebServiceConnections()", ae);
			throw new AnvizentRuntimeException(ae);
		} catch (SqlNotFoundException e) {
			LOG.error("error while getWebServiceConnections()", e);
			e.printStackTrace();
		}
		return webServiceConnectionMasterList;
	}

	@Override
	public WebServiceConnectionMaster getWebServiceConnectionDetails(Long wsConId, String clientId, JdbcTemplate clientAppDbJdbcTemplate) {
		String sql = "";
		WebServiceConnectionMaster webServiceConnectionMaster = null;

		try {
			sql = sqlHelper.getSql("getWebServiceConnectionDetails");

			webServiceConnectionMaster = clientAppDbJdbcTemplate.query(sql, new Object[] { clientId, wsConId }, new ResultSetExtractor<WebServiceConnectionMaster>() {

				@Override
				public WebServiceConnectionMaster extractData(ResultSet rs) throws SQLException, DataAccessException {

					if (rs != null && rs.next()) {

						WebServiceConnectionMaster webServiceConnectionMaster = new WebServiceConnectionMaster();

						webServiceConnectionMaster.setId(rs.getLong("ws_con_id"));
						webServiceConnectionMaster.setWebServiceConName(rs.getString("web_service_con_name"));
						webServiceConnectionMaster.setRequestParams(rs.getString("auth_request_params"));
						webServiceConnectionMaster.setBodyParams(rs.getString("auth_body_params"));
					 
						webServiceConnectionMaster.setAuthPathParams(rs.getString("auth_path_params"));
						webServiceConnectionMaster.setHeaderKeyvalues(rs.getString("header_key_values"));
						webServiceConnectionMaster.setAuthenticationToken(rs.getString("authentication_token"));
						webServiceConnectionMaster.setAuthenticationRefreshToken(rs.getString("authentication_refresh_token"));
						webServiceConnectionMaster.setDataSourceName(rs.getString("data_source_name"));
						webServiceConnectionMaster.setActive(rs.getBoolean("wc_con_active_status"));
						WebServiceTemplateMaster webServiceTemplateMaster = new WebServiceTemplateMaster();

						webServiceTemplateMaster.setId(rs.getLong("ws_template_id"));
						webServiceTemplateMaster.setWebServiceName(rs.getString("ws_template_name"));

						WebServiceAuthenticationTypes webServiceAuthenticationTypes = new WebServiceAuthenticationTypes();
						webServiceAuthenticationTypes.setId(rs.getLong("authentication_type_id"));
						webServiceAuthenticationTypes.setAuthenticationType(rs.getString("authentication_type_name"));

						webServiceTemplateMaster.setWebServiceAuthenticationTypes(webServiceAuthenticationTypes);
						webServiceTemplateMaster.setBaseUrl(rs.getString("base_url"));
						webServiceTemplateMaster.setAuthenticationUrl(rs.getString("authentication_url"));
						webServiceTemplateMaster.setBaseUrlRequired(rs.getBoolean("base_url_required"));
						webServiceTemplateMaster.setAuthenticationMethodType(rs.getString("authentication_method_type"));
						webServiceTemplateMaster.setApiAuthRequestParams(rs.getString("api_auth_request_params"));
						webServiceTemplateMaster.setApiAuthBodyParams(rs.getString("api_auth_body_params"));
						webServiceTemplateMaster.setApiAuthRequestHeaders(rs.getString("api_auth_request_headers"));
						webServiceTemplateMaster.setAuthenticationBodyParams(rs.getString("api_auth_request_body_params"));
						webServiceTemplateMaster.setWebserviceType(rs.getString("webservice_type"));
						webServiceTemplateMaster.setSoapBodyElement(rs.getString("soap_body_element"));
						webServiceTemplateMaster.setSslDisable(rs.getBoolean("ssl_disable"));

						webServiceTemplateMaster.setDateFormat(rs.getString("date_format"));
						webServiceTemplateMaster.setTimeZone(rs.getString("time_zone"));

						OAuth2 oauth = new OAuth2();
						oauth.setRedirectUrl(rs.getString("callback_url"));
						oauth.setAccessTokenUrl(rs.getString("access_token_url"));
						oauth.setResponseType(rs.getString("response_type"));
						oauth.setClientIdentifier(rs.getString("clientid"));
						oauth.setClientSecret(rs.getString("client_secret"));
						oauth.setGrantType(rs.getString("grant_type"));
						oauth.setScope(rs.getString("scope"));
						oauth.setState(rs.getString("state"));
						webServiceTemplateMaster.setoAuth2(oauth);
						webServiceConnectionMaster.setWebServiceTemplateMaster(webServiceTemplateMaster);
						return webServiceConnectionMaster;
					} else {
						return null;
					}

				}

			});

			if (webServiceConnectionMaster != null) {
				String requestParamsSql = sqlHelper.getSql("getWebserviceTemplateRequestMappings");
				List<WebServiceTemplateAuthRequestparams> webServiceTemplateAuthRequestparams = clientAppDbJdbcTemplate.query(requestParamsSql,
						new Object[] { webServiceConnectionMaster.getWebServiceTemplateMaster().getId() },
						new RowMapper<WebServiceTemplateAuthRequestparams>() {

							@Override
							public WebServiceTemplateAuthRequestparams mapRow(ResultSet rs, int rowNum) throws SQLException {
								WebServiceTemplateAuthRequestparams webServiceTemplateAuthRequestparams = new WebServiceTemplateAuthRequestparams();
								webServiceTemplateAuthRequestparams.setId(rs.getLong("id"));
								webServiceTemplateAuthRequestparams.setWsTemplateId(rs.getLong("ws_template_id"));
								webServiceTemplateAuthRequestparams.setParamName(rs.getString("param_name"));
								webServiceTemplateAuthRequestparams.setMandatory(rs.getBoolean("is_mandatory"));
								webServiceTemplateAuthRequestparams.setPasswordType(rs.getBoolean("is_passwordtype"));
								return webServiceTemplateAuthRequestparams;
							}

						});
				webServiceConnectionMaster.getWebServiceTemplateMaster().setWebServiceTemplateAuthRequestparams(webServiceTemplateAuthRequestparams);
			}

		} catch (Exception e) {
			throw new AnvizentRuntimeException(e);
		}
		return webServiceConnectionMaster;
	}
 
	@Override
	public List<WebServiceApi> getWebServiceApiDetails(Long wsConId, Long ilId, String clientId, JdbcTemplate clientAppDbJdbcTemplate) {
		List<WebServiceApi> webServiceApiList = null;
		try {
			String sql = sqlHelper.getSql("getWebServiceApiDetails");
			webServiceApiList = clientAppDbJdbcTemplate.query(sql, new Object[] { clientId, ilId, wsConId }, new RowMapper<WebServiceApi>() {
				public WebServiceApi mapRow(ResultSet rs, int i) throws SQLException {
					WebServiceApi webServiceApi = new WebServiceApi();
					webServiceApi.setId(rs.getLong("id"));
					webServiceApi.setApiName(rs.getString("api_name"));
					webServiceApi.setBaseUrl(rs.getString("base_url"));
					webServiceApi.setApiUrl(rs.getString("api_url"));
					webServiceApi.setBaseUrlRequired(rs.getBoolean("base_url_required"));
					webServiceApi.setApiMethodType(rs.getString("api_method_type"));
					webServiceApi.setApiPathParams(rs.getString("api_path_params"));
					webServiceApi.setApiRequestParams(rs.getString("api_request_params"));
					webServiceApi.setResponseColumnObjectName(rs.getString("response_column_object_name"));
					webServiceApi.setResponseObjectName(rs.getString("response_object_name"));
					webServiceApi.setActive(rs.getBoolean("mapping_active_status"));
					webServiceApi.setIncrementalUpdate(rs.getBoolean("incremental_update"));
					webServiceApi.setIncrementalUpdateparamdata(rs.getString("incremental_update_params"));
					webServiceApi.setApiBodyParams(rs.getString("api_body_params"));
					webServiceApi.setPaginationRequired(rs.getBoolean("pagination_required"));
					webServiceApi.setPaginationType(rs.getString("pagination_type"));
					webServiceApi.setPaginationRequestParamsData(rs.getString("pagination_request_params"));
					webServiceApi.setSoapBodyElement(rs.getString("soap_body_element"));
					return webServiceApi;
				}

			});

		} catch (DataAccessException ae) {
			LOG.error("error while getWebServiceConnections()", ae);
			throw new AnvizentRuntimeException(ae);
		} catch (SqlNotFoundException e) {
			LOG.error("error while getWebServiceConnections()", e);
			e.printStackTrace();
		}

		return webServiceApiList;

	}

	@Override
	public WebServiceApi getWebServiceApi(Long wsConId, Long ilId, String clientId, JdbcTemplate clientAppDbJdbcTemplate) {
		WebServiceApi webServiceApi = null;
		try {
			String sql = sqlHelper.getSql("getWebServiceApi");

			webServiceApi = clientAppDbJdbcTemplate.query(sql, new Object[] { clientId, ilId, wsConId }, new ResultSetExtractor<WebServiceApi>() {
				@Override
				public WebServiceApi extractData(ResultSet rs) throws SQLException, DataAccessException {

					if (rs != null && rs.next()) {

						WebServiceApi webServiceApi = new WebServiceApi();
						webServiceApi.setId(rs.getLong("id"));
						webServiceApi.setApiName(rs.getString("api_name"));
						webServiceApi.setApiUrl(rs.getString("api_url"));
						webServiceApi.setApiMethodType(rs.getString("api_method_type"));
						webServiceApi.setApiPathParams(rs.getString("api_path_params"));
						webServiceApi.setApiRequestParams(rs.getString("api_request_params"));
						webServiceApi.setResponseObjectName(rs.getString("response_object_name"));
						webServiceApi.setActive(rs.getBoolean("mapping_active_status"));

						return webServiceApi;
					} else {
						return null;
					}
				}
			});
		} catch (DataAccessException ae) {
			LOG.error("error while getWebServiceConnections()", ae);
			throw new AnvizentRuntimeException(ae);
		} catch (SqlNotFoundException e) {
			LOG.error("error while getWebServiceConnections()", e);
			e.printStackTrace();
		}

		return webServiceApi;

	}

	@Override
	public List<WebServiceTemplateMaster> getWebserviceTemplate(JdbcTemplate clientAppDbJdbcTemplate) {
		List<WebServiceTemplateMaster> webserviceTempList = null;
		try {

			String sql = sqlHelper.getSql("getWebserviceTemplate");
			webserviceTempList = clientAppDbJdbcTemplate.query(sql, new RowMapper<WebServiceTemplateMaster>() {
				public WebServiceTemplateMaster mapRow(ResultSet rs, int i) throws SQLException {
					WebServiceTemplateMaster webServiceTemp = new WebServiceTemplateMaster();

					webServiceTemp.setId(rs.getLong("id"));
					webServiceTemp.setWebServiceName(rs.getString("web_service_name"));

					WebServiceAuthenticationTypes wsAuthTypes = new WebServiceAuthenticationTypes();
					wsAuthTypes.setId(rs.getLong("authentication_type"));
					wsAuthTypes.setAuthenticationType(rs.getString("authentication_type_name"));
					webServiceTemp.setWebServiceAuthenticationTypes(wsAuthTypes);

					webServiceTemp.setBaseUrl(rs.getString("base_url"));
					webServiceTemp.setBaseUrlRequired(rs.getBoolean("base_url_required"));
					webServiceTemp.setAuthenticationUrl(rs.getString("authentication_url"));
					webServiceTemp.setAuthenticationMethodType(rs.getString("authentication_method_type"));
					webServiceTemp.setApiAuthRequestParams(rs.getString("api_auth_request_params"));
					webServiceTemp.setApiAuthRequestHeaders(rs.getString("api_auth_request_headers"));
					webServiceTemp.setDateFormat(rs.getString("date_format"));
					webServiceTemp.setTimeZone(rs.getString("time_zone"));
					webServiceTemp.setAuthenticationBodyParams(rs.getString("api_auth_request_body_params"));

					OAuth2 oauth = new OAuth2();
					oauth.setRedirectUrl(rs.getString("callback_url"));
					oauth.setAccessTokenUrl(rs.getString("access_token_url"));
					oauth.setGrantType(rs.getString("grant_type"));
					oauth.setClientIdentifier(rs.getString("clientid"));
					oauth.setClientSecret(rs.getString("client_secret"));
					oauth.setScope(rs.getString("scope"));
					oauth.setState(rs.getString("state"));
					webServiceTemp.setoAuth2(oauth);
					webServiceTemp.setSslDisable(rs.getBoolean("ssl_disable"));
					webServiceTemp.setActive(rs.getBoolean("isActive"));

					Modification modification = new Modification();
					modification.setCreatedBy(rs.getString("created_by"));
					modification.setCreatedTime(rs.getString("created_time"));
					webServiceTemp.setModification(modification);

					return webServiceTemp;
				}

			});

		} catch (DataAccessException ae) {
			LOG.error("error while getWebserviceTemplate", ae);
			throw new AnvizentRuntimeException(ae);
		} catch (SqlNotFoundException e) {
			LOG.error("error while getWebserviceTemplate", e);
			e.printStackTrace();
		}

		return webserviceTempList;
	}

	@Override
	public WebServiceTemplateMaster getWebServiceTemplateById(WebServiceTemplateMaster webServiceTemplateMaster, JdbcTemplate clientAppDbJdbcTemplate) {
		WebServiceTemplateMaster webServiceTemplate = null;
		try {
			String sql = sqlHelper.getSql("getWebServiceTemplateById");
			webServiceTemplate = clientAppDbJdbcTemplate.query(sql, new Object[] { webServiceTemplateMaster.getId() },
					new ResultSetExtractor<WebServiceTemplateMaster>() {
						@Override
						public WebServiceTemplateMaster extractData(ResultSet rs) throws SQLException {
							if (rs.next()) {
								WebServiceTemplateMaster webServiceTemp = new WebServiceTemplateMaster();

								webServiceTemp.setId(rs.getLong("id"));
								webServiceTemp.setWebServiceName(rs.getString("web_service_name"));

								WebServiceAuthenticationTypes wsAuthTypes = new WebServiceAuthenticationTypes();
								wsAuthTypes.setId(rs.getLong("authentication_type"));
								webServiceTemp.setWebServiceAuthenticationTypes(wsAuthTypes);
								webServiceTemp.setDateFormat(rs.getString("date_format"));
								webServiceTemp.setTimeZone(rs.getString("time_zone"));
								webServiceTemp.setWebserviceType(rs.getString("webservice_type"));
								webServiceTemp.setSoapBodyElement(rs.getString("soap_body_element"));

								webServiceTemp.setBaseUrl(rs.getString("base_url"));
								webServiceTemp.setAuthenticationUrl(rs.getString("authentication_url"));
								webServiceTemp.setBaseUrlRequired(rs.getBoolean("base_url_required"));
								webServiceTemp.setAuthenticationMethodType(rs.getString("authentication_method_type"));
								webServiceTemp.setApiAuthRequestParams(rs.getString("api_auth_request_params"));
								webServiceTemp.setApiAuthBodyParams(rs.getString("api_auth_body_params"));
								webServiceTemp.setApiAuthRequestHeaders(rs.getString("api_auth_request_headers"));
								webServiceTemp.setAuthenticationBodyParams(rs.getString("api_auth_request_body_params"));
								

								OAuth2 oauth = new OAuth2();
								oauth.setRedirectUrl(rs.getString("callback_url"));
								oauth.setAccessTokenUrl(rs.getString("access_token_url"));
								oauth.setGrantType(rs.getString("grant_type"));
								oauth.setClientIdentifier(rs.getString("clientid"));
								oauth.setClientSecret(rs.getString("client_secret"));
								oauth.setScope(rs.getString("scope"));
								oauth.setState(rs.getString("state"));
								webServiceTemp.setoAuth2(oauth);
								webServiceTemp.setSslDisable(rs.getBoolean("ssl_disable"));
								webServiceTemp.setActive(rs.getBoolean("isActive"));

								return webServiceTemp;
							} else {
								return null;
							}
						}
					});

			String sql1 = sqlHelper.getSql("getWebServiceTempAuthReqParams");
			List<WebServiceTemplateAuthRequestparams> webServiceTempAuth = clientAppDbJdbcTemplate.query(sql1, new RowMapper<WebServiceTemplateAuthRequestparams>() {
				@Override
				public WebServiceTemplateAuthRequestparams mapRow(ResultSet rs, int i) throws SQLException {

					WebServiceTemplateAuthRequestparams WsTempAuthReqParams = new WebServiceTemplateAuthRequestparams();
					WsTempAuthReqParams.setId(rs.getLong("ws_template_id"));
					WsTempAuthReqParams.setParamName(rs.getString("param_name"));
					WsTempAuthReqParams.setMandatory(rs.getBoolean("is_mandatory"));
					WsTempAuthReqParams.setPasswordType(rs.getBoolean("is_passwordtype"));
					return WsTempAuthReqParams;
				}

			}, webServiceTemplateMaster.getId());
			webServiceTemplate.setWebServiceTemplateAuthRequestparams(webServiceTempAuth);
		} catch (DataAccessException ae) {
			LOG.error("error while getWebServiceTemplateById", ae);
			throw new AnvizentRuntimeException(ae);
		} catch (SqlNotFoundException e) {
			LOG.error("error while getWebServiceTemplateById", e);
			e.printStackTrace();
		}
		return webServiceTemplate;
	}

	@Override
	public int updateWebserviceMasterConnectionMapping(String clientId, WebServiceConnectionMaster webServiceConnectionMaster, JdbcTemplate clientAppDbJdbcTemplate) {
		int count = -1;
		try {
			String sql = sqlHelper.getSql("updateWebserviceMasterConnectionMapping");
			count = clientAppDbJdbcTemplate.update(sql,
					new Object[] { 
							webServiceConnectionMaster.getWebServiceConName(),
							webServiceConnectionMaster.getWebServiceTemplateMaster().getTimeZone(),
							webServiceConnectionMaster.getBaseUrl(),
							webServiceConnectionMaster.getWsApiAuthUrl(),
							webServiceConnectionMaster.isBaseUrlRequired(),
							webServiceConnectionMaster.getWebServiceTemplateMaster().getId(),
							webServiceConnectionMaster.getRequestParams(), 
							webServiceConnectionMaster.getBodyParams(),
							webServiceConnectionMaster.getAuthPathParams(), 
							webServiceConnectionMaster.getHeaderKeyvalues(),
							webServiceConnectionMaster.getoAuth2().getAccessTokenUrl(), 
							webServiceConnectionMaster.getoAuth2().getClientIdentifier(),
							webServiceConnectionMaster.getoAuth2().getClientSecret(), 
							webServiceConnectionMaster.getoAuth2().getScope(),
							webServiceConnectionMaster.getoAuth2().getState(),
							webServiceConnectionMaster.getoAuth2().getAccessTokenValue(),
							webServiceConnectionMaster.getoAuth2().getRefreshTokenValue(),
							webServiceConnectionMaster.getModification().getCreatedBy(),
							webServiceConnectionMaster.getModification().getCreatedTime(), 
							clientId, 
							webServiceConnectionMaster.isActive(),
							webServiceConnectionMaster.getDataSourceName(),
							webServiceConnectionMaster.getWebServiceTemplateMaster().isSslDisable(),
							webServiceConnectionMaster.getId() });

		} catch (DuplicateKeyException ae) {
			LOG.error("error while updateWebserviceMasterConnectionMapping()", ae);
			throw new AnvizentDuplicateFileNameException(ae);
		} catch (DataAccessException ae) {
			LOG.error("error while updateWebserviceMasterConnectionMapping()", ae);
			throw new AnvizentRuntimeException(ae);
		} catch (SqlNotFoundException e) {
			LOG.error("error while updateWebserviceMasterConnectionMapping()", e);
			throw new AnvizentRuntimeException(e);
		}
		return count;
	}

	@Override
	public List<TimeZones> getTimeZones() {
		List<TimeZones> timeZonesList = null;
		try {

			String sql = sqlHelper.getSql("getTimeZones");
			timeZonesList = getJdbcTemplate().query(sql, new RowMapper<TimeZones>() {
				public TimeZones mapRow(ResultSet rs, int i) throws SQLException {
					TimeZones timeZone = new TimeZones();

					timeZone.setId(rs.getInt("id"));
					timeZone.setZoneOffset(rs.getString("zone_offset"));
					timeZone.setZoneName(rs.getString("zone_name"));
					timeZone.setZoneNameDisplay(rs.getString("zone_name_display"));
					return timeZone;
				}

			});

		} catch (DataAccessException ae) {
			LOG.error("error while getTimeZones", ae);
			throw new AnvizentRuntimeException(ae);
		} catch (SqlNotFoundException e) {
			LOG.error("error while getTimeZones", e);
			e.printStackTrace();
		}

		return timeZonesList;
	}
}