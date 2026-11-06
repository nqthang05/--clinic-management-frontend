import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';

const MedicalRecords = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
    const { user } = useContext(AuthContext);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [appointments, setAppointments] = useState([]); // Chứa danh sách lịch hẹn để chọn
    const [form] = Form.useForm();

    const fetchData = async (page = 1, size = 5) => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/medical-records/page?page=${page}&size=${size}`);
            setData(res.data);
            setPagination({ current: res.currentPage, pageSize: res.pageSize, total: res.totalElements });
        } catch (error) { message.error('Lỗi tải bệnh án'); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    // Load danh sách Lịch Hẹn đổ vào Select Box khi mở Modal Tạo Bệnh Án
    const loadAppointments = async () => {
        try {
            const res = await axiosClient.get('/appointments/page?page=1&size=100');
            // Chỉ lấy các lịch hẹn chưa có bệnh án hoặc đang CONFIRMED
            setAppointments(res.data.map(app => ({
                value: app.id,
                label: `Lịch #${app.id} - ${app.patientName} (Ngày: ${app.appointmentDate})`
            })));
        } catch (error) {}
    };

    const handleCreate = async (values) => {
        try {
            await axiosClient.post('/medical-records', values);
            message.success('Lưu bệnh án thành công!');
            setIsCreateModalOpen(false);
            form.resetFields();
            fetchData();
        } catch (error) { message.error(error.message || 'Lỗi lưu bệnh án'); }
    };

    const columns = [
        { title: 'Mã BA', dataIndex: 'id', key: 'id' },
        { title: 'Mã Lịch Hẹn', dataIndex: 'appointmentId', key: 'appointmentId' },
        { title: 'Bệnh Nhân', dataIndex: 'patientName', key: 'patientName' },
        { title: 'Bác Sĩ', dataIndex: 'doctorName', key: 'doctorName' },
        { title: 'Chẩn Đoán', dataIndex: 'diagnosis', key: 'diagnosis' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="text" style={{ color: '#1890ff' }} icon={<EyeOutlined />} onClick={() => {
                        setSelectedRecord(record); setIsViewModalOpen(true);
                    }}>Xem</Button>
                </Space>
            ),
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>Quản lý Bệnh Án</h2>
                {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_DOCTOR') && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { loadAppointments(); setIsCreateModalOpen(true); }}>
                        Viết Bệnh Án
                    </Button>
                )}
            </div>
            <Table columns={columns} dataSource={data} rowKey="id" bordered pagination={pagination} loading={loading} onChange={(newPag) => fetchData(newPag.current, newPag.pageSize)} />
            
            <Modal title="Viết Bệnh Án Mới" open={isCreateModalOpen} onCancel={() => setIsCreateModalOpen(false)} footer={null}>
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="appointmentId" label="Chọn Lịch Hẹn" rules={[{ required: true }]}>
                        <Select showSearch placeholder="Tìm theo mã lịch hẹn" filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} options={appointments} />
                    </Form.Item>
                    <Form.Item name="diagnosis" label="Chẩn đoán bệnh" rules={[{ required: true }]}>
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="notes" label="Ghi chú thêm">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item><Button type="primary" htmlType="submit" block>Lưu Bệnh Án</Button></Form.Item>
                </Form>
            </Modal>

            <Modal title="Chi Tiết Bệnh Án" open={isViewModalOpen} onCancel={() => setIsViewModalOpen(false)} footer={null}>
                {selectedRecord && (
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Mã BA">{selectedRecord.id}</Descriptions.Item>
                        <Descriptions.Item label="Bệnh Nhân">{selectedRecord.patientName}</Descriptions.Item>
                        <Descriptions.Item label="Bác Sĩ Khám">{selectedRecord.doctorName}</Descriptions.Item>
                        <Descriptions.Item label="Chẩn Đoán">{selectedRecord.diagnosis}</Descriptions.Item>
                        <Descriptions.Item label="Ghi Chú">{selectedRecord.notes}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};
export default MedicalRecords;