package com.anvizent.minidw.service.utils;

import org.quartz.Matcher;
import org.quartz.TriggerKey;

import com.datamodel.anvizent.helper.MasterSchedulerConstants;

public class GroupKeyMatcherForOtherJobs implements Matcher<TriggerKey> {
	private static final long serialVersionUID = 1L;

	@Override
	public boolean isMatch(TriggerKey triggerKey) {
		return !triggerKey.getGroup().startsWith(MasterSchedulerConstants.SCHEDULED_PACKAGES.name());
	}
	
}
