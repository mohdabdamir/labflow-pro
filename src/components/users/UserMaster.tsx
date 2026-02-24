// components/users/UserMaster.tsx
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Input, 
  Select, 
  Badge,
  Avatar,
  Modal,
  Tabs,
  Dropdown,
  Pagination,
  Switch,
  Tooltip,
  Alert,
  Space,
  Tag,
  Progress
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  FilterOutlined,
  ExportOutlined,
  ImportOutlined,
  UserAddOutlined,
  TeamOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  MoreOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  EyeOutlined,
  BanOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  DownloadOutlined,
  UploadOutlined
} from '@ant-design/icons';

const UserMaster: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  // Columns for the user table
  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (record: User) => (
        <Space>
          <Avatar src={record.avatar} size={40}>
            {record.firstName?.[0]}{record.lastName?.[0]}
          </Avatar>
          <div>
            <div className="font-medium">{record.displayName}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </Space>
      ),
      filterable: true,
      sortable: true
    },
    {
      title: 'Role',
      dataIndex: ['role', 'name'],
      render: (role: string) => <Tag color="blue">{role}</Tag>,
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Manager', value: 'manager' },
        { text: 'User', value: 'user' }
      ]
    },
    {
      title: 'Department',
      dataIndex: 'department',
      render: (dept: string) => dept || '-',
      filters: [
        { text: 'IT', value: 'IT' },
        { text: 'HR', value: 'HR' },
        { text: 'Finance', value: 'Finance' }
      ]
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: string) => {
        const statusConfig = {
          active: { color: 'success', icon: <CheckCircleOutlined />, label: 'Active' },
          inactive: { color: 'default', icon: <StopOutlined />, label: 'Inactive' },
          suspended: { color: 'error', icon: <BanOutlined />, label: 'Suspended' },
          pending: { color: 'warning', icon: <ClockCircleOutlined />, label: 'Pending' }
        };
        const config = statusConfig[status];
        return <Badge status={config.color as any} text={config.label} />;
      },
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Suspended', value: 'suspended' }
      ]
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLoginAt',
      render: (date: Date) => date ? new Date(date).toLocaleString() : 'Never',
      sortable: true
    },
    {
      title: 'MFA',
      dataIndex: 'twoFactorEnabled',
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'orange'}>
          {enabled ? 'Enabled' : 'Disabled'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Space>
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Reset Password">
            <Button icon={<LockOutlined />} size="small" onClick={() => handleResetPassword(record)} />
          </Tooltip>
          <Dropdown menu={{
            items: [
              { key: '1', label: 'Copy User', icon: <CopyOutlined /> },
              { key: '2', label: 'Impersonate', icon: <EyeOutlined /> },
              { key: '3', label: 'Send Welcome Email', icon: <MailOutlined /> },
              { type: 'divider' },
              { key: '4', label: 'Deactivate', icon: <StopOutlined />, danger: true },
              { key: '5', label: 'Delete', icon: <DeleteOutlined />, danger: true }
            ]
          }}>
            <Button icon={<MoreOutlined />} size="small" />
          </Dropdown>
        </Space>
      )
    }
  ];

  return (
    <Card 
      title={
        <Space>
          <TeamOutlined />
          <span>User Master Management</span>
        </Space>
      }
      extra={
        <Space>
          <Button icon={<ImportOutlined />}>Import</Button>
          <Button icon={<ExportOutlined />}>Export</Button>
          <Button 
            type="primary" 
            icon={<UserAddOutlined />}
            onClick={() => {
              setModalMode('create');
              setSelectedUser(null);
              setModalVisible(true);
            }}
          >
            Add User
          </Button>
        </Space>
      }
    >
      {/* Search and Filters */}
      <div className="mb-4 flex gap-4">
        <Input
          placeholder="Search users by name, email, department..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
          allowClear
        />
        <Select
          placeholder="Filter by status"
          mode="multiple"
          maxTagCount={1}
          style={{ width: 200 }}
          onChange={(value) => setFilters({ ...filters, status: value })}
        >
          <Select.Option value="active">Active</Select.Option>
          <Select.Option value="inactive">Inactive</Select.Option>
          <Select.Option value="suspended">Suspended</Select.Option>
        </Select>
        <Button icon={<FilterOutlined />}>More Filters</Button>
      </div>

      {/* User Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <Card size="small">
          <Statistic title="Total Users" value={users.length} />
        </Card>
        <Card size="small">
          <Statistic title="Active Today" value={45} suffix="/ 150" />
        </Card>
        <Card size="small">
          <Statistic title="Pending Approval" value={3} valueStyle={{ color: '#faad14' }} />
        </Card>
        <Card size="small">
          <Statistic title="MFA Enabled" value={89} suffix="%" />
        </Card>
        <Card size="small">
          <Statistic title="License Utilization" value={75} suffix="%" />
          <Progress percent={75} size="small" />
        </Card>
      </div>

      {/* User Table */}
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={{
          total: users.length,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} users`
        }}
        expandable={{
          expandedRowRender: (record) => (
            <UserExpandedDetails user={record} />
          )
        }}
      />

      {/* User Form Modal */}
      <Modal
        title={modalMode === 'create' ? 'Add New User' : 'Edit User'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={null}
      >
        <UserForm 
          mode={modalMode} 
          initialData={selectedUser}
          onSubmit={handleUserSubmit}
        />
      </Modal>
    </Card>
  );
};

// Expanded details component for table expansion
const UserExpandedDetails: React.FC<{ user: User }> = ({ user }) => (
  <Tabs defaultActiveKey="1">
    <Tabs.TabPane tab="Permissions" key="1">
      <PermissionsView user={user} />
    </Tabs.TabPane>
    <Tabs.TabPane tab="Activity Log" key="2">
      <ActivityLog userId={user.id} />
    </Tabs.TabPane>
    <Tabs.TabPane tab="Security" key="3">
      <SecuritySettings user={user} />
    </Tabs.TabPane>
    <Tabs.TabPane tab="Preferences" key="4">
      <PreferencesView user={user} />
    </Tabs.TabPane>
    <Tabs.TabPane tab="Devices" key="5">
      <TrustedDevices userId={user.id} />
    </Tabs.TabPane>
    <Tabs.TabPane tab="Audit Trail" key="6">
      <AuditTrail userId={user.id} />
    </Tabs.TabPane>
  </Tabs>
);