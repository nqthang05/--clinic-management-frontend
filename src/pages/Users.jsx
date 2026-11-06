import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const { user } = useContext(AuthContext); // Lấy role để chặn UI nếu cần

    // Fetch dữ liệu từ Backend
    const fetchUsers = async () => {
        try {
            const data = await axiosClient.get('/users'); 
            setUsers(data); 
        } catch (error) {
            message.error('Lỗi khi tải danh sách người dùng!');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Xử lý Form Tạo mới
    const handleCreate = async (values) => {
        try {
            await axiosClient.post('/users', values);
            message.success('Tạo tài khoản thành công!');
            setIsModalOpen(false);
            form.resetFields();
            fetchUsers(); 
        } catch (error) {
            message.error(error.message || 'Lỗi khi tạo tài khoản!');
        }
    };

    // Mở Form Sửa và Map dữ liệu cũ
    const openEditModal = (record) => {
        setSelectedUser(record);
        
        // Chuyển roleName dạng chuỗi từ Backend thành roleId dạng số để đẩy vào Select Box
        const mappedRoleId = record.roleName === 'ROLE_ADMIN' ? 1 
                           : record.roleName === 'ROLE_RECEPTIONIST' ? 2 : 3;

        editForm.setFieldsValue({
            username: record.username,
            fullName: record.fullName,
            email: record.email,
            phone: record.phone,
            roleId: mappedRoleId
        });
        setIsEditModalOpen(true);
    };

    // Xử lý Cập nhật
    const handleUpdate = async (values) => {
        try {
            await axiosClient.put(`/users/${selectedUser.id}`, values);
            message.success('Cập nhật thông tin tài khoản thành công!');
            setIsEditModalOpen(false);
            fetchUsers(); 
        } catch (error) {
            message.error(error.message || 'Lỗi khi cập nhật tài khoản!');
        }
    };

    // Xử lý Xóa (Soft Delete)
    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/users/${id}`);
            message.success('Đã khóa tài khoản thành công!');
            fetchUsers(); 
        } catch (error) {
            message.error(error.message || 'Lỗi khi khóa tài khoản!');
        }
    };

    // Cấu hình Cột cho Antd Table
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Tài khoản', dataIndex: 'username', key: 'username' },
        { title: 'Họ Tên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { 
            title: 'Quyền', 
            dataIndex: 'roleName', 
            key: 'roleName',
            render: (role) => (
                <Tag color={role === 'ROLE_ADMIN' ? 'red' : role === 'ROLE_DOCTOR' ? 'blue' : 'green'}>
                    {role}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="text" style={{ color: '#faad14' }} icon={<EditOutlined />} onClick={() => openEditModal(record)}>
                        Sửa
                    </Button>
                    <Popconfirm 
                        title="Bạn có chắc chắn muốn khóa/xóa tài khoản này?" 
                        onConfirm={() => handleDelete(record.id)} 
                        okText="Đồng ý" 
                        cancelText="Hủy"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>Quản lý Tài khoản (Chỉ Admin)</h2>
                {user?.role === 'ROLE_ADMIN' && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                        Tạo Tài Khoản Mới
                    </Button>
                )}
            </div>

            <Table dataSource={users} columns={columns} rowKey="id" bordered />

            {/* Modal Thêm Mới */}
            <Modal title="Tạo Tài Khoản Mới" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="Số điện thoại">
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email">
                        <Input type="email" />
                    </Form.Item>
                    <Form.Item name="roleId" label="Phân quyền" rules={[{ required: true, message: 'Vui lòng chọn quyền' }]}>
                        <Select placeholder="Chọn một quyền">
                            <Select.Option value={1}>Admin</Select.Option>
                            <Select.Option value={2}>Lễ Tân</Select.Option>
                            <Select.Option value={3}>Bác Sĩ</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>Xác Nhận Tạo</Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Sửa (Không có trường Password vì cập nhật password thường tách luồng riêng) */}
            <Modal title="Chỉnh Sửa Tài Khoản" open={isEditModalOpen} onCancel={() => setIsEditModalOpen(false)} footer={null}>
                <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
                        <Input disabled /> {/* Username không nên cho phép sửa */}
                    </Form.Item>
                    <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="Số điện thoại">
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email">
                        <Input type="email" />
                    </Form.Item>
                    <Form.Item name="roleId" label="Phân quyền" rules={[{ required: true }]}>
                        <Select placeholder="Chọn một quyền">
                            <Select.Option value={1}>Admin</Select.Option>
                            <Select.Option value={2}>Lễ Tân</Select.Option>
                            <Select.Option value={3}>Bác Sĩ</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>Lưu Thay Đổi</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Users;