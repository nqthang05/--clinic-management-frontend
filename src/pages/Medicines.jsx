import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';

const Medicines = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
    const { user } = useContext(AuthContext);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    const fetchData = async (page = 1, size = 5) => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/medicines/page?page=${page}&size=${size}`);
            setData(res.data);
            setPagination({ current: res.currentPage, pageSize: res.pageSize, total: res.totalElements });
        } catch (error) { message.error('Lỗi khi tải kho thuốc'); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = async (values) => {
        try {
            await axiosClient.post('/medicines', values);
            message.success('Thêm thuốc thành công!');
            setIsCreateModalOpen(false);
            form.resetFields();
            fetchData();
        } catch (error) { message.error(error.message || 'Lỗi thêm thuốc'); }
    };

    const handleUpdate = async (values) => {
        try {
            await axiosClient.put(`/medicines/${selectedMedicine.id}`, values);
            message.success('Cập nhật thuốc thành công!');
            setIsEditModalOpen(false);
            fetchData(pagination.current, pagination.pageSize);
        } catch (error) { message.error(error.message || 'Lỗi cập nhật thuốc'); }
    };

    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/medicines/${id}`);
            message.success('Đã xóa thuốc!');
            fetchData(pagination.current, pagination.pageSize);
        } catch (error) { message.error(error.message || 'Lỗi xóa thuốc'); }
    };

    const columns = [
        { title: 'Mã Thuốc', dataIndex: 'id', key: 'id' },
        { title: 'Tên Thuốc', dataIndex: 'name', key: 'name' },
        { title: 'Hoạt chất', dataIndex: 'activeIngredient', key: 'activeIngredient' },
        { title: 'Đơn vị', dataIndex: 'unit', key: 'unit' },
        { title: 'Tồn Kho', dataIndex: 'stockQuantity', key: 'stockQuantity' },
        { title: 'Giá Bán', dataIndex: 'price', key: 'price', render: (val) => `${val.toLocaleString()} đ` },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => user?.role === 'ROLE_ADMIN' ? (
                <Space size="middle">
                    <Button type="text" style={{ color: '#faad14' }} icon={<EditOutlined />} onClick={() => {
                        setSelectedMedicine(record);
                        editForm.setFieldsValue(record);
                        setIsEditModalOpen(true);
                    }}>Sửa</Button>
                    <Popconfirm title="Xóa thuốc này?" onConfirm={() => handleDelete(record.id)}>
                        <Button type="text" danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            ) : null,
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>Quản lý Kho Thuốc</h2>
                {user?.role === 'ROLE_ADMIN' && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>Thêm Thuốc Mới</Button>
                )}
            </div>
            <Table columns={columns} dataSource={data} rowKey="id" bordered pagination={pagination} loading={loading} onChange={(newPag) => fetchData(newPag.current, newPag.pageSize)} />
            
            {/* Modal Create & Edit tương tự nhau */}
            <Modal title="Thêm Thuốc Mới" open={isCreateModalOpen} onCancel={() => setIsCreateModalOpen(false)} footer={null}>
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="name" label="Tên thuốc" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="activeIngredient" label="Hoạt chất"><Input /></Form.Item>
                    <Space style={{ display: 'flex' }}>
                        <Form.Item name="unit" label="Đơn vị tính" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="price" label="Giá bán (VNĐ)" rules={[{ required: true }]}><InputNumber min={0} style={{ width: 150 }}/></Form.Item>
                        <Form.Item name="stockQuantity" label="Tồn kho" rules={[{ required: true }]}><InputNumber min={0} style={{ width: 120 }}/></Form.Item>
                    </Space>
                    <Form.Item><Button type="primary" htmlType="submit" block>Lưu Thuốc</Button></Form.Item>
                </Form>
            </Modal>
            
            <Modal title="Sửa Thuốc" open={isEditModalOpen} onCancel={() => setIsEditModalOpen(false)} footer={null}>
                <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item name="name" label="Tên thuốc" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="activeIngredient" label="Hoạt chất"><Input /></Form.Item>
                    <Space style={{ display: 'flex' }}>
                        <Form.Item name="unit" label="Đơn vị tính" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="price" label="Giá bán (VNĐ)" rules={[{ required: true }]}><InputNumber min={0} style={{ width: 150 }}/></Form.Item>
                        <Form.Item name="stockQuantity" label="Tồn kho" rules={[{ required: true }]}><InputNumber min={0} style={{ width: 120 }}/></Form.Item>
                    </Space>
                    <Form.Item><Button type="primary" htmlType="submit" block>Cập Nhật</Button></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
export default Medicines;