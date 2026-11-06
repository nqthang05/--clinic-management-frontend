import React, { useState, useEffect, useContext, useRef } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, TimePicker, Select, message, Tag, Space, Descriptions, Spin } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';
import dayjs from 'dayjs';

const Appointments = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
    const { user } = useContext(AuthContext);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // State lưu trạng thái hiện tại của lịch hẹn để kiểm tra logic chuyển đổi (State Machine)
    const [currentEditStatus, setCurrentEditStatus] = useState(null);

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    // States cho ô tìm kiếm động
    const [patientOptions, setPatientOptions] = useState([]);
    const [doctorOptions, setDoctorOptions] = useState([]);
    const [fetchingPatients, setFetchingPatients] = useState(false);
    const [fetchingDoctors, setFetchingDoctors] = useState(false);
    const debounceTimeout = useRef(null);

    const fetchData = async (page = 1, size = 5) => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/appointments/page?page=${page}&size=${size}`);
            setData(res.data);
            setPagination({ current: res.currentPage, pageSize: res.pageSize, total: res.totalElements });
        } catch (error) {
            message.error('Lỗi khi tải lịch hẹn');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const searchPatient = (keyword) => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        if (!keyword) { setPatientOptions([]); return; }
        debounceTimeout.current = setTimeout(async () => {
            setFetchingPatients(true);
            try {
                const res = await axiosClient.get(`/patients/search?keyword=${keyword}`);
                setPatientOptions(res.map(p => ({ value: p.id, label: `${p.fullName} - ${p.phone} (ID: ${p.id})` })));
            } catch (e) { console.error(e); }
            setFetchingPatients(false);
        }, 500);
    };

    const searchDoctor = (keyword) => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        if (!keyword) { setDoctorOptions([]); return; }
        debounceTimeout.current = setTimeout(async () => {
            setFetchingDoctors(true);
            try {
                const res = await axiosClient.get(`/doctors/search?keyword=${keyword}`);
                setDoctorOptions(res.map(d => ({ value: d.id, label: `BS. ${d.fullName} - ${d.specialty} (ID: ${d.id})` })));
            } catch (e) { console.error(e); }
            setFetchingDoctors(false);
        }, 500);
    };

    const handleCreate = async (values) => {
        try {
            const payload = {
                ...values,
                appointmentDate: values.appointmentDate.format('YYYY-MM-DD'),
                appointmentTime: values.appointmentTime.format('HH:mm:ss'),
            };
            await axiosClient.post('/appointments', payload);
            message.success('Đặt lịch thành công!');
            setIsCreateModalOpen(false);
            createForm.resetFields();
            fetchData();
        } catch (error) {
            message.error(error.message || 'Lỗi đặt lịch!');
        }
    };

    // Mở Modal Sửa trạng thái & thông tin lịch hẹn
    const openEditModal = (record) => {
        setSelectedAppointment(record);
        setCurrentEditStatus(record.status); // Lưu lại trạng thái gốc để check logic

        // Set sẵn dữ liệu vào ô tìm kiếm hiện tại để user dễ nhìn
        setPatientOptions([{ value: record.patientId, label: `${record.patientName} (ID: ${record.patientId})` }]);
        setDoctorOptions([{ value: record.doctorId, label: `${record.doctorName} (ID: ${record.doctorId})` }]);

        editForm.setFieldsValue({
            patientId: record.patientId,
            doctorId: record.doctorId,
            appointmentDate: dayjs(record.appointmentDate),
            appointmentTime: dayjs(record.appointmentTime, 'HH:mm:ss'),
            status: record.status,
            reason: record.reason
        });
        setIsEditModalOpen(true);
    };

    // Hàm kiểm tra tính hợp lệ của việc chuyển đổi trạng thái
    const isStatusDisabled = (targetStatus) => {
        // Trạng thái cuối (Đã khám xong hoặc Đã hủy) không cho phép sửa đổi
        if (currentEditStatus === 'CANCELLED' || currentEditStatus === 'COMPLETED') return true; 

        if (currentEditStatus === 'PENDING') {
            // PENDING -> Không thể nhảy cóc thẳng lên COMPLETED
            if (targetStatus === 'COMPLETED') return true;
        }

        if (currentEditStatus === 'CONFIRMED') {
            // CONFIRMED -> Không thể lùi ngược lại PENDING
            if (targetStatus === 'PENDING') return true;
        }

        return false;
    };

    const handleUpdate = async (values) => {
        try {
            const payload = {
                ...values,
                appointmentDate: values.appointmentDate.format('YYYY-MM-DD'),
                appointmentTime: values.appointmentTime.format('HH:mm:ss'),
            };
            await axiosClient.put(`/appointments/${selectedAppointment.id}`, payload);
            message.success('Cập nhật lịch hẹn thành công!');
            setIsEditModalOpen(false);
            fetchData(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error(error.message || 'Lỗi cập nhật lịch hẹn!');
        }
    };

    const openViewModal = (record) => {
        setSelectedAppointment(record);
        setIsViewModalOpen(true);
    };

    const columns = [
        { title: 'Mã Lịch', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Bệnh Nhân', dataIndex: 'patientName', key: 'patientName' },
        { title: 'Bác Sĩ', dataIndex: 'doctorName', key: 'doctorName' },
        { title: 'Ngày Khám', dataIndex: 'appointmentDate', key: 'appointmentDate' },
        { title: 'Giờ', dataIndex: 'appointmentTime', key: 'appointmentTime' },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => {
                let color = status === 'PENDING' ? 'blue' : status === 'CONFIRMED' ? 'orange' : status === 'COMPLETED' ? 'green' : 'red';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="text" style={{ color: '#1890ff' }} icon={<EyeOutlined />} onClick={() => openViewModal(record)}>Xem</Button>
                    <Button type="text" style={{ color: '#faad14' }} icon={<EditOutlined />} onClick={() => openEditModal(record)}>Đổi Trạng Thái / Sửa</Button>
                </Space>
            ),
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>Quản lý Lịch Hẹn</h2>
                {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_RECEPTIONIST') && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
                        Đặt Lịch Mới
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

            {/* Modal Đặt Lịch */}
            <Modal title="Đặt Lịch Khám" open={isCreateModalOpen} onCancel={() => setIsCreateModalOpen(false)} footer={null}>
                <Form form={createForm} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="patientId" label="Bệnh Nhân" rules={[{ required: true }]}>
                        <Select showSearch placeholder="Gõ tên/SĐT bệnh nhân..." filterOption={false} onSearch={searchPatient} notFoundContent={fetchingPatients ? <Spin size="small" /> : 'Không tìm thấy'} options={patientOptions} />
                    </Form.Item>
                    <Form.Item name="doctorId" label="Bác Sĩ" rules={[{ required: true }]}>
                        <Select showSearch placeholder="Gõ tên bác sĩ..." filterOption={false} onSearch={searchDoctor} notFoundContent={fetchingDoctors ? <Spin size="small" /> : 'Không tìm thấy'} options={doctorOptions} />
                    </Form.Item>
                    <Form.Item name="appointmentDate" label="Ngày Hẹn" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="appointmentTime" label="Giờ Hẹn" rules={[{ required: true }]}><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="reason" label="Lý do khám"><Input.TextArea rows={3} /></Form.Item>
                    <Form.Item><Button type="primary" htmlType="submit" block>Xác Nhận Đặt Lịch</Button></Form.Item>
                </Form>
            </Modal>

            {/* Modal Sửa Trạng Thái & Thông Tin Lịch Hẹn */}
            <Modal title="Cập Nhật Lịch Hẹn & Trạng Thái" open={isEditModalOpen} onCancel={() => setIsEditModalOpen(false)} footer={null}>
                <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item name="patientId" label="Bệnh Nhân" rules={[{ required: true }]}>
                        <Select showSearch filterOption={false} onSearch={searchPatient} options={patientOptions} />
                    </Form.Item>
                    <Form.Item name="doctorId" label="Bác Sĩ" rules={[{ required: true }]}>
                        <Select showSearch filterOption={false} onSearch={searchDoctor} options={doctorOptions} />
                    </Form.Item>
                    <Form.Item name="appointmentDate" label="Ngày Hẹn" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="appointmentTime" label="Giờ Hẹn" rules={[{ required: true }]}><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item>
                    
                    {/* Khóa Select nếu trạng thái hiện tại là CANCELLED hoặc COMPLETED */}
                    <Form.Item name="status" label="Trạng Thái Lịch Hẹn" rules={[{ required: true }]}>
                        <Select disabled={currentEditStatus === 'CANCELLED' || currentEditStatus === 'COMPLETED'}>
                            <Select.Option value="PENDING" disabled={isStatusDisabled('PENDING')}>PENDING (Chờ xác nhận)</Select.Option>
                            <Select.Option value="CONFIRMED" disabled={isStatusDisabled('CONFIRMED')}>CONFIRMED (Đã xác nhận)</Select.Option>
                            <Select.Option value="COMPLETED" disabled={isStatusDisabled('COMPLETED')}>COMPLETED (Đã khám xong)</Select.Option>
                            <Select.Option value="CANCELLED" disabled={isStatusDisabled('CANCELLED')}>CANCELLED (Đã hủy)</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="reason" label="Lý do khám"><Input.TextArea rows={3} /></Form.Item>
                    <Form.Item><Button type="primary" htmlType="submit" block disabled={currentEditStatus === 'CANCELLED' || currentEditStatus === 'COMPLETED'}>Lưu Trạng Thái</Button></Form.Item>
                </Form>
            </Modal>

            {/* Modal Xem Chi Tiết */}
            <Modal title="Chi Tiết Lịch Hẹn" open={isViewModalOpen} onCancel={() => setIsViewModalOpen(false)} footer={[ <Button key="close" onClick={() => setIsViewModalOpen(false)}>Đóng</Button> ]}>
                {selectedAppointment && (
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Mã Lịch">{selectedAppointment.id}</Descriptions.Item>
                        <Descriptions.Item label="Bệnh Nhân">{selectedAppointment.patientName}</Descriptions.Item>
                        <Descriptions.Item label="Bác Sĩ">{selectedAppointment.doctorName}</Descriptions.Item>
                        <Descriptions.Item label="Ngày Khám">{selectedAppointment.appointmentDate}</Descriptions.Item>
                        <Descriptions.Item label="Giờ Khám">{selectedAppointment.appointmentTime}</Descriptions.Item>
                        <Descriptions.Item label="Trạng Thái"><Tag color={selectedAppointment.status === 'PENDING' ? 'blue' : selectedAppointment.status === 'CONFIRMED' ? 'orange' : selectedAppointment.status === 'COMPLETED' ? 'green' : 'red'}>{selectedAppointment.status}</Tag></Descriptions.Item>
                        <Descriptions.Item label="Lý Do Khám">{selectedAppointment.reason || 'Không có'}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default Appointments;