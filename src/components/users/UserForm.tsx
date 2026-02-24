// components/users/UserForm.tsx
const UserForm: React.FC<{ mode: string; initialData?: User; onSubmit: (data: any) => void }> = 
  ({ mode, initialData, onSubmit }) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');

  const onFinish = (values: any) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialData}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* Basic Information */}
        <Tabs.TabPane tab="Basic Info" key="basic">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: 'email' }]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phoneNumber" label="Phone Number">
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="jobTitle" label="Job Title">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="Department">
                <Select>
                  <Select.Option value="IT">IT</Select.Option>
                  <Select.Option value="HR">HR</Select.Option>
                  <Select.Option value="Finance">Finance</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="manager" label="Reports To">
                <Select
                  showSearch
                  placeholder="Select manager"
                  optionFilterProp="children"
                >
                  {/* Populate with managers list */}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Tabs.TabPane>

        {/* Account Settings */}
        <Tabs.TabPane tab="Account Settings" key="account">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="admin">Administrator</Select.Option>
                  <Select.Option value="manager">Manager</Select.Option>
                  <Select.Option value="user">Regular User</Select.Option>
                  <Select.Option value="guest">Guest</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select>
                  <Select.Option value="active">Active</Select.Option>
                  <Select.Option value="inactive">Inactive</Select.Option>
                  <Select.Option value="suspended">Suspended</Select.Option>
                  <Select.Option value="pending">Pending</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="employmentType" label="Employment Type">
                <Select>
                  <Select.Option value="full-time">Full Time</Select.Option>
                  <Select.Option value="part-time">Part Time</Select.Option>
                  <Select.Option value="contract">Contract</Select.Option>
                  <Select.Option value="intern">Intern</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="joinDate" label="Join Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sessionTimeout" label="Session Timeout (minutes)">
                <InputNumber min={5} max={480} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="twoFactorEnabled" label="Enable 2FA" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Tabs.TabPane>

        {/* Permissions */}
        <Tabs.TabPane tab="Permissions" key="permissions">
          <PermissionsAssignment />
        </Tabs.TabPane>

        {/* Preferences */}
        <Tabs.TabPane tab="Preferences" key="preferences">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name={['preferences', 'theme']} label="Theme">
                <Select>
                  <Select.Option value="light">Light</Select.Option>
                  <Select.Option value="dark">Dark</Select.Option>
                  <Select.Option value="system">System</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={['preferences', 'language']} label="Language">
                <Select>
                  <Select.Option value="en">English</Select.Option>
                  <Select.Option value="es">Spanish</Select.Option>
                  <Select.Option value="fr">French</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={['preferences', 'timezone']} label="Timezone">
                <Select showSearch>
                  {/* Populate timezones */}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={['preferences', 'itemsPerPage']} label="Items Per Page">
                <Select>
                  <Select.Option value={10}>10</Select.Option>
                  <Select.Option value={25}>25</Select.Option>
                  <Select.Option value={50}>50</Select.Option>
                  <Select.Option value={100}>100</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name={['preferences', 'emailNotifications']} label="Email Notifications" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Tabs.TabPane>

        {/* Notifications */}
        <Tabs.TabPane tab="Notifications" key="notifications">
          <NotificationSettings />
        </Tabs.TabPane>
      </Tabs>

      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={() => form.submit()} type="primary">
          {mode === 'create' ? 'Create User' : 'Update User'}
        </Button>
        <Button onClick={() => form.resetFields()}>Reset</Button>
      </div>
    </Form>
  );
};