import React, { memo } from 'react';
import { TabStatus } from '~constants';

interface AnnotationStatusProps {
  isAnnotated: boolean;
  tabStatus: TabStatus;
  onRefresh?: () => void;
}

const AnnotationStatus = memo(({ isAnnotated, tabStatus, onRefresh }: AnnotationStatusProps) => {
  if (tabStatus === TabStatus.RestrictedPage) {
    return (
      <div className="alert alert-warning">
        <div>
          <div className="alert-title">Not available on this page</div>
          <div className="alert-desc">Browser extensions cannot run on this type of page (e.g. browser internal pages, extension stores).</div>
        </div>
      </div>
    );
  }

  if (tabStatus === TabStatus.NeedsRefresh) {
    return (
      <div className="alert alert-info">
        <div>
          <div className="alert-title">Page refresh required</div>
          <div className="alert-desc">
            This tab was opened before the extension was installed or updated. Please refresh the page to activate.
            <div style={{ marginTop: '8px' }}>
              <a onClick={onRefresh} className="refresh-link btn-text">Refresh</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <p className={`status ${isAnnotated ? 'annotated' : 'not-annotated'}`}>
      Status: {isAnnotated ? 'Annotated' : 'Not annotated'}
    </p>
  );
});

export default AnnotationStatus;