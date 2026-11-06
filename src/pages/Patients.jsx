import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Tag, Space, Descriptions, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';
import dayjs from 'dayjs';

const Patients = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
    const { user } = useContext(AuthContext);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const fetchData = async (page = 1, size = 5) => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/patients/page?page=${page}&size=${size}`);
            setData(res.data);
            setPagination({ current: res.currentPage, pageSize: res.pageSize, total: res.totalElements });
        } catch (error) {
            message.error('Lỗi khi tải danh sách bệnh nhân');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Tạo mới
    const handleCreate = async (values) => {
        try {
            const payload = {
                ...values,
                dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
            };
            await axiosClient.post('/patients', payload);
            message.success('Thêm bệnh nhân thành công!');
            setIsCreateModalOpen(false);
            createForm.resetFields();
            fetchData(1, pagination.pageSize);
        } catch (error) {
            message.error(error.message || 'Lỗi khi thêm bệnh nhân');
        }
    };

    // Mở Modal Sửa
    const openEditModal = (record) => {
        setSelectedPatient(record);
        editForm.setFieldsValue({
            fullName: record.fullName,
            phone: record.phone,
            dob: record.dob ? dayjs(record.dob) : null,
            gender: record.gender,
            address: record.address,
            emergencyContact: record.emergencyContact
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (values) => {
        try {
            const payload = {
                ...values,
                dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
            };
            await axiosClient.put(`/patients/${selectedPatient.id}`, payload);
            message.success('Cập nhật thông tin bệnh nhân thành công!');
            setIsEditModalOpen(false);
            fetchData(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error(error.message || 'Lỗi khi cập nhật!');
        }
    };

    // Xóa
    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/patients/${id}`);
            message.success('Đã xóa bệnh nhân!');
            fetchData(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error(error.message || 'Lỗi khi xóa!');
        }
    };

    const openViewModal = (record) => {
        setSelectedPatient(record);
        setIsViewModalOpen(true);
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Họ Tên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
        { title: 'Ngày sinh', dataIndex: 'dob', key: 'dob' },
        { 
            title: 'Giới tính', 
            dataIndex: 'gender', 
            key: 'gender',
            render: (g) => <Tag color={g === 'MALE' ? 'blue' : g === 'FEMALE' ? 'pink' : 'default'}>{g}</Tag>
        },
        { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="text" style={{ color: '#1890ff' }} icon={<EyeOutlined />} onClick={() => openViewModal(record)}>Xem</Button>
                    {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_RECEPTIONIST') && (
                        <>
                            <Button type="text" style={{ color: '#faad14' }} icon={<EditOutlined />} onClick={() => openEditModal(record)}>Sửa</Button>
                            <Popconfirm title="Bạn có chắc muốn xóa bệnh nhân này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
                                <Button type="text" danger icon={<DeleteOutlined />}>Xóa</Button>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>Quản lý Bệnh Nhân</h2>
                {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_RECEPTIONIST') && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
                        Thêm Bệnh Nhân
                    </Button>
                )}
            </div>

            <Table 
                columns={columns} 
                dataSource={data} 
                rowKey="id" 
                bordered 
                pagination={pagination}
                loading={loading}
                onChange={(newPag) => fetchData(newPag.current, newPag.pageSize)} 
            />

            {/* Modal Thêm Mới */}
            <Modal title="Thêm Bệnh Nhân Mới" open={isCreateModalOpen} onCancel={() => setIsCreateModalOpen(false)} footer={null}>
                <Form form={createForm} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="fullName" label="Họ Tên" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="dob" label="Ngày sinh"><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="gender" label="Giới tính">
                        <Select placeholder="Chọn giới tính">
                            <Select.Option value="MALE">Nam</Select.Option>
                            <Select.Option value="FEMALE">Nữ</Select.Option>
                            <Select.Option value="OTHER">Khác</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="address" label="Địa chỉ"><Input /></Form.Item>
                    <Form.Item name="emergencyContact" label="SĐT Khẩn cấp"><Input /></Form.Item>
                    <Form.Item><Button type="primary" htmlType="submit" block>Xác Nhận</Button></Form.Item>
                </Form>
            </Modal>

            {/* Modal Sửa */}
            <Modal title="Chỉnh Sửa Thông Tin Bệnh Nhân" open={isEditModalOpen} onCancel={() => setIsEditModalOpen(false)} footer={null}>
                <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item name="fullName" label="Họ Tên" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="dob" label="Ngày sinh"><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="gender" label="Giới tính">
                        <Select>
                            <Select.Option value="MALE">Nam</Select.Option>
                            <Select.Option value="FEMALE">Nữ</Select.Option>
                            <Select.Option value="OTHER">Khác</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="address" label="Địa chỉ"><Input /></Form.Item>
                    <Form.Item name="emergencyContact" label="SĐT Khẩn cấp"><Input /></Form.Item>
                    <Form.Item><Button type="primary" htmlType="submit" block>Lưu Thay Đổi</Button></Form.Item>
                </Form>
            </Modal>

            {/* Modal Xem Chi Tiết */}
            <Modal title="Chi Tiết Bệnh Nhân" open={isViewModalOpen} onCancel={() => setIsViewModalOpen(false)} footer={[ <Button key="close" onClick={() => setIsViewModalOpen(false)}>Đóng</Button> ]}>
                {selectedPatient && (
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Mã BN">{selectedPatient.id}</Descriptions.Item>
                        <Descriptions.Item label="Họ Tên">{selectedPatient.fullName}</Descriptions.Item>
                        <Descriptions.Item label="Số Điện Thoại">{selectedPatient.phone}</Descriptions.Item>
                        <Descriptions.Item label="Ngày Sinh">{selectedPatient.dob || 'Chưa cập nhật'}</Descriptions.Item>
                        <Descriptions.Item label="Giới Tính">{selectedPatient.gender}</Descriptions.Item>
                        <Descriptions.Item label="Địa Chỉ">{selectedPatient.address || 'Chưa cập nhật'}</Descriptions.Item>
                        <Descriptions.Item label="SĐT Khẩn Cấp">{selectedPatient.emergencyContact || 'Không có'}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default Patients;