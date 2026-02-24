const UserActivityMonitor: React.FC<{ userId: string }> = ({ userId }) => {
  const [activities, setActivities] = useState([]);

  return (
    <Card title="User Activity Timeline">
      <Timeline>
        {activities.map(activity => (
          <Timeline.Item 
            color={activity.type === 'security' ? 'red' : 'blue'}
            dot={activity.icon}
          >
            <p>{activity.description}</p>
            <p className="text-sm text-gray-500">
              {activity.timestamp} • IP: {activity.ip}
            </p>
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );
};