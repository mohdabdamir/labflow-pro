const ActiveSessions: React.FC<{ userId: string }> = ({ userId }) => {
  const [sessions, setSessions] = useState([]);

  return (
    <Table
      dataSource={sessions}
      columns={[
        { title: 'Device', dataIndex: 'device' },
        { title: 'Browser', dataIndex: 'browser' },
        { title: 'IP Address', dataIndex: 'ip' },
        { title: 'Location', dataIndex: 'location' },
        { title: 'Last Active', dataIndex: 'lastActive' },
        {
          title: 'Action',
          render: () => <Button danger size="small">Terminate</Button>
        }
      ]}
    />
  );
};