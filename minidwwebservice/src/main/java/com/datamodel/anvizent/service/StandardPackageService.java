package com.datamodel.anvizent.service;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;

import com.datamodel.anvizent.service.model.DLInfo;
import com.datamodel.anvizent.service.model.ILConnectionMapping;
import com.datamodel.anvizent.service.model.JobResult;
import com.datamodel.anvizent.service.model.Package;
import com.datamodel.anvizent.service.model.PackageExecution;
import com.datamodel.anvizent.service.model.Schedule;

public interface StandardPackageService {

	Package fetchStandardPackageInfo(String clientId, JdbcTemplate clientAppDbJdbcTemplate);

	int createStandardPackage(Package createUserPackage, JdbcTemplate clientAppDbJdbcTemplate);

	DLInfo getIlMappingInfobyId(String userId, String clientId, Integer dlId,	JdbcTemplate clientAppDbJdbcTemplate);

	DLInfo getIlMappingInfobyId(String userId, String clientId, Integer dlId, Integer iLid,	JdbcTemplate clientAppDbJdbcTemplate);

	List<ILConnectionMapping> getILConnectionMappingInfoByMappingId(List<Integer> mappingsIds, String userId, JdbcTemplate clientAppDbJdbcTemplate);

	List<ILConnectionMapping> getILConnectionMappingInfoByDLId(String userId, String clientId, int dlId,JdbcTemplate clientAppDbJdbcTemplate);

	List<DLInfo> getClientSPDLs(String clientIdfromHeader, JdbcTemplate clientAppDbJdbcTemplate);

	int updatePackageSchedule(Schedule schedule, JdbcTemplate clientAppDbJdbcTemplate);

	List<PackageExecution> getPackageExecutionResults(Integer dlId, JdbcTemplate clientAppDbJdbcTemplate);

	List<JobResult> getExecutionJobResults(String packageId, Integer dlId, String clientId, JdbcTemplate clientJdbcTemplate);

	int saveDLTrailingMapping(String userId, String clientId,DLInfo dlInfo,JdbcTemplate clientAppDbJdbcTemplate);

	int updateDLTrailingMapping(String userId, String clientId, DLInfo dlInfo, JdbcTemplate clientAppDbJdbcTemplate);

	List<JobResult> getExecutionJobResultsByDate(String packageId, String dlId, String clientIdfromHeader,
			String fromDate, String toDate, JdbcTemplate clientJdbcTemplate);

}
