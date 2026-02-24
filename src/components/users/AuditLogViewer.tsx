const AuditLogViewer: React.FC = () => {
  return (
    <Table
      title={() => 'User Audit Trail'}
      columns={[
        { title: 'Timestamp', dataIndex: 'timestamp' },
        { title: 'User', dataIndex: 'user' },
        { title: 'Action', dataIndex: 'action' },
        { title: 'Resource', dataIndex: 'resource' },
        { title: 'IP Address', dataIndex: 'ip' },
        { title: 'Status', dataIndex: 'status' }
      ]}
    />
  );
};