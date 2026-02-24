const PasswordPolicy: React.FC = () => {
  return (
    <Card title="Password Policy">
      <Form layout="vertical">
        <Form.Item label="Minimum Length">
          <InputNumber min={6} max={128} defaultValue={8} />
        </Form.Item>
        
        <Form.Item label="Require">
          <Checkbox.Group>
            <Checkbox value="uppercase">Uppercase letters</Checkbox>
            <Checkbox value="lowercase">Lowercase letters</Checkbox>
            <Checkbox value="numbers">Numbers</Checkbox>
            <Checkbox value="special">Special characters</Checkbox>
          </Checkbox.Group>
        </Form.Item>
        
        <Form.Item label="Password Expiry">
          <Select defaultValue={90}>
            <Select.Option value={30}>30 days</Select.Option>
            <Select.Option value={60}>60 days</Select.Option>
            <Select.Option value={90}>90 days</Select.Option>
            <Select.Option value={0}>Never</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item label="Prevent Password Reuse">
          <InputNumber min={0} defaultValue={5} addonAfter="passwords" />
        </Form.Item>
        
        <Form.Item label="Account Lockout">
          <Space direction="vertical">
            <InputNumber min={1} defaultValue={5} addonBefore="After" addonAfter="attempts" />
            <InputNumber min={1} defaultValue={30} addonAfter="minutes lockout" />
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};