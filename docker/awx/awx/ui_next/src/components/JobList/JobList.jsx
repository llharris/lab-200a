import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';

import { Card } from '@patternfly/react-core';
import AlertModal from '../AlertModal';
import DatalistToolbar from '../DataListToolbar';
import ErrorDetail from '../ErrorDetail';
import { ToolbarDeleteButton } from '../PaginatedDataList';
import PaginatedTable, { HeaderRow, HeaderCell } from '../PaginatedTable';
import useRequest, {
  useDeleteItems,
  useDismissableError,
} from '../../util/useRequest';
import isJobRunning from '../../util/jobs';
import { getQSConfig, parseQueryString } from '../../util/qs';
import JobListItem from './JobListItem';
import JobListCancelButton from './JobListCancelButton';
import useWsJobs from './useWsJobs';
import {
  AdHocCommandsAPI,
  InventoryUpdatesAPI,
  JobsAPI,
  ProjectUpdatesAPI,
  SystemJobsAPI,
  UnifiedJobsAPI,
  WorkflowJobsAPI,
} from '../../api';

function JobList({ i18n, defaultParams, showTypeColumn = false }) {
  const qsConfig = getQSConfig(
    'job',
    {
      page: 1,
      page_size: 20,
      order_by: '-finished',
      not__launch_type: 'sync',
      ...defaultParams,
    },
    ['id', 'page', 'page_size']
  );

  const [selected, setSelected] = useState([]);
  const location = useLocation();
  const {
    result: { results, count, relatedSearchableKeys, searchableKeys },
    error: contentError,
    isLoading,
    request: fetchJobs,
  } = useRequest(
    useCallback(
      async () => {
        const params = parseQueryString(qsConfig, location.search);
        const [response, actionsResponse] = await Promise.all([
          UnifiedJobsAPI.read({ ...params }),
          UnifiedJobsAPI.readOptions(),
        ]);
        return {
          results: response.data.results,
          count: response.data.count,
          relatedSearchableKeys: (
            actionsResponse?.data?.related_search_fields || []
          ).map(val => val.slice(0, -8)),
          searchableKeys: Object.keys(
            actionsResponse.data.actions?.GET || {}
          ).filter(key => actionsResponse.data.actions?.GET[key].filterable),
        };
      },
      [location] // eslint-disable-line react-hooks/exhaustive-deps
    ),
    {
      results: [],
      count: 0,
      relatedSearchableKeys: [],
      searchableKeys: [],
    }
  );
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // TODO: update QS_CONFIG to be safe for deps array
  const fetchJobsById = useCallback(
    async ids => {
      const params = parseQueryString(qsConfig, location.search);
      params.id__in = ids.join(',');
      const { data } = await UnifiedJobsAPI.read(params);
      return data.results;
    },
    [location.search] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const jobs = useWsJobs(results, fetchJobsById, qsConfig);

  const isAllSelected = selected.length === jobs.length && selected.length > 0;

  const {
    error: cancelJobsError,
    isLoading: isCancelLoading,
    request: cancelJobs,
  } = useRequest(
    useCallback(async () => {
      return Promise.all(
        selected.map(job => {
          if (isJobRunning(job.status)) {
            return JobsAPI.cancel(job.id, job.type);
          }
          return Promise.resolve();
        })
      );
    }, [selected]),
    {}
  );

  const {
    error: cancelError,
    dismissError: dismissCancelError,
  } = useDismissableError(cancelJobsError);

  const {
    isLoading: isDeleteLoading,
    deleteItems: deleteJobs,
    deletionError,
    clearDeletionError,
  } = useDeleteItems(
    useCallback(() => {
      return Promise.all(
        selected.map(({ type, id }) => {
          switch (type) {
            case 'job':
              return JobsAPI.destroy(id);
            case 'ad_hoc_command':
              return AdHocCommandsAPI.destroy(id);
            case 'system_job':
              return SystemJobsAPI.destroy(id);
            case 'project_update':
              return ProjectUpdatesAPI.destroy(id);
            case 'inventory_update':
              return InventoryUpdatesAPI.destroy(id);
            case 'workflow_job':
              return WorkflowJobsAPI.destroy(id);
            default:
              return null;
          }
        })
      );
    }, [selected]),
    {
      qsConfig,
      allItemsSelected: isAllSelected,
      fetchItems: fetchJobs,
    }
  );

  const handleJobCancel = async () => {
    await cancelJobs();
    setSelected([]);
  };

  const handleJobDelete = async () => {
    await deleteJobs();
    setSelected([]);
  };

  const handleSelectAll = isSelected => {
    setSelected(isSelected ? [...jobs] : []);
  };

  const handleSelect = item => {
    if (selected.some(s => s.id === item.id)) {
      setSelected(selected.filter(s => s.id !== item.id));
    } else {
      setSelected(selected.concat(item));
    }
  };

  return (
    <>
      <Card>
        <PaginatedTable
          contentError={contentError}
          hasContentLoading={isLoading || isDeleteLoading || isCancelLoading}
          items={jobs}
          itemCount={count}
          pluralizedItemName={i18n._(t`Jobs`)}
          qsConfig={qsConfig}
          toolbarSearchColumns={[
            {
              name: i18n._(t`Name`),
              key: 'name__icontains',
              isDefault: true,
            },
            {
              name: i18n._(t`ID`),
              key: 'id',
            },
            {
              name: i18n._(t`Label Name`),
              key: 'labels__name__icontains',
            },
            {
              name: i18n._(t`Job Type`),
              key: `or__type`,
              options: [
                [`project_update`, i18n._(t`Source Control Update`)],
                [`inventory_update`, i18n._(t`Inventory Sync`)],
                [`job`, i18n._(t`Playbook Run`)],
                [`ad_hoc_command`, i18n._(t`Command`)],
                [`system_job`, i18n._(t`Management Job`)],
                [`workflow_job`, i18n._(t`Workflow Job`)],
              ],
            },
            {
              name: i18n._(t`Launched By (Username)`),
              key: 'created_by__username__icontains',
            },
            {
              name: i18n._(t`Status`),
              key: 'status',
              options: [
                [`new`, i18n._(t`New`)],
                [`pending`, i18n._(t`Pending`)],
                [`waiting`, i18n._(t`Waiting`)],
                [`running`, i18n._(t`Running`)],
                [`successful`, i18n._(t`Successful`)],
                [`failed`, i18n._(t`Failed`)],
                [`error`, i18n._(t`Error`)],
                [`canceled`, i18n._(t`Canceled`)],
              ],
            },
            {
              name: i18n._(t`Limit`),
              key: 'job__limit',
            },
          ]}
          headerRow={
            <HeaderRow qsConfig={qsConfig} isExpandable>
              <HeaderCell sortKey="name">{i18n._(t`Name`)}</HeaderCell>
              <HeaderCell sortKey="status">{i18n._(t`Status`)}</HeaderCell>
              {showTypeColumn && <HeaderCell>{i18n._(t`Type`)}</HeaderCell>}
              <HeaderCell sortKey="started">{i18n._(t`Start Time`)}</HeaderCell>
              <HeaderCell sortKey="finished">
                {i18n._(t`Finish Time`)}
              </HeaderCell>
              <HeaderCell>{i18n._(t`Actions`)}</HeaderCell>
            </HeaderRow>
          }
          toolbarSearchableKeys={searchableKeys}
          toolbarRelatedSearchableKeys={relatedSearchableKeys}
          renderToolbar={props => (
            <DatalistToolbar
              {...props}
              showSelectAll
              isAllSelected={isAllSelected}
              onSelectAll={handleSelectAll}
              qsConfig={qsConfig}
              additionalControls={[
                <ToolbarDeleteButton
                  key="delete"
                  onDelete={handleJobDelete}
                  itemsToDelete={selected}
                  pluralizedItemName={i18n._(t`Jobs`)}
                />,
                <JobListCancelButton
                  key="cancel"
                  onCancel={handleJobCancel}
                  jobsToCancel={selected}
                />,
              ]}
            />
          )}
          renderRow={(job, index) => (
            <JobListItem
              key={job.id}
              job={job}
              showTypeColumn={showTypeColumn}
              onSelect={() => handleSelect(job)}
              isSelected={selected.some(row => row.id === job.id)}
              rowIndex={index}
            />
          )}
        />
      </Card>
      {deletionError && (
        <AlertModal
          isOpen
          variant="error"
          title={i18n._(t`Error!`)}
          onClose={clearDeletionError}
        >
          {i18n._(t`Failed to delete one or more jobs.`)}
          <ErrorDetail error={deletionError} />
        </AlertModal>
      )}
      {cancelError && (
        <AlertModal
          isOpen
          variant="error"
          title={i18n._(t`Error!`)}
          onClose={dismissCancelError}
        >
          {i18n._(t`Failed to cancel one or more jobs.`)}
          <ErrorDetail error={cancelError} />
        </AlertModal>
      )}
    </>
  );
}

export default withI18n()(JobList);
