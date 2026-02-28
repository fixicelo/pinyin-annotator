import { Alert } from 'antd';
import React, { memo } from 'react';
import { TabStatus } from '~constants';

interface AnnotationStatusProps {
  isAnnotated: boolean;
  tabStatus: TabStatus;
}

const AnnotationStatus = memo(({ isAnnotated, tabStatus }: AnnotationStatusProps) => {
  if (tabStatus === TabStatus.RestrictedPage) {
    return (
      <Alert
        message="Not available on this page"
        description="Browser extensions cannot run on this type of page (e.g. browser internal pages, extension stores)."
        type="warning"
        showIcon
      />
    );
  }

  if (tabStatus === TabStatus.NeedsRefresh) {
    return (
      <Alert
        message="Page refresh required"
        description="This tab was opened before the extension was installed or updated. Please refresh the page to activate."
        type="info"
        showIcon
        action={
          <a
            onClick={() => chrome.tabs.reload()}
            className="refresh-link"
          >
            Refresh
          </a>
        }
      />
    );
  }

  return (
    <p className={`status ${isAnnotated ? 'annotated' : 'not-annotated'}`}>
      Status: {isAnnotated ? 'Annotated' : 'Not annotated'}
    </p>
  );
});

export default AnnotationStatus;